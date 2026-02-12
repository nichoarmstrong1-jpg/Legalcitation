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
 * States that organize their statutes by subject matter (R. 12.3, T1.3).
 * These require the subject matter name in the citation.
 */
const SUBJECT_MATTER_STATES = ['Cal.', 'Md.', 'N.Y.', 'Tex.'];

/**
 * Known publishers for unofficial codes.
 */
const KNOWN_PUBLISHERS = ['West', 'LexisNexis', 'Deering', 'McKinney', 'Bancroft-Whitney', 'Matthew Bender'];

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
  checkSubjectMatterCode(components, rawText, issues);
  checkNamedStatuteFormat(rawText, issues);
  checkFederalYearOptional(components, rawText, issues);
  checkSupplementPlacement(components, rawText, issues);
  checkSpelledOutCodeName(rawText, issues);
  checkTreasuryRegFormat(rawText, issues);

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

  // R. 12.9.3: Common wrong abbreviation patterns
  const WRONG_ABBREVIATIONS: [RegExp, string, string][] = [
    [/\bF\.?\s*R\.?\s*C\.?\s*P\.?\s+\d/i, 'F.R.C.P.', 'Fed. R. Civ. P.'],
    [/\bF\.?\s*R\.?\s*E\.?\s+\d/i, 'F.R.E.', 'Fed. R. Evid.'],
    [/\bF\.?\s*R\.?\s*Cr\.?\s*P\.?\s+\d/i, 'F.R.Cr.P.', 'Fed. R. Crim. P.'],
    [/\bF\.?\s*R\.?\s*A\.?\s*P\.?\s+\d/i, 'F.R.A.P.', 'Fed. R. App. P.'],
  ];

  for (const [pattern, wrong, correct] of WRONG_ABBREVIATIONS) {
    if (pattern.test(rawText) && !rawText.includes(correct)) {
      issues.push({
        id: uuid(),
        rule: 'R. 12.9.3',
        source: 'Bluebook',
        severity: 'error',
        message: `"${wrong}" is not the correct abbreviation. Use "${correct}".`,
        suggestion: `Change to "${correct}" — e.g., "${correct} 12(b)(6)."`,
      });
    }
  }
}

/**
 * R. 12.3 / T1.3: Subject matter codes (California, Maryland, New York, Texas).
 * These states organize statutes by subject; the subject matter must be included.
 */
function checkSubjectMatterCode(components: StatuteComponents, rawText: string | undefined, issues: ValidationIssue[]): void {
  if (!rawText || !components.code) return;

  // Detect California codes
  if (/\bCal\.\b/.test(rawText) || /\bCalifornia\b/i.test(rawText)) {
    // California codes must include subject matter: e.g., "Cal. Penal Code § 187"
    // Simple check: if "Cal." is present but no subject matter word follows
    if (/\bCal\.\s*§/.test(rawText)) {
      issues.push({
        id: uuid(),
        rule: 'R. 12.3 / T1.3',
        source: 'Bluebook',
        severity: 'error',
        message: 'California statutes require the subject matter code name between "Cal." and "§".',
        suggestion: 'Include the subject matter — e.g., "Cal. Penal Code § 187" or "Cal. Civ. Code § 1798.100".',
      });
    }
  }

  // Detect New York codes
  if (/\bN\.Y\.\b/.test(rawText) || /\bNew York\b/i.test(rawText)) {
    if (/\bN\.Y\.\s*§/.test(rawText)) {
      issues.push({
        id: uuid(),
        rule: 'R. 12.3 / T1.3',
        source: 'Bluebook',
        severity: 'error',
        message: 'New York statutes require the subject matter code name between "N.Y." and "§".',
        suggestion: 'Include the subject matter — e.g., "N.Y. Penal Law § 125.25" or "N.Y. Gen. Bus. Law § 349".',
      });
    }
  }

  // Detect Texas codes
  if (/\bTex\.\b/.test(rawText) || /\bTexas\b/i.test(rawText)) {
    if (/\bTex\.\s*§/.test(rawText)) {
      issues.push({
        id: uuid(),
        rule: 'R. 12.3 / T1.3',
        source: 'Bluebook',
        severity: 'error',
        message: 'Texas statutes require the subject matter code name between "Tex." and "§".',
        suggestion: 'Include the subject matter — e.g., "Tex. Penal Code Ann. § 19.02" or "Tex. Bus. & Com. Code Ann. § 17.46".',
      });
    }
  }

  // Detect Maryland codes
  if (/\bMd\.\b/.test(rawText) || /\bMaryland\b/i.test(rawText)) {
    if (/\bMd\.\s*(Code\s+)?Ann\.\s*§/.test(rawText) && !/\bMd\.\s*Code\s+Ann\.,\s*[A-Z]/.test(rawText)) {
      issues.push({
        id: uuid(),
        rule: 'R. 12.3 / T1.3',
        source: 'Bluebook',
        severity: 'warning',
        message: 'Maryland statutes typically require the subject matter article name.',
        suggestion: 'Include the subject matter — e.g., "Md. Code Ann., Crim. Law § 2-201".',
      });
    }
  }
}

/**
 * R. 12.3.1(a): Named statutes — format: Act Name, original §, full citation.
 */
function checkNamedStatuteFormat(rawText: string | undefined, issues: ValidationIssue[]): void {
  if (!rawText) return;

  // Detect named statutes (e.g., "Clean Air Act", "Americans with Disabilities Act")
  const namedStatutePattern = /\b[A-Z][a-z]+(?:\s+[A-Za-z]+)*\s+Act\b/;
  const actMatch = rawText.match(namedStatutePattern);

  if (actMatch) {
    // Named statute detected — check format
    const actName = actMatch[0];

    // Must have a comma after the act name before the code citation
    const afterAct = rawText.substring(rawText.indexOf(actName) + actName.length);
    if (afterAct.length > 0 && !afterAct.startsWith(',') && !afterAct.startsWith(' of ') && !/^\s*$/.test(afterAct)) {
      // Check if there's a code citation following without a comma
      if (/\s+\d+\s+U\.S\.C|§/.test(afterAct)) {
        issues.push({
          id: uuid(),
          rule: 'R. 12.3.1(a)',
          source: 'Bluebook',
          severity: 'warning',
          message: `Named statute "${actName}" should be followed by a comma, then the original section number (if any), then the full code citation.`,
          suggestion: `Format as: "${actName}, [original § if applicable], [code citation]" — e.g., "Clean Air Act § 101, 42 U.S.C. § 7401 (2018)".`,
        });
      }
    }
  }
}

/**
 * R. 12.3.2: Federal official code (U.S.C.) year is optional for current version.
 * Unofficial codes (U.S.C.A., U.S.C.S.) always need publisher, even without year.
 */
function checkFederalYearOptional(components: StatuteComponents, rawText: string | undefined, issues: ValidationIssue[]): void {
  if (!rawText || !components.code) return;

  const isUSCA = /U\.S\.C\.A\./i.test(components.code) || /U\.S\.C\.A\./i.test(rawText);
  const isUSCS = /U\.S\.C\.S\./i.test(components.code) || /U\.S\.C\.S\./i.test(rawText);

  if (isUSCA || isUSCS) {
    // Unofficial codes must always have publisher, even without year
    const hasPublisher = /\((?:West|LexisNexis|Deering|McKinney|Matthew Bender)\b/i.test(rawText);
    if (!hasPublisher) {
      issues.push({
        id: uuid(),
        rule: 'R. 12.3.1(d)',
        source: 'Bluebook',
        severity: 'error',
        message: `Unofficial federal codes (${isUSCA ? 'U.S.C.A.' : 'U.S.C.S.'}) must include the publisher in the parenthetical, even without a year.`,
        suggestion: `Add the publisher — e.g., "(West)" or "(West 2020)" or "(LexisNexis)".`,
      });
    }
  }
}

/**
 * R. 12.3.1(e): Supplement placement — "Supp." goes after publisher, before year.
 */
function checkSupplementPlacement(components: StatuteComponents, rawText: string | undefined, issues: ValidationIssue[]): void {
  if (!rawText || !components.supplement) return;

  // Correct formats: "(Supp. 2020)" or "(West Supp. 2020)" or "(Supp. V 2017)"
  // Wrong: "(2020 Supp.)" or "(West 2020 Supp.)"
  if (/\(\d{4}\s+Supp\.\)/.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 12.3.1(e)',
      source: 'Bluebook',
      severity: 'error',
      message: '"Supp." should come before the year, not after.',
      suggestion: 'Use "(Supp. [year])" or "(West Supp. [year])" — e.g., "(Supp. V 2017)".',
    });
  }

  // Check for "Supp" without period
  if (/\bSupp\b(?!\.)/.test(rawText) && !/\bSupplement\b/i.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 12.3.1(e)',
      source: 'Bluebook',
      severity: 'error',
      message: '"Supp" must include a period: "Supp."',
      suggestion: 'Add a period: "Supp." not "Supp".',
    });
  }
}

/**
 * R. 12: Check for spelled-out code names that should be abbreviated in citation sentences.
 */
function checkSpelledOutCodeName(rawText: string | undefined, issues: ValidationIssue[]): void {
  if (!rawText) return;

  const SPELLED_OUT_CODES: [RegExp, string][] = [
    [/\bUnited States Code\b/i, 'U.S.C.'],
    [/\bUnited States Code Annotated\b/i, 'U.S.C.A.'],
    [/\bUnited States Code Service\b/i, 'U.S.C.S.'],
    [/\bFlorida Statutes\b/i, 'Fla. Stat.'],
    [/\bGeneral Statutes of Connecticut\b/i, 'Conn. Gen. Stat.'],
    [/\bOhio Revised Code\b/i, 'Ohio Rev. Code'],
    [/\bPennsylvania Consolidated Statutes\b/i, 'Pa. Cons. Stat.'],
    [/\bVirginia Code\b/i, 'Va. Code Ann.'],
  ];

  for (const [pattern, abbr] of SPELLED_OUT_CODES) {
    if (pattern.test(rawText) && !rawText.includes(abbr)) {
      issues.push({
        id: uuid(),
        rule: 'R. 12.3 / T1',
        source: 'Bluebook',
        severity: 'error',
        message: `Spell out the code name only in textual sentences. In citations, abbreviate to "${abbr}".`,
        suggestion: `Use "${abbr}" in citation sentences per Table T1.`,
      });
    }
  }
}

/**
 * R. 14.5: Treasury Regulation format validation.
 */
function checkTreasuryRegFormat(rawText: string | undefined, issues: ValidationIssue[]): void {
  if (!rawText) return;

  // "Treasury Regulation" should be abbreviated as "Treas. Reg."
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

  // Check for Treas. Reg. without § symbol
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

  // Check for missing space after § in Treas. Reg. context
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
}
