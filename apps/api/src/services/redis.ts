import { createClient, type RedisClientType } from 'redis';

let client: RedisClientType | null = null;
let connectionFailed = false;

export async function getRedisClient(): Promise<RedisClientType | null> {
  if (!process.env.REDIS_URL) return null;
  if (connectionFailed) return null;

  if (!client) {
    try {
      client = createClient({ url: process.env.REDIS_URL });
      client.on('error', (err) => {
        console.error('Redis error:', err);
        connectionFailed = true;
        client = null;
      });
      await client.connect();
    } catch (err) {
      console.error('Redis connection failed:', err);
      connectionFailed = true;
      client = null;
      return null;
    }
  }

  return client;
}

export async function tryGetRedis(): Promise<RedisClientType | null> {
  try {
    return await getRedisClient();
  } catch {
    return null;
  }
}
