import { Redis } from '@upstash/redis';
import type { RedisConfig } from './types.js';

/**
 * Create a Redis client instance with Upstash
 */
export function createRedisClient(config?: RedisConfig): Redis {
  const url = config?.url || process.env.UPSTASH_REDIS_REST_URL;
  const token = config?.token || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error('Redis URL and token are required. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables.');
  }

  return new Redis({
    url,
    token,
  });
}

// Default Redis client instance
export const redis = createRedisClient();