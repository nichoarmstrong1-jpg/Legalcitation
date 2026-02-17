import { v4 as uuid } from 'uuid';
import type { ParsedCitation, InternetComponents, CitationContext } from '@legalcitation/shared';

/**
 * Parse an internet/electronic source citation (Rule 18).
 *
 * Format: Author, Title, Website (Date), URL [archive].
 * Example: Randy E. Barnett, What the Declaration Said, Reason (July 4, 2024), https://reason.com/... [https://perma.cc/XXXX-XXXX].
 */
export function parseInternetCitation(
  rawText: string,
  position: { start: number; end: number },
  context: CitationContext = 'citation_sentence'
): ParsedCitation | null {
  const text = rawText.trim().replace(/\.$/, '');

  const components = parseInternet(text);
  if (!components) return null;

  return {
    id: uuid(),
    rawText: rawText.trim(),
    type: 'internet',
    context,
    position,
    components,
  };
}

function parseInternet(text: string): InternetComponents | null {
  // Must contain a URL
  const urlMatch = text.match(/(https?:\/\/[^\s\]]+)/);
  if (!urlMatch) return null;

  const url = urlMatch[1];
  const urlIndex = text.indexOf(url);

  // Extract archive URL from brackets: [https://perma.cc/...]
  let archiveUrl: string | undefined;
  const archiveMatch = text.match(/\[(https?:\/\/[^\]]+)\]/);
  if (archiveMatch) {
    archiveUrl = archiveMatch[1];
  }

  // Extract "last visited" date
  let lastVisited: string | undefined;
  const lastVisitedMatch = text.match(/\(last visited\s+([^)]+)\)/);
  if (lastVisitedMatch) {
    lastVisited = lastVisitedMatch[1].trim();
  }

  // Extract publication date from parenthetical before URL
  let date: string | undefined;
  const beforeUrl = text.slice(0, urlIndex).trim().replace(/,\s*$/, '');
  const dateParenMatch = beforeUrl.match(/\(([A-Z][a-z]+\.?\s+\d{1,2},?\s+\d{4}(?:,?\s+at\s+[\d:]+\s*(?:AM|PM|ET|CT|MT|PT)?)?)\)\s*$/);
  if (dateParenMatch) {
    date = dateParenMatch[1].trim();
  }

  // Parse the text before the URL to extract author, title, website
  const beforeUrlText = beforeUrl
    .replace(/\([^)]*\)\s*$/, '')  // Remove date parenthetical
    .replace(/,\s*$/, '')
    .trim();

  // Split on commas to find segments
  const segments = beforeUrlText.split(/,\s+/);
  let author: string | undefined;
  let title: string | undefined;
  let websiteName: string | undefined;

  if (segments.length >= 3) {
    // Author, Title, Website
    author = segments[0].trim();
    title = segments.slice(1, -1).join(', ').trim();
    websiteName = segments[segments.length - 1].trim();
  } else if (segments.length === 2) {
    // Could be "Author, Title" or "Title, Website"
    // Heuristic: if first segment looks like a name (capitalized words), it's an author
    const firstSegment = segments[0].trim();
    if (/^[A-Z][a-z]+(?:\s+[A-Z]\.?)?\s+[A-Z][a-z]+/.test(firstSegment)) {
      author = firstSegment;
      title = segments[1].trim();
    } else {
      title = firstSegment;
      websiteName = segments[1].trim();
    }
  } else if (segments.length === 1) {
    title = segments[0].trim();
  }

  if (!title) return null;

  // Strip italic markers from title
  title = title.replace(/^\*|\*$/g, '').replace(/^_|_$/g, '').trim();

  return {
    author,
    title,
    websiteName,
    date,
    url,
    archiveUrl,
    lastVisited,
  };
}
