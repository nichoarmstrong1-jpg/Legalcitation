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
  checkSectionNumberFormat(components, rawText, issues);
  checkClauseNumberFormat(components, rawText, issues);
  checkSubdivisionOrder(rawText, issues);
  checkStateConstitutionFormat(components, rawText, issues);
  checkSpelledOutSubdivisions(rawText, issues);

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

  // Article numbers MUST use Roman numerals (R. 11)
  if (components.article && /^\d+$/.test(components.article)) {
    const roman = toRoman(parseInt(components.article, 10));
    if (roman) {
      issues.push({
        id: uuid(),
        rule: 'R. 11',
        source: 'Bluebook',
        severity: 'error',
        message: `Article numbers in constitutional citations must use Roman numerals.`,
        suggestion: `Use "art. ${roman}" instead of "art. ${components.article}".`,
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

  // Amendment numbers MUST use Roman numerals (R. 11)
  if (components.amendment && /^\d+$/.test(components.amendment)) {
    const roman = toRoman(parseInt(components.amendment, 10));
    if (roman) {
      issues.push({
        id: uuid(),
        rule: 'R. 11',
        source: 'Bluebook',
        severity: 'error',
        message: 'Amendment numbers must use Roman numerals.',
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

/**
 * R. 11: Section numbers in constitutional citations must be in Arabic numerals.
 * "§ I" is wrong — must be "§ 1".
 */
function checkSectionNumberFormat(components: ConstitutionComponents, rawText: string | undefined, issues: ValidationIssue[]): void {
  if (!components.section || !rawText) return;

  // Check if section number uses Roman numerals instead of Arabic
  if (/^[IVXLC]+$/i.test(components.section.trim())) {
    issues.push({
      id: uuid(),
      rule: 'R. 11',
      source: 'Bluebook',
      severity: 'error',
      message: 'Section numbers in constitutional citations must use Arabic numerals, not Roman numerals.',
      suggestion: `Use "§ ${romanToArabic(components.section.trim())}" instead of "§ ${components.section}".`,
    });
  }
}

/**
 * R. 11: Clause numbers must be in Arabic numerals.
 */
function checkClauseNumberFormat(components: ConstitutionComponents, rawText: string | undefined, issues: ValidationIssue[]): void {
  if (!components.clause || !rawText) return;

  // Check if clause number uses Roman numerals
  if (/^[IVXLC]+$/i.test(components.clause.trim())) {
    issues.push({
      id: uuid(),
      rule: 'R. 11',
      source: 'Bluebook',
      severity: 'error',
      message: 'Clause numbers must use Arabic numerals, not Roman numerals.',
      suggestion: `Use "cl. ${romanToArabic(components.clause.trim())}" instead of "cl. ${components.clause}".`,
    });
  }
}

/**
 * R. 11: Subdivisions must appear in order: art./amend., §, cl.
 */
function checkSubdivisionOrder(rawText: string | undefined, issues: ValidationIssue[]): void {
  if (!rawText) return;

  const artPos = rawText.search(/\bart\.\s/i);
  const amendPos = rawText.search(/\bamend\.\s/i);
  const secPos = rawText.search(/§\s/);
  const clPos = rawText.search(/\bcl\.\s/i);

  const primaryPos = artPos >= 0 ? artPos : amendPos;

  // Section should come after article/amendment
  if (primaryPos >= 0 && secPos >= 0 && secPos < primaryPos) {
    issues.push({
      id: uuid(),
      rule: 'R. 11',
      source: 'Bluebook',
      severity: 'error',
      message: 'Constitutional subdivision order is incorrect. Article/amendment should come before the section.',
      suggestion: 'Use order: [jurisdiction] Const. art./amend. [#], § [#], cl. [#].',
    });
  }

  // Clause should come after section
  if (secPos >= 0 && clPos >= 0 && clPos < secPos) {
    issues.push({
      id: uuid(),
      rule: 'R. 11',
      source: 'Bluebook',
      severity: 'error',
      message: 'Constitutional subdivision order is incorrect. Section should come before clause.',
      suggestion: 'Use order: § [#], cl. [#] — e.g., "U.S. Const. art. I, § 8, cl. 3".',
    });
  }

  // Check for missing comma separators between subdivisions
  if (primaryPos >= 0 && secPos >= 0) {
    const between = rawText.substring(primaryPos, secPos);
    if (!/,\s*$/.test(between.trim()) && !/,\s/.test(between)) {
      // Check if there's no comma between art./amend. and §
      const fullBetween = rawText.substring(primaryPos, secPos);
      if (!/,/.test(fullBetween)) {
        issues.push({
          id: uuid(),
          rule: 'R. 11',
          source: 'Bluebook',
          severity: 'error',
          message: 'Subdivisions in constitutional citations must be separated by commas.',
          suggestion: 'Use commas: "art. I, § 8, cl. 3" not "art. I § 8 cl. 3".',
        });
      }
    }
  }
}

/**
 * R. 11 / T1.3: State constitution format checks.
 */
function checkStateConstitutionFormat(components: ConstitutionComponents, rawText: string | undefined, issues: ValidationIssue[]): void {
  if (!rawText) return;

  // Check for spelled-out state names in constitution citations
  const STATE_NAMES: [RegExp, string][] = [
    [/\bAlabama Constitution\b/i, 'Ala. Const.'],
    [/\bAlaska Constitution\b/i, 'Alaska Const.'],
    [/\bArizona Constitution\b/i, 'Ariz. Const.'],
    [/\bArkansas Constitution\b/i, 'Ark. Const.'],
    [/\bCalifornia Constitution\b/i, 'Cal. Const.'],
    [/\bColorado Constitution\b/i, 'Colo. Const.'],
    [/\bConnecticut Constitution\b/i, 'Conn. Const.'],
    [/\bDelaware Constitution\b/i, 'Del. Const.'],
    [/\bFlorida Constitution\b/i, 'Fla. Const.'],
    [/\bGeorgia Constitution\b/i, 'Ga. Const.'],
    [/\bIllinois Constitution\b/i, 'Ill. Const.'],
    [/\bIndiana Constitution\b/i, 'Ind. Const.'],
    [/\bKansas Constitution\b/i, 'Kan. Const.'],
    [/\bKentucky Constitution\b/i, 'Ky. Const.'],
    [/\bLouisiana Constitution\b/i, 'La. Const.'],
    [/\bMassachusetts Constitution\b/i, 'Mass. Const.'],
    [/\bMichigan Constitution\b/i, 'Mich. Const.'],
    [/\bMinnesota Constitution\b/i, 'Minn. Const.'],
    [/\bMississippi Constitution\b/i, 'Miss. Const.'],
    [/\bMissouri Constitution\b/i, 'Mo. Const.'],
    [/\bNebraska Constitution\b/i, 'Neb. Const.'],
    [/\bNew Jersey Constitution\b/i, 'N.J. Const.'],
    [/\bNew York Constitution\b/i, 'N.Y. Const.'],
    [/\bNorth Carolina Constitution\b/i, 'N.C. Const.'],
    [/\bOhio Constitution\b/i, 'Ohio Const.'],
    [/\bOklahoma Constitution\b/i, 'Okla. Const.'],
    [/\bOregon Constitution\b/i, 'Or. Const.'],
    [/\bPennsylvania Constitution\b/i, 'Pa. Const.'],
    [/\bTennessee Constitution\b/i, 'Tenn. Const.'],
    [/\bTexas Constitution\b/i, 'Tex. Const.'],
    [/\bVirginia Constitution\b/i, 'Va. Const.'],
    [/\bWashington Constitution\b/i, 'Wash. Const.'],
    [/\bWisconsin Constitution\b/i, 'Wis. Const.'],
  ];

  for (const [pattern, abbr] of STATE_NAMES) {
    if (pattern.test(rawText)) {
      issues.push({
        id: uuid(),
        rule: 'R. 11 / T1.3',
        source: 'Bluebook',
        severity: 'error',
        message: `Abbreviate the state constitution name in citations. Use "${abbr}".`,
        suggestion: `Use "${abbr}" — e.g., "${abbr} art. I, § 1".`,
      });
      break;
    }
  }

  // Some states use "ch." (chapter) instead of "art." — detect misuse
  // States using chapters: Connecticut (some provisions), Virginia (some provisions)
  if (/\bConst\.\s+ch\.\s/i.test(rawText)) {
    // This is valid for states that organize by chapter — just note for awareness
    // No error to flag
  }
}

/**
 * R. 11 / T16: Check for spelled-out subdivision names that should be abbreviated.
 */
function checkSpelledOutSubdivisions(rawText: string | undefined, issues: ValidationIssue[]): void {
  if (!rawText) return;

  // Only check in citation context (has "Const." abbreviation)
  if (!/\bConst\.\b/.test(rawText)) return;

  // "article" should be "art."
  if (/\bConst\.\s+article\b/i.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 11 / T16',
      source: 'Bluebook',
      severity: 'error',
      message: 'Abbreviate "article" as "art." in constitution citations.',
      suggestion: 'Use "art." — e.g., "U.S. Const. art. I, § 8".',
    });
  }

  // "amendment" should be "amend."
  if (/\bConst\.\s+amendment\b/i.test(rawText) || /\bConst\.\s+.*\bamendment\b/i.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 11 / T16',
      source: 'Bluebook',
      severity: 'error',
      message: 'Abbreviate "amendment" as "amend." in constitution citations.',
      suggestion: 'Use "amend." — e.g., "U.S. Const. amend. XIV".',
    });
  }

  // "section" should be "§"
  if (/\bConst\..*\bsection\b/i.test(rawText) && !rawText.includes('§')) {
    issues.push({
      id: uuid(),
      rule: 'R. 11 / R. 6.2(c)',
      source: 'Bluebook',
      severity: 'error',
      message: 'Use the section symbol (§) instead of "section" in constitution citations.',
      suggestion: 'Use "§" — e.g., "U.S. Const. art. I, § 8, cl. 3".',
    });
  }

  // "clause" should be "cl."
  if (/\bConst\..*\bclause\b/i.test(rawText) && !/\bcl\.\b/.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 11 / T16',
      source: 'Bluebook',
      severity: 'error',
      message: 'Abbreviate "clause" as "cl." in constitution citations.',
      suggestion: 'Use "cl." — e.g., "U.S. Const. art. I, § 8, cl. 3".',
    });
  }
}

/**
 * Convert Roman numeral string to Arabic number.
 */
function romanToArabic(roman: string): number {
  const values: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100 };
  let result = 0;
  const upper = roman.toUpperCase();
  for (let i = 0; i < upper.length; i++) {
    const current = values[upper[i]] || 0;
    const next = values[upper[i + 1]] || 0;
    if (current < next) {
      result -= current;
    } else {
      result += current;
    }
  }
  return result;
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
