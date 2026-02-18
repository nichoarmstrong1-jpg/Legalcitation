import type { ParsedCitation, CitationContext, FootnoteContext } from '@legalcitation/shared';
import { detectCitations, type DetectedSpan } from './detector.js';
import {
  parseCaseCitation,
  parseShortCaseCitation,
  parseStatuteCitation,
  parseConstitutionCitation,
  parseRegulationCitation,
  parseArticleCitation,
  parseBookCitation,
  parseRestatementCitation,
  parseInternetCitation,
  parseAiSourceCitation,
  parseUnpublishedCitation,
  parseIdCitation,
  parseSupraCitation,
  parseInfraCitation,
} from './parsers/index.js';

export { detectCitations, type DetectedSpan } from './detector.js';
export * from './parsers/index.js';

/**
 * Classify a citation's context by examining surrounding text.
 *
 * - citation_sentence: standalone sentence (preceded by period/start, ends with period)
 * - citation_clause: set off by commas within a sentence
 * - textual_sentence: embedded in prose as part of a textual sentence
 */
function classifyContext(
  fullText: string,
  spanStart: number,
  spanEnd: number,
  spanText: string
): CitationContext {
  // Look at text before the citation span
  const before = fullText.slice(Math.max(0, spanStart - 300), spanStart);
  const trimmedBefore = before.trimEnd();

  // Look at text after the citation span
  const after = fullText.slice(spanEnd, spanEnd + 100);
  const trimmedAfter = after.trimStart();

  const trimmedSpanText = spanText.trimEnd();
  const endsWithPeriod = trimmedSpanText.endsWith('.');

  // Check what precedes this citation
  const precededByPeriodOrStart =
    !trimmedBefore ||
    trimmedBefore.endsWith('.') ||
    trimmedBefore.endsWith(';') ||
    trimmedBefore.endsWith(':');

  // A citation sentence: preceded by period/start-of-text AND ends with period
  // Also check that nothing follows except whitespace or another citation/period
  if (precededByPeriodOrStart && endsWithPeriod) {
    return 'citation_sentence';
  }

  // A citation clause: preceded by a comma (set off within a sentence)
  if (trimmedBefore.endsWith(',')) {
    // Check if the text after continues the sentence (common for embedded citations)
    if (trimmedAfter.startsWith(',') || trimmedAfter.startsWith('that') || trimmedAfter.startsWith('which')) {
      return 'citation_clause';
    }
    return 'citation_clause';
  }

  // If the citation is preceded by text that looks like prose (words, not just signals)
  // and doesn't end with a period, it's a textual sentence
  if (!endsWithPeriod) {
    return 'textual_sentence';
  }

  // Default: if it ends with a period and we can't tell, assume citation sentence
  return 'citation_sentence';
}

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

      // Classify the citation's context based on surrounding text
      const detectedContext = classifyContext(
        text,
        position.start,
        position.end,
        span.text
      );

      let result: ParsedCitation | null = null;

      switch (span.type) {
        case 'full_case':
          result = parseCaseCitation(span.text, position, detectedContext);
          break;
        case 'short_case':
          result = parseShortCaseCitation(span.text, position, detectedContext);
          break;
        case 'id':
          result = parseIdCitation(span.text, position, detectedContext);
          break;
        case 'supra':
          result = parseSupraCitation(span.text, position, detectedContext);
          break;
        case 'infra':
          result = parseInfraCitation(span.text, position, detectedContext);
          break;
        case 'statute':
          result = parseStatuteCitation(span.text, position, detectedContext);
          break;
        case 'constitution':
          result = parseConstitutionCitation(span.text, position, detectedContext);
          break;
        case 'regulation':
          result = parseRegulationCitation(span.text, position, detectedContext);
          break;
        case 'article':
          result = parseArticleCitation(span.text, position, detectedContext);
          break;
        case 'book':
          result = parseBookCitation(span.text, position, detectedContext);
          break;
        case 'restatement':
          result = parseRestatementCitation(span.text, position, detectedContext);
          break;
        case 'internet':
          result = parseInternetCitation(span.text, position, detectedContext);
          break;
        case 'ai_source':
          result = parseAiSourceCitation(span.text, position, detectedContext);
          break;
        case 'unpublished':
          result = parseUnpublishedCitation(span.text, position, detectedContext);
          break;
        default:
          // Try each parser in order
          result = parseCaseCitation(span.text, position, detectedContext)
            || parseStatuteCitation(span.text, position, detectedContext)
            || parseConstitutionCitation(span.text, position, detectedContext)
            || parseRegulationCitation(span.text, position, detectedContext)
            || parseArticleCitation(span.text, position, detectedContext)
            || parseRestatementCitation(span.text, position, detectedContext)
            || parseBookCitation(span.text, position, detectedContext)
            || parseInternetCitation(span.text, position, detectedContext)
            || parseAiSourceCitation(span.text, position, detectedContext)
            || parseUnpublishedCitation(span.text, position, detectedContext)
            || parseIdCitation(span.text, position, detectedContext)
            || parseSupraCitation(span.text, position, detectedContext)
            || parseInfraCitation(span.text, position, detectedContext);
      }

      if (result) {
        parsed.push(result);
      }
    }
  }

  return parsed;
}

export interface ParsedFootnote {
  footnoteNumber: number;
  rawText: string;
  startOffset: number;
  endOffset: number;
  citations: ParsedCitation[];
}

/**
 * Parse footnote-structured text into an array of footnotes with their citations.
 * Supports formats:
 *   "1. Citation text here."
 *   "1 Citation text here."
 * Footnotes can span multiple lines until the next footnote number.
 */
export function extractFootnoteCitations(text: string): ParsedFootnote[] {
  const footnotes: ParsedFootnote[] = [];

  // Detect footnote starts: a number at line start (or string start), optional period, then whitespace
  const footnoteStartPattern = /(?:^|\n)(\d{1,4})\.?\s+/g;
  const starts: Array<{ number: number; contentStart: number; matchStart: number }> = [];

  let match;
  while ((match = footnoteStartPattern.exec(text)) !== null) {
    starts.push({
      number: parseInt(match[1], 10),
      contentStart: match.index + match[0].length,
      matchStart: match.index === 0 ? 0 : match.index + 1, // skip the \n
    });
  }

  if (starts.length === 0) {
    return footnotes;
  }

  for (let i = 0; i < starts.length; i++) {
    const start = starts[i];
    const endOffset = i + 1 < starts.length ? starts[i + 1].matchStart : text.length;
    const footnoteText = text.slice(start.contentStart, endOffset).trim();

    const citations = extractAndParseCitations(footnoteText);

    // Annotate each citation with footnote context and adjust positions
    for (let j = 0; j < citations.length; j++) {
      const fnContext: FootnoteContext = {
        footnoteNumber: start.number,
        positionInFootnote: j,
        totalInFootnote: citations.length,
      };
      citations[j].footnoteContext = fnContext;
      citations[j].position = {
        start: citations[j].position.start + start.contentStart,
        end: citations[j].position.end + start.contentStart,
      };
    }

    footnotes.push({
      footnoteNumber: start.number,
      rawText: footnoteText,
      startOffset: start.matchStart,
      endOffset,
      citations,
    });
  }

  return footnotes;
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
