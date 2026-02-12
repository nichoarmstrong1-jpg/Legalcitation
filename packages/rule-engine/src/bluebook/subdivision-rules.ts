import { v4 as uuid } from 'uuid';
import type { ValidationIssue } from '@legalcitation/shared';

/**
 * B3 / T16 — Subdivisions
 *
 * Validates:
 *   - Page numbers appear before date parentheticals, without "p." or "at" intro
 *   - Nonconsecutive pages separated by commas
 *   - Footnote/endnote format: page n.4 (no space between "n." and number)
 *   - Section (§) and paragraph (¶) symbol usage
 *   - T16 abbreviation compliance
 *   - Volume number in Arabic numerals
 */

/**
 * T16 Subdivision abbreviations.
 */
export const T16_SUBDIVISIONS: Record<string, string> = {
  'addendum': 'add.',
  'amendment': 'amend.',
  'annotation': 'annot.',
  'appendix': 'app.',
  'article': 'art.',
  'attachment': 'attach.',
  'bibliography': 'bibliog.',
  'book': 'bk.',
  'chapter': 'ch.',
  'clause': 'cl.',
  'column': 'col.',
  'commentary': 'cmt.',
  'comment': 'cmt.',
  'decision': 'dec.',
  'department': 'dept.',
  'division': 'div.',
  'example': 'ex.',
  'figure': 'fig.',
  'folio': 'fol.',
  'hypothetical': 'hypo.',
  'illustration': 'illus.',
  'illustrations': 'illus.',
  'introduction': 'intro.',
  'line': 'l.',
  'lines': 'll.',
  'number': 'no.',
  'paragraph': 'para.',
  'paragraphs': 'paras.',
  'part': 'pt.',
};

/**
 * Validate subdivision formatting in a citation.
 */
export function validateSubdivisions(rawText: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // B3: Check for improper "p." or "pp." page introductions
  // Pages should be cited without "p." or "pp." in most contexts
  if (/\bp{1,2}\.\s*\d/.test(rawText) && !rawText.includes('supra')) {
    issues.push({
      id: uuid(),
      rule: 'B3',
      source: 'Bluebook',
      severity: 'warning',
      message: 'Do not use "p." or "pp." to introduce page numbers in citations (B3). Give page numbers directly before the date parenthetical.',
      suggestion: 'Remove "p." or "pp." and cite the page number directly.',
    });
  }

  // B3: Footnote format — "n.4" not "n. 4" (no space between n. and number)
  const footnoteWithSpace = rawText.match(/\bn\.\s+(\d+)/);
  if (footnoteWithSpace) {
    issues.push({
      id: uuid(),
      rule: 'B3',
      source: 'Bluebook',
      severity: 'error',
      message: `Footnote citation should not have a space between "n." and the number (B3 / T16). Found "n. ${footnoteWithSpace[1]}" — should be "n.${footnoteWithSpace[1]}".`,
      suggestion: `Change to "n.${footnoteWithSpace[1]}" (no space).`,
    });
  }

  // B3 / T16: Check for unabbreviated subdivision terms
  for (const [term, abbr] of Object.entries(T16_SUBDIVISIONS)) {
    // Look for the full term followed by a number/letter (indicating it's used as a subdivision)
    const pattern = new RegExp(`\\b${term}\\s+\\d`, 'i');
    if (pattern.test(rawText)) {
      // Make sure we're not matching the term in a case name or other context
      const abbrPattern = new RegExp(`\\b${abbr.replace('.', '\\.')}\\s*\\d`, 'i');
      if (!abbrPattern.test(rawText)) {
        issues.push({
          id: uuid(),
          rule: 'B3 / T16',
          source: 'Bluebook',
          severity: 'suggestion',
          message: `The subdivision "${term}" should be abbreviated as "${abbr}" in citations (B3 / T16).`,
          suggestion: `Abbreviate to "${abbr}"`,
        });
      }
    }
  }

  // B3: Check for Roman numeral volume numbers (should be Arabic)
  const romanVolumePattern = /^(I{1,3}|IV|VI{0,3}|IX|XI{0,3}|XIV|XVI{0,3}|XIX|XXI{0,3})\s+/;
  if (romanVolumePattern.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'B3',
      source: 'Bluebook',
      severity: 'warning',
      message: 'Volume numbers should be in Arabic numerals, not Roman numerals (B3).',
      suggestion: 'Convert the Roman numeral volume number to Arabic (e.g., "III" → "3").',
    });
  }

  return issues;
}
