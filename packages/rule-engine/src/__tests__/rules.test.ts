import { describe, it, expect } from 'vitest';
import { runBluebookRules, runAllRules, calculateScore } from '../index.js';
import { extractAndParseCitations } from '@legalcitation/citation-parser';
import {
  validateCitationSentence,
  validateCitationClause,
  validateCitationSentenceSemicolons,
} from '../bluebook/citation-form-rules.js';
import { validateSignal, extractSignal } from '../bluebook/signal-rules.js';
import { validateContext } from '../context/context-rules.js';
import type { ParsedCitation } from '@legalcitation/shared';

describe('calculateScore', () => {
  it('returns 100 for no issues', () => {
    expect(calculateScore([])).toBe(100);
  });

  it('penalizes 15 points per error', () => {
    const issues = [
      { id: '1', rule: 'R.10', source: 'Bluebook' as const, severity: 'error' as const, message: 'err', suggestion: '' },
    ];
    expect(calculateScore(issues)).toBe(85);
  });

  it('penalizes 8 points per warning', () => {
    const issues = [
      { id: '1', rule: 'R.10', source: 'Bluebook' as const, severity: 'warning' as const, message: 'warn', suggestion: '' },
    ];
    expect(calculateScore(issues)).toBe(92);
  });

  it('penalizes 3 points per suggestion', () => {
    const issues = [
      { id: '1', rule: 'R.10', source: 'Bluebook' as const, severity: 'suggestion' as const, message: 'sug', suggestion: '' },
    ];
    expect(calculateScore(issues)).toBe(97);
  });

  it('does not go below 0', () => {
    const issues = Array.from({ length: 10 }, (_, i) => ({
      id: String(i),
      rule: 'R.10',
      source: 'Bluebook' as const,
      severity: 'error' as const,
      message: 'err',
      suggestion: '',
    }));
    expect(calculateScore(issues)).toBe(0);
  });
});

describe('runBluebookRules on parsed citations', () => {
  it('validates a well-formed Supreme Court citation', () => {
    const citations = extractAndParseCitations('Brown v. Board of Education, 347 U.S. 483 (1954).');
    expect(citations.length).toBeGreaterThanOrEqual(1);
    const issues = runBluebookRules(citations[0]);
    // A well-formed SCOTUS citation should have few or no errors
    const errors = issues.filter(i => i.severity === 'error');
    expect(errors.length).toBeLessThanOrEqual(2);
  });

  it('validates a circuit court citation', () => {
    const citations = extractAndParseCitations('Smith v. Jones, 500 F.3d 100 (2d Cir. 2007).');
    expect(citations.length).toBeGreaterThanOrEqual(1);
    const issues = runBluebookRules(citations[0]);
    // Should be largely valid
    const errors = issues.filter(i => i.severity === 'error');
    expect(errors.length).toBeLessThanOrEqual(2);
  });

  it('flags issues in a statute citation without section symbol', () => {
    const citations = extractAndParseCitations('42 U.S.C. § 1983');
    expect(citations.length).toBeGreaterThanOrEqual(1);
    // Should parse and validate without crashing
    const issues = runBluebookRules(citations[0]);
    expect(Array.isArray(issues)).toBe(true);
  });
});

describe('runAllRules', () => {
  it('runs both Bluebook and Indigo rules without crashing', () => {
    const citations = extractAndParseCitations('Roe v. Wade, 410 U.S. 113 (1973).');
    expect(citations.length).toBeGreaterThanOrEqual(1);
    const issues = runAllRules(citations[0]);
    expect(Array.isArray(issues)).toBe(true);
  });
});

// ── B1.1: Citation Sentences and Clauses ────────────────────────────

function makeCitation(overrides: Partial<ParsedCitation>): ParsedCitation {
  return {
    id: 'test-1',
    rawText: '',
    type: 'case',
    context: 'citation_sentence',
    position: { start: 0, end: 0 },
    components: {
      partyOne: 'Smith',
      partyTwo: 'Jones',
      volume: '500',
      reporter: 'U.S.',
      firstPage: '100',
      year: '2020',
    },
    ...overrides,
  };
}

describe('B1.1 — Citation Sentences', () => {
  it('passes a properly formatted citation sentence', () => {
    const citation = makeCitation({
      rawText: 'Marbury v. Madison, 5 U.S. 137 (1803).',
      context: 'citation_sentence',
    });
    const issues = validateCitationSentence(citation, citation.rawText);
    expect(issues.length).toBe(0);
  });

  it('flags a citation sentence that does not begin with a capital letter', () => {
    const citation = makeCitation({
      rawText: 'marbury v. Madison, 5 U.S. 137 (1803).',
      context: 'citation_sentence',
    });
    const issues = validateCitationSentence(citation, citation.rawText);
    const capitalIssues = issues.filter(i => i.message.includes('capital letter'));
    expect(capitalIssues.length).toBe(1);
    expect(capitalIssues[0].rule).toBe('B1.1');
  });

  it('flags a citation sentence that does not end with a period', () => {
    const citation = makeCitation({
      rawText: 'Marbury v. Madison, 5 U.S. 137 (1803)',
      context: 'citation_sentence',
    });
    const issues = validateCitationSentence(citation, citation.rawText);
    const periodIssues = issues.filter(i => i.message.includes('period'));
    expect(periodIssues.length).toBe(1);
    expect(periodIssues[0].rule).toBe('B1.1');
  });

  it('treats marker-wrapped ending punctuation as a valid period', () => {
    const citation = makeCitation({
      rawText: '*Id.*',
      type: 'id',
      context: 'citation_sentence',
    });
    const issues = validateCitationSentence(citation, citation.rawText);
    const periodIssues = issues.filter(i => i.message.includes('period'));
    expect(periodIssues.length).toBe(0);
  });

  it('does not flag citation clauses', () => {
    const citation = makeCitation({
      rawText: 'see Marbury v. Madison, 5 U.S. 137 (1803)',
      context: 'citation_clause',
    });
    const issues = validateCitationSentence(citation, citation.rawText);
    expect(issues.length).toBe(0);
  });
});

describe('B1.1 — Citation Clauses', () => {
  it('passes a properly formatted citation clause with lowercase signal', () => {
    const citation = makeCitation({
      rawText: 'see Wickard v. Filburn, 317 U.S. 111 (1942)',
      context: 'citation_clause',
    });
    const issues = validateCitationClause(citation, citation.rawText, false);
    expect(issues.length).toBe(0);
  });

  it('flags a citation clause that ends with a period (not last clause)', () => {
    const citation = makeCitation({
      rawText: 'see Wickard v. Filburn, 317 U.S. 111 (1942).',
      context: 'citation_clause',
    });
    const issues = validateCitationClause(citation, citation.rawText, false);
    const periodIssues = issues.filter(i => i.message.includes('period'));
    expect(periodIssues.length).toBe(1);
  });

  it('allows a period when it is the last clause in the sentence', () => {
    const citation = makeCitation({
      rawText: 'see Wickard v. Filburn, 317 U.S. 111 (1942).',
      context: 'citation_clause',
    });
    const issues = validateCitationClause(citation, citation.rawText, true);
    const periodIssues = issues.filter(i => i.message.includes('period'));
    expect(periodIssues.length).toBe(0);
  });

  it('does not flag citation sentences', () => {
    const citation = makeCitation({
      rawText: 'Marbury v. Madison, 5 U.S. 137 (1803).',
      context: 'citation_sentence',
    });
    const issues = validateCitationClause(citation, citation.rawText, false);
    expect(issues.length).toBe(0);
  });
});

describe('B1.1 — Semicolons in Citation Sentences', () => {
  it('passes properly formatted multi-citation sentence', () => {
    const raw = 'Marbury v. Madison, 5 U.S. 137 (1803); Fletcher v. Peck, 10 U.S. 87 (1810).';
    const issues = validateCitationSentenceSemicolons(raw);
    expect(issues.length).toBe(0);
  });

  it('returns no issues for single-citation sentences', () => {
    const raw = 'Marbury v. Madison, 5 U.S. 137 (1803).';
    const issues = validateCitationSentenceSemicolons(raw);
    expect(issues.length).toBe(0);
  });
});

// ── B1.2 / R. 1.2–1.4: Introductory Signals ────────────────────

describe('B1.2 — Signal Extraction', () => {
  it('extracts "see" signal', () => {
    const result = extractSignal('See Wickard v. Filburn, 317 U.S. 111 (1942).');
    expect(result).not.toBeNull();
    expect(result!.signalInfo.signal).toBe('see');
  });

  it('extracts compound "see, e.g.," signal', () => {
    const result = extractSignal('See, e.g., Gault v. Garrison, 569 F.2d 993 (7th Cir. 1977).');
    expect(result).not.toBeNull();
    expect(result!.signalInfo.signal).toBe('see, e.g.,');
  });

  it('extracts "but see" signal', () => {
    const result = extractSignal('But see Gonzales v. Raich, 545 U.S. 1 (2005).');
    expect(result).not.toBeNull();
    expect(result!.signalInfo.signal).toBe('but see');
  });

  it('returns null when no signal', () => {
    const result = extractSignal('Marbury v. Madison, 5 U.S. 137 (1803).');
    expect(result).toBeNull();
  });
});

describe('B1.2 — Signal Capitalization', () => {
  it('flags lowercase signal in a citation sentence', () => {
    const citation = makeCitation({
      rawText: 'see Wickard v. Filburn, 317 U.S. 111 (1942).',
      context: 'citation_sentence',
    });
    const issues = validateSignal(citation, citation.rawText);
    const capIssues = issues.filter(i => i.rule === 'B1.2' && i.message.includes('capitalized'));
    expect(capIssues.length).toBe(1);
  });

  it('passes capitalized signal in a citation sentence', () => {
    const citation = makeCitation({
      rawText: 'See Wickard v. Filburn, 317 U.S. 111 (1942).',
      context: 'citation_sentence',
    });
    const issues = validateSignal(citation, citation.rawText);
    const capIssues = issues.filter(i => i.rule === 'B1.2' && i.message.includes('capitalized'));
    expect(capIssues.length).toBe(0);
  });

  it('flags capitalized signal in a citation clause', () => {
    const citation = makeCitation({
      rawText: 'See Wickard v. Filburn, 317 U.S. 111 (1942)',
      context: 'citation_clause',
    });
    const issues = validateSignal(citation, citation.rawText);
    const capIssues = issues.filter(i => i.rule === 'B1.2' && i.message.includes('lowercase'));
    expect(capIssues.length).toBe(1);
  });

  it('passes lowercase signal in a citation clause', () => {
    const citation = makeCitation({
      rawText: 'see Wickard v. Filburn, 317 U.S. 111 (1942)',
      context: 'citation_clause',
    });
    const issues = validateSignal(citation, citation.rawText);
    const capIssues = issues.filter(i => i.rule === 'B1.2');
    expect(capIssues.length).toBe(0);
  });
});

describe('R. 1.2 — Required Parentheticals', () => {
  it('warns when "see also" lacks a parenthetical', () => {
    const citation = makeCitation({
      rawText: 'See also Smith v. Jones, 500 F.3d 100 (2d Cir. 2007).',
      context: 'citation_sentence',
    });
    const issues = validateSignal(citation, citation.rawText);
    const parentIssues = issues.filter(i => i.rule === 'R. 1.2' && i.message.includes('parenthetical'));
    expect(parentIssues.length).toBe(1);
  });

  it('passes when "see also" has a parenthetical', () => {
    const citation = makeCitation({
      rawText: 'See also Smith v. Jones, 500 F.3d 100 (2d Cir. 2007) (discussing the standard).',
      context: 'citation_sentence',
    });
    const issues = validateSignal(citation, citation.rawText);
    const parentIssues = issues.filter(i => i.rule === 'R. 1.2' && i.message.includes('parenthetical'));
    expect(parentIssues.length).toBe(0);
  });
});

describe('R. 1.2(b) — Compare/Contrast', () => {
  it('flags "compare" without "with"', () => {
    const citation = makeCitation({
      rawText: 'Compare McDonald v. City of Chicago, 561 U.S. 742 (2010).',
      context: 'citation_sentence',
    });
    const issues = validateSignal(citation, citation.rawText);
    const withIssues = issues.filter(i => i.rule === 'R. 1.2(b)');
    expect(withIssues.length).toBe(1);
  });

  it('passes "compare...with" construction', () => {
    const citation = makeCitation({
      rawText: 'Compare McDonald v. City of Chicago, 561 U.S. 742 (2010), with Timbs v. Indiana, 586 U.S. 146 (2019).',
      context: 'citation_sentence',
    });
    const issues = validateSignal(citation, citation.rawText);
    const withIssues = issues.filter(i => i.rule === 'R. 1.2(b)');
    expect(withIssues.length).toBe(0);
  });
});

// ── B1.3 / R. 1.5: Explanatory Parentheticals ──────────────────

import { validateParenthetical } from '../bluebook/parenthetical-rules.js';

describe('B1.3 — Explanatory Parentheticals', () => {
  it('passes a properly formed participial parenthetical', () => {
    const citation = makeCitation({
      rawText: 'See Flanagan v. United States, 465 U.S. 259, 264 (1984) (explaining that the rule reduces potential for abuse).',
      context: 'citation_sentence',
    });
    const issues = validateParenthetical(citation, citation.rawText);
    const b13Issues = issues.filter(i => i.rule === 'B1.3');
    expect(b13Issues.length).toBe(0);
  });

  it('flags an explanatory parenthetical starting with a capital letter', () => {
    const citation = makeCitation({
      rawText: 'See Flanagan v. United States, 465 U.S. 259, 264 (1984) (The rule reduces potential for abuse).',
      context: 'citation_sentence',
    });
    const issues = validateParenthetical(citation, citation.rawText);
    const capIssues = issues.filter(i => i.rule === 'B1.3' && i.message.includes('capital'));
    expect(capIssues.length).toBe(1);
  });

  it('passes a quoted-sentence parenthetical with capital letter', () => {
    const citation = makeCitation({
      rawText: 'Atl. Richfield Co. v. Fed. Energy Admin., 429 F. Supp. 1052, 1061 (N.D. Cal. 1976) ("Not every person aggrieved is entitled to due process.").',
      context: 'citation_sentence',
    });
    const issues = validateParenthetical(citation, citation.rawText);
    const b13Issues = issues.filter(i => i.rule === 'B1.3');
    expect(b13Issues.length).toBe(0);
  });

  it('does not flag court/year parentheticals as explanatory', () => {
    const citation = makeCitation({
      rawText: 'Smith v. Jones, 500 F.3d 100 (2d Cir. 2007).',
      context: 'citation_sentence',
    });
    const issues = validateParenthetical(citation, citation.rawText);
    expect(issues.length).toBe(0);
  });
});

// ── B11 / R. 11: Constitutions ───────────────────────────────────

import { validateConstitution } from '../bluebook/constitution-rules.js';
import type { ConstitutionComponents } from '@legalcitation/shared';

function makeConstitutionComponents(overrides: Partial<ConstitutionComponents> = {}): ConstitutionComponents {
  return {
    jurisdiction: 'U.S.',
    article: undefined,
    amendment: undefined,
    section: undefined,
    clause: undefined,
    ...overrides,
  } as ConstitutionComponents;
}

describe('B11 / R. 11 — Constitutions', () => {
  it('passes a well-formed U.S. Constitution citation', () => {
    const components = makeConstitutionComponents({ article: 'I', section: '8', clause: '10' });
    const issues = validateConstitution(components, 'U.S. Const. art. I, § 8, cl. 10.');
    const errors = issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
  });

  it('passes a well-formed amendment citation', () => {
    const components = makeConstitutionComponents({ amendment: 'XIV', section: '2' });
    const issues = validateConstitution(components, 'U.S. Const. amend. XIV, § 2.');
    const errors = issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
  });

  it('flags "Constitution" spelled out', () => {
    const components = makeConstitutionComponents({ article: 'I' });
    const issues = validateConstitution(components, 'U.S. Constitution art. I.');
    const errors = issues.filter(i => i.message.includes('abbreviated') || i.message.includes('spell'));
    expect(errors.length).toBeGreaterThan(0);
  });

  it('flags "Article" not abbreviated', () => {
    const components = makeConstitutionComponents({ article: 'III' });
    const issues = validateConstitution(components, 'U.S. Const. Article III, § 1.');
    const artErrors = issues.filter(i => i.message.includes('"Article" should be abbreviated'));
    expect(artErrors.length).toBe(1);
  });

  it('flags "Amendment" not abbreviated', () => {
    const components = makeConstitutionComponents({ amendment: 'XIV' });
    const issues = validateConstitution(components, 'U.S. Const. Amendment XIV, § 1.');
    const amendErrors = issues.filter(i => i.message.includes('"Amendment" should be abbreviated'));
    expect(amendErrors.length).toBe(1);
  });

  it('flags "Section" spelled out instead of §', () => {
    const components = makeConstitutionComponents({ amendment: 'XIV', section: '1' });
    const issues = validateConstitution(components, 'U.S. Const. amend. XIV, Section 1.');
    const secErrors = issues.filter(i => i.message.includes('section symbol'));
    expect(secErrors.length).toBe(1);
  });

  it('warns about Arabic numeral for amendment', () => {
    const components = makeConstitutionComponents({ amendment: '14' });
    const issues = validateConstitution(components, 'U.S. Const. amend. 14, § 2.');
    const romanWarnings = issues.filter(i => i.message.includes('Roman numerals'));
    expect(romanWarnings.length).toBe(1);
  });

  it('flags "supra" used with a constitution', () => {
    const components = makeConstitutionComponents({ amendment: 'XIV' });
    const issues = validateConstitution(components, 'U.S. Const. amend. XIV, supra note 5.');
    const supraErrors = issues.filter(i => i.rule === 'B11' && i.message.includes('supra'));
    expect(supraErrors.length).toBe(1);
  });

  it('flags "preamble" not abbreviated', () => {
    const components = makeConstitutionComponents();
    const issues = validateConstitution(components, 'U.S. Const. preamble.');
    const pmblErrors = issues.filter(i => i.message.includes('pmbl'));
    expect(pmblErrors.length).toBe(1);
  });

  it('warns about a bare year on a current provision', () => {
    const components = makeConstitutionComponents({ amendment: 'XIV', section: '1' });
    const issues = validateConstitution(components, 'U.S. Const. amend. XIV, § 1 (2020).');
    const dateWarnings = issues.filter(i => i.message.includes('without a date'));
    expect(dateWarnings.length).toBe(1);
  });

  it('allows year on repealed provisions', () => {
    const components = makeConstitutionComponents({ amendment: 'XVIII' });
    const issues = validateConstitution(components, 'U.S. Const. amend. XVIII (repealed 1933).');
    const dateWarnings = issues.filter(i => i.message.includes('without a date'));
    expect(dateWarnings.length).toBe(0);
  });
});

// ── R. 14: Administrative and Executive Materials ─────────────────

import { validateRegulation } from '../bluebook/regulation-rules.js';
import type { RegulationComponents } from '@legalcitation/shared';

function makeRegulationComponents(overrides: Partial<RegulationComponents> = {}): RegulationComponents {
  return {
    title: '40',
    source: 'C.F.R.',
    section: '261.3',
    year: '2024',
    ...overrides,
  } as RegulationComponents;
}

describe('R. 14 — Administrative and Executive Materials', () => {
  it('passes a well-formed C.F.R. citation', () => {
    const components = makeRegulationComponents();
    const issues = validateRegulation(components, '40 C.F.R. § 261.3 (2024).');
    const errors = issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
  });

  it('flags missing title number', () => {
    const components = makeRegulationComponents({ title: '' });
    const issues = validateRegulation(components, 'C.F.R. § 261.3 (2024).');
    const titleErrors = issues.filter(i => i.message.includes('title number'));
    expect(titleErrors.length).toBe(1);
  });

  it('flags incorrect source abbreviation', () => {
    const components = makeRegulationComponents({ source: 'CFR' });
    const issues = validateRegulation(components, '40 CFR § 261.3 (2024).');
    const abbrevErrors = issues.filter(i => i.message.includes('abbreviation'));
    expect(abbrevErrors.length).toBe(1);
  });

  it('flags § without space', () => {
    const components = makeRegulationComponents();
    const issues = validateRegulation(components, '40 C.F.R. §261.3 (2024).');
    const spaceErrors = issues.filter(i => i.message.includes('space between §'));
    expect(spaceErrors.length).toBe(1);
  });

  it('flags "Section" spelled out for C.F.R.', () => {
    const components = makeRegulationComponents();
    const issues = validateRegulation(components, '40 C.F.R. Section 261.3 (2024).');
    const secErrors = issues.filter(i => i.message.includes('section symbol'));
    expect(secErrors.length).toBe(1);
  });

  it('flags § used with Fed. Reg.', () => {
    const components = makeRegulationComponents({ source: 'Fed. Reg.' });
    const issues = validateRegulation(components, '60 Fed. Reg. § 50379 (1995).');
    const fedRegErrors = issues.filter(i => i.message.includes('page numbers'));
    expect(fedRegErrors.length).toBe(1);
  });

  it('flags "In the Matter of" in admin adjudications', () => {
    const components = makeRegulationComponents();
    const issues = validateRegulation(components, 'In the Matter of Trojan Transp., Inc., 249 NLRB 642 (1980).');
    const procErrors = issues.filter(i => i.rule === 'R. 14.3.1');
    expect(procErrors.length).toBeGreaterThan(0);
  });

  it('flags "Code of Federal Regulations" spelled out', () => {
    const components = makeRegulationComponents();
    const issues = validateRegulation(components, '40 Code of Federal Regulations § 261.3 (2024).');
    const nameErrors = issues.filter(i => i.message.includes('"Code of Federal Regulations"'));
    expect(nameErrors.length).toBe(1);
  });

  it('flags "Federal Register" spelled out', () => {
    const components = makeRegulationComponents({ source: 'Fed. Reg.' });
    const issues = validateRegulation(components, '60 Federal Register 50379 (1995).');
    const nameErrors = issues.filter(i => i.message.includes('"Federal Register"'));
    expect(nameErrors.length).toBe(1);
  });
});

// ── R. 2: Academic Typeface Rules ──────────────────────────────────

import { validateAcademicTypeface } from '../bluebook/typeface-rules.js';
import type { ArticleComponents } from '@legalcitation/shared';
import { validateArticle } from '../bluebook/article-rules.js';

describe('R. 2 — Academic Typeface', () => {
  it('flags italic case name in a footnote citation (should be roman)', () => {
    const citation = makeCitation({
      rawText: '*Smith v. Jones*, 500 U.S. 100 (2020).',
      context: 'citation_sentence',
      footnoteContext: {
        footnoteNumber: 1,
        positionInFootnote: 0,
        totalInFootnote: 1,
      },
      components: {
        partyOne: 'Smith',
        partyTwo: 'Jones',
        volume: '500',
        reporter: 'U.S.',
        firstPage: '100',
        year: '2020',
      },
    });
    const issues = validateAcademicTypeface(citation, citation.rawText);
    const typefaceIssues = issues.filter(i => i.rule === 'R. 2.1' && i.message.includes('roman'));
    expect(typefaceIssues.length).toBeGreaterThan(0);
  });

  it('warns when case name is not italic in a textual sentence', () => {
    const citation = makeCitation({
      rawText: 'Smith v. Jones, 500 U.S. 100 (2020)',
      context: 'textual_sentence',
      components: {
        partyOne: 'Smith',
        partyTwo: 'Jones',
        volume: '500',
        reporter: 'U.S.',
        firstPage: '100',
        year: '2020',
      },
    });
    const issues = validateAcademicTypeface(citation, citation.rawText);
    const typefaceIssues = issues.filter(i => i.rule === 'R. 2.1' && i.message.includes('italicized'));
    expect(typefaceIssues.length).toBeGreaterThan(0);
  });

  it('flags ALL CAPS signal as typeface error', () => {
    const citation = makeCitation({
      rawText: 'SEE ALSO Smith v. Jones, 500 U.S. 100 (2020).',
      context: 'citation_sentence',
    });
    const issues = validateAcademicTypeface(citation, citation.rawText);
    const signalIssues = issues.filter(i => i.message.includes('SEE ALSO'));
    expect(signalIssues.length).toBeGreaterThan(0);
  });

  it('flags ALL CAPS INFRA cross-reference', () => {
    const citation = makeCitation({
      rawText: 'INFRA note 5',
      type: 'unknown',
      context: 'citation_sentence',
    });
    const issues = validateAcademicTypeface(citation, citation.rawText);
    const infraIssues = issues.filter(i => i.message.includes('INFRA'));
    expect(infraIssues.length).toBeGreaterThan(0);
  });

  it('does not warn when Id. has boundary markers from span clipping', () => {
    const citation = makeCitation({
      rawText: 'Id.*at 1509.',
      type: 'id',
      context: 'citation_sentence',
    });
    const issues = validateAcademicTypeface(citation, citation.rawText);
    const idTypefaceIssues = issues.filter(
      i => i.rule === 'R. 2.1' && i.message.includes('"Id." should be italicized')
    );
    expect(idTypefaceIssues.length).toBe(0);
  });
});

describe('R. 15 — Article Rules with Journal Lookup', () => {
  function makeArticleComponents(overrides: Partial<ArticleComponents> = {}): ArticleComponents {
    return {
      authors: ['John Smith'],
      title: 'A Theory of Everything',
      journal: 'Harv. L. Rev.',
      volume: '128',
      firstPage: '1045',
      year: '2024',
      ...overrides,
    };
  }

  it('flags a known full journal name that should be abbreviated', () => {
    const components = makeArticleComponents({ journal: 'Harvard Law Review' });
    const issues = validateArticle(components);
    const journalIssues = issues.filter(i => i.message.includes('abbreviated'));
    expect(journalIssues.length).toBeGreaterThan(0);
    expect(journalIssues[0].suggestion).toContain('Harv. L. Rev.');
  });

  it('passes a correctly abbreviated journal name', () => {
    const components = makeArticleComponents({ journal: 'Harv. L. Rev.' });
    const issues = validateArticle(components);
    const journalIssues = issues.filter(i => i.rule.includes('T13') && i.severity === 'error');
    expect(journalIssues.length).toBe(0);
  });

  it('flags ALL CAPS author in article', () => {
    const components = makeArticleComponents({ authors: ['JOHN SMITH'] });
    const issues = validateArticle(components);
    const capsIssues = issues.filter(i => i.message.includes('all caps'));
    expect(capsIssues.length).toBeGreaterThan(0);
  });
});

describe('end-to-end: parse → validate → score', () => {
  it('processes a citation through the full pipeline', () => {
    const citations = extractAndParseCitations('Miranda v. Arizona, 384 U.S. 436 (1966).');
    expect(citations.length).toBeGreaterThanOrEqual(1);

    const issues = runAllRules(citations[0]);
    const score = calculateScore(issues);

    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('scores a multi-citation text', () => {
    const text = 'Brown v. Board of Education, 347 U.S. 483 (1954); Roe v. Wade, 410 U.S. 113 (1973).';
    const citations = extractAndParseCitations(text);
    expect(citations.length).toBeGreaterThanOrEqual(2);

    for (const citation of citations) {
      const issues = runAllRules(citation);
      const score = calculateScore(issues);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });
});

// ── B17 / R. 10.8.3: Briefs ──────────────────────────────────────

import { validateBrief } from '../bluebook/brief-rules.js';
import type { BriefComponents } from '@legalcitation/shared';

function makeBriefComponents(overrides: Partial<BriefComponents> = {}): BriefComponents {
  return {
    documentType: 'Brief for Petitioner',
    caseName: 'Smith v. Jones',
    docketNumber: 'No. 22-123',
    court: 'S. Ct.',
    filedDate: 'Jan. 1, 2024',
    pinCite: 'at 12',
    ...overrides,
  } as BriefComponents;
}

describe('B17 / R. 10.8.3 — Briefs', () => {
  it('passes a well-formed brief citation', () => {
    const components = makeBriefComponents();
    const issues = validateBrief(components, "Brief for Petitioner at 12, Smith v. Jones, No. 22-123 (S. Ct. filed Jan. 1, 2024).");
    const errors = issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
  });

  it('flags missing document type', () => {
    const components = makeBriefComponents({ documentType: '' });
    const issues = validateBrief(components);
    const typeErrors = issues.filter(i => i.rule === 'B17.1' && i.message.includes('document type'));
    expect(typeErrors.length).toBe(1);
  });

  it('flags unabbreviated document terms', () => {
    const components = makeBriefComponents({ documentType: 'Memorandum in Support' });
    const issues = validateBrief(components, 'Memorandum in Support of Motion to Dismiss at 5.');
    const abbrIssues = issues.filter(i => i.rule === 'B17.1' && i.message.includes('abbreviated'));
    expect(abbrIssues.length).toBeGreaterThan(0);
  });

  it('flags "p." in page reference', () => {
    const components = makeBriefComponents({ pinCite: 'p. 12' });
    const issues = validateBrief(components, "Brief for Petitioner p. 12.");
    const pageErrors = issues.filter(i => i.rule === 'B17.1.2' && i.message.includes('p.'));
    expect(pageErrors.length).toBe(1);
  });

  it('flags missing case name', () => {
    const components = makeBriefComponents({ caseName: '' });
    const issues = validateBrief(components);
    const nameWarnings = issues.filter(i => i.rule === 'R. 10.8.3' && i.message.includes('case name'));
    expect(nameWarnings.length).toBe(1);
  });

  it('flags docket number without "No." prefix', () => {
    const components = makeBriefComponents({ docketNumber: '22-123' });
    const issues = validateBrief(components, 'Brief for Petitioner at 12, Smith v. Jones, 22-123.');
    const docketErrors = issues.filter(i => i.rule === 'R. 10.8.3' && i.message.includes('No.'));
    expect(docketErrors.length).toBe(1);
  });

  it('flags unabbreviated month in date', () => {
    const components = makeBriefComponents({ filedDate: 'January 1, 2024' });
    const issues = validateBrief(components, 'Brief for Petitioner at 12 (S. Ct. filed January 1, 2024).');
    const monthWarnings = issues.filter(i => i.message.includes('January'));
    expect(monthWarnings.length).toBeGreaterThan(0);
  });

  it('suggests court and date when both missing', () => {
    const components = makeBriefComponents({ court: undefined, filedDate: undefined });
    const issues = validateBrief(components);
    const suggestions = issues.filter(i => i.severity === 'suggestion' && i.message.includes('court'));
    expect(suggestions.length).toBeGreaterThan(0);
  });
});

// ── B17 / R. 10.8.3: Records & Transcripts ──────────────────────

import { validateRecord } from '../bluebook/record-rules.js';
import type { RecordComponents } from '@legalcitation/shared';

function makeRecordComponents(overrides: Partial<RecordComponents> = {}): RecordComponents {
  return {
    documentType: 'Trial Tr.',
    pinCite: 'at 45',
    caseName: 'Smith v. Jones',
    docketNumber: 'No. 22-123',
    court: 'D. Mass.',
    date: 'Jan. 1, 2024',
    ...overrides,
  } as RecordComponents;
}

describe('B17 / R. 10.8.3 — Records & Transcripts', () => {
  it('passes a well-formed record citation', () => {
    const components = makeRecordComponents();
    const issues = validateRecord(components, 'Trial Tr. at 45, Smith v. Jones, No. 22-123 (D. Mass. Jan. 1, 2024).');
    const errors = issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
  });

  it('flags missing document type', () => {
    const components = makeRecordComponents({ documentType: '' });
    const issues = validateRecord(components);
    const typeErrors = issues.filter(i => i.rule === 'B17.1' && i.message.includes('document type'));
    expect(typeErrors.length).toBe(1);
  });

  it('flags unabbreviated record types', () => {
    const components = makeRecordComponents({ documentType: 'Trial Transcript' });
    const issues = validateRecord(components, 'Trial Transcript at 45.');
    const abbrIssues = issues.filter(i => i.rule === 'B17.1.1' && i.message.includes('abbreviated'));
    expect(abbrIssues.length).toBeGreaterThan(0);
  });

  it('flags appellate record without "at"', () => {
    const components = makeRecordComponents({ documentType: 'R.', pinCite: '5' });
    const issues = validateRecord(components, 'R. 5.');
    const atErrors = issues.filter(i => i.rule === 'B17.1.2' && i.message.includes('at'));
    expect(atErrors.length).toBe(1);
  });

  it('suggests case context when missing', () => {
    const components = makeRecordComponents({ caseName: undefined, docketNumber: undefined });
    const issues = validateRecord(components);
    const contextSuggestions = issues.filter(i => i.rule === 'R. 10.8.3' && i.message.includes('case name'));
    expect(contextSuggestions.length).toBe(1);
  });

  it('flags "p." in page reference', () => {
    const components = makeRecordComponents({ pinCite: 'p. 45' });
    const issues = validateRecord(components, 'Trial Tr. p. 45.');
    const pageErrors = issues.filter(i => i.rule === 'B17.1.2' && i.message.includes('p.'));
    expect(pageErrors.length).toBe(1);
  });
});

// ── R. 21 — Treaties ─────────────────────────────────────────────

import { validateTreaty } from '../bluebook/treaty-rules.js';
import type { TreatyComponents } from '@legalcitation/shared';

function makeTreatyComponents(overrides: Partial<TreatyComponents> = {}): TreatyComponents {
  return {
    name: 'Convention on the Rights of the Child',
    dateOfSigning: 'Nov. 20, 1989',
    sources: ['1577 U.N.T.S. 3'],
    treatyType: 'multilateral',
    ...overrides,
  } as TreatyComponents;
}

describe('R. 21 — Treaties', () => {
  it('passes a well-formed multilateral treaty citation', () => {
    const components = makeTreatyComponents();
    const issues = validateTreaty(components, 'Convention on the Rights of the Child, Nov. 20, 1989, 1577 U.N.T.S. 3.');
    const errors = issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
  });

  it('passes a well-formed bilateral treaty citation', () => {
    const components = makeTreatyComponents({
      name: 'Treaty of Friendship, Commerce and Navigation',
      parties: 'Japan-U.S.',
      dateOfSigning: 'Apr. 2, 1953',
      sources: ['4 U.S.T. 2063'],
      treatyType: 'bilateral',
    });
    const issues = validateTreaty(components, 'Treaty of Friendship, Commerce and Navigation, Japan-U.S., Apr. 2, 1953, 4 U.S.T. 2063.');
    const errors = issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
  });

  it('flags missing treaty name', () => {
    const components = makeTreatyComponents({ name: '' });
    const issues = validateTreaty(components);
    const nameErrors = issues.filter(i => i.rule === 'R. 21.4.1' && i.message.includes('name'));
    expect(nameErrors.length).toBe(1);
  });

  it('flags missing date of signing', () => {
    const components = makeTreatyComponents({ dateOfSigning: '' });
    const issues = validateTreaty(components);
    const dateErrors = issues.filter(i => i.rule === 'R. 21.4.4' && i.message.includes('date'));
    expect(dateErrors.length).toBe(1);
  });

  it('flags missing treaty source', () => {
    const components = makeTreatyComponents({ sources: [] });
    const issues = validateTreaty(components);
    const sourceErrors = issues.filter(i => i.rule === 'R. 21.4.5' && i.message.includes('source'));
    expect(sourceErrors.length).toBe(1);
  });

  it('flags unrecognized treaty source abbreviation', () => {
    const components = makeTreatyComponents({ sources: ['42 Fake Rep. 100'] });
    const issues = validateTreaty(components);
    const sourceWarnings = issues.filter(i => i.rule === 'R. 21.4.5' && i.message.includes('recognized'));
    expect(sourceWarnings.length).toBe(1);
  });

  it('flags missing parties in bilateral treaty', () => {
    const components = makeTreatyComponents({
      treatyType: 'bilateral',
      parties: undefined,
    });
    const issues = validateTreaty(components);
    const partyErrors = issues.filter(i => i.rule === 'R. 21.4.2' && i.message.includes('parties'));
    expect(partyErrors.length).toBe(1);
  });

  it('flags non-alphabetical party order in bilateral treaty', () => {
    const components = makeTreatyComponents({
      treatyType: 'bilateral',
      parties: 'U.S.-Japan',
    });
    const issues = validateTreaty(components);
    const orderWarnings = issues.filter(i => i.rule === 'R. 21.4.2' && i.message.includes('alphabetical'));
    expect(orderWarnings.length).toBe(1);
  });

  it('flags parties listed in multilateral treaty', () => {
    const components = makeTreatyComponents({
      treatyType: 'multilateral',
      parties: 'Japan-U.S.',
    });
    const issues = validateTreaty(components);
    const partyWarnings = issues.filter(i => i.rule === 'R. 21.4.2' && i.message.includes('Multilateral'));
    expect(partyWarnings.length).toBe(1);
  });

  it('flags unabbreviated "Article" in subdivision', () => {
    const components = makeTreatyComponents({ subdivision: 'Article 5' });
    const issues = validateTreaty(components, 'North Atlantic Treaty Article 5, Apr. 4, 1949, 63 Stat. 2241.');
    const artWarnings = issues.filter(i => i.message.includes('"Article"') && i.message.includes('art.'));
    expect(artWarnings.length).toBeGreaterThan(0);
  });

  it('skips date validation for founding documents', () => {
    const components: TreatyComponents = {
      name: 'U.N. Charter',
      dateOfSigning: '',
      sources: [],
      treatyType: 'founding',
    };
    const issues = validateTreaty(components, 'U.N. Charter art. 94, ¶ 1.');
    const dateErrors = issues.filter(i => i.rule === 'R. 21.4.4');
    expect(dateErrors.length).toBe(0);
  });
});

describe('context resolution for detected Id. antecedents', () => {
  it('links Id. to the immediately preceding detected full citation', () => {
    const text = [
      'Pickering v. Bd. of Educ. of Twp. High Sch. Dist. 205, Will Cty., 391 U.S. 563, 582 (1968).',
      'Bryson v. Waycross, 888 F.2d 1562, 1565 (11th Cir. 1989).',
      'Id. at 1566.',
    ].join(' ');
    const parsed = extractAndParseCitations(text);
    const issueMap = validateContext(parsed);
    const idCitation = parsed.find(c => c.type === 'id');

    expect(idCitation).toBeDefined();
    const idIssues = idCitation ? issueMap.get(idCitation.id) ?? [] : [];
    const antecedentIssue = idIssues.find(
      issue => issue.severity === 'suggestion' && issue.antecedentText?.includes('Bryson v. Waycross')
    );

    expect(antecedentIssue).toBeDefined();
  });
});
