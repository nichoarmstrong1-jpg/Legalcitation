import { v4 as uuid } from 'uuid';
import type { ValidationIssue, ParsedCitation } from '@legalcitation/shared';

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
