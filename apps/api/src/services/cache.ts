import { tryGetRedis } from './redis.js';

export async function getCached<T>(key: string): Promise<T | null> {
  const redis = await tryGetRedis();
  if (!redis) return null;

  try {
    const val = await redis.get(key);
    return val ? JSON.parse(val) as T : null;
  } catch {
    return null;
  }
}

export async function setCache(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  const redis = await tryGetRedis();
  if (!redis) return;

  try {
    await redis.set(key, JSON.stringify(value), { EX: ttlSeconds });
  } catch {
    // Non-critical
  }
}

export async function invalidateCache(key: string): Promise<void> {
  const redis = await tryGetRedis();
  if (!redis) return;

  try {
    await redis.del(key);
  } catch {
    // Non-critical
  }
}
