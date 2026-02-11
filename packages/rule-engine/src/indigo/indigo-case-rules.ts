import { v4 as uuid } from 'uuid';
import type { ValidationIssue, CaseComponents } from '@legalcitation/shared';

/**
 * Indigo Book cross-check for case citations.
 * The Indigo Book (R11–R16) provides a parallel set of citation rules
 * that are largely compatible with the Bluebook. We use it as a second
 * opinion to catch issues the Bluebook engine might miss.
 */
export function validateIndigoCaseRules(
  components: CaseComponents,
  rawText: string
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Indigo R11: Case name formatting
  checkIndigoCaseName(components, rawText, issues);

  // Indigo R12: Reporter and pincite
  checkIndigoReporter(components, rawText, issues);

  // Indigo R15: Court and year
  checkIndigoCourtYear(components, issues);

  return issues;
}

function checkIndigoCaseName(
  components: CaseComponents,
  rawText: string,
  issues: ValidationIssue[]
): void {
  const fullName = components.partyTwo
    ? `${components.partyOne} v. ${components.partyTwo}`
    : components.partyOne;

  // Check for "versus" instead of "v."
  if (/\bversus\b/i.test(rawText) || /\bvs\.?\b/i.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'Indigo R11',
      source: 'Indigo',
      severity: 'error',
      message: 'Use "v." (lowercase, with period) to separate party names, not "versus" or "vs."',
      suggestion: 'Change to "v."',
    });
  }

  // Check that case name is underlined or italicized (we look for formatting markers)
  // This is a reminder — actual formatting is checked at rendering
  if (!rawText.includes('*') && !rawText.startsWith('_')) {
    issues.push({
      id: uuid(),
      rule: 'Indigo R11',
      source: 'Indigo',
      severity: 'suggestion',
      message: 'Case names should be italicized or underlined.',
      suggestion: 'Apply italics or underline to the case name.',
    });
  }

  // Check for comma after case name before volume
  const nameVolumePattern = /v\.\s+[^,]+\s+\d{1,4}\s+/;
  if (nameVolumePattern.test(rawText)) {
    // There should be a comma between the case name and the volume
    const commaCheck = /v\.\s+[^,]+,\s+\d{1,4}\s+/;
    if (!commaCheck.test(rawText)) {
      issues.push({
        id: uuid(),
        rule: 'Indigo R11',
        source: 'Indigo',
        severity: 'error',
        message: 'A comma must separate the case name from the volume number.',
        suggestion: 'Add a comma after the case name.',
      });
    }
  }
}

function checkIndigoReporter(
  components: CaseComponents,
  rawText: string,
  issues: ValidationIssue[]
): void {
  // Indigo R12: When pincite is the same as the first page, repeat it
  if (components.pinCite === components.firstPage) {
    // This is correct — just noting it's valid
  }

  // Check pincite exists for quotations
  if (rawText.includes('"') && !components.pinCite) {
    issues.push({
      id: uuid(),
      rule: 'Indigo R12',
      source: 'Indigo',
      severity: 'warning',
      message: 'When quoting from a source, include a pincite to the specific page.',
      suggestion: 'Add a pincite after the first page number.',
    });
  }
}

function checkIndigoCourtYear(
  components: CaseComponents,
  issues: ValidationIssue[]
): void {
  // Year should be present
  if (!components.year) {
    issues.push({
      id: uuid(),
      rule: 'Indigo R15',
      source: 'Indigo',
      severity: 'error',
      message: 'A year of decision must be included in the citation.',
      suggestion: 'Add the year in a parenthetical after the reporter citation.',
    });
  }
}
