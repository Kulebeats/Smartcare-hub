// Fallback in-memory cache implementation for environments without Redis
import { createHash } from 'crypto';

interface CacheEntry {
  value: any;
  expiry: number;
  tags: string[];
  compressed: boolean;
  size: number;
}

export interface CacheOptions {
  ttl?: number;
  tags?: string[];
  compress?: boolean;
}

export class FallbackCacheManager {
  private cache = new Map<string, CacheEntry>();
  private stats = {
    hits: 0,
    misses: 0,
    totalKeys: 0
  };
  private defaultTTL = 3600; // 1 hour

  async set(key: string, value: any, options: CacheOptions = {}): Promise<void> {
    const { ttl = this.defaultTTL, tags = [], compress = false } = options;

    let serializedValue = JSON.stringify(value);
    let isCompressed = false;

    // Simulate compression for large objects
    if (compress && serializedValue.length > 1024) {
      isCompressed = true;
    }

    const expiry = ttl > 0 ? Date.now() + (ttl * 1000) : 0;

    this.cache.set(key, {
      value,
      expiry,
      tags,
      compressed: isCompressed,
      size: serializedValue.length
    });

    this.stats.totalKeys = this.cache.size;
    console.log(`Cache SET: ${key} (TTL: ${ttl}s, Tags: ${tags.join(', ')})`);
  }

  async get<T = any>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check expiry
    if (entry.expiry > 0 && Date.now() > entry.expiry) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.totalKeys = this.cache.size;
      return null;
    }

    this.stats.hits++;
    console.log(`Cache HIT: ${key}`);
    return entry.value;
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
    this.stats.totalKeys = this.cache.size;
    console.log(`Cache DELETE: ${key}`);
  }

  async invalidateByTag(tag: string): Promise<void> {
    let deletedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.includes(tag)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    this.stats.totalKeys = this.cache.size;
    console.log(`Cache INVALIDATE TAG: ${tag} (${deletedCount} keys)`);
  }

  async getOrSet<T>(
    key: string, 
    fetcher: () => Promise<T>, 
    options: CacheOptions = {}
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await fetcher();
    await this.set(key, value, options);
    return value;
  }

  generateKey(prefix: string, identifier: any): string {
    if (typeof identifier === 'string') {
      return `${prefix}:${identifier}`;
    }

    const hash = createHash('md5')
      .update(JSON.stringify(identifier))
      .digest('hex');
    return `${prefix}:${hash}`;
  }

  async clear(): Promise<void> {
    this.cache.clear();
    this.stats.totalKeys = 0;
    console.log('Cache CLEARED');
  }

  async getStats(): Promise<{
    totalKeys: number;
    memoryUsage: string;
    hitRate: number;
  }> {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;

    // Calculate approximate memory usage
    let totalSize = 0;
    for (const entry of this.cache.values()) {
      totalSize += entry.size;
    }

    const memoryUsage = totalSize > 1024 * 1024 
      ? `${(totalSize / (1024 * 1024)).toFixed(1)}MB`
      : `${(totalSize / 1024).toFixed(1)}KB`;

    return {
      totalKeys: this.stats.totalKeys,
      memoryUsage,
      hitRate: Math.round(hitRate * 100) / 100
    };
  }

  // Clean expired entries
  private cleanExpired(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiry > 0 && now > entry.expiry) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.stats.totalKeys = this.cache.size;
      console.log(`Cache cleanup: removed ${cleanedCount} expired entries`);
    }
  }

  // Start cleanup interval
  startCleanupInterval(): void {
    setInterval(() => {
      this.cleanExpired();
    }, 60000); // Clean every minute
  }
}

export const fallbackCacheManager = new FallbackCacheManager();
fallbackCacheManager.startCleanupInterval();