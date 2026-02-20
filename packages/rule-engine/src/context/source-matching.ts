import type {
  ParsedCitation,
  CaseComponents,
  ArticleComponents,
  BookComponents,
  CitationResource,
  ResolutionResult,
} from '@legalcitation/shared';

/**
 * Check if a citation matches a source name (for supra/infra cross-referencing).
 * Searches party names, author names, and raw text.
 *
 * When a ResolutionResult is available, first checks if the citation resolved
 * to the same resource as the source — a much more reliable check.
 */
export function matchesSource(
  citation: ParsedCitation,
  sourceName: string,
  resolution?: ResolutionResult
): boolean {
  // If resolution data is available, check if any resource matches the source name
  if (resolution && citation.resolvedResourceId) {
    const resource = resolution.resources.get(citation.resolvedResourceId);
    if (resource) {
      return resourceMatchesName(resource, sourceName);
    }
  }

  // Fall back to substring matching
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

function resourceMatchesName(resource: CitationResource, name: string): boolean {
  const lower = name.toLowerCase();
  if (resource.plaintiff?.toLowerCase().includes(lower)) return true;
  if (resource.defendant?.toLowerCase().includes(lower)) return true;
  if (resource.canonicalCitation.toLowerCase().includes(lower)) return true;
  return false;
}

/**
 * Check if two citations resolved to the same resource.
 */
export function citationsShareResource(
  citA: ParsedCitation,
  citB: ParsedCitation,
  _resolution: ResolutionResult
): boolean {
  if (!citA.resolvedResourceId || !citB.resolvedResourceId) return false;
  return citA.resolvedResourceId === citB.resolvedResourceId;
}
