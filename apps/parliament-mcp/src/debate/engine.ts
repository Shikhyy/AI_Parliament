import { AGENT_REGISTRY, AgentProfile } from '../agents/registry.js';
import { DebateState, Phase, Statement, Coalition, Vote } from './types.js';
import { v4 as uuidv4 } from 'uuid';
import { IdeaExtractor, ConsensusTracker } from './analytics.js';
import { ArchestraOrchestrator, AgentInvocationContext } from '../archestra/orchestrator.js';
import { MemoryManager } from '../services/agentMemory.js';
import { QualityAnalyzer, QualityMetrics } from '../services/qualityMetrics.js';
import { logger } from '../utils/logger.js';
import { Server } from 'socket.io';

export class DebateEngine {
    private state: DebateState;
    private ideaExtractor: IdeaExtractor;
    private consensusTracker: ConsensusTracker;
    private archestra: ArchestraOrchestrator;
    private memoryManager: MemoryManager;
    private qualityAnalyzer: QualityAnalyzer;
    private turnsSinceLastSpeaker: Map<string, number> = new Map();
    private previousSpeaker: string | null = null;
    private io: Server | null = null;

    constructor(
        topic: string,
        context: string = "",
        initialAgents: string[] = []
    ) {
        this.ideaExtractor = new IdeaExtractor();
        this.consensusTracker = new ConsensusTracker();
        this.archestra = new ArchestraOrchestrator();
        this.memoryManager = new MemoryManager();
        this.qualityAnalyzer = new QualityAnalyzer();

        this.state = {
            debateId: uuidv4(),
            topic,
            context,
            currentPhase: "initialization",
            activeAgents: initialAgents,
            turnCount: 0,
            statements: [],
            coalitions: [],
            votes: [],
            startTime: Date.now(),
            consensusScore: 0,
            qualityMetrics: undefined,
        };

        logger.info(`Debate engine initialized: ${this.state.debateId}`);
    }

    public setIO(io: Server) {
        this.io = io;
    }

    public getState(): DebateState {
        return this.state;
    }

    public getActiveAgents(): AgentProfile[] {
        return this.state.activeAgents
            .map(id => AGENT_REGISTRY[id])
            .filter(agent => !!agent);
    }

    public async suggestAgents(topic: string, limit: number = 6): Promise<AgentProfile[]> {
        // Simple keyword matching for now (mocking the AI relevance check)
        // In production, this would call an LLM to score relevance
        const agents = Object.values(AGENT_REGISTRY);
        const scoredAgents = agents.map(agent => {
            let score = 0;
            const topicLower = topic.toLowerCase();

            // Check keywords
            agent.keywords.forEach(kw => {
                if (topicLower.includes(kw.toLowerCase())) score += 2;
            });

            // Boost core agents
            if (["utilitarian", "risk_averse", "innovation", "libertarian", "environmental"].includes(agent.id)) score += 1;

            return { agent, score };
        });

        const finalAgents = scoredAgents
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(item => item.agent);

        return finalAgents;
    }

    public setAgents(agentIds: string[]) {
        this.state.activeAgents = agentIds;
    }

    public addAgent(agentId: string) {
        if (!this.state.activeAgents.includes(agentId)) {
            this.state.activeAgents.push(agentId);
            logger.info(`Agent added to debate: ${agentId}`);
        }
    }

    public advancePhase(): Phase {
        const sequence: Phase[] = [
            "initialization",
            "initial_positions",
            "evidence_presentation",
            "socratic_questioning", // Swapped for demo flow usually
            "coalition_building",
            "synthesis",
            "completed"
        ];

        const idx = sequence.indexOf(this.state.currentPhase);
        if (idx < sequence.length - 1) {
            this.state.currentPhase = sequence[idx + 1];
            logger.info(`Debate Phase Advanced: ${this.state.currentPhase}`);

            if (this.io) {
                this.io.emit('phase_change', this.state.currentPhase);
            }
        }
        return this.state.currentPhase;
    }

    public checkPhaseProgression() {
        const turnCount = this.state.turnCount;
        const agentCount = this.state.activeAgents.length;
        const consensus = this.state.consensusScore || 0;

        // Auto-progression logic
        switch (this.state.currentPhase) {
            case "initialization":
                this.advancePhase(); // To initial_positions
                break;
            case "initial_positions":
                // Advance after everyone has spoken at least once (roughly)
                if (turnCount >= agentCount) {
                    this.advancePhase(); // To evidence_presentation (or straight to debate in simplified flow)
                }
                break;
            case "evidence_presentation":
            case "socratic_questioning":
                // Advance after 2 rounds of debate
                if (turnCount >= agentCount * 3) {
                    this.advancePhase(); // To coalition_building
                }
                break;
            case "coalition_building":
                // Advance if consensus builds up OR max turns reached
                if (consensus > 60 || turnCount >= agentCount * 5) {
                    this.advancePhase(); // To synthesis
                }
                break;
            case "synthesis":
                // End game
                if (consensus > 80 || turnCount >= agentCount * 7) {
                    this.advancePhase(); // To completed
                }
                break;
        }
    }

    public recordStatement(
        agentId: string,
        content: string,
        toolsUsed: string[] = []
    ): Statement {
        const statement: Statement = {
            id: uuidv4(),
            debateId: this.state.debateId,
            agentId,
            content,
            timestamp: Date.now(),
            phase: this.state.currentPhase,
            toolsUsed,
            citations: [],
            reactions: [],
        };

        // Extract concepts/citations
        statement.citations = this.ideaExtractor.extractConcepts(statement);

        // Store in agent memory
        const memory = this.memoryManager.getMemory(agentId);
        memory.addStatement(statement);

        this.state.statements.push(statement);
        this.state.turnCount++;

        // Update consensus
        this.calculateConsensus();

        // Check for phase progression
        this.checkPhaseProgression();

        // Update quality metrics every 5 statements
        if (this.state.statements.length % 5 === 0) {
            this.state.qualityMetrics = this.qualityAnalyzer.calculateMetrics(this.state);
            logger.info(`Quality metrics updated: ${this.qualityAnalyzer.getQualityGrade(this.state.qualityMetrics)}`);

            // Emit quality update via socket
            if (this.io) {
                this.io.emit('quality_updated', this.state.qualityMetrics);
            }
        }

        logger.debug(`Statement recorded by ${agentId}: "${content.substring(0, 50)}..."`);
        return statement;
    }

    public formCoalition(agentIds: string[], position: string, reason?: string): Coalition {
        const coalition: Coalition = {
            id: uuidv4(),
            agentIds,
            sharedPosition: position,
            strength: 0.8,
            formationReason: reason,
            formationTime: Date.now(),
        };

        // Record in agent memories
        agentIds.forEach(agentId => {
            const memory = this.memoryManager.getMemory(agentId);
            memory.recordCoalition(agentIds);
        });

        this.state.coalitions.push(coalition);
        this.calculateConsensus();

        logger.info(`Coalition formed: ${agentIds.join(', ')} - "${position}"`);

        // Emit coalition event via socket
        if (this.io) {
            this.io.emit('coalition_formed', coalition);
        }

        return coalition;
    }

    // --- Phase 2: Advanced Mechanics ---

    public attemptInterruption(interrupterId: string, confidence: number): boolean {
        // Simple probabilistic model based on confidence
        // In real impl, this would check personality traits (e.g. aggression)
        if (!this.state.currentSpeaker) return true; // No one speaking, free real estate

        if (interrupterId === this.state.currentSpeaker.agentId) return false;

        // Base chance is confidence. Reduce chance if speaker just started.
        const speakingDuration = Date.now() - this.state.currentSpeaker.startTime;
        const protectionWindow = 5000; // 5 seconds protected

        if (speakingDuration < protectionWindow) return false;

        // Higher chance if speaker has already been interrupted? Or lower?
        // Let's say higher chance if they've been monopolizing
        const monopolyPenalty = speakingDuration > 30000 ? 0.2 : 0;

        return Math.random() < (confidence + monopolyPenalty);
    }

    public setCurrentSpeaker(agentId: string) {
        // If someone was speaking, log end?
        this.state.currentSpeaker = {
            agentId,
            startTime: Date.now(),
            interruptionCount: 0
        };
    }

    public calculateConsensus(): number {
        // Mock consensus calculation based on coalition sizes
        // +10 for every agent in a coalition > 1
        // Base 50%
        let score = 50;

        this.state.coalitions.forEach(c => {
            if (c.agentIds.length > 1) {
                score += (c.agentIds.length * 5);
            }
        });

        // Cap at 100
        this.state.consensusScore = Math.min(100, score);
        return this.state.consensusScore;
    }

    // --- Phase 2/3: Agent Invocation via Archestra ---

    /**
     * Generate an agent response autonomously via Archestra orchestrator
     * This is the core "AI agents speaking" feature
     */
    public async generateAgentResponse(agentId: string): Promise<Statement> {
        const agent = AGENT_REGISTRY[agentId];
        if (!agent) {
            throw new Error(`Agent ${agentId} not found`);
        }

        try {
            // Get memory context
            const memory = this.memoryManager.getMemory(agentId);
            const memorySummary = memory.summarizeContext();

            // Build context for the agent
            const context: AgentInvocationContext = {
                debateState: this.state,
                topic: this.state.topic,
                recentStatements: this.getRecentStatements(5),
                debateHistory: this.formatDebateHistory(),
                agentExpertise: agent.expertise,
                memoryContext: memorySummary // Inject memory
            };

            // Invoke agent via Archestra
            const response = await this.archestra.invokeAgent(agentId, context);

            // Record the statement
            return this.recordStatement(agentId, response.statement, response.toolsUsed);
        } catch (error) {
            console.error(`Failed to generate response for agent ${agentId}:`, error);
            // Fallback: record a generic statement
            const fallback = `I'd like to contribute to this discussion on "${this.state.topic}", but encountered a technical issue. Let me try again shortly.`;
            return this.recordStatement(agentId, fallback);
        }
    }

    /**
     * Determine the next speaker via autonomous bidding
     * Agents compete fairly - highest bid wins, with cooldown logic
     */
    public async allocateNextTurn(): Promise<string | null> {
        if (this.state.activeAgents.length === 0) return null;

        try {
            // Poll agents for bids
            const context: AgentInvocationContext = {
                debateState: this.state,
                topic: this.state.topic,
                recentStatements: this.getRecentStatements(3),
                debateHistory: this.formatDebateHistory(),
                agentExpertise: [],
            };

            const bids = await this.archestra.pollAgentBids(this.state.activeAgents, context);

            // Allocate based on highest bid, respecting cooldown
            const nextSpeaker = this.archestra.allocateNextTurn(
                bids,
                this.previousSpeaker,
                this.turnsSinceLastSpeaker
            );

            if (nextSpeaker) {
                this.previousSpeaker = nextSpeaker;
                // Update turns since last speaker for all agents
                for (const agentId of this.state.activeAgents) {
                    const turns = this.turnsSinceLastSpeaker.get(agentId) || 0;
                    this.turnsSinceLastSpeaker.set(agentId, turns + 1);
                }
                this.turnsSinceLastSpeaker.set(nextSpeaker, 0);
            }

            return nextSpeaker;
        } catch (error) {
            console.error("Error allocating next turn:", error);
            // Fallback: round-robin
            return this._fallbackRoundRobinSpeaker();
        }
    }

    /**
     * Get recent statements for context
     */
    private getRecentStatements(count: number): Statement[] {
        return this.state.statements.slice(-count);
    }

    /**
     * Format debate history as readable string
     */
    private formatDebateHistory(): string {
        return this.state.statements
            .slice(-10)
            .map(s => {
                const agent = AGENT_REGISTRY[s.agentId];
                const name = agent ? agent.name : s.agentId;
                return `${name}: "${s.content.slice(0, 150)}..."`;
            })
            .join('\n');
    }

    /**
     * Fallback round-robin speaker selection if bidding fails
     */
    private _fallbackRoundRobinSpeaker(): string | null {
        if (this.state.activeAgents.length === 0) return null;
        const idx = this.state.turnCount % this.state.activeAgents.length;
        return this.state.activeAgents[idx];
    }

    /**
     * Get the Archestra orchestrator (for moderator access)
     */
    public getArchestra(): ArchestraOrchestrator {
        return this.archestra;
    }
}
