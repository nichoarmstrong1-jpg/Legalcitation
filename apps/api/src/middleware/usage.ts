import type { Request, Response, NextFunction } from 'express';

const FREE_CHECK_LIMIT = 5;
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// In-memory anonymous usage tracking (will be replaced by Redis in production)
const anonymousUsage = new Map<string, { count: number; firstSeen: number }>();
let lastCleanup = Date.now();

function getClientKey(req: Request): string {
  // Use IP + user-agent hash as anonymous identifier
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const ua = req.headers['user-agent'] || '';
  return `${ip}::${ua.slice(0, 50)}`;
}

/** Periodically clean up old entries to prevent unbounded Map growth. */
function cleanupIfNeeded() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  const cutoff = now - MAX_AGE_MS;
  for (const [k, v] of anonymousUsage) {
    if (v.firstSeen < cutoff) anonymousUsage.delete(k);
  }
}

/**
 * Tracks citation check usage and enforces free-tier limits.
 * - Anonymous users: 5 lifetime checks, tracked by IP
 * - Authenticated users: limits based on plan (handled via DB in future)
 *
 * Sets X-Checks-Remaining header for frontend to read.
 */
export function trackUsage(req: Request, res: Response, next: NextFunction) {
  // Authenticated users pass through (plan limits enforced separately)
  if (req.user) {
    res.setHeader('X-Checks-Remaining', '-1'); // -1 = unlimited/plan-based
    next();
    return;
  }

  // Run periodic cleanup
  cleanupIfNeeded();

  // Anonymous user — track usage
  const key = getClientKey(req);
  let usage = anonymousUsage.get(key);

  if (!usage) {
    usage = { count: 0, firstSeen: Date.now() };
    anonymousUsage.set(key, usage);
  }

  const remaining = Math.max(0, FREE_CHECK_LIMIT - usage.count);
  res.setHeader('X-Checks-Remaining', String(remaining));

  if (usage.count >= FREE_CHECK_LIMIT) {
    res.status(403).json({
      error: 'account_required',
      message: "You've used your 5 free checks. Sign up to keep going!",
      checksUsed: usage.count,
    });
    return;
  }

  // Increment after validation passes (will be called after successful response)
  // Use a flag to prevent double-counting if res.json is called multiple times
  let counted = false;
  const originalJson = res.json.bind(res);
  res.json = function (body: unknown) {
    if (!counted && res.statusCode < 400) {
      counted = true;
      usage!.count++;
      res.setHeader('X-Checks-Remaining', String(Math.max(0, FREE_CHECK_LIMIT - usage!.count)));
    }
    return originalJson(body);
  };

  next();
}
