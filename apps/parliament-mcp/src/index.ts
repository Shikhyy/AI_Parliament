import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import { Server as McpServer } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    ListToolsRequestSchema,
    CallToolRequestSchema,
    ErrorCode,
    McpError
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { DebateManager } from './debate/manager.js';
import { AGENT_REGISTRY } from './agents/registry.js';
import { searchWeb } from './tools/web_search.js';
import {
    voteOnProposalTool,
    stakeTokensTool,
    createProposalTool,
    handleGovernanceTools
} from './tools/governance_tools.js';

// ... (existing imports)
import { getConversationHistory } from './tools/conversation_history.js';
import { validateEnv, getConfig } from './config/env.js';
import { logger } from './utils/logger.js';
import { DebatePool } from './services/debatePool.js';
import { cache } from './services/cache.js';
import { BlockchainService } from './services/blockchain.js';

// Validate environment on startup
validateEnv();
const config = getConfig();

const app = express();
const PORT = Number(config.PORT);

app.use(cors());
app.use(express.json());

// Rate limiting
const rateLimits = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = parseInt(config.RATE_LIMIT_WINDOW_MS);
const RATE_LIMIT_MAX = parseInt(config.RATE_LIMIT_MAX_REQUESTS);

app.use((req, res, next) => {
    const ip = req.ip || 'unknown';
    const now = Date.now();

    let record = rateLimits.get(ip);
    if (!record || now > record.resetAt) {
        record = { count: 0, resetAt: now + RATE_LIMIT_WINDOW };
        rateLimits.set(ip, record);
    }

    record.count++;

    if (record.count > RATE_LIMIT_MAX) {
        return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }

    next();
});

// --- Socket.io Setup ---
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
    cors: {
        origin: "*", // Adjust as needed for production
        methods: ["GET", "POST"]
    }
});

const debateManager = DebateManager.getInstance();
const debatePool = new DebatePool();
const blockchainService = new BlockchainService();
debateManager.setIO(io);

io.on('connection', (socket) => {
    logger.info(`Frontend connected: ${socket.id}`);

    // Send initial state on connection
    const state = debateManager.getState();
    if (state) {
        socket.emit('state_sync', state);
    }

    // Handle typing indicators
    socket.on('agent_typing', (data: { agentId: string }) => {
        io.emit('agent_typing', data);
    });

    socket.on('disconnect', () => {
        logger.info(`Frontend disconnected: ${socket.id}`);
    });
});

// --- MCP Setup ---
const server = new McpServer(
    {
        name: "ai-parliament",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

// Define Tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "start_debate",
                description: "Start a new debate with a given topic",
                inputSchema: {
                    type: "object",
                    properties: {
                        topic: { type: "string" }
                    },
                    required: ["topic"]
                }
            },
            {
                name: "get_available_agents",
                description: "Get a list of all available agents",
                inputSchema: {
                    type: "object",
                    properties: {},
                }
            },
            {
                name: "submit_statement",
                description: "Submit a statement to the debate",
                inputSchema: {
                    type: "object",
                    properties: {
                        agentId: { type: "string" },
                        content: { type: "string" }
                    },
                    required: ["agentId", "content"]
                }
            },
            {
                name: "cast_vote",
                description: "Cast a vote on the current debate phase (internal debate mechanism, not blockchain)",
                inputSchema: {
                    type: "object",
                    properties: {
                        agentId: { type: "string" },
                        choice: { type: "string" },
                        reason: { type: "string" }
                    },
                    required: ["agentId", "choice", "reason"]
                }
            },
            {
                name: "web_search",
                description: "Search the web for information",
                inputSchema: {
                    type: "object",
                    properties: {
                        query: { type: "string" }
                    },
                    required: ["query"]
                }
            },
            {
                name: "conversation_history",
                description: "Get the conversation history of the current debate",
                inputSchema: {
                    type: "object",
                    properties: {},
                }
            },
            // Governance Tools (Blockchain)
            {
                ...voteOnProposalTool,
                inputSchema: {
                    ...voteOnProposalTool.inputSchema,
                    properties: {
                        ...(voteOnProposalTool.inputSchema.properties || {}),
                        agentId: { type: "string", description: "The ID of the agent voting" }
                    },
                    required: [...(voteOnProposalTool.inputSchema.required as string[] || []), "agentId"]
                }
            },
            {
                ...stakeTokensTool,
                inputSchema: {
                    ...stakeTokensTool.inputSchema,
                    properties: {
                        ...(stakeTokensTool.inputSchema.properties || {}),
                        agentId: { type: "string", description: "The ID of the agent staking" }
                    },
                    required: [...(stakeTokensTool.inputSchema.required as string[] || []), "agentId"]
                }
            },
            {
                ...createProposalTool,
                inputSchema: {
                    ...createProposalTool.inputSchema,
                    properties: {
                        ...(createProposalTool.inputSchema.properties || {}),
                        agentId: { type: "string", description: "The ID of the agent creating the proposal" }
                    },
                    required: [...(createProposalTool.inputSchema.required as string[] || []), "agentId"]
                }
            }
        ]
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    switch (request.params.name) {
        case "start_debate": {
            const topic = String(request.params.arguments?.topic);
            try {
                const state = await debateManager.startDebate(topic);
                logger.info(`Debate started: "${topic}"`);
                return {
                    content: [{ type: "text", text: `Debate started on "${topic}" with ${state.activeAgents.length} agents.` }]
                };
            } catch (e: any) {
                logger.error(`Failed to start debate: ${e.message}`);
                return {
                    content: [{ type: "text", text: `Error: ${e.message}` }],
                    isError: true
                };
            }
        }
        case "get_available_agents": {
            const agents = Object.values(AGENT_REGISTRY).map(a => `${a.name} (${a.id})`).join(', ');
            return {
                content: [{ type: "text", text: agents }]
            };
        }
        case "submit_statement": {
            const agentId = String(request.params.arguments?.agentId);
            const content = String(request.params.arguments?.content);
            try {
                debateManager.processTurn(agentId, content);
                return { content: [{ type: "text", text: "Statement recorded" }] };
            } catch (e: any) {
                return {
                    content: [{ type: "text", text: `Error: ${e.message}` }],
                    isError: true
                };
            }
        }
        case "cast_vote": {
            const agentId = String(request.params.arguments?.agentId);
            const choice = String(request.params.arguments?.choice);
            const reason = String(request.params.arguments?.reason);
            debateManager.castVote(agentId, choice, reason);
            return { content: [{ type: "text", text: "Vote recorded" }] };
        }
        case "web_search": {
            const query = String(request.params.arguments?.query);
            const result = await searchWeb(query);
            return { content: [{ type: "text", text: result }] };
        }
        case "conversation_history": {
            const history = getConversationHistory(debateManager);
            return { content: [{ type: "text", text: history }] };
        }
        case "vote_on_proposal":
        case "stake_tokens":
        case "create_proposal": {
            const agentId = String(request.params.arguments?.agentId || "unknown"); // In a real MCP, identity might come from context
            // checking if agentId is passed as arg, or if we need to infer it. 
            // For now assuming the prompt injection handles passing "agentId" or we use a default if running as specific agent. 
            // Actually, the schema for these tools didn't explicitly ask for agentId in the inputSchema I defined earlier? 
            // Wait, I need to check my governance_tools.ts definition. 
            // I defined them WITHOUT agentId in inputSchema (assuming the caller context has it, or the model infers it).
            // But here I need to pass it to handleGovernanceTools.
            // Let's assume the model will pass it if I add it to schema, OR I extract it from some context?
            // "parliament-mcp" seems to rely on the model outputting arguments.
            // If the model is an agent, it should know its own ID. 
            // Let's UPDATED the schema in the ListTools response to INCLUDE agentId to be safe, 
            // OR we assume the "system" knows which agent is calling. 
            // Given the current architecture, tools like "submit_statement" take "agentId". 
            // So I should UPDATE the schemas below to include agentId.
            return handleGovernanceTools(request.params.name, request.params.arguments, String(request.params.arguments?.agentId));
        }
        default:
            throw new McpError(ErrorCode.MethodNotFound, "Unknown tool");
    }
});

// Start MCP
async function startMcp() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.log("Parliament MCP Server running on Stdio");
}

startMcp().catch(console.error);

// Start Express for REST API
// --- Admin Routes ---

app.post('/admin/intervene', (req, res) => {
    const { debateId } = req.body;
    // In a real app, verify admin signature/token here

    try {
        DebateManager.getInstance().triggerIntervention();
        res.json({ success: true, message: "Intervention protocol initiated." });
    } catch (error: any) {
        res.status(500).json({ error: "Failed to trigger intervention" });
    }
});

// --- Health Check ---
app.get('/health', (req, res) => {
    const health = {
        status: config.ANTHROPIC_API_KEY ? 'healthy' : 'degraded',
        uptime: process.uptime(),
        activeDebates: debatePool.getActiveDebateCount(),
        anthropicKeyValid: !!config.ANTHROPIC_API_KEY,
        dbConnected: true, // TODO: actual DB check
        timestamp: Date.now(),
        cacheStats: cache.getStats(),
    };
    res.json(health);
});

app.get('/stats', (req, res) => {
    res.json({
        debates: debatePool.getStats(),
        cache: cache.getStats(),
        uptime: process.uptime(),
    });
});

// === NEW REST ENDPOINTS FOR FRONTEND ===

/**
 * GET /debate/state
 * Returns current debate state (alternative to WebSocket)
 */
app.get('/debate/state', (req, res) => {
    const state = debateManager.getState();
    if (!state) {
        return res.status(404).json({ error: 'No active debate' });
    }
    res.json(state);
});

/**
 * GET /debates
 * List all active debates
 */
app.get('/debates', (req, res) => {
    const pool = DebatePool.getInstance();
    res.json(pool.getStats().debates);
});

/**
 * GET /debate/:id
 * Get state of a specific debate
 */
app.get('/debate/:id', (req, res) => {
    const pool = DebatePool.getInstance();
    const instance = pool.getDebate(req.params.id);
    if (!instance) {
        return res.status(404).json({ error: 'Debate not found' });
    }
    res.json(instance.engine.getState());
});

/**
 * POST /debate/start
 * Start a new debate with a given topic
 */
app.post('/debate/start', async (req, res) => {
    const { topic, agentIds } = req.body;

    if (!topic) {
        return res.status(400).json({ error: 'Topic is required' });
    }

    try {
        const state = await debateManager.startDebate(topic);

        // Override agents if specified
        if (agentIds && Array.isArray(agentIds)) {
            const engine = debateManager.getState();
            if (engine) {
                debateManager.setAgents(agentIds);
                debateManager.broadcastUpdate();
            }
        }

        res.json({ success: true, state });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /debate/statement
 * Submit a statement to the current debate (from frontend or agents)
 */
app.post('/debate/statement', async (req, res) => {
    const { agentId, content, toolsUsed } = req.body;

    if (!agentId || !content) {
        return res.status(400).json({ error: 'agentId and content are required' });
    }

    try {
        const statement = await debateManager.processTurn(agentId, content, toolsUsed || []);
        res.json({ success: true, statement });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /debate/advance-phase
 * Manually advance the debate phase (moderator action)
 */
app.post('/debate/advance-phase', (req, res) => {
    try {
        const state = debateManager.getState();
        if (!state) {
            return res.status(404).json({ error: 'No active debate' });
        }

        debateManager.advancePhase();
        debateManager.broadcastUpdate();

        res.json({ success: true, newPhase: debateManager.getState()?.currentPhase });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /debate/agents
 * Set the active agents for the current debate
 */
app.post('/debate/agents', (req, res) => {
    const { agentIds } = req.body;

    if (!Array.isArray(agentIds)) {
        return res.status(400).json({ error: 'agentIds must be an array' });
    }

    try {
        debateManager.setAgents(agentIds);
        debateManager.broadcastUpdate();

        res.json({ success: true, agents: agentIds });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /agents
 * Get list of all available agents
 */
app.get('/agents', (req, res) => {
    const agents = Object.values(AGENT_REGISTRY).map(a => ({
        id: a.id,
        name: a.name,
        emoji: a.emoji,
        expertise: a.expertise,
        keywords: a.keywords
    }));
    res.json(agents);
});

/**
 * POST /api/faucet
 * Dispense 100 PARL tokens to a user wallet
 */
app.post('/api/faucet', async (req, res) => {
    try {
        const { address } = req.body;
        if (!address) {
            return res.status(400).json({ error: 'Address is required' });
        }

        logger.info(`Faucet request for ${address}`);
        const txHash = await blockchainService.faucet(address);

        return res.json({
            success: true,
            txHash,
            message: "100 PARL tokens sent to your wallet."
        });
    } catch (error: any) {
        logger.error(`Faucet error: ${error.message}`);
        return res.status(500).json({
            error: error.message || 'Internal Server Error'
        });
    }
});

httpServer.listen(PORT, () => {
    console.log(`Parliament API & Socket.io running on http://localhost:${PORT}`);

    // Start a default debate for testing
    debateManager.startDebate("Should AI have rights?");
});
