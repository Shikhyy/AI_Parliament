import { Statement } from '../debate/types.js';

interface KeyPoint {
  topic: string;
  importance: number;
  relatedStatements: string[];
}

export class AgentMemory {
  private agentId: string;
  private conversationHistory: Statement[] = [];
  private keyPoints: Map<string, KeyPoint> = new Map();
  private coalitionHistory: string[][] = [];
  private maxHistorySize: number = 100;
  private summaryCache: Map<number, string> = new Map();

  constructor(agentId: string) {
    this.agentId = agentId;
  }

  addStatement(statement: Statement) {
    this.conversationHistory.push(statement);

    if (this.conversationHistory.length > this.maxHistorySize) {
      this.conversationHistory = this.conversationHistory.slice(-this.maxHistorySize);
    }

    this.extractKeyPoints(statement);
  }

  private extractKeyPoints(statement: Statement) {
    const words = statement.content.toLowerCase().split(/\s+/);
    const importance = (statement.citations?.length || 0) * 2 + 1;

    words.forEach(word => {
      if (word.length > 5) {
        const existing = this.keyPoints.get(word);
        if (existing) {
          existing.importance += importance;
          existing.relatedStatements.push(statement.id);
        } else {
          this.keyPoints.set(word, {
            topic: word,
            importance,
            relatedStatements: [statement.id],
          });
        }
      }
    });
  }

  getRecentContext(maxStatements: number = 10): Statement[] {
    return this.conversationHistory.slice(-maxStatements);
  }

  getTopKeyPoints(limit: number = 5): KeyPoint[] {
    return Array.from(this.keyPoints.values())
      .sort((a, b) => b.importance - a.importance)
      .slice(0, limit);
  }

  summarizeContext(maxTokens: number = 1000): string {
    const cacheKey = this.conversationHistory.length;

    if (this.summaryCache.has(cacheKey)) {
      return this.summaryCache.get(cacheKey)!;
    }

    const sortedStatements = [...this.conversationHistory]
      .sort((a, b) => (b.citations?.length || 0) - (a.citations?.length || 0))
      .slice(0, 5);

    const summary = sortedStatements
      .map(s => `- ${s.content.substring(0, 200)}...`)
      .join('\n');

    this.summaryCache.set(cacheKey, summary);
    return summary;
  }

  recordCoalition(memberIds: string[]) {
    this.coalitionHistory.push(memberIds);
  }

  getCoalitionHistory(): string[][] {
    return this.coalitionHistory;
  }

  getPastPositionOn(topic: string): string | null {
    const relevantStatements = this.conversationHistory.filter(
      s => s.content.toLowerCase().includes(topic.toLowerCase())
    );

    if (relevantStatements.length === 0) return null;

    return relevantStatements[relevantStatements.length - 1].content;
  }

  getStats() {
    return {
      totalStatements: this.conversationHistory.length,
      keyPointsTracked: this.keyPoints.size,
      coalitionsFormed: this.coalitionHistory.length,
    };
  }

  reset() {
    this.conversationHistory = [];
    this.keyPoints.clear();
    this.summaryCache.clear();
  }
}

export class MemoryManager {
  private memories: Map<string, AgentMemory> = new Map();

  getMemory(agentId: string): AgentMemory {
    if (!this.memories.has(agentId)) {
      this.memories.set(agentId, new AgentMemory(agentId));
    }
    return this.memories.get(agentId)!;
  }

  clearMemory(agentId: string) {
    this.memories.delete(agentId);
  }

  clearAll() {
    this.memories.clear();
  }

  getAllStats() {
    const stats: Record<string, any> = {};
    this.memories.forEach((memory, agentId) => {
      stats[agentId] = memory.getStats();
    });
    return stats;
  }
}
