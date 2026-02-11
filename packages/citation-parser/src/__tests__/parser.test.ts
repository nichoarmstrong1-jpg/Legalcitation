import { describe, it, expect } from 'vitest';
import { detectCitations, extractAndParseCitations } from '../index.js';
import type { CaseComponents, ShortFormComponents, StatuteComponents, ConstitutionComponents, RegulationComponents } from '@legalcitation/shared';

describe('detectCitations', () => {
  it('detects a full case citation', () => {
    const spans = detectCitations('Brown v. Board of Education, 347 U.S. 483 (1954).');
    expect(spans.length).toBeGreaterThanOrEqual(1);
    expect(spans[0].type).toBe('full_case');
    expect(spans[0].text).toContain('Brown v. Board');
    expect(spans[0].text).toContain('347 U.S. 483');
  });

  it('detects a federal statute citation', () => {
    const spans = detectCitations('42 U.S.C. § 1983');
    expect(spans.length).toBeGreaterThanOrEqual(1);
    expect(spans[0].type).toBe('statute');
  });

  it('detects a U.S. Constitution citation', () => {
    const spans = detectCitations('U.S. Const. amend. XIV, § 1');
    expect(spans.length).toBeGreaterThanOrEqual(1);
    expect(spans[0].type).toBe('constitution');
  });

  it('detects a C.F.R. regulation citation', () => {
    const spans = detectCitations('40 C.F.R. § 60.1');
    expect(spans.length).toBeGreaterThanOrEqual(1);
    expect(spans[0].type).toBe('regulation');
  });

  it('detects Id. citations', () => {
    const spans = detectCitations('Id. at 485.');
    expect(spans.length).toBeGreaterThanOrEqual(1);
    expect(spans[0].type).toBe('id');
  });

  it('detects supra citations', () => {
    const spans = detectCitations('Smith, supra note 3, at 42');
    expect(spans.length).toBeGreaterThanOrEqual(1);
    expect(spans[0].type).toBe('supra');
  });

  it('detects multiple citations in one text block', () => {
    const text = 'Brown v. Board of Education, 347 U.S. 483 (1954); Roe v. Wade, 410 U.S. 113 (1973).';
    const spans = detectCitations(text);
    expect(spans.length).toBeGreaterThanOrEqual(2);
  });

  it('returns empty array for text with no citations', () => {
    const spans = detectCitations('This is a normal sentence with no legal citations.');
    expect(spans).toEqual([]);
  });
});

describe('extractAndParseCitations — case citations', () => {
  it('parses a standard Supreme Court citation', () => {
    const results = extractAndParseCitations('Brown v. Board of Education, 347 U.S. 483 (1954).');
    expect(results.length).toBeGreaterThanOrEqual(1);
    const parsed = results[0];
    expect(parsed.type).toBe('case');
    const comp = parsed.components as CaseComponents;
    expect(comp.partyOne).toContain('Brown');
    expect(comp.partyTwo).toContain('Board');
    expect(comp.volume).toBe('347');
    expect(comp.reporter).toBe('U.S.');
    expect(comp.firstPage).toBe('483');
    expect(comp.year).toBe('1954');
  });

  it('parses a citation with court designation', () => {
    const results = extractAndParseCitations('Smith v. Jones, 500 F.3d 100 (2d Cir. 2007).');
    expect(results.length).toBeGreaterThanOrEqual(1);
    const comp = results[0].components as CaseComponents;
    expect(comp.reporter).toBe('F.3d');
    expect(comp.court).toBe('2d Cir.');
    expect(comp.year).toBe('2007');
  });

  it('parses a citation with pincite', () => {
    const results = extractAndParseCitations('Roe v. Wade, 410 U.S. 113, 153 (1973).');
    expect(results.length).toBeGreaterThanOrEqual(1);
    const comp = results[0].components as CaseComponents;
    expect(comp.pinCite).toBe('153');
  });

  it('parses In re citations', () => {
    const results = extractAndParseCitations('In re Gault, 387 U.S. 1 (1967).');
    expect(results.length).toBeGreaterThanOrEqual(1);
    const comp = results[0].components as CaseComponents;
    expect(comp.partyOne).toContain('In re Gault');
  });
});

describe('extractAndParseCitations — statute citations', () => {
  it('parses a federal statute', () => {
    const results = extractAndParseCitations('42 U.S.C. § 1983');
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].type).toBe('statute');
    const comp = results[0].components as StatuteComponents;
    expect(comp.title).toBe('42');
    expect(comp.code).toContain('U.S.C.');
    expect(comp.section).toContain('1983');
  });
});

describe('extractAndParseCitations — constitution citations', () => {
  it('parses a U.S. Constitutional amendment', () => {
    const results = extractAndParseCitations('U.S. Const. amend. XIV, § 1');
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].type).toBe('constitution');
    const comp = results[0].components as ConstitutionComponents;
    expect(comp.amendment).toContain('XIV');
  });
});

describe('extractAndParseCitations — regulation citations', () => {
  it('parses a C.F.R. citation', () => {
    const results = extractAndParseCitations('40 C.F.R. § 60.1');
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].type).toBe('regulation');
    const comp = results[0].components as RegulationComponents;
    expect(comp.title).toBe('40');
  });
});
