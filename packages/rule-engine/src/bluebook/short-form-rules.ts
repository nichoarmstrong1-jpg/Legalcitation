import { v4 as uuid } from 'uuid';
import type { ValidationIssue, ShortFormComponents } from '@legalcitation/shared';

/**
 * Validate short form citations per Rule 4.
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

  // Check for missing "at" before page number
  const missingAtPattern = /\bId\.\s+(\d)/;
  if (missingAtPattern.test(rawText) && !/\bId\.\s+at\s+/.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 4.1',
      source: 'Bluebook',
      severity: 'error',
      message: 'When citing a different page with "Id.", include "at" before the page number.',
      suggestion: 'Change "Id. [page]" to "Id. at [page]".',
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
}

function validateSupra(
  rawText: string,
  components: ShortFormComponents,
  issues: ValidationIssue[]
): void {
  // Supra should not be used for cases or statutes
  // (This is a context-dependent check — we flag it as a warning)
  issues.push({
    id: uuid(),
    rule: 'R. 4.2',
    source: 'Bluebook',
    severity: 'suggestion',
    message: '"Supra" should only be used for secondary sources (books, articles, etc.), not for cases or statutes.',
    suggestion: 'Verify that this supra reference is to a secondary source, not a case or statute.',
  });

  // Check format: Author, supra note X, at Y
  if (components.partyName && !/\bsupra\s+note\s+\d+/.test(rawText) && !/\bsupra\s*,/.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 4.2',
      source: 'Bluebook',
      severity: 'warning',
      message: 'Supra references should include "note" followed by the footnote number.',
      suggestion: 'Format as "[Author], supra note [X], at [page]".',
    });
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
