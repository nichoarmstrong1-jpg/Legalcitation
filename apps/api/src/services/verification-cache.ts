import { createHash } from 'crypto';
import { eq, lt } from 'drizzle-orm';
import type { CaseComponents } from '@legalcitation/shared';
import { verifyCaseCitation, type FullVerificationResult } from '@legalcitation/verification';
import { tryGetDb, schema } from '../db/index.js';

const CACHE_TTL_DAYS = 7;
const CACHE_TTL_MS = CACHE_TTL_DAYS * 24 * 60 * 60 * 1000;

// In-memory cache fallback when no database is available
const memoryCache = new Map<string, { result: FullVerificationResult; expiresAt: number }>();

/**
 * Generate a normalized cache key from citation components.
 * Normalizes casing and whitespace so equivalent citations share a cache entry.
 */
function makeCacheKey(components: CaseComponents): string {
  const normalized = [
    (components.partyOne || '').toLowerCase().trim(),
    (components.partyTwo || '').toLowerCase().trim(),
    (components.volume || '').trim(),
    (components.reporter || '').toLowerCase().trim(),
    (components.firstPage || '').trim(),
    (components.year || '').trim(),
  ].join('|');

  return createHash('sha256').update(normalized).digest('hex');
}

/**
 * Verify a case citation with caching (DB if available, otherwise in-memory).
 * Shared across all users — one verification benefits everyone.
 */
export async function cachedVerifyCaseCitation(
  components: CaseComponents
): Promise<FullVerificationResult> {
  const cacheKey = makeCacheKey(components);

  // Step 1: Check DB cache
  const db = tryGetDb();
  if (db) {
    try {
      const [cached] = await db.select()
        .from(schema.verificationCache)
        .where(eq(schema.verificationCache.cacheKey, cacheKey))
        .limit(1);

      if (cached && cached.expiresAt > new Date()) {
        const result = cached.result as FullVerificationResult;
        return {
          ...result,
          logicTrace: ['Retrieved from verification cache.', ...result.logicTrace],
        };
      }
    } catch {
      // DB unavailable — fall through to memory cache
    }
  }

  // Step 1b: Check in-memory cache
  const memCached = memoryCache.get(cacheKey);
  if (memCached && memCached.expiresAt > Date.now()) {
    return {
      ...memCached.result,
      logicTrace: ['Retrieved from memory cache.', ...memCached.result.logicTrace],
    };
  }

  // Step 2: Cache miss — verify normally
  const result = await verifyCaseCitation(components);

  // Step 3: Store in cache (only cache verified/partial results, not errors)
  if (result.status === 'verified' || result.status === 'partial_match') {
    // Store in memory cache always
    memoryCache.set(cacheKey, { result, expiresAt: Date.now() + CACHE_TTL_MS });

    // Clean memory cache if it gets too large
    if (memoryCache.size > 1000) {
      const now = Date.now();
      for (const [k, v] of memoryCache) {
        if (v.expiresAt < now) memoryCache.delete(k);
      }
    }

    // Store in DB cache if available
    if (db) {
      try {
        const expiresAt = new Date(Date.now() + CACHE_TTL_MS);
        await db.insert(schema.verificationCache)
          .values({
            cacheKey,
            result: result as any,
            provider: result.provider,
            expiresAt,
          })
          .onConflictDoUpdate({
            target: schema.verificationCache.cacheKey,
            set: {
              result: result as any,
              provider: result.provider,
              expiresAt,
            },
          });
      } catch {
        // Cache write failed — non-critical
      }
    }
  }

  return result;
}

/**
 * Clean up expired cache entries. Run periodically.
 */
export async function cleanExpiredCache(): Promise<number> {
  try {
    const db = tryGetDb();
    if (!db) return 0;
    await db.delete(schema.verificationCache)
      .where(lt(schema.verificationCache.expiresAt, new Date()));
    return 0;
  } catch {
    return 0;
  }
}
