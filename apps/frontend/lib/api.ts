// Basic API client for fetching data from the backend

const API_Base_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface Debate {
    id: string;
    topic: string;
    phase: string;
    statements: number;
    activeAgents: number;
    ageMinutes: number;
    idleMinutes: number;
}

export interface DebateDetail extends Omit<Debate, 'statements' | 'activeAgents'> {
    statements: any[]; // The full array of statements
    activeAgents: any[]; // Full agent objects
    consensusScore: number;
    context: string;
    startTime: number;
}

export async function getDebates(): Promise<Debate[]> {
    try {
        const res = await fetch(`${API_Base_URL}/debates`);
        if (!res.ok) throw new Error("Failed to fetch debates");
        return await res.json();
    } catch (error) {
        console.error("Error fetching debates:", error);
        return [];
    }
}

export async function getDebate(id: string): Promise<DebateDetail | null> {
    try {
        const res = await fetch(`${API_Base_URL}/debate/${id}`);
        if (!res.ok) throw new Error("Failed to fetch debate");
        return await res.json();
    } catch (error) {
        console.error(`Error fetching debate ${id}:`, error);
        return null;
    }
}
