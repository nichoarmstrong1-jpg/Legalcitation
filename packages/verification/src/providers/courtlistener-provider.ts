import type { CaseComponents, VerificationStatus, CitationDiscrepancy, ReferenceExample } from '@legalcitation/shared';
import { caseNamesOverlap } from '../utils.js';

const COURTLISTENER_V4_BASE = 'https://www.courtlistener.com/api/rest/v4';
const MAX_TEXT_LENGTH = 64000;
const REQUEST_TIMEOUT_MS = 15000;
const BULK_REQUEST_TIMEOUT_MS = 30000;

// --- CourtListener v4 API response types ---

export interface CitationLookupResult {
  citation: string;
  normalized_citations: string[];
  start_index: number;
  end_index: number;
  /** 200=found, 404=not found, 400=invalid reporter, 300=ambiguous, 429=per-request limit */
  status: number;
  error_message: string;
  clusters: ClusterObject[];
}

export interface ClusterObject {
  id: number;
  resource_uri?: string;
  case_name: string;
  case_name_short: string;
  case_name_full: string;
  date_filed: string;
  citations: Array<{
    volume: number;
    reporter: string;
    page: string;
    type: number;
  }>;
  docket: string;
  absolute_url: string;
  judges: string;
  sub_opinions: string[];
}

export interface SearchHit {
  caseName: string;
  citations: string[];
  court: string;
  courtId: string;
  dateFiled: string;
  snippet: string;
  clusterId: number;
  absoluteUrl: string;
}

export interface VerificationResult {
  status: VerificationStatus;
  discrepancies: CitationDiscrepancy[];
  referenceExamples: ReferenceExample[];
  verifiedCitation?: string;
  logicTrace: string[];
}

// --- Auth ---

function getAuthHeaders(): Record<string, string> {
  const token = process.env.COURTLISTENER_API_TOKEN;
  const headers: Record<string, string> = { 'Accept': 'application/json' };
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }
  return headers;
}

function hasToken(): boolean {
  return Boolean(process.env.COURTLISTENER_API_TOKEN);
}

// --- Single citation lookup by volume/reporter/page ---

export async function lookupCitation(
  volume: string,
  reporter: string,
  page: string,
): Promise<CitationLookupResult | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    const body = new URLSearchParams();
    body.set('volume', volume);
    body.set('reporter', reporter);
    body.set('page', page);

    const response = await fetch(`${COURTLISTENER_V4_BASE}/citation-lookup/`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (response.status === 429) {
      const data = await response.json().catch(() => null) as { wait_until?: string } | null;
      console.warn('[courtlistener-v4] Rate limited. Retry after:', data?.wait_until);
      return null;
    }

    if (!response.ok) {
      console.error('[courtlistener-v4] lookupCitation HTTP', response.status);
      return null;
    }

    const data = await response.json() as CitationLookupResult[];
    return data.length > 0 ? data[0] : null;
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    if (msg.includes('aborted') || msg.includes('AbortError')) {
      console.error('[courtlistener-v4] lookupCitation timed out');
    } else {
      console.error('[courtlistener-v4] lookupCitation error:', msg);
    }
    return null;
  }
}

// --- Bulk text lookup (handles chunking + pagination) ---

export async function lookupCitationsInText(
  text: string,
): Promise<CitationLookupResult[]> {
  if (!text.trim()) return [];

  const chunks = splitTextIntoChunks(text, MAX_TEXT_LENGTH);
  const allResults: CitationLookupResult[] = [];
  let globalOffset = 0;

  for (const chunk of chunks) {
    const chunkResults = await fetchChunkCitations(chunk);
    for (const result of chunkResults) {
      if (globalOffset > 0) {
        result.start_index += globalOffset;
        result.end_index += globalOffset;
      }
      allResults.push(result);
    }
    globalOffset += chunk.length;
  }

  return allResults;
}

/**
 * Fetch citations for a single chunk (<=64K chars).
 * Handles CourtListener's per-request 250-citation limit by paginating
 * via start_index of the first throttled citation.
 */
async function fetchChunkCitations(
  text: string,
): Promise<CitationLookupResult[]> {
  const allResults: CitationLookupResult[] = [];
  let currentText = text;
  let cumulativeOffset = 0;

  while (currentText.length > 0) {
    const batch = await postCitationLookup(currentText);
    if (batch.length === 0) break;

    const lookedUp = batch.filter(r => r.status !== 429);
    const throttled = batch.filter(r => r.status === 429);

    for (const result of lookedUp) {
      if (cumulativeOffset > 0) {
        result.start_index += cumulativeOffset;
        result.end_index += cumulativeOffset;
      }
      allResults.push(result);
    }

    if (throttled.length === 0) break;

    const nextStart = throttled[0].start_index;
    if (nextStart <= 0) break;

    cumulativeOffset += nextStart;
    currentText = currentText.slice(nextStart);
  }

  return allResults;
}

async function postCitationLookup(
  text: string,
): Promise<CitationLookupResult[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), BULK_REQUEST_TIMEOUT_MS);

    const body = new URLSearchParams();
    body.set('text', text);

    const response = await fetch(`${COURTLISTENER_V4_BASE}/citation-lookup/`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (response.status === 429) {
      const data = await response.json().catch(() => null) as { wait_until?: string } | null;
      console.warn('[courtlistener-v4] Bulk lookup rate limited. Retry after:', data?.wait_until);
      return [];
    }

    if (!response.ok) {
      console.error('[courtlistener-v4] postCitationLookup HTTP', response.status);
      return [];
    }

    return await response.json() as CitationLookupResult[];
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    if (msg.includes('aborted') || msg.includes('AbortError')) {
      console.error('[courtlistener-v4] postCitationLookup timed out');
    } else {
      console.error('[courtlistener-v4] postCitationLookup error:', msg);
    }
    return [];
  }
}

// --- Search API: find cases by name ---

export async function searchCourtListenerCases(
  query: string,
  court?: string,
): Promise<SearchHit[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    const searchUrl = new URL(`${COURTLISTENER_V4_BASE}/search/`);
    searchUrl.searchParams.set('q', query);
    searchUrl.searchParams.set('type', 'o');
    if (court) {
      searchUrl.searchParams.set('court', court);
    }

    const response = await fetch(searchUrl.toString(), {
      headers: getAuthHeaders(),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      console.error('[courtlistener-v4] searchCases HTTP', response.status);
      return [];
    }

    const data = await response.json() as {
      next: string | null;
      previous: string | null;
      results: Array<Record<string, unknown>>;
    };

    return (data.results || []).slice(0, 10).map(mapSearchResult);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[courtlistener-v4] searchCases error:', msg);
    return [];
  }
}

function mapSearchResult(r: Record<string, unknown>): SearchHit {
  return {
    caseName: (r.caseName ?? r.case_name ?? '') as string,
    citations: Array.isArray(r.citation) ? r.citation as string[] : [],
    court: (r.court ?? '') as string,
    courtId: (r.court_id ?? '') as string,
    dateFiled: (r.dateFiled ?? r.date_filed ?? '') as string,
    snippet: (r.snippet ?? '') as string,
    clusterId: (r.cluster_id ?? r.id ?? 0) as number,
    absoluteUrl: (r.absolute_url ?? '') as string,
  };
}

// --- Backward-compatible verifyWithCourtListener ---

export async function verifyWithCourtListener(
  components: CaseComponents,
): Promise<VerificationResult> {
  const trace: string[] = [];
  const discrepancies: CitationDiscrepancy[] = [];

  try {
    const caseName = components.partyTwo
      ? `${components.partyOne} v. ${components.partyTwo}`
      : components.partyOne;

    // Direct citation lookup when we have volume/reporter/page
    if (components.volume && components.reporter && components.firstPage) {
      const targetCite = `${components.volume} ${components.reporter} ${components.firstPage}`;
      trace.push(`Looking up ${targetCite} in CourtListener...`);

      const result = await lookupCitation(
        components.volume,
        components.reporter,
        components.firstPage,
      );

      if (!result) {
        trace.push('CourtListener lookup could not be completed at this time.');
        return { status: 'error', discrepancies: [], referenceExamples: [], logicTrace: trace };
      }

      if (result.status === 200 && result.clusters.length > 0) {
        return handleVerifiedCluster(result, caseName, components, trace, discrepancies);
      }

      if (result.status === 404) {
        trace.push(`Citation ${targetCite} not found in CourtListener database.`);
        return { status: 'not_found', discrepancies: [], referenceExamples: [], logicTrace: trace };
      }

      if (result.status === 300 && result.clusters.length > 1) {
        trace.push('Ambiguous citation: matches multiple cases in CourtListener.');
        const cluster = result.clusters[0];
        return {
          status: 'partial_match',
          discrepancies: [],
          referenceExamples: [],
          verifiedCitation: cluster.case_name
            ? `*${cluster.case_name}* (ambiguous — see CourtListener for disambiguation)`
            : undefined,
          logicTrace: trace,
        };
      }

      if (result.status === 400) {
        trace.push('CourtListener did not recognize the reporter abbreviation in this citation.');
        return { status: 'error', discrepancies: [], referenceExamples: [], logicTrace: trace };
      }

      trace.push('CourtListener could not verify this citation.');
      return { status: 'not_found', discrepancies: [], referenceExamples: [], logicTrace: trace };
    }

    // No volume/reporter/page — fall back to search by case name
    trace.push(`Searching CourtListener for "${caseName}"...`);
    const searchResults = await searchCourtListenerCases(
      caseName + (components.year ? ` ${components.year}` : ''),
    );

    if (searchResults.length === 0) {
      trace.push('No matching cases found in CourtListener.');
      return { status: 'not_found', discrepancies: [], referenceExamples: [], logicTrace: trace };
    }

    const match = searchResults.find(r => caseNamesOverlap(caseName, r.caseName));
    if (match) {
      trace.push(`Found: ${match.caseName}`);
      return {
        status: 'partial_match',
        discrepancies: [],
        referenceExamples: [],
        verifiedCitation: match.citations.length > 0
          ? `*${match.caseName}*, ${match.citations[0]}`
          : `*${match.caseName}*`,
        logicTrace: trace,
      };
    }

    trace.push('Cases found in CourtListener do not match the input case name.');
    return { status: 'not_found', discrepancies: [], referenceExamples: [], logicTrace: trace };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[courtlistener-v4] verifyWithCourtListener error:', message, error);
    trace.push('CourtListener verification could not be completed at this time.');
    return { status: 'error', discrepancies: [], referenceExamples: [], logicTrace: trace };
  }
}

function handleVerifiedCluster(
  result: CitationLookupResult,
  caseName: string,
  components: CaseComponents,
  trace: string[],
  discrepancies: CitationDiscrepancy[],
): VerificationResult {
  const cluster = result.clusters[0];
  const targetCite = `${components.volume} ${components.reporter} ${components.firstPage}`;

  trace.push(`Case found: ${cluster.case_name}`);

  // Check for normalized citation corrections (typos in reporter abbreviation)
  if (
    result.normalized_citations.length > 0 &&
    !result.normalized_citations.includes(targetCite)
  ) {
    trace.push(`Note: Citation normalized to "${result.normalized_citations[0]}".`);
    discrepancies.push({
      component: 'reporter citation',
      userValue: targetCite,
      verifiedValue: result.normalized_citations[0],
    });
  }

  // Guard: reject results where the case name has no overlap
  if (cluster.case_name && !caseNamesOverlap(caseName, cluster.case_name)) {
    trace.push(
      `Case name mismatch: the citation at ${targetCite} belongs to "${cluster.case_name}", not "${caseName}".`,
    );
    return {
      status: 'partial_match',
      discrepancies: [{
        component: 'case name',
        userValue: caseName,
        verifiedValue: cluster.case_name,
      }],
      referenceExamples: [],
      logicTrace: trace,
    };
  }

  if (cluster.case_name && cluster.case_name !== caseName) {
    discrepancies.push({
      component: 'case name',
      userValue: caseName,
      verifiedValue: cluster.case_name,
    });
  }

  // Check year
  const decidedYear = cluster.date_filed?.split('-')[0];
  if (decidedYear && components.year && decidedYear !== components.year) {
    discrepancies.push({
      component: 'year',
      userValue: components.year,
      verifiedValue: decidedYear,
    });
  }

  const courtPart = components.court ? `${components.court} ` : '';
  const yearPart = decidedYear || components.year;
  const verifiedCite = `*${cluster.case_name || caseName}*, ${targetCite} (${courtPart}${yearPart}).`;

  trace.push('Citation verified in CourtListener database.');

  return {
    status: 'verified',
    discrepancies,
    referenceExamples: [],
    verifiedCitation: verifiedCite,
    logicTrace: trace,
  };
}

// --- Utility ---

function splitTextIntoChunks(text: string, maxLength: number): string[] {
  if (text.length <= maxLength) return [text];

  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    let end = Math.min(start + maxLength, text.length);

    if (end < text.length) {
      const windowStart = start + Math.floor(maxLength * 0.8);
      const searchWindow = text.slice(windowStart, end);
      const lastSentenceEnd = searchWindow.lastIndexOf('. ');
      const lastNewline = searchWindow.lastIndexOf('\n');
      const bestBreak = Math.max(lastSentenceEnd, lastNewline);
      if (bestBreak >= 0) {
        end = windowStart + bestBreak + 1;
      }
    }

    chunks.push(text.slice(start, end));
    start = end;
  }

  return chunks;
}

export { hasToken as hasCourtListenerToken };
