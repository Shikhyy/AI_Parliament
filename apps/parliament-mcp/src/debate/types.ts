
export type Phase =
    | "initialization"
    | "initial_positions"
    | "socratic_questioning"
    | "evidence_presentation"
    | "argument_refinement"
    | "coalition_building"
    | "synthesis"
    | "completed";

export interface StatementReaction {
    statementId: string;
    agentId: string;
    type: '👍' | '🤔' | '❗' | '📊';
    timestamp: number;
}

export interface QualityMetrics {
    evidenceScore: number;
    diversityScore: number;
    engagementScore: number;
    constructivenessScore: number;
    timestamp: number;
}

export interface DebateState {
    debateId: string;
    topic: string;
    context?: string;
    currentPhase: Phase;
    activeAgents: string[];
    turnCount: number;
    statements: Statement[];
    coalitions: Coalition[];
    votes: Vote[];
    startTime: number;
    endTime?: number;
    // New fields for Phase 2
    currentSpeaker?: {
        agentId: string;
        startTime: number;
        interruptionCount: number;
    };
    consensusScore?: number; // 0-100
    qualityMetrics?: QualityMetrics;
}

export interface Statement {
    id: string;
    debateId: string;
    agentId: string;
    content: string;
    timestamp: number;
    phase: Phase;
    toolsUsed?: string[];
    citations?: string[];
    refersTo?: string[]; // IDs of other statements
    reactions?: StatementReaction[];
}

export interface Coalition {
    id: string;
    name?: string;
    agentIds: string[];
    sharedPosition: string;
    strength: number; // 0-1
    formationReason?: string;
    formationTime?: number;
}

export interface Vote {
    agentId: string;
    support: boolean; // simple yes/no for now, can expand to ranked
    confidence: number; // 0-100
    reasoning: string;
    timestamp: number;
}
