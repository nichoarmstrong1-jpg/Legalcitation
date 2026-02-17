import { v4 as uuid } from 'uuid';
import type { ParsedCitation, UnpublishedComponents, CitationContext } from '@legalcitation/shared';

/**
 * Parse an unpublished manuscript, working paper, or dissertation citation (Rule 17).
 *
 * Formats:
 * - Manuscript:    Author, Title page (Date) (unpublished manuscript) (on file with Repository).
 * - Working paper: Author, Title page (Institution, Working Paper No. N, Year).
 * - Dissertation:  Author, Title (Date) (Ph.D. dissertation, Institution) (on file with Repository).
 */
export function parseUnpublishedCitation(
  rawText: string,
  position: { start: number; end: number },
  context: CitationContext = 'citation_sentence'
): ParsedCitation | null {
  const text = rawText.trim().replace(/\.$/, '');

  const components = parseUnpublished(text);
  if (!components) return null;

  return {
    id: uuid(),
    rawText: rawText.trim(),
    type: 'unpublished',
    context,
    position,
    components,
  };
}

function parseUnpublished(text: string): UnpublishedComponents | null {
  // Try unpublished manuscript: "Author, Title page (Date) (unpublished manuscript) (on file with ...)"
  const manuscriptPattern = /^(.+?),\s+(.+?)\s+(\d[\d–\-,\s]*)\s*\(([^)]+)\)\s*\(unpublished manuscript\)\s*(?:\(on file with\s+(.+?)\))?$/;
  let match = text.match(manuscriptPattern);
  if (match) {
    return {
      subtype: 'manuscript',
      author: match[1].trim(),
      title: match[2].trim(),
      page: match[3].trim(),
      date: match[4].trim(),
      onFileWith: match[5]?.trim(),
    };
  }

  // Manuscript without page: "Author, Title (Date) (unpublished manuscript) (on file with ...)"
  const manuscriptNoPagePattern = /^(.+?),\s+(.+?)\s*\(([^)]+)\)\s*\(unpublished manuscript\)\s*(?:\(on file with\s+(.+?)\))?$/;
  match = text.match(manuscriptNoPagePattern);
  if (match && !/\bunpublished/.test(match[3])) {
    return {
      subtype: 'manuscript',
      author: match[1].trim(),
      title: match[2].trim(),
      date: match[3].trim(),
      onFileWith: match[4]?.trim(),
    };
  }

  // Try working paper: "Author, Title page (Institution, Working Paper No. N, Year)"
  const workingPaperPattern = /^(.+?),\s+(.+?)\s+(\d[\d–\-,\s]*)\s*\(([^,]+),\s*Working Paper\s+No\.\s*(\d+),\s*(\d{4})\)$/;
  match = text.match(workingPaperPattern);
  if (match) {
    return {
      subtype: 'working_paper',
      author: match[1].trim(),
      title: match[2].trim(),
      page: match[3].trim(),
      institution: match[4].trim(),
      workingPaperNumber: match[5],
      date: match[6],
    };
  }

  // Working paper without page
  const wpNoPagePattern = /^(.+?),\s+(.+?)\s*\(([^,]+),\s*Working Paper\s+No\.\s*(\d+),\s*(\d{4})\)$/;
  match = text.match(wpNoPagePattern);
  if (match) {
    return {
      subtype: 'working_paper',
      author: match[1].trim(),
      title: match[2].trim(),
      institution: match[3].trim(),
      workingPaperNumber: match[4],
      date: match[5],
    };
  }

  // Try dissertation: "Author, Title (Date) (Ph.D. dissertation, Institution) (on file with ...)"
  const dissertationPattern = /^(.+?),\s+(.+?)\s*\(([^)]+)\)\s*\((Ph\.D\. dissertation|S\.J\.D\. dissertation|J\.S\.D\. dissertation|LL\.M\. thesis),\s+(.+?)\)\s*(?:\(on file with\s+(.+?)\))?$/;
  match = text.match(dissertationPattern);
  if (match) {
    return {
      subtype: 'dissertation',
      author: match[1].trim(),
      title: match[2].trim(),
      date: match[3].trim(),
      degree: match[4].trim(),
      institution: match[5].trim(),
      onFileWith: match[6]?.trim(),
    };
  }

  return null;
}
