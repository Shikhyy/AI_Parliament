export interface AgentProfile {
    id: string;
    name: string;
    emoji: string;
    role: 'Core' | 'Domain' | 'Stakeholder' | 'Specialized' | 'WildCard';
    bio: string;
    systemPrompt: string;
    expertise: string[];
    triggers: string[]; // Keywords that increase relevance
    color: string; // Hex for UI
}

export interface Agentstate {
    id: string;
    tokensUsed: number;
    fatigue: number; // 0-1
    isActive: boolean;
}
