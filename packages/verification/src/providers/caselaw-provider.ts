import type { CaseComponents, VerificationStatus, CitationDiscrepancy } from '@legalcitation/shared';

const CASELAW_BASE = 'https://api.case.law/v1';
const CASELAW_BASE_ALT = 'https://static.case.law/api/v1';

export interface CaselawResult {
  status: VerificationStatus;
  discrepancies: CitationDiscrepancy[];
  caseName?: string;
  citation?: string;
  logicTrace: string[];
}

/**
 * Verify a case citation using the Harvard Caselaw Access Project API.
 * Free API with rate limits; no key needed for basic metadata.
 */
export async function verifyWithCaselaw(
  components: CaseComponents
): Promise<CaselawResult> {
  const trace: string[] = [];
  const discrepancies: CitationDiscrepancy[] = [];

  try {
    trace.push('Searching case.law (Harvard Caselaw Access Project)...');

    const searchUrl = new URL(`${CASELAW_BASE}/cases/`);
    const caseName = components.partyTwo
      ? `${components.partyOne} v. ${components.partyTwo}`
      : components.partyOne;

    searchUrl.searchParams.set('search', caseName);
    if (components.year) {
      searchUrl.searchParams.set('decision_date_min', `${components.year}-01-01`);
      searchUrl.searchParams.set('decision_date_max', `${components.year}-12-31`);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(searchUrl.toString(), {
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      trace.push(`case.law API returned ${response.status}`);
      return { status: 'error', discrepancies: [], logicTrace: trace };
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      trace.push('case.law API returned non-JSON response (API may have changed).');
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

    trace.push('Case found but citation details could not be confirmed.');
    return {
      status: 'partial_match',
      discrepancies,
      caseName: data.results[0]?.name_abbreviation,
      logicTrace: trace,
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[caselaw-provider] verifyWithCaselaw error:', message, error);
    trace.push('Harvard Caselaw Access Project search could not be completed at this time.');
    return { status: 'error', discrepancies: [], logicTrace: trace };
  }
}
