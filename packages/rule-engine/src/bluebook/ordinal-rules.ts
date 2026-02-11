import { v4 as uuid } from 'uuid';
import type { ValidationIssue } from '@legalcitation/shared';

/**
 * Validate ordinal formatting per Rule 6.2(b).
 * Use "2d" not "2nd", "3d" not "3rd" in legal citations.
 */
export function validateOrdinals(rawText: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Check for "2nd" instead of "2d"
  if (/\b2nd\b/.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 6.2(b)',
      source: 'Bluebook',
      severity: 'error',
      message: 'Use "2d" not "2nd" in legal citations.',
      suggestion: 'Replace "2nd" with "2d".',
    });
  }

  // Check for "3rd" instead of "3d"
  if (/\b3rd\b/.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 6.2(b)',
      source: 'Bluebook',
      severity: 'error',
      message: 'Use "3d" not "3rd" in legal citations.',
      suggestion: 'Replace "3rd" with "3d".',
    });
  }

  return issues;
}
