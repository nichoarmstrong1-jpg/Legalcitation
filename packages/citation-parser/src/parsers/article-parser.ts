import { v4 as uuid } from 'uuid';
import type { ParsedCitation, ArticleComponents, CitationContext } from '@legalcitation/shared';

/**
 * Parse a law review / journal article citation (Rule 16).
 *
 * Format: Author(s), Title, Vol Journal Page (Year)
 *
 * Example: John Smith, The Future of Privacy, 120 Harv. L. Rev. 100 (2023).
 */
export function parseArticleCitation(
  rawText: string,
  position: { start: number; end: number },
  context: CitationContext = 'citation_sentence'
): ParsedCitation | null {
  const text = rawText.trim();

  const components = parseArticle(text);
  if (!components) return null;

  return {
    id: uuid(),
    rawText: text,
    type: 'article',
    context,
    position,
    components,
  };
}

function parseArticle(text: string): ArticleComponents | null {
  // Try forthcoming pattern first: Authors, Title, [Vol] Journal (forthcoming Month Year)
  const forthcomingPattern = /^(.+?),\s+(.+?),\s+(?:(\d{1,4})\s+)?([A-Z][^\d]+?)\s*\(forthcoming\s+(.+?)\)\s*\.?$/;
  const forthMatch = text.match(forthcomingPattern);
  if (forthMatch) {
    const authorsStr = forthMatch[1].trim();
    const title = forthMatch[2].trim();
    const volume = forthMatch[3] || '';
    const journal = forthMatch[4].trim();
    const forthcomingDate = forthMatch[5].trim();
    const yearMatch = forthcomingDate.match(/(\d{4})/);

    return {
      authors: parseArticleAuthors(authorsStr),
      title,
      journal,
      volume,
      firstPage: '',
      year: '',
      forthcoming: true,
      forthcomingYear: yearMatch ? yearMatch[1] : forthcomingDate,
    };
  }

  // Standard pattern: Authors, Title, vol Journal page (year)
  const pattern = /^(.+?),\s+(.+?),\s+(\d{1,4})\s+([A-Z][^\d]+?)\s+(\d+)(?:,\s*(\d[\d–\-,\s]*))?(?:\s*\((\d{4})\))?\s*\.?$/;
  const match = text.match(pattern);
  if (!match) return null;

  const authorsStr = match[1].trim();
  let title = match[2].trim();
  const volume = match[3];
  const journal = match[4].trim();
  const firstPage = match[5];
  const pinCite = match[6]?.trim();
  const year = match[7] || '';

  // Detect student-written piece designators (Note, Comment, Recent Development)
  let studentDesignator: string | undefined;
  const studentMatch = title.match(/^(Note|Comment|Recent Development|Book Review|Essay|Symposium),?\s+/);
  if (studentMatch) {
    studentDesignator = studentMatch[1];
    title = title.slice(studentMatch[0].length);
  }

  return {
    authors: parseArticleAuthors(authorsStr),
    title,
    journal,
    volume,
    firstPage,
    pinCite,
    year,
    studentDesignator,
  };
}

function parseArticleAuthors(authorsStr: string): string[] {
  if (authorsStr.includes(' et al.')) {
    return [authorsStr.replace(/\s+et al\.?$/, '').trim()];
  }
  if (authorsStr.includes(' & ')) {
    const ampIndex = authorsStr.lastIndexOf(' & ');
    const before = authorsStr.slice(0, ampIndex);
    const after = authorsStr.slice(ampIndex + 3);
    const beforeAuthors = before.split(/,\s*/).map(a => a.trim()).filter(Boolean);
    return [...beforeAuthors, after.trim()];
  }
  return [authorsStr];
}
