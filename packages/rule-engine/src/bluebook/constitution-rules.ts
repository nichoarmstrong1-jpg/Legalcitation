import { v4 as uuid } from 'uuid';
import type { ValidationIssue, ConstitutionComponents } from '@legalcitation/shared';

/**
 * Validate a constitutional citation against Bluebook Rule 11.
 */
export function validateConstitution(components: ConstitutionComponents, rawText?: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  checkJurisdictionFormat(components, rawText, issues);
  checkArticleFormat(components, rawText, issues);
  checkAmendmentFormat(components, rawText, issues);
  checkSectionFormat(components, rawText, issues);
  checkClauseFormat(components, rawText, issues);

  return issues;
}

function checkJurisdictionFormat(components: ConstitutionComponents, rawText: string | undefined, issues: ValidationIssue[]): void {
  if (!rawText) return;

  const isUS = /U\.?\s*S\.?\s*(Const|CONST)/i.test(rawText) || components.jurisdiction === 'U.S.';

  if (isUS) {
    // Must be "U.S. Const." — check for common errors
    if (/United States Constitution/i.test(rawText)) {
      issues.push({
        id: uuid(),
        rule: 'R. 11',
        source: 'Bluebook',
        severity: 'error',
        message: 'Do not spell out "United States Constitution" in citations.',
        suggestion: 'Use the abbreviation "U.S. Const." per Rule 11.',
      });
    }

    if (/\bConstitution\b/.test(rawText) && !/\bConst\.\b/.test(rawText)) {
      issues.push({
        id: uuid(),
        rule: 'R. 11',
        source: 'Bluebook',
        severity: 'error',
        message: '"Constitution" should be abbreviated as "Const." in citations.',
        suggestion: 'Use "U.S. Const." not "U.S. Constitution".',
      });
    }
  }
}

function checkArticleFormat(components: ConstitutionComponents, rawText: string | undefined, issues: ValidationIssue[]): void {
  if (!components.article || !rawText) return;

  // Article should be abbreviated "art." (lowercase)
  if (/\bArticle\b/.test(rawText) && !/\bart\.\b/.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 11',
      source: 'Bluebook',
      severity: 'error',
      message: '"Article" should be abbreviated as "art." in citations.',
      suggestion: 'Use "art." (lowercase) — e.g., "U.S. Const. art. III, § 1".',
    });
  }

  // Article numbers should use Roman numerals
  if (components.article && /^\d+$/.test(components.article)) {
    const roman = toRoman(parseInt(components.article, 10));
    if (roman) {
      issues.push({
        id: uuid(),
        rule: 'R. 11',
        source: 'Bluebook',
        severity: 'warning',
        message: `Article numbers in constitutional citations traditionally use Roman numerals.`,
        suggestion: `Consider "art. ${roman}" instead of "art. ${components.article}".`,
      });
    }
  }
}

function checkAmendmentFormat(components: ConstitutionComponents, rawText: string | undefined, issues: ValidationIssue[]): void {
  if (!components.amendment || !rawText) return;

  // Amendment should be abbreviated "amend." (lowercase)
  if (/\bAmendment\b/.test(rawText) && !/\bamend\.\b/.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 11',
      source: 'Bluebook',
      severity: 'error',
      message: '"Amendment" should be abbreviated as "amend." in citations.',
      suggestion: 'Use "amend." (lowercase) — e.g., "U.S. Const. amend. XIV, § 1".',
    });
  }

  // Amendment numbers should use Roman numerals
  if (components.amendment && /^\d+$/.test(components.amendment)) {
    const roman = toRoman(parseInt(components.amendment, 10));
    if (roman) {
      issues.push({
        id: uuid(),
        rule: 'R. 11',
        source: 'Bluebook',
        severity: 'warning',
        message: 'Amendment numbers should use Roman numerals.',
        suggestion: `Use "amend. ${roman}" instead of "amend. ${components.amendment}".`,
      });
    }
  }
}

function checkSectionFormat(components: ConstitutionComponents, rawText: string | undefined, issues: ValidationIssue[]): void {
  if (!components.section || !rawText) return;

  // Section should use § symbol
  if (/\bSection\b/i.test(rawText) && rawText.includes(components.section) && !rawText.includes('§')) {
    issues.push({
      id: uuid(),
      rule: 'R. 11 / R. 6.2(c)',
      source: 'Bluebook',
      severity: 'error',
      message: 'Use the section symbol (§) instead of spelling out "Section".',
      suggestion: 'Replace "Section" with "§" — e.g., "U.S. Const. amend. XIV, § 1".',
    });
  }
}

function checkClauseFormat(components: ConstitutionComponents, rawText: string | undefined, issues: ValidationIssue[]): void {
  if (!components.clause || !rawText) return;

  // Clause should be abbreviated "cl." (lowercase)
  if (/\bClause\b/.test(rawText) && !/\bcl\.\b/.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 11',
      source: 'Bluebook',
      severity: 'error',
      message: '"Clause" should be abbreviated as "cl." in citations.',
      suggestion: 'Use "cl." (lowercase) — e.g., "U.S. Const. art. I, § 8, cl. 3".',
    });
  }
}

function toRoman(num: number): string | null {
  if (num <= 0 || num > 30) return null;
  const lookup: [number, string][] = [
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ];
  let result = '';
  let remaining = num;
  for (const [value, numeral] of lookup) {
    while (remaining >= value) {
      result += numeral;
      remaining -= value;
    }
  }
  return result;
}
