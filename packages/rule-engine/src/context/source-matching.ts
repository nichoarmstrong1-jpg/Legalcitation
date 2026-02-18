import type {
  ParsedCitation,
  CaseComponents,
  ArticleComponents,
  BookComponents,
} from '@legalcitation/shared';

/**
 * Check if a citation matches a source name (for supra/infra cross-referencing).
 * Searches party names, author names, and raw text.
 */
export function matchesSource(citation: ParsedCitation, sourceName: string): boolean {
  const lower = sourceName.toLowerCase();

  if (citation.type === 'case') {
    const comp = citation.components as CaseComponents;
    if (comp.partyOne?.toLowerCase().includes(lower)) return true;
    if (comp.partyTwo?.toLowerCase().includes(lower)) return true;
  }

  if (citation.type === 'article') {
    const comp = citation.components as ArticleComponents;
    for (const author of comp.authors) {
      if (author.toLowerCase().includes(lower)) return true;
    }
  }

  if (citation.type === 'book') {
    const comp = citation.components as BookComponents;
    for (const author of comp.authors) {
      if (author.toLowerCase().includes(lower)) return true;
    }
  }

  if (citation.rawText.toLowerCase().includes(lower)) return true;

  return false;
}
