import type { Request, Response, NextFunction } from 'express';
import { verifyToken, type TokenPayload } from '../services/jwt.js';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

const COOKIE_NAME = 'legalcitation_token';

/**
 * Requires a valid JWT. Returns 401 if not authenticated.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[COOKIE_NAME] || extractBearerToken(req);

  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Attaches user to request if a valid JWT exists, but doesn't block.
 * Use this for endpoints that work for both anonymous and authenticated users.
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[COOKIE_NAME] || extractBearerToken(req);

  if (token) {
    try {
      req.user = verifyToken(token);
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
