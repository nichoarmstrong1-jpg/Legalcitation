import { describe, it, expect } from 'vitest';
import { detectCitations, extractAndParseCitations } from '../index.js';
import type { CaseComponents, StatuteComponents, ConstitutionComponents, RegulationComponents } from '@legalcitation/shared';

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

  it('does not over-highlight into surrounding prose after a full case citation', () => {
    const text = 'Pickering v. Bd. of Educ. of Twp. High Sch. Dist. 205, Will Cty., 391 U.S. 563, 582 (1968). First, the employee must prove public concern.';
    const spans = detectCitations(text);
    const pickering = spans.find(span => span.type === 'full_case' && span.text.includes('Pickering v.'));
    expect(pickering).toBeDefined();
    expect(pickering?.text).toBe('Pickering v. Bd. of Educ. of Twp. High Sch. Dist. 205, Will Cty., 391 U.S. 563, 582 (1968).');
  });

  it('keeps narrative text after Connick separate from the next citation', () => {
    const text = 'Connick v. Myers, 461 U.S. 138, 148 (1983). Public concern refers to "subjects of legitimate news interest." City of San Diego v. Roe, 543 U.S. 77, 84 (2004).';
    const spans = detectCitations(text);
    const connick = spans.find(span => span.type === 'full_case' && span.text.includes('Connick v. Myers'));
    const roe = spans.find(span => span.type === 'full_case' && span.text.includes('City of San Diego v. Roe'));

    expect(connick).toBeDefined();
    expect(connick?.text).toBe('Connick v. Myers, 461 U.S. 138, 148 (1983).');
    expect(roe).toBeDefined();
    expect(roe?.text).toBe('City of San Diego v. Roe, 543 U.S. 77, 84 (2004).');
  });

  it('detects adjacent full citations and trailing Id. in sequence', () => {
    const text = [
      'Pickering v. Bd. of Educ. of Twp. High Sch. Dist. 205, Will Cty., 391 U.S. 563, 582 (1968).',
      'Bryson v. Waycross, 888 F.2d 1562, 1565 (11th Cir. 1989).',
      'Id. at 1566.',
    ].join(' ');
    const parsed = extractAndParseCitations(text);
    expect(parsed.length).toBeGreaterThanOrEqual(3);
    expect(parsed[0].type).toBe('case');
    expect(parsed[1].type).toBe('case');
    expect(parsed[2].type).toBe('id');
    expect(parsed[1].rawText).toContain('Bryson v. Waycross');
  });

  it('detects a case with parallel reporters as one full-case span', () => {
    const text = 'Molinaro v. New Jersey, 396 U.S. 365, 90 S. Ct. 498, 24 L. Ed. 2d 586 (1970).';
    const spans = detectCitations(text);
    expect(spans.length).toBeGreaterThanOrEqual(1);
    const full = spans.find(span => span.type === 'full_case');
    expect(full).toBeDefined();
    expect(full?.text).toContain('396 U.S. 365, 90 S. Ct. 498, 24 L. Ed. 2d 586 (1970).');
  });

  it('detects wrapped-line citations from brief-style text', () => {
    const text = 'United States v. Timbers\nPreserve, Routt Cnty., Colo., 999 F.2d 452, 453\n(10th Cir. 1993).';
    const spans = detectCitations(text);
    const timbers = spans.find(span => span.type === 'full_case' && span.text.includes('Timbers'));
    expect(timbers).toBeDefined();
    expect(timbers?.text).toContain('999 F.2d 452, 453');
    expect(timbers?.text).toContain('(10th Cir. 1993).');
  });

  it('detects TOA-style case lines without including dot leaders and page locators', () => {
    const text = 'Molinaro v. New Jersey, 396 U.S. 365 (1970) ............ 3';
    const spans = detectCitations(text);
    const molinaro = spans.find(span => span.type === 'full_case' && span.text.includes('Molinaro v.'));
    expect(molinaro).toBeDefined();
    expect(molinaro?.text).toBe('Molinaro v. New Jersey, 396 U.S. 365 (1970)');
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

describe('detectCitations — geographic case names with commas', () => {
  it('captures full citation including first party for "Anderson v. Burke Cnty., Ga."', () => {
    const spans = detectCitations('Anderson v. Burke Cnty., Ga., 239 F.3d 1216 (11th Cir. 2001).');
    expect(spans.length).toBe(1);
    expect(spans[0].text).toContain('Anderson v.');
    expect(spans[0].text).toContain('Burke Cnty., Ga.');
  });

  it('handles city/state designations', () => {
    const spans = detectCitations('Smith v. City of Chicago, Ill., 500 F.3d 100 (7th Cir. 2007).');
    expect(spans.length).toBe(1);
    expect(spans[0].text).toContain('Smith v.');
  });

  it('handles board/district designations', () => {
    const spans = detectCitations('Johnson v. Bd. of Educ., Springfield, 400 F.3d 500 (7th Cir. 2005).');
    expect(spans.length).toBe(1);
    expect(spans[0].text).toContain('Johnson v.');
  });
});

describe('extractAndParseCitations — geographic case names', () => {
  it('parses Anderson v. Burke Cnty. with correct components', () => {
    const results = extractAndParseCitations('Anderson v. Burke Cnty., Ga., 239 F.3d 1216 (11th Cir. 2001).');
    expect(results.length).toBe(1);
    const comp = results[0].components as CaseComponents;
    expect(comp.partyOne).toContain('Anderson');
    expect(comp.volume).toBe('239');
    expect(comp.reporter).toBe('F.3d');
    expect(comp.firstPage).toBe('1216');
    expect(comp.court).toBe('11th Cir.');
    expect(comp.year).toBe('2001');
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
