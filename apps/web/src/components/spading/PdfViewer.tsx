import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2 } from 'lucide-react';
import { authenticatedFetch } from '../../services/api.ts';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure pdf.js worker — bundled locally to avoid CDN dependency
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface PdfViewerProps {
  url: string;
  highlightPage?: number;
  highlightText?: string;
}

export function PdfViewer({ url, highlightPage, highlightText }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(highlightPage || 1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null);
  const [loadError, setLoadError] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);

  // Fetch PDF with auth cookies (react-pdf's file={url} doesn't send credentials)
  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    setPdfData(null);
    setLoadError(false);
    setLoading(true);

    authenticatedFetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.arrayBuffer();
      })
      .then(buffer => {
        if (!cancelled) setPdfData(buffer);
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError(true);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [url]);

  const pdfFile = useMemo(
    () => pdfData ? { data: pdfData } : null,
    [pdfData]
  );

  useEffect(() => {
    if (highlightPage && highlightPage > 0) {
      setCurrentPage(highlightPage);
    }
  }, [highlightPage]);

  const onDocumentLoadSuccess = useCallback(({ numPages: pages }: { numPages: number }) => {
    setNumPages(pages);
    setLoading(false);
    if (highlightPage && highlightPage > 0 && highlightPage <= pages) {
      setCurrentPage(highlightPage);
    }
  }, [highlightPage]);

  const customTextRenderer = useCallback(
    (textItem: { str: string }) => {
      if (!highlightText) return textItem.str;

      const text = textItem.str;
      const searchLower = highlightText.toLowerCase();
      const textLower = text.toLowerCase();
      const idx = textLower.indexOf(searchLower);

      if (idx === -1) return text;

      const before = text.slice(0, idx);
      const match = text.slice(idx, idx + highlightText.length);
      const after = text.slice(idx + highlightText.length);

      return `${before}<mark class="bg-warning-200 rounded px-0.5">${match}</mark>${after}`;
    },
    [highlightText]
  );

  return (
    <div className="flex flex-col h-full bg-surface-100 rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-white border-b border-surface-200">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="p-1 hover:bg-surface-100 rounded disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-surface-600 px-2">
            {currentPage} / {numPages || '...'}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))}
            disabled={currentPage >= numPages}
            className="p-1 hover:bg-surface-100 rounded disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
            className="p-1 hover:bg-surface-100 rounded"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs text-surface-600 px-1">{Math.round(scale * 100)}%</span>
          <button
            onClick={() => setScale(s => Math.min(2, s + 0.1))}
            className="p-1 hover:bg-surface-100 rounded"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PDF Content */}
      <div className="flex-1 overflow-auto p-4 flex justify-center" ref={pageRef}>
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-primary-400 animate-spin" />
          </div>
        )}

        {loadError ? (
          <div className="text-sm text-error-600 text-center py-10">
            Failed to load PDF. File storage may not be configured.
          </div>
        ) : !pdfFile ? null : (
        <Document
          file={pdfFile}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={null}
          error={
            <div className="text-sm text-error-600 text-center py-10">
              Failed to load PDF. File storage may not be configured.
            </div>
          }
        >
          <Page
            pageNumber={currentPage}
            scale={scale}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            customTextRenderer={highlightText ? customTextRenderer : undefined}
            loading={null}
          />
        </Document>
        )}
      </div>
    </div>
  );
}
