import Redis from 'ioredis';

// Redis Configuration for Healthcare Data
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  connectTimeout: 10000,
  commandTimeout: 5000,
  enableOfflineQueue: false,
  retryDelayOnClusterDown: 300,
});

let redisConnectionAttempts = 0;
const maxConnectionAttempts = 5;

// Connection event handlers
redis.on('connect', () => {
  console.log('Redis connected successfully');
  redisConnectionAttempts = 0;
});

redis.on('error', (err) => {
  redisConnectionAttempts++;
  if (redisConnectionAttempts <= maxConnectionAttempts) {
    console.log(`Redis connection attempt ${redisConnectionAttempts}/${maxConnectionAttempts} failed. Falling back to in-memory cache.`);
  }
  
  // Stop trying to reconnect after max attempts
  if (redisConnectionAttempts >= maxConnectionAttempts) {
    console.log('Redis unavailable - using fallback cache system');
    redis.disconnect();
  }
});

redis.on('ready', () => {
  console.log('Redis is ready for operations');
});

redis.on('reconnecting', () => {
  if (redisConnectionAttempts < maxConnectionAttempts) {
    console.log(`Redis reconnecting... (attempt ${redisConnectionAttempts + 1}/${maxConnectionAttempts})`);
  }
});

export { redis };
export default redis;