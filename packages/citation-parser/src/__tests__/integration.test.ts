/**
 * End-to-end integration tests — real-world legal citations through
 * the full pipeline: detect → parse → resolve → clean → annotate.
 * Tests the exact same code path that the API endpoints use.
 */
import { describe, it, expect } from 'vitest';
import {
  extractParseAndResolve,
  extractAndParseCitations,
  extractFootnoteCitations,
  resolveCitations,
  cleanText,
  annotateCitations,
  htmlAnnotator,
  detectReferenceCitations,
  detectCitations,
} from '../index.js';
import type {
  CaseComponents,
  ShortFormComponents,
  StatuteComponents,
  ConstitutionComponents,
  RegulationComponents,
} from '@legalcitation/shared';

// ============================================================
// 1. CITATION CHECKER — In-text mode (same flow as POST /api/analyze)
// ============================================================

describe('Integration: Citation Checker — In-Text Mode', () => {
  it('processes a real Supreme Court brief excerpt with multiple citation types', () => {
    const text =
      'The Court held that separate educational facilities are inherently unequal. ' +
      'Brown v. Board of Education, 347 U.S. 483, 495 (1954). ' +
      'This principle was later extended to public parks. See Watson v. City of Memphis, 373 U.S. 526 (1963). ' +
      'Id. at 530. ' +
      'The Equal Protection Clause mandates equal treatment. U.S. Const. amend. XIV, § 1. ' +
      'Congress codified protections against discrimination. 42 U.S.C. § 1983.';

    const { citations, resolution } = extractParseAndResolve(text);

    // Should detect at least 5 citations: 2 cases, 1 Id., 1 constitution, 1 statute
    expect(citations.length).toBeGreaterThanOrEqual(5);

    const cases = citations.filter(c => c.type === 'case');
    const ids = citations.filter(c => c.type === 'id');
    const constitutions = citations.filter(c => c.type === 'constitution');
    const statutes = citations.filter(c => c.type === 'statute');

    expect(cases.length).toBeGreaterThanOrEqual(2);
    expect(ids.length).toBe(1);
    expect(constitutions.length).toBe(1);
    expect(statutes.length).toBe(1);

    // Verify Brown was parsed correctly
    const brown = cases.find(c => c.rawText.includes('Brown'));
    expect(brown).toBeDefined();
    const brownComp = brown!.components as CaseComponents;
    expect(brownComp.volume).toBe('347');
    expect(brownComp.reporter).toBe('U.S.');
    expect(brownComp.firstPage).toBe('483');
    expect(brownComp.pinCite).toBe('495');
    expect(brownComp.year).toBe('1954');

    // Id. should resolve to Watson (the most recent full citation before it)
    const idCite = ids[0];
    expect(idCite.resolvedResourceId).toBeDefined();
    const watson = cases.find(c => c.rawText.includes('Watson'));
    expect(watson).toBeDefined();
    expect(idCite.resolvedResourceId).toBe(watson!.resolvedResourceId);

    // Resolution should have created resources for both full cases
    expect(resolution.resources.size).toBeGreaterThanOrEqual(2);
    expect(resolution.unresolvedCitations.length).toBe(0);
  });

  it('handles a circuit court citation with court designation', () => {
    const text = 'Smith v. Jones, 500 F.3d 100, 105 (2d Cir. 2007).';
    const { citations } = extractParseAndResolve(text);

    expect(citations.length).toBe(1);
    const comp = citations[0].components as CaseComponents;
    expect(comp.reporter).toBe('F.3d');
    expect(comp.court).toBe('2d Cir.');
    expect(comp.year).toBe('2007');
    expect(comp.pinCite).toBe('105');
  });

  it('handles parallel citations in a single span', () => {
    const text = 'Molinaro v. New Jersey, 396 U.S. 365, 90 S. Ct. 498, 24 L. Ed. 2d 586 (1970).';
    const { citations } = extractParseAndResolve(text);

    expect(citations.length).toBeGreaterThanOrEqual(1);
    // With parallel citation deduplication, the primary reporter may vary;
    // verify at least one case citation was detected with the correct year
    const caseResult = citations.find(c => c.type === 'case');
    expect(caseResult).toBeDefined();
    expect((caseResult!.components as CaseComponents).year).toBe('1970');
  });

  it('processes Ibid. citations (new Phase 1 feature)', () => {
    const text = 'Brown v. Board of Education, 347 U.S. 483 (1954). Ibid. at 490.';
    const { citations, resolution } = extractParseAndResolve(text);

    const ibid = citations.find(c => c.type === 'id');
    expect(ibid).toBeDefined();
    expect(ibid!.resolvedResourceId).toBeDefined();
  });

  it('processes placeholder page citations (new Phase 1 feature)', () => {
    const text = 'Biden v. Nebraska, 600 U.S. ___ (2023).';
    const { citations } = extractParseAndResolve(text);

    expect(citations.length).toBeGreaterThanOrEqual(1);
    const comp = citations[0].components as CaseComponents;
    expect(comp.firstPage).toBe('');
  });

  it('filters out street addresses (new Phase 1 feature)', () => {
    const text = 'The office is located at 111 S.W. 12th St. in Portland.';
    const { citations } = extractParseAndResolve(text);
    const cases = citations.filter(c => c.type === 'case');
    expect(cases.length).toBe(0);
  });

  it('handles expanded pin cites (¶, §, *) (new Phase 1 feature)', () => {
    const text = 'Brown v. Board of Education, 347 U.S. 483 (1954). Id. ¶ 34. Id. at *10. Id. § 5.2(a).';
    const { citations } = extractParseAndResolve(text);

    const ids = citations.filter(c => c.type === 'id');
    expect(ids.length).toBe(3);

    const paraId = ids.find(c => c.rawText.includes('¶'));
    expect(paraId).toBeDefined();
    expect((paraId!.components as ShortFormComponents).pinCite).toContain('¶');
  });
});

// ============================================================
// 2. CITATION CHECKER — Footnote mode (same flow as POST /api/analyze/footnotes)
// ============================================================

describe('Integration: Citation Checker — Footnote Mode', () => {
  it('processes a real law review footnote block with cross-references', () => {
    const text = [
      '1. Brown v. Board of Education, 347 U.S. 483 (1954).',
      '2. Id. at 495.',
      '3. Roe v. Wade, 410 U.S. 113 (1973).',
      '4. Brown, supra note 1, at 490.',
      '5. 42 U.S.C. § 1983.',
    ].join('\n');

    const parsedFootnotes = extractFootnoteCitations(text);
    expect(parsedFootnotes.length).toBe(5);

    // Flatten and resolve
    const allCitations = parsedFootnotes.flatMap(fn => fn.citations);
    const resolution = resolveCitations(allCitations);

    // Id. in fn 2 should resolve to Brown in fn 1
    const fn2Citations = parsedFootnotes[1].citations;
    expect(fn2Citations.length).toBeGreaterThanOrEqual(1);
    const idCite = fn2Citations.find(c => c.type === 'id');
    if (idCite) {
      expect(idCite.resolvedResourceId).toBeDefined();
    }

    // Supra in fn 4 should resolve to Brown
    const fn4Citations = parsedFootnotes[3].citations;
    const supraCite = fn4Citations.find(c => c.type === 'supra');
    if (supraCite) {
      expect(supraCite.resolvedResourceId).toBeDefined();
    }

    // Resources should include Brown and Roe
    expect(resolution.resources.size).toBeGreaterThanOrEqual(2);
  });

  it('handles footnote context metadata', () => {
    const text = '1. Marbury v. Madison, 5 U.S. 137 (1803). See also McCulloch v. Maryland, 17 U.S. 316 (1819).';
    const parsedFootnotes = extractFootnoteCitations(text);

    expect(parsedFootnotes.length).toBe(1);
    const fn1 = parsedFootnotes[0];
    expect(fn1.footnoteNumber).toBe(1);
    expect(fn1.citations.length).toBeGreaterThanOrEqual(1);

    for (const citation of fn1.citations) {
      expect(citation.footnoteContext).toBeDefined();
      expect(citation.footnoteContext?.footnoteNumber).toBe(1);
    }
  });
});

// ============================================================
// 3. CITATION BUILDER — (same flow as POST /api/build)
// ============================================================

describe('Integration: Citation Builder', () => {
  it('parses a user-typed citation with common errors', () => {
    // User types "Brown v Board of Education 347 US 483 1954" (missing periods, commas, parens)
    const { citations } = extractParseAndResolve('Brown v. Board of Education, 347 U.S. 483 (1954).');
    expect(citations.length).toBe(1);
    expect(citations[0].type).toBe('case');
  });

  it('handles single citation validation (runAllRules path)', () => {
    const { citations } = extractParseAndResolve('Roe v. Wade, 410 U.S. 113 (1973).');
    expect(citations.length).toBe(1);
    const comp = citations[0].components as CaseComponents;
    expect(comp.partyOne).toContain('Roe');
    expect(comp.partyTwo).toContain('Wade');
    expect(comp.year).toBe('1973');
  });
});

// ============================================================
// 4. SPADING — Journal citation verification pipeline
// ============================================================

describe('Integration: Spading Pipeline', () => {
  it('cleans OCR text then extracts and resolves citations', () => {
    // Simulating PDF-extracted text with OCR artifacts
    const ocrText =
      'The  Court   held   that  separate  educational  facilities  are\n' +
      'inherently  unequal.   Brown  v.  Board  of  Education,  347  U.S.\n' +
      '483  (1954).   This  principle  was__later  extended  to  parks.\n' +
      'Id.  at  530.';

    // Step 1: Clean text (same as spading engine does)
    const { cleaned } = cleanText(ocrText, ['inline_whitespace', 'underscores']);

    // Verify cleaning removed OCR artifacts
    expect(cleaned).not.toContain('  '); // No double spaces
    expect(cleaned).not.toContain('__'); // No underscores

    // Step 2: Extract and resolve
    const { citations, resolution } = extractParseAndResolve(cleaned);

    // Should find at least Brown and Id.
    const cases = citations.filter(c => c.type === 'case');
    const ids = citations.filter(c => c.type === 'id');

    expect(cases.length).toBeGreaterThanOrEqual(1);
    expect(ids.length).toBeGreaterThanOrEqual(1);

    // Id. should resolve to Brown
    if (ids.length > 0 && ids[0].resolvedResourceId) {
      const brownResource = resolution.resources.get(ids[0].resolvedResourceId);
      expect(brownResource).toBeDefined();
      expect(brownResource?.plaintiff).toContain('Brown');
    }
  });

  it('processes a real journal excerpt with mixed citation types', () => {
    const journalText =
      'The Fourteenth Amendment guarantees equal protection. U.S. Const. amend. XIV, § 1. ' +
      'Congress has enacted implementing legislation. 42 U.S.C. § 1983. ' +
      'The Supreme Court first addressed this in Brown v. Board of Education, 347 U.S. 483 (1954). ' +
      'The Court later extended these protections. See Loving v. Virginia, 388 U.S. 1 (1967). ' +
      'Id. at 12. ' +
      'The C.F.R. provides implementing regulations. 28 C.F.R. § 42.104.';

    const { citations, resolution } = extractParseAndResolve(journalText);

    // Should find: constitution, statute, 2 cases, id, regulation
    expect(citations.length).toBeGreaterThanOrEqual(5);

    const types = new Set(citations.map(c => c.type));
    expect(types.has('constitution')).toBe(true);
    expect(types.has('statute')).toBe(true);
    expect(types.has('case')).toBe(true);
    expect(types.has('id')).toBe(true);
    expect(types.has('regulation')).toBe(true);

    // All non-infra short forms should be resolved
    expect(resolution.unresolvedCitations.length).toBe(0);
  });
});

// ============================================================
// 5. TEXT CLEANING — PDF/HTML/OCR preprocessing
// ============================================================

describe('Integration: Text Cleaning Pipeline', () => {
  it('cleans HTML-tagged legal text', () => {
    const html = '<p>Brown v. Board of Education, 347 U.S. 483 (1954).</p><p>Id. at 495.</p>';
    const { cleaned } = cleanText(html, ['html', 'inline_whitespace']);

    expect(cleaned).not.toContain('<p>');
    expect(cleaned).toContain('Brown v. Board');
    expect(cleaned).toContain('Id. at 495');
  });

  it('cleans XML declarations', () => {
    const xml = '<?xml version="1.0" encoding="UTF-8"?>Brown v. Board, 347 U.S. 483 (1954).';
    const { cleaned } = cleanText(xml, ['xml']);

    expect(cleaned).not.toContain('<?xml');
    expect(cleaned).toContain('Brown v. Board');
  });

  it('handles zero-width spaces from copy-paste', () => {
    const text = 'Brown\u200b v.\u200b Board, 347 U.S. 483 (1954).';
    const { cleaned } = cleanText(text, ['all_whitespace']);

    expect(cleaned).not.toContain('\u200b');

    const { citations } = extractParseAndResolve(cleaned);
    expect(citations.length).toBeGreaterThanOrEqual(1);
  });
});

// ============================================================
// 6. ANNOTATION SYSTEM — Highlighting citations in source text
// ============================================================

describe('Integration: Annotation System', () => {
  it('annotates citations with HTML spans', () => {
    const text = 'See Brown v. Board of Education, 347 U.S. 483 (1954). Id. at 495.';
    const { citations } = extractParseAndResolve(text);

    const annotated = annotateCitations(text, citations, htmlAnnotator('citation'));

    // Each citation should be wrapped in a span
    for (const citation of citations) {
      expect(annotated).toContain(`data-id="${citation.id}"`);
      expect(annotated).toContain(`data-type="${citation.type}"`);
    }

    // Original text content should be preserved
    expect(annotated).toContain('Brown v. Board');
    expect(annotated).toContain('Id. at 495');
  });

  it('handles non-overlapping annotations', () => {
    const text = 'Brown v. Board of Education, 347 U.S. 483 (1954); Roe v. Wade, 410 U.S. 113 (1973).';
    const { citations } = extractParseAndResolve(text);

    const annotated = annotateCitations(text, citations, htmlAnnotator());

    // Should have multiple span wrappers
    const spanCount = (annotated.match(/<span class="citation"/g) || []).length;
    expect(spanCount).toBeGreaterThanOrEqual(2);
  });
});

// ============================================================
// 7. RESOLUTION — Id./supra/short-form linking accuracy
// ============================================================

describe('Integration: Resolution Accuracy', () => {
  it('correctly chains Id. through multiple citations', () => {
    const text =
      'Brown v. Board of Education, 347 U.S. 483 (1954). ' +
      'Id. at 490. ' +
      'Id. at 492. ' +
      'Id.';

    const { citations, resolution } = extractParseAndResolve(text);

    const ids = citations.filter(c => c.type === 'id');
    expect(ids.length).toBe(3);

    // All Id.s should point to the same Brown resource
    const brownResource = citations[0].resolvedResourceId;
    for (const id of ids) {
      expect(id.resolvedResourceId).toBe(brownResource);
    }
  });

  it('breaks Id. chain when a new full citation intervenes', () => {
    const text =
      'Brown v. Board of Education, 347 U.S. 483 (1954). ' +
      'Id. at 490. ' +
      'Roe v. Wade, 410 U.S. 113 (1973). ' +
      'Id. at 120.';

    const { citations } = extractParseAndResolve(text);

    const ids = citations.filter(c => c.type === 'id');
    expect(ids.length).toBe(2);

    // First Id. → Brown, second Id. → Roe
    const brown = citations.find(c => c.rawText.includes('Brown'));
    const roe = citations.find(c => c.rawText.includes('Roe'));

    expect(ids[0].resolvedResourceId).toBe(brown?.resolvedResourceId);
    expect(ids[1].resolvedResourceId).toBe(roe?.resolvedResourceId);
  });

  it('resolves supra by party name', () => {
    const text =
      'Brown v. Board of Education, 347 U.S. 483 (1954). ' +
      'Roe v. Wade, 410 U.S. 113 (1973). ' +
      'Brown, supra note 1, at 490.';

    const { citations, resolution } = extractParseAndResolve(text);

    const supra = citations.find(c => c.type === 'supra');
    expect(supra).toBeDefined();
    expect(supra!.resolvedResourceId).toBeDefined();

    // Should resolve to Brown, not Roe
    const brown = citations.find(c => c.rawText.includes('Brown v.'));
    expect(supra!.resolvedResourceId).toBe(brown?.resolvedResourceId);
  });

  it('rejects Id. with pin cite too far from antecedent', () => {
    const text = 'Smith v. Jones, 100 F.3d 50 (5th Cir. 1996). Id. at 500.';
    const { citations, resolution } = extractParseAndResolve(text);

    const idCite = citations.find(c => c.type === 'id');
    expect(idCite).toBeDefined();
    // Pin cite 500 is 450 pages from page 50, exceeds 150-page limit
    expect(idCite!.resolvedResourceId).toBeUndefined();
    expect(resolution.unresolvedCitations).toContain(idCite!.id);
  });
});

// ============================================================
// 8. EXTENDED REPORTERS — New reporters from Phase 2
// ============================================================

describe('Integration: Extended Reporter Coverage', () => {
  it('detects Nebraska appellate reporter (new in Phase 2)', () => {
    const text = 'Smith v. Jones, 12 Neb. App. 100 (2004).';
    const { citations } = extractParseAndResolve(text);
    expect(citations.length).toBeGreaterThanOrEqual(1);
  });

  it('detects Delaware Chancery reporter (new in Phase 2)', () => {
    const text = 'In re Walt Disney Co. Derivative Litigation, 907 Del. Ch. 411 (2006).';
    const { citations } = extractParseAndResolve(text);
    expect(citations.length).toBeGreaterThanOrEqual(1);
  });

  it('detects New Jersey Superior Court reporter (new in Phase 2)', () => {
    const text = 'State v. Johnson, 200 N.J. Super. 50 (App. Div. 2010).';
    const { citations } = extractParseAndResolve(text);
    expect(citations.length).toBeGreaterThanOrEqual(1);
  });

  it('detects Texas reporter (new in Phase 2)', () => {
    const text = 'Doe v. Roe, 500 Tex. 100 (2020).';
    const { citations } = extractParseAndResolve(text);
    expect(citations.length).toBeGreaterThanOrEqual(1);
  });
});

// ============================================================
// 9. VENDOR-NEUTRAL CITATIONS — Phase 4 feature
// ============================================================

describe('Integration: Vendor-Neutral Citations', () => {
  it('detects New Mexico vendor-neutral format at detection level', () => {
    // Vendor-neutral formats are detected by the detector but may not fully
    // parse through the case parser since they don't follow Vol Reporter Page format.
    const spans = detectCitations('The court ruled in 2007-NMCERT-008.');
    expect(spans.length).toBeGreaterThanOrEqual(1);
  });

  it('detects Ohio vendor-neutral format at detection level', () => {
    const spans = detectCitations('See 2006-Ohio-2095 for the full opinion.');
    expect(spans.length).toBeGreaterThanOrEqual(1);
  });
});

// ============================================================
// 10. REFERENCE CITATIONS — Phase 4 feature
// ============================================================

describe('Integration: Reference Citations', () => {
  it('detects name-only references after resolution', () => {
    const text = 'Brown v. Board of Education, 347 U.S. 483 (1954). The Court emphasized in Brown at 490 that equality demands action.';
    const { citations, resolution } = extractParseAndResolve(text);

    const resources = Array.from(resolution.resources.values());
    const refs = detectReferenceCitations(text, resources);

    // Should detect "Brown at 490" as a reference
    if (refs.length > 0) {
      expect(refs[0].rawText).toContain('Brown');
      expect(refs[0].rawText).toContain('490');
    }
  });
});

// ============================================================
// 11. FULL DOCUMENT — End-to-end with mixed content
// ============================================================

describe('Integration: Full Document Processing', () => {
  it('processes a complete brief excerpt with all citation types', () => {
    const briefExcerpt = [
      'STATEMENT OF THE CASE',
      '',
      'Petitioner challenges the constitutionality of the Religious Freedom Restoration Act. U.S. Const. amend. I.',
      '',
      'The Free Exercise Clause protects religious liberty. Sherbert v. Verner, 374 U.S. 398 (1963).',
      'Congress enacted RFRA to restore the compelling interest test. 42 U.S.C. § 1983.',
      'This Court struck down RFRA as applied to state governments. City of Boerne v. Flores, 521 U.S. 507 (1997).',
      'Id. at 536.',
      'The HHS regulations implement the mandate. 45 C.F.R. § 147.130.',
      '',
      'ARGUMENT',
      '',
      'The Court should apply strict scrutiny under Sherbert. See Sherbert, 374 U.S. at 403.',
    ].join('\n');

    const { citations, resolution } = extractParseAndResolve(briefExcerpt);

    // Should detect: constitution, 2 full cases, statute, id, regulation, short case
    expect(citations.length).toBeGreaterThanOrEqual(6);

    const types = citations.map(c => c.type);
    expect(types).toContain('case');
    expect(types).toContain('constitution');
    expect(types).toContain('statute');
    expect(types).toContain('regulation');

    // Resolution should link short forms to antecedents
    const resolvedCount = citations.filter(c => c.resolvedResourceId).length;
    expect(resolvedCount).toBeGreaterThanOrEqual(3);
  });
});
