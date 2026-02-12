import { v4 as uuid } from 'uuid';
import type { ValidationIssue, ConstitutionComponents } from '@legalcitation/shared';

/**
 * Validate a constitutional citation against Bluebook Rule 11 / B11.
 *
 * B11 key points:
 *   - Cite constitutions by abbreviated jurisdiction + "Const." + subdivisions.
 *   - Currently in force: cite WITHOUT a date.
 *   - Repealed: "(repealed [year])" or cite repealing provision.
 *   - Amended: "(amended [year])" or cite amending provision.
 *   - Do NOT use any short citation form other than "id."
 *   - Use Roman numerals for article and amendment numbers.
 *   - Preamble: "pmbl."
 */
export function validateConstitution(components: ConstitutionComponents, rawText?: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  checkJurisdictionFormat(components, rawText, issues);
  checkArticleFormat(components, rawText, issues);
  checkAmendmentFormat(components, rawText, issues);
  checkSectionFormat(components, rawText, issues);
  checkClauseFormat(components, rawText, issues);
  checkShortFormRestriction(rawText, issues);
  checkPreambleFormat(rawText, issues);
  checkDateOnCurrentProvision(rawText, issues);

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

function checkShortFormRestriction(rawText: string | undefined, issues: ValidationIssue[]): void {
  if (!rawText) return;

  // B11: Do not use "supra" or "hereinafter" for constitutions
  if (/\bsupra\b/i.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'B11',
      source: 'Bluebook',
      severity: 'error',
      message: 'Do not use "supra" for constitutional citations. Only "id." is permitted as a short form.',
      suggestion: 'Use "id." or repeat the full citation.',
    });
  }

  if (/\bhereinafter\b/i.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'B11',
      source: 'Bluebook',
      severity: 'error',
      message: 'Do not use "hereinafter" for constitutional citations. Only "id." is permitted as a short form.',
      suggestion: 'Use "id." or repeat the full citation.',
    });
  }
}

function checkPreambleFormat(rawText: string | undefined, issues: ValidationIssue[]): void {
  if (!rawText) return;

  // Check for unabbreviated "preamble"
  if (/\bpreamble\b/i.test(rawText) && !/\bpmbl\.\b/.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 11',
      source: 'Bluebook',
      severity: 'error',
      message: '"Preamble" should be abbreviated as "pmbl." in citations.',
      suggestion: 'Use "pmbl." — e.g., "U.S. Const. pmbl."',
    });
  }
}

function checkDateOnCurrentProvision(rawText: string | undefined, issues: ValidationIssue[]): void {
  if (!rawText) return;

  // If the citation includes a year parenthetical but no "repealed", "amended", or "of" year marker,
  // it might be incorrectly dated. Currently-in-force provisions should NOT have a date.
  // Exception: electronic database citations (Westlaw, LEXIS) and superseded provisions ("of YYYY")
  const hasRepealedAmended = /\b(repealed|amended|superseded)\b/i.test(rawText);
  const hasElectronicDb = /\b(Westlaw|LEXIS|LexisNexis|West,|Bloomberg)\b/i.test(rawText);
  const hasOfYear = /\bConst\.\s+of\s+\d{4}\b/.test(rawText);

  if (!hasRepealedAmended && !hasElectronicDb && !hasOfYear) {
    // Check for a bare year parenthetical like "(2023)" that isn't part of a database citation
    const bareYearMatch = rawText.match(/\((\d{4})\)\s*\.?\s*$/);
    if (bareYearMatch) {
      issues.push({
        id: uuid(),
        rule: 'R. 11',
        source: 'Bluebook',
        severity: 'warning',
        message: 'Constitutional provisions currently in force should be cited without a date.',
        suggestion: 'Remove the year unless the provision has been repealed or amended.',
      });
    }
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
