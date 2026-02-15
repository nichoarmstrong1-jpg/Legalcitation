import { eq } from 'drizzle-orm';
import { tryGetDb, schema } from '../db/index.js';
import type { PageMapping } from './document-processor.js';

export interface PinpointMatchResult {
  matched: boolean;
  documentId: string;
  documentName: string;
  pages: Array<{
    pageNumber: number;
    found: boolean;
    textSnippet?: string;
  }>;
}

/**
 * Parse page numbers from a pinCite string.
 * Handles: "363", "363-65", "363, 365", "363–365", "363 n.5"
 */
function parsePinCitePages(pinCite: string, firstPage?: string): number[] {
  const pages: number[] = [];
  const cleaned = pinCite.replace(/\s*n\.\d+/g, '').trim();

  // Split by comma for non-consecutive pages
  const parts = cleaned.split(/,\s*/);

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    // Check for range (en-dash or hyphen)
    const rangeMatch = trimmed.match(/^(\d+)\s*[–\-]\s*(\d+)$/);
    if (rangeMatch) {
      const start = parseInt(rangeMatch[1], 10);
      let endStr = rangeMatch[2];

      // Handle abbreviated ranges like "363-65" → "363-365"
      if (endStr.length < rangeMatch[1].length) {
        const prefix = rangeMatch[1].slice(0, rangeMatch[1].length - endStr.length);
        endStr = prefix + endStr;
      }

      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end)) {
        for (let p = start; p <= end && p <= start + 100; p++) {
          pages.push(p);
        }
      }
    } else {
      const num = parseInt(trimmed, 10);
      if (!isNaN(num)) {
        pages.push(num);
      }
    }
  }

  // If pages look like they're reporter page numbers (e.g., 421 for "370 U.S. 421"),
  // we need to map them to PDF page numbers. Use firstPage as the anchor.
  // This is a heuristic: the PDF page for reporter page X is approximately
  // X - firstPage + 1 (assuming the PDF starts at the first page of the case)
  if (firstPage && pages.length > 0) {
    const anchor = parseInt(firstPage, 10);
    if (!isNaN(anchor)) {
      return pages.map(p => p - anchor + 1).filter(p => p > 0);
    }
  }

  return pages;
}

/**
 * Match a pinpoint citation against a case document's page mapping.
 * Returns information about which pages were found.
 */
export async function matchPinpointToDocument(
  pinCite: string,
  documentId: string,
  firstPage?: string
): Promise<PinpointMatchResult | null> {
  const db = tryGetDb();
  if (!db) return null;

  const [doc] = await db
    .select({
      id: schema.caseDocuments.id,
      fileName: schema.caseDocuments.fileName,
      caseName: schema.caseDocuments.caseName,
      pageMapping: schema.caseDocuments.pageMapping,
      pageCount: schema.caseDocuments.pageCount,
    })
    .from(schema.caseDocuments)
    .where(eq(schema.caseDocuments.id, documentId));

  if (!doc) return null;

  const pageMapping = doc.pageMapping as PageMapping[] | null;
  if (!pageMapping || pageMapping.length === 0) return null;

  const pageNumbers = parsePinCitePages(pinCite, firstPage);
  if (pageNumbers.length === 0) return null;

  const pageResults = pageNumbers.map(pageNum => {
    const page = pageMapping.find(p => p.pageNumber === pageNum);
    if (!page) {
      return { pageNumber: pageNum, found: false };
    }

    // Extract a brief text snippet from the page
    const snippet = page.text.trim().slice(0, 200).replace(/\s+/g, ' ');
    return {
      pageNumber: pageNum,
      found: true,
      textSnippet: snippet || undefined,
    };
  });

  return {
    matched: pageResults.some(p => p.found),
    documentId: doc.id,
    documentName: doc.caseName || doc.fileName,
    pages: pageResults,
  };
}
