import { useState, useEffect, useCallback } from 'react';
import { getCaseDocuments, type CaseDocument, type AnalyzedCitation } from '../services/api.ts';
import type { CaseComponents } from '@legalcitation/shared';

export function useCaseDocuments() {
  const [documents, setDocuments] = useState<CaseDocument[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCaseDocuments();
      setDocuments(data.documents);
    } catch {
      // Non-critical — user may not be authenticated or DB not configured
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const findMatchingDocument = useCallback(
    (citation: AnalyzedCitation): CaseDocument | undefined => {
      if (!citation.parsed) return undefined;

      const rawText = citation.parsed.rawText?.toLowerCase() || '';
      const caseComp = citation.parsed.type === 'case'
        ? citation.parsed.components as CaseComponents
        : null;

      for (const doc of documents) {
        // Match by case name from parsed components
        if (caseComp?.partyOne && caseComp?.partyTwo && doc.caseName) {
          const docName = doc.caseName.toLowerCase();
          const partyOne = caseComp.partyOne.toLowerCase();
          const partyTwo = caseComp.partyTwo.toLowerCase();
          if (docName.includes(partyOne) && docName.includes(partyTwo)) {
            return doc;
          }
        }

        // Match by citation string in document metadata
        if (doc.citation && rawText) {
          const docCitation = doc.citation.toLowerCase().replace(/\*/g, '');
          const cleanRaw = rawText.replace(/\*/g, '');
          if (docCitation.includes(cleanRaw) || cleanRaw.includes(docCitation)) {
            return doc;
          }
        }

        // Match by case name in document filename
        if (caseComp?.partyOne && doc.fileName) {
          const fileName = doc.fileName.toLowerCase().replace(/[_-]/g, ' ').replace(/\.[^.]+$/, '');
          const partyOne = caseComp.partyOne.toLowerCase();
          if (fileName.includes(partyOne)) {
            return doc;
          }
        }
      }

      return undefined;
    },
    [documents]
  );

  return { documents, loading, reload: load, findMatchingDocument };
}
