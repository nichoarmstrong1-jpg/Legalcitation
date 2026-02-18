import { describe, it, expect } from 'vitest';
import { validateCrossReferences } from '../context/cross-reference-validator.js';
import type {
  ParsedCitation,
  DocumentCitationMap,
  ShortFormComponents,
  CaseComponents,
} from '@legalcitation/shared';

function mockCitation(
  overrides: Partial<ParsedCitation> & { id: string; type: ParsedCitation['type'] }
): ParsedCitation {
  return {
    rawText: '',
    context: 'citation_sentence',
    position: { start: 0, end: 0 },
    components: {
      partyOne: '',
      partyTwo: '',
      volume: '',
      reporter: '',
      firstPage: '',
      year: '',
    },
    ...overrides,
  } as ParsedCitation;
}

function buildDocMap(footnotes: Map<number, ParsedCitation[]>): DocumentCitationMap {
  const allCitations: ParsedCitation[] = [];
  for (const [, citations] of footnotes) {
    allCitations.push(...citations);
  }
  return { footnotes, allCitations, footnoteCount: footnotes.size };
}

describe('validateCrossReferences', () => {
  describe('broken Id. chains', () => {
    it('reports broken_id_chain when Id. appears in the first footnote with no prior', () => {
      const footnotes = new Map<number, ParsedCitation[]>();
      footnotes.set(1, [
        mockCitation({
          id: 'id-1',
          type: 'id',
          components: { type: 'id' } as ShortFormComponents,
          footnoteContext: { footnoteNumber: 1, positionInFootnote: 0, totalInFootnote: 1 },
        }),
      ]);

      const report = validateCrossReferences(buildDocMap(footnotes));

      const brokenChain = report.crossReferenceIssues.filter(
        (issue) => issue.type === 'broken_id_chain'
      );
      expect(brokenChain).toHaveLength(1);
      expect(brokenChain[0].citationId).toBe('id-1');
      expect(brokenChain[0].footnoteNumber).toBe(1);
    });

    it('allows Id. cross-footnote when prior footnote has one authority', () => {
      const footnotes = new Map<number, ParsedCitation[]>();
      footnotes.set(1, [
        mockCitation({
          id: 'case-1',
          type: 'case',
          components: {
            partyOne: 'Smith',
            partyTwo: 'Jones',
            volume: '500',
            reporter: 'U.S.',
            firstPage: '1',
            year: '2020',
          } as CaseComponents,
          footnoteContext: { footnoteNumber: 1, positionInFootnote: 0, totalInFootnote: 1 },
        }),
      ]);
      footnotes.set(2, [
        mockCitation({
          id: 'id-2',
          type: 'id',
          components: { type: 'id' } as ShortFormComponents,
          footnoteContext: { footnoteNumber: 2, positionInFootnote: 0, totalInFootnote: 1 },
        }),
      ]);

      const report = validateCrossReferences(buildDocMap(footnotes));

      const brokenChain = report.crossReferenceIssues.filter(
        (issue) => issue.type === 'broken_id_chain'
      );
      const ambiguous = report.crossReferenceIssues.filter(
        (issue) => issue.type === 'cross_footnote_id_ambiguous'
      );
      expect(brokenChain).toHaveLength(0);
      expect(ambiguous).toHaveLength(0);
    });

    it('reports cross_footnote_id_ambiguous when prior footnote has multiple authorities', () => {
      const footnotes = new Map<number, ParsedCitation[]>();
      footnotes.set(1, [
        mockCitation({
          id: 'case-1',
          type: 'case',
          components: {
            partyOne: 'Smith',
            partyTwo: 'Jones',
            volume: '500',
            reporter: 'U.S.',
            firstPage: '1',
            year: '2020',
          } as CaseComponents,
          footnoteContext: { footnoteNumber: 1, positionInFootnote: 0, totalInFootnote: 2 },
        }),
        mockCitation({
          id: 'case-2',
          type: 'case',
          components: {
            partyOne: 'Doe',
            partyTwo: 'Roe',
            volume: '501',
            reporter: 'U.S.',
            firstPage: '50',
            year: '2021',
          } as CaseComponents,
          footnoteContext: { footnoteNumber: 1, positionInFootnote: 1, totalInFootnote: 2 },
        }),
      ]);
      footnotes.set(2, [
        mockCitation({
          id: 'id-3',
          type: 'id',
          components: { type: 'id' } as ShortFormComponents,
          footnoteContext: { footnoteNumber: 2, positionInFootnote: 0, totalInFootnote: 1 },
        }),
      ]);

      const report = validateCrossReferences(buildDocMap(footnotes));

      const ambiguous = report.crossReferenceIssues.filter(
        (issue) => issue.type === 'cross_footnote_id_ambiguous'
      );
      expect(ambiguous).toHaveLength(1);
      expect(ambiguous[0].citationId).toBe('id-3');
      expect(ambiguous[0].footnoteNumber).toBe(2);
    });
  });

  describe('orphaned supra', () => {
    it('reports orphaned_supra when supra references a non-existent footnote', () => {
      const footnotes = new Map<number, ParsedCitation[]>();
      footnotes.set(1, [
        mockCitation({
          id: 'case-1',
          type: 'case',
          rawText: 'Smith v. Jones, 500 U.S. 1 (2020)',
          components: {
            partyOne: 'Smith',
            partyTwo: 'Jones',
            volume: '500',
            reporter: 'U.S.',
            firstPage: '1',
            year: '2020',
          } as CaseComponents,
          footnoteContext: { footnoteNumber: 1, positionInFootnote: 0, totalInFootnote: 1 },
        }),
      ]);
      footnotes.set(2, [
        mockCitation({
          id: 'filler-2',
          type: 'case',
          components: {
            partyOne: 'A',
            partyTwo: 'B',
            volume: '1',
            reporter: 'F.3d',
            firstPage: '1',
            year: '2021',
          } as CaseComponents,
          footnoteContext: { footnoteNumber: 2, positionInFootnote: 0, totalInFootnote: 1 },
        }),
      ]);
      footnotes.set(3, [
        mockCitation({
          id: 'supra-99',
          type: 'supra',
          rawText: 'Smith, supra note 99',
          components: {
            type: 'supra',
            supraNoteNumber: 99,
            partyName: 'Smith',
          } as ShortFormComponents,
          footnoteContext: { footnoteNumber: 3, positionInFootnote: 0, totalInFootnote: 1 },
        }),
      ]);

      const report = validateCrossReferences(buildDocMap(footnotes));

      const orphaned = report.crossReferenceIssues.filter(
        (issue) => issue.type === 'orphaned_supra'
      );
      expect(orphaned).toHaveLength(1);
      expect(orphaned[0].citationId).toBe('supra-99');
    });

    it('reports orphaned_supra when supra references a forward footnote', () => {
      const footnotes = new Map<number, ParsedCitation[]>();
      footnotes.set(1, [
        mockCitation({
          id: 'case-1',
          type: 'case',
          components: {
            partyOne: 'A',
            partyTwo: 'B',
            volume: '1',
            reporter: 'U.S.',
            firstPage: '1',
            year: '2020',
          } as CaseComponents,
          footnoteContext: { footnoteNumber: 1, positionInFootnote: 0, totalInFootnote: 1 },
        }),
      ]);
      footnotes.set(2, [
        mockCitation({
          id: 'supra-fwd',
          type: 'supra',
          rawText: 'Smith, supra note 5',
          components: {
            type: 'supra',
            supraNoteNumber: 5,
            partyName: 'Smith',
          } as ShortFormComponents,
          footnoteContext: { footnoteNumber: 2, positionInFootnote: 0, totalInFootnote: 1 },
        }),
      ]);
      footnotes.set(3, [
        mockCitation({
          id: 'filler-3',
          type: 'case',
          components: {
            partyOne: 'C',
            partyTwo: 'D',
            volume: '2',
            reporter: 'U.S.',
            firstPage: '2',
            year: '2021',
          } as CaseComponents,
          footnoteContext: { footnoteNumber: 3, positionInFootnote: 0, totalInFootnote: 1 },
        }),
      ]);
      footnotes.set(4, [
        mockCitation({
          id: 'filler-4',
          type: 'case',
          components: {
            partyOne: 'E',
            partyTwo: 'F',
            volume: '3',
            reporter: 'U.S.',
            firstPage: '3',
            year: '2022',
          } as CaseComponents,
          footnoteContext: { footnoteNumber: 4, positionInFootnote: 0, totalInFootnote: 1 },
        }),
      ]);
      footnotes.set(5, [
        mockCitation({
          id: 'case-5',
          type: 'case',
          rawText: 'Smith v. Jones, 500 U.S. 1 (2020)',
          components: {
            partyOne: 'Smith',
            partyTwo: 'Jones',
            volume: '500',
            reporter: 'U.S.',
            firstPage: '1',
            year: '2020',
          } as CaseComponents,
          footnoteContext: { footnoteNumber: 5, positionInFootnote: 0, totalInFootnote: 1 },
        }),
      ]);

      const report = validateCrossReferences(buildDocMap(footnotes));

      const orphaned = report.crossReferenceIssues.filter(
        (issue) => issue.type === 'orphaned_supra'
      );
      expect(orphaned).toHaveLength(1);
      expect(orphaned[0].citationId).toBe('supra-fwd');
    });

    it('does not report orphaned_supra for a valid backward supra reference', () => {
      const footnotes = new Map<number, ParsedCitation[]>();
      footnotes.set(2, [
        mockCitation({
          id: 'case-2',
          type: 'case',
          rawText: 'Smith v. Jones, 500 U.S. 1 (2020)',
          components: {
            partyOne: 'Smith',
            partyTwo: 'Jones',
            volume: '500',
            reporter: 'U.S.',
            firstPage: '1',
            year: '2020',
          } as CaseComponents,
          footnoteContext: { footnoteNumber: 2, positionInFootnote: 0, totalInFootnote: 1 },
        }),
      ]);
      footnotes.set(3, [
        mockCitation({
          id: 'filler-3',
          type: 'case',
          components: {
            partyOne: 'A',
            partyTwo: 'B',
            volume: '1',
            reporter: 'U.S.',
            firstPage: '1',
            year: '2021',
          } as CaseComponents,
          footnoteContext: { footnoteNumber: 3, positionInFootnote: 0, totalInFootnote: 1 },
        }),
      ]);
      footnotes.set(4, [
        mockCitation({
          id: 'filler-4',
          type: 'case',
          components: {
            partyOne: 'C',
            partyTwo: 'D',
            volume: '2',
            reporter: 'U.S.',
            firstPage: '2',
            year: '2022',
          } as CaseComponents,
          footnoteContext: { footnoteNumber: 4, positionInFootnote: 0, totalInFootnote: 1 },
        }),
      ]);
      footnotes.set(5, [
        mockCitation({
          id: 'supra-valid',
          type: 'supra',
          rawText: 'Smith, supra note 2',
          components: {
            type: 'supra',
            supraNoteNumber: 2,
            partyName: 'Smith',
          } as ShortFormComponents,
          footnoteContext: { footnoteNumber: 5, positionInFootnote: 0, totalInFootnote: 1 },
        }),
      ]);

      const report = validateCrossReferences(buildDocMap(footnotes));

      const orphaned = report.crossReferenceIssues.filter(
        (issue) => issue.type === 'orphaned_supra'
      );
      expect(orphaned).toHaveLength(0);
    });
  });

  describe('orphaned infra', () => {
    it('reports orphaned_infra when infra references a backward footnote', () => {
      const footnotes = new Map<number, ParsedCitation[]>();
      footnotes.set(1, [
        mockCitation({
          id: 'filler-1',
          type: 'case',
          components: {
            partyOne: 'A',
            partyTwo: 'B',
            volume: '1',
            reporter: 'U.S.',
            firstPage: '1',
            year: '2020',
          } as CaseComponents,
          footnoteContext: { footnoteNumber: 1, positionInFootnote: 0, totalInFootnote: 1 },
        }),
      ]);
      footnotes.set(2, [
        mockCitation({
          id: 'filler-2',
          type: 'case',
          components: {
            partyOne: 'C',
            partyTwo: 'D',
            volume: '2',
            reporter: 'U.S.',
            firstPage: '2',
            year: '2021',
          } as CaseComponents,
          footnoteContext: { footnoteNumber: 2, positionInFootnote: 0, totalInFootnote: 1 },
        }),
      ]);
      footnotes.set(3, [
        mockCitation({
          id: 'filler-3',
          type: 'case',
          components: {
            partyOne: 'E',
            partyTwo: 'F',
            volume: '3',
            reporter: 'U.S.',
            firstPage: '3',
            year: '2022',
          } as CaseComponents,
          footnoteContext: { footnoteNumber: 3, positionInFootnote: 0, totalInFootnote: 1 },
        }),
      ]);
      footnotes.set(4, [
        mockCitation({
          id: 'filler-4',
          type: 'case',
          components: {
            partyOne: 'G',
            partyTwo: 'H',
            volume: '4',
            reporter: 'U.S.',
            firstPage: '4',
            year: '2023',
          } as CaseComponents,
          footnoteContext: { footnoteNumber: 4, positionInFootnote: 0, totalInFootnote: 1 },
        }),
      ]);
      footnotes.set(5, [
        mockCitation({
          id: 'infra-back',
          type: 'infra',
          rawText: 'See infra note 2',
          components: {
            type: 'id',
            infraNoteNumber: 2,
          } as ShortFormComponents,
          footnoteContext: { footnoteNumber: 5, positionInFootnote: 0, totalInFootnote: 1 },
        }),
      ]);

      const report = validateCrossReferences(buildDocMap(footnotes));

      const orphaned = report.crossReferenceIssues.filter(
        (issue) => issue.type === 'orphaned_infra'
      );
      expect(orphaned).toHaveLength(1);
      expect(orphaned[0].citationId).toBe('infra-back');
    });

    it('reports orphaned_infra when infra references a non-existent footnote', () => {
      const footnotes = new Map<number, ParsedCitation[]>();
      footnotes.set(1, [
        mockCitation({
          id: 'filler-1',
          type: 'case',
          components: {
            partyOne: 'A',
            partyTwo: 'B',
            volume: '1',
            reporter: 'U.S.',
            firstPage: '1',
            year: '2020',
          } as CaseComponents,
          footnoteContext: { footnoteNumber: 1, positionInFootnote: 0, totalInFootnote: 1 },
        }),
      ]);
      footnotes.set(2, [
        mockCitation({
          id: 'infra-99',
          type: 'infra',
          rawText: 'See infra note 99',
          components: {
            type: 'id',
            infraNoteNumber: 99,
          } as ShortFormComponents,
          footnoteContext: { footnoteNumber: 2, positionInFootnote: 0, totalInFootnote: 1 },
        }),
      ]);

      const report = validateCrossReferences(buildDocMap(footnotes));

      const orphaned = report.crossReferenceIssues.filter(
        (issue) => issue.type === 'orphaned_infra'
      );
      expect(orphaned).toHaveLength(1);
      expect(orphaned[0].citationId).toBe('infra-99');
    });
  });

  describe('hereinafter tracking', () => {
    it('reports unused_hereinafter when designation is established but never used', () => {
      const footnotes = new Map<number, ParsedCitation[]>();
      footnotes.set(1, [
        mockCitation({
          id: 'herein-1',
          type: 'case',
          rawText: 'U.N. Envtl. Programme, Global Report on Pollution [hereinafter Report]',
          components: {
            partyOne: 'U.N. Envtl. Programme',
            partyTwo: '',
            volume: '',
            reporter: '',
            firstPage: '',
            year: '2023',
          } as CaseComponents,
          footnoteContext: { footnoteNumber: 1, positionInFootnote: 0, totalInFootnote: 1 },
        }),
      ]);
      footnotes.set(2, [
        mockCitation({
          id: 'unrelated-2',
          type: 'case',
          rawText: 'Smith v. Jones, 500 U.S. 1 (2020)',
          components: {
            partyOne: 'Smith',
            partyTwo: 'Jones',
            volume: '500',
            reporter: 'U.S.',
            firstPage: '1',
            year: '2020',
          } as CaseComponents,
          footnoteContext: { footnoteNumber: 2, positionInFootnote: 0, totalInFootnote: 1 },
        }),
      ]);

      const report = validateCrossReferences(buildDocMap(footnotes));

      const unused = report.crossReferenceIssues.filter(
        (issue) => issue.type === 'unused_hereinafter'
      );
      expect(unused).toHaveLength(1);
      expect(unused[0].citationId).toBe('herein-1');
    });

    it('does not report unused_hereinafter when designation is used via supra', () => {
      const footnotes = new Map<number, ParsedCitation[]>();
      footnotes.set(1, [
        mockCitation({
          id: 'herein-1',
          type: 'case',
          rawText: 'U.N. Envtl. Programme, Global Report on Pollution [hereinafter Report]',
          components: {
            partyOne: 'U.N. Envtl. Programme',
            partyTwo: '',
            volume: '',
            reporter: '',
            firstPage: '',
            year: '2023',
          } as CaseComponents,
          footnoteContext: { footnoteNumber: 1, positionInFootnote: 0, totalInFootnote: 1 },
        }),
      ]);
      footnotes.set(2, [
        mockCitation({
          id: 'filler-2',
          type: 'case',
          rawText: 'Smith v. Jones, 500 U.S. 1 (2020)',
          components: {
            partyOne: 'Smith',
            partyTwo: 'Jones',
            volume: '500',
            reporter: 'U.S.',
            firstPage: '1',
            year: '2020',
          } as CaseComponents,
          footnoteContext: { footnoteNumber: 2, positionInFootnote: 0, totalInFootnote: 1 },
        }),
      ]);
      footnotes.set(3, [
        mockCitation({
          id: 'filler-3',
          type: 'case',
          components: {
            partyOne: 'A',
            partyTwo: 'B',
            volume: '1',
            reporter: 'U.S.',
            firstPage: '1',
            year: '2021',
          } as CaseComponents,
          footnoteContext: { footnoteNumber: 3, positionInFootnote: 0, totalInFootnote: 1 },
        }),
      ]);
      footnotes.set(4, [
        mockCitation({
          id: 'filler-4',
          type: 'case',
          components: {
            partyOne: 'C',
            partyTwo: 'D',
            volume: '2',
            reporter: 'U.S.',
            firstPage: '2',
            year: '2022',
          } as CaseComponents,
          footnoteContext: { footnoteNumber: 4, positionInFootnote: 0, totalInFootnote: 1 },
        }),
      ]);
      footnotes.set(5, [
        mockCitation({
          id: 'supra-report',
          type: 'supra',
          rawText: 'Report, supra note 1',
          components: {
            type: 'supra',
            supraNoteNumber: 1,
            partyName: 'Report',
          } as ShortFormComponents,
          footnoteContext: { footnoteNumber: 5, positionInFootnote: 0, totalInFootnote: 1 },
        }),
      ]);

      const report = validateCrossReferences(buildDocMap(footnotes));

      const unused = report.crossReferenceIssues.filter(
        (issue) => issue.type === 'unused_hereinafter'
      );
      expect(unused).toHaveLength(0);
    });
  });

  describe('report metadata', () => {
    it('returns correct totalCitations and totalFootnotes counts', () => {
      const footnotes = new Map<number, ParsedCitation[]>();
      footnotes.set(1, [
        mockCitation({
          id: 'c-1',
          type: 'case',
          components: {
            partyOne: 'A',
            partyTwo: 'B',
            volume: '1',
            reporter: 'U.S.',
            firstPage: '1',
            year: '2020',
          } as CaseComponents,
          footnoteContext: { footnoteNumber: 1, positionInFootnote: 0, totalInFootnote: 2 },
        }),
        mockCitation({
          id: 'c-2',
          type: 'case',
          components: {
            partyOne: 'C',
            partyTwo: 'D',
            volume: '2',
            reporter: 'U.S.',
            firstPage: '2',
            year: '2021',
          } as CaseComponents,
          footnoteContext: { footnoteNumber: 1, positionInFootnote: 1, totalInFootnote: 2 },
        }),
      ]);
      footnotes.set(2, [
        mockCitation({
          id: 'c-3',
          type: 'case',
          components: {
            partyOne: 'E',
            partyTwo: 'F',
            volume: '3',
            reporter: 'U.S.',
            firstPage: '3',
            year: '2022',
          } as CaseComponents,
          footnoteContext: { footnoteNumber: 2, positionInFootnote: 0, totalInFootnote: 1 },
        }),
      ]);
      footnotes.set(3, [
        mockCitation({
          id: 'c-4',
          type: 'case',
          components: {
            partyOne: 'G',
            partyTwo: 'H',
            volume: '4',
            reporter: 'U.S.',
            firstPage: '4',
            year: '2023',
          } as CaseComponents,
          footnoteContext: { footnoteNumber: 3, positionInFootnote: 0, totalInFootnote: 1 },
        }),
      ]);

      const report = validateCrossReferences(buildDocMap(footnotes));

      expect(report.totalCitations).toBe(4);
      expect(report.totalFootnotes).toBe(3);
      expect(report.citationOrderIssues).toEqual([]);
    });
  });
});
