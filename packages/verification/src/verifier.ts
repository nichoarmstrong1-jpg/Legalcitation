import type { CaseComponents, VerificationStatus, CitationDiscrepancy, ReferenceExample } from '@legalcitation/shared';
import { verifyWithClaude } from './providers/claude-provider.js';
import { verifyWithCourtListener } from './providers/courtlistener-provider.js';
import { verifyWithCaselaw } from './providers/caselaw-provider.js';

export interface FullVerificationResult {
  status: VerificationStatus;
  discrepancies: CitationDiscrepancy[];
  referenceExamples: ReferenceExample[];
  verifiedCitation?: string;
  logicTrace: string[];
  provider: string;
}

/**
 * Verify a case citation against legal databases.
 * Cost-optimized order: free APIs first (CourtListener + case.law), then Claude.
 * All trace messages are law-student-facing — no technical API jargon.
 */
export async function verifyCaseCitation(
  components: CaseComponents
): Promise<FullVerificationResult> {
  const allTrace: string[] = [];

  // Step 1: Try free APIs first (CourtListener + case.law in parallel)
  allTrace.push('Searching public case law databases...');

  const [clResult, caselawResult] = await Promise.allSettled([
    verifyWithCourtListener(components),
    verifyWithCaselaw(components),
  ]);

  const courtlistener = clResult.status === 'fulfilled' ? clResult.value : null;
  const caselaw = caselawResult.status === 'fulfilled' ? caselawResult.value : null;

  // Add non-technical trace entries from free APIs
  if (courtlistener) {
    for (const entry of courtlistener.logicTrace) {
      if (!entry.includes('API') && !entry.includes('http') && !entry.includes('403')) {
        allTrace.push(entry);
      }
    }
  }
  if (caselaw) {
    for (const entry of caselaw.logicTrace) {
      if (!entry.includes('API') && !entry.includes('http') && !entry.includes('403')) {
        allTrace.push(entry);
      }
    }
  }

  // Both free APIs agree on verified → high confidence, skip Claude
  if (courtlistener?.status === 'verified' && caselaw?.status === 'verified') {
    allTrace.push('Citation confirmed through multiple independent sources.');
    return {
      status: 'verified',
      discrepancies: [...(courtlistener.discrepancies || []), ...(caselaw.discrepancies || [])],
      referenceExamples: courtlistener.referenceExamples || [],
      verifiedCitation: courtlistener.verifiedCitation || caselaw.citation,
      logicTrace: allTrace,
      provider: 'cross-referenced',
    };
  }

  // One free API verified with high confidence → likely correct, skip Claude
  if (courtlistener?.status === 'verified') {
    allTrace.push('Citation confirmed through published case records.');
    return {
      status: 'verified',
      discrepancies: courtlistener.discrepancies || [],
      referenceExamples: courtlistener.referenceExamples || [],
      verifiedCitation: courtlistener.verifiedCitation,
      logicTrace: allTrace,
      provider: 'courtlistener',
    };
  }

  if (caselaw?.status === 'verified') {
    allTrace.push('Citation confirmed through Harvard Caselaw Access Project.');
    return {
      status: 'verified',
      discrepancies: caselaw.discrepancies || [],
      referenceExamples: [],
      verifiedCitation: caselaw.citation,
      logicTrace: allTrace,
      provider: 'caselaw',
    };
  }

  // Step 2: Free APIs inconclusive — use Claude for full verification
  allTrace.push('Running AI-powered verification for additional confirmation...');

  const claudeResult = await verifyWithClaude(components);
  allTrace.push(...claudeResult.logicTrace);

  if (claudeResult.status === 'verified') {
    return {
      status: 'verified',
      discrepancies: claudeResult.discrepancies,
      referenceExamples: [],
      verifiedCitation: claudeResult.verifiedCitation,
      logicTrace: allTrace,
      provider: 'primary',
    };
  }

  if (claudeResult.status === 'partial_match' && claudeResult.verifiedCitation) {
    // Cross-reference partial matches with free API data
    const freePartial = courtlistener?.status === 'partial_match' || caselaw?.status === 'partial_match';
    if (freePartial) {
      allTrace.push('Multiple sources found partial matches — discrepancies noted.');
    }

    return {
      status: 'partial_match',
      discrepancies: claudeResult.discrepancies,
      referenceExamples: courtlistener?.referenceExamples || [],
      verifiedCitation: claudeResult.verifiedCitation,
      logicTrace: allTrace,
      provider: 'primary',
    };
  }

  // Format-only mode (no API keys)
  if (claudeResult.status === 'pending') {
    allTrace.push('Checked Bluebook formatting rules (R. 10, T1, T6, T10). External case verification unavailable.');
    const caseName = components.partyTwo
      ? `${components.partyOne} v. ${components.partyTwo}`
      : components.partyOne;

    const hasCiteInfo = components.volume && components.reporter && components.firstPage;
    let formattedCitation: string;
    if (hasCiteInfo) {
      const targetCite = `${components.volume} ${components.reporter} ${components.firstPage}`;
      formattedCitation = `*${caseName}*, ${targetCite}${components.pinCite ? ', ' + components.pinCite : ''} (${components.court ? components.court + ' ' : ''}${components.year}).`;
    } else {
      formattedCitation = `*${caseName}*, [Vol.] [Reporter] [Page] (${components.year || '[Year]'}).`;
    }

    return {
      status: 'pending',
      discrepancies: [],
      referenceExamples: [],
      verifiedCitation: formattedCitation,
      logicTrace: allTrace,
      provider: 'format-only',
    };
  }

  allTrace.push('Could not fully verify this citation. Check with Westlaw or Lexis.');
  return {
    status: claudeResult.status === 'error' ? 'error' : 'not_found',
    discrepancies: claudeResult.discrepancies,
    referenceExamples: [],
    verifiedCitation: claudeResult.verifiedCitation,
    logicTrace: allTrace,
    provider: 'none',
  };
}
