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

  // If previous citation is a different Id. chain, that's fine too
  // But if previous is a short form of a different case, this Id. is ambiguous
  // For now, we trust the ordering

  // Capitalization check based on position context
  const rawText = citation.rawText;
  if (rawText.startsWith('id.') && !rawText.startsWith('Id.')) {
    // Lowercase "id." — check if it should be capitalized
    // (If it starts a citation sentence after a period, it should be "Id.")
    issues.push({
      id: uuid(),
      rule: 'R. 4.1',
      source: 'Context',
      severity: 'warning',
      message: '"Id." should be capitalized when it begins a citation sentence (after a period).',
      suggestion: 'Capitalize to "Id." if this starts a new citation sentence.',
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
