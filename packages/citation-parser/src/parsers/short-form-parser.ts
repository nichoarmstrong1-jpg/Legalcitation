import { v4 as uuid } from 'uuid';
import type { ParsedCitation, ShortFormComponents, CitationContext } from '@legalcitation/shared';

/**
 * Parse Id. citations.
 *
 * Forms:
 *   Id.
 *   Id. at 405.
 *   Id. at 405–10.
 */
export function parseIdCitation(
  rawText: string,
  position: { start: number; end: number },
  context: CitationContext = 'citation_sentence'
): ParsedCitation | null {
  const text = rawText.trim();

  const idPattern = /^(Id\.)\s*(?:at\s+([\d–\-,\s]+(?:n\.\d+)?))?\.?$/i;
  const match = text.match(idPattern);
  if (!match) return null;

  return {
    id: uuid(),
    rawText: text,
    type: 'id',
    context,
    position,
    components: {
      type: 'id',
      pinCite: match[2]?.trim(),
    } as ShortFormComponents,
  };
}

/**
 * Parse supra citations.
 *
 * Forms:
 *   Author, supra note 5, at 100.
 *   Author, supra, at 100.
 */
export function parseSupraCitation(
  rawText: string,
  position: { start: number; end: number },
  context: CitationContext = 'citation_sentence'
): ParsedCitation | null {
  const text = rawText.trim();

  const supraPattern = /^(.+?),?\s+supra\s*(?:note\s+(\d+))?\s*(?:,\s*at\s+([\d–\-,\s]+))?\.?$/i;
  const match = text.match(supraPattern);
  if (!match) return null;

  return {
    id: uuid(),
    rawText: text,
    type: 'supra',
    context,
    position,
    components: {
      type: 'supra',
      partyName: match[1].trim(),
      pinCite: match[3]?.trim(),
    } as ShortFormComponents,
  };
}
