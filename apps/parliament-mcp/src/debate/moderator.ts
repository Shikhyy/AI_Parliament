
import { DebateEngine } from "./engine";
import { DebateState } from "./types";

export class ModeratorAI {
    private engine: DebateEngine;
    private lastTurnAllocationTime: number = 0;
    private turnAllocationInterval: number = 8000; // 8 seconds between turn allocations
    private stallDetectionTime: number = 12000; // 12 seconds of no statements = stalled

    constructor(engine: DebateEngine) {
        this.engine = engine;
    }

    public assessState(): ModeratorAction | null {
        const state = this.engine.getState();
        const now = Date.now();

        // 1. Check for Stagnation (no new statements for threshold time)
        // Only check if we've had some activity first
        if (state.statements.length > 0) {
            const lastStatement = state.statements[state.statements.length - 1];
            const timeSinceLastStatement = now - lastStatement.timestamp;

            if (timeSinceLastStatement > this.stallDetectionTime && state.currentPhase !== "completed") {
                return {
                    type: "allocate_turn",
                    reason: "Debate has stalled, allocating next turn automatically"
                };
            }
        }

        // 2. Check if enough time has passed for next turn allocation
        if (now - this.lastTurnAllocationTime > this.turnAllocationInterval && state.currentPhase !== "completed") {
            return {
                type: "allocate_turn",
                reason: "Time for next turn (autonomous bidding cycle)"
            };
        }

        // 3. Check for Dominance (One agent speaking too much)
        const agentStatementCounts = new Map<string, number>();
        state.statements.forEach(s => {
            agentStatementCounts.set(s.agentId, (agentStatementCounts.get(s.agentId) || 0) + 1);
        });

        let maxStatements = 0;
        let dominantAgent: string | null = null;
        agentStatementCounts.forEach((count, agentId) => {
            if (count > maxStatements) {
                maxStatements = count;
                dominantAgent = agentId;
            }
        });

        const avgStatements = state.statements.length / Math.max(1, state.activeAgents.length);
        if (maxStatements > avgStatements * 2 && dominantAgent) {
            return {
                type: "interject",
                content: `We're hearing a lot from one perspective. Let's hear from others on this topic.`,
                reason: `Agent ${dominantAgent} has been dominant (${maxStatements} statements vs avg ${avgStatements.toFixed(1)})`
            };
        }

        // 4. Check for Circular Arguments
        if (state.statements.length > 15 && (state.consensusScore || 0) < 30) {
            return {
                type: "interject",
                content: "We seem to be going in circles. Let's refocus on the key disagreements and evidence.",
                reason: "Low consensus after many statements indicates circular debate"
            };
        }

        // 5. Check for Phase progression
        if (state.currentPhase === "initialization" && state.turnCount > 8) {
            return {
                type: "advance_phase",
                reason: "Initial positions established, moving to evidence presentation"
            };
        }

        return null;
    }

    public async executeAction(action: ModeratorAction) {
        console.log(`[MODERATOR] Executing: ${action.type} - ${action.reason || action.content}`);

        switch (action.type) {
            case "advance_phase":
                this.engine.advancePhase();
                break;
            case "interject":
                if (action.content) {
                    this.engine.recordStatement("MODERATOR", action.content, ["moderation_tool"]);
                    this.engine.setCurrentSpeaker("MODERATOR");
                }
                break;
            case "allocate_turn":
                await this._allocateNextTurn();
                break;
            case "force_vote":
                // Logic to trigger voting phase
                break;
        }
    }

    /**
     * Allocate the next turn autonomously via bidding
     * This is called by the moderator loop to drive the debate forward
     */
    private async _allocateNextTurn() {
        try {
            const nextSpeaker = await this.engine.allocateNextTurn();

            if (nextSpeaker) {
                console.log(`[MODERATOR] Allocating turn to: ${nextSpeaker}`);
                this.engine.setCurrentSpeaker(nextSpeaker);
                this.lastTurnAllocationTime = Date.now();

                // Generate the agent's response
                const statement = await this.engine.generateAgentResponse(nextSpeaker);
                console.log(`[MODERATOR] Agent "${nextSpeaker}" responded: "${statement.content.slice(0, 100)}..."`);
            }
        } catch (error) {
            console.error("[MODERATOR] Error during turn allocation:", error);
        }
    }
}

export interface ModeratorAction {
    type: "advance_phase" | "interject" | "allocate_turn" | "force_vote" | "penalize_agent";
    reason?: string;
    content?: string;
    targetAgentId?: string;
}
