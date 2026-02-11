import { v4 as uuid } from 'uuid';
import type { ValidationIssue, RegulationComponents } from '@legalcitation/shared';

const REGULATION_SOURCES: Record<string, string> = {
  'CFR': 'C.F.R.',
  'C.F.R': 'C.F.R.',
  'Code of Federal Regulations': 'C.F.R.',
  'Fed Reg': 'Fed. Reg.',
  'Federal Register': 'Fed. Reg.',
  'FR': 'Fed. Reg.',
};

/**
 * Validate a regulation citation against Bluebook Rule 14.
 */
export function validateRegulation(components: RegulationComponents, rawText?: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  checkTitleNumber(components, issues);
  checkSourceAbbreviation(components, issues);
  checkSectionFormat(components, rawText, issues);
  checkYearParenthetical(components, rawText, issues);

  return issues;
}

function checkTitleNumber(components: RegulationComponents, issues: ValidationIssue[]): void {
  if (!components.title) {
    issues.push({
      id: uuid(),
      rule: 'R. 14.2',
      source: 'Bluebook',
      severity: 'error',
      message: 'Regulation citation is missing the title number.',
      suggestion: 'Include the title number before the source abbreviation (e.g., "40 C.F.R.").',
    });
    return;
  }

  if (!/^\d+$/.test(components.title.trim())) {
    issues.push({
      id: uuid(),
      rule: 'R. 14.2',
      source: 'Bluebook',
      severity: 'warning',
      message: `Title "${components.title}" should be a number.`,
      suggestion: 'Use the numerical title designation (e.g., "40" in "40 C.F.R. § 261.3").',
    });
  }
}

function checkSourceAbbreviation(components: RegulationComponents, issues: ValidationIssue[]): void {
  if (!components.source) return;

  const normalized = components.source.replace(/\s+/g, '').replace(/\./g, '');
  const match = Object.entries(REGULATION_SOURCES).find(
    ([key]) => key.replace(/\s+/g, '').replace(/\./g, '') === normalized
  );

  if (match && match[1] !== components.source) {
    issues.push({
      id: uuid(),
      rule: 'R. 14.2 / T1',
      source: 'Bluebook',
      severity: 'error',
      message: `Source abbreviation "${components.source}" should be "${match[1]}".`,
      suggestion: `Use the standard abbreviation: "${match[1]}".`,
    });
  }
}

function checkSectionFormat(components: RegulationComponents, rawText: string | undefined, issues: ValidationIssue[]): void {
  if (!rawText) return;

  // C.F.R. uses § symbol
  const isCFR = components.source && /C\.?F\.?R/i.test(components.source);

  if (isCFR) {
    if (/\bSection\b/i.test(rawText) && !rawText.includes('§')) {
      issues.push({
        id: uuid(),
        rule: 'R. 14.2 / R. 6.2(c)',
        source: 'Bluebook',
        severity: 'error',
        message: 'Use the section symbol (§) instead of spelling out "Section" in C.F.R. citations.',
        suggestion: 'Replace "Section" with "§" (e.g., "40 C.F.R. § 261.3").',
      });
    }

    // Check for missing space after §
    if (/§\d/.test(rawText)) {
      issues.push({
        id: uuid(),
        rule: 'R. 6.2(c)',
        source: 'Bluebook',
        severity: 'error',
        message: 'There should be a space between § and the section number.',
        suggestion: 'Add a space: "§ 261.3" not "§261.3".',
      });
    }
  }

  // Fed. Reg. uses page numbers, not §
  const isFedReg = components.source && /Fed\.?\s*Reg/i.test(components.source);
  if (isFedReg && rawText.includes('§')) {
    issues.push({
      id: uuid(),
      rule: 'R. 14.2',
      source: 'Bluebook',
      severity: 'warning',
      message: 'Federal Register citations use page numbers, not section symbols.',
      suggestion: 'Use the page number format: "85 Fed. Reg. 12,345 (2020)".',
    });
  }
}

function checkYearParenthetical(components: RegulationComponents, rawText: string | undefined, issues: ValidationIssue[]): void {
  if (!components.year || !rawText) return;

  // Year should be in parentheses
  if (rawText.includes(components.year) && !rawText.includes(`(${components.year})`)) {
    issues.push({
      id: uuid(),
      rule: 'R. 14.2',
      source: 'Bluebook',
      severity: 'warning',
      message: 'The year should be enclosed in parentheses at the end of the citation.',
      suggestion: `Place the year in parentheses: "(${components.year})".`,
    });
  }
}
