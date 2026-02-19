import type { CaseComponents } from '@legalcitation/shared';
import type { CaseSearchResult } from './providers/claude-provider.js';
import { verifyWithCourtListener } from './providers/courtlistener-provider.js';
import { verifyWithCaselaw } from './providers/caselaw-provider.js';

const VERIFICATION_TIMEOUT_MS = 8000;

function abortAfter(ms: number): AbortSignal {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
}

function extractParties(caseName: string): { partyOne: string; partyTwo: string } {
  const vMatch = caseName.match(/^(.+?)\s+v\.?\s+(.+)$/i);
  if (vMatch) {
    return {
      partyOne: vMatch[1].trim().replace(/^\*+|\*+$/g, ''),
      partyTwo: vMatch[2].trim().replace(/^\*+|\*+$/g, ''),
    };
  }
  return { partyOne: caseName.replace(/^\*+|\*+$/g, ''), partyTwo: '' };
}

async function checkJustia(volume: string, firstPage: string, reporter: string): Promise<{ found: boolean; url?: string }> {
  try {
    if (reporter === 'U.S.') {
      const url = `https://supreme.justia.com/cases/federal/us/${volume}/${firstPage}/`;
      const res = await fetch(url, { method: 'HEAD', signal: abortAfter(VERIFICATION_TIMEOUT_MS) });
      if (res.ok) return { found: true, url };
    }

    if (reporter === 'S. Ct.' || reporter === 'U.S.') {
      const url = `https://www.justia.com/search?q=${volume}+${encodeURIComponent(reporter)}+${firstPage}`;
      const res = await fetch(url, { signal: abortAfter(VERIFICATION_TIMEOUT_MS) });
      if (res.ok) {
        const text = await res.text();
        if (text.includes(volume) && text.includes(firstPage)) return { found: true, url };
      }
    }
  } catch {
    // Timeout or network error
  }
  return { found: false };
}

async function checkCornellLII(volume: string, firstPage: string, reporter: string): Promise<{ found: boolean; url?: string }> {
  try {
    if (reporter === 'U.S.') {
      const url = `https://www.law.cornell.edu/supremecourt/text/${volume}/${firstPage}`;
      const res = await fetch(url, { method: 'HEAD', signal: abortAfter(VERIFICATION_TIMEOUT_MS) });
      if (res.ok) return { found: true, url };
    }

    const cfr = reporter.match(/^(\d+)\s*C\.F\.R\./);
    if (cfr) {
      const url = `https://www.law.cornell.edu/cfr/text/${cfr[1]}`;
      const res = await fetch(url, { method: 'HEAD', signal: abortAfter(VERIFICATION_TIMEOUT_MS) });
      if (res.ok) return { found: true, url };
    }
  } catch {
    // Timeout or network error
  }
  return { found: false };
}

async function checkGoogleScholar(caseName: string, volume: string, reporter: string, firstPage: string): Promise<{ found: boolean; url?: string }> {
  try {
    const query = encodeURIComponent(`"${caseName}" ${volume} ${reporter} ${firstPage}`);
    const url = `https://scholar.google.com/scholar?q=${query}&hl=en&as_sdt=2006`;
    const res = await fetch(url, { signal: abortAfter(VERIFICATION_TIMEOUT_MS) });
    if (res.ok) {
      const text = await res.text();
      if (text.includes(volume) && text.includes(firstPage)) return { found: true, url };
    }
  } catch {
    // Timeout, blocked, or network error
  }
  return { found: false };
}

/**
 * Verify a single search result against multiple external sources in parallel.
 * Returns the result enriched with verification data.
 */
async function verifySingleResult(
  result: CaseSearchResult,
  trace: string[]
): Promise<CaseSearchResult> {
  const { partyOne, partyTwo } = extractParties(result.caseName);
  const volume = result.volume || '';
  const reporter = result.reporter || '';
  const firstPage = result.firstPage || '';

  if (!volume || !reporter || !firstPage) {
    trace.push(`Skipping verification for "${result.caseName}" — missing citation components.`);
    return { ...result, confidence: Math.min(result.confidence, 30), verified: false, verifiedBy: [] };
  }

  const components: CaseComponents = {
    partyOne,
    partyTwo,
    volume,
    reporter,
    firstPage,
    year: result.year,
    court: result.court,
  };

  const noHit: { found: boolean; url?: string } = { found: false };
  const [clResult, capResult, justiaResult, cornellResult, scholarResult] = await Promise.allSettled([
    verifyWithCourtListener(components).catch(() => null),
    verifyWithCaselaw(components).catch(() => null),
    checkJustia(volume, firstPage, reporter).catch(() => noHit),
    checkCornellLII(volume, firstPage, reporter).catch(() => noHit),
    checkGoogleScholar(result.caseName, volume, reporter, firstPage).catch(() => noHit),
  ]);

  const sources: string[] = [];
  let sourceUrl: string | undefined;
  let verifiedCitation: string | undefined;

  const cl = clResult.status === 'fulfilled' ? clResult.value : null;
  if (cl && (cl.status === 'verified' || cl.status === 'partial_match')) {
    sources.push('CourtListener');
    if (cl.verifiedCitation) verifiedCitation = cl.verifiedCitation;
    trace.push(`"${result.caseName}" found in CourtListener database.`);
  }

  const cap = capResult.status === 'fulfilled' ? capResult.value : null;
  if (cap && (cap.status === 'verified' || cap.status === 'partial_match')) {
    sources.push('Harvard Caselaw');
    trace.push(`"${result.caseName}" found in Harvard Caselaw Access Project.`);
  }

  const justia = justiaResult.status === 'fulfilled' ? justiaResult.value : noHit;
  if (justia.found) {
    sources.push('Justia');
    if (justia.url) sourceUrl = justia.url;
    trace.push(`"${result.caseName}" confirmed on Justia.`);
  }

  const cornell = cornellResult.status === 'fulfilled' ? cornellResult.value : noHit;
  if (cornell.found) {
    sources.push('Cornell LII');
    if (cornell.url && !sourceUrl) sourceUrl = cornell.url;
    trace.push(`"${result.caseName}" confirmed on Cornell LII.`);
  }

  const scholar = scholarResult.status === 'fulfilled' ? scholarResult.value : noHit;
  if (scholar.found) {
    sources.push('Google Scholar');
    trace.push(`"${result.caseName}" found on Google Scholar.`);
  }

  const isVerified = sources.length > 0;

  const adjustedConfidence = isVerified
    ? Math.max(result.confidence, 70 + Math.min(sources.length, 3) * 10)
    : Math.min(result.confidence, 35);

  return {
    ...result,
    citation: verifiedCitation || result.citation,
    confidence: adjustedConfidence,
    verified: isVerified,
    verifiedBy: sources,
    sourceUrl,
  };
}

/**
 * Verify an array of search results against external legal databases and web sources.
 * Runs all verifications in parallel for speed (~3-5s total).
 * Returns only verified results, sorted by confidence.
 */
export async function verifySearchResults(
  results: CaseSearchResult[],
  trace: string[]
): Promise<CaseSearchResult[]> {
  if (results.length === 0) return [];

  trace.push(`Verifying ${results.length} results against CourtListener, Harvard Caselaw, Justia, Cornell LII, and Google Scholar...`);

  const verifiedResults = await Promise.all(
    results.map(r => verifySingleResult(r, trace))
  );

  const verified = verifiedResults.filter(r => r.verified);
  const unverified = verifiedResults.filter(r => !r.verified);

  if (verified.length > 0) {
    trace.push(`${verified.length} of ${results.length} results confirmed by external sources.`);
  }

  // Return verified results first (sorted by confidence), then unverified with low confidence
  const sorted = [
    ...verified.sort((a, b) => b.confidence - a.confidence),
    ...unverified.sort((a, b) => b.confidence - a.confidence),
  ];

  return sorted;
}
