import { v4 as uuid } from 'uuid';
import type { ValidationIssue } from '@legalcitation/shared';
import { validatePageRange, validateFootnotePincite } from '@legalcitation/shared';

/**
 * Validate pincite and page range formatting per Rule 3.2.
 */
export function validatePageRanges(rawText: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Find page ranges in the citation text
  const rangePattern = /\b(\d{3,})\s*[-–—]\s*(\d{2,})\b/g;
  let match;

  while ((match = rangePattern.exec(rawText)) !== null) {
    const fullRange = match[0];
    const result = validatePageRange(fullRange);

    if (!result.isValid) {
      issues.push({
        id: uuid(),
        rule: 'R. 3.2(a)',
        source: 'Bluebook',
        severity: 'error',
        message: `Page range "${fullRange}" should drop repetitious digits: "${result.corrected}".`,
        suggestion: `Change to "${result.corrected}".`,
      });
    }

    // Check for hyphen instead of en dash
    if (fullRange.includes('-') && !fullRange.includes('–')) {
      issues.push({
        id: uuid(),
        rule: 'R. 3.2(a)',
        source: 'Bluebook',
        severity: 'suggestion',
        message: 'Consider using an en dash (–) instead of a hyphen (-) in page ranges.',
        suggestion: `Replace "-" with "–" in "${fullRange}".`,
      });
    }
  }

  // Check footnote pincites: "n. 4" should be "n.4"
  const footnotePattern = /\bn\.\s+\d+/g;
  while ((match = footnotePattern.exec(rawText)) !== null) {
    const result = validateFootnotePincite(match[0]);
    if (!result.isValid) {
      issues.push({
        id: uuid(),
        rule: 'R. 3.2',
        source: 'Bluebook',
        severity: 'error',
        message: `No space between "n." and the footnote number: "${match[0]}".`,
        suggestion: `Change to "${result.corrected}".`,
      });
    }
  }

  // Check for "p." or "pp." usage (should use "at" instead)
  if (/\bp{1,2}\.\s*\d/.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 3.2',
      source: 'Bluebook',
      severity: 'error',
      message: 'Do not use "p." or "pp." to indicate page numbers. Use "at" for pincites.',
      suggestion: 'Replace "p." or "pp." with "at".',
    });
  }

  return issues;
}
