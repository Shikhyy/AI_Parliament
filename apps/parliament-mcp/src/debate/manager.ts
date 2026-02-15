import { Server } from 'socket.io';
import { DebateEngine } from './engine';
import { BlockchainService } from '../services/blockchain';
import { DebateState } from './types';
import { ModeratorAI } from './moderator';
import { DebatePool } from '../services/debatePool';

export class DebateManager {
    private static instance: DebateManager;
    private activeDebate: DebateEngine | null = null;
    private io: Server | null = null;
    private blockchainService: BlockchainService;
    private moderator: ModeratorAI | null = null;
    private moderationLoopInterval: NodeJS.Timeout | null = null;

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

    public getState(): DebateState | null {
        return this.activeDebate ? this.activeDebate.getState() : null;
    }

    public async startDebate(topic: string): Promise<DebateState> {
        console.log(`Starting debate on: ${topic}`);

        // Initialize engine
        this.activeDebate = new DebateEngine(topic);
        if (this.io) {
            this.activeDebate.setIO(this.io);
        }
        this.moderator = new ModeratorAI(this.activeDebate);

        // Auto-select agents
        const agents = await this.activeDebate.suggestAgents(topic);
        this.activeDebate.setAgents(agents.map(a => a.id));

        // Start on blockchain (background)
        this.blockchainService.startDebateOnChain(topic, agents.map(a => a.id))
            .then(tx => console.log(`Debate started on-chain: ${tx}`))
            .catch(err => console.error(`Blockchain start failed: ${err}`));

        // Start moderation loop
        this.startModerationLoop();

        // Register in pool
        const pool = DebatePool.getInstance();
        if (this.moderator) {
            pool.addDebate(this.activeDebate, this.moderator);
        }

        this.broadcastUpdate();
        return this.activeDebate.getState();
    }

    private startModerationLoop() {
        if (this.moderationLoopInterval) clearInterval(this.moderationLoopInterval);

        this.moderationLoopInterval = setInterval(() => {
            if (!this.moderator || !this.activeDebate) return;

            const action = this.moderator.assessState();
            if (action) {
                this.moderator.executeAction(action);
                this.broadcastUpdate();
            }
        }, 5000); // Check every 5 seconds
    }

    public async processTurn(agentId: string, content: string, toolsUsed: string[] = []) {
        if (!this.activeDebate) throw new Error("No active debate");

        const statement = this.activeDebate.recordStatement(agentId, content, toolsUsed);

        // Broadcast the new statement immediately
        if (this.io) {
            this.io.emit('statement_added', statement);
        }

        // Record on blockchain (background)
        // Using a mock IPFS hash for now since actual upload is client-side or separate service
        const mockIpfsHash = "QmMockHash" + Date.now();
        this.blockchainService.recordStatement(
            this.activeDebate.getState().debateId, // In real app, map UUID to uint256 ID from contract
            agentId,
            content,
            mockIpfsHash
        ).catch(err => console.error(`Blockchain record failed: ${err}`));

        // Check if intervention is needed (triggered via socket/admin)
        // This is where specific intervention logic could go if automated

        this.broadcastUpdate();
        return statement;
    }

    public async triggerIntervention() {
        if (!this.activeDebate) return;

        console.log("Admin triggering Devil's Advocate intervention...");

        // Add Devil's Advocate to active agents if not present
        if (!this.activeDebate.getState().activeAgents.includes('devils_advocate')) {
            this.activeDebate.addAgent('devils_advocate');
        }

        // Force an immediate turn for the Devil's Advocate
        const interventionPrompt = "You are the Devil's Advocate. The debate has reached a dangerous consensus. You must aggressively steelman the opposing view to break the echo chamber. Speak now.";

        try {
            // Note: This assumes `debatePool.ts` or `index.ts` has access to the Archestra client
            // Since DebateManager doesn't hold the Orchestrator reference directly in this snippet,
            // we will simulate the "decision" to speak by broadcasting the typing event
            // and relying on the Orchestrator loop to pick it up, OR we can manually invoke it if refactored.

            // customized implementation for now:
            if (this.io) {
                this.io.emit('intervention_active', { type: 'devils_advocate', message: 'CONSENSUS_BREAKER_PROTOCOL_INITIATED' });
            }

            // In a full implementation, we would call `this.orchestrator.generateTurn('devils_advocate', interventionPrompt)`
            // For now, we signal the frontend to show the modal which then "Acknowledges" and triggers the turn via API.
        } catch (error) {
            console.error("Intervention trigger failed:", error);
        }
    }

    public castVote(agentId: string, choice: string, reason: string) {
        if (!this.activeDebate) throw new Error("No active debate");
        console.log(`Vote cast by ${agentId}: ${choice} because ${reason}`);
        this.broadcastUpdate();
    }

    public advancePhase() {
        if (!this.activeDebate) throw new Error("No active debate");
        const oldPhase = this.activeDebate.getState().currentPhase;
        this.activeDebate.advancePhase();
        const newPhase = this.activeDebate.getState().currentPhase;

        // Broadcast phase change
        if (this.io) {
            this.io.emit('phase_changed', { oldPhase, newPhase });
        }

        this.broadcastUpdate();
    }

    public setAgents(agentIds: string[]) {
        if (!this.activeDebate) throw new Error("No active debate");
        this.activeDebate.setAgents(agentIds);
    }

    public broadcastUpdate() {
        if (!this.io || !this.activeDebate) return;

        const state = this.activeDebate.getState();
        this.io.emit('state_sync', state);
    }
}
