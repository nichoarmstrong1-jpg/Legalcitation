import { v4 as uuid } from 'uuid';
import type {
  ValidationIssue,
  ParsedCitation,
  CaseComponents,
  ArticleComponents,
} from '@legalcitation/shared';

/**
 * B2 — Typeface for Court Documents
 *
 * In non-academic legal documents (Bluepages), two typefaces are used:
 * ordinary type and italics (or underscoring).
 *
 * Italicize/underscore in citations:
 *   - Case names, including procedural phrases
 *   - Titles of books and articles
 *   - Titles of some legislative materials
 *   - Introductory signals
 *   - Explanatory phrases introducing subsequent history
 *   - Cross references (id., supra)
 *   - Words/phrases introducing related authority ("quoted in")
 *
 * Italicize/underscore in text:
 *   - Publication titles (e.g., The New York Times)
 *   - Words italicized in original source quotations
 *   - Uncommon foreign words
 *
 * Key Bluepages vs. Whitepages difference:
 *   - Bluepages: Full AND short case names are italicized
 *   - Whitepages: Only SHORT form case names are italicized
 *   - Bluepages: SMALL CAPS not required (optional for style)
 *   - Whitepages: SMALL CAPS for authors/titles of books and periodicals
 */

/**
 * Subsequent history phrases that should be italicized.
 */
const HISTORY_PHRASES = [
  "aff'd", "aff'g", "rev'd", "rev'g", "vacated", "vacating",
  "modified", "modifying", "remanded", "remanding", "cert. denied",
  "cert. granted", "overruled by", "abrogated by", "superseded by",
  "amended by", "enforced by", "appeal dismissed",
];

/**
 * Cross-reference terms that should be italicized.
 */
const CROSS_REFERENCES = ['id.', 'supra', 'infra', 'hereinafter'];

/**
 * Related authority phrases that should be italicized.
 */
const RELATED_AUTHORITY_PHRASES = [
  'quoted in', 'reprinted in', 'available at', 'cited in',
];

/**
 * Validate typeface conventions for non-academic legal documents (B2).
 *
 * Note: Since we work with plain text, we can only validate structural patterns
 * rather than actual formatting. These checks flag places where italics/underscoring
 * is required so the user knows what to format.
 */
export function validateTypeface(
  citation: ParsedCitation,
  rawText: string
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // B2: Check that subsequent history phrases are present and should be italicized
  for (const phrase of HISTORY_PHRASES) {
    if (rawText.toLowerCase().includes(phrase.toLowerCase())) {
      // The phrase exists — in a formatting-aware context we'd check for italics.
      // For plain text, we note it as a reminder.
      // Only flag if there's no markup indicator (we don't flag in plain-text-only mode)
    }
  }

  // B2: "Id." should be italicized — flag if context suggests it's not
  if (citation.type === 'id') {
    // We can check for common formatting issues
    const idMatch = rawText.match(/\bid\b\./i);
    if (idMatch) {
      const matched = idMatch[0];
      // "ID." (all caps) is a formatting error
      if (matched === 'ID.') {
        issues.push({
          id: uuid(),
          rule: 'B2',
          source: 'Bluebook',
          severity: 'warning',
          message: '"Id." should not be in all capitals (B2). Use "Id." (italicized) with only the "I" capitalized.',
          suggestion: 'Change "ID." to "Id." and ensure it is italicized.',
        });
      }
    }
  }

  // B2: Check that "supra" is italicized (detect formatting issues)
  if (citation.type === 'supra') {
    if (/\bSUPRA\b/.test(rawText)) {
      issues.push({
        id: uuid(),
        rule: 'B2',
        source: 'Bluebook',
        severity: 'error',
        message: '"Supra" should not be in all capitals. It should be italicized in lowercase.',
        suggestion: 'Use "supra" (italicized) not "SUPRA".',
      });
    }
  }

  // B2: Detect mixing of italics/underscoring markers (if markup is present)
  checkTypefaceMixing(rawText, issues);

  // B2: Check that signals are formatted as italicized
  checkSignalFormatting(rawText, issues);

  // B2: Check related authority phrases
  checkRelatedAuthorityPhrases(rawText, issues);

  return issues;
}

/**
 * B2: Detect mixing of italics and underscoring within the same citation.
 */
function checkTypefaceMixing(rawText: string, issues: ValidationIssue[]): void {
  const hasItalicMarker = /<i>|<em>|\*[^*]+\*/i.test(rawText);
  const hasUnderlineMarker = /<u>|__[^_]+__/i.test(rawText);

  if (hasItalicMarker && hasUnderlineMarker) {
    issues.push({
      id: uuid(),
      rule: 'B2',
      source: 'Bluebook',
      severity: 'error',
      message: 'Do not mix italics and underscoring within the same citation. Choose one typeface convention and use it consistently.',
      suggestion: 'Use either italics or underscoring throughout, not both.',
    });
  }
}

/**
 * B2: Introductory signals should be italicized.
 * We check for common signals in ALL CAPS which suggests they're not properly formatted.
 */
function checkSignalFormatting(rawText: string, issues: ValidationIssue[]): void {
  const ALL_CAPS_SIGNALS = [
    { pattern: /\bSEE ALSO\b/, correct: 'See also' },
    { pattern: /\bSEE GENERALLY\b/, correct: 'See generally' },
    { pattern: /\bBUT SEE\b/, correct: 'But see' },
    { pattern: /\bBUT CF\.\b/, correct: 'But cf.' },
    { pattern: /\bCONTRA\b/, correct: 'Contra' },
    { pattern: /\bCOMPARE\b/, correct: 'Compare' },
  ];

  for (const { pattern, correct } of ALL_CAPS_SIGNALS) {
    if (pattern.test(rawText)) {
      issues.push({
        id: uuid(),
        rule: 'B2',
        source: 'Bluebook',
        severity: 'warning',
        message: `Signal "${rawText.match(pattern)?.[0]}" should be in italics, not all capitals.`,
        suggestion: `Use "${correct}" (italicized).`,
      });
    }
  }
}

/**
 * B2: Related authority phrases (e.g., "quoted in", "reprinted in") should be italicized.
 * Detect ALL CAPS versions as formatting errors.
 */
function checkRelatedAuthorityPhrases(rawText: string, issues: ValidationIssue[]): void {
  const CAPS_PHRASES = [
    { pattern: /\bQUOTED IN\b/, correct: 'quoted in' },
    { pattern: /\bREPRINTED IN\b/, correct: 'reprinted in' },
    { pattern: /\bAVAILABLE AT\b/, correct: 'available at' },
    { pattern: /\bCITED IN\b/, correct: 'cited in' },
  ];

  for (const { pattern, correct } of CAPS_PHRASES) {
    if (pattern.test(rawText)) {
      issues.push({
        id: uuid(),
        rule: 'B2',
        source: 'Bluebook',
        severity: 'warning',
        message: `Related authority phrase "${rawText.match(pattern)?.[0]}" should be in italics, not all capitals.`,
        suggestion: `Use "${correct}" (italicized).`,
      });
    }
  }
}

// ── Whitepages (Academic) Typeface Rules ─────────────────────────

/**
 * R. 2 — Typeface Conventions for Academic (Whitepages) Citations
 *
 * In law reviews and academic journals, three typefaces are used:
 *   1. Roman type: Full case citations in footnotes, statutes, constitutions
 *   2. Italics: Case names in textual sentences, short form case names,
 *      signals, cross-references, article/book titles, introductory phrases
 *   3. LARGE AND SMALL CAPS: Author names, journal titles, book titles,
 *      institutional authors, names of services, treaty sources
 *
 * Since we work with plain text using *asterisk* markers for italics,
 * we can detect:
 *   - Italic markers where roman is expected (and vice versa)
 *   - ALL CAPS where small caps should be used
 */
export function validateAcademicTypeface(
  citation: ParsedCitation,
  rawText: string
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // R. 2: Case name typeface depends on context
  if (citation.type === 'case') {
    checkAcademicCaseTypeface(citation, rawText, issues);
  }

  // R. 2: Article components — authors and journal in small caps
  if (citation.type === 'article') {
    checkAcademicArticleTypeface(citation, rawText, issues);
  }

  // R. 2: Short-form terms should be italicized
  if (citation.type === 'id' || citation.type === 'supra' || citation.type === 'short_form') {
    checkAcademicShortFormTypeface(citation, rawText, issues);
  }

  // R. 2: "v." should always be italicized
  checkVersusTypeface(rawText, issues);

  // R. 2: Signals should be italicized (reuse ALL CAPS detection from B2)
  checkSignalFormatting(rawText, issues);

  // R. 2: Cross-references (id., supra, infra) should be italicized
  checkAcademicCrossReferences(rawText, issues);

  // R. 2: Related authority phrases should be italicized (reuse from B2)
  checkRelatedAuthorityPhrases(rawText, issues);

  return issues;
}

/**
 * R. 2: In Whitepages footnotes, full case names use roman type (not italic).
 * In textual sentences, case names should be italicized.
 */
function checkAcademicCaseTypeface(
  citation: ParsedCitation,
  rawText: string,
  issues: ValidationIssue[]
): void {
  const components = citation.components as CaseComponents;
  const caseName = components.partyTwo
    ? `${components.partyOne} v. ${components.partyTwo}`
    : components.partyOne;

  // Check for italic markers around the case name
  const hasItalicMarkers = rawText.includes(`*${caseName}*`)
    || rawText.includes(`*${components.partyOne}*`)
    || /\*[^*]*\bv\.\s[^*]*\*/.test(rawText);

  if (citation.context === 'citation_sentence' && citation.footnoteContext) {
    // Footnote/citation sentence: full case name should be ROMAN (not italic)
    if (hasItalicMarkers) {
      issues.push({
        id: uuid(),
        rule: 'R. 2.1',
        source: 'Bluebook',
        severity: 'error',
        message: 'In academic footnotes, full case citations use roman type, not italics. Only short-form case names are italicized (R. 2.1).',
        suggestion: 'Remove italic formatting from the full case name in this footnote citation.',
      });
    }
  } else if (citation.context === 'citation_sentence' && !citation.footnoteContext) {
    // In in-text mode, citation_sentence does not imply a footnote context.
    // Skip the footnote-specific R. 2.1 roman-type warning here.
    return;
  } else if (citation.context === 'textual_sentence') {
    // Textual sentence: case name should be ITALIC
    if (!hasItalicMarkers) {
      issues.push({
        id: uuid(),
        rule: 'R. 2.1',
        source: 'Bluebook',
        severity: 'warning',
        message: 'In academic text, the case name should be italicized (R. 2.1).',
        suggestion: `Italicize the case name: *${caseName}*`,
      });
    }
  }
}

/**
 * R. 2: Article authors and journal titles should be in LARGE AND SMALL CAPS.
 * Detect ALL CAPS as a common student error (should be small caps, not all caps).
 */
function checkAcademicArticleTypeface(
  citation: ParsedCitation,
  rawText: string,
  issues: ValidationIssue[]
): void {
  const components = citation.components as ArticleComponents;

  // Check authors for ALL CAPS (should be small caps)
  for (const author of components.authors) {
    if (/^[A-Z\s]+$/.test(author.trim()) && author.trim().length > 3) {
      issues.push({
        id: uuid(),
        rule: 'R. 2.1',
        source: 'Bluebook',
        severity: 'error',
        message: `Author "${author}" appears to be in ALL CAPITALS. Use large and small caps for author names in academic citations (R. 2.1).`,
        suggestion: `Format "${author}" in large and small caps, not all capitals.`,
      });
    }
  }

  // Check journal name for ALL CAPS (should be small caps)
  const journal = components.journal?.trim();
  if (journal && /^[A-Z\s.&]+$/.test(journal) && journal.length > 5) {
    // Filter out correctly abbreviated journals (which may be mostly caps with periods)
    const hasLowercaseLetters = /[a-z]/.test(journal);
    if (!hasLowercaseLetters) {
      issues.push({
        id: uuid(),
        rule: 'R. 2.1',
        source: 'Bluebook',
        severity: 'error',
        message: `Journal title "${journal}" appears to be in ALL CAPITALS. Use large and small caps for journal titles in academic citations (R. 2.1).`,
        suggestion: `Format the journal title in large and small caps, not all capitals.`,
      });
    }
  }
}

/**
 * R. 2: Short-form citation terms (Id., supra, short case names) should be italicized.
 */
function checkAcademicShortFormTypeface(
  citation: ParsedCitation,
  rawText: string,
  issues: ValidationIssue[]
): void {
  if (citation.type === 'id') {
    // "Id." should be italicized — check for non-italicized "Id."
    const containsId = /\bId\./.test(rawText);
    const hasIdItalicMarkers = /(?:\*Id\.\*|\*Id\.|Id\.\*|_Id\._|_Id\.|Id\._)/.test(rawText);
    if (containsId && !hasIdItalicMarkers) {
      // #region agent log
      fetch('http://127.0.0.1:7472/ingest/c1a4ccbe-c7b9-4841-b61e-69a7587183b0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'9e31dc'},body:JSON.stringify({sessionId:'9e31dc',runId:'pre-fix',hypothesisId:'H6',location:'packages/rule-engine/src/bluebook/typeface-rules.ts:355',message:'Id italic warning emitted',data:{rawText:rawText.slice(0,140),containsId,hasIdItalicMarkers},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      issues.push({
        id: uuid(),
        rule: 'R. 2.1',
        source: 'Bluebook',
        severity: 'warning',
        message: '"Id." should be italicized in academic citations (R. 2.1).',
        suggestion: 'Italicize: *Id.*',
      });
    }
  }

  if (citation.type === 'supra') {
    const containsSupra = /\bsupra\b/i.test(rawText);
    const hasSupraItalicMarkers = /(?:\*supra\*|\*supra|supra\*|_supra_|_supra|supra_)/i.test(rawText);
    if (containsSupra && !hasSupraItalicMarkers) {
      issues.push({
        id: uuid(),
        rule: 'R. 2.1',
        source: 'Bluebook',
        severity: 'warning',
        message: '"supra" should be italicized in academic citations (R. 2.1).',
        suggestion: 'Italicize: *supra*',
      });
    }
  }
}

/**
 * R. 2: "v." in case names should always be italicized.
 */
function checkVersusTypeface(rawText: string, issues: ValidationIssue[]): void {
  // Check if "v." appears unitalicized (not wrapped in *markers*)
  // Only flag if "v." is present and NOT within italic markers
  const vMatch = rawText.match(/\bv\.\s/);
  if (vMatch) {
    const vIdx = rawText.indexOf(vMatch[0]);
    // Check if this "v." is inside italic markers
    const before = rawText.slice(0, vIdx);
    const afterV = rawText.slice(vIdx);
    const markersBefore = (before.match(/\*/g) || []).length;

    // If odd number of * before v., it's inside italic markers
    if (markersBefore % 2 === 0) {
      // Not inside italic markers — but only flag if case name overall is not italicized
      // (If the whole case name is in *markers*, v. is already italic)
      const fullItalicPattern = /\*[^*]*\bv\.\s[^*]*\*/;
      if (!fullItalicPattern.test(rawText)) {
        issues.push({
          id: uuid(),
          rule: 'R. 2.1',
          source: 'Bluebook',
          severity: 'suggestion',
          message: '"v." should be italicized in case names (R. 2.1).',
          suggestion: 'Ensure "v." is italicized: *v.*',
        });
      }
    }
  }
}

/**
 * R. 2: Cross-references (id., supra, infra, hereinafter) should be italicized.
 * Check for ALL CAPS versions.
 */
function checkAcademicCrossReferences(rawText: string, issues: ValidationIssue[]): void {
  const crossRefPatterns = [
    { pattern: /\bINFRA\b/, correct: 'infra' },
    { pattern: /\bHEREINAFTER\b/, correct: 'hereinafter' },
  ];

  for (const { pattern, correct } of crossRefPatterns) {
    if (pattern.test(rawText)) {
      issues.push({
        id: uuid(),
        rule: 'R. 2.1',
        source: 'Bluebook',
        severity: 'warning',
        message: `"${rawText.match(pattern)?.[0]}" should be in italics, not all capitals (R. 2.1).`,
        suggestion: `Use "${correct}" (italicized).`,
      });
    }
  }
}
