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
  checkProceduralPhrases(rawText, issues);
  checkProposedRuleFormat(rawText, issues);
  checkSpelledOutSourceName(rawText, issues);
  checkIRCFormat(rawText, issues);
  checkTreasuryRegFormat(rawText, issues);
  checkNamedRegulationFormat(rawText, issues);
  checkCFRCompleteFormat(components, rawText, issues);
  checkFedRegDateFormat(components, rawText, issues);
  checkCodificationParenthetical(rawText, issues);

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
    // Allow date parentheticals like "(Sep. 29, 1995)" for Fed. Reg. citations
    const dateParenPattern = new RegExp(`\\([A-Z][a-z]{2,8}\\.?\\s+\\d{1,2},\\s*${components.year}\\)`);
    if (!dateParenPattern.test(rawText)) {
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
}

/**
 * R. 14.3.1: Administrative adjudications should omit procedural phrases.
 */
function checkProceduralPhrases(rawText: string | undefined, issues: ValidationIssue[]): void {
  if (!rawText) return;

  if (/\bIn the Matter of\b/i.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 14.3.1',
      source: 'Bluebook',
      severity: 'error',
      message: 'Omit "In the Matter of" from administrative adjudication citations.',
      suggestion: 'Cite by the reported name of the first-listed private party only.',
    });
  }

  // "In re" should also be omitted per R. 14.3.1 in admin adjudications
  // Only flag if this looks like an admin citation (has an admin reporter)
  if (/\bIn re\b/i.test(rawText) && /\b(NLRB|F\.T\.C\.|F\.C\.C\.|S\.E\.C\.|I\.C\.C\.|Agric\.\s*Dec)\b/.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 14.3.1',
      source: 'Bluebook',
      severity: 'error',
      message: 'Omit "In re" from administrative adjudication citations.',
      suggestion: 'Cite by the reported name of the first-listed private party or the subject-matter title.',
    });
  }
}

/**
 * R. 14.2(b): Proposed rules should include "proposed" in the date parenthetical.
 */
function checkProposedRuleFormat(rawText: string | undefined, issues: ValidationIssue[]): void {
  if (!rawText) return;

  // If "proposed" appears in the title/name but not in a parenthetical
  if (/\bproposed\s+rul/i.test(rawText) && !/\(proposed\b/i.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 14.2(b)',
      source: 'Bluebook',
      severity: 'warning',
      message: 'Proposed rules should include "(proposed [date])" in the date parenthetical.',
      suggestion: 'Add "proposed" to the date parenthetical — e.g., "(proposed Mar. 7, 1991) (to be codified at ...)".',
    });
  }
}

/**
 * Check for spelled-out source names that should be abbreviated.
 */
function checkSpelledOutSourceName(rawText: string | undefined, issues: ValidationIssue[]): void {
  if (!rawText) return;

  if (/\bCode of Federal Regulations\b/i.test(rawText) && !/\bC\.F\.R\.\b/.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 14.2',
      source: 'Bluebook',
      severity: 'error',
      message: '"Code of Federal Regulations" should be abbreviated as "C.F.R." in citations.',
      suggestion: 'Use "C.F.R." — e.g., "40 C.F.R. § 261.3 (2024)".',
    });
  }

  if (/\bFederal Register\b/i.test(rawText) && !/\bFed\.\s*Reg\.\b/.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 14.2',
      source: 'Bluebook',
      severity: 'error',
      message: '"Federal Register" should be abbreviated as "Fed. Reg." in citations.',
      suggestion: 'Use "Fed. Reg." — e.g., "60 Fed. Reg. 50379".',
    });
  }
}

/**
 * R. 12.9.1 / R. 14.5: Internal Revenue Code format validation.
 */
function checkIRCFormat(rawText: string | undefined, issues: ValidationIssue[]): void {
  if (!rawText) return;

  // "Internal Revenue Code" should be abbreviated as "I.R.C."
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

  // I.R.C. must use § symbol
  if (/\bI\.R\.C\.\s+\d/.test(rawText) && !/\bI\.R\.C\.\s*§/.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 12.9.1',
      source: 'Bluebook',
      severity: 'error',
      message: 'I.R.C. citations require the section symbol (§).',
      suggestion: 'Include "§" — e.g., "I.R.C. § 501(c)(3)".',
    });
  }

  // Check for missing space after § in I.R.C. citations
  if (/\bI\.R\.C\.\s*§\d/.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 6.2(c)',
      source: 'Bluebook',
      severity: 'error',
      message: 'There should be a space between § and the section number.',
      suggestion: 'Add a space: "I.R.C. § 501(c)(3)" not "I.R.C. §501(c)(3)".',
    });
  }

  // I.R.C. subsection format: parenthesized, lowercase, no spaces
  // "I.R.C. § 501 (c)(3)" is wrong — should be "I.R.C. § 501(c)(3)"
  if (/\bI\.R\.C\.\s*§\s*\d+\s+\([a-z]/.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 12.9.1 / R. 3.3',
      source: 'Bluebook',
      severity: 'error',
      message: 'Subsection references should immediately follow the section number with no space.',
      suggestion: 'Remove the space: "§ 501(c)(3)" not "§ 501 (c)(3)".',
    });
  }
}

/**
 * R. 14.5: Treasury Regulation format validation.
 */
function checkTreasuryRegFormat(rawText: string | undefined, issues: ValidationIssue[]): void {
  if (!rawText) return;

  // "Treasury Regulation" spelled out
  if (/\bTreasury Regulation\b/i.test(rawText) && !/\bTreas\.\s*Reg\.\b/.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 14.5',
      source: 'Bluebook',
      severity: 'error',
      message: '"Treasury Regulation" should be abbreviated as "Treas. Reg." in citations.',
      suggestion: 'Use "Treas. Reg. § [section]" — e.g., "Treas. Reg. § 1.61-1 (2024)".',
    });
  }

  // Treas. Reg. without § symbol
  if (/\bTreas\.\s*Reg\.\s+\d/.test(rawText) && !/\bTreas\.\s*Reg\.\s*§/.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 14.5',
      source: 'Bluebook',
      severity: 'error',
      message: 'Treasury Regulation citations require the section symbol (§).',
      suggestion: 'Include "§" — e.g., "Treas. Reg. § 1.61-1".',
    });
  }

  // Missing space after § in Treas. Reg.
  if (/\bTreas\.\s*Reg\.\s*§\d/.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 6.2(c)',
      source: 'Bluebook',
      severity: 'error',
      message: 'There should be a space between § and the section number in Treasury Regulation citations.',
      suggestion: 'Add a space: "Treas. Reg. § 1.61-1" not "Treas. Reg. §1.61-1".',
    });
  }

  // Revenue Ruling / Revenue Procedure format checks
  if (/\bRevenue Ruling\b/i.test(rawText) && !/\bRev\.\s*Rul\.\b/.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 14.5',
      source: 'Bluebook',
      severity: 'error',
      message: '"Revenue Ruling" should be abbreviated as "Rev. Rul." in citations.',
      suggestion: 'Use "Rev. Rul." — e.g., "Rev. Rul. 99-7, 1999-1 C.B. 361".',
    });
  }

  if (/\bRevenue Procedure\b/i.test(rawText) && !/\bRev\.\s*Proc\.\b/.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 14.5',
      source: 'Bluebook',
      severity: 'error',
      message: '"Revenue Procedure" should be abbreviated as "Rev. Proc." in citations.',
      suggestion: 'Use "Rev. Proc." — e.g., "Rev. Proc. 2020-1".',
    });
  }

  // Private Letter Ruling format
  if (/\bPrivate Letter Ruling\b/i.test(rawText) && !/\bP\.L\.R\.\b|Priv\.\s*Ltr\.\s*Rul\./i.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 14.5',
      source: 'Bluebook',
      severity: 'warning',
      message: '"Private Letter Ruling" should be abbreviated as "Priv. Ltr. Rul." or "P.L.R." in citations.',
      suggestion: 'Use "Priv. Ltr. Rul." or "P.L.R."',
    });
  }
}

/**
 * R. 14.2: Named regulations should precede the citation, separated by comma.
 */
function checkNamedRegulationFormat(rawText: string | undefined, issues: ValidationIssue[]): void {
  if (!rawText) return;

  // Detect common named regulations
  const NAMED_REGS: [RegExp, string][] = [
    [/\bClean Air Act\b/i, 'Clean Air Act'],
    [/\bClean Water Act\b/i, 'Clean Water Act'],
    [/\bEndangered Species Act\b/i, 'Endangered Species Act'],
    [/\bResource Conservation and Recovery Act\b/i, 'Resource Conservation and Recovery Act'],
  ];

  for (const [pattern, name] of NAMED_REGS) {
    if (pattern.test(rawText)) {
      // Named regulation found — check that it's followed by a comma then the C.F.R. citation
      const afterName = rawText.substring(rawText.search(pattern) + name.length);
      if (/\s+\d+\s+C\.F\.R\./.test(afterName) && !afterName.startsWith(',')) {
        issues.push({
          id: uuid(),
          rule: 'R. 14.2',
          source: 'Bluebook',
          severity: 'warning',
          message: `Named regulation "${name}" should be separated from the code citation by a comma.`,
          suggestion: `Format as: "${name}, [C.F.R. citation]".`,
        });
      }
    }
  }
}

/**
 * R. 14.2: Verify C.F.R. citation includes all required components.
 */
function checkCFRCompleteFormat(components: RegulationComponents, rawText: string | undefined, issues: ValidationIssue[]): void {
  if (!rawText) return;

  const isCFR = components.source && /C\.?F\.?R/i.test(components.source);
  if (!isCFR) return;

  // C.F.R. must have: title + C.F.R. + § + section + (year)
  // Check for missing section
  if (/C\.F\.R\.\s*\(/.test(rawText) && !/C\.F\.R\.\s*§/.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 14.2',
      source: 'Bluebook',
      severity: 'error',
      message: 'C.F.R. citations must include a section number with the § symbol.',
      suggestion: 'Include the section: "40 C.F.R. § 261.3 (2024)" not "40 C.F.R. (2024)".',
    });
  }

  // Year must be the C.F.R. edition year, not the regulation's effective date
  // We can't detect the exact year, but we can flag missing year parenthetical
  if (/C\.F\.R\.\s*§\s*[\d.]+\s*$/.test(rawText.trim())) {
    issues.push({
      id: uuid(),
      rule: 'R. 14.2',
      source: 'Bluebook',
      severity: 'warning',
      message: 'C.F.R. citations should include the year of the C.F.R. edition in parentheses.',
      suggestion: 'Add the year: "40 C.F.R. § 261.3 (2024)".',
    });
  }
}

/**
 * R. 14.2(a): Federal Register citations should include full date parenthetical.
 */
function checkFedRegDateFormat(components: RegulationComponents, rawText: string | undefined, issues: ValidationIssue[]): void {
  if (!rawText) return;

  const isFedReg = components.source && /Fed\.?\s*Reg/i.test(components.source);
  if (!isFedReg) return;

  // Fed. Reg. citations should use full date format: "(Month Day, Year)"
  // Check if only a year is present: "(2020)" instead of "(Mar. 7, 2020)"
  if (/\(\d{4}\)\s*$/.test(rawText.trim()) && !/\([A-Z][a-z]{2,8}\.?\s+\d{1,2},\s*\d{4}\)/.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 14.2(a)',
      source: 'Bluebook',
      severity: 'warning',
      message: 'Federal Register citations should include the full date (month, day, year) in the parenthetical.',
      suggestion: 'Use "(Mar. 7, 2020)" not "(2020)" for Federal Register citations.',
    });
  }

  // Fed. Reg. format: volume + Fed. Reg. + page
  // Check for comma in page number (Fed. Reg. uses commas for pages > 999)
  const pageMatch = rawText.match(/Fed\.\s*Reg\.\s*(\d{4,})/);
  if (pageMatch) {
    const page = pageMatch[1];
    if (page.length >= 4 && !rawText.includes(page.replace(/(\d)(?=(\d{3})+$)/g, '$1,'))) {
      // Page number doesn't have comma formatting — this is actually fine in legal citations
      // No issue to flag
    }
  }
}

/**
 * R. 14.2(b): Proposed rules should include codification parenthetical.
 */
function checkCodificationParenthetical(rawText: string | undefined, issues: ValidationIssue[]): void {
  if (!rawText) return;

  // If this is a proposed rule cited in the Fed. Reg., check for "(to be codified at ...)"
  if (/\bproposed\b/i.test(rawText) && /\bFed\.\s*Reg\.\b/.test(rawText)) {
    if (!/\bto be codified\b/i.test(rawText)) {
      issues.push({
        id: uuid(),
        rule: 'R. 14.2(b)',
        source: 'Bluebook',
        severity: 'suggestion',
        message: 'Proposed rules in the Federal Register should include a "(to be codified at [C.F.R. citation])" parenthetical when applicable.',
        suggestion: 'Add "(to be codified at 40 C.F.R. pt. 261)" or similar after the date parenthetical.',
      });
    }
  }
}
