/**
 * Reference citation parser — detects name-only case references like
 * "Roe at 240" or "Amick at 795". These require resolution context —
 * they can only be detected after full citations have been parsed.
 */
import { v4 as uuid } from 'uuid';
import type { ParsedCitation, ShortFormComponents, CitationContext, CitationResource } from '@legalcitation/shared';

/**
 * Detect reference citations in text given a set of previously resolved resources.
 * Looks for patterns like "PartyName at <pincite>" where PartyName matches
 * a plaintiff or defendant from a resolved full citation.
 */
export function detectReferenceCitations(
  text: string,
  resolvedResources: CitationResource[],
  context: CitationContext = 'citation_sentence'
): ParsedCitation[] {
  const results: ParsedCitation[] = [];
  if (resolvedResources.length === 0) return results;

  // Build set of unique party names to search for
  const partyNames = new Set<string>();
  for (const resource of resolvedResources) {
    if (resource.plaintiff) {
      // Use last name only for common patterns like "Roe at 240"
      const lastName = extractLastName(resource.plaintiff);
      if (lastName && lastName.length >= 3) {
        partyNames.add(lastName);
      }
    }
    if (resource.defendant) {
      const lastName = extractLastName(resource.defendant);
      if (lastName && lastName.length >= 3) {
        partyNames.add(lastName);
      }
    }
  }

  if (partyNames.size === 0) return results;

  // Build regex: PartyName at <pincite>
  const escapedNames = Array.from(partyNames)
    .sort((a, b) => b.length - a.length)
    .map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

  const pattern = new RegExp(
    `\\b(${escapedNames.join('|')})\\s+at\\s+(?:p(?:p|g|age)?\\.?\\s*)?([*]*\\d[\\d\\u2013\\-:,\\s*]*)`,
    'gi'
  );

  let match;
  while ((match = pattern.exec(text)) !== null) {
    const partyName = match[1];
    const pinCite = match[2].trim();
    const start = match.index;
    const end = start + match[0].length;

    results.push({
      id: uuid(),
      rawText: match[0],
      type: 'short_form',
      context,
      position: { start, end },
      components: {
        type: 'short_case',
        partyName,
        pinCite,
      } as ShortFormComponents,
    });
  }

  return results;
}

function extractLastName(partyStr: string): string | null {
  // Handle "In re X" → use X
  const inReMatch = partyStr.match(/^(?:In re|Ex parte)\s+(.+)/i);
  if (inReMatch) return inReMatch[1].split(/\s+/)[0];

  // For standard parties, use the last word (surname)
  const words = partyStr.trim().split(/\s+/);
  if (words.length === 0) return null;

  // If single word, use it directly
  if (words.length === 1) return words[0];

  // Use the last word, skipping common suffixes like "Inc.", "Corp.", "LLC"
  const suffixes = new Set(['Inc.', 'Corp.', 'LLC', 'Ltd.', 'Co.', 'L.P.', 'N.A.']);
  for (let i = words.length - 1; i >= 0; i--) {
    if (!suffixes.has(words[i])) return words[i];
  }

  return words[0];
}
