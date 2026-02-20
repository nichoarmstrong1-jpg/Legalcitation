/**
 * Citation resolution pipeline — links short-form, supra, id, and reference
 * citations to their full-citation antecedents.
 *
 * Ported from eyecite's resolve.py algorithm.
 */
import { v4 as uuid } from 'uuid';
import type {
  ParsedCitation,
  CitationResource,
  ResolutionResult,
  CaseComponents,
  ShortFormComponents,
  ArticleComponents,
  BookComponents,
  StatuteComponents,
  ResolveFn,
} from '@legalcitation/shared';

const MAX_PIN_CITE_DISTANCE = 150;

function buildResourceFromFullCite(citation: ParsedCitation): CitationResource | null {
  if (citation.type === 'case') {
    const comp = citation.components as CaseComponents;
    return {
      id: uuid(),
      canonicalCitation: citation.rawText,
      plaintiff: comp.partyOne,
      defendant: comp.partyTwo,
      volume: comp.volume,
      reporter: comp.reporter,
      page: comp.firstPage,
      court: comp.court,
      year: comp.year,
    };
  }

  if (citation.type === 'statute') {
    const comp = citation.components as StatuteComponents;
    return {
      id: uuid(),
      canonicalCitation: citation.rawText,
      volume: comp.title,
      reporter: comp.code,
      page: comp.section,
      year: comp.year,
    };
  }

  if (citation.type === 'article') {
    const comp = citation.components as ArticleComponents;
    return {
      id: uuid(),
      canonicalCitation: citation.rawText,
      plaintiff: comp.authors[0],
      volume: comp.volume,
      reporter: comp.journal,
      page: comp.firstPage,
      year: comp.year,
    };
  }

  if (citation.type === 'book') {
    const comp = citation.components as BookComponents;
    return {
      id: uuid(),
      canonicalCitation: citation.rawText,
      plaintiff: comp.authors[0],
      year: comp.year,
    };
  }

  // For other full citation types, create a basic resource
  if (!['id', 'supra', 'infra', 'short_form'].includes(citation.type)) {
    return {
      id: uuid(),
      canonicalCitation: citation.rawText,
    };
  }

  return null;
}

function resolveShortCase(
  citation: ParsedCitation,
  resolvedFullCites: CitationResource[]
): CitationResource | null {
  const comp = citation.components as ShortFormComponents;
  if (comp.type !== 'short_case') return null;

  const partyName = comp.partyName?.toLowerCase();
  if (!partyName) return null;

  const matches = resolvedFullCites.filter(resource => {
    const plaintiff = resource.plaintiff?.toLowerCase() ?? '';
    const defendant = resource.defendant?.toLowerCase() ?? '';
    return plaintiff.includes(partyName) || defendant.includes(partyName) || partyName.includes(plaintiff) || partyName.includes(defendant);
  });

  if (matches.length === 1) return matches[0];
  return null;
}

function resolveSupraCitation(
  citation: ParsedCitation,
  resolvedFullCites: CitationResource[]
): CitationResource | null {
  const comp = citation.components as ShortFormComponents;
  const partyName = comp.partyName?.toLowerCase();
  if (!partyName) return null;

  const matches = resolvedFullCites.filter(resource => {
    const plaintiff = resource.plaintiff?.toLowerCase() ?? '';
    const defendant = resource.defendant?.toLowerCase() ?? '';
    return plaintiff.includes(partyName) || defendant.includes(partyName) || partyName.includes(plaintiff) || partyName.includes(defendant);
  });

  if (matches.length === 1) return matches[0];
  return null;
}

function resolveIdCitation(
  citation: ParsedCitation,
  lastResolution: CitationResource | null
): CitationResource | null {
  if (!lastResolution) return null;

  const comp = citation.components as ShortFormComponents;
  const pinCite = comp.pinCite;

  // Validate pin cite range — reject if > MAX_PIN_CITE_DISTANCE pages from antecedent
  if (pinCite && lastResolution.page) {
    const pinPage = parseInt(pinCite, 10);
    const basePage = parseInt(lastResolution.page, 10);
    if (!isNaN(pinPage) && !isNaN(basePage)) {
      if (Math.abs(pinPage - basePage) > MAX_PIN_CITE_DISTANCE) {
        return null;
      }
    }
  }

  // Reject if antecedent has a placeholder page (can't validate range)
  if (lastResolution.page === '') return null;

  return lastResolution;
}

export interface ResolverOptions {
  resolveFullCitation?: ResolveFn;
  resolveShortCaseCitation?: ResolveFn;
  resolveSupra?: ResolveFn;
  resolveId?: ResolveFn;
}

/**
 * Walk citations in document order and resolve short-form citations
 * to their full-citation antecedents.
 */
export function resolveCitations(
  citations: ParsedCitation[],
  options: ResolverOptions = {}
): ResolutionResult {
  const resources = new Map<string, CitationResource>();
  const citationToResource = new Map<string, string>();
  const unresolvedCitations: string[] = [];

  const resolvedFullCites: CitationResource[] = [];
  let lastResolution: CitationResource | null = null;

  for (const citation of citations) {
    let resolution: CitationResource | null = null;

    const isFullCitation = !['id', 'supra', 'infra', 'short_form'].includes(citation.type);

    if (isFullCitation) {
      // Full citation — create a resource
      if (options.resolveFullCitation) {
        resolution = options.resolveFullCitation(citation, resolvedFullCites, lastResolution);
      } else {
        resolution = buildResourceFromFullCite(citation);
      }

      if (resolution) {
        resources.set(resolution.id, resolution);
        resolvedFullCites.push(resolution);
      }
    } else if (citation.type === 'short_form') {
      // Short case citation — match by party name
      if (options.resolveShortCaseCitation) {
        resolution = options.resolveShortCaseCitation(citation, resolvedFullCites, lastResolution);
      } else {
        resolution = resolveShortCase(citation, resolvedFullCites);
      }
    } else if (citation.type === 'supra') {
      // Supra — match by party name against all preceding full citations
      if (options.resolveSupra) {
        resolution = options.resolveSupra(citation, resolvedFullCites, lastResolution);
      } else {
        resolution = resolveSupraCitation(citation, resolvedFullCites);
      }
    } else if (citation.type === 'id') {
      // Id. — resolve to most recent resolution
      if (options.resolveId) {
        resolution = options.resolveId(citation, resolvedFullCites, lastResolution);
      } else {
        resolution = resolveIdCitation(citation, lastResolution);
      }
    }
    // infra citations are forward-looking and don't resolve to antecedents

    if (resolution) {
      citationToResource.set(citation.id, resolution.id);
      citation.resolvedResourceId = resolution.id;
      lastResolution = resolution;
    } else if (!isFullCitation && citation.type !== 'infra') {
      unresolvedCitations.push(citation.id);
    }
  }

  return { resources, citationToResource, unresolvedCitations };
}
