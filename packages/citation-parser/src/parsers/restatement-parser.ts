import { v4 as uuid } from 'uuid';
import type { ParsedCitation, RestatementComponents, CitationContext } from '@legalcitation/shared';

/**
 * Parse a Restatement citation (Rule 12.9.5 / R. 15.8).
 *
 * Format: Restatement (Series) of Subject § section (year).
 * Example: Restatement (Second) of Torts § 402A (Am. L. Inst. 1965).
 */
export function parseRestatementCitation(
  rawText: string,
  position: { start: number; end: number },
  context: CitationContext = 'citation_sentence'
): ParsedCitation | null {
  const text = rawText.trim().replace(/\.$/, '');

  const components = parseRestatement(text);
  if (!components) return null;

  return {
    id: uuid(),
    rawText: rawText.trim(),
    type: 'restatement',
    context,
    position,
    components,
  };
}

function parseRestatement(text: string): RestatementComponents | null {
  // Pattern: Restatement (Series) of Subject § section [cmt./illus.] (org year)
  const pattern = /^Restatement\s+\((First|Second|Third|Fourth)\)\s+of\s+([\w\s:]+?)\s*§+\s*([\dA-Za-z.]+(?:\([a-zA-Z0-9]+\))*)\s*(?:(cmt\.\s*[a-z]|illus\.\s*\d+)\s*)?\(([^)]+)\)$/i;
  const match = text.match(pattern);
  if (!match) return null;

  const series = match[1];
  const subject = match[2].trim();
  const section = match[3];
  const pinCite = match[4]?.trim();
  const parenContent = match[5].trim();

  // Parse parenthetical for organization and year
  const yearMatch = parenContent.match(/(\d{4})/);
  const year = yearMatch ? yearMatch[1] : '';
  const organization = parenContent.replace(/\d{4}/, '').replace(/,?\s*$/, '').trim() || undefined;

  return {
    series,
    subject,
    section,
    pinCite,
    organization,
    year,
  };
}
