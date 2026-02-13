import { v4 as uuid } from 'uuid';
import type { ValidationIssue } from '@legalcitation/shared';

/**
 * Validate abbreviation spacing per Rule 6.1(a).
 *
 * - Adjacent single capitals: NO space → S.D.N.Y., D.C.
 * - Single capital + longer abbreviation: space → D. Mass., S.D. Cal.
 * - Ordinals in reporter series: F.2d, F.3d, F. Supp. 2d
 */
export function validateSpacing(rawText: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Check for incorrect spacing in abbreviations

  // Bad: "F.Supp." should be "F. Supp."
  checkMissingSpace(rawText, issues);

  // Bad: "S. D. N. Y." should be "S.D.N.Y."
  checkExtraSpace(rawText, issues);

  // Bad: "F. 3d" should be "F.3d"
  checkReporterSeriesSpacing(rawText, issues);

  // R. 6.2(c): Section symbol spacing
  checkSectionSymbolSpacing(rawText, issues);

  // R. 6.2(c): Paragraph symbol spacing
  checkParagraphSymbolSpacing(rawText, issues);

  // R. 6.1: Double spaces
  checkDoubleSpaces(rawText, issues);

  // R. 6.1: Comma spacing (missing space after comma)
  checkCommaSpacing(rawText, issues);

  // R. 6.1: Space before comma or period (never correct)
  checkSpaceBeforePunctuation(rawText, issues);

  // R. 6.2(c): Non-breaking space between § and number
  checkSectionNonBreakingSpace(rawText, issues);

  // R. 6.1(a): Volume number and reporter name spacing
  checkVolumeReporterSpacing(rawText, issues);

  // R. 6.1(a): Missing space after period in abbreviations
  checkMissingSpaceAfterPeriodInAbbreviation(rawText, issues);

  return issues;
}

function checkMissingSpace(text: string, issues: ValidationIssue[]): void {
  // Single capital followed immediately by a multi-letter abbreviation (no space)
  // e.g., "F.Supp." should be "F. Supp."
  const pattern = /\b([A-Z]\.)((?:[A-Z][a-z]+\.)|(?:Supp\.)|(?:App\.)|(?:Dist\.)|(?:Bankr\.))/g;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    const bad = match[0];
    const corrected = `${match[1]} ${match[2]}`;
    issues.push({
      id: uuid(),
      rule: 'R. 6.1(a)',
      source: 'Bluebook',
      severity: 'error',
      message: `Missing space in "${bad}". A space is required between a single capital and a longer abbreviation.`,
      suggestion: `Change to "${corrected}".`,
    });
  }
}

function checkExtraSpace(text: string, issues: ValidationIssue[]): void {
  // Adjacent single capitals should NOT have spaces between them
  // e.g., "S. D. N. Y." should be "S.D.N.Y."
  const pattern = /\b([A-Z]\.)\s+([A-Z]\.)\s+([A-Z]\.)\s+([A-Z]\.)/g;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    const bad = match[0];
    const corrected = bad.replace(/\.\s+/g, '.').replace(/([A-Z])$/, '$1');
    if (bad !== corrected) {
      issues.push({
        id: uuid(),
        rule: 'R. 6.1(a)',
        source: 'Bluebook',
        severity: 'error',
        message: `Extra spaces in "${bad}". Adjacent single capitals should not have spaces between them.`,
        suggestion: `Change to "${corrected}".`,
      });
    }
  }

  // Two adjacent single capitals with space: "S. D." → "S.D." (only if both single caps)
  const twoCapPattern = /\b([A-Z]\.)\s+([A-Z]\.(?=[A-Z]|\s*[A-Z]|\s*$))/g;
  while ((match = twoCapPattern.exec(text)) !== null) {
    // Only flag if followed by another single cap or end
    const nextChar = text[match.index + match[0].length];
    if (nextChar && /[A-Z]/.test(nextChar)) {
      // Part of a longer abbreviation like "S. D.N.Y." → this is mixed
      // Let other rules handle it
    }
  }
}

function checkReporterSeriesSpacing(text: string, issues: ValidationIssue[]): void {
  // Bad: "F. 2d" or "F. 3d" should be "F.2d" or "F.3d"
  const badSeriesPattern = /\b(F|A|P|S\.E|S\.W|N\.E|N\.W|So)\.\s+(2d|3d|4th)\b/g;
  let match;
  while ((match = badSeriesPattern.exec(text)) !== null) {
    // Only flag single-letter reporter abbreviations (F., A., P.)
    if (match[1].length === 1) {
      const bad = match[0];
      const corrected = `${match[1]}.${match[2]}`;
      issues.push({
        id: uuid(),
        rule: 'R. 6.1(a)',
        source: 'Bluebook',
        severity: 'error',
        message: `Incorrect spacing in "${bad}". Single-capital reporter and ordinal series should have no space.`,
        suggestion: `Change to "${corrected}".`,
      });
    }
  }

  // Bad: "F.Supp.2d" should be "F. Supp. 2d"
  const compactSuppPattern = /F\.Supp\.(\s*)(2d|3d)/g;
  while ((match = compactSuppPattern.exec(text)) !== null) {
    if (match[1] !== ' ') {
      issues.push({
        id: uuid(),
        rule: 'R. 6.1(a)',
        source: 'Bluebook',
        severity: 'error',
        message: `Incorrect spacing. "F.Supp.${match[2]}" should be "F. Supp. ${match[2]}".`,
        suggestion: `Change to "F. Supp. ${match[2]}".`,
      });
    }
  }
}

/**
 * R. 6.2(c): Section symbol (§) must have a space after it before a number.
 */
function checkSectionSymbolSpacing(text: string, issues: ValidationIssue[]): void {
  // §123 → should be § 123
  if (/§\d/.test(text)) {
    issues.push({
      id: uuid(),
      rule: 'R. 6.2(c)',
      source: 'Bluebook',
      severity: 'error',
      message: 'There must be a space between the section symbol (§) and the number.',
      suggestion: 'Add a space: "§ 1983" not "§1983".',
    });
  }

  // §§123 → should be §§ 123
  if (/§§\d/.test(text)) {
    issues.push({
      id: uuid(),
      rule: 'R. 6.2(c)',
      source: 'Bluebook',
      severity: 'error',
      message: 'There must be a space between the double section symbol (§§) and the number.',
      suggestion: 'Add a space: "§§ 1981–1983" not "§§1981–1983".',
    });
  }

  // § § (space between consecutive §) → should be §§
  if (/§\s+§/.test(text)) {
    issues.push({
      id: uuid(),
      rule: 'R. 6.2(c)',
      source: 'Bluebook',
      severity: 'error',
      message: 'Do not place a space between consecutive section symbols. Use "§§" not "§ §".',
      suggestion: 'Close up the symbols: "§§" for multiple sections.',
    });
  }
}

/**
 * R. 6.2(c): Paragraph symbol (¶) must have a space after it before a number.
 */
function checkParagraphSymbolSpacing(text: string, issues: ValidationIssue[]): void {
  if (/¶\d/.test(text)) {
    issues.push({
      id: uuid(),
      rule: 'R. 6.2(c)',
      source: 'Bluebook',
      severity: 'error',
      message: 'There must be a space between the paragraph symbol (¶) and the number.',
      suggestion: 'Add a space: "¶ 45" not "¶45".',
    });
  }

  if (/¶¶\d/.test(text)) {
    issues.push({
      id: uuid(),
      rule: 'R. 6.2(c)',
      source: 'Bluebook',
      severity: 'error',
      message: 'There must be a space between the double paragraph symbol (¶¶) and the number.',
      suggestion: 'Add a space: "¶¶ 45–47" not "¶¶45–47".',
    });
  }

  if (/¶\s+¶/.test(text)) {
    issues.push({
      id: uuid(),
      rule: 'R. 6.2(c)',
      source: 'Bluebook',
      severity: 'error',
      message: 'Do not place a space between consecutive paragraph symbols. Use "¶¶" not "¶ ¶".',
      suggestion: 'Close up the symbols: "¶¶" for multiple paragraphs.',
    });
  }
}

/**
 * General spacing: detect double spaces within citations.
 * Per R. 6.1 and R. 2.3, only single spaces should appear between
 * elements of a citation. Double spaces are a relic of monospaced
 * typewriters and are always incorrect in modern legal citation.
 */
function checkDoubleSpaces(text: string, issues: ValidationIssue[]): void {
  const doubleSpacePattern = / {2,}/g;
  let match;
  while ((match = doubleSpacePattern.exec(text)) !== null) {
    const position = match.index;
    const contextStart = Math.max(0, position - 10);
    const contextEnd = Math.min(text.length, position + match[0].length + 10);
    const context = text.slice(contextStart, contextEnd);
    issues.push({
      id: uuid(),
      rule: 'R. 6.1',
      source: 'Bluebook',
      severity: 'warning',
      message: `Double space detected near "...${context}...". Per R. 6.1 and R. 2.3, citations must use single spaces throughout. Double spacing after periods is a relic of monospaced typewriters and is always incorrect in proportional fonts.`,
      suggestion: 'Replace the double space with a single space.',
    });
  }
}

/**
 * General spacing: comma followed by a letter (missing space after comma).
 */
function checkCommaSpacing(text: string, issues: ValidationIssue[]): void {
  // Comma followed by letter without space (but not inside numbers like "1,000")
  const commaPattern = /,([A-Za-z])/g;
  let match;
  while ((match = commaPattern.exec(text)) !== null) {
    issues.push({
      id: uuid(),
      rule: 'R. 6.1',
      source: 'Bluebook',
      severity: 'error',
      message: `Missing space after comma before "${match[1]}". In Bluebook citations, a space must always follow a comma (except in numbers like "1,000"). This applies to all elements: party names, reporter citations, date parentheticals, and pincites.`,
      suggestion: 'Add a space after the comma.',
    });
  }
}

/**
 * R. 6.1: Space before comma or period — never correct in citations.
 * A space before a comma or period is always a typographical error.
 */
function checkSpaceBeforePunctuation(text: string, issues: ValidationIssue[]): void {
  // Space before comma (but not at the very start of the string)
  const spaceBeforeComma = /\S\s+,/g;
  let match;
  while ((match = spaceBeforeComma.exec(text)) !== null) {
    // Avoid false positives for "compare ... , with" pattern
    const beforeMatch = text.slice(Math.max(0, match.index - 10), match.index + 1);
    if (/compare|contrast/i.test(beforeMatch)) {
      continue;
    }
    issues.push({
      id: uuid(),
      rule: 'R. 6.1',
      source: 'Bluebook',
      severity: 'error',
      message: 'There should be no space before a comma. Commas immediately follow the preceding text with no intervening space.',
      suggestion: 'Remove the space before the comma.',
    });
  }

  // Space before period (but not ellipses ". . ." and not abbreviation patterns)
  const spaceBeforePeriod = /[A-Za-z0-9)\]"]\s+\./g;
  while ((match = spaceBeforePeriod.exec(text)) !== null) {
    // Check this is not part of an ellipsis (". . .")
    const afterPeriod = text.slice(match.index + match[0].length, match.index + match[0].length + 4);
    if (/^\s*\.\s*\./.test(afterPeriod)) {
      continue; // This is an ellipsis, skip
    }
    issues.push({
      id: uuid(),
      rule: 'R. 6.1',
      source: 'Bluebook',
      severity: 'error',
      message: 'There should be no space before a period. Periods immediately follow the preceding text or abbreviation.',
      suggestion: 'Remove the space before the period.',
    });
  }
}

/**
 * R. 6.2(c): The section symbol (§) should ideally be separated from
 * the following number by a non-breaking space to prevent line breaks
 * between the symbol and the number. This check detects a regular space
 * where a non-breaking space is recommended.
 *
 * Note: This is a suggestion-level check because many editors do not
 * distinguish between regular and non-breaking spaces, but the Bluebook
 * recommends keeping § and its number on the same line.
 */
function checkSectionNonBreakingSpace(text: string, issues: ValidationIssue[]): void {
  // Match § followed by a regular space (U+0020) and a digit
  // but NOT § followed by a non-breaking space (U+00A0)
  const regularSpacePattern = /§ (\d)/g;
  let match;
  while ((match = regularSpacePattern.exec(text)) !== null) {
    // The regex already matches only regular spaces (U+0020), not non-breaking spaces (U+00A0)
    issues.push({
      id: uuid(),
      rule: 'R. 6.2(c)',
      source: 'Bluebook',
      severity: 'suggestion',
      message: 'Per R. 6.2(c), the space between § and the section number should be a non-breaking space to prevent the symbol and number from being separated across lines. This ensures "§ 1983" stays together as a unit.',
      suggestion: 'Replace the regular space between § and the number with a non-breaking space (Unicode U+00A0).',
    });
  }
}

/**
 * R. 6.1(a): Volume number must be separated from reporter name by exactly
 * one space. Common errors include no space ("500F.3d") or multiple spaces.
 */
function checkVolumeReporterSpacing(text: string, issues: ValidationIssue[]): void {
  // Pattern: digits immediately followed by a reporter abbreviation (no space)
  // Common reporters: F., F.2d, F.3d, F. Supp., U.S., S. Ct., A.2d, etc.
  const noSpacePattern = /\b(\d+)(F\.|F\.2d|F\.3d|F\. Supp\.|U\.S\.|S\. Ct\.|A\.\d|P\.\d|N\.E\.|N\.W\.|S\.E\.|S\.W\.|So\.)/g;
  let match;
  while ((match = noSpacePattern.exec(text)) !== null) {
    const volume = match[1];
    const reporter = match[2];
    issues.push({
      id: uuid(),
      rule: 'R. 6.1(a)',
      source: 'Bluebook',
      severity: 'error',
      message: `Missing space between volume number "${volume}" and reporter "${reporter}". The volume number and reporter abbreviation must be separated by exactly one space (e.g., "500 U.S." not "500U.S.").`,
      suggestion: `Add a space: "${volume} ${reporter}".`,
    });
  }
}

/**
 * R. 6.1(a): Detect missing space after a period within abbreviations
 * where the period should be followed by a space before a multi-letter
 * abbreviation. This catches patterns like "Supp.2d" which should be
 * "Supp. 2d" — a multi-letter abbreviation followed by another element
 * without the required space.
 */
function checkMissingSpaceAfterPeriodInAbbreviation(text: string, issues: ValidationIssue[]): void {
  // Pattern: multi-letter abbreviation ending in period, followed immediately
  // by a digit or another multi-letter word (no space between).
  // But exclude: single-capital + ordinal (F.3d is correct) and
  // well-known closed abbreviations (S.D.N.Y.)
  const patterns = [
    // "Supp.2d" → "Supp. 2d"
    { regex: /\b(Supp|App|Dist|Bankr|Ct|Rev|Stat|Evid|Civ|Crim|Proc)\.([\da-z])/gi, label: 'abbreviation' },
    // "Rev.Code" → "Rev. Code" (multi-letter after multi-letter)
    { regex: /\b(Supp|App|Dist|Bankr|Ct|Rev|Stat|Code|Ann|Gen|Sess)\.([A-Z][a-z])/g, label: 'abbreviation' },
  ];

  for (const { regex, label } of patterns) {
    let match;
    while ((match = regex.exec(text)) !== null) {
      const abbr = match[1];
      const next = match[2];
      issues.push({
        id: uuid(),
        rule: 'R. 6.1(a)',
        source: 'Bluebook',
        severity: 'error',
        message: `Missing space after "${abbr}." before "${next}". Per R. 6.1(a), a space is required between a multi-letter ${label} ending in a period and the following element. Multi-letter abbreviations are NOT closed up like adjacent single capitals.`,
        suggestion: `Add a space: "${abbr}. ${next}" not "${abbr}.${next}".`,
      });
    }
  }
}
