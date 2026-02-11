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
 */
export function extractAndParseCitations(
  text: string,
  context: CitationContext = 'citation_sentence'
): ParsedCitation[] {
  const spans = detectCitations(text);
  const parsed: ParsedCitation[] = [];

  for (const span of spans) {
    const position = { start: span.start, end: span.end };
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

  return parsed;
}
