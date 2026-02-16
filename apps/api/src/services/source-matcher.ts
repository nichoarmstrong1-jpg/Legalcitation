import type { ParsedCitation, CaseComponents } from '@legalcitation/shared';

interface SourceDocument {
  id: string;
  fileName: string;
  caseName: string | null;
  citation: string | null;
  extractedText: string;
}

export interface SourceMatchResult {
  documentId: string;
  confidence: number;
  matchMethod: 'case_name' | 'citation_string' | 'filename';
}

function normalizePartyName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function matchByCaseName(
  components: CaseComponents,
  doc: SourceDocument
): number {
  if (!doc.caseName) return 0;

  const docName = normalizePartyName(doc.caseName);
  const partyOne = normalizePartyName(components.partyOne);
  const partyTwo = components.partyTwo ? normalizePartyName(components.partyTwo) : '';

  // Exact case name match
  if (partyTwo) {
    const fullName = `${partyOne} v ${partyTwo}`;
    if (docName.includes(fullName)) return 1.0;
  }

  // Both party names appear in the document case name
  if (partyOne && partyTwo && docName.includes(partyOne) && docName.includes(partyTwo)) {
    return 0.9;
  }

  // First party name match (common in short forms)
  if (partyOne && docName.includes(partyOne)) {
    return 0.6;
  }

  return 0;
}

function matchByCitationString(
  components: CaseComponents,
  doc: SourceDocument
): number {
  if (!doc.citation) return 0;

  const docCitation = doc.citation.toLowerCase().replace(/\s+/g, ' ');

  // Try matching volume + reporter + page
  if (components.volume && components.reporter && components.firstPage) {
    const pattern = `${components.volume} ${components.reporter.toLowerCase()} ${components.firstPage}`;
    if (docCitation.includes(pattern)) return 0.95;
  }

  // Try matching just volume + reporter
  if (components.volume && components.reporter) {
    const pattern = `${components.volume} ${components.reporter.toLowerCase()}`;
    if (docCitation.includes(pattern)) return 0.7;
  }

  return 0;
}

function matchByFilename(
  components: CaseComponents,
  doc: SourceDocument
): number {
  const fileName = normalizePartyName(doc.fileName.replace(/\.[^.]+$/, ''));
  const partyOne = normalizePartyName(components.partyOne);
  const partyTwo = components.partyTwo ? normalizePartyName(components.partyTwo) : '';

  if (partyOne && partyTwo && fileName.includes(partyOne) && fileName.includes(partyTwo)) {
    return 0.7;
  }

  if (partyOne && fileName.includes(partyOne)) {
    return 0.4;
  }

  return 0;
}

export function matchCitationToSource(
  parsedCitation: ParsedCitation,
  sourceDocuments: SourceDocument[]
): SourceMatchResult | null {
  if (parsedCitation.type !== 'case') return null;

  const components = parsedCitation.components as CaseComponents;
  let bestMatch: SourceMatchResult | null = null;

  for (const doc of sourceDocuments) {
    // Try each matching strategy in order of reliability
    const caseNameScore = matchByCaseName(components, doc);
    if (caseNameScore > (bestMatch?.confidence ?? 0)) {
      bestMatch = { documentId: doc.id, confidence: caseNameScore, matchMethod: 'case_name' };
    }

    const citationScore = matchByCitationString(components, doc);
    if (citationScore > (bestMatch?.confidence ?? 0)) {
      bestMatch = { documentId: doc.id, confidence: citationScore, matchMethod: 'citation_string' };
    }

    const filenameScore = matchByFilename(components, doc);
    if (filenameScore > (bestMatch?.confidence ?? 0)) {
      bestMatch = { documentId: doc.id, confidence: filenameScore, matchMethod: 'filename' };
    }
  }

  // Require minimum confidence of 0.4 to count as a match
  if (bestMatch && bestMatch.confidence >= 0.4) {
    return bestMatch;
  }

  return null;
}
