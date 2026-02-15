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
  // Pattern: Author(s), Title, Vol Journal Page (Year)
  // The tricky part is distinguishing the title from the journal.
  // The journal always has a volume number before it.

  // Try: Authors, Title, vol Journal page (year)
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

  // Parse multiple authors
  // Two authors: "John Smith & Jane Doe"
  // Three+: "John Smith, Jane Doe & Bob Jones" or "John Smith et al."
  let authors: string[];
  if (authorsStr.includes(' et al.')) {
    authors = [authorsStr.replace(/\s+et al\.?$/, '').trim()];
  } else if (authorsStr.includes(' & ')) {
    // Split on final " & " only
    const ampIndex = authorsStr.lastIndexOf(' & ');
    const before = authorsStr.slice(0, ampIndex);
    const after = authorsStr.slice(ampIndex + 3);
    // Before may contain comma-separated authors
    const beforeAuthors = before.split(/,\s*/).map(a => a.trim()).filter(Boolean);
    authors = [...beforeAuthors, after.trim()];
  } else {
    authors = [authorsStr];
  }

  return {
    authors,
    title,
    journal,
    volume,
    firstPage,
    pinCite,
    year,
    studentDesignator,
  };
}

/**
 * Common journal abbreviations (per T13 style)
 */
export const JOURNAL_ABBREVIATIONS: Record<string, string> = {
  'Harvard Law Review': 'Harv. L. Rev.',
  'Yale Law Journal': 'Yale L.J.',
  'Stanford Law Review': 'Stan. L. Rev.',
  'Columbia Law Review': 'Colum. L. Rev.',
  'Michigan Law Review': 'Mich. L. Rev.',
  'University of Pennsylvania Law Review': 'U. Pa. L. Rev.',
  'California Law Review': 'Cal. L. Rev.',
  'Georgetown Law Journal': 'Geo. L.J.',
  'New York University Law Review': 'N.Y.U. L. Rev.',
  'Virginia Law Review': 'Va. L. Rev.',
  'Duke Law Journal': 'Duke L.J.',
  'Northwestern University Law Review': 'Nw. U. L. Rev.',
  'Texas Law Review': 'Tex. L. Rev.',
  'University of Chicago Law Review': 'U. Chi. L. Rev.',
  'Minnesota Law Review': 'Minn. L. Rev.',
  'Iowa Law Review': 'Iowa L. Rev.',
  'Cornell Law Review': 'Cornell L. Rev.',
  'Vanderbilt Law Review': 'Vand. L. Rev.',
  'Boston University Law Review': 'B.U. L. Rev.',
  'Notre Dame Law Review': 'Notre Dame L. Rev.',
};
