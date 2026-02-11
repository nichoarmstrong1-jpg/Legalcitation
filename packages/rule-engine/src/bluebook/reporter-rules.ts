import { v4 as uuid } from 'uuid';
import type { ValidationIssue, CaseComponents } from '@legalcitation/shared';
import { VALID_REPORTER_ABBREVIATIONS, REPORTER_MAP, SCOTUS_REPORTERS } from '@legalcitation/shared';

/**
 * Validate reporter citation per Rules 10.3 and 10.4.
 */
export function validateReporter(components: CaseComponents): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Check reporter abbreviation is valid
  if (!VALID_REPORTER_ABBREVIATIONS.has(components.reporter)) {
    // Check for common misspellings
    const suggestion = findClosestReporter(components.reporter);
    issues.push({
      id: uuid(),
      rule: 'R. 10.3 / T1',
      source: 'Bluebook',
      severity: 'error',
      message: `"${components.reporter}" is not a recognized reporter abbreviation.`,
      suggestion: suggestion
        ? `Did you mean "${suggestion}"?`
        : 'Check Table T1 for the correct reporter abbreviation.',
    });
  }

  // Check volume is a valid number
  const volume = parseInt(components.volume, 10);
  if (isNaN(volume) || volume <= 0) {
    issues.push({
      id: uuid(),
      rule: 'R. 10.3.2',
      source: 'Bluebook',
      severity: 'error',
      message: `Volume "${components.volume}" is not a valid volume number.`,
      suggestion: 'Volume should be a positive integer.',
    });
  }

  // Check first page is a valid number
  const page = parseInt(components.firstPage, 10);
  if (isNaN(page) || page <= 0) {
    issues.push({
      id: uuid(),
      rule: 'R. 10.3.2',
      source: 'Bluebook',
      severity: 'error',
      message: `Page "${components.firstPage}" is not a valid page number.`,
      suggestion: 'First page should be a positive integer.',
    });
  }

  return issues;
}

/**
 * Validate court designation per Rule 10.4.
 */
export function validateCourtDesignation(components: CaseComponents): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const reporter = REPORTER_MAP.get(components.reporter);

  if (!reporter) return issues;

  // SCOTUS: no court designation needed for U.S., S. Ct., L. Ed.
  if (SCOTUS_REPORTERS.has(components.reporter)) {
    if (components.court) {
      issues.push({
        id: uuid(),
        rule: 'R. 10.4',
        source: 'Bluebook',
        severity: 'error',
        message: 'Do not include court designation for U.S. Supreme Court decisions when citing to U.S., S. Ct., or L. Ed.',
        suggestion: `Remove "${components.court}" from the date parenthetical.`,
      });
    }
    return issues;
  }

  // Federal Courts of Appeals: must have circuit designation
  if (['F.', 'F.2d', 'F.3d', 'F.4th'].includes(components.reporter)) {
    if (!components.court) {
      issues.push({
        id: uuid(),
        rule: 'R. 10.4(a)',
        source: 'Bluebook',
        severity: 'error',
        message: 'Federal appellate cases must indicate the circuit court.',
        suggestion: 'Add the circuit designation (e.g., "9th Cir.") in the date parenthetical.',
      });
    } else {
      // Validate circuit format
      validateCircuitFormat(components.court, issues);
    }
  }

  // Federal District Courts: must have district designation
  if (['F. Supp.', 'F. Supp. 2d', 'F. Supp. 3d'].includes(components.reporter)) {
    if (!components.court) {
      issues.push({
        id: uuid(),
        rule: 'R. 10.4(a)',
        source: 'Bluebook',
        severity: 'error',
        message: 'Federal district court cases must indicate the district.',
        suggestion: 'Add the district designation (e.g., "S.D.N.Y.") in the date parenthetical.',
      });
    }
  }

  return issues;
}

function validateCircuitFormat(court: string, issues: ValidationIssue[]): void {
  const validCircuits = /^(?:1st|2d|3d|4th|5th|6th|7th|8th|9th|10th|11th|D\.C\.|Fed\.)\s*Cir\.$/;
  if (!validCircuits.test(court.trim())) {
    // Check for common mistakes
    if (/2nd/.test(court)) {
      issues.push({
        id: uuid(),
        rule: 'R. 6.2(b)',
        source: 'Bluebook',
        severity: 'error',
        message: 'Use "2d" not "2nd" for the Second Circuit.',
        suggestion: 'Replace "2nd Cir." with "2d Cir."',
      });
    } else if (/3rd/.test(court)) {
      issues.push({
        id: uuid(),
        rule: 'R. 6.2(b)',
        source: 'Bluebook',
        severity: 'error',
        message: 'Use "3d" not "3rd" for the Third Circuit.',
        suggestion: 'Replace "3rd Cir." with "3d Cir."',
      });
    }
  }
}

/**
 * Find the closest matching reporter abbreviation for a misspelled one.
 */
function findClosestReporter(input: string): string | null {
  const normalized = input.replace(/\s+/g, ' ').trim();
  let bestMatch: string | null = null;
  let bestDistance = Infinity;

  for (const abbr of VALID_REPORTER_ABBREVIATIONS) {
    const dist = levenshtein(normalized.toLowerCase(), abbr.toLowerCase());
    if (dist < bestDistance && dist <= 3) {
      bestDistance = dist;
      bestMatch = abbr;
    }
  }

  return bestMatch;
}

function levenshtein(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= a.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= b.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[a.length][b.length];
}
