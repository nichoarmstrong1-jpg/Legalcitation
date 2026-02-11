import { v4 as uuid } from 'uuid';
import type { ValidationIssue, CaseComponents } from '@legalcitation/shared';

/**
 * Validate date/year formatting per Rule 10.5.
 */
export function validateDate(components: CaseComponents, rawText: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Year must be a 4-digit number
  if (components.year && !/^\d{4}$/.test(components.year)) {
    issues.push({
      id: uuid(),
      rule: 'R. 10.5',
      source: 'Bluebook',
      severity: 'error',
      message: `Year "${components.year}" should be a 4-digit year.`,
      suggestion: 'Provide a valid 4-digit year.',
    });
  }

  // Year should be reasonable (1600–current year)
  if (components.year) {
    const year = parseInt(components.year, 10);
    const currentYear = new Date().getFullYear();
    if (year < 1600 || year > currentYear + 1) {
      issues.push({
        id: uuid(),
        rule: 'R. 10.5',
        source: 'Bluebook',
        severity: 'warning',
        message: `Year ${year} seems unusual. Verify the year is correct.`,
        suggestion: `Expected a year between 1600 and ${currentYear}.`,
      });
    }
  }

  // Check that year is in parentheses in the raw text
  if (components.year && !new RegExp(`\\(.*${components.year}.*\\)`).test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 10.5',
      source: 'Bluebook',
      severity: 'error',
      message: 'Year of decision must appear in a parenthetical.',
      suggestion: `Enclose the year in parentheses: (${components.court ? components.court + ' ' : ''}${components.year}).`,
    });
  }

  // For electronic database citations, check for full date
  if (components.database) {
    // Should have full date format (Month Day, Year)
    const fullDatePattern = /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.\s+\d{1,2},\s+\d{4}\b/;
    if (!fullDatePattern.test(rawText)) {
      issues.push({
        id: uuid(),
        rule: 'R. 10.5(b)',
        source: 'Bluebook',
        severity: 'warning',
        message: 'Electronic database and unreported cases should include the full date of decision.',
        suggestion: 'Include the full date (e.g., "Jan. 15, 2023") in the date parenthetical.',
      });
    }
  }

  return issues;
}
