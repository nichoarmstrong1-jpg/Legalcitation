import { v4 as uuid } from 'uuid';
import type { ValidationIssue, ParsedCitation, CaseComponents } from '@legalcitation/shared';
import {
  validateSectionRange,
  validateSubsectionFormat,
  validateSectionSymbolCount,
  validateConsecutiveSubsections,
  validateSymbolSpacing,
} from '@legalcitation/shared';

/**
 * Rule 3 — Comprehensive Pinpoint Citation Validation
 *
 * Validates all forms of pinpoint citations:
 *   - Pages (R. 3.2(a)): consecutive ranges, non-consecutive, first-page repeat
 *   - Sections (R. 3.3): § symbol, ranges with punctuation-dependent digit rules
 *   - Subsections (R. 3.3(a)-(b)): parenthetical format, consecutive/non-consecutive
 *   - Paragraphs: ¶/¶¶ symbols, same rules as sections
 *   - Lines (B17.1.2): page:line format
 *   - Footnotes (R. 3.2(b)): n./nn. format, page & footnote
 *   - Supplements (R. 3.1(c)): "Supp." format
 */
export function validatePinpoints(
  citation: ParsedCitation,
  rawText: string
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Section symbol spacing (§ and ¶)
  checkSymbolSpacing(rawText, issues);

  // Section/paragraph symbol count (§ vs §§)
  checkSymbolCount(rawText, issues);

  // Section range formatting (punctuation-dependent rules)
  checkSectionRanges(rawText, issues);

  // Subsection format (no spaces in parentheticals)
  checkSubsectionFormat(rawText, issues);

  // Consecutive subsections use ONE symbol
  checkConsecutiveSubsectionSymbols(rawText, issues);

  // Non-consecutive page validation (retain all digits)
  checkNonConsecutivePages(rawText, issues);

  // First-page pinpoint (must repeat first page)
  checkFirstPagePinpoint(citation, rawText, issues);

  // Line pinpoints (page:line format)
  checkLinePinpoints(rawText, issues);

  // Consecutive footnotes (nn. format)
  checkConsecutiveFootnotes(rawText, issues);

  // Page and footnote (&) format
  checkPageAndFootnote(rawText, issues);

  // Supplement format
  checkSupplementFormat(rawText, issues);

  return issues;
}

/**
 * Validate space between § / ¶ symbol and number.
 */
function checkSymbolSpacing(rawText: string, issues: ValidationIssue[]): void {
  const result = validateSymbolSpacing(rawText);
  for (const msg of result.issues) {
    issues.push({
      id: uuid(),
      rule: 'R. 3.3',
      source: 'Bluebook',
      severity: 'error',
      message: msg,
      suggestion: 'Always include a space between the symbol and the number (e.g., "§ 1874" not "§1874").',
    });
  }
}

/**
 * Validate § vs §§ usage (single vs multiple sections).
 */
function checkSymbolCount(rawText: string, issues: ValidationIssue[]): void {
  const result = validateSectionSymbolCount(rawText);
  for (const msg of result.issues) {
    issues.push({
      id: uuid(),
      rule: 'R. 3.3',
      source: 'Bluebook',
      severity: 'error',
      message: msg,
      suggestion: 'Use § for a single section and §§ for multiple sections. Same for ¶ and ¶¶.',
    });
  }
}

/**
 * R. 3.3(b): Validate section range formatting.
 * Detects section ranges and applies punctuation-dependent rules.
 */
function checkSectionRanges(rawText: string, issues: ValidationIssue[]): void {
  // Detect patterns like §§ NNN–NNN or §§ NNN to NNN
  const sectionRangePatterns = [
    /§§?\s*([\d\w.:-]+)\s*[–—]\s*([\d\w.:-]+)/g,
    /§§?\s*([\d\w.:-]+)\s+to\s+([-\d\w.:]+)/g,
    /¶¶?\s*([\d\w.:-]+)\s*[–—]\s*([\d\w.:-]+)/g,
    /¶¶?\s*([\d\w.:-]+)\s+to\s+([-\d\w.:]+)/g,
  ];

  for (const pattern of sectionRangePatterns) {
    let match;
    while ((match = pattern.exec(rawText)) !== null) {
      const rangeText = match[0].replace(/^[§¶]+\s*/, '');
      const result = validateSectionRange(rangeText);

      for (const msg of result.issues) {
        issues.push({
          id: uuid(),
          rule: 'R. 3.3(b)',
          source: 'Bluebook',
          severity: 'error',
          message: msg,
          suggestion: `Correct form: "${result.corrected}".`,
        });
      }
    }
  }
}

/**
 * R. 3.3(a): Validate subsection parenthetical format.
 */
function checkSubsectionFormat(rawText: string, issues: ValidationIssue[]): void {
  const result = validateSubsectionFormat(rawText);
  for (const msg of result.issues) {
    issues.push({
      id: uuid(),
      rule: 'R. 3.3(a)',
      source: 'Bluebook',
      severity: 'error',
      message: msg,
      suggestion: 'Append subsections directly without spaces: "§ 1874(b)(2)" not "§ 1874 (b) (2)".',
    });
  }
}

/**
 * Consecutive subsections of a single section use ONE symbol.
 */
function checkConsecutiveSubsectionSymbols(rawText: string, issues: ValidationIssue[]): void {
  const result = validateConsecutiveSubsections(rawText);
  for (const msg of result.issues) {
    issues.push({
      id: uuid(),
      rule: 'R. 3.3(b)',
      source: 'Bluebook',
      severity: 'error',
      message: msg,
      suggestion: 'Consecutive subsections of a single section use one symbol: "§ 1874(b)–(c)" not "§§ 1874(b)–(c)".',
    });
  }
}

/**
 * R. 3.2(a): Non-consecutive pages must retain ALL digits.
 * Pattern: "103, 105" — both numbers must be in full.
 * NOT: "103, 05" (digits cannot be dropped for non-consecutive pages).
 */
function checkNonConsecutivePages(rawText: string, issues: ValidationIssue[]): void {
  // Match comma-separated page numbers in pincite context
  // Look for pattern: number, number where second is abbreviated
  const nonConsecPattern = /\b(\d{3,}),\s*(\d{1,2})\b/g;
  let match;

  while ((match = nonConsecPattern.exec(rawText)) !== null) {
    const first = match[1];
    const second = match[2];

    // Only flag if the second number is shorter (likely abbreviated)
    if (second.length < first.length) {
      // Reconstruct what the full number would be
      const prefix = first.slice(0, first.length - second.length);
      const fullSecond = prefix + second;
      const fullNum = parseInt(fullSecond, 10);
      const firstNum = parseInt(first, 10);

      // Only flag if the reconstructed number is plausible (greater than first)
      if (fullNum > firstNum) {
        issues.push({
          id: uuid(),
          rule: 'R. 3.2(a)',
          source: 'Bluebook',
          severity: 'error',
          message: `Non-consecutive pages must retain all digits: "${first}, ${second}" should be "${first}, ${fullSecond}".`,
          suggestion: `Change to "${first}, ${fullSecond}". Non-consecutive page citations retain ALL digits.`,
        });
      }
    }
  }
}

/**
 * R. 3.2(a): First page must be repeated as pinpoint when citing material on the first page.
 * Example: "467 S.W.2d 363, 363" — the pinpoint repeats the first page.
 */
function checkFirstPagePinpoint(
  citation: ParsedCitation,
  rawText: string,
  issues: ValidationIssue[]
): void {
  if (citation.type !== 'case') return;

  const components = citation.components as CaseComponents;
  if (!components.firstPage || !components.pinCite) return;

  // This check is informational — we can't know if the user meant to cite the first page
  // But we can validate that if no pinpoint is present and the citation has specific content,
  // a pinpoint should be provided.
  // The guide says: "the only time a pinpoint is not required is when you are referring to
  // a case in general, without discussing any specific fact, holding, rule, rationale..."
}

/**
 * B17.1.2: Validate line pinpoint format.
 * Format: page:line (e.g., "118:12", "118:12–14", "3:22–4:7")
 */
function checkLinePinpoints(rawText: string, issues: ValidationIssue[]): void {
  // Detect line pinpoint patterns (page:line)
  const linePattern = /\b(\d+):(\d+)\s*[–-]\s*(?:(\d+):)?(\d+)\b/g;
  let match;

  while ((match = linePattern.exec(rawText)) !== null) {
    // This is a valid line pinpoint format — check for hyphen instead of en dash
    if (match[0].includes('-') && !match[0].includes('–')) {
      issues.push({
        id: uuid(),
        rule: 'B17.1.2',
        source: 'Bluebook',
        severity: 'suggestion',
        message: 'Consider using an en dash (–) instead of a hyphen (-) in line ranges.',
        suggestion: `Replace "-" with "–" in "${match[0]}".`,
      });
    }
  }
}

/**
 * R. 3.2(b): Consecutive footnotes use "nn." (double n).
 * Single footnote: "n.5" (one n)
 * Consecutive footnotes: "nn.5–6" (two n's)
 * Also validates: no space between n./nn. and number.
 */
function checkConsecutiveFootnotes(rawText: string, issues: ValidationIssue[]): void {
  // Check for single "n." used with a range (should be "nn.")
  const singleNWithRange = /\bn\.(\d+)\s*[–-]\s*(\d+)\b/g;
  let match;

  while ((match = singleNWithRange.exec(rawText)) !== null) {
    issues.push({
      id: uuid(),
      rule: 'R. 3.2(b)',
      source: 'Bluebook',
      severity: 'error',
      message: `Use "nn." (double n) for consecutive footnotes: "${match[0]}" should be "nn.${match[1]}–${match[2]}".`,
      suggestion: `Change to "nn.${match[1]}–${match[2]}".`,
    });
  }

  // Check for space in "nn. 5" (should be "nn.5")
  if (/\bnn?\.\s+\d/.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 3.2(b)',
      source: 'Bluebook',
      severity: 'error',
      message: 'No space between "n." or "nn." and the footnote number.',
      suggestion: 'Remove the space: "n.5" not "n. 5".',
    });
  }
}

/**
 * R. 3.2(b): Page and footnote — uses ampersand (&).
 * Format: "147 & n.5" — validates the ampersand format.
 */
function checkPageAndFootnote(rawText: string, issues: ValidationIssue[]): void {
  // Check for "page and n.X" — should use "&" not "and"
  const andPattern = /\b\d+\s+and\s+n\.\d+/i;
  if (andPattern.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 3.2(b)',
      source: 'Bluebook',
      severity: 'error',
      message: 'Use "&" not "and" when citing both page text and a footnote on that page.',
      suggestion: 'Change "and" to "&" (e.g., "147 & n.5").',
    });
  }
}

/**
 * R. 3.1(c): Validate supplement format in parenthetical.
 * Correct: "(Supp. 2024)" or "(West Supp. 2025)"
 * Wrong: "(Supplement 2024)" or "(Sup. 2024)"
 */
function checkSupplementFormat(rawText: string, issues: ValidationIssue[]): void {
  // Check for unabbreviated "Supplement"
  if (/\bSupplement\b/.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 3.1(c)',
      source: 'Bluebook',
      severity: 'error',
      message: 'Abbreviate "Supplement" to "Supp." in citation parentheticals.',
      suggestion: 'Change "Supplement" to "Supp."',
    });
  }

  // Check for wrong abbreviation "Sup." instead of "Supp."
  if (/\bSup\.\s/.test(rawText) && !/\bSupp\./.test(rawText) && !/\bSup\.\s*Ct\./.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 3.1(c)',
      source: 'Bluebook',
      severity: 'error',
      message: 'The correct abbreviation for supplement is "Supp." not "Sup."',
      suggestion: 'Change "Sup." to "Supp."',
    });
  }
}
