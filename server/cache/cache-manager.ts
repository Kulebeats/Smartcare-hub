import { createHash } from 'crypto';
import { fallbackCacheManager } from './fallback-cache';

// Try to import Redis, but gracefully fall back if not available
let redis: any = null;
let redisAvailable = false;

try {
  const redisModule = require('./redis-client');
  redis = redisModule.redis;
  redisAvailable = true;
} catch (error) {
  console.log('Redis not available, using fallback cache manager');
  redisAvailable = false;
}

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Cache tags for invalidation
  compress?: boolean; // Enable compression for large objects
}

export class CacheManager {
  private defaultTTL = 3600; // 1 hour default
  private isRedisConnected = false;

  constructor() {
    if (redisAvailable && redis) {
      this.checkRedisConnection();
    }
  }

  private async checkRedisConnection(): Promise<void> {
    try {
      await redis.ping();
      this.isRedisConnected = true;
      console.log('Redis connection verified');
    } catch (error) {
      this.isRedisConnected = false;
      console.log('Redis connection failed, using fallback cache');
    }
  }

  /**
   * Store data in cache with optional compression and tagging
   */
  async set(key: string, value: any, options: CacheOptions = {}): Promise<void> {
    // Use fallback cache if Redis is not available or connected
    if (!redisAvailable || !this.isRedisConnected) {
      return fallbackCacheManager.set(key, value, options);
    }

    try {
      const { ttl = this.defaultTTL, tags = [], compress = false } = options;
      
      let serializedValue = JSON.stringify(value);
      
      // Compress large objects to save memory
      if (compress && serializedValue.length > 1024) {
        const zlib = await import('zlib');
        serializedValue = zlib.gzipSync(serializedValue).toString('base64');
        
        // Store compression flag
        await redis.hset(`cache:meta:${key}`, {
          compressed: '1',
          size: serializedValue.length,
          created: Date.now()
        });
      }

      // Set the main cache entry
      if (ttl > 0) {
        await redis.setex(key, ttl, serializedValue);
      } else {
        await redis.set(key, serializedValue);
      }

      // Handle cache tags for group invalidation
      if (tags.length > 0) {
        const pipeline = redis.pipeline();
        tags.forEach(tag => {
          pipeline.sadd(`tag:${tag}`, key);
          if (ttl > 0) {
            pipeline.expire(`tag:${tag}`, ttl + 300); // Tag TTL slightly longer
          }
        });
        await pipeline.exec();
      }

      console.log(`Cache SET: ${key} (TTL: ${ttl}s, Tags: ${tags.join(', ')})`);
    } catch (error) {
      console.error('Cache SET error, falling back to memory cache:', error);
      this.isRedisConnected = false;
      return fallbackCacheManager.set(key, value, options);
    }
  }

  /**
   * Retrieve data from cache with automatic decompression
   */
  async get<T = any>(key: string): Promise<T | null> {
    // Use fallback cache if Redis is not available or connected
    if (!redisAvailable || !this.isRedisConnected) {
      return fallbackCacheManager.get<T>(key);
    }

    try {
      const value = await redis.get(key);
      if (!value) return null;

      // Check if value is compressed
      const meta = await redis.hgetall(`cache:meta:${key}`);
      let serializedValue = value;

      if (meta.compressed === '1') {
        const zlib = await import('zlib');
        const compressed = Buffer.from(value, 'base64');
        serializedValue = zlib.gunzipSync(compressed).toString();
      }

      const result = JSON.parse(serializedValue);
      console.log(`Cache HIT: ${key}`);
      return result;
    } catch (error) {
      console.error('Cache GET error, falling back to memory cache:', error);
      this.isRedisConnected = false;
      return fallbackCacheManager.get<T>(key);
    }
  }

  /**
   * Delete specific cache key
   */
  async delete(key: string): Promise<void> {
    if (!redisAvailable || !this.isRedisConnected) {
      return fallbackCacheManager.delete(key);
    }

    try {
      await redis.del(key);
      await redis.del(`cache:meta:${key}`);
      console.log(`Cache DELETE: ${key}`);
    } catch (error) {
      console.error('Cache DELETE error, falling back to memory cache:', error);
      this.isRedisConnected = false;
      return fallbackCacheManager.delete(key);
    }
  }

  /**
   * Invalidate all cache entries with specific tags
   */
  async invalidateByTag(tag: string): Promise<void> {
    if (!redisAvailable || !this.isRedisConnected) {
      return fallbackCacheManager.invalidateByTag(tag);
    }

    try {
      const keys = await redis.smembers(`tag:${tag}`);
      if (keys.length > 0) {
        const pipeline = redis.pipeline();
        keys.forEach(key => {
          pipeline.del(key);
          pipeline.del(`cache:meta:${key}`);
        });
        pipeline.del(`tag:${tag}`);
        await pipeline.exec();
        console.log(`Cache INVALIDATE TAG: ${tag} (${keys.length} keys)`);
      }
    } catch (error) {
      console.error('Cache tag invalidation error, falling back to memory cache:', error);
      this.isRedisConnected = false;
      return fallbackCacheManager.invalidateByTag(tag);
    }
  }

  /**
   * Get or set pattern with automatic caching
   */
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

  /**
   * Generate cache key from object or string
   */
  generateKey(prefix: string, identifier: any): string {
    if (typeof identifier === 'string') {
      return `${prefix}:${identifier}`;
    }
    
    const hash = createHash('md5')
      .update(JSON.stringify(identifier))
      .digest('hex');
    return `${prefix}:${hash}`;
  }

  /**
   * Clear all cache (use with caution)
   */
  async clear(): Promise<void> {
    if (!redisAvailable || !this.isRedisConnected) {
      return fallbackCacheManager.clear();
    }

    try {
      await redis.flushdb();
      console.log('Cache CLEARED');
    } catch (error) {
      console.error('Cache clear error, falling back to memory cache:', error);
      this.isRedisConnected = false;
      return fallbackCacheManager.clear();
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    totalKeys: number;
    memoryUsage: string;
    hitRate: number;
  }> {
    if (!redisAvailable || !this.isRedisConnected) {
      return fallbackCacheManager.getStats();
    }

    try {
      const info = await redis.info('memory');
      const keyspace = await redis.info('keyspace');
      const stats = await redis.info('stats');
      
      const memoryMatch = info.match(/used_memory_human:([^\r\n]+)/);
      const keysMatch = keyspace.match(/keys=(\d+)/);
      const hitsMatch = stats.match(/keyspace_hits:(\d+)/);
      const missesMatch = stats.match(/keyspace_misses:(\d+)/);
      
      const hits = parseInt(hitsMatch?.[1] || '0');
      const misses = parseInt(missesMatch?.[1] || '0');
      const hitRate = hits + misses > 0 ? (hits / (hits + misses)) * 100 : 0;

      return {
        totalKeys: parseInt(keysMatch?.[1] || '0'),
        memoryUsage: memoryMatch?.[1] || 'Unknown',
        hitRate: Math.round(hitRate * 100) / 100
      };
    } catch (error) {
      console.error('Cache stats error, falling back to memory cache:', error);
      this.isRedisConnected = false;
      return fallbackCacheManager.getStats();
    }
  }
}

export const cacheManager = new CacheManager();