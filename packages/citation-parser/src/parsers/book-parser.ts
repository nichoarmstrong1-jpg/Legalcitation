import { v4 as uuid } from 'uuid';
import type { ParsedCitation, BookComponents, CitationContext } from '@legalcitation/shared';

/**
 * Parse a book/treatise citation (Rule 15).
 *
 * Formats:
 * - Single-author, page:    Author, Title page (ed. year).
 * - Single-author, section: Author, Title § section (ed. year).
 * - Multi-volume:           Vol Author, Title § section (ed. year).
 * - With editor:            Author, Title page (Editor ed., year).
 */
export function parseBookCitation(
  rawText: string,
  position: { start: number; end: number },
  context: CitationContext = 'citation_sentence'
): ParsedCitation | null {
  const text = rawText.trim().replace(/\.$/, '');

  const components = parseBook(text);
  if (!components) return null;

  return {
    id: uuid(),
    rawText: rawText.trim(),
    type: 'book',
    context,
    position,
    components,
  };
}

function parseBook(text: string): BookComponents | null {
  // Try multi-volume with section: "Vol Author, Title § section (parenthetical)"
  const mvSectionPattern = /^(\d+)\s+(.+?),\s+(.+?)\s*§\s*([\d.]+(?:\([a-zA-Z0-9]+\))*)\s*(?:,\s*at\s+(\d[\d–\-,\s]*))?\s*\(([^)]+)\)$/;
  let match = text.match(mvSectionPattern);
  if (match) {
    const parenthetical = parseParenthetical(match[6]);
    return {
      authors: parseAuthors(match[2].trim()),
      title: match[3].trim(),
      volume: match[1],
      section: match[4],
      pinCite: match[5]?.trim(),
      ...parenthetical,
    };
  }

  // Try single-author with section: "Author, Title § section (parenthetical)"
  const sectionPattern = /^(.+?),\s+(.+?)\s*§\s*([\d.]+(?:\([a-zA-Z0-9]+\))*)\s*(?:,\s*at\s+(\d[\d–\-,\s]*))?\s*\(([^)]+)\)$/;
  match = text.match(sectionPattern);
  if (match) {
    const parenthetical = parseParenthetical(match[5]);
    return {
      authors: parseAuthors(match[1].trim()),
      title: match[2].trim(),
      section: match[3],
      pinCite: match[4]?.trim(),
      ...parenthetical,
    };
  }

  // Try multi-volume with page: "Vol Author, Title page (parenthetical)"
  const mvPagePattern = /^(\d+)\s+(.+?),\s+(.+?)\s+(\d+(?:\s*[–\-]\s*\d+)?)\s*\(([^)]+)\)$/;
  match = text.match(mvPagePattern);
  if (match) {
    const parenthetical = parseParenthetical(match[5]);
    return {
      authors: parseAuthors(match[2].trim()),
      title: match[3].trim(),
      volume: match[1],
      page: match[4].trim(),
      ...parenthetical,
    };
  }

  // Try single-author with page: "Author, Title page (parenthetical)"
  const pagePattern = /^(.+?),\s+(.+?)\s+(\d+(?:\s*[–\-]\s*\d+)?)\s*\(([^)]+)\)$/;
  match = text.match(pagePattern);
  if (match) {
    // Distinguish from articles: articles have a volume number before journal abbreviation
    // Books typically don't have a numeric volume directly before a journal-like string
    const candidateTitle = match[2].trim();
    // If the "title" starts with a number followed by a journal abbreviation, this is likely an article
    if (/^\d+\s+[A-Z][a-zA-Z.]+\s+[A-Z]/.test(candidateTitle)) return null;

    const parenthetical = parseParenthetical(match[4]);
    return {
      authors: parseAuthors(match[1].trim()),
      title: candidateTitle,
      page: match[3].trim(),
      ...parenthetical,
    };
  }

  return null;
}

function parseAuthors(authorsStr: string): string[] {
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

interface ParentheticalResult {
  edition?: string;
  publisher?: string;
  editor?: string;
  translator?: string;
  year: string;
}

function parseParenthetical(paren: string): ParentheticalResult {
  const result: ParentheticalResult = { year: '' };

  // Extract year (always last 4-digit number)
  const yearMatch = paren.match(/(\d{4})/);
  if (yearMatch) {
    result.year = yearMatch[1];
  }

  // Extract edition: "Nth ed."
  const edMatch = paren.match(/(\d+(?:st|nd|rd|th)\s+ed\.)/);
  if (edMatch) {
    result.edition = edMatch[1];
  }

  // Extract translator: "Name trans.,"
  const transMatch = paren.match(/(.+?)\s+trans\./);
  if (transMatch) {
    result.translator = transMatch[1].trim();
  }

  // Extract editor: "Name ed.," (but not "Nth ed.")
  const editorMatch = paren.match(/(.+?)\s+ed\.,/);
  if (editorMatch && !/\d+(?:st|nd|rd|th)/.test(editorMatch[1])) {
    result.editor = editorMatch[1].trim();
  }

  // Extract publisher: text before "ed." or year that isn't editor/translator/edition
  const remaining = paren
    .replace(/\d{4}/, '')
    .replace(/\d+(?:st|nd|rd|th)\s+ed\./, '')
    .replace(/.+?\s+trans\./, '')
    .replace(/.+?\s+ed\.,/, '')
    .replace(/,\s*/g, '')
    .trim();
  if (remaining && remaining.length > 1) {
    result.publisher = remaining;
  }

  return result;
}
