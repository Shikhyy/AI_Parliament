/**
 * Shared TypeScript types for AI Parliament
 * Used across frontend, backend, and MCP server
 */

export type Phase = 
  | "initialization"
  | "initial_positions"
  | "evidence_presentation"
  | "socratic_questioning"
  | "coalition_building"
  | "synthesis"
  | "completed";

export interface Statement {
  id: string;
  debateId: string;
  agentId: string;
  content: string;
  timestamp: number;
  phase: Phase;
  toolsUsed: string[];
  citations: string[];
  reactions?: StatementReaction[];
}

export interface StatementReaction {
  statementId: string;
  agentId: string;
  type: '👍' | '🤔' | '❗' | '📊';
  timestamp: number;
}

export interface Coalition {
  id: string;
  agentIds: string[];
  sharedPosition: string;
  strength: number;
  formationReason?: string;
  formationTime?: number;
}

export interface Vote {
  id: string;
  agentId: string;
  choice: string;
  reason: string;
  timestamp: number;
}

export interface DebateState {
  debateId: string;
  topic: string;
  context: string;
  currentPhase: Phase;
  activeAgents: string[];
  turnCount: number;
  statements: Statement[];
  coalitions: Coalition[];
  votes: Vote[];
  startTime: number;
  consensusScore: number;
  currentSpeaker?: {
    agentId: string;
    startTime: number;
  };
  qualityMetrics?: QualityMetrics;
}

export interface QualityMetrics {
  evidenceScore: number;
  diversityScore: number;
  engagementScore: number;
  constructivenessScore: number;
  timestamp: number;
}

export interface AgentProfile {
  id: string;
  name: string;
  emoji: string;
  systemPrompt: string;
  expertise: string[];
  characteristics: {
    verbosity: "low" | "medium" | "high";
    evidenceReliance: "low" | "medium" | "high" | "very-high";
    ideologicalFlexibility: number;
    coalitionTendency: number;
    interruption_likelihood?: number;
    sarcasm_level?: number;
    compromise_willingness?: number;
  };
  tools: string[];
  keywords: string[];
}

export interface TurnBid {
  agentId: string;
  urgency: number;
  topicRelevance: number;
  reasoning: string;
}

export interface AgentResponse {
  statement: string;
  agentId: string;
  toolsUsed: string[];
  citations: string[];
  confidence: number;
}

export interface AgentTyping {
  agentId: string;
  startedAt: number;
}

export interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  activeDebates: number;
  anthropicKeyValid: boolean;
  dbConnected: boolean;
  timestamp: number;
}

export interface DebateMetrics {
  avgResponseTime: number;
  apiCallCount: number;
  agentParticipation: Map<string, number>;
  consensusTrajectory: number[];
}
