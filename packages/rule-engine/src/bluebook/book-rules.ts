import { v4 as uuid } from 'uuid';
import type { ValidationIssue, BookComponents } from '@legalcitation/shared';

/**
 * Bluebook R. 15 — Books, Reports, and Other Nonperiodic Materials.
 * Validates book/treatise citation formatting per the 22nd Edition.
 */
export function validateBook(components: BookComponents, rawText?: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  checkAuthors(components, issues);
  checkTitle(components, rawText, issues);
  checkPinpoint(components, rawText, issues);
  checkParenthetical(components, issues);
  checkMultiVolume(components, issues);

  return issues;
}

function checkAuthors(components: BookComponents, issues: ValidationIssue[]): void {
  if (!components.authors || components.authors.length === 0) {
    issues.push({
      id: uuid(),
      rule: 'R. 15.1',
      source: 'Bluebook',
      severity: 'error',
      message: 'Book citation must include at least one author.',
      suggestion: 'Add the author name(s) before the title.',
    });
    return;
  }

  for (const author of components.authors) {
    if (/^[A-Z\s]+$/.test(author.trim()) && author.trim().length > 1) {
      issues.push({
        id: uuid(),
        rule: 'R. 15.1',
        source: 'Bluebook',
        severity: 'warning',
        message: `Author "${author}" appears to be in all caps. In academic format, author names should be in SMALL CAPS (not all caps).`,
        suggestion: 'Use standard capitalization for author names (e.g., "Erwin Chemerinsky").',
      });
    }
  }

  if (components.authors.length === 2) {
    const joined = components.authors.join(' ');
    if (!joined.includes('&')) {
      issues.push({
        id: uuid(),
        rule: 'R. 15.1',
        source: 'Bluebook',
        severity: 'suggestion',
        message: 'Two authors should be joined with "&".',
        suggestion: `Format as "${components.authors[0]} & ${components.authors[1]}".`,
      });
    }
  }
}

function checkTitle(components: BookComponents, rawText: string | undefined, issues: ValidationIssue[]): void {
  if (!components.title || components.title.trim().length === 0) {
    issues.push({
      id: uuid(),
      rule: 'R. 15.3',
      source: 'Bluebook',
      severity: 'error',
      message: 'Book citation must include a title.',
      suggestion: 'Add the book title in SMALL CAPS (academic) or regular type (practitioner).',
    });
  }
}

function checkPinpoint(components: BookComponents, rawText: string | undefined, issues: ValidationIssue[]): void {
  // R. 3.2(b): "p." and "pp." are prohibited in Bluebook citations
  if (rawText && /\bp{1,2}\.\s*\d/.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 3.2(b)',
      source: 'Bluebook',
      severity: 'error',
      message: 'Do not use "p." or "pp." in Bluebook citations. Use the page number directly or "at" before the page number.',
      suggestion: 'Remove "p." or "pp." and use the bare page number.',
    });
  }

  // R. 3.3: Section symbol should be § not "sec." or "section"
  if (rawText && /\b(?:sec\.|section)\s+\d/i.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 3.3',
      source: 'Bluebook',
      severity: 'error',
      message: 'Use the section symbol "§" instead of "sec." or "section" in citations.',
      suggestion: 'Replace "sec." or "section" with "§".',
    });
  }
}

function checkParenthetical(components: BookComponents, issues: ValidationIssue[]): void {
  if (!components.year) {
    issues.push({
      id: uuid(),
      rule: 'R. 15.4',
      source: 'Bluebook',
      severity: 'error',
      message: 'Book citation must include a year of publication.',
      suggestion: 'Add the year in parentheses (e.g., "(2024)" or "(6th ed. 2024)").',
    });
    return;
  }

  const yearNum = parseInt(components.year, 10);
  if (isNaN(yearNum) || yearNum < 1800 || yearNum > new Date().getFullYear() + 1) {
    issues.push({
      id: uuid(),
      rule: 'R. 15.4',
      source: 'Bluebook',
      severity: 'warning',
      message: `Year "${components.year}" appears invalid.`,
      suggestion: 'Use a four-digit year (e.g., "2024").',
    });
  }

  // Validate edition format if present
  if (components.edition && !/^\d+(?:st|nd|rd|th)\s+ed\.$/.test(components.edition)) {
    issues.push({
      id: uuid(),
      rule: 'R. 15.4',
      source: 'Bluebook',
      severity: 'warning',
      message: `Edition "${components.edition}" may not be in the correct format.`,
      suggestion: 'Use format like "6th ed." or "2d ed." or "3d ed."',
    });
  }
}

function checkMultiVolume(components: BookComponents, issues: ValidationIssue[]): void {
  // Multi-volume works: volume number should precede the author
  if (components.volume) {
    if (!/^\d+$/.test(components.volume)) {
      issues.push({
        id: uuid(),
        rule: 'R. 15.8',
        source: 'Bluebook',
        severity: 'warning',
        message: `Volume "${components.volume}" should be a number.`,
        suggestion: 'Use a numeric volume (e.g., "5").',
      });
    }
  }
}
