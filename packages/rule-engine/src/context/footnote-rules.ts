import { v4 as uuid } from 'uuid';
import type {
  ParsedCitation,
  ValidationIssue,
  DocumentCitationMap,
  ShortFormComponents,
  CaseComponents,
  ArticleComponents,
  BookComponents,
} from '@legalcitation/shared';
import { matchesSource } from './source-matching.js';

/**
 * Footnote-aware context validation.
 * Extends the flat validateContext with footnote boundary awareness.
 */
export function validateFootnoteContext(
  docMap: DocumentCitationMap
): Map<string, ValidationIssue[]> {
  const issueMap = new Map<string, ValidationIssue[]>();

  validateIdAcrossFootnotes(docMap, issueMap);
  validateSupraNoteReferences(docMap, issueMap);
  validateInfraNoteReferences(docMap, issueMap);
  validateFirstCitationRequirement(docMap, issueMap);

  return issueMap;
}

function addIssue(
  issueMap: Map<string, ValidationIssue[]>,
  citationId: string,
  issue: Omit<ValidationIssue, 'id' | 'source'>
): void {
  const existing = issueMap.get(citationId) || [];
  existing.push({ id: uuid(), source: 'Context', ...issue });
  issueMap.set(citationId, existing);
}

/**
 * Count distinct non-Id authorities in a list of citations.
 * Collapses Id. chains — only counts unique source citations.
 */
function countDistinctAuthorities(citations: ParsedCitation[]): number {
  let count = 0;
  for (const c of citations) {
    if (c.type !== 'id') {
      count++;
    }
  }
  return count;
}

/**
 * Get the last non-Id citation in a list (the actual source an Id. chain refers to).
 */
function getLastNonIdCitation(citations: ParsedCitation[]): ParsedCitation | null {
  for (let i = citations.length - 1; i >= 0; i--) {
    if (citations[i].type !== 'id') {
      return citations[i];
    }
  }
  return null;
}

/**
 * Id. at the start of a footnote refers to the last citation in the
 * immediately preceding footnote, but ONLY if that preceding footnote
 * contained exactly one authority.
 */
function validateIdAcrossFootnotes(
  docMap: DocumentCitationMap,
  issueMap: Map<string, ValidationIssue[]>
): void {
  const footnoteNumbers = Array.from(docMap.footnotes.keys()).sort((a, b) => a - b);

  for (let i = 0; i < footnoteNumbers.length; i++) {
    const fnNum = footnoteNumbers[i];
    const citations = docMap.footnotes.get(fnNum);
    if (!citations || citations.length === 0) continue;

    const first = citations[0];
    if (first.type !== 'id') continue;

    // Id. is the first citation in this footnote
    if (i === 0) {
      addIssue(issueMap, first.id, {
        rule: 'R. 4.1',
        severity: 'error',
        message: `"Id." cannot be the first citation in footnote ${fnNum} — there is no preceding footnote to refer to.`,
        suggestion: 'Provide a full citation.',
      });
      continue;
    }

    const prevFnNum = footnoteNumbers[i - 1];
    const prevCitations = docMap.footnotes.get(prevFnNum);
    if (!prevCitations || prevCitations.length === 0) {
      addIssue(issueMap, first.id, {
        rule: 'R. 4.1',
        severity: 'error',
        message: `"Id." at the beginning of footnote ${fnNum} has no preceding citation — footnote ${prevFnNum} is empty.`,
        suggestion: 'Provide a full citation.',
      });
      continue;
    }

    const distinctCount = countDistinctAuthorities(prevCitations);

    if (distinctCount > 1) {
      addIssue(issueMap, first.id, {
        rule: 'R. 4.1',
        severity: 'error',
        message: `"Id." at the beginning of footnote ${fnNum} is ambiguous — footnote ${prevFnNum} contained ${distinctCount} authorities.`,
        suggestion: 'Use a full citation or short form to identify the specific source.',
      });
    } else if (distinctCount === 1) {
      const antecedent = getLastNonIdCitation(prevCitations);
      if (antecedent) {
        addIssue(issueMap, first.id, {
          rule: 'R. 4.1',
          severity: 'suggestion',
          message: `Id. in footnote ${fnNum} refers to the sole authority in footnote ${prevFnNum}: ${antecedent.rawText.slice(0, 80)}${antecedent.rawText.length > 80 ? '...' : ''}`,
          suggestion: 'Correct usage of Id. across footnote boundaries.',
        });
      }
    }
  }
}

/**
 * Validate that "supra note X" references a footnote X that exists
 * and contains a full citation to the referenced source.
 */
function validateSupraNoteReferences(
  docMap: DocumentCitationMap,
  issueMap: Map<string, ValidationIssue[]>
): void {
  for (const [fnNum, citations] of docMap.footnotes) {
    for (const citation of citations) {
      if (citation.type !== 'supra') continue;
      const components = citation.components as ShortFormComponents;
      if (components.supraNoteNumber === undefined) continue;

      const noteNum = components.supraNoteNumber;

      // Supra must reference a footnote that comes before
      if (noteNum >= fnNum) {
        addIssue(issueMap, citation.id, {
          rule: 'R. 4.2',
          severity: 'error',
          message: `"Supra note ${noteNum}" in footnote ${fnNum} references a footnote that comes at or after it. "Supra" must refer backward.`,
          suggestion: 'Use "infra" for forward references, or correct the footnote number.',
        });
        continue;
      }

      const referencedFn = docMap.footnotes.get(noteNum);
      if (!referencedFn) {
        addIssue(issueMap, citation.id, {
          rule: 'R. 4.2',
          severity: 'error',
          message: `"Supra note ${noteNum}" references footnote ${noteNum}, which does not exist.`,
          suggestion: 'Verify the footnote number is correct.',
        });
        continue;
      }

      // Check that the referenced footnote contains a matching source
      if (components.partyName) {
        const hasMatch = referencedFn.some(c => matchesSource(c, components.partyName!));
        if (!hasMatch) {
          addIssue(issueMap, citation.id, {
            rule: 'R. 4.2',
            severity: 'warning',
            message: `"${components.partyName}, supra note ${noteNum}" — footnote ${noteNum} does not appear to contain a citation to "${components.partyName}".`,
            suggestion: 'Verify the footnote number and source name.',
          });
        }
      }
    }
  }
}

/**
 * Validate that "infra note X" references a footnote X that comes AFTER
 * the current footnote and actually exists.
 */
function validateInfraNoteReferences(
  docMap: DocumentCitationMap,
  issueMap: Map<string, ValidationIssue[]>
): void {
  for (const [fnNum, citations] of docMap.footnotes) {
    for (const citation of citations) {
      if (citation.type !== 'infra') continue;
      const components = citation.components as ShortFormComponents;
      if (components.infraNoteNumber === undefined) continue;

      const noteNum = components.infraNoteNumber;

      if (noteNum <= fnNum) {
        addIssue(issueMap, citation.id, {
          rule: 'R. 3.5',
          severity: 'error',
          message: `"Infra note ${noteNum}" in footnote ${fnNum} references a footnote that precedes it. "Infra" must refer forward.`,
          suggestion: 'Use "supra" for backward references, or correct the footnote number.',
        });
        continue;
      }

      if (!docMap.footnotes.has(noteNum)) {
        addIssue(issueMap, citation.id, {
          rule: 'R. 3.5',
          severity: 'error',
          message: `"Infra note ${noteNum}" references footnote ${noteNum}, which does not exist in the document.`,
          suggestion: 'Verify the footnote number is correct.',
        });
      }
    }
  }
}

/**
 * Validate that the first time a source appears in the document,
 * it is a full citation (not Id., supra, or short form).
 */
function validateFirstCitationRequirement(
  docMap: DocumentCitationMap,
  issueMap: Map<string, ValidationIssue[]>
): void {
  const seenSources = new Set<string>();

  for (const citation of docMap.allCitations) {
    // Skip short-form types for tracking — they reference something
    if (citation.type === 'id' || citation.type === 'infra') continue;

    if (citation.type === 'supra') {
      const comp = citation.components as ShortFormComponents;
      const key = comp.partyName?.toLowerCase();
      if (key && !seenSources.has(key)) {
        addIssue(issueMap, citation.id, {
          rule: 'R. 4.2',
          severity: 'error',
          message: `"${comp.partyName}, supra" appears before any full citation of "${comp.partyName}" in the document.`,
          suggestion: 'Provide a full citation before using the supra short form.',
        });
      }
      continue;
    }

    if (citation.type === 'short_form') {
      const comp = citation.components as ShortFormComponents;
      const key = comp.partyName?.toLowerCase();
      if (key && !seenSources.has(key)) {
        addIssue(issueMap, citation.id, {
          rule: 'R. 10.9',
          severity: 'error',
          message: `Short form "${comp.partyName}" appears before any full citation in the document.`,
          suggestion: 'Provide a full citation before using a short form.',
        });
      }
      continue;
    }

    // Full citation types — register the source
    if (citation.type === 'case') {
      const comp = citation.components as CaseComponents;
      if (comp.partyOne) seenSources.add(comp.partyOne.toLowerCase());
      if (comp.partyTwo) seenSources.add(comp.partyTwo.toLowerCase());
    } else if (citation.type === 'article') {
      const comp = citation.components as ArticleComponents;
      for (const author of comp.authors) {
        seenSources.add(author.toLowerCase());
      }
    } else if (citation.type === 'book') {
      const comp = citation.components as BookComponents;
      for (const author of comp.authors) {
        seenSources.add(author.toLowerCase());
      }
    }
  }
}
