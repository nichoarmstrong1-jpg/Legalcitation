/**
 * Citation annotation system — inserts annotation strings (links, highlights)
 * around detected citations in the original source text.
 *
 * Handles overlapping annotations and works correctly even when citations
 * were detected in cleaned text (via SpanMapper offset translation).
 */
import type { ParsedCitation } from '@legalcitation/shared';
import { SpanMapper } from './span-mapper.js';
import type { SpanMapping } from './cleaners.js';

export interface AnnotationMarker {
  before: string;
  after: string;
}

export type AnnotatorFn = (citation: ParsedCitation) => AnnotationMarker;

export interface AnnotateOptions {
  /** SpanMapping from cleanText(), for translating cleaned-text positions back to source. */
  spanMap?: SpanMapping;
  /** How to handle overlapping annotations: 'skip' drops the later one, 'nest' allows nesting. */
  overlapMode?: 'skip' | 'nest';
}

/**
 * Insert annotation markers around each citation in the source text.
 *
 * @param sourceText The original (uncleaned) source text.
 * @param citations Parsed citations with positions in cleaned-text coordinates.
 * @param annotator Function that returns before/after strings for each citation.
 * @param options Configuration for span mapping and overlap handling.
 * @returns The annotated source text.
 */
export function annotateCitations(
  sourceText: string,
  citations: ParsedCitation[],
  annotator: AnnotatorFn,
  options: AnnotateOptions = {}
): string {
  if (citations.length === 0) return sourceText;

  const mapper = options.spanMap
    ? new SpanMapper(options.spanMap)
    : SpanMapper.identity(sourceText.length);

  const overlapMode = options.overlapMode ?? 'skip';

  // Build annotation list with original-text coordinates
  const annotations: Array<{
    start: number;
    end: number;
    marker: AnnotationMarker;
  }> = [];

  for (const citation of citations) {
    const { start: origStart, end: origEnd } = mapper.toOriginal(
      citation.position.start,
      citation.position.end
    );

    // Bounds check
    if (origStart < 0 || origEnd > sourceText.length || origStart >= origEnd) {
      continue;
    }

    const marker = annotator(citation);
    annotations.push({ start: origStart, end: origEnd, marker });
  }

  // Sort by start position, then by end position (descending for nesting)
  annotations.sort((a, b) => a.start - b.start || b.end - a.end);

  // Filter overlaps
  const filtered: typeof annotations = [];
  let lastEnd = -1;

  for (const ann of annotations) {
    if (ann.start < lastEnd && overlapMode === 'skip') {
      continue;
    }
    filtered.push(ann);
    lastEnd = ann.end;
  }

  // Build annotated text by inserting markers from end to start
  // (reverse order to preserve character offsets)
  let result = sourceText;
  for (let i = filtered.length - 1; i >= 0; i--) {
    const { start, end, marker } = filtered[i];
    result =
      result.slice(0, start) +
      marker.before +
      result.slice(start, end) +
      marker.after +
      result.slice(end);
  }

  return result;
}

/**
 * Create an HTML annotator that wraps citations in <span> tags.
 */
export function htmlAnnotator(
  className: string = 'citation',
  dataAttributes: (citation: ParsedCitation) => Record<string, string> = () => ({})
): AnnotatorFn {
  return (citation: ParsedCitation) => {
    const attrs = dataAttributes(citation);
    const attrStr = Object.entries(attrs)
      .map(([k, v]) => ` data-${k}="${escapeHtml(v)}"`)
      .join('');

    return {
      before: `<span class="${className}" data-type="${citation.type}" data-id="${citation.id}"${attrStr}>`,
      after: '</span>',
    };
  };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
