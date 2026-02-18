import { describe, it, expect } from 'vitest';
import type { AnalyzedCitation } from '../services/api.ts';
import { tokenizeMarkedText, buildSafeCitationReplacements } from './CitationChecker.tsx';

function buildMockCitation(
  start: number,
  end: number,
  verifiedCitation: string
): AnalyzedCitation {
  return {
    parsed: {
      id: `${start}-${end}`,
      rawText: '',
      type: 'case',
      context: 'citation_sentence',
      position: { start, end },
      components: {
        partyOne: 'A',
        partyTwo: 'B',
        volume: '1',
        reporter: 'U.S.',
        firstPage: '1',
        year: '2000',
      },
    },
    issues: [],
    verificationStatus: 'pending',
    verifiedCitation,
    discrepancies: [],
    referenceExamples: [],
    logicTrace: [],
    score: 100,
  };
}

describe('CitationChecker helpers', () => {
  it('tokenizes marker-formatted text without exposing markers', () => {
    const tokens = tokenizeMarkedText('Before *Alpha v. Beta* and _Id._ after');
    expect(tokens).toEqual([
      { text: 'Before ', type: 'plain' },
      { text: 'Alpha v. Beta', type: 'asterisk' },
      { text: ' and ', type: 'plain' },
      { text: 'Id.', type: 'underscore' },
      { text: ' after', type: 'plain' },
    ]);
  });

  it('builds only safe, non-overlapping replacements', () => {
    const sourceText = 'one two three four five';
    const results: AnalyzedCitation[] = [
      buildMockCitation(4, 7, '*TWO*'),
      buildMockCitation(6, 11, '*OVERLAP*'),
      buildMockCitation(14, 18, '_FOUR_'),
    ];
    const accepted = new Set([0, 1, 2]);

    const safe = buildSafeCitationReplacements(sourceText, results, accepted);
    expect(safe).toEqual([
      { start: 4, end: 7, replacement: 'TWO' },
      { start: 14, end: 18, replacement: 'FOUR' },
    ]);
  });
});
