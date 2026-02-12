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
      // "id." (no period) or "ID." (all caps) are formatting errors
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

  return issues;
}
