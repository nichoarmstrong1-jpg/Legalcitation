import { useRef, useEffect, useMemo } from 'react';
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
  // Sort annotations by start offset
  const sorted = [...annotations].sort((a, b) => a.startOffset - b.startOffset);
  let lastEnd = 0;

  for (const ann of sorted) {
    // Skip overlapping annotations
    if (ann.startOffset < lastEnd) continue;

    // Add plain text before this annotation
    if (ann.startOffset > lastEnd) {
      segments.push({
        text: text.slice(lastEnd, ann.startOffset),
        annotation: null,
      });
    }

    // Add the annotated citation
    segments.push({
      text: text.slice(ann.startOffset, ann.endOffset),
      annotation: ann,
    });

    lastEnd = ann.endOffset;
  }

  // Add remaining plain text
  if (lastEnd < text.length) {
    segments.push({
      text: text.slice(lastEnd),
      annotation: null,
    });
  }

  return segments;
}

export function AnnotatedDocumentViewer({
  journalText,
  annotations,
  selectedAnnotationId,
  onSelectAnnotation,
}: AnnotatedDocumentViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLSpanElement>(null);

  const segments = useMemo(
    () => buildSegments(journalText, annotations),
    [journalText, annotations]
  );

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
        const bgClass = isSelected
          ? STATUS_BG_SELECTED[ann.status]
          : STATUS_BG[ann.status];

        return (
          <span
            key={i}
            ref={isSelected ? selectedRef : null}
            onClick={() => onSelectAnnotation(ann)}
            className={`cursor-pointer rounded-sm px-0.5 transition-colors ${bgClass} ${
              ann.resolved ? 'opacity-60' : ''
            }`}
            title={`${ann.status} - Click to view details`}
          >
            {segment.text}
          </span>
        );
      })}
    </div>
  );
}
