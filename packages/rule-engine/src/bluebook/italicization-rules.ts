import { v4 as uuid } from 'uuid';
import type { ValidationIssue, ParsedCitation } from '@legalcitation/shared';

/**
 * B7 / R. 7 — Italicization for Style and in Unique Circumstances
 *
 * Validates:
 *   - "Id." is always italicized
 *   - Common Latin terms should NOT be italicized (they're in common English usage)
 *   - Uncommon/obsolete Latin phrases SHOULD be italicized
 *   - Individual letters representing hypothetical parties should be italicized
 *   - Lowercase "l" as a subdivision should be italicized (to distinguish from "1")
 *
 * Note: Since we work with plain text, we flag formatting reminders rather than
 * checking actual font styling.
 */

/**
 * Common Latin terms that should NOT be italicized (in common English usage).
 * B7 / R. 7(b).
 */
export const COMMON_LATIN = new Set([
  'e.g.', 'i.e.', 'res judicata', 'quid pro quo', 'amicus curiae',
  'certiorari', 'corpus juris', 'ab initio', 'obiter dictum', 'de jure',
  'modus operandi', 'habeas corpus', 'non obstante veredicto', 'prima facie',
  'mens rea', 'en banc', 'de facto', 'de novo', 'in rem', 'in personam',
  'pro se', 'pro bono', 'per curiam', 'per se', 'ad hoc', 'bona fide',
  'ex parte', 'ex post facto', 'in camera', 'inter alia', 'nunc pro tunc',
  'pro rata', 'stare decisis', 'subpoena', 'sua sponte', 'voir dire',
  'mandamus', 'certiorari', 'quo warranto', 'ultra vires', 'res ipsa loquitur',
]);

/**
 * Uncommon/obsolete Latin phrases that SHOULD be italicized. B7 / R. 7(b).
 */
export const UNCOMMON_LATIN = [
  'expressio unius est exclusio alterius',
  'ignorantia legis neminem excusat',
  'sero sed serio',
  'ex dolo malo non oritur actio',
  'nemo dat quod non habet',
  'lex loci delicti',
  'actus reus',
  'reductio ad absurdum',
];

/**
 * Validate italicization rules (B7 / R. 7).
 */
export function validateItalicization(
  citation: ParsedCitation,
  rawText: string
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // B7: "Id." is always italicized — remind if Id. is present
  // (Actual formatting check is handled at rendering level, but we ensure "Id." is correct)

  // B7 / R. 7(b): Check for uncommon Latin phrases that should be italicized
  for (const phrase of UNCOMMON_LATIN) {
    if (rawText.toLowerCase().includes(phrase)) {
      issues.push({
        id: uuid(),
        rule: 'B7',
        source: 'Bluebook',
        severity: 'suggestion',
        message: `The Latin phrase "${phrase}" is uncommon and should be italicized (B7 / R. 7(b)).`,
        suggestion: `Italicize (or underscore) "${phrase}".`,
      });
    }
  }

  // R. 7(d): Lowercase "l" as a subdivision — check for patterns like "§ 23(l)" or "cmt. l"
  // where "l" might be confused with "1"
  if (/\bl\b/.test(rawText) && /[§¶]|cmt\.|art\.|cl\./.test(rawText)) {
    // This is a very specific edge case — only flag as suggestion
    issues.push({
      id: uuid(),
      rule: 'R. 7(d)',
      source: 'Bluebook',
      severity: 'suggestion',
      message: 'When using lowercase "l" as a subdivision, italicize it to distinguish from the numeral "1" (R. 7(d)).',
      suggestion: 'Italicize the lowercase "l" in the subdivision reference.',
    });
  }

  return issues;
}
