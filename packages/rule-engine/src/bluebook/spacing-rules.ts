import { v4 as uuid } from 'uuid';
import type { ValidationIssue } from '@legalcitation/shared';

/**
 * Validate abbreviation spacing per Rule 6.1(a).
 *
 * - Adjacent single capitals: NO space → S.D.N.Y., D.C.
 * - Single capital + longer abbreviation: space → D. Mass., S.D. Cal.
 * - Ordinals in reporter series: F.2d, F.3d, F. Supp. 2d
 */
export function validateSpacing(rawText: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Check for incorrect spacing in abbreviations

  // Bad: "F.Supp." should be "F. Supp."
  checkMissingSpace(rawText, issues);

  // Bad: "S. D. N. Y." should be "S.D.N.Y."
  checkExtraSpace(rawText, issues);

  // Bad: "F. 3d" should be "F.3d"
  checkReporterSeriesSpacing(rawText, issues);

  return issues;
}

function checkMissingSpace(text: string, issues: ValidationIssue[]): void {
  // Single capital followed immediately by a multi-letter abbreviation (no space)
  // e.g., "F.Supp." should be "F. Supp."
  const pattern = /\b([A-Z]\.)((?:[A-Z][a-z]+\.)|(?:Supp\.)|(?:App\.)|(?:Dist\.)|(?:Bankr\.))/g;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    const bad = match[0];
    const corrected = `${match[1]} ${match[2]}`;
    issues.push({
      id: uuid(),
      rule: 'R. 6.1(a)',
      source: 'Bluebook',
      severity: 'error',
      message: `Missing space in "${bad}". A space is required between a single capital and a longer abbreviation.`,
      suggestion: `Change to "${corrected}".`,
    });
  }
}

function checkExtraSpace(text: string, issues: ValidationIssue[]): void {
  // Adjacent single capitals should NOT have spaces between them
  // e.g., "S. D. N. Y." should be "S.D.N.Y."
  const pattern = /\b([A-Z]\.)\s+([A-Z]\.)\s+([A-Z]\.)\s+([A-Z]\.)/g;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    const bad = match[0];
    const corrected = bad.replace(/\.\s+/g, '.').replace(/([A-Z])$/, '$1');
    if (bad !== corrected) {
      issues.push({
        id: uuid(),
        rule: 'R. 6.1(a)',
        source: 'Bluebook',
        severity: 'error',
        message: `Extra spaces in "${bad}". Adjacent single capitals should not have spaces between them.`,
        suggestion: `Change to "${corrected}".`,
      });
    }
  }

  // Two adjacent single capitals with space: "S. D." → "S.D." (only if both single caps)
  const twoCapPattern = /\b([A-Z]\.)\s+([A-Z]\.(?=[A-Z]|\s*[A-Z]|\s*$))/g;
  while ((match = twoCapPattern.exec(text)) !== null) {
    // Only flag if followed by another single cap or end
    const nextChar = text[match.index + match[0].length];
    if (nextChar && /[A-Z]/.test(nextChar)) {
      // Part of a longer abbreviation like "S. D.N.Y." → this is mixed
      // Let other rules handle it
    }
  }
}

function checkReporterSeriesSpacing(text: string, issues: ValidationIssue[]): void {
  // Bad: "F. 2d" or "F. 3d" should be "F.2d" or "F.3d"
  const badSeriesPattern = /\b(F|A|P|S\.E|S\.W|N\.E|N\.W|So)\.\s+(2d|3d|4th)\b/g;
  let match;
  while ((match = badSeriesPattern.exec(text)) !== null) {
    // Only flag single-letter reporter abbreviations (F., A., P.)
    if (match[1].length === 1) {
      const bad = match[0];
      const corrected = `${match[1]}.${match[2]}`;
      issues.push({
        id: uuid(),
        rule: 'R. 6.1(a)',
        source: 'Bluebook',
        severity: 'error',
        message: `Incorrect spacing in "${bad}". Single-capital reporter and ordinal series should have no space.`,
        suggestion: `Change to "${corrected}".`,
      });
    }
  }

  // Bad: "F.Supp.2d" should be "F. Supp. 2d"
  const compactSuppPattern = /F\.Supp\.(\s*)(2d|3d)/g;
  while ((match = compactSuppPattern.exec(text)) !== null) {
    if (match[1] !== ' ') {
      issues.push({
        id: uuid(),
        rule: 'R. 6.1(a)',
        source: 'Bluebook',
        severity: 'error',
        message: `Incorrect spacing. "F.Supp.${match[2]}" should be "F. Supp. ${match[2]}".`,
        suggestion: `Change to "F. Supp. ${match[2]}".`,
      });
    }
  }
}
