import { v4 as uuid } from 'uuid';
import type { ValidationIssue, ParsedCitation } from '@legalcitation/shared';

/**
 * Context-aware citation validation.
 * Analyzes citations as a sequence to check Id. usage, short form proximity, etc.
 */
export function validateContext(citations: ParsedCitation[]): Map<string, ValidationIssue[]> {
  const issueMap = new Map<string, ValidationIssue[]>();

  for (let i = 0; i < citations.length; i++) {
    const citation = citations[i];
    const issues: ValidationIssue[] = [];

    if (citation.type === 'id') {
      validateIdContext(citations, i, issues);
    }

    if (citation.type === 'short_form') {
      validateShortFormContext(citations, i, issues);
    }

    if (issues.length > 0) {
      issueMap.set(citation.id, issues);
    }
  }

  return issueMap;
}

/**
 * Validate Id. in context:
 * - Must have a preceding citation (not be the first)
 * - The immediately preceding citation must be from the same source
 * - Capitalization: "Id." after a period, "id." after a semicolon
 */
function validateIdContext(
  citations: ParsedCitation[],
  index: number,
  issues: ValidationIssue[]
): void {
  const citation = citations[index];

  // Orphaned Id. — can't be the first citation
  if (index === 0) {
    issues.push({
      id: uuid(),
      rule: 'R. 4.1',
      source: 'Context',
      severity: 'error',
      message: '"Id." cannot be the first citation in the text — it must refer to an immediately preceding source.',
      suggestion: 'Provide a full citation before using "Id."',
    });
    return;
  }

  // Check that the immediately preceding citation is a valid antecedent
  const prev = citations[index - 1];
  if (prev.type === 'id') {
    // Consecutive Id. is fine — both refer to the same original source
    return;
  }

  // R. 4.1 / B4: Id. may only be used when the immediately preceding citation
  // contains only ONE authority. If the preceding citation sentence has semicolons,
  // it contains multiple authorities and Id. is ambiguous.
  if (prev.rawText.includes(';')) {
    issues.push({
      id: uuid(),
      rule: 'R. 4.1',
      source: 'Context',
      severity: 'error',
      message: '"Id." may only be used when the immediately preceding citation contains a single authority. The preceding citation contained multiple authorities separated by semicolons.',
      suggestion: 'Use a full short form citation (e.g., party name + reporter + "at" + page) instead of "Id." when the preceding citation sentence contains multiple authorities.',
    });
  }

  // R. 4.1: Id. cannot be used in embedded citations
  if (citation.context === 'textual_sentence') {
    issues.push({
      id: uuid(),
      rule: 'R. 4.1',
      source: 'Context',
      severity: 'error',
      message: '"Id." cannot be used in embedded citations — only in citation sentences and citation clauses.',
      suggestion: 'Use a full short form citation or an alternate short form instead.',
    });
  }

  // Capitalization check based on position context
  const rawText = citation.rawText;
  if (rawText.startsWith('id.') && !rawText.startsWith('Id.')) {
    // Lowercase "id." at start of citation sentence — should be capitalized
    if (citation.context === 'citation_sentence') {
      issues.push({
        id: uuid(),
        rule: 'R. 4.1',
        source: 'Context',
        severity: 'error',
        message: '"Id." must be capitalized when it begins a citation sentence (after a period).',
        suggestion: 'Capitalize to "Id."',
      });
    }
  }

  // Check: uppercase Id. used in a citation clause (after semicolon) should be lowercase
  if (rawText.startsWith('Id.') && citation.context === 'citation_clause') {
    issues.push({
      id: uuid(),
      rule: 'R. 4.1',
      source: 'Context',
      severity: 'warning',
      message: 'Use lowercase "id." in citation clauses (after a semicolon or comma).',
      suggestion: 'Change "Id." to "id." in this citation clause.',
    });
  }
}

/**
 * Validate short form case citations in context:
 * - Must have a full citation within the preceding ~5 citations
 */
function validateShortFormContext(
  citations: ParsedCitation[],
  index: number,
  issues: ValidationIssue[]
): void {
  const citation = citations[index];
  const components = citation.components as { type: string; partyName?: string };

  if (components.type !== 'short_case' || !components.partyName) return;

  // Look backward for a full case citation with a matching party name
  const lookback = Math.max(0, index - 5);
  let foundAntecedent = false;

  for (let i = index - 1; i >= lookback; i--) {
    const prev = citations[i];
    if (prev.type === 'case') {
      const caseComponents = prev.components as { partyOne?: string; partyTwo?: string };
      const matchesParty =
        (caseComponents.partyOne && caseComponents.partyOne.includes(components.partyName)) ||
        (caseComponents.partyTwo && caseComponents.partyTwo.includes(components.partyName));
      if (matchesParty) {
        foundAntecedent = true;
        break;
      }
    }
  }

  if (!foundAntecedent) {
    issues.push({
      id: uuid(),
      rule: 'R. 10.9',
      source: 'Context',
      severity: 'warning',
      message: `Short form "${components.partyName}" does not have a full citation within the preceding 5 citations.`,
      suggestion: 'Provide a full citation before using a short form, or the full citation may be too far back.',
    });
  }
}
