
import { AGENT_REGISTRY } from '../src/agents/registry';

// Mock suggestion logic from DebateEngine
function suggestAgents(topic: string) {
    console.log(`\n--- Scoring Agents for topic: "${topic}" ---`);
    const agents = Object.values(AGENT_REGISTRY);
    const scoredAgents = agents.map(agent => {
        let score = 0;
        const topicLower = topic.toLowerCase();

        let matches: string[] = [];
        agent.keywords.forEach(kw => {
            if (topicLower.includes(kw.toLowerCase())) {
                score += 2;
                matches.push(kw);
            }
        });

        if (["utilitarian", "risk_averse", "innovation"].includes(agent.id)) score += 1;

        console.log(`${agent.name.padEnd(20)} | Score: ${score} | Core: ${["utilitarian", "risk_averse", "innovation"].includes(agent.id) ? 'YES' : 'NO '} | Initial Matches: ${matches.join(', ')}`);
        return { agent, score };
    });

    return scoredAgents.sort((a, b) => b.score - a.score).map(item => item.agent.id);
}

// Mock bidding logic from ArchestraOrchestrator
function simulateBidding(topic: string) {
    console.log(`\n--- Simulating Heuristic Bidding ---`);
    const agents = Object.values(AGENT_REGISTRY);

    agents.forEach(agent => {
        let relevance = 3;
        const topicLower = topic.toLowerCase();
        let matches: string[] = [];
        agent.keywords.forEach(kw => {
            if (topicLower.includes(kw.toLowerCase())) {
                relevance += 2;
                matches.push(kw);
            }
        });

        // Assume urgency is max (10) for everyone initially
        const urgency = 10;
        const score = relevance * urgency;

        console.log(`${agent.name.padEnd(20)} | Bid Score: ${score} (Rel: ${relevance}, Urg: ${urgency}) | Matches: ${matches.join(', ')}`);
    });
}

const topic = "Should AI have rights?";
suggestAgents(topic);
simulateBidding(topic);
