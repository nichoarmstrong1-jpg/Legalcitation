import { v4 as uuid } from 'uuid';
import type { ParsedCitation, ShortFormComponents, CitationContext } from '@legalcitation/shared';

/**
 * Parse Id./Ibid. citations.
 *
 * Forms:
 *   Id.
 *   Ibid.
 *   Id. at 405.
 *   Id. at 405–10.
 *   Id. ¶ 34
 *   Id. at *10
 *   Id. at pp. 45, 64
 *   Id. § 5.2(a)
 *   Id. at 119:12-14
 */
export function parseIdCitation(
  rawText: string,
  position: { start: number; end: number },
  context: CitationContext = 'citation_sentence'
): ParsedCitation | null {
  const text = rawText.trim();

  // Match Id. or Ibid. (with optional formatting markers like *Id.*)
  const idStem = /^\*?(?:Id|Ibid)\.\*?/i;
  if (!idStem.test(text)) return null;

  // Strip the stem and trailing period to get the pin cite portion
  const afterStem = text.replace(idStem, '').replace(/\.?\s*$/, '').trim();

  let pinCite: string | undefined;

  if (afterStem) {
    // "at <pincite>" form — handles digits, *, pp., pg., p., page:paragraph, footnote refs
    const atMatch = afterStem.match(/^at\s+(?:p(?:p|g|age)?\.?\s*)?(.+)$/i);
    if (atMatch) {
      pinCite = atMatch[1].trim();
    } else {
      // Direct symbol form: ¶ 34, § 5.2(a)
      const symbolMatch = afterStem.match(/^([¶§]§?\s*.+)$/);
      if (symbolMatch) {
        pinCite = symbolMatch[1].trim();
      } else {
        return null;
      }
    }
  }

  return {
    id: uuid(),
    rawText: text,
    type: 'id',
    context,
    position,
    components: {
      type: 'id',
      pinCite,
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

  const supraPattern = /^(.+?),?\s+supra\s*(?:note\s+(\d+))?\s*(?:,\s*at\s+(?:p(?:p|g|age)?\.?\s*)?([*]*[\d]+[\d–\-:,\s&*]*))?\.?$/i;
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
      supraNoteNumber: match[2] ? parseInt(match[2], 10) : undefined,
      pinCite: match[3]?.trim(),
    } as ShortFormComponents,
  };
}

/**
 * Parse infra citations.
 *
 * Forms:
 *   infra note 12
 *   see infra note 12
 *   infra note 12 and accompanying text
 */
export function parseInfraCitation(
  rawText: string,
  position: { start: number; end: number },
  context: CitationContext = 'citation_sentence'
): ParsedCitation | null {
  const text = rawText.trim();

  const infraPattern = /^(?:see\s+)?infra\s+note\s+(\d+)(?:\s+and\s+accompanying\s+text)?\.?$/i;
  const match = text.match(infraPattern);
  if (!match) {
    // Try broader infra patterns (Part, Section, §)
    const broadPattern = /^(?:see\s+)?infra\s+(?:Part\s+[IVX\d]+|Section\s+[IVX\d]+|§\s*[\d.]+|text\s+accompanying\s+notes?\s+\d+(?:\s*[–-]\s*\d+)?)\.?$/i;
    if (!broadPattern.test(text)) return null;

    return {
      id: uuid(),
      rawText: text,
      type: 'infra',
      context,
      position,
      components: {
        type: 'id',
      } as ShortFormComponents,
    };
  }

  return {
    id: uuid(),
    rawText: text,
    type: 'infra',
    context,
    position,
    components: {
      type: 'id',
      infraNoteNumber: parseInt(match[1], 10),
    } as ShortFormComponents,
  };
}
