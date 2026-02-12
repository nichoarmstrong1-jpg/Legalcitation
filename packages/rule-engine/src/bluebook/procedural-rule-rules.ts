import { v4 as uuid } from 'uuid';
import type { ValidationIssue } from '@legalcitation/shared';

/**
 * Validate procedural and court rule citations per R. 12.9.3 / B12.1.3.
 *
 * Federal procedural rules:
 *   - Fed. R. Civ. P. [rule number]
 *   - Fed. R. Crim. P. [rule number]
 *   - Fed. R. Evid. [rule number]
 *   - Fed. R. App. P. [rule number]
 *   - Sup. Ct. R. [rule number]
 *
 * Key rules:
 *   - Current rules are cited WITHOUT a date.
 *   - Use the exact abbreviation per T1.
 *   - Court rules: [court name per T7/T10] R. [number]
 *   - Do NOT use "supra" for procedural rules.
 */
export function validateProceduralRules(rawText: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  checkFederalRuleAbbreviations(rawText, issues);
  checkWrongAbbreviationPatterns(rawText, issues);
  checkCurrentRuleDate(rawText, issues);
  checkShortFormRestriction(rawText, issues);
  checkCourtRuleFormat(rawText, issues);
  checkRuleSubdivisionFormat(rawText, issues);
  checkSpelledOutRuleNames(rawText, issues);

  return issues;
}

/**
 * R. 12.9.3: Check that federal procedural rules use the correct abbreviation.
 */
function checkFederalRuleAbbreviations(rawText: string, issues: ValidationIssue[]): void {
  const SPELLED_OUT_RULES: [RegExp, string][] = [
    [/\bFederal Rules? of Civil Procedure\b/i, 'Fed. R. Civ. P.'],
    [/\bFederal Rules? of Criminal Procedure\b/i, 'Fed. R. Crim. P.'],
    [/\bFederal Rules? of Appellate Procedure\b/i, 'Fed. R. App. P.'],
    [/\bFederal Rules? of Evidence\b/i, 'Fed. R. Evid.'],
    [/\bSupreme Court Rules?\b/i, 'Sup. Ct. R.'],
    [/\bFederal Rules? of Bankruptcy Procedure\b/i, 'Fed. R. Bankr. P.'],
  ];

  for (const [pattern, abbr] of SPELLED_OUT_RULES) {
    if (pattern.test(rawText) && !rawText.includes(abbr)) {
      issues.push({
        id: uuid(),
        rule: 'R. 12.9.3',
        source: 'Bluebook',
        severity: 'error',
        message: `Abbreviate to "${abbr}" in citations.`,
        suggestion: `Use "${abbr}" — e.g., "${abbr} 12(b)(6)."`,
      });
    }
  }
}

/**
 * R. 12.9.3: Detect common wrong abbreviation patterns for federal rules.
 */
function checkWrongAbbreviationPatterns(rawText: string, issues: ValidationIssue[]): void {
  const WRONG_PATTERNS: [RegExp, string, string][] = [
    [/\bF\.?\s*R\.?\s*C\.?\s*P\.?\s+\d/, 'F.R.C.P.', 'Fed. R. Civ. P.'],
    [/\bF\.?\s*R\.?\s*E\.?\s+\d/, 'F.R.E.', 'Fed. R. Evid.'],
    [/\bF\.?\s*R\.?\s*Cr\.?\s*P\.?\s+\d/, 'F.R.Cr.P.', 'Fed. R. Crim. P.'],
    [/\bF\.?\s*R\.?\s*A\.?\s*P\.?\s+\d/, 'F.R.A.P.', 'Fed. R. App. P.'],
    [/\bFRCP\s+\d/, 'FRCP', 'Fed. R. Civ. P.'],
    [/\bFRE\s+\d/, 'FRE', 'Fed. R. Evid.'],
    [/\bFRCrP\s+\d/, 'FRCrP', 'Fed. R. Crim. P.'],
    [/\bFRAP\s+\d/, 'FRAP', 'Fed. R. App. P.'],
  ];

  for (const [pattern, wrong, correct] of WRONG_PATTERNS) {
    // Don't flag if the correct abbreviation is already present
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
 * R. 12.9.3: Current rules of evidence and procedure should NOT have a date.
 * Only include a date for rules no longer in force.
 */
function checkCurrentRuleDate(rawText: string, issues: ValidationIssue[]): void {
  const hasProceduralAbbr =
    /\bFed\.\s*R\.\s*(Civ|Crim|App|Evid|Bankr)\.\s*P?\.\s*\d/.test(rawText) ||
    /\bSup\.\s*Ct\.\s*R\.\s*\d/.test(rawText);

  if (!hasProceduralAbbr) return;

  const hasTrailingYear = /\(\d{4}\)\s*\.?\s*$/.test(rawText);
  const hasRepealed = /\b(repealed|superseded|amended|abrogated)\b/i.test(rawText);

  if (hasTrailingYear && !hasRepealed) {
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

/**
 * R. 4.2 / R. 12.9.3: "Supra" cannot be used for procedural rules.
 */
function checkShortFormRestriction(rawText: string, issues: ValidationIssue[]): void {
  const isProceduralRule =
    /\bFed\.\s*R\.\s*(Civ|Crim|App|Evid|Bankr)\.\s*P?\./.test(rawText) ||
    /\bSup\.\s*Ct\.\s*R\./.test(rawText) ||
    /\bCir\.\s*R\./.test(rawText);

  if (!isProceduralRule) return;

  if (/\bsupra\b/i.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 4.2 / R. 12.9.3',
      source: 'Bluebook',
      severity: 'error',
      message: '"Supra" cannot be used for procedural rule citations. Use "id." or the full short form.',
      suggestion: 'Use "id." for an immediately preceding citation or repeat the rule citation.',
    });
  }

  if (/\bhereinafter\b/i.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 4.2 / R. 12.9.3',
      source: 'Bluebook',
      severity: 'error',
      message: '"Hereinafter" cannot be used for procedural rule citations.',
      suggestion: 'Use "id." or repeat the rule citation.',
    });
  }
}

/**
 * Court-specific rules: [court abbreviation] R. [number].
 * e.g., "8th Cir. R. 27B", "S.D. Ill. R. 83.6"
 */
function checkCourtRuleFormat(rawText: string, issues: ValidationIssue[]): void {
  // Check for "Rule" spelled out in court rule context
  if (/\bCir\.\s+Rule\s+\d/i.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 12.9.3',
      source: 'Bluebook',
      severity: 'error',
      message: 'Abbreviate "Rule" as "R." in court rule citations.',
      suggestion: 'Use "R." — e.g., "8th Cir. R. 27B" not "8th Cir. Rule 27B".',
    });
  }

  // Check for "Local Rule" that should be abbreviated
  if (/\bLocal Rule\s+\d/i.test(rawText) && !/\bR\.\s+\d/.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 12.9.3',
      source: 'Bluebook',
      severity: 'warning',
      message: 'In citations, "Local Rule" is typically abbreviated. Use the court name abbreviation followed by "R."',
      suggestion: 'Format as: "[Court Abbreviation] R. [number]" — e.g., "S.D.N.Y. R. 56.1".',
    });
  }
}

/**
 * R. 3.3: Rule subdivisions should use parenthesized lowercase letters/numbers.
 * e.g., Fed. R. Civ. P. 12(b)(6), not Fed. R. Civ. P. 12 (b)(6)
 */
function checkRuleSubdivisionFormat(rawText: string, issues: ValidationIssue[]): void {
  // Check for space before subdivision in procedural rule context
  const ruleWithSpaceBeforeSub = /\bP\.\s+(\d+)\s+\([a-z0-9]/i;
  if (ruleWithSpaceBeforeSub.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 3.3',
      source: 'Bluebook',
      severity: 'error',
      message: 'Rule subdivisions should immediately follow the rule number with no space.',
      suggestion: 'Remove the space: "12(b)(6)" not "12 (b)(6)".',
    });
  }
}

/**
 * Check for rule names that should use abbreviations in citation context.
 */
function checkSpelledOutRuleNames(rawText: string, issues: ValidationIssue[]): void {
  // "Rule of Civil Procedure" without "Federal" — might be a state rule
  if (/\bRules? of Civil Procedure\b/i.test(rawText) && !/\bFederal\b/i.test(rawText) && !/\bFed\.\b/.test(rawText)) {
    // This might be a state procedural rule — suggest using proper abbreviation
    issues.push({
      id: uuid(),
      rule: 'R. 12.9.3 / BT2',
      source: 'Bluebook',
      severity: 'suggestion',
      message: 'State procedural rules should be abbreviated per BT2 or the Bluebook format.',
      suggestion: 'Abbreviate the rule name — e.g., "Ohio R. Civ. P. 12" or "[State] R. Civ. P. [number]".',
    });
  }

  // "Rules of Professional Conduct" / "Model Rules"
  if (/\bRules? of Professional Conduct\b/i.test(rawText) && !/\bR\.\s*Prof\.\s*Conduct\b/.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 12.9.3',
      source: 'Bluebook',
      severity: 'warning',
      message: 'Abbreviate "Rules of Professional Conduct" in citations.',
      suggestion: 'Use "R. Prof. Conduct" or the jurisdiction-specific abbreviation.',
    });
  }
}
