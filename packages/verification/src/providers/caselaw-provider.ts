import type { CaseComponents, VerificationStatus, CitationDiscrepancy } from '@legalcitation/shared';
import { caseNamesOverlap } from '../utils.js';

const CASELAW_URLS = [
  'https://api.case.law/v1',
  'https://static.case.law/api/v1',
];

export interface CaselawResult {
  status: VerificationStatus;
  discrepancies: CitationDiscrepancy[];
  caseName?: string;
  citation?: string;
  logicTrace: string[];
}

/**
 * Attempt a fetch against a given base URL. Returns the Response or null on failure.
 */
async function tryFetch(baseUrl: string, caseName: string, year: string | undefined): Promise<Response | null> {
  try {
    const searchUrl = new URL(`${baseUrl}/cases/`);
    searchUrl.searchParams.set('search', caseName);
    if (year) {
      searchUrl.searchParams.set('decision_date_min', `${year}-01-01`);
      searchUrl.searchParams.set('decision_date_max', `${year}-12-31`);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(searchUrl.toString(), {
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) return null;

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) return null;

    return response;
  } catch {
    return null;
  }
}

/**
 * Verify a case citation using the Harvard Caselaw Access Project API.
 * Free API with rate limits; no key needed for basic metadata.
 * Tries the primary URL first, then falls back to the alternate URL.
 */
export async function verifyWithCaselaw(
  components: CaseComponents
): Promise<CaselawResult> {
  const trace: string[] = [];
  const discrepancies: CitationDiscrepancy[] = [];

  try {
    trace.push('Searching case.law (Harvard Caselaw Access Project)...');

    const caseName = components.partyTwo
      ? `${components.partyOne} v. ${components.partyTwo}`
      : components.partyOne;

    // Try each URL until one succeeds
    let response: Response | null = null;
    for (const baseUrl of CASELAW_URLS) {
      response = await tryFetch(baseUrl, caseName, components.year);
      if (response) break;
    }

    if (!response) {
      trace.push('case.law API is currently unavailable.');
      return { status: 'error', discrepancies: [], logicTrace: trace };
    }

    const data = await response.json() as {
      count: number;
      results: Array<{
        name: string;
        name_abbreviation: string;
        citations: Array<{ cite: string; type: string }>;
        decision_date: string;
        court: { name: string; slug: string };
      }>;
    };

    if (data.count === 0) {
      trace.push('No matching cases found in case.law.');
      return { status: 'not_found', discrepancies: [], logicTrace: trace };
    }

    const targetCite = `${components.volume} ${components.reporter} ${components.firstPage}`;
    trace.push(`Found ${data.count} matches. Looking for "${targetCite}"...`);

    // Check each result for matching citation
    for (const result of data.results.slice(0, 10)) {
      const citationMatch = result.citations?.find(c => c.cite === targetCite);
      if (citationMatch) {
        trace.push(`Verified: ${result.name_abbreviation || result.name}`);

        // Check case name
        if (result.name_abbreviation && result.name_abbreviation !== caseName) {
          discrepancies.push({
            component: 'case name',
            userValue: caseName,
            verifiedValue: result.name_abbreviation,
          });
        }

        // Check year
        const decidedYear = result.decision_date?.split('-')[0];
        if (decidedYear && decidedYear !== components.year) {
          discrepancies.push({
            component: 'year',
            userValue: components.year,
            verifiedValue: decidedYear,
          });
        }

        return {
          status: 'verified',
          discrepancies,
          caseName: result.name_abbreviation || result.name,
          citation: citationMatch.cite,
          logicTrace: trace,
        };
      }
    }

    // Guard: verify the first result actually matches the user's case name
    const topResult = data.results[0];
    if (topResult?.name_abbreviation && !caseNamesOverlap(caseName, topResult.name_abbreviation)) {
      trace.push('Cases found but none match the input case name.');
      return { status: 'not_found', discrepancies: [], logicTrace: trace };
    }

    trace.push('Case found but citation details could not be confirmed.');
    return {
      status: 'partial_match',
      discrepancies,
      caseName: topResult?.name_abbreviation,
      logicTrace: trace,
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[caselaw-provider] verifyWithCaselaw error:', message, error);
    trace.push('Harvard Caselaw Access Project search could not be completed at this time.');
    return { status: 'error', discrepancies: [], logicTrace: trace };
  }
}
