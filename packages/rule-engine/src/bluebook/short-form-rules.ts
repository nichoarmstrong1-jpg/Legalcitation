import { v4 as uuid } from 'uuid';
import type { ValidationIssue, ShortFormComponents } from '@legalcitation/shared';

/**
 * Validate short form citations per B4 / Rule 4.
 *
 * B4 specifics:
 *   - "Id." may only be used when the immediately preceding citation
 *     contains only ONE authority.
 *   - Always indicate a different page with "at [page]".
 *   - "Supra" and "hereinafter" may NOT be used for: cases, statutes,
 *     constitutions, legislative materials/debates (except hearings),
 *     restatements, model codes, or regulations.
 *   - "Supra" and "hereinafter" MAY be used for: legislative hearings,
 *     court filings, books, pamphlets, reports, unpublished materials,
 *     non-print resources, periodicals, services, treaties, regulations of
 *     intergovernmental organizations, and internal cross-references.
 */
export function validateShortForm(
  components: ShortFormComponents,
  rawText: string
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  switch (components.type) {
    case 'id':
      validateId(rawText, components, issues);
      break;
    case 'supra':
      validateSupra(rawText, components, issues);
      break;
    case 'short_case':
      validateShortCase(rawText, components, issues);
      break;
  }

  return issues;
}

function validateId(
  rawText: string,
  components: ShortFormComponents,
  issues: ValidationIssue[]
): void {
  // Id. should be italicized (we check for the marker)
  // Note: actual italics checking happens at the rendering level

  // Check for "id" without period
  if (/\bid\b(?!\.)/.test(rawText) && !/\bId\.\b/.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 4.1',
      source: 'Bluebook',
      severity: 'error',
      message: '"Id" must include a period: "Id."',
      suggestion: 'Change to "Id."',
    });
  }

  // Check for missing "at" before page number (but NOT before § or ¶)
  const missingAtPattern = /\bId\.\s+(\d)/;
  if (missingAtPattern.test(rawText) && !/\bId\.\s+at\s+/.test(rawText) && !/\bId\.\s+[§¶]/.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 4.1',
      source: 'Bluebook',
      severity: 'error',
      message: 'When citing a different page with "Id.", include "at" before the page number.',
      suggestion: 'Change "Id. [page]" to "Id. at [page]".',
    });
  }

  // R. 4.1: "Id. at §" is WRONG — do not use "at" before section symbol
  if (/\bId\.\s+at\s+[§¶]/.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 4.1',
      source: 'Bluebook',
      severity: 'error',
      message: 'Do not use "at" before a section (§) or paragraph (¶) symbol. Use "Id. § [number]" not "Id. at § [number]".',
      suggestion: 'Remove "at" before the § or ¶ symbol.',
    });
  }

  // R. 4.1: Id. with section symbol must include full section number
  // "Id. § (f)" is WRONG — must include section number: "Id. § 166(f)"
  if (/\bId\.\s+[§¶]\s*\([a-zA-Z0-9]+\)/.test(rawText) && !/\bId\.\s+[§¶]\s*\d/.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 4.1',
      source: 'Bluebook',
      severity: 'error',
      message: 'Include the full section number with "Id." — not just the subsection. Use "Id. § 166(f)" not "Id. § (f)".',
      suggestion: 'Include the section number before the subsection letter.',
    });
  }

  // R. 4.1: Double period — "Id.." is WRONG
  if (/\bId\.\.\s/.test(rawText) || /\bId\.\.$/.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 4.1',
      source: 'Bluebook',
      severity: 'error',
      message: '"Id." already ends with a period. Do not add a second period at the end of a citation sentence.',
      suggestion: 'Remove the extra period: "Id." not "Id.."',
    });
  }

  // Check for "Ibid." (not used in Bluebook)
  if (/\bibid\.?\b/i.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 4.1',
      source: 'Bluebook',
      severity: 'error',
      message: 'Do not use "Ibid." in Bluebook citations. Use "Id." instead.',
      suggestion: 'Replace "Ibid." with "Id."',
    });
  }

  // R. 4.1: "ID." (all caps) is wrong
  if (/\bID\./.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 4.1',
      source: 'Bluebook',
      severity: 'error',
      message: '"ID." (all capitals) is incorrect. Use "Id." with only the first letter capitalized.',
      suggestion: 'Change "ID." to "Id."',
    });
  }
}

function validateSupra(
  rawText: string,
  components: ShortFormComponents,
  issues: ValidationIssue[]
): void {
  // B4 / R. 4.2: Supra NEVER used for cases, statutes, constitutions,
  // court rules, regulations, restatements, model codes, or legislative materials (except hearings).
  // Detect if the antecedent might be a prohibited source.
  const prohibitedPatterns = [
    { pattern: /\bv\.\s/, label: 'case' },
    { pattern: /\b(?:U\.S\.C\.|Stat\.|Code|Rev\.)\b/, label: 'statute' },
    { pattern: /\bConst\.\b/, label: 'constitution' },
    { pattern: /\bC\.F\.R\.\b/, label: 'regulation' },
    { pattern: /\bFed\.\s+R\.\b/, label: 'procedural rule' },
  ];

  let isProhibited = false;
  for (const { pattern, label } of prohibitedPatterns) {
    if (pattern.test(rawText)) {
      issues.push({
        id: uuid(),
        rule: 'R. 4.2',
        source: 'Bluebook',
        severity: 'error',
        message: `"Supra" cannot be used for ${label} citations. Use "Id." or a specific short form instead.`,
        suggestion: `Replace with the appropriate short form for ${label} citations.`,
      });
      isProhibited = true;
      break;
    }
  }

  if (!isProhibited) {
    // Generic reminder for supra — suggest verification
    issues.push({
      id: uuid(),
      rule: 'R. 4.2',
      source: 'Bluebook',
      severity: 'suggestion',
      message: '"Supra" may only be used for secondary sources (books, articles, pamphlets, reports, hearings, periodicals, treaties, unpublished materials). It is NEVER used for cases, statutes, constitutions, court rules, or regulations.',
      suggestion: 'Verify this supra reference is to an eligible secondary source.',
    });
  }

  // Check format: Author, supra, at Y or Author, supra note X, at Y
  if (components.partyName) {
    const hasNote = /\bsupra\s+note\s+\d+/.test(rawText);
    const hasCommaAfterSupra = /\bsupra\s*,/.test(rawText);
    const hasAt = /\bat\s+\d/.test(rawText);

    // In practitioners' documents (no footnotes), format is: Author, supra, at [page]
    // In academic documents (with footnotes), format is: Author, supra note [X], at [page]
    if (!hasNote && !hasCommaAfterSupra && !hasAt) {
      issues.push({
        id: uuid(),
        rule: 'R. 4.2',
        source: 'Bluebook',
        severity: 'warning',
        message: 'Supra short form should include a pinpoint. Format: "[Author], supra, at [page]" or "[Author], supra note [X], at [page]".',
        suggestion: 'Add "at [page]" to the supra citation.',
      });
    }
  }
}

function validateShortCase(
  rawText: string,
  components: ShortFormComponents,
  issues: ValidationIssue[]
): void {
  // Short case form: Party, Vol Rep at Page
  // Must include "at" before the page
  if (!/\bat\s+\d/.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 10.9',
      source: 'Bluebook',
      severity: 'error',
      message: 'Short form case citations must include "at" before the pincite.',
      suggestion: 'Include "at" before the page number.',
    });
  }
}
