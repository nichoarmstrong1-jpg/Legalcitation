import { v4 as uuid } from 'uuid';
import type { ParsedCitation, RegulationComponents, CitationContext } from '@legalcitation/shared';

/**
 * Parse a regulation citation (Rule 14).
 *
 * C.F.R. format: title C.F.R. § section (year)
 * Fed. Reg. format: vol Fed. Reg. page (date)
 */
export function parseRegulationCitation(
  rawText: string,
  position: { start: number; end: number },
  context: CitationContext = 'citation_sentence'
): ParsedCitation | null {
  const text = rawText.trim();

  const components = parseRegulation(text);
  if (!components) return null;

  return {
    id: uuid(),
    rawText: text,
    type: 'regulation',
    context,
    position,
    components,
  };
}

function parseRegulation(text: string): RegulationComponents | null {
  // C.F.R. pattern: title C.F.R. § section (year)
  const cfrPattern = /^(\d{1,2})\s+C\.F\.R\.?\s*§?\s*([\d.]+)\s*(?:\((\d{4})\))?\s*\.?$/;
  let match = text.match(cfrPattern);
  if (match) {
    return {
      title: match[1],
      source: 'C.F.R.',
      section: match[2],
      year: match[3],
    };
  }

  // Federal Register pattern: vol Fed. Reg. page (date)
  const fedRegPattern = /^(\d{1,3})\s+Fed\.\s+Reg\.\s+([\d,]+)\s*(?:\(([^)]+)\))?\s*\.?$/;
  match = text.match(fedRegPattern);
  if (match) {
    return {
      title: match[1],
      source: 'Fed. Reg.',
      section: match[2],
      year: match[3],
    };
  }

  return null;
}
