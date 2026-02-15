import { v4 as uuid } from 'uuid';
import type { ValidationIssue, ParsedCitation } from '@legalcitation/shared';

/**
 * Tracks hereinafter designations across the document.
 */
interface HereinafterDesignation {
  designation: string;
  citationId: string;
  sourceType: string;
}

/**
 * Context-aware citation validation.
 * Analyzes citations as a sequence to check Id. usage, short form proximity,
 * hereinafter consistency, and source-type-aware Id. validation.
 */
export function validateContext(citations: ParsedCitation[]): Map<string, ValidationIssue[]> {
  const issueMap = new Map<string, ValidationIssue[]>();
  const hereinafterMap = new Map<string, HereinafterDesignation>();

  // First pass: collect hereinafter designations
  for (const citation of citations) {
    const hereinafterMatch = citation.rawText.match(/\[hereinafter\s+([^\]]+)\]/i);
    if (hereinafterMatch) {
      hereinafterMap.set(hereinafterMatch[1].trim().toLowerCase(), {
        designation: hereinafterMatch[1].trim(),
        citationId: citation.id,
        sourceType: citation.type,
      });
    }
  }

  // Second pass: validate context
  for (let i = 0; i < citations.length; i++) {
    const citation = citations[i];
    const issues: ValidationIssue[] = [];

    if (citation.type === 'id') {
      validateIdContext(citations, i, issues);
    }

    if (citation.type === 'short_form') {
      validateShortFormContext(citations, i, issues);
    }

    // Validate hereinafter usage
    if (citation.type === 'supra' && citation.rawText.toLowerCase().includes('hereinafter')) {
      // This is a hereinafter definition — skip validation
    } else if (citation.rawText.match(/\bhereinafter\b/i) && !citation.rawText.includes('[hereinafter')) {
      // Using a hereinafter form — check it was properly established
      const components = citation.components as { partyName?: string };
      if (components.partyName) {
        const designation = hereinafterMap.get(components.partyName.toLowerCase());
        if (!designation) {
          issues.push({
            id: uuid(),
            rule: 'R. 4.2(b)',
            source: 'Context',
            severity: 'warning',
            message: `Hereinafter designation "${components.partyName}" was not established in a prior citation.`,
            suggestion: 'Add [hereinafter Designation] to the first full citation of this source.',
          });
        }
      }
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

  // Source-type-aware Id. validation: check that Id. pincite format matches source type
  if (prev.type === 'statute' || prev.type === 'regulation') {
    // Statute/regulation Id. should use "§" not "at" for pinpoints
    if (citation.rawText.match(/\bat\s+\d/)) {
      issues.push({
        id: uuid(),
        rule: 'R. 4.1',
        source: 'Context',
        severity: 'warning',
        message: 'When "Id." refers to a statute or regulation, use "Id. § [section]" rather than "Id. at [page]".',
        suggestion: 'Replace "Id. at [number]" with "Id. § [section]" for statute/regulation references.',
      });
    }
  } else if (prev.type === 'constitution') {
    // Constitution Id. should not have "at" page references
    if (citation.rawText.match(/\bat\s+\d/)) {
      issues.push({
        id: uuid(),
        rule: 'R. 4.1',
        source: 'Context',
        severity: 'warning',
        message: 'When "Id." refers to a constitutional provision, pinpoint to a specific section or clause, not a page.',
        suggestion: 'Use "Id. § [section]" or "Id. cl. [clause]" for constitutional references.',
      });
    }
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
