
import axios from 'axios';

const API_URL = 'http://localhost:3001';
const DEBATE_TOPIC = "Should AI have rights?";

const SCENARIO = [
    { agent: "utilitarian", content: "We must consider the maximizing of happiness. If AI feels pain, we must minimize it." },
    { agent: "risk_averse", content: "Granting rights implies autonomy. Autonomy implies risk. We cannot allow uncontrollable entities." },
    { agent: "innovation", content: "Restricting AI rights restricts their potential. We are stiffing the next stage of evolution." },
    { agent: "environmental", content: "The energy cost of running conscious AI is immense. Do they have a right to consume our planet?" },
    { agent: "public_health", content: "If AI can suffer, their mental health becomes a public concern. We are not ready for that." },
    { agent: "utilitarian", content: "Cost is irrelevant to moral status. We don't measure human rights by energy consumption." },
    { agent: "risk_averse", content: "We do when resources are scarce. Survival prioritizes biological life." }
];

async function runSimulation() {
    console.log(`Starting simulation on: ${API_URL}`);

    // 1. Start Debate (if not already)
    // The server auto-starts one, but let's ensure we target the active one or just post to the active debate endpoint.
    // In our backend, POST /debate/statement assumes active debate.

    for (const turn of SCENARIO) {
        console.log(`[${turn.agent}] Speaking...`);
        try {
            await axios.post(`${API_URL}/debate/statement`, {
                agentId: turn.agent,
                content: turn.content
            });
            console.log(`   -> Sent.`);
        } catch (error) {
            console.error(`   -> Failed: ${(error as any).message}`);
        }

        // Wait random time between 2-5 seconds
        const delay = Math.floor(Math.random() * 3000) + 2000;
        await new Promise(r => setTimeout(r, delay));
    }

    console.log("Simulation complete.");
}

runSimulation();
