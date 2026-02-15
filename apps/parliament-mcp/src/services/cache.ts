import { getConfig } from '../config/env';
import { logger } from '../utils/logger';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class Cache {
  private store: Map<string, CacheEntry<any>> = new Map();
  private ttlSeconds: number;

  constructor() {
    const config = getConfig();
    this.ttlSeconds = parseInt(config.CACHE_TTL_SECONDS);

    // Cleanup expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  set<T>(key: string, value: T, customTtl?: number): void {
    const ttl = customTtl || this.ttlSeconds;
    this.store.set(key, {
      value,
      expiresAt: Date.now() + (ttl * 1000),
    });
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);

    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value as T;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    let removed = 0;

    this.store.forEach((entry, key) => {
      if (now > entry.expiresAt) {
        this.store.delete(key);
        removed++;
      }
    });

    if (removed > 0) {
      logger.debug(`Cache cleanup: removed ${removed} expired entries`);
    }
  }

  getStats() {
    const now = Date.now();
    let activeCount = 0;
    let expiredCount = 0;

    this.store.forEach(entry => {
      if (now > entry.expiresAt) {
        expiredCount++;
      } else {
        activeCount++;
      }
    });

    return {
      total: this.store.size,
      active: activeCount,
      expired: expiredCount,
    };
  }
}

export const cache = new Cache();
