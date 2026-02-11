import { v4 as uuid } from 'uuid';
import type { ValidationIssue, StatuteComponents } from '@legalcitation/shared';

const OFFICIAL_CODES: Record<string, string> = {
  'USC': 'U.S.C.',
  'U.S.C': 'U.S.C.',
  'United States Code': 'U.S.C.',
  'USCA': 'U.S.C.A.',
  'USCS': 'U.S.C.S.',
};

/**
 * Validate a statute citation against Bluebook Rule 12.
 */
export function validateStatute(components: StatuteComponents, rawText?: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  checkTitleNumber(components, issues);
  checkCodeAbbreviation(components, issues);
  checkSectionSymbol(components, rawText, issues);
  checkYearParenthetical(components, rawText, issues);
  checkSupplementFormat(components, rawText, issues);

  return issues;
}

function checkTitleNumber(components: StatuteComponents, issues: ValidationIssue[]): void {
  if (!components.title) {
    issues.push({
      id: uuid(),
      rule: 'R. 12.3',
      source: 'Bluebook',
      severity: 'error',
      message: 'Statute citation is missing the title number.',
      suggestion: 'Include the title number before the code abbreviation (e.g., "42 U.S.C.").',
    });
    return;
  }

  if (!/^\d+$/.test(components.title.trim())) {
    issues.push({
      id: uuid(),
      rule: 'R. 12.3',
      source: 'Bluebook',
      severity: 'warning',
      message: `Title "${components.title}" should be a number.`,
      suggestion: 'Use the numerical title designation (e.g., "42" in "42 U.S.C. § 1983").',
    });
  }
}

function checkCodeAbbreviation(components: StatuteComponents, issues: ValidationIssue[]): void {
  if (!components.code) return;

  const normalized = components.code.replace(/\s+/g, '').replace(/\./g, '');
  const match = Object.entries(OFFICIAL_CODES).find(
    ([key]) => key.replace(/\s+/g, '').replace(/\./g, '') === normalized
  );

  if (match && match[1] !== components.code) {
    issues.push({
      id: uuid(),
      rule: 'R. 12.3 / T1',
      source: 'Bluebook',
      severity: 'error',
      message: `Code abbreviation "${components.code}" should be "${match[1]}".`,
      suggestion: `Use the official abbreviation from Table T1: "${match[1]}".`,
    });
  }
}

function checkSectionSymbol(components: StatuteComponents, rawText: string | undefined, issues: ValidationIssue[]): void {
  if (!rawText) return;

  // Check for "Section" or "Sec." instead of §
  if (/\bSec(tion)?\.?\s*\d/i.test(rawText) && !rawText.includes('§')) {
    issues.push({
      id: uuid(),
      rule: 'R. 12.10',
      source: 'Bluebook',
      severity: 'error',
      message: 'Use the section symbol (§) instead of spelling out "Section".',
      suggestion: 'Replace "Section" or "Sec." with "§" (e.g., "§ 1983").',
    });
  }

  // Check for missing space after §
  if (/§\d/.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 6.2(c)',
      source: 'Bluebook',
      severity: 'error',
      message: 'There should be a space between the section symbol (§) and the section number.',
      suggestion: 'Add a space: "§ 1983" not "§1983".',
    });
  }

  // Check for multiple sections using §§
  if (/§\s*\d+[\s,–-]+\d/.test(rawText) && !rawText.includes('§§')) {
    issues.push({
      id: uuid(),
      rule: 'R. 3.3(b)',
      source: 'Bluebook',
      severity: 'warning',
      message: 'When citing multiple sections, use "§§" (double section symbol).',
      suggestion: 'Use "§§" when citing a range of sections (e.g., "§§ 1981–1983").',
    });
  }
}

function checkYearParenthetical(components: StatuteComponents, rawText: string | undefined, issues: ValidationIssue[]): void {
  if (!rawText) return;

  // Official codes (U.S.C.) don't need a year for the current version
  const isOfficial = components.code && /U\.S\.C\.$/i.test(components.code.trim());

  if (!isOfficial && components.year) {
    // Unofficial codes need the year
    if (!rawText.includes(`(${components.year})`)) {
      issues.push({
        id: uuid(),
        rule: 'R. 12.3.2',
        source: 'Bluebook',
        severity: 'warning',
        message: 'Unofficial code citations should include the year of the code edition in parentheses.',
        suggestion: `Add the year in parentheses at the end: "(${components.year})".`,
      });
    }
  }

  if (isOfficial && components.year) {
    // Check that year is in parentheses
    if (rawText.includes(components.year) && !rawText.includes(`(${components.year})`)) {
      issues.push({
        id: uuid(),
        rule: 'R. 12.3.2',
        source: 'Bluebook',
        severity: 'warning',
        message: 'If including a year for an official code, it should be in parentheses.',
        suggestion: `Place the year in parentheses: "(${components.year})".`,
      });
    }
  }
}

function checkSupplementFormat(components: StatuteComponents, rawText: string | undefined, issues: ValidationIssue[]): void {
  if (!components.supplement || !rawText) return;

  // Check for "Supplement" spelled out
  if (/\bSupplement\b/i.test(rawText) && !/\bSupp\.\b/.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 12.3.1(e)',
      source: 'Bluebook',
      severity: 'error',
      message: '"Supplement" should be abbreviated as "Supp." in citations.',
      suggestion: 'Use "Supp." instead of "Supplement" (e.g., "42 U.S.C. § 1983 (Supp. V 2017)").',
    });
  }
}
