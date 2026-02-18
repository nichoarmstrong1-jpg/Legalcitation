import { describe, it, expect } from 'vitest';
import { validateCitationOrder } from '../bluebook/citation-order-rules.js';
import type {
  ParsedCitation,
  CaseComponents,
  StatuteComponents,
  ConstitutionComponents,
} from '@legalcitation/shared';

function mockCitation(
  overrides: Partial<ParsedCitation> & { id: string; type: ParsedCitation['type'] }
): ParsedCitation {
  return {
    rawText: '',
    context: 'citation_sentence',
    position: { start: 0, end: 0 },
    components: {},
    ...overrides,
  } as ParsedCitation;
}

describe('R. 1.4 — Citation Order Rules', () => {
  describe('authority type ordering', () => {
    it('correct order: constitution before statute before case produces no issues', () => {
      const citations = [
        mockCitation({
          id: 'const-1',
          type: 'constitution',
          components: { jurisdiction: 'U.S.', amendment: 'XIV', section: '1' } as ConstitutionComponents,
        }),
        mockCitation({
          id: 'stat-1',
          type: 'statute',
          components: { title: '42', code: 'U.S.C.', section: '1983' } as StatuteComponents,
        }),
        mockCitation({
          id: 'case-1',
          type: 'case',
          components: {
            partyOne: 'Brown',
            partyTwo: 'Board',
            volume: '347',
            reporter: 'U.S.',
            firstPage: '483',
            year: '1954',
          } as CaseComponents,
        }),
      ];

      const issueMap = validateCitationOrder(citations);
      expect(issueMap.size).toBe(0);
    });

    it('wrong order: case before statute produces an error referencing R. 1.4', () => {
      const citations = [
        mockCitation({
          id: 'case-1',
          type: 'case',
          components: {
            partyOne: 'Brown',
            partyTwo: 'Board',
            volume: '347',
            reporter: 'U.S.',
            firstPage: '483',
            year: '1954',
          } as CaseComponents,
        }),
        mockCitation({
          id: 'stat-1',
          type: 'statute',
          components: { title: '42', code: 'U.S.C.', section: '1983' } as StatuteComponents,
        }),
      ];

      const issueMap = validateCitationOrder(citations);
      expect(issueMap.size).toBeGreaterThan(0);

      const allIssues = [...issueMap.values()].flat();
      expect(allIssues.some(issue => issue.rule.includes('1.4'))).toBe(true);
    });

    it('wrong order: case before constitution produces an error', () => {
      const citations = [
        mockCitation({
          id: 'case-1',
          type: 'case',
          components: {
            partyOne: 'Brown',
            partyTwo: 'Board',
            volume: '347',
            reporter: 'U.S.',
            firstPage: '483',
            year: '1954',
          } as CaseComponents,
        }),
        mockCitation({
          id: 'const-1',
          type: 'constitution',
          components: { jurisdiction: 'U.S.', amendment: 'XIV', section: '1' } as ConstitutionComponents,
        }),
      ];

      const issueMap = validateCitationOrder(citations);
      expect(issueMap.size).toBeGreaterThan(0);
    });
  });

  describe('court hierarchy within cases', () => {
    it('correct: SCOTUS before Circuit produces no issues', () => {
      const citations = [
        mockCitation({
          id: 'scotus-1',
          type: 'case',
          components: {
            partyOne: 'Brown',
            partyTwo: 'Board',
            volume: '347',
            reporter: 'U.S.',
            firstPage: '483',
            year: '1954',
          } as CaseComponents,
        }),
        mockCitation({
          id: 'circuit-1',
          type: 'case',
          components: {
            partyOne: 'Smith',
            partyTwo: 'Jones',
            volume: '500',
            reporter: 'F.3d',
            firstPage: '100',
            court: '2d Cir.',
            year: '2007',
          } as CaseComponents,
        }),
      ];

      const issueMap = validateCitationOrder(citations);
      expect(issueMap.size).toBe(0);
    });

    it('wrong: Circuit before SCOTUS produces an error', () => {
      const citations = [
        mockCitation({
          id: 'circuit-1',
          type: 'case',
          components: {
            partyOne: 'Smith',
            partyTwo: 'Jones',
            volume: '500',
            reporter: 'F.3d',
            firstPage: '100',
            court: '2d Cir.',
            year: '2007',
          } as CaseComponents,
        }),
        mockCitation({
          id: 'scotus-1',
          type: 'case',
          components: {
            partyOne: 'Brown',
            partyTwo: 'Board',
            volume: '347',
            reporter: 'U.S.',
            firstPage: '483',
            year: '1954',
          } as CaseComponents,
        }),
      ];

      const issueMap = validateCitationOrder(citations);
      expect(issueMap.size).toBeGreaterThan(0);
    });

    it('correct: Circuit before District produces no issues', () => {
      const citations = [
        mockCitation({
          id: 'circuit-1',
          type: 'case',
          components: {
            partyOne: 'Smith',
            partyTwo: 'Jones',
            volume: '500',
            reporter: 'F.3d',
            firstPage: '100',
            court: '2d Cir.',
            year: '2007',
          } as CaseComponents,
        }),
        mockCitation({
          id: 'district-1',
          type: 'case',
          components: {
            partyOne: 'Doe',
            partyTwo: 'Roe',
            volume: '300',
            reporter: 'F. Supp. 3d',
            firstPage: '200',
            court: 'S.D.N.Y.',
            year: '2020',
          } as CaseComponents,
        }),
      ];

      const issueMap = validateCitationOrder(citations);
      expect(issueMap.size).toBe(0);
    });

    it('wrong: District before Circuit produces an error', () => {
      const citations = [
        mockCitation({
          id: 'district-1',
          type: 'case',
          components: {
            partyOne: 'Doe',
            partyTwo: 'Roe',
            volume: '300',
            reporter: 'F. Supp. 3d',
            firstPage: '200',
            court: 'S.D.N.Y.',
            year: '2020',
          } as CaseComponents,
        }),
        mockCitation({
          id: 'circuit-1',
          type: 'case',
          components: {
            partyOne: 'Smith',
            partyTwo: 'Jones',
            volume: '500',
            reporter: 'F.3d',
            firstPage: '100',
            court: '2d Cir.',
            year: '2007',
          } as CaseComponents,
        }),
      ];

      const issueMap = validateCitationOrder(citations);
      expect(issueMap.size).toBeGreaterThan(0);
    });
  });

  describe('reverse chronological within same court', () => {
    it('correct: 2020 before 2010 (same court) produces no issues', () => {
      const citations = [
        mockCitation({
          id: 'scotus-new',
          type: 'case',
          components: {
            partyOne: 'Alpha',
            partyTwo: 'Beta',
            volume: '590',
            reporter: 'U.S.',
            firstPage: '100',
            year: '2020',
          } as CaseComponents,
        }),
        mockCitation({
          id: 'scotus-old',
          type: 'case',
          components: {
            partyOne: 'Gamma',
            partyTwo: 'Delta',
            volume: '560',
            reporter: 'U.S.',
            firstPage: '200',
            year: '2010',
          } as CaseComponents,
        }),
      ];

      const issueMap = validateCitationOrder(citations);
      expect(issueMap.size).toBe(0);
    });

    it('wrong: 2010 before 2020 (same court) produces a warning or error', () => {
      const citations = [
        mockCitation({
          id: 'scotus-old',
          type: 'case',
          components: {
            partyOne: 'Gamma',
            partyTwo: 'Delta',
            volume: '560',
            reporter: 'U.S.',
            firstPage: '200',
            year: '2010',
          } as CaseComponents,
        }),
        mockCitation({
          id: 'scotus-new',
          type: 'case',
          components: {
            partyOne: 'Alpha',
            partyTwo: 'Beta',
            volume: '590',
            reporter: 'U.S.',
            firstPage: '100',
            year: '2020',
          } as CaseComponents,
        }),
      ];

      const issueMap = validateCitationOrder(citations);
      expect(issueMap.size).toBeGreaterThan(0);

      const allIssues = [...issueMap.values()].flat();
      expect(
        allIssues.some(issue => issue.severity === 'warning' || issue.severity === 'error')
      ).toBe(true);
    });
  });

  describe('short forms excluded', () => {
    it('Id. and supra are skipped during ordering validation', () => {
      const citations = [
        mockCitation({
          id: 'case-1',
          type: 'case',
          components: {
            partyOne: 'Alpha',
            partyTwo: 'Beta',
            volume: '590',
            reporter: 'U.S.',
            firstPage: '100',
            year: '2020',
          } as CaseComponents,
        }),
        mockCitation({
          id: 'id-1',
          type: 'id',
          rawText: 'Id. at 105.',
        }),
        mockCitation({
          id: 'case-2',
          type: 'case',
          components: {
            partyOne: 'Gamma',
            partyTwo: 'Delta',
            volume: '560',
            reporter: 'U.S.',
            firstPage: '200',
            year: '2010',
          } as CaseComponents,
        }),
      ];

      const issueMap = validateCitationOrder(citations);
      // The two real case citations are in correct reverse-chronological order (2020 then 2010)
      expect(issueMap.size).toBe(0);
    });
  });

  describe('empty and single citation', () => {
    it('empty array produces no issues', () => {
      const issueMap = validateCitationOrder([]);
      expect(issueMap.size).toBe(0);
    });

    it('single citation produces no issues', () => {
      const citations = [
        mockCitation({
          id: 'case-1',
          type: 'case',
          components: {
            partyOne: 'Brown',
            partyTwo: 'Board',
            volume: '347',
            reporter: 'U.S.',
            firstPage: '483',
            year: '1954',
          } as CaseComponents,
        }),
      ];

      const issueMap = validateCitationOrder(citations);
      expect(issueMap.size).toBe(0);
    });
  });
});
