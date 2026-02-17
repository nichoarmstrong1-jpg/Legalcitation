import type { CaseComponents, VerificationStatus, CitationDiscrepancy, ReferenceExample } from '@legalcitation/shared';
import { caseNamesOverlap } from '../utils.js';

const COURTLISTENER_BASE = 'https://www.courtlistener.com/api/rest/v3';

export interface VerificationResult {
  status: VerificationStatus;
  discrepancies: CitationDiscrepancy[];
  referenceExamples: ReferenceExample[];
  verifiedCitation?: string;
  logicTrace: string[];
}

/**
 * Verify a case citation using the CourtListener API (free, no key required).
 */
export async function verifyWithCourtListener(
  components: CaseComponents
): Promise<VerificationResult> {
  const trace: string[] = [];
  const discrepancies: CitationDiscrepancy[] = [];

  try {
    // Build search query from party names
    const caseName = components.partyTwo
      ? `${components.partyOne} v. ${components.partyTwo}`
      : components.partyOne;

    trace.push(`Searching CourtListener for "${caseName}"...`);

    // Search by case name
    const searchUrl = new URL(`${COURTLISTENER_BASE}/search/`);
    searchUrl.searchParams.set('q', caseName);
    searchUrl.searchParams.set('type', 'o'); // opinions
    if (components.year) {
      searchUrl.searchParams.set('filed_after', `${components.year}-01-01`);
      searchUrl.searchParams.set('filed_before', `${components.year}-12-31`);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const response = await fetch(searchUrl.toString(), {
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      trace.push(`CourtListener API returned ${response.status}`);
      return {
        status: 'error',
        discrepancies: [],
        referenceExamples: [],
        logicTrace: trace,
      };
    }

    const data = await response.json() as {
      count: number;
      results: Array<{
        caseName: string;
        citation: string[];
        court: string;
        dateFiled: string;
        absoluteUrl: string;
      }>;
    };

    if (data.count === 0) {
      trace.push('No matching cases found in CourtListener.');
      return {
        status: 'not_found',
        discrepancies: [],
        referenceExamples: [],
        logicTrace: trace,
      };
    }

    trace.push(`Found ${data.count} potential matches.`);

    // Try to find a match by reporter citation
    const targetCite = `${components.volume} ${components.reporter} ${components.firstPage}`;
    const exactMatch = data.results.find(r =>
      r.citation?.some(c => c.includes(targetCite))
    );

    if (exactMatch) {
      trace.push(`Exact match found: ${exactMatch.caseName}`);
      trace.push(`Reporter citation verified: ${targetCite}`);

      // Check for discrepancies
      if (exactMatch.caseName && !caseName.includes(exactMatch.caseName.split(' v. ')[0])) {
        discrepancies.push({
          component: 'case name',
          userValue: caseName,
          verifiedValue: exactMatch.caseName,
        });
      }

      return {
        status: 'verified',
        discrepancies,
        referenceExamples: [],
        verifiedCitation: `*${exactMatch.caseName}*, ${targetCite} (${components.court ? components.court + ' ' : ''}${components.year}).`,
        logicTrace: trace,
      };
    }

    // Partial match — found cases but citation details differ
    // Guard: only return partial match if case names have meaningful overlap
    const bestMatch = data.results[0];
    if (bestMatch.caseName && !caseNamesOverlap(caseName, bestMatch.caseName)) {
      trace.push('Cases found in CourtListener do not match the input case name.');
      return {
        status: 'not_found',
        discrepancies: [],
        referenceExamples: [],
        logicTrace: trace,
      };
    }

    trace.push(`Partial match: ${bestMatch.caseName}`);
    trace.push('Citation details may differ from user input.');

    return {
      status: 'partial_match',
      discrepancies,
      referenceExamples: [],
      verifiedCitation: bestMatch.caseName
        ? `*${bestMatch.caseName}* (see CourtListener for full citation)`
        : undefined,
      logicTrace: trace,
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[courtlistener-provider] verifyWithCourtListener error:', message, error);
    trace.push('CourtListener search could not be completed at this time.');
    return {
      status: 'error',
      discrepancies: [],
      referenceExamples: [],
      logicTrace: trace,
    };
  }
}
