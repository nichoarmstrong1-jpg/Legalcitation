import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CaseComponents } from '@legalcitation/shared';
import { cachedVerifyCaseCitation } from '../verification-cache.js';
import { verifyCaseCitation } from '@legalcitation/verification';

vi.mock('@legalcitation/verification', () => ({
  verifyCaseCitation: vi.fn(),
}));

const mockVerifyCaseCitation = vi.mocked(verifyCaseCitation);

describe('cachedVerifyCaseCitation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('re-verifies the same citation input on every call', async () => {
    const components: CaseComponents = {
      partyOne: 'Roe',
      partyTwo: 'Wade',
      volume: '410',
      reporter: 'U.S.',
      firstPage: '113',
      year: '1973',
    };

    mockVerifyCaseCitation.mockResolvedValue({
      status: 'verified',
      discrepancies: [],
      referenceExamples: [],
      logicTrace: ['verified live'],
      verifiedCitation: 'Roe v. Wade, 410 U.S. 113 (1973).',
      provider: 'mock',
      confidence: 1,
    });

    await cachedVerifyCaseCitation(components);
    await cachedVerifyCaseCitation(components);

    expect(mockVerifyCaseCitation).toHaveBeenCalledTimes(2);
    expect(mockVerifyCaseCitation).toHaveBeenNthCalledWith(1, components);
    expect(mockVerifyCaseCitation).toHaveBeenNthCalledWith(2, components);
  });
});
