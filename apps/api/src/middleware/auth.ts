import type { Request, Response, NextFunction } from 'express';
import { verifyToken, type TokenPayload } from '../services/jwt.js';
import { tryGetRedis } from '../services/redis.js';

// Extend Express Request to include user
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

const COOKIE_NAME = 'legalcitation_token';
const TOKEN_CACHE_TTL = 900; // 15 minutes

async function getCachedPayload(token: string): Promise<TokenPayload | null> {
  const redis = await tryGetRedis();
  if (!redis) return null;

  try {
    const cached = await redis.get(`token:${token}`);
    return cached ? JSON.parse(cached) as TokenPayload : null;
  } catch {
    return null;
  }
}

async function cachePayload(token: string, payload: TokenPayload): Promise<void> {
  const redis = await tryGetRedis();
  if (!redis) return;

  try {
    await redis.set(`token:${token}`, JSON.stringify(payload), { EX: TOKEN_CACHE_TTL });
  } catch {
    // Non-critical
  }
}

async function verifyTokenWithCache(token: string): Promise<TokenPayload> {
  const cached = await getCachedPayload(token);
  if (cached) return cached;

  const payload = verifyToken(token);
  // Fire and forget cache write
  cachePayload(token, payload).catch(() => {});
  return payload;
}

/**
 * Requires a valid JWT. Returns 401 if not authenticated.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[COOKIE_NAME] || extractBearerToken(req);

  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    req.user = await verifyTokenWithCache(token);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Attaches user to request if a valid JWT exists, but doesn't block.
 * Use this for endpoints that work for both anonymous and authenticated users.
 */
export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[COOKIE_NAME] || extractBearerToken(req);

  if (token) {
    try {
      req.user = await verifyTokenWithCache(token);
    } catch {
      // Token invalid — treat as anonymous
    }
  }
  next();
}

function extractBearerToken(req: Request): string | null {
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) {
    return auth.slice(7);
  }
  return null;
}

export { COOKIE_NAME };
