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
 * Validate a statute citation against Bluebook Rule 12 / B12.
 *
 * B12 key points:
 *   - Cite to current official code when possible (U.S.C. > U.S.C.A. > session laws).
 *   - Include title number, code abbreviation, section symbol (§), and section number.
 *   - Federal official code (U.S.C.): year is optional.
 *   - State codes: include the year of the code edition.
 *   - Unofficial codes: include publisher in parenthetical.
 *   - Use "§§" for multiple sections.
 *   - Include the popular or official name of a statute if commonly cited that way.
 *   - Session laws: include Pub. L. No., section, volume Stat., and page.
 *   - Note repeal/amendment per R. 12.7.
 */
export function validateStatute(components: StatuteComponents, rawText?: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  checkTitleNumber(components, issues);
  checkCodeAbbreviation(components, issues);
  checkSectionSymbol(components, rawText, issues);
  checkYearParenthetical(components, rawText, issues);
  checkSupplementFormat(components, rawText, issues);
  checkSessionLawFormat(components, rawText, issues);
  checkPublisherForUnofficialCode(components, rawText, issues);
  checkStatuteNameFormat(rawText, issues);
  checkHistoryFormat(rawText, issues);
  checkIRCFormat(rawText, issues);
  checkProceduralRuleFormat(rawText, issues);

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

function checkSessionLawFormat(components: StatuteComponents, rawText: string | undefined, issues: ValidationIssue[]): void {
  if (!rawText) return;

  // Check for "Public Law" spelled out instead of "Pub. L. No."
  if (/\bPublic Law\b/i.test(rawText) && !/\bPub\.\s*L\.\s*No\.\b/.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 12.4(a)',
      source: 'Bluebook',
      severity: 'error',
      message: '"Public Law" should be abbreviated as "Pub. L. No." in citations.',
      suggestion: 'Use "Pub. L. No." — e.g., "Pub. L. No. 91-190".',
    });
  }

  // Check for "Statutes at Large" spelled out
  if (/\bStatutes at Large\b/i.test(rawText) && !/\bStat\.\b/.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 12.4(b)',
      source: 'Bluebook',
      severity: 'error',
      message: '"Statutes at Large" should be abbreviated as "Stat." in citations.',
      suggestion: 'Use "Stat." — e.g., "83 Stat. 852".',
    });
  }

  // R. 12.4(d): Check "sec." vs "§" in session law amendments
  // In session laws, "sec." refers to the bill's section, "§" to the amended act's section
  if (/\bsec\.\s*\d/i.test(rawText) && /§/.test(rawText)) {
    // Both present — this is the correct pattern for session law amendments
    // No issue to flag
  } else if (/\bsec\.\s*\d/i.test(rawText) && !/Pub\.\s*L\./i.test(rawText) && !/Stat\./i.test(rawText)) {
    // "sec." used outside session law context — likely should be §
    issues.push({
      id: uuid(),
      rule: 'R. 12.4(d)',
      source: 'Bluebook',
      severity: 'warning',
      message: 'Use "§" for section references in code citations. "sec." is only for bill sections in session law citations.',
      suggestion: 'Replace "sec." with "§" unless citing a specific section of a bill in session laws.',
    });
  }
}

function checkPublisherForUnofficialCode(components: StatuteComponents, rawText: string | undefined, issues: ValidationIssue[]): void {
  if (!rawText || !components.code) return;

  // Unofficial codes (U.S.C.A., U.S.C.S.) require publisher in parenthetical
  const isUnofficial = /U\.S\.C\.[AS]\.|\.Ann\.\b|\.Stat\.\s*Ann\./i.test(components.code) ||
    /U\.S\.C\.[AS]\.|\.Ann\.\b|\.Stat\.\s*Ann\./i.test(rawText);

  if (isUnofficial) {
    const hasPublisher = /\(West\b|\(LexisNexis\b|\(Deering\b|\(McKinney\b|\(Bancroft-Whitney\b/i.test(rawText);
    if (!hasPublisher) {
      issues.push({
        id: uuid(),
        rule: 'R. 12.3.1(d)',
        source: 'Bluebook',
        severity: 'warning',
        message: 'Unofficial code citations should include the publisher in the parenthetical.',
        suggestion: 'Add the publisher name in parentheses — e.g., "(West 2020)" or "(LexisNexis 2020)".',
      });
    }
  }
}

function checkStatuteNameFormat(rawText: string | undefined, issues: ValidationIssue[]): void {
  if (!rawText) return;

  // R. 12.3.1(a): If a statute name is given, check for leading "The"
  // Pattern: "The [Name] Act" before the code citation
  if (/^The\s+[A-Z]/i.test(rawText.trim()) && /\bAct\b/i.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 12.3.1(a)',
      source: 'Bluebook',
      severity: 'error',
      message: 'Omit "The" at the beginning of a statute name.',
      suggestion: 'Remove "The" from the statute name.',
    });
  }
}

function checkHistoryFormat(rawText: string | undefined, issues: ValidationIssue[]): void {
  if (!rawText) return;

  // R. 12.7: Check that "repealed", "amended", "invalidated by" use proper format
  // "repealed" should be "(repealed YYYY)" or followed by full cite with "repealed by,"
  if (/\brepealed\b/i.test(rawText)) {
    const hasParentheticalRepeal = /\(repealed\s+\d{4}\)/.test(rawText);
    const hasFullRepealCite = /repealed\s+by\s*,/i.test(rawText);
    if (!hasParentheticalRepeal && !hasFullRepealCite) {
      issues.push({
        id: uuid(),
        rule: 'R. 12.7.2',
        source: 'Bluebook',
        severity: 'warning',
        message: 'Indicate repeal with "(repealed [year])" or cite the repealing statute with "repealed by, [citation]."',
        suggestion: 'Use "(repealed 1969)" or "repealed by, [full cite of repealing statute]."',
      });
    }
  }

  // "amended" should be "(amended YYYY)" or followed by "amended by,"
  if (/\bamended\b/i.test(rawText) && !/\bcodified as amended\b/i.test(rawText)) {
    const hasParentheticalAmend = /\(amended\s+\d{4}\)/.test(rawText);
    const hasFullAmendCite = /amended\s+by\s*,/i.test(rawText);
    const hasAmending = /\(amending\s/.test(rawText);
    if (!hasParentheticalAmend && !hasFullAmendCite && !hasAmending) {
      issues.push({
        id: uuid(),
        rule: 'R. 12.7.3',
        source: 'Bluebook',
        severity: 'suggestion',
        message: 'Indicate amendment with "(amended [year])" or cite the amending statute with "amended by, [citation]."',
        suggestion: 'Use "(amended 1959)" or "amended by, [full cite]" or "(current version at [code cite])."',
      });
    }
  }

  // "invalidated" should be followed by full case cite
  if (/\binvalidated\b/i.test(rawText) && !/invalidated\s+by\s*,/i.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 12.7.1',
      source: 'Bluebook',
      severity: 'warning',
      message: 'Indicate invalidation with "invalidated by, [full case citation]."',
      suggestion: 'Use "invalidated by," followed by the full citation to the invalidating case.',
    });
  }
}

function checkIRCFormat(rawText: string | undefined, issues: ValidationIssue[]): void {
  if (!rawText) return;

  // R. 12.9.1: "Internal Revenue Code" should be "I.R.C." or "26 U.S.C."
  if (/\bInternal Revenue Code\b/i.test(rawText) && !/\bI\.R\.C\.\b/.test(rawText) && !/\b26\s+U\.S\.C\.\b/.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 12.9.1',
      source: 'Bluebook',
      severity: 'error',
      message: '"Internal Revenue Code" should be abbreviated as "I.R.C." or cited as "26 U.S.C."',
      suggestion: 'Use "I.R.C. § [section]" or "26 U.S.C. § [section]".',
    });
  }
}

function checkProceduralRuleFormat(rawText: string | undefined, issues: ValidationIssue[]): void {
  if (!rawText) return;

  // R. 12.9.3: Check for unabbreviated procedural rule names
  const PROCEDURAL_RULE_PATTERNS: [RegExp, string][] = [
    [/\bFederal Rules? of Civil Procedure\b/i, 'Fed. R. Civ. P.'],
    [/\bFederal Rules? of Criminal Procedure\b/i, 'Fed. R. Crim. P.'],
    [/\bFederal Rules? of Appellate Procedure\b/i, 'Fed. R. App. P.'],
    [/\bFederal Rules? of Evidence\b/i, 'Fed. R. Evid.'],
    [/\bSupreme Court Rules?\b/i, 'Sup. Ct. R.'],
  ];

  for (const [pattern, abbr] of PROCEDURAL_RULE_PATTERNS) {
    if (pattern.test(rawText) && !rawText.includes(abbr)) {
      issues.push({
        id: uuid(),
        rule: 'R. 12.9.3',
        source: 'Bluebook',
        severity: 'error',
        message: `Abbreviate the rule name to "${abbr}" in citations.`,
        suggestion: `Use "${abbr}" — e.g., "${abbr} 12(b)(6)."`,
      });
    }
  }

  // Check: current procedural rules should not have a date
  const hasProceduralAbbr = /\bFed\.\s*R\.\s*(Civ|Crim|App|Evid)\.\s*P?\.\s*\d/.test(rawText) ||
    /\bSup\.\s*Ct\.\s*R\.\s*\d/.test(rawText);
  if (hasProceduralAbbr) {
    // Check for a trailing year parenthetical without "repealed"
    const hasYear = /\(\d{4}\)\s*\.?\s*$/.test(rawText);
    const hasRepealed = /\brepealed\b/i.test(rawText);
    if (hasYear && !hasRepealed) {
      issues.push({
        id: uuid(),
        rule: 'R. 12.9.3',
        source: 'Bluebook',
        severity: 'warning',
        message: 'Current rules of evidence and procedure are cited without a date.',
        suggestion: 'Remove the year unless citing a rule no longer in force.',
      });
    }
  }
}
