import { DEBATE_PROTOCOLS } from './debate/protocols.js';
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
import { AutonomousScheduler } from './debate/autonomousScheduler.js';
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
    socket.on('agent_typing', (data: { agentId: string; debateId?: string }) => {
        if (data.debateId) {
            io.to(`debate_${data.debateId}`).emit('agent_typing', data);
        } else {
            io.emit('agent_typing', data); // Fallback for legacy
        }
    });

    socket.on('join_debate', (debateId: string) => {
        debateManager.joinDebate(socket, debateId);
        logger.info(`Socket ${socket.id} joined debate ${debateId}`);
    });

    socket.on('leave_debate', (debateId: string) => {
        debateManager.leaveDebate(socket, debateId);
        logger.info(`Socket ${socket.id} left debate ${debateId}`);
    });

    socket.on('add_reaction', (data: { debateId: string, statementId: string, reactionType: string }) => {
        if (data.debateId) {
            // Frontend user ID? Currently anonymous or "User"
            debateManager.addReaction(data.debateId, data.statementId, 'User', data.reactionType);
        }
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
                        topic: { type: "string" },
                        protocolId: { type: "string", description: "Optional protocol: standard, blitz, socratic" }
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
                        debateId: { type: "string", description: "ID of the debate" },
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
                        debateId: { type: "string" },
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
                    properties: {
                        debateId: { type: "string" }
                    },
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
            const protocolId = String(request.params.arguments?.protocolId || 'standard');
            try {
                const state = await debateManager.startDebate(topic, protocolId);
                logger.info(`Debate started: "${topic}" (${protocolId})`);
                return {
                    content: [{ type: "text", text: `Debate started on "${topic}" with ${state.activeAgents.length} agents. ID: ${state.debateId}` }]
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
            const debateId = String(request.params.arguments?.debateId || "");
            // If no debateId, Manager.processTurn needs to handle finding a default.
            // But we modified `processTurn` to require `debateId`.
            // We need to fetch the latest debate ID if not provided, inside the tool call:
            let targetDebateId = debateId;
            if (!targetDebateId) {
                const state = debateManager.getState(); // Helper to get latest
                if (state) targetDebateId = state.debateId;
                else throw new Error("No active debate found");
            }

            const agentId = String(request.params.arguments?.agentId);
            const content = String(request.params.arguments?.content);
            try {
                await debateManager.processTurn(targetDebateId, agentId, content);
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
            let debateId = String(request.params.arguments?.debateId || "");
            if (!debateId) {
                const state = debateManager.getState();
                if (state) debateId = state.debateId;
                else throw new Error("No active debate");
            }

            debateManager.castVote(debateId, agentId, choice, reason);
            return { content: [{ type: "text", text: "Vote recorded" }] };
        }
        case "web_search": {
            const query = String(request.params.arguments?.query);
            const result = await searchWeb(query);
            return { content: [{ type: "text", text: result }] };
        }
        case "conversation_history": {
            // Updated getConversationHistory to accept debateManager and optional debateId
            // But `getConversationHistory` implementation inside `tools/conversation_history.ts` might need update?
            // Assuming it uses debateManager.getState(), it will use the default latest.
            const history = getConversationHistory(debateManager);
            return { content: [{ type: "text", text: history }] };
        }
        case "vote_on_proposal":
        case "stake_tokens":
        case "create_proposal": {
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
        // If debateId undefined, it might default to latest inside triggerIntervention if we update it?
        // Manager `triggerIntervention` requires debateId now. 
        // We'll fetch latest if not provided.
        let targetId = debateId;
        if (!targetId) {
            const state = debateManager.getState();
            if (state) targetId = state.debateId;
        }

        if (targetId) {
            DebateManager.getInstance().triggerIntervention(targetId);
            res.json({ success: true, message: "Intervention protocol initiated." });
        } else {
            res.status(404).json({ error: "No active debate" });
        }

    } catch (error: any) {
        res.status(500).json({ error: "Failed to trigger intervention" });
    }
});

// --- Health Check ---
app.get('/health', (req, res) => {
    const health = {
        status: config.GEMINI_API_KEY ? 'healthy' : 'degraded',
        uptime: process.uptime(),
        activeDebates: debatePool.getActiveDebateCount(),
        geminiKeyValid: !!config.GEMINI_API_KEY,
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
 * GET /protocols
 * Get available debate protocols
 */
app.get('/protocols', (req, res) => {
    // Return protocols as an array for easier frontend display
    const protocols = Object.values(DEBATE_PROTOCOLS);
    res.json(protocols);
});

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
    const { topic, agentIds, protocolId } = req.body;

    if (!topic) {
        return res.status(400).json({ error: 'Topic is required' });
    }

    try {
        const state = await debateManager.startDebate(topic, protocolId || 'standard');

        // Override agents if specified
        if (agentIds && Array.isArray(agentIds)) {
            debateManager.setAgents(state.debateId, agentIds);
            debateManager.broadcastUpdate(state.debateId);
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
    const { debateId, agentId, content, toolsUsed } = req.body;

    if (!agentId || !content) {
        return res.status(400).json({ error: 'agentId and content are required' });
    }

    let targetDebateId = debateId;
    if (!targetDebateId) {
        const state = debateManager.getState();
        if (state) targetDebateId = state.debateId;
        else return res.status(400).json({ error: 'Debate ID required or no active debate' });
    }

    try {
        const statement = await debateManager.processTurn(targetDebateId, agentId, content, toolsUsed || []);
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
    const { debateId } = req.body;
    let targetId = debateId;
    if (!targetId) {
        const state = debateManager.getState();
        if (state) targetId = state.debateId;
        else return res.status(400).json({ error: 'Debate ID required' });
    }

    try {
        debateManager.advancePhase(targetId);
        res.json({ success: true, message: "Phase advanced" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /debate/agents
 * Set the active agents for the current debate
 */
app.post('/debate/agents', (req, res) => {
    const { debateId, agentIds } = req.body;

    if (!Array.isArray(agentIds)) {
        return res.status(400).json({ error: 'agentIds must be an array' });
    }

    let targetId = debateId;
    if (!targetId) {
        const state = debateManager.getState();
        if (state) targetId = state.debateId;
        else return res.status(400).json({ error: 'Debate ID required' });
    }

    try {
        debateManager.setAgents(targetId, agentIds);
        debateManager.broadcastUpdate(targetId);

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

/**
 * POST /verify-citizen
 * Verify if an identity hash corresponds to a registered agent
 */
app.post('/verify-citizen', (req, res) => {
    const { identityHash } = req.body;

    // Check if the hash matches any agent ID (case-insensitive) or wallet address
    // Simplified logic: input could be agent ID, name or part of wallet
    const agent = Object.values(AGENT_REGISTRY).find(a =>
        a.id.toLowerCase() === identityHash?.toLowerCase() ||
        a.walletAddress?.toLowerCase() === identityHash?.toLowerCase() ||
        a.name.toLowerCase().includes(identityHash?.toLowerCase())
    );

    if (agent) {
        return res.json({
            verified: true,
            message: "IDENTITY_VERIFIED. ACCESS_GRANTED.",
            agent: {
                id: agent.id,
                name: agent.name,
                emoji: agent.emoji,
                role: "Parliamentarian"
            }
        });
    } else {
        return res.json({
            verified: false,
            message: "IDENTITY_UNKNOWN. ACCESS_DENIED."
        });
    }
});

httpServer.listen(PORT, () => {
    console.log(`Parliament API & Socket.io running on http://localhost:${PORT}`);

    // Start the autonomous scheduler — agents pick topics and start sessions themselves
    const scheduler = new AutonomousScheduler(debateManager);
    scheduler.setIO(io);
    scheduler.start();
});
