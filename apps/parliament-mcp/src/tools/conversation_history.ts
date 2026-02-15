import { DebateManager } from '../debate/manager.js';

export function getConversationHistory(manager: DebateManager): string {
    const state = manager.getState();
    if (!state) return "No active debate.";

    return state.statements.map(entry => {
        return `[${entry.timestamp}] ${entry.agentId}: ${entry.content}`;
    }).join('\n');
}
