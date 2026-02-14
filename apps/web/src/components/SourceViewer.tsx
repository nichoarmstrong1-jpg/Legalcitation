import { useState, useEffect } from 'react';
import { X, FileText, Loader2 } from 'lucide-react';
import { getCaseDocument, type CaseDocumentFull } from '../services/api.ts';

interface SourceViewerProps {
  documentId: string;
  onClose: () => void;
  highlightText?: string;
}

export function SourceViewer({ documentId, onClose, highlightText }: SourceViewerProps) {
  const [doc, setDoc] = useState<CaseDocumentFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePage, setActivePage] = useState<number>(1);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getCaseDocument(documentId)
      .then(data => {
        if (!cancelled) {
          setDoc(data);

          // If there's text to highlight, find which page it's on
          if (highlightText && data.pageMapping) {
            const idx = data.extractedText.indexOf(highlightText);
            if (idx >= 0) {
              const page = data.pageMapping.find(
                p => idx >= p.startOffset && idx < p.endOffset
              );
              if (page) setActivePage(page.pageNumber);
            }
          }
        }
      })
      .catch(err => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load document');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [documentId, highlightText]);

  const currentPageText = doc?.pageMapping
    ? doc.pageMapping.find(p => p.pageNumber === activePage)?.text || ''
    : doc?.extractedText || '';

  const totalPages = doc?.pageMapping?.length || 1;

  const renderHighlightedText = (text: string) => {
    if (!highlightText || !text.includes(highlightText)) {
      return <span>{text}</span>;
    }

    const idx = text.indexOf(highlightText);
    return (
      <>
        <span>{text.slice(0, idx)}</span>
        <mark className="bg-warning-200 text-warning-900 rounded px-0.5">{highlightText}</mark>
        <span>{text.slice(idx + highlightText.length)}</span>
      </>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-elevated max-w-3xl w-full max-h-[85vh] flex flex-col animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-surface-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-surface-600" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-primary-900 truncate">
                {doc?.caseName || doc?.fileName || 'Document Viewer'}
              </h2>
              {doc?.citation && (
                <p className="text-xs font-serif text-surface-400 truncate">{doc.citation}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-surface-100 text-surface-400 hover:text-surface-600 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Page navigation */}
        {doc?.pageMapping && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 px-6 py-2 border-b border-surface-100">
            <button
              onClick={() => setActivePage(p => Math.max(1, p - 1))}
              disabled={activePage <= 1}
              className="px-2 py-1 text-xs font-medium text-surface-500 hover:text-surface-700 disabled:opacity-30"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                // Show pages around active page
                const start = Math.max(1, Math.min(activePage - 4, totalPages - 9));
                const page = start + i;
                if (page > totalPages) return null;
                return (
                  <button
                    key={page}
                    onClick={() => setActivePage(page)}
                    className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                      activePage === page
                        ? 'bg-primary-100 text-primary-800'
                        : 'text-surface-400 hover:bg-surface-100'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setActivePage(p => Math.min(totalPages, p + 1))}
              disabled={activePage >= totalPages}
              className="px-2 py-1 text-xs font-medium text-surface-500 hover:text-surface-700 disabled:opacity-30"
            >
              Next
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
            </div>
          )}

          {error && (
            <div className="text-center py-16">
              <p className="text-sm text-error-600">{error}</p>
            </div>
          )}

          {!loading && !error && doc && (
            <div className="font-serif text-sm leading-relaxed whitespace-pre-wrap text-surface-700">
              {renderHighlightedText(currentPageText)}
            </div>
          )}
        </div>

        {/* Footer */}
        {doc && (
          <div className="px-6 py-3 border-t border-surface-100 flex items-center justify-between">
            <p className="text-[10px] text-surface-400">
              {doc.pageMapping
                ? `Page ${activePage} of ${totalPages}`
                : `${doc.extractedText.length.toLocaleString()} characters`}
            </p>
            <p className="text-[10px] text-surface-400">{doc.fileName}</p>
          </div>
        )}
      </div>
    </div>
  );
}
