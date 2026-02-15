import { useState, useEffect, useCallback } from 'react';
import { getCaseDocuments, type CaseDocument, type AnalyzedCitation } from '../services/api.ts';

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

      const components = citation.parsed.components;
      const rawText = citation.parsed.rawText?.toLowerCase() || '';

      for (const doc of documents) {
        // Match by case name from parsed components
        if (components?.partyOne && components?.partyTwo && doc.caseName) {
          const docName = doc.caseName.toLowerCase();
          const partyOne = (components.partyOne as string).toLowerCase();
          const partyTwo = (components.partyTwo as string).toLowerCase();
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
        if (components?.partyOne && doc.fileName) {
          const fileName = doc.fileName.toLowerCase().replace(/[_-]/g, ' ').replace(/\.[^.]+$/, '');
          const partyOne = (components.partyOne as string).toLowerCase();
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
