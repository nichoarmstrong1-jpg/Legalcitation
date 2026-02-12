import type { ParsedCitation, CitationContext } from '@legalcitation/shared';
import { detectCitations, type DetectedSpan } from './detector.js';
import {
  parseCaseCitation,
  parseShortCaseCitation,
  parseStatuteCitation,
  parseConstitutionCitation,
  parseRegulationCitation,
  parseArticleCitation,
  parseIdCitation,
  parseSupraCitation,
} from './parsers/index.js';

export { detectCitations, type DetectedSpan } from './detector.js';
export * from './parsers/index.js';

/**
 * Full pipeline: detect citations in text and parse each one.
 * Supports semicolon-separated citation strings (e.g., "Brown, 347 U.S. 483; Plessy, 163 U.S. 537").
 */
export function extractAndParseCitations(
  text: string,
  context: CitationContext = 'citation_sentence'
): ParsedCitation[] {
  // Split on semicolons to handle citation strings, but only if it looks
  // like multiple citations (has semicolons separating citation-like segments)
  const segments = splitCitationString(text);
  const parsed: ParsedCitation[] = [];

  for (const { segment, offset } of segments) {
    const spans = detectCitations(segment);

    for (const span of spans) {
      const position = { start: span.start + offset, end: span.end + offset };
      let result: ParsedCitation | null = null;

      switch (span.type) {
        case 'full_case':
          result = parseCaseCitation(span.text, position, context);
          break;
        case 'short_case':
          result = parseShortCaseCitation(span.text, position, context);
          break;
        case 'id':
          result = parseIdCitation(span.text, position, context);
          break;
        case 'supra':
          result = parseSupraCitation(span.text, position, context);
          break;
        case 'statute':
          result = parseStatuteCitation(span.text, position, context);
          break;
        case 'constitution':
          result = parseConstitutionCitation(span.text, position, context);
          break;
        case 'regulation':
          result = parseRegulationCitation(span.text, position, context);
          break;
        default:
          // Try each parser in order
          result = parseCaseCitation(span.text, position, context)
            || parseStatuteCitation(span.text, position, context)
            || parseConstitutionCitation(span.text, position, context)
            || parseRegulationCitation(span.text, position, context)
            || parseArticleCitation(span.text, position, context)
            || parseIdCitation(span.text, position, context)
            || parseSupraCitation(span.text, position, context);
      }

      if (result) {
        parsed.push(result);
      }
    }
  }

  return parsed;
}

/**
 * Split citation strings on semicolons.
 * Returns segments with their offsets in the original text.
 * If text has no semicolons or doesn't look like a citation string, returns the whole text.
 */
function splitCitationString(text: string): Array<{ segment: string; offset: number }> {
  // Only split if there are semicolons that look like citation separators
  if (!text.includes(';')) {
    return [{ segment: text, offset: 0 }];
  }

  // Don't split if the semicolons are inside parentheses (like year ranges)
  // or if text is very short
  const parts = text.split(/;\s*/);
  if (parts.length < 2) {
    return [{ segment: text, offset: 0 }];
  }

  const segments: Array<{ segment: string; offset: number }> = [];
  let currentOffset = 0;

  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed) {
      // Find where this part starts in the original text
      const idx = text.indexOf(trimmed, currentOffset);
      segments.push({
        segment: trimmed,
        offset: idx >= 0 ? idx : currentOffset,
      });
      currentOffset = (idx >= 0 ? idx : currentOffset) + trimmed.length + 1; // +1 for semicolon
    }
  }

  return segments;
}
