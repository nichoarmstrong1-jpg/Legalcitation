import { useState, useCallback, useRef } from 'react';
import { X, GripVertical } from 'lucide-react';
import type { SpadingAnnotation } from '../../services/api.ts';
import { getProjectDocumentFileUrl } from '../../services/api.ts';
import { PdfViewer } from './PdfViewer.tsx';
import { AnnotatedDocumentViewer } from './AnnotatedDocumentViewer.tsx';
import { AnnotationSidebar } from './AnnotationSidebar.tsx';

interface SplitViewProps {
  projectId: string;
  journalText: string;
  annotations: SpadingAnnotation[];
  selectedAnnotation: SpadingAnnotation | null;
  onSelectAnnotation: (annotation: SpadingAnnotation) => void;
  onResolve: (annotationId: string, resolved: boolean) => void;
  onNote: (annotationId: string, note: string) => void;
  onClosePdf: () => void;
  viewingSourceAnnotation: SpadingAnnotation | null;
}

export function SplitView({
  projectId,
  journalText,
  annotations,
  selectedAnnotation,
  onSelectAnnotation,
  onResolve,
  onNote,
  onClosePdf,
  viewingSourceAnnotation,
}: SplitViewProps) {
  const [splitRatio, setSplitRatio] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const handleMouseDown = useCallback(() => {
    dragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const ratio = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitRatio(Math.max(25, Math.min(75, ratio)));
    };

    const handleMouseUp = () => {
      dragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, []);

  const showPdf = viewingSourceAnnotation?.matchedDocumentId != null;
  const pdfUrl = viewingSourceAnnotation?.matchedDocumentId
    ? getProjectDocumentFileUrl(projectId, viewingSourceAnnotation.matchedDocumentId)
    : '';

  return (
    <div ref={containerRef} className="flex h-[75vh] gap-0 relative">
      {/* Left Panel: Document + Sidebar */}
      <div
        className="flex gap-4 overflow-hidden"
        style={{ width: showPdf ? `${splitRatio}%` : '100%' }}
      >
        {/* Annotated Document */}
        <div className={showPdf ? 'flex-1 min-w-0' : 'flex-[2] min-w-0'}>
          <AnnotatedDocumentViewer
            journalText={journalText}
            annotations={annotations}
            selectedAnnotationId={selectedAnnotation?.id ?? null}
            onSelectAnnotation={onSelectAnnotation}
          />
        </div>

        {/* Annotation Details Sidebar */}
        {selectedAnnotation && (
          <div className="w-80 shrink-0">
            <AnnotationSidebar
              annotation={selectedAnnotation}
              onResolve={onResolve}
              onNote={onNote}
              onViewSource={onSelectAnnotation}
            />
          </div>
        )}
      </div>

      {/* Resize Handle */}
      {showPdf && (
        <div
          onMouseDown={handleMouseDown}
          className="w-2 flex-shrink-0 cursor-col-resize flex items-center justify-center hover:bg-surface-200 transition-colors group"
        >
          <GripVertical className="w-3 h-3 text-surface-300 group-hover:text-surface-500" />
        </div>
      )}

      {/* Right Panel: PDF Viewer */}
      {showPdf && (
        <div
          className="relative"
          style={{ width: `${100 - splitRatio}%` }}
        >
          <button
            onClick={onClosePdf}
            className="absolute top-2 right-2 z-10 p-1 bg-white/90 hover:bg-white rounded-lg shadow-sm border border-surface-200"
          >
            <X className="w-4 h-4 text-surface-500" />
          </button>
          <PdfViewer
            url={pdfUrl}
            highlightPage={viewingSourceAnnotation?.matchedPageNumber ?? undefined}
            highlightText={viewingSourceAnnotation?.matchedTextSnippet?.slice(0, 50) ?? undefined}
          />
        </div>
      )}
    </div>
  );
}
