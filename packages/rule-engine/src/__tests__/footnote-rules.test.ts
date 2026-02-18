import { describe, it, expect } from 'vitest';
import { validateFootnoteContext } from '../context/footnote-rules.js';
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
    components: { partyOne: '', partyTwo: '', volume: '', reporter: '', firstPage: '', year: '' },
    ...overrides,
  } as ParsedCitation;
}

function buildDocMap(
  footnotes: Map<number, ParsedCitation[]>,
  footnoteCount?: number
): DocumentCitationMap {
  const allCitations: ParsedCitation[] = [];
  const sortedKeys = Array.from(footnotes.keys()).sort((a, b) => a - b);
  for (const key of sortedKeys) {
    const citations = footnotes.get(key);
    if (citations) allCitations.push(...citations);
  }
  return {
    footnotes,
    allCitations,
    footnoteCount: footnoteCount ?? Math.max(0, ...footnotes.keys()),
  };
}

describe('validateFootnoteContext', () => {
  describe('Id. across footnote boundaries', () => {
    it('allows valid Id. cross-footnote when preceding footnote has one authority', () => {
      const caseCitation = mockCitation({
        id: 'case-1',
        type: 'case',
        rawText: 'Smith v. Jones, 500 U.S. 100 (1990)',
        components: {
          partyOne: 'Smith',
          partyTwo: 'Jones',
          volume: '500',
          reporter: 'U.S.',
          firstPage: '100',
          year: '1990',
        } as CaseComponents,
        footnoteContext: { footnoteNumber: 1, positionInFootnote: 0, totalInFootnote: 1 },
      });

      const idCitation = mockCitation({
        id: 'id-1',
        type: 'id',
        rawText: 'Id. at 105',
        components: { type: 'id', pinCite: '105' } as ShortFormComponents,
        footnoteContext: { footnoteNumber: 2, positionInFootnote: 0, totalInFootnote: 1 },
      });

      const footnotes = new Map<number, ParsedCitation[]>([
        [1, [caseCitation]],
        [2, [idCitation]],
      ]);

      const issues = validateFootnoteContext(buildDocMap(footnotes));
      const idIssues = issues.get('id-1') ?? [];
      const errors = idIssues.filter((i) => i.severity === 'error');
      expect(errors).toHaveLength(0);
    });

    it('flags ambiguous Id. when preceding footnote has multiple authorities', () => {
      const case1 = mockCitation({
        id: 'case-1',
        type: 'case',
        rawText: 'Smith v. Jones, 500 U.S. 100 (1990)',
        components: {
          partyOne: 'Smith',
          partyTwo: 'Jones',
          volume: '500',
          reporter: 'U.S.',
          firstPage: '100',
          year: '1990',
        } as CaseComponents,
        footnoteContext: { footnoteNumber: 1, positionInFootnote: 0, totalInFootnote: 2 },
      });

      const case2 = mockCitation({
        id: 'case-2',
        type: 'case',
        rawText: 'Doe v. Roe, 300 F.3d 50 (2d Cir. 2001)',
        components: {
          partyOne: 'Doe',
          partyTwo: 'Roe',
          volume: '300',
          reporter: 'F.3d',
          firstPage: '50',
          year: '2001',
        } as CaseComponents,
        footnoteContext: { footnoteNumber: 1, positionInFootnote: 1, totalInFootnote: 2 },
      });

      const idCitation = mockCitation({
        id: 'id-ambiguous',
        type: 'id',
        rawText: 'Id.',
        components: { type: 'id' } as ShortFormComponents,
        footnoteContext: { footnoteNumber: 2, positionInFootnote: 0, totalInFootnote: 1 },
      });

      const footnotes = new Map<number, ParsedCitation[]>([
        [1, [case1, case2]],
        [2, [idCitation]],
      ]);

      const issues = validateFootnoteContext(buildDocMap(footnotes));
      const idIssues = issues.get('id-ambiguous') ?? [];
      const errors = idIssues.filter((i) => i.severity === 'error');
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('ambiguous');
    });

    it('flags Id. in the first footnote with no preceding footnote', () => {
      const idCitation = mockCitation({
        id: 'id-first',
        type: 'id',
        rawText: 'Id.',
        components: { type: 'id' } as ShortFormComponents,
        footnoteContext: { footnoteNumber: 1, positionInFootnote: 0, totalInFootnote: 1 },
      });

      const footnotes = new Map<number, ParsedCitation[]>([[1, [idCitation]]]);

      const issues = validateFootnoteContext(buildDocMap(footnotes));
      const idIssues = issues.get('id-first') ?? [];
      const errors = idIssues.filter((i) => i.severity === 'error');
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('no preceding footnote');
    });

    it('allows Id. within the same footnote after a case citation', () => {
      const caseCitation = mockCitation({
        id: 'case-same-fn',
        type: 'case',
        rawText: 'Smith v. Jones, 500 U.S. 100 (1990)',
        components: {
          partyOne: 'Smith',
          partyTwo: 'Jones',
          volume: '500',
          reporter: 'U.S.',
          firstPage: '100',
          year: '1990',
        } as CaseComponents,
        footnoteContext: { footnoteNumber: 1, positionInFootnote: 0, totalInFootnote: 2 },
      });

      const idCitation = mockCitation({
        id: 'id-same-fn',
        type: 'id',
        rawText: 'Id. at 105',
        components: { type: 'id', pinCite: '105' } as ShortFormComponents,
        footnoteContext: { footnoteNumber: 1, positionInFootnote: 1, totalInFootnote: 2 },
      });

      const footnotes = new Map<number, ParsedCitation[]>([[1, [caseCitation, idCitation]]]);

      const issues = validateFootnoteContext(buildDocMap(footnotes));
      const idIssues = issues.get('id-same-fn') ?? [];
      const errors = idIssues.filter((i) => i.severity === 'error');
      expect(errors).toHaveLength(0);
    });
  });

  describe('supra note validation', () => {
    it('allows valid supra reference to an earlier footnote', () => {
      const caseCitation = mockCitation({
        id: 'case-fn2',
        type: 'case',
        rawText: 'Smith v. Jones, 500 U.S. 100 (1990)',
        components: {
          partyOne: 'Smith',
          partyTwo: 'Jones',
          volume: '500',
          reporter: 'U.S.',
          firstPage: '100',
          year: '1990',
        } as CaseComponents,
        footnoteContext: { footnoteNumber: 2, positionInFootnote: 0, totalInFootnote: 1 },
      });

      const supraCitation = mockCitation({
        id: 'supra-valid',
        type: 'supra',
        rawText: 'Smith, supra note 2, at 100',
        components: {
          type: 'supra',
          supraNoteNumber: 2,
          partyName: 'Smith',
          pinCite: '100',
        } as ShortFormComponents,
        footnoteContext: { footnoteNumber: 5, positionInFootnote: 0, totalInFootnote: 1 },
      });

      const footnotes = new Map<number, ParsedCitation[]>([
        [2, [caseCitation]],
        [5, [supraCitation]],
      ]);

      const issues = validateFootnoteContext(buildDocMap(footnotes, 5));
      const supraIssues = issues.get('supra-valid') ?? [];
      const errors = supraIssues.filter((i) => i.severity === 'error');
      expect(errors).toHaveLength(0);
    });

    it('flags supra referencing a non-existent footnote', () => {
      const caseCitation = mockCitation({
        id: 'case-fn1',
        type: 'case',
        rawText: 'Smith v. Jones, 500 U.S. 100 (1990)',
        components: {
          partyOne: 'Smith',
          partyTwo: 'Jones',
          volume: '500',
          reporter: 'U.S.',
          firstPage: '100',
          year: '1990',
        } as CaseComponents,
        footnoteContext: { footnoteNumber: 1, positionInFootnote: 0, totalInFootnote: 1 },
      });

      const supraCitation = mockCitation({
        id: 'supra-nonexistent',
        type: 'supra',
        rawText: 'Smith, supra note 99',
        components: {
          type: 'supra',
          supraNoteNumber: 99,
          partyName: 'Smith',
        } as ShortFormComponents,
        footnoteContext: { footnoteNumber: 5, positionInFootnote: 0, totalInFootnote: 1 },
      });

      const footnotes = new Map<number, ParsedCitation[]>([
        [1, [caseCitation]],
        [5, [supraCitation]],
      ]);

      const issues = validateFootnoteContext(buildDocMap(footnotes, 5));
      const supraIssues = issues.get('supra-nonexistent') ?? [];
      const errors = supraIssues.filter((i) => i.severity === 'error');
      expect(errors).toHaveLength(1);
      // Note 99 >= footnote 5, so this is caught as a forward-reference error
      expect(errors[0].message).toContain('must refer backward');
    });

    it('flags supra referencing a forward footnote', () => {
      const caseCitation = mockCitation({
        id: 'case-fn5',
        type: 'case',
        rawText: 'Smith v. Jones, 500 U.S. 100 (1990)',
        components: {
          partyOne: 'Smith',
          partyTwo: 'Jones',
          volume: '500',
          reporter: 'U.S.',
          firstPage: '100',
          year: '1990',
        } as CaseComponents,
        footnoteContext: { footnoteNumber: 5, positionInFootnote: 0, totalInFootnote: 1 },
      });

      const supraCitation = mockCitation({
        id: 'supra-forward',
        type: 'supra',
        rawText: 'Smith, supra note 5',
        components: {
          type: 'supra',
          supraNoteNumber: 5,
          partyName: 'Smith',
        } as ShortFormComponents,
        footnoteContext: { footnoteNumber: 2, positionInFootnote: 0, totalInFootnote: 1 },
      });

      const footnotes = new Map<number, ParsedCitation[]>([
        [2, [supraCitation]],
        [5, [caseCitation]],
      ]);

      const issues = validateFootnoteContext(buildDocMap(footnotes, 5));
      const supraIssues = issues.get('supra-forward') ?? [];
      const errors = supraIssues.filter((i) => i.severity === 'error');
      // Two errors: forward-reference + supra appearing before any full citation of the source
      expect(errors).toHaveLength(2);
      expect(errors.some(e => e.message.includes('must refer backward'))).toBe(true);
    });
  });

  describe('infra note validation', () => {
    it('allows valid infra reference to a later footnote', () => {
      const infraCitation = mockCitation({
        id: 'infra-valid',
        type: 'infra',
        rawText: 'infra note 5',
        components: {
          type: 'id',
          infraNoteNumber: 5,
        } as ShortFormComponents,
        footnoteContext: { footnoteNumber: 2, positionInFootnote: 0, totalInFootnote: 1 },
      });

      const caseCitation = mockCitation({
        id: 'case-fn5',
        type: 'case',
        rawText: 'Smith v. Jones, 500 U.S. 100 (1990)',
        components: {
          partyOne: 'Smith',
          partyTwo: 'Jones',
          volume: '500',
          reporter: 'U.S.',
          firstPage: '100',
          year: '1990',
        } as CaseComponents,
        footnoteContext: { footnoteNumber: 5, positionInFootnote: 0, totalInFootnote: 1 },
      });

      const footnotes = new Map<number, ParsedCitation[]>([
        [2, [infraCitation]],
        [5, [caseCitation]],
      ]);

      const issues = validateFootnoteContext(buildDocMap(footnotes, 5));
      const infraIssues = issues.get('infra-valid') ?? [];
      const errors = infraIssues.filter((i) => i.severity === 'error');
      expect(errors).toHaveLength(0);
    });

    it('flags infra referencing a backward footnote', () => {
      const infraCitation = mockCitation({
        id: 'infra-backward',
        type: 'infra',
        rawText: 'infra note 2',
        components: {
          type: 'id',
          infraNoteNumber: 2,
        } as ShortFormComponents,
        footnoteContext: { footnoteNumber: 5, positionInFootnote: 0, totalInFootnote: 1 },
      });

      const caseCitation = mockCitation({
        id: 'case-fn2',
        type: 'case',
        rawText: 'Smith v. Jones, 500 U.S. 100 (1990)',
        components: {
          partyOne: 'Smith',
          partyTwo: 'Jones',
          volume: '500',
          reporter: 'U.S.',
          firstPage: '100',
          year: '1990',
        } as CaseComponents,
        footnoteContext: { footnoteNumber: 2, positionInFootnote: 0, totalInFootnote: 1 },
      });

      const footnotes = new Map<number, ParsedCitation[]>([
        [2, [caseCitation]],
        [5, [infraCitation]],
      ]);

      const issues = validateFootnoteContext(buildDocMap(footnotes, 5));
      const infraIssues = issues.get('infra-backward') ?? [];
      const errors = infraIssues.filter((i) => i.severity === 'error');
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('must refer forward');
    });

    it('flags infra referencing a non-existent footnote', () => {
      const infraCitation = mockCitation({
        id: 'infra-nonexistent',
        type: 'infra',
        rawText: 'infra note 99',
        components: {
          type: 'id',
          infraNoteNumber: 99,
        } as ShortFormComponents,
        footnoteContext: { footnoteNumber: 2, positionInFootnote: 0, totalInFootnote: 1 },
      });

      const footnotes = new Map<number, ParsedCitation[]>([[2, [infraCitation]]]);

      const issues = validateFootnoteContext(buildDocMap(footnotes, 5));
      const infraIssues = issues.get('infra-nonexistent') ?? [];
      const errors = infraIssues.filter((i) => i.severity === 'error');
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('does not exist');
    });
  });
});
