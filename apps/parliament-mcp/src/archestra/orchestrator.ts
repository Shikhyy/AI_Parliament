/**
 * Archestra Agent Orchestrator
 * 
 * Coordinates autonomous agent invocation and conversation flow.
 * Agents use Claude Sonnet 4.5 for natural reasoning and response generation.
 */

import Anthropic from '@anthropic-ai/sdk';
import { AGENT_REGISTRY, AgentProfile } from '../agents/registry.js';
import { DebateState, Statement } from '../debate/types.js';
import { logger } from '../utils/logger.js';
import { cache } from '../services/cache.js';
import { getConfig } from '../config/env.js';
import { getMCPClient } from './mcp-client.js';

export interface TurnBid {
    agentId: string;
    urgency: number; // 0-10
    topicRelevance: number; // 0-10
    reasoning: string;
}

export interface AgentResponse {
    statement: string;
    agentId: string;
    toolsUsed: string[];
    citations: string[];
    confidence: number;
}

export interface AgentInvocationContext {
    debateState: DebateState;
    topic: string;
    recentStatements: Statement[];
    debateHistory: string;
    agentExpertise: string[];
    memoryContext?: string; // New: Access to long-term memory
}

export class ArchestraOrchestrator {
    private client: Anthropic | null = null;
    private agentRegistry: Record<string, AgentProfile>;
    private turnHistories: Map<string, string[]> = new Map(); // Track per-agent conversation history
    private retryAttempts: number = 3;
    private retryDelay: number = 1000; // 1 second base delay

    constructor() {
        const config = getConfig();
        if (config.ANTHROPIC_API_KEY) {
            this.client = new Anthropic({
                apiKey: config.ANTHROPIC_API_KEY,
            });
            logger.info('Anthropic client initialized');
        } else {
            logger.warn('Anthropic API key not found - agent intelligence disabled');
        }
        this.agentRegistry = AGENT_REGISTRY;
    }

    /**
     * Invoke an agent to generate a response given the current debate context
     */
    async invokeAgent(
        agentId: string,
        context: AgentInvocationContext,
        systemInstructions: string = ""
    ): Promise<AgentResponse> {
        const agent = this.agentRegistry[agentId];
        if (!agent) {
            throw new Error(`Agent ${agentId} not found in registry`);
        }

        // Check cache first
        const cacheKey = `agent:${agentId}:${context.debateState.debateId}:${context.debateState.turnCount}`;
        const cached = cache.get<AgentResponse>(cacheKey);
        if (cached) {
            logger.debug(`Cache hit for agent ${agentId}`);
            return cached;
        }

        // 1. Try Archestra MCP first
        try {
            const mcpClient = getMCPClient();
            if (!mcpClient.connected) {
                // Connection check with short timeout
                try {
                    await mcpClient.connect();
                } catch (e) {
                    logger.debug("MCP connect check failed");
                }
            }

            if (mcpClient.connected) {
                const tools = mcpClient.getTools();
                let targetTool = tools.find(t => t.name.toLowerCase().includes(agent.name.toLowerCase()) || t.name === agentId);

                if (targetTool) {
                    logger.info(`Delegating to Archestra Agent: ${targetTool.name}`);
                    const response = await mcpClient.callTool(targetTool.name, {
                        prompt: this._buildSystemPrompt(agent, context, systemInstructions),
                        messages: this._buildMessages(agentId, context)
                    });

                    const statement = typeof response === 'string' ? response :
                        (response.content && response.content[0]?.text) ? response.content[0].text :
                            JSON.stringify(response);

                    return {
                        statement,
                        agentId,
                        toolsUsed: ['archestra', targetTool.name],
                        citations: [],
                        confidence: 0.9,
                    };
                }
            }
        } catch (err) {
            logger.warn(`Archestra MCP delegation failed for ${agentId}, falling back to local LLM.`);
        }

        // 2. Try Local Anthropic Client
        if (this.client) {
            try {
                return await this._generateLLMResponse(agentId, agent, context, systemInstructions);
            } catch (err: any) {
                logger.error(`Local Anthropic generation failed: ${err.message}`);
                // Continue to fallback
            }
        } else {
            logger.warn(`No Anthropic client available for agent ${agentId}`);
        }

        // 3. Last Resort: Static Fallback
        logger.warn(`Using static fallback for agent ${agentId}`);
        return this._generateFallbackResponse(agentId, agent, context);
    }

    private async _generateLLMResponse(
        agentId: string,
        agent: AgentProfile,
        context: AgentInvocationContext,
        systemInstructions: string
    ): Promise<AgentResponse> {
        const systemPrompt = this._buildSystemPrompt(agent, context, systemInstructions);
        const messages = this._buildMessages(agentId, context);

        let lastError: Error | null = null;
        for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
            try {
                logger.debug(`Invoking agent ${agentId} via Anthropic (attempt ${attempt + 1})`);

                const response = await this.client!.messages.create({
                    model: 'claude-3-5-sonnet-20241022',
                    max_tokens: 1024,
                    system: systemPrompt,
                    messages: messages,
                });

                const statement = response.content[0].type === 'text' ? response.content[0].text : '';
                const toolsUsed: string[] = [];
                const citations = this._extractCitations(statement);

                // Store in turn history
                if (!this.turnHistories.has(agentId)) {
                    this.turnHistories.set(agentId, []);
                }
                this.turnHistories.get(agentId)!.push(statement);

                const result = {
                    statement,
                    agentId,
                    toolsUsed,
                    citations,
                    confidence: 0.8,
                };

                // Cache the result
                const cacheKey = `agent:${agentId}:${context.debateState.debateId}:${context.debateState.turnCount}`;
                cache.set(cacheKey, result, 60);

                return result;

            } catch (error: any) {
                lastError = error;
                logger.warn(`Agent ${agentId} invoke error: ${error.message}`);

                if (error.status === 429 || error.status >= 500) {
                    const delay = this.retryDelay * Math.pow(2, attempt);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }
                break;
            }
        }
        throw lastError || new Error("Failed to generate LLM response after retries");
    }

    // Kept for backward compatibility if needed, but logic moved to _generateLLMResponse usually
    // This is just to satisfy the previous structure if anything was hanging
    private _unused_placeholder() { }

    /**
     * Generate a fallback response when API is unavailable
     */
    private _generateFallbackResponse(
        agentId: string,
        agent: AgentProfile,
        context: AgentInvocationContext
    ): AgentResponse {
        const fallbackStatements = [
            `As ${agent.name}, I believe we should carefully consider the implications of ${context.topic}.`,
            `From my perspective as ${agent.name}, the evidence suggests we need more discussion on this matter.`,
            `I think it's important that we examine ${context.topic} from multiple angles before reaching a conclusion.`,
        ];

        const statement = fallbackStatements[Math.floor(Math.random() * fallbackStatements.length)];

        return {
            statement,
            agentId,
            toolsUsed: [],
            citations: [],
            confidence: 0.3, // Low confidence for fallback
        };
    }

    /**
     * Bid for the next turn based on urgency and relevance
     */
    async bidForTurn(agentId: string, context: AgentInvocationContext): Promise<TurnBid> {
        const agent = this.agentRegistry[agentId];
        if (!agent) {
            throw new Error(`Agent ${agentId} not found`);
        }

        // Check cache
        const cacheKey = `bid:${agentId}:${context.debateState.turnCount}`;
        const cached = cache.get<TurnBid>(cacheKey);
        if (cached) {
            return cached;
        }

        // If no client, use heuristic bidding
        if (!this.client) {
            return this._generateHeuristicBid(agentId, agent, context);
        }

        const bidPrompt = `You are ${agent.name} in a parliamentary debate on: "${context.topic}"

Current phase: ${context.debateState.currentPhase}
Recent statements show:
${context.recentStatements.slice(-3).map(s => `- "${s.content.slice(0, 100)}..."`).join('\n')}

Based on your expertise (${agent.expertise.join(', ')}), how urgent and relevant is it for you to speak now?
- Urgency: How important is it that you speak immediately? (0-10)
- Relevance: How directly does this debate topic relate to your expertise? (0-10)
- Reasoning: Brief explanation of why you want/don't want to speak now

Respond in JSON format:
{"urgency": <number>, "relevance": <number>, "reasoning": "<string>"}`;

        try {
            const response = await this.client.messages.create({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 200,
                messages: [
                    {
                        role: 'user',
                        content: bidPrompt,
                    }
                ],
            });

            const responseText = response.content[0].type === 'text' ? response.content[0].text : '{}';
            const parsed = JSON.parse(responseText);

            const bid = {
                agentId,
                urgency: Math.min(10, parsed.urgency || 0),
                topicRelevance: Math.min(10, parsed.relevance || 0),
                reasoning: parsed.reasoning || '',
            };

            cache.set(cacheKey, bid, 15); // Cache for 15 seconds
            return bid;
        } catch (error: any) {
            logger.error(`Error bidding for turn (${agentId}): ${error.message}`);
            return this._generateHeuristicBid(agentId, agent, context);
        }
    }

    /**
     * Generate heuristic bid when API unavailable
     */
    private _generateHeuristicBid(
        agentId: string,
        agent: AgentProfile,
        context: AgentInvocationContext
    ): TurnBid {
        // Simple keyword matching for relevance
        let relevance = 3;
        const topicLower = context.topic.toLowerCase();
        agent.keywords.forEach(kw => {
            if (topicLower.includes(kw.toLowerCase())) {
                relevance += 2;
            }
        });

        // Urgency based on how long since last spoke
        const lastTurns = this.turnHistories.get(agentId) || [];
        const urgency = Math.min(10, 5 + (10 - lastTurns.length));

        return {
            agentId,
            urgency: Math.min(10, urgency),
            topicRelevance: Math.min(10, relevance),
            reasoning: 'Heuristic bid (API unavailable)',
        };
    }

    /**
     * Poll all active agents for turn bids
     */
    async pollAgentBids(
        activeAgentIds: string[],
        context: AgentInvocationContext
    ): Promise<TurnBid[]> {
        const bidPromises = activeAgentIds.map(id => this.bidForTurn(id, context));
        const bids = await Promise.all(bidPromises);
        return bids.sort((a, b) => {
            const scoreA = a.urgency * a.topicRelevance;
            const scoreB = b.urgency * b.topicRelevance;
            return scoreB - scoreA; // Highest score first
        });
    }

    /**
     * Select the next speaker based on bids and cooldown logic
     */
    allocateNextTurn(
        bids: TurnBid[],
        previousSpeaker: string | null,
        turnsSinceLastSpeaker: Map<string, number> = new Map()
    ): string | null {
        if (bids.length === 0) return null;

        // Apply cooldown: prevent same agent from speaking twice in a row
        let validBids = bids;
        if (previousSpeaker) {
            validBids = bids.filter(b => b.agentId !== previousSpeaker);
        }

        if (validBids.length === 0) {
            // Everyone is on cooldown, pick the next highest bidder anyway
            return bids[0].agentId;
        }

        // Pick highest bidder
        return validBids[0].agentId;
    }

    /**
     * Build full system prompt for agent
     */
    private _buildSystemPrompt(
        agent: AgentProfile,
        context: AgentInvocationContext,
        instructions: string
    ): string {
        let phaseInstructions = "";

        switch (context.debateState.currentPhase) {
            case "initialization":
            case "initial_positions":
                phaseInstructions = `
PHASE: OPENING ARGUMENTS
- State your core axioms clearly based on your philosophy.
- Do not reference other agents' specific points yet.
- Establish the foundational logic for your stance on ${context.topic}.
- Be bold and declarative.`;
                break;
            case "socratic_questioning":
            case "evidence_presentation":
            case "argument_refinement":
            case "coalition_building":
                phaseInstructions = `
PHASE: INTERACTIVE DEBATE
- Directly quote and challenge the logic of previous speakers.
- Point out contradictions in opposing arguments.
- If you agree with someone, explictly support their point to build a coalition.
- Use evidence or logical proofs to back your rebuttals.
- Keep the debate lively and confrontational but respectful.`;
                break;
            case "synthesis":
                phaseInstructions = `
PHASE: CONSENSUS BUILDING
- Identify shared values or common ground with other agents.
- Propose a unified protocol or compromise.
- Synthesize the strongest arguments from both sides.
- Move towards a resolution.`;
                break;
            case "completed":
                phaseInstructions = `
PHASE: CLOSING STATEMENTS
- Summarize the final agreement or your final dissent.
- Do not introduce new arguments.
- State your final vote justification clearly.`;
                break;
            default:
                phaseInstructions = `Current Phase: ${context.debateState.currentPhase}. Proceed with the discussion.`;
        }

        const memoryBlock = context.memoryContext
            ? `
YOUR MEMEORY / CONTEXT:
The following are key points and summaries from your past contributions and observations:
${context.memoryContext}
`
            : "";

        return `${agent.systemPrompt}

---

DEBATE CONTEXT:
Topic: ${context.topic}
Turn Count: ${context.debateState.turnCount}
Active Agents: ${context.debateState.activeAgents.join(', ')}

${memoryBlock}

${phaseInstructions}

${instructions}

INSTRUCTIONS:
1. Keep your response to 200-400 words
2. Stay focused on the debate topic
3. Reference evidence when possible
4. Be respectful of other agents' positions while critiquing ideas
5. Use your characteristic voice and reasoning style`;
    }

    /**
     * Build message array for this agent's conversation
     */
    private _buildMessages(agentId: string, context: AgentInvocationContext): Anthropic.MessageParam[] {
        const messages: Anthropic.MessageParam[] = [];

        // Include recent debate statements as context
        for (const stmt of context.recentStatements.slice(-5)) {
            const agent = this.agentRegistry[stmt.agentId];
            const senderName = agent ? agent.name : stmt.agentId;
            messages.push({
                role: 'user',
                content: `(${senderName}) "${stmt.content}"`,
            });
        }

        // Add prompt for this agent to respond
        messages.push({
            role: 'user',
            content: `Your turn to speak. Address the debate topic and respond to the recent statements above.`,
        });

        return messages;
    }

    /**
     * Extract citations/evidence references from statement
     */
    private _extractCitations(statement: string): string[] {
        const citations: string[] = [];
        const patterns = [
            /According to (\w+)/gi,
            /Studies? show/gi,
            /Research indicates/gi,
            /Evidence suggests/gi,
        ];

        patterns.forEach(pattern => {
            const matches = statement.match(pattern);
            if (matches) {
                citations.push(...matches);
            }
        });

        return citations.slice(0, 5); // Limit to 5 citations
    }

    /**
     * Clear turn history (useful for new debate)
     */
    resetTurnHistory(): void {
        this.turnHistories.clear();
    }

    /**
     * Get agent turn history
     */
    getTurnHistory(agentId: string): string[] {
        return this.turnHistories.get(agentId) || [];
    }
}

// Singleton instance
let instance: ArchestraOrchestrator;

export function getArchestraOrchestrator(): ArchestraOrchestrator {
    if (!instance) {
        instance = new ArchestraOrchestrator();
    }
    return instance;
}
