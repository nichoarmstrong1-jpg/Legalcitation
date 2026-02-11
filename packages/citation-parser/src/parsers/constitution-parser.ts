import { v4 as uuid } from 'uuid';
import type { ParsedCitation, ConstitutionComponents, CitationContext } from '@legalcitation/shared';

/**
 * Parse a constitution citation (Rule 11).
 *
 * U.S. format: U.S. Const. art. I, § 8, cl. 3
 *              U.S. Const. amend. XIV, § 1
 * State format: Cal. Const. art. I, § 7
 */
export function parseConstitutionCitation(
  rawText: string,
  position: { start: number; end: number },
  context: CitationContext = 'citation_sentence'
): ParsedCitation | null {
  const text = rawText.trim();

  const components = parseConstitution(text);
  if (!components) return null;

  return {
    id: uuid(),
    rawText: text,
    type: 'constitution',
    context,
    position,
    components,
  };
}

function parseConstitution(text: string): ConstitutionComponents | null {
  // U.S. Constitution articles
  const usArticlePattern = /^U\.S\.\s+Const\.\s+art\.\s+([IVX]+)(?:,\s*§\s*(\d+))?(?:,\s*cl\.\s*(\d+))?/i;
  let match = text.match(usArticlePattern);
  if (match) {
    return {
      jurisdiction: 'U.S.',
      article: match[1],
      section: match[2],
      clause: match[3],
    };
  }

  // U.S. Constitution amendments
  const usAmendPattern = /^U\.S\.\s+Const\.\s+amend\.\s+([IVX]+\w*)(?:,\s*§\s*(\d+))?(?:,\s*cl\.\s*(\d+))?/i;
  match = text.match(usAmendPattern);
  if (match) {
    return {
      jurisdiction: 'U.S.',
      amendment: match[1],
      section: match[2],
      clause: match[3],
    };
  }

  // State constitutions
  const statePattern = /^([A-Z][a-z]+\.?)\s+Const\.\s+art\.\s+([IVX\d]+)(?:,\s*§\s*(\d+))?/i;
  match = text.match(statePattern);
  if (match) {
    return {
      jurisdiction: match[1],
      article: match[2],
      section: match[3],
    };
  }

  // State constitution with just section
  const stateSecPattern = /^([A-Z][a-z]+\.?)\s+Const\.\s*§\s*(\d+)/i;
  match = text.match(stateSecPattern);
  if (match) {
    return {
      jurisdiction: match[1],
      section: match[2],
    };
  }

  return null;
}
