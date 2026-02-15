
export interface DebateProtocol {
    id: string;
    name: string;
    description: string;
    rules: {
        turnDuration: number; // seconds
        maxTurns: number;
        consensusThreshold: number;
        interventionStyle: 'passive' | 'active' | 'aggressive';
    };
}

export const DEBATE_PROTOCOLS: Record<string, DebateProtocol> = {
    standard: {
        id: 'standard',
        name: 'Standard Parliamentary',
        description: 'Balanced debate with moderate pacing and standard consensus requirements.',
        rules: {
            turnDuration: 60,
            maxTurns: 30,
            consensusThreshold: 75,
            interventionStyle: 'active'
        }
    },
    blitz: {
        id: 'blitz',
        name: 'Lightning Rounds',
        description: 'Fast-paced, high-pressure debate for quick consensus formation.',
        rules: {
            turnDuration: 15,
            maxTurns: 15,
            consensusThreshold: 60,
            interventionStyle: 'aggressive'
        }
    },
    socratic: {
        id: 'socratic',
        name: 'Socratic Inquiry',
        description: 'Focus on questioning and deep exploration of the topic.',
        rules: {
            turnDuration: 120,
            maxTurns: 50,
            consensusThreshold: 90,
            interventionStyle: 'passive'
        }
    }
};
