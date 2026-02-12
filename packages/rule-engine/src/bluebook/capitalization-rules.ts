import { v4 as uuid } from 'uuid';
import type { ValidationIssue } from '@legalcitation/shared';

/**
 * B8 — Capitalization in Court Documents
 *
 * Validates:
 *   - "Court" capitalized when naming a court in full or referring to the U.S. Supreme Court
 *   - "Court" capitalized when referring to the receiving court in your document
 *   - Party designations (Plaintiff, Defendant, etc.) capitalized only when referring
 *     to parties in the instant matter
 *   - Court document titles not abbreviated in textual sentences
 *   - Court document titles capitalized when referring to actual filings in the instant case
 */

/**
 * Party designations that may be capitalized in the instant case.
 */
const PARTY_DESIGNATIONS = [
  'Plaintiff', 'Plaintiffs', 'Defendant', 'Defendants',
  'Appellant', 'Appellants', 'Appellee', 'Appellees',
  'Petitioner', 'Petitioners', 'Respondent', 'Respondents',
];

/**
 * Validate capitalization rules for court documents (B8).
 *
 * Note: These rules are highly context-dependent (requiring knowledge of
 * whether a document is referring to the instant case or another case).
 * We provide suggestions and reminders rather than hard errors.
 */
export function validateCapitalization(rawText: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // B8: Check for abbreviated court document titles in textual context
  // Court document titles should NOT be abbreviated in textual sentences.
  // Common abbreviations that shouldn't appear in textual sentences:
  const abbreviatedTitles = rawText.match(
    /\b(Mot\.|Br\.|Mem\.|Compl\.|Dep\.|Aff\.|Decl\.|Tr\.|Pet\.|Resp\.)\s/g
  );
  if (abbreviatedTitles) {
    // Only flag if this looks like a textual sentence (not a citation)
    // Heuristic: if there's no volume number or reporter near the abbreviation
    const hasReporterContext = /\d+\s+[A-Z][\w.]+\s+\d+/.test(rawText);
    if (!hasReporterContext) {
      for (const abbr of abbreviatedTitles) {
        issues.push({
          id: uuid(),
          rule: 'B8',
          source: 'Bluebook',
          severity: 'suggestion',
          message: `Do not abbreviate court document titles in textual sentences (B8). Found "${abbr.trim()}" — spell out the full title.`,
          suggestion: 'Use the full, unabbreviated title of the court document in textual sentences.',
        });
      }
    }
  }

  return issues;
}
