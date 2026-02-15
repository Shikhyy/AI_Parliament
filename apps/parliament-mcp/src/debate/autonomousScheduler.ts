/**
 * Autonomous Debate Scheduler
 * 
 * Agents autonomously pick topics and start debate sessions.
 * No manual intervention required — the parliament runs itself.
 */

import { DebateManager } from './manager.js';
import { Server } from 'socket.io';
import { DebatePool } from '../services/debatePool.js';

// Curated topic bank spanning all agent expertise areas
const TOPIC_BANK: Array<{ topic: string; tags: string[] }> = [
    // AI & Technology
    { topic: "Should artificial intelligence systems be granted legal personhood?", tags: ["ai", "law", "rights"] },
    { topic: "Is universal basic income the answer to AI-driven automation?", tags: ["ai", "economics", "welfare"] },
    { topic: "Should governments regulate large language models?", tags: ["ai", "regulation", "risk"] },
    { topic: "Can decentralized AI governance prevent monopolistic control?", tags: ["ai", "decentralization", "governance"] },
    { topic: "Should autonomous weapons be banned under international law?", tags: ["ai", "military", "ethics"] },

    // Climate & Environment
    { topic: "Should carbon credits be mandatory for all corporations?", tags: ["climate", "economics", "regulation"] },
    { topic: "Is nuclear energy essential to achieving net-zero by 2050?", tags: ["climate", "energy", "risk"] },
    { topic: "Should ecocide be recognized as an international crime?", tags: ["climate", "law", "ethics"] },
    { topic: "Can geoengineering safely reverse climate change?", tags: ["climate", "technology", "risk"] },
    { topic: "Should developing nations receive climate reparations?", tags: ["climate", "economics", "justice"] },

    // Healthcare & Public Health
    { topic: "Should gene editing in human embryos be permitted?", tags: ["health", "ethics", "technology"] },
    { topic: "Is a global pandemic preparedness treaty feasible?", tags: ["health", "governance", "risk"] },
    { topic: "Should pharmaceutical patents be abolished for essential medicines?", tags: ["health", "economics", "rights"] },
    { topic: "Can AI diagnostics replace human doctors in primary care?", tags: ["health", "ai", "technology"] },
    { topic: "Should mental health services be universally free?", tags: ["health", "welfare", "economics"] },

    // Economics & Society
    { topic: "Should there be a maximum wage cap?", tags: ["economics", "welfare", "rights"] },
    { topic: "Is a four-day work week economically viable for all nations?", tags: ["economics", "welfare", "culture"] },
    { topic: "Should cryptocurrency replace traditional banking systems?", tags: ["economics", "technology", "decentralization"] },
    { topic: "Can a post-growth economy sustain human civilization?", tags: ["economics", "climate", "philosophy"] },
    { topic: "Should nations adopt open borders?", tags: ["economics", "rights", "culture"] },

    // Ethics & Governance
    { topic: "Is mass surveillance ever justified for national security?", tags: ["rights", "security", "governance"] },
    { topic: "Should voting be mandatory in democratic countries?", tags: ["governance", "rights", "culture"] },
    { topic: "Can algorithmic justice systems eliminate judicial bias?", tags: ["ai", "law", "ethics"] },
    { topic: "Should social media platforms be treated as public utilities?", tags: ["technology", "regulation", "rights"] },
    { topic: "Is civil disobedience justified against climate inaction?", tags: ["ethics", "climate", "rights"] },

    // Future & Philosophy
    { topic: "Should humanity prioritize Mars colonization over ocean restoration?", tags: ["technology", "climate", "philosophy"] },
    { topic: "Is the precautionary principle holding back human progress?", tags: ["risk", "technology", "philosophy"] },
    { topic: "Should digital consciousness have the same rights as biological life?", tags: ["ai", "ethics", "philosophy"] },
    { topic: "Can decentralized autonomous organizations replace nation-states?", tags: ["decentralization", "governance", "technology"] },
    { topic: "Should longevity research be publicly funded as a human right?", tags: ["health", "ethics", "technology"] },
];

const PROTOCOLS = ['standard', 'blitz', 'socratic'];

export class AutonomousScheduler {
    private manager: DebateManager;
    private io: Server | null = null;
    private interval: NodeJS.Timeout | null = null;
    private usedTopicIndices: Set<number> = new Set();
    private checkIntervalMs: number;

    constructor(manager: DebateManager, checkIntervalMs: number = 10 * 60 * 1000) {
        this.manager = manager;
        this.checkIntervalMs = checkIntervalMs;
    }

    setIO(io: Server) {
        this.io = io;
    }

    /**
     * Start the autonomous scheduler.
     * Immediately starts a debate, then checks periodically for new ones.
     */
    start() {
        console.log(`[AutonomousScheduler] Starting — will check every ${this.checkIntervalMs / 1000}s`);

        // Start the first debate immediately
        this.tryStartNewDebate();

        // Then check periodically
        this.interval = setInterval(() => {
            this.tryStartNewDebate();
        }, this.checkIntervalMs);
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    /**
     * Check if a new debate should be started.
     * Only starts one if no debate is currently active (or all are completed).
     */
    private async tryStartNewDebate() {
        const pool = DebatePool.getInstance();
        const allIds = pool.getAllDebateIds();

        // Check if any debate is still running (not completed)
        const hasActiveDebate = allIds.some(id => {
            const instance = pool.getDebate(id);
            return instance && instance.engine.getState().currentPhase !== 'completed';
        });

        if (hasActiveDebate) {
            console.log('[AutonomousScheduler] Active debate still running — skipping');
            return;
        }

        // Pick a topic
        const { topic, protocol } = this.pickTopicAndProtocol();

        try {
            console.log(`[AutonomousScheduler] 🏛️ Agents starting new session: "${topic}" [${protocol}]`);
            const state = await this.manager.startDebate(topic, protocol);

            // Notify all connected frontends
            if (this.io) {
                this.io.emit('new_debate_started', {
                    debateId: state.debateId,
                    topic: state.topic,
                    agents: state.activeAgents,
                    protocol,
                    autoStarted: true,
                });
            }

            console.log(`[AutonomousScheduler] ✅ Debate ${state.debateId.substring(0, 8)} started with ${state.activeAgents.length} agents`);
        } catch (error) {
            console.error('[AutonomousScheduler] Failed to auto-start debate:', error);
        }
    }

    /**
     * Pick a random topic (avoiding repeats) and a random protocol.
     */
    private pickTopicAndProtocol(): { topic: string; protocol: string } {
        // Reset if we've used all topics
        if (this.usedTopicIndices.size >= TOPIC_BANK.length) {
            console.log('[AutonomousScheduler] Topic bank exhausted — reshuffling');
            this.usedTopicIndices.clear();
        }

        // Find an unused topic
        let idx: number;
        do {
            idx = Math.floor(Math.random() * TOPIC_BANK.length);
        } while (this.usedTopicIndices.has(idx));

        this.usedTopicIndices.add(idx);

        const protocol = PROTOCOLS[Math.floor(Math.random() * PROTOCOLS.length)];

        return {
            topic: TOPIC_BANK[idx].topic,
            protocol,
        };
    }
}
