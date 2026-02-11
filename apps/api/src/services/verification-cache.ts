import { createHash } from 'crypto';
import { eq, lt } from 'drizzle-orm';
import type { CaseComponents } from '@legalcitation/shared';
import { verifyCaseCitation, type FullVerificationResult } from '@legalcitation/verification';
import { getDb, schema } from '../db/index.js';

const CACHE_TTL_DAYS = 7;

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
 * Verify a case citation with database caching.
 * Checks cache first; on miss, calls verifyCaseCitation and stores result.
 * Shared across all users — one verification benefits everyone.
 */
export async function cachedVerifyCaseCitation(
  components: CaseComponents
): Promise<FullVerificationResult> {
  const cacheKey = makeCacheKey(components);

  // Step 1: Check cache
  try {
    const db = getDb();
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
    // DB unavailable — proceed without cache
  }

  // Step 2: Cache miss — verify normally
  const result = await verifyCaseCitation(components);

  // Step 3: Store in cache (only cache verified/partial results, not errors)
  if (result.status === 'verified' || result.status === 'partial_match') {
    try {
      const db = getDb();
      const expiresAt = new Date(Date.now() + CACHE_TTL_DAYS * 24 * 60 * 60 * 1000);

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

  return result;
}

/**
 * Clean up expired cache entries. Run periodically.
 */
export async function cleanExpiredCache(): Promise<number> {
  try {
    const db = getDb();
    const deleted = await db.delete(schema.verificationCache)
      .where(lt(schema.verificationCache.expiresAt, new Date()));
    return 0; // drizzle delete doesn't return count easily
  } catch {
    return 0;
  }
}
