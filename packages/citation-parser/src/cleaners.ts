/**
 * Text cleaning pipeline — pre-processes raw text from PDFs, OCR, and HTML
 * before citation extraction. Inspired by eyecite's clean.py.
 *
 * Each step tracks character-level offsets between cleaned and original text
 * via a SpanMapping structure for later annotation.
 */

export interface SpanMapping {
  originalLength: number;
  cleanedLength: number;
  /** Maps cleaned-text index → original-text index. */
  offsets: number[];
}

export type CleanerStep =
  | 'html'
  | 'inline_whitespace'
  | 'all_whitespace'
  | 'underscores'
  | 'xml'
  | ((text: string) => string);

/**
 * Clean text using a sequence of named steps or custom functions.
 * Returns the cleaned text and a span mapping for offset translation.
 */
export function cleanText(
  text: string,
  steps: CleanerStep[] = ['inline_whitespace']
): { cleaned: string; spanMap: SpanMapping } {
  let current = text;
  // Build a mapping from each position in the running "cleaned" text
  // back to its position in the original text.
  let offsets = Array.from({ length: text.length }, (_, i) => i);

  for (const step of steps) {
    const fn = typeof step === 'function' ? step : BUILTIN_STEPS[step];
    if (!fn) continue;

    const { result, newOffsets } = applyStep(current, offsets, fn);
    current = result;
    offsets = newOffsets;
  }

  return {
    cleaned: current,
    spanMap: {
      originalLength: text.length,
      cleanedLength: current.length,
      offsets,
    },
  };
}

/**
 * Translate a span from cleaned-text coordinates to original-text coordinates.
 */
export function toOriginalSpan(
  spanMap: SpanMapping,
  cleanedStart: number,
  cleanedEnd: number
): { start: number; end: number } {
  const start = cleanedStart < spanMap.offsets.length
    ? spanMap.offsets[cleanedStart]
    : spanMap.originalLength;
  const end = cleanedEnd > 0 && cleanedEnd <= spanMap.offsets.length
    ? spanMap.offsets[cleanedEnd - 1] + 1
    : spanMap.originalLength;
  return { start, end };
}

// -- Built-in cleaning steps --

function cleanHtml(text: string): string {
  // Strip HTML tags, preserving visible text content
  return text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '');
}

function cleanInlineWhitespace(text: string): string {
  // Collapse inline spaces/tabs (not newlines) to single space
  return text.replace(/[^\S\n]+/g, ' ');
}

function cleanAllWhitespace(text: string): string {
  // Remove zero-width spaces and BOM, then collapse all whitespace
  return text
    .replace(/\u200b/g, '')
    .replace(/\u200c/g, '')
    .replace(/\u200d/g, '')
    .replace(/\ufeff/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanUnderscores(text: string): string {
  // Remove sequences of underscores (common OCR/PDF artifacts)
  return text.replace(/_{2,}/g, '');
}

function cleanXml(text: string): string {
  // Remove XML declaration tags
  return text.replace(/<\?xml[^?]*\?>/gi, '');
}

const BUILTIN_STEPS: Record<string, (text: string) => string> = {
  html: cleanHtml,
  inline_whitespace: cleanInlineWhitespace,
  all_whitespace: cleanAllWhitespace,
  underscores: cleanUnderscores,
  xml: cleanXml,
};

/**
 * Apply a cleaning function to text while tracking offset mappings.
 * Uses character-by-character diff tracking.
 */
function applyStep(
  text: string,
  currentOffsets: number[],
  fn: (text: string) => string
): { result: string; newOffsets: number[] } {
  const result = fn(text);

  if (result === text) {
    return { result, newOffsets: currentOffsets };
  }

  // Build new offsets by aligning original and result using simple diff.
  // Walk both strings; for each character in `result`, find its best match
  // in `text` to inherit the original offset.
  const newOffsets: number[] = [];
  let textIdx = 0;

  for (let resIdx = 0; resIdx < result.length; resIdx++) {
    // Advance textIdx past characters that were removed
    while (textIdx < text.length && text[textIdx] !== result[resIdx]) {
      textIdx++;
    }

    if (textIdx < text.length) {
      newOffsets.push(currentOffsets[textIdx]);
      textIdx++;
    } else {
      // Character doesn't map — use last known offset
      const lastOffset = newOffsets.length > 0
        ? newOffsets[newOffsets.length - 1]
        : 0;
      newOffsets.push(lastOffset);
    }
  }

  return { result, newOffsets };
}
