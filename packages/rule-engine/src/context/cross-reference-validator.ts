import type {
  DocumentCitationMap,
  CrossReferenceIssue,
  DocumentIntegrityReport,
  ShortFormComponents,
} from '@legalcitation/shared';
import { matchesSource } from './source-matching.js';

interface HereinafterTracking {
  established: boolean;
  usedCount: number;
  citationId: string;
  footnoteNumber?: number;
}

/**
 * Walk every citation in document order and validate all cross-references.
 * Produces a DocumentIntegrityReport.
 */
export function validateCrossReferences(
  docMap: DocumentCitationMap
): DocumentIntegrityReport {
  const crossReferenceIssues: CrossReferenceIssue[] = [];
  const hereinafterMap = new Map<string, HereinafterTracking>();

  // Pass 1: Collect all hereinafter establishments
  collectHereinafterEstablishments(docMap, hereinafterMap);

  // Pass 2: Walk Id. chains and validate
  walkIdChains(docMap, crossReferenceIssues);

  // Pass 3: Check supra/infra references
  walkSupraInfraReferences(docMap, crossReferenceIssues);

  // Pass 4: Check hereinafter usage
  checkHereinafterUsage(docMap, hereinafterMap, crossReferenceIssues);

  return {
    totalCitations: docMap.allCitations.length,
    totalFootnotes: docMap.footnoteCount,
    crossReferenceIssues,
    citationOrderIssues: [],
  };
}

/**
 * Scan all citations for [hereinafter X] establishments.
 */
function collectHereinafterEstablishments(
  docMap: DocumentCitationMap,
  hereinafterMap: Map<string, HereinafterTracking>
): void {
  for (const citation of docMap.allCitations) {
    const match = citation.rawText.match(/\[hereinafter\s+([^\]]+)\]/i);
    if (match) {
      const designation = match[1].trim().toLowerCase();
      hereinafterMap.set(designation, {
        established: true,
        usedCount: 0,
        citationId: citation.id,
        footnoteNumber: citation.footnoteContext?.footnoteNumber,
      });
    }
  }
}

/**
 * Walk all citations in document order, tracking Id. chains.
 * Detect broken chains where Id. has no valid antecedent.
 */
function walkIdChains(
  docMap: DocumentCitationMap,
  issues: CrossReferenceIssue[]
): void {
  const footnoteNumbers = Array.from(docMap.footnotes.keys()).sort((a, b) => a - b);

  for (let fi = 0; fi < footnoteNumbers.length; fi++) {
    const fnNum = footnoteNumbers[fi];
    const citations = docMap.footnotes.get(fnNum);
    if (!citations) continue;

    for (let ci = 0; ci < citations.length; ci++) {
      const citation = citations[ci];
      if (citation.type !== 'id') continue;

      // Id. within a footnote (not first citation)
      if (ci > 0) {
        // Valid — refers to previous citation in same footnote
        continue;
      }

      // Id. is the first citation in this footnote
      if (fi === 0) {
        issues.push({
          type: 'broken_id_chain',
          citationId: citation.id,
          footnoteNumber: fnNum,
          message: `"Id." in footnote ${fnNum} has no preceding footnote to refer to.`,
          suggestion: 'Replace with a full citation.',
          severity: 'error',
        });
        continue;
      }

      // Check the preceding footnote
      const prevFnNum = footnoteNumbers[fi - 1];
      const prevCitations = docMap.footnotes.get(prevFnNum);
      if (!prevCitations || prevCitations.length === 0) {
        issues.push({
          type: 'broken_id_chain',
          citationId: citation.id,
          footnoteNumber: fnNum,
          message: `"Id." in footnote ${fnNum} refers to footnote ${prevFnNum}, which contains no citations.`,
          suggestion: 'Replace with a full citation.',
          severity: 'error',
          referencedFootnote: prevFnNum,
        });
        continue;
      }

      // Count distinct authorities in previous footnote
      let distinctCount = 0;
      for (const c of prevCitations) {
        if (c.type !== 'id') distinctCount++;
      }

      if (distinctCount > 1) {
        issues.push({
          type: 'cross_footnote_id_ambiguous',
          citationId: citation.id,
          footnoteNumber: fnNum,
          message: `"Id." at the start of footnote ${fnNum} is ambiguous — footnote ${prevFnNum} cited ${distinctCount} different authorities.`,
          suggestion: 'Use a full citation or short form to identify the specific source.',
          severity: 'error',
          referencedFootnote: prevFnNum,
        });
      }
    }
  }
}

/**
 * Walk all supra and infra references and check they point to valid footnotes.
 */
function walkSupraInfraReferences(
  docMap: DocumentCitationMap,
  issues: CrossReferenceIssue[]
): void {
  for (const [fnNum, citations] of docMap.footnotes) {
    for (const citation of citations) {
      if (citation.type === 'supra') {
        const comp = citation.components as ShortFormComponents;
        if (comp.supraNoteNumber === undefined) continue;

        if (!docMap.footnotes.has(comp.supraNoteNumber)) {
          issues.push({
            type: 'orphaned_supra',
            citationId: citation.id,
            footnoteNumber: fnNum,
            message: `"Supra note ${comp.supraNoteNumber}" in footnote ${fnNum} references a non-existent footnote.`,
            suggestion: `The document has ${docMap.footnoteCount} footnotes. Verify the note number.`,
            severity: 'error',
            referencedFootnote: comp.supraNoteNumber,
          });
        } else if (comp.supraNoteNumber >= fnNum) {
          issues.push({
            type: 'orphaned_supra',
            citationId: citation.id,
            footnoteNumber: fnNum,
            message: `"Supra note ${comp.supraNoteNumber}" in footnote ${fnNum} references a later footnote. Supra must refer backward.`,
            suggestion: 'Use "infra" for forward references.',
            severity: 'error',
            referencedFootnote: comp.supraNoteNumber,
          });
        } else {
          // Valid reference — check content match
          const referencedCitations = docMap.footnotes.get(comp.supraNoteNumber);
          if (referencedCitations && comp.partyName) {
            const hasMatch = referencedCitations.some(c => matchesSource(c, comp.partyName!));
            if (!hasMatch) {
              issues.push({
                type: 'orphaned_supra',
                citationId: citation.id,
                footnoteNumber: fnNum,
                message: `"${comp.partyName}, supra note ${comp.supraNoteNumber}" — footnote ${comp.supraNoteNumber} does not contain a citation to "${comp.partyName}".`,
                suggestion: 'The supra reference may point to the wrong footnote, or the source name may not match.',
                severity: 'warning',
                referencedFootnote: comp.supraNoteNumber,
              });
            }
          }
        }
      }

      if (citation.type === 'infra') {
        const comp = citation.components as ShortFormComponents;
        if (comp.infraNoteNumber === undefined) continue;

        if (!docMap.footnotes.has(comp.infraNoteNumber)) {
          issues.push({
            type: 'orphaned_infra',
            citationId: citation.id,
            footnoteNumber: fnNum,
            message: `"Infra note ${comp.infraNoteNumber}" in footnote ${fnNum} references a non-existent footnote.`,
            suggestion: `The document has ${docMap.footnoteCount} footnotes. Verify the note number.`,
            severity: 'error',
            referencedFootnote: comp.infraNoteNumber,
          });
        } else if (comp.infraNoteNumber <= fnNum) {
          issues.push({
            type: 'orphaned_infra',
            citationId: citation.id,
            footnoteNumber: fnNum,
            message: `"Infra note ${comp.infraNoteNumber}" in footnote ${fnNum} references an earlier footnote. Infra must refer forward.`,
            suggestion: 'Use "supra" for backward references.',
            severity: 'error',
            referencedFootnote: comp.infraNoteNumber,
          });
        }
      }
    }
  }
}

/**
 * Check hereinafter designations for consistency.
 */
function checkHereinafterUsage(
  docMap: DocumentCitationMap,
  hereinafterMap: Map<string, HereinafterTracking>,
  issues: CrossReferenceIssue[]
): void {
  // Track hereinafter usage
  for (const citation of docMap.allCitations) {
    if (citation.type !== 'supra' && citation.type !== 'short_form') continue;

    const comp = citation.components as ShortFormComponents;
    if (!comp.partyName) continue;

    // Check if this partyName matches a hereinafter designation
    const designation = comp.partyName.toLowerCase();
    const tracking = hereinafterMap.get(designation);
    if (tracking) {
      tracking.usedCount++;
    }
  }

  // Also scan rawText for hereinafter usage in non-typed citations
  for (const citation of docMap.allCitations) {
    if (citation.rawText.includes('[hereinafter')) continue; // Skip establishments
    const useMatch = citation.rawText.match(/\bhereinafter\b/i);
    if (useMatch) {
      // Try to find which designation is being used
      for (const [designation, tracking] of hereinafterMap) {
        if (citation.rawText.toLowerCase().includes(designation)) {
          tracking.usedCount++;
        }
      }
    }
  }

  // Check for unused hereinafter designations
  for (const [designation, tracking] of hereinafterMap) {
    if (tracking.usedCount === 0) {
      issues.push({
        type: 'unused_hereinafter',
        citationId: tracking.citationId,
        footnoteNumber: tracking.footnoteNumber,
        message: `Hereinafter designation "${designation}" was established but never used in the document.`,
        suggestion: 'Remove the [hereinafter] designation if the short form is not needed.',
        severity: 'warning',
      });
    }
  }

  // Check for hereinafter uses without establishment
  for (const citation of docMap.allCitations) {
    if (citation.rawText.includes('[hereinafter')) continue; // Skip establishments

    const comp = citation.components as ShortFormComponents;
    if (!comp.partyName) continue;

    // Check for usage patterns that suggest hereinafter but without establishment
    if (citation.rawText.toLowerCase().includes('hereinafter') && !citation.rawText.includes('[hereinafter')) {
      const designation = comp.partyName.toLowerCase();
      if (!hereinafterMap.has(designation)) {
        issues.push({
          type: 'unestablished_hereinafter',
          citationId: citation.id,
          footnoteNumber: citation.footnoteContext?.footnoteNumber,
          message: `Reference to "${comp.partyName}" appears to use a hereinafter designation that was never established.`,
          suggestion: 'Add [hereinafter Designation] to the first full citation of this source.',
          severity: 'warning',
        });
      }
    }
  }
}

