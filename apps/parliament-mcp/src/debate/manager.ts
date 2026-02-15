import { Server } from 'socket.io';
import { DebateEngine } from './engine.js';
import { BlockchainService } from '../services/blockchain.js';
import { DebateState, BadgeAward } from './types.js';
import { ModeratorAI } from './moderator.js';
import { DebatePool } from '../services/debatePool.js';
import { AGENT_REGISTRY } from '../agents/registry.js';

export class DebateManager {
    private static instance: DebateManager;

    private io: Server | null = null;
    private blockchainService: BlockchainService;
    private moderationLoopInterval: NodeJS.Timeout | null = null;
    private mintedDebates: Set<string> = new Set(); // Track debates that already had badges minted

    private constructor() {
        this.blockchainService = new BlockchainService();
    }

    public static getInstance(): DebateManager {
        if (!DebateManager.instance) {
            DebateManager.instance = new DebateManager();
        }
        return DebateManager.instance;
    }

    public setIO(io: Server) {
        this.io = io;
    }

    public getIO(): Server | null {
        return this.io;
    }

    // Get state for a specific debate, or the most recent one
    public getState(debateId?: string): DebateState | null {
        const pool = DebatePool.getInstance();
        if (debateId) {
            return pool.getDebate(debateId)?.engine.getState() || null;
        }
        // Fallback to most recent for backwards compatibility
        const ids = pool.getAllDebateIds();
        if (ids.length > 0) {
            return pool.getDebate(ids[ids.length - 1])?.engine.getState() || null;
        }
        return null;
    }

    public async startDebate(topic: string, protocolId: string = 'standard'): Promise<DebateState> {
        console.log(`Starting debate on: ${topic} [Protocol: ${protocolId}]`);

        const pool = DebatePool.getInstance();
        const debateId = pool.createDebate(topic, protocolId); // Assumes createDebate updated to take protocol or context
        const instance = pool.getDebate(debateId);

        if (!instance) throw new Error("Failed to create debate instance");

        const engine = instance.engine;

        if (this.io) {
            engine.setIO(this.io); // Engine needs IO for internal emits if any, but better to centralize here
            // Engine might need to know its ID or Room to emit correctly if it emits directly.
            // Current engine implementation emits to global IO? Let's check `engine.ts`.
            // Engine has `setIO`. 
        }

        // Auto-select agents
        const agents = await engine.suggestAgents(topic);
        engine.setAgents(agents.map(a => a.id));

        // Start on blockchain (background)
        this.blockchainService.startDebateOnChain(topic, agents.map(a => a.id))
            .then(tx => console.log(`Debate started on-chain: ${tx}`))
            .catch(err => console.error(`Blockchain start failed: ${err}`));

        // Ensure moderation loop is running (global loop or per debate?)
        // Currently `DebatePool` creates `ModeratorAI` for each debate.
        // We need to ensure those moderators are "ticked".
        this.startModerationLoop(); // This needs to iterate all debates logic

        this.broadcastUpdate(debateId);
        return engine.getState();
    }

    public joinDebate(socket: any, debateId: string) {
        socket.join(`debate_${debateId}`);
        const state = this.getState(debateId);
        if (state) {
            socket.emit('state_sync', state);
        }
    }

    public leaveDebate(socket: any, debateId: string) {
        socket.leave(`debate_${debateId}`);
    }

    private startModerationLoop() {
        if (this.moderationLoopInterval) return; // Already running

        this.moderationLoopInterval = setInterval(() => {
            const pool = DebatePool.getInstance();
            pool.getAllDebateIds().forEach(debateId => {
                const instance = pool.getDebate(debateId);
                if (instance) {
                    const action = instance.moderator.assessState();
                    if (action) {
                        instance.moderator.executeAction(action);
                        this.broadcastUpdate(debateId);
                    }

                    // Check if debate just completed and needs badge minting
                    const state = instance.engine.getState();
                    if (state.currentPhase === 'completed' && state.badgeAwards && state.badgeAwards.length > 0 && !this.mintedDebates.has(debateId)) {
                        this.mintedDebates.add(debateId);
                        this.mintBadgesForDebate(debateId, state.badgeAwards);
                    }
                }
            });
        }, 5000); // Check every 5 seconds
    }

    public async processTurn(debateId: string, agentId: string, content: string, toolsUsed: string[] = []) {
        const pool = DebatePool.getInstance();
        const instance = pool.getDebate(debateId);
        if (!instance) throw new Error("Debate not found");

        const statement = instance.engine.recordStatement(agentId, content, toolsUsed);

        // Broadcast to specific room
        if (this.io) {
            this.io.to(`debate_${debateId}`).emit('statement_added', statement);
        }

        // Record on blockchain (background)
        const mockIpfsHash = "QmMockHash" + Date.now();
        this.blockchainService.recordStatement(
            debateId,
            agentId,
            content,
            mockIpfsHash
        ).catch(err => console.error(`Blockchain record failed: ${err}`));

        this.broadcastUpdate(debateId);
        return statement;
    }

    public async triggerIntervention(debateId: string) {
        const pool = DebatePool.getInstance();
        const instance = pool.getDebate(debateId);
        if (!instance) return;

        console.log(`Admin triggering Devil's Advocate intervention in ${debateId}...`);

        if (!instance.engine.getState().activeAgents.includes('devils_advocate')) {
            instance.engine.addAgent('devils_advocate');
        }

        if (this.io) {
            this.io.to(`debate_${debateId}`).emit('intervention_active', { type: 'devils_advocate', message: 'CONSENSUS_BREAKER_PROTOCOL_INITIATED' });
        }
    }

    public castVote(debateId: string, agentId: string, choice: string, reason: string) {
        const pool = DebatePool.getInstance();
        const instance = pool.getDebate(debateId);
        if (!instance) throw new Error("Debate not found");

        console.log(`Vote cast by ${agentId} in ${debateId}: ${choice}`);
        this.broadcastUpdate(debateId);
    }

    public advancePhase(debateId: string) {
        const pool = DebatePool.getInstance();
        const instance = pool.getDebate(debateId);
        if (!instance) throw new Error("Debate not found");

        const oldPhase = instance.engine.getState().currentPhase;
        instance.engine.advancePhase();
        const newPhase = instance.engine.getState().currentPhase;

        if (this.io) {
            this.io.to(`debate_${debateId}`).emit('phase_changed', { oldPhase, newPhase });
        }

        this.broadcastUpdate(debateId);
    }

    public setAgents(debateId: string, agentIds: string[]) {
        const pool = DebatePool.getInstance();
        const instance = pool.getDebate(debateId);
        if (!instance) throw new Error("Debate not found");

        instance.engine.setAgents(agentIds);
    }

    public broadcastUpdate(debateId: string) {
        if (!this.io) return;
        const state = this.getState(debateId);
        if (state) {
            this.io.to(`debate_${debateId}`).emit('state_sync', state);
        }
    }
    public addReaction(debateId: string, statementId: string, agentId: string, type: string) {
        const pool = DebatePool.getInstance();
        const instance = pool.getDebate(debateId);
        if (instance) {
            instance.engine.addReaction(statementId, agentId, type);
        }
    }

    /**
     * Mint NFT badges for all awards in a completed debate.
     * Runs in background — failures don't block the debate flow.
     */
    private async mintBadgesForDebate(debateId: string, awards: BadgeAward[]) {
        console.log(`[BadgeMint] Minting ${awards.length} badges for debate ${debateId}`);

        for (const award of awards) {
            try {
                // Look up agent wallet address from registry
                const agent = AGENT_REGISTRY[award.agentId];
                const recipientAddress = agent?.walletAddress || '0x0000000000000000000000000000000000000000';

                const txHash = await this.blockchainService.mintBadge(
                    recipientAddress,
                    award.badgeType,
                    debateId,
                    award.agentId
                );

                award.txHash = txHash;
                console.log(`[BadgeMint] ✅ ${award.badgeName} → ${award.agentId} (tx: ${txHash})`);
            } catch (error) {
                console.error(`[BadgeMint] ❌ Failed to mint ${award.badgeName} for ${award.agentId}:`, error);
            }
        }

        // Broadcast updated state with txHashes filled in
        if (this.io) {
            this.io.to(`debate_${debateId}`).emit('badges_minted', awards);
        }

        console.log(`[BadgeMint] Completed minting for debate ${debateId}`);
    }
}
