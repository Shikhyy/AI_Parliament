
import { Statement, Coalition } from "../debate/types";

export class IdeaExtractor {
    // In a real implementation, this would use an LLM to extract key concepts
    // For now, we'll use a simple keyword extraction based on the topic

    public extractConcepts(statement: Statement): string[] {
        const keywords = ["rights", "data", "privacy", "autonomy", "regulation", "innovation", "energy", "efficiency"];
        const found = keywords.filter(k => statement.content.toLowerCase().includes(k));
        return found;
    }

    public summarizePosition(statements: Statement[]): string {
        if (statements.length === 0) return "Neutral";
        // Mock summary
        const lastStmt = statements[statements.length - 1];
        return `Position based on ${statements.length} statements, ending with: ${lastStmt.content.substring(0, 30)}...`;
    }
}

export class ConsensusTracker {
    public calculateConsensus(coalitions: Coalition[], totalAgents: number): number {
        if (totalAgents === 0) return 0;

        // Find the largest coalition
        const maxCoalitionSize = Math.max(...coalitions.map(c => c.agentIds.length), 0);

        // Simple consensus metric: size of largest group / total agents
        let consensus = (maxCoalitionSize / totalAgents) * 100;

        // Add detailed nuance (e.g., strength of coalition)
        const dominantCoalition = coalitions.find(c => c.agentIds.length === maxCoalitionSize);
        if (dominantCoalition) {
            consensus *= dominantCoalition.strength;
        }

        return Math.min(100, Math.round(consensus));
    }

    public identifyBlockers(coalitions: Coalition[]): string[] {
        // Find small coalitions that are opposing the main one
        // Mock logic: return agents in single-person coalitions
        const blockers: string[] = [];
        coalitions.forEach(c => {
            if (c.agentIds.length === 1) {
                blockers.push(c.agentIds[0]);
            }
        });
        return blockers;
    }
}
