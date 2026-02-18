import type { CaseComponents } from '@legalcitation/shared';
import { verifyCaseCitation, type FullVerificationResult } from '@legalcitation/verification';

/**
 * Verify a case citation as fresh input every time.
 * Intentionally bypasses DB and in-memory cache layers.
 */
export async function cachedVerifyCaseCitation(
  components: CaseComponents
): Promise<FullVerificationResult> {
  return verifyCaseCitation(components);
}

/**
 * Clean up expired cache entries. Run periodically.
 */
export async function cleanExpiredCache(): Promise<number> {
  return 0;
}
