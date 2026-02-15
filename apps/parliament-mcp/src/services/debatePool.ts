import { DebateEngine } from '../debate/engine';
import { ModeratorAI } from '../debate/moderator';
import { ArchestraOrchestrator } from '../archestra/orchestrator';
import { logger } from '../utils/logger';

interface DebateInstance {
  engine: DebateEngine;
  moderator: ModeratorAI;
  orchestrator: ArchestraOrchestrator;
  createdAt: number;
  lastActivity: number;
}

export class DebatePool {
  private static instance: DebatePool;
  private pool: Map<string, DebateInstance> = new Map();

  public static getInstance(): DebatePool {
    if (!DebatePool.instance) {
      DebatePool.instance = new DebatePool();
    }
    return DebatePool.instance;
  }
  private maxDebates: number = 10;
  private inactiveTimeout: number = 30 * 60 * 1000; // 30 minutes

  createDebate(topic: string, context: string = ''): string {
    // Check if we've hit the limit
    if (this.pool.size >= this.maxDebates) {
      this.cleanupInactive();

      if (this.pool.size >= this.maxDebates) {
        throw new Error('Maximum concurrent debates reached. Please try again later.');
      }
    }

    const engine = new DebateEngine(topic, context);
    const debateId = engine.getState().debateId;

    this.pool.set(debateId, {
      engine,
      moderator: new ModeratorAI(engine),
      orchestrator: new ArchestraOrchestrator(),
      createdAt: Date.now(),
      lastActivity: Date.now(),
    });

    logger.info(`Created debate ${debateId}: "${topic}"`);
    return debateId;
  }

  addDebate(engine: DebateEngine, moderator: ModeratorAI): void {
    const debateId = engine.getState().debateId;
    this.pool.set(debateId, {
      engine,
      moderator,
      orchestrator: new ArchestraOrchestrator(), // This might be redundant if engine has one
      createdAt: Date.now(),
      lastActivity: Date.now(),
    });
    logger.info(`Registered existing debate ${debateId}`);
  }

  getDebate(debateId: string): DebateInstance | null {
    const instance = this.pool.get(debateId);
    if (instance) {
      instance.lastActivity = Date.now();
    }
    return instance || null;
  }

  deleteDebate(debateId: string): boolean {
    const deleted = this.pool.delete(debateId);
    if (deleted) {
      logger.info(`Deleted debate ${debateId}`);
    }
    return deleted;
  }

  private cleanupInactive() {
    const now = Date.now();
    const toDelete: string[] = [];

    this.pool.forEach((instance, debateId) => {
      if (now - instance.lastActivity > this.inactiveTimeout) {
        toDelete.push(debateId);
      }
    });

    toDelete.forEach(id => {
      this.deleteDebate(id);
      logger.warn(`Cleaned up inactive debate ${id}`);
    });
  }

  getActiveDebateCount(): number {
    return this.pool.size;
  }

  getAllDebateIds(): string[] {
    return Array.from(this.pool.keys());
  }

  getStats() {
    const now = Date.now();
    const debates = Array.from(this.pool.entries()).map(([id, instance]) => ({
      id,
      topic: instance.engine.getState().topic,
      phase: instance.engine.getState().currentPhase,
      statements: instance.engine.getState().statements.length,
      activeAgents: instance.engine.getState().activeAgents.length,
      ageMinutes: Math.floor((now - instance.createdAt) / 60000),
      idleMinutes: Math.floor((now - instance.lastActivity) / 60000),
    }));

    return {
      total: this.pool.size,
      maxCapacity: this.maxDebates,
      debates,
    };
  }
}
