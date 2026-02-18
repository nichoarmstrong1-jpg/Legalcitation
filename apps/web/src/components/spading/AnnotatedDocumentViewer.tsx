import { useState, useRef, useEffect, useMemo, useLayoutEffect, useCallback } from 'react';
import { Check, AlertTriangle, XCircle } from 'lucide-react';
import type { SpadingAnnotation, AnnotationStatus } from '../../services/api.ts';

interface AnnotatedDocumentViewerProps {
  journalText: string;
  annotations: SpadingAnnotation[];
  selectedAnnotationId: string | null;
  onSelectAnnotation: (annotation: SpadingAnnotation) => void;
}

const STATUS_BG: Record<AnnotationStatus, string> = {
  verified: 'bg-verified-100 hover:bg-verified-200 border-b-2 border-verified-400',
  partial_match: 'bg-warning-100 hover:bg-warning-200 border-b-2 border-warning-400',
  format_error: 'bg-warning-100 hover:bg-warning-200 border-b-2 border-warning-400',
  not_found: 'bg-error-100 hover:bg-error-200 border-b-2 border-error-400',
  quote_mismatch: 'bg-error-100 hover:bg-error-200 border-b-2 border-error-400',
  pending: 'bg-surface-100 hover:bg-surface-200 border-b-2 border-surface-400',
  error: 'bg-error-100 hover:bg-error-200 border-b-2 border-error-400',
};

const STATUS_BG_SELECTED: Record<AnnotationStatus, string> = {
  verified: 'bg-verified-200 ring-2 ring-verified-500 border-b-2 border-verified-500',
  partial_match: 'bg-warning-200 ring-2 ring-warning-500 border-b-2 border-warning-500',
  format_error: 'bg-warning-200 ring-2 ring-warning-500 border-b-2 border-warning-500',
  not_found: 'bg-error-200 ring-2 ring-error-500 border-b-2 border-error-500',
  quote_mismatch: 'bg-error-200 ring-2 ring-error-500 border-b-2 border-error-500',
  pending: 'bg-surface-200 ring-2 ring-surface-500 border-b-2 border-surface-500',
  error: 'bg-error-200 ring-2 ring-error-500 border-b-2 border-error-500',
};

const STATUS_LABEL: Record<AnnotationStatus, string> = {
  verified: 'Verified',
  partial_match: 'Partial Match',
  format_error: 'Format Error',
  not_found: 'Not Found',
  quote_mismatch: 'Quote Mismatch',
  pending: 'Pending',
  error: 'Error',
};

const STATUS_BADGE_CLASS: Record<AnnotationStatus, string> = {
  verified: 'bg-verified-100 text-verified-700',
  partial_match: 'bg-warning-100 text-warning-700',
  format_error: 'bg-warning-100 text-warning-700',
  not_found: 'bg-error-100 text-error-700',
  quote_mismatch: 'bg-error-100 text-error-700',
  pending: 'bg-surface-100 text-surface-600',
  error: 'bg-error-100 text-error-700',
};

interface TextSegment {
  text: string;
  annotation: SpadingAnnotation | null;
}

function buildSegments(
  text: string,
  annotations: SpadingAnnotation[]
): TextSegment[] {
  if (annotations.length === 0) {
    return [{ text, annotation: null }];
  }

  const segments: TextSegment[] = [];
  const sorted = [...annotations].sort((a, b) => a.startOffset - b.startOffset);
  let lastEnd = 0;

  for (const ann of sorted) {
    if (ann.startOffset < lastEnd) continue;

    if (ann.startOffset > lastEnd) {
      segments.push({
        text: text.slice(lastEnd, ann.startOffset),
        annotation: null,
      });
    }

    segments.push({
      text: text.slice(ann.startOffset, ann.endOffset),
      annotation: ann,
    });

    lastEnd = ann.endOffset;
  }

  if (lastEnd < text.length) {
    segments.push({
      text: text.slice(lastEnd),
      annotation: null,
    });
  }

  return segments;
}

function AnnotationMiniTooltip({ annotation }: { annotation: SpadingAnnotation }) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [flipVertical, setFlipVertical] = useState(false);
  const [flipHorizontal, setFlipHorizontal] = useState(false);

  useLayoutEffect(() => {
    const el = tooltipRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < 0) setFlipVertical(true);
    if (rect.right > window.innerWidth) setFlipHorizontal(true);
  }, []);

  const firstIssue = annotation.issues.find(i => i.severity === 'error' || i.severity === 'warning');

  return (
    <div
      ref={tooltipRef}
      className={`absolute z-20 w-64 p-2.5 bg-white rounded-xl shadow-modal border border-surface-200 text-left ${
        flipVertical ? 'top-full mt-1' : 'bottom-full mb-1'
      } ${flipHorizontal ? 'right-0' : 'left-0'}`}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${STATUS_BADGE_CLASS[annotation.status]}`}>
          {STATUS_LABEL[annotation.status]}
        </span>
        {annotation.score !== null && (
          <span className={`text-[10px] font-bold ${
            annotation.score >= 80 ? 'text-verified-600' :
            annotation.score >= 50 ? 'text-warning-600' : 'text-error-600'
          }`}>
            {annotation.score}%
          </span>
        )}
      </div>
      {firstIssue && (
        <div className="flex items-start gap-1.5 text-[11px] text-surface-600 leading-snug">
          {firstIssue.severity === 'error' ? (
            <XCircle className="w-3 h-3 text-error-500 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-3 h-3 text-warning-500 shrink-0 mt-0.5" />
          )}
          <span className="line-clamp-2">{firstIssue.message}</span>
        </div>
      )}
      {!firstIssue && annotation.status === 'verified' && (
        <div className="flex items-center gap-1.5 text-[11px] text-verified-600">
          <Check className="w-3 h-3" />
          <span>Citation verified</span>
        </div>
      )}
      <div className="text-[10px] text-surface-400 mt-1.5">Click for details</div>
    </div>
  );
}

export function AnnotatedDocumentViewer({
  journalText,
  annotations,
  selectedAnnotationId,
  onSelectAnnotation,
}: AnnotatedDocumentViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLSpanElement>(null);
  const [hoveredAnnotationId, setHoveredAnnotationId] = useState<string | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const segments = useMemo(
    () => buildSegments(journalText, annotations),
    [journalText, annotations]
  );

  const handleMouseEnter = useCallback((annId: string) => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setHoveredAnnotationId(annId);
  }, []);

  const handleMouseLeave = useCallback(() => {
    hideTimeoutRef.current = setTimeout(() => {
      setHoveredAnnotationId(null);
    }, 150);
  }, []);

  // Scroll to selected annotation
  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedAnnotationId]);

  return (
    <div
      ref={containerRef}
      className="card p-6 max-h-[70vh] overflow-y-auto text-sm leading-relaxed text-surface-800 whitespace-pre-wrap font-serif"
    >
      {segments.map((segment, i) => {
        if (!segment.annotation) {
          return <span key={i}>{segment.text}</span>;
        }

        const ann = segment.annotation;
        const isSelected = ann.id === selectedAnnotationId;
        const isHovered = ann.id === hoveredAnnotationId;
        const bgClass = isSelected
          ? STATUS_BG_SELECTED[ann.status]
          : STATUS_BG[ann.status];

        return (
          <span
            key={i}
            ref={isSelected ? selectedRef : null}
            onClick={() => onSelectAnnotation(ann)}
            onMouseEnter={() => handleMouseEnter(ann.id)}
            onMouseLeave={handleMouseLeave}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectAnnotation(ann); } }}
            role="button"
            tabIndex={0}
            className={`relative cursor-pointer rounded-sm px-0.5 transition-colors ${bgClass} ${
              ann.resolved ? 'opacity-60' : ''
            }`}
          >
            {segment.text}
            {isHovered && !isSelected && (
              <AnnotationMiniTooltip annotation={ann} />
            )}
          </span>
        );
      })}
    </div>
  );
}
