import type { CaseComponents } from '@legalcitation/shared';
import { verifyCaseCitation, type FullVerificationResult } from '@legalcitation/verification';
import { eq, lt } from 'drizzle-orm';
import { tryGetDb } from '../db/index.js';
import { verificationCache } from '../db/schema.js';

const CACHE_TTL_HOURS = 24;

const memoryCache = new Map<string, { result: FullVerificationResult; expiresAt: number }>();
const MAX_MEMORY_CACHE_SIZE = 500;

function buildCacheKey(components: CaseComponents): string {
  const parts = [
    components.volume?.trim(),
    components.reporter?.trim(),
    components.firstPage?.trim(),
  ].filter(Boolean);

  if (parts.length < 3) {
    const caseName = components.partyTwo
      ? `${components.partyOne} v. ${components.partyTwo}`
      : components.partyOne;
    return `name:${caseName.toLowerCase().replace(/\s+/g, '-')}:${components.year || ''}`;
  }

  return `cite:${parts.join(':')}`;
}

/**
 * Verify a case citation with caching.
 * Check in-memory cache -> DB cache -> fresh verification.
 * Results are cached for 24 hours.
 */
export async function cachedVerifyCaseCitation(
  components: CaseComponents,
): Promise<FullVerificationResult> {
  const key = buildCacheKey(components);
  const now = Date.now();

  // Layer 1: In-memory cache
  const memEntry = memoryCache.get(key);
  if (memEntry && memEntry.expiresAt > now) {
    return memEntry.result;
  }

  // Layer 2: Database cache
  const db = tryGetDb();
  if (db) {
    try {
      const [row] = await db
        .select()
        .from(verificationCache)
        .where(eq(verificationCache.cacheKey, key))
        .limit(1);

      if (row && row.expiresAt.getTime() > now) {
        const result = row.result as FullVerificationResult;
        memoryCache.set(key, { result, expiresAt: row.expiresAt.getTime() });
        return result;
      }
    } catch (err) {
      console.error('[verification-cache] DB read error:', err);
    }
  }

  // Layer 3: Fresh verification
  const result = await verifyCaseCitation(components);

  // Store in memory cache
  const expiresAt = now + CACHE_TTL_HOURS * 60 * 60 * 1000;
  memoryCache.set(key, { result, expiresAt });

  // Evict oldest entries if memory cache is too large
  if (memoryCache.size > MAX_MEMORY_CACHE_SIZE) {
    const entries = [...memoryCache.entries()];
    entries.sort((a, b) => a[1].expiresAt - b[1].expiresAt);
    for (let i = 0; i < entries.length - MAX_MEMORY_CACHE_SIZE; i++) {
      memoryCache.delete(entries[i][0]);
    }
  }

  // Store in database cache
  if (db) {
    try {
      await db
        .insert(verificationCache)
        .values({
          cacheKey: key,
          result: result as unknown as Record<string, unknown>,
          provider: result.provider,
          expiresAt: new Date(expiresAt),
        })
        .onConflictDoUpdate({
          target: verificationCache.cacheKey,
          set: {
            result: result as unknown as Record<string, unknown>,
            provider: result.provider,
            expiresAt: new Date(expiresAt),
          },
        });
    } catch (err) {
      console.error('[verification-cache] DB write error:', err);
    }
  }

  return result;
}

/**
 * Clean up expired cache entries. Run periodically.
 */
export async function cleanExpiredCache(): Promise<number> {
  const db = tryGetDb();
  if (!db) return 0;

  try {
    const deleted = await db
      .delete(verificationCache)
      .where(lt(verificationCache.expiresAt, new Date()));
    return (deleted as { rowCount?: number }).rowCount ?? 0;
  } catch (err) {
    console.error('[verification-cache] Cleanup error:', err);
    return 0;
  }
}
