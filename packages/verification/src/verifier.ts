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
  /** How many independent sources confirmed this citation (0-3). */
  confidence: number;
}

/**
 * Verify a case citation using a multi-provider strategy:
 * 1. Try CourtListener (free, no key needed)
 * 2. Try Caselaw Access Project as fallback
 * 3. Use Claude AI as final verifier
 * 4. Cross-reference results for highest confidence
 *
 * All trace messages are law-student-facing — no technical API jargon.
 */
export async function verifyCaseCitation(
  components: CaseComponents
): Promise<FullVerificationResult> {
  const allTrace: string[] = [];
  let confirmedSources = 0;

  allTrace.push('Running case law verification across multiple databases...');

  // Step 1: Try external databases first (CourtListener + Caselaw) in parallel
  const [courtListenerResult, caselawResult] = await Promise.allSettled([
    verifyWithCourtListener(components).catch(() => null),
    verifyWithCaselaw(components).catch(() => null),
  ]);

  const clResult = courtListenerResult.status === 'fulfilled' ? courtListenerResult.value : null;
  const capResult = caselawResult.status === 'fulfilled' ? caselawResult.value : null;

  // Collect external verification results
  let externalVerified = false;
  let externalCitation: string | undefined;
  const externalDiscrepancies: CitationDiscrepancy[] = [];

  if (clResult && clResult.status === 'verified') {
    externalVerified = true;
    confirmedSources++;
    externalCitation = clResult.verifiedCitation;
    externalDiscrepancies.push(...clResult.discrepancies);
    allTrace.push('Case found and verified in CourtListener database.');
  } else if (clResult && clResult.status === 'partial_match') {
    confirmedSources += 0.5;
    allTrace.push('Partial match found in CourtListener.');
  }

  if (capResult && capResult.status === 'verified') {
    externalVerified = true;
    confirmedSources++;
    if (!externalCitation) externalCitation = capResult.citation;
    externalDiscrepancies.push(...capResult.discrepancies);
    allTrace.push('Case found and verified in Harvard Caselaw Access Project.');
  } else if (capResult && capResult.status === 'partial_match') {
    confirmedSources += 0.5;
    allTrace.push('Partial match found in Harvard Caselaw Access Project.');
  }

  // Step 2: Run Claude AI verification
  try {
    const claudeResult = await verifyWithClaude(components);
    allTrace.push(...claudeResult.logicTrace);

    if (claudeResult.status === 'verified') {
      confirmedSources++;

      // Cross-reference: if external sources disagree with Claude, flag it
      if (externalVerified && externalDiscrepancies.length > 0 && claudeResult.discrepancies.length === 0) {
        allTrace.push('Note: External databases found discrepancies that AI verification did not flag. Review carefully.');
      }

      const allDiscrepancies = [...claudeResult.discrepancies, ...externalDiscrepancies];
      // Deduplicate discrepancies by component
      const seen = new Set<string>();
      const uniqueDiscrepancies = allDiscrepancies.filter(d => {
        const key = d.component;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      return {
        status: 'verified',
        discrepancies: uniqueDiscrepancies,
        referenceExamples: [],
        verifiedCitation: claudeResult.verifiedCitation || externalCitation,
        logicTrace: allTrace,
        provider: confirmedSources >= 2 ? 'multi-source' : 'primary',
        confidence: Math.min(confirmedSources, 3),
      };
    }

    if (claudeResult.status === 'partial_match' && claudeResult.verifiedCitation) {
      return {
        status: externalVerified ? 'verified' : 'partial_match',
        discrepancies: [...claudeResult.discrepancies, ...externalDiscrepancies],
        referenceExamples: [],
        verifiedCitation: claudeResult.verifiedCitation || externalCitation,
        logicTrace: allTrace,
        provider: externalVerified ? 'multi-source' : 'primary',
        confidence: confirmedSources,
      };
    }

    // Format-only mode (no API key configured)
    if (claudeResult.status === 'pending') {
      // If external sources verified it, use that result even without Claude
      if (externalVerified) {
        allTrace.push('Verified via external case law databases. AI verification unavailable.');
        return {
          status: 'verified',
          discrepancies: externalDiscrepancies,
          referenceExamples: [],
          verifiedCitation: externalCitation,
          logicTrace: allTrace,
          provider: 'external-only',
          confidence: confirmedSources,
        };
      }

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
        confidence: 0,
      };
    }

    // Claude returned error — fall back to external results if available
    if (claudeResult.status === 'error') {
      if (externalVerified) {
        allTrace.push('AI verification unavailable, but case verified via external databases.');
        return {
          status: 'verified',
          discrepancies: externalDiscrepancies,
          referenceExamples: [],
          verifiedCitation: externalCitation,
          logicTrace: allTrace,
          provider: 'external-only',
          confidence: confirmedSources,
        };
      }

      allTrace.push('Verification service is currently unavailable. Bluebook formatting rules still checked.');
      return {
        status: 'pending',
        discrepancies: [],
        referenceExamples: [],
        verifiedCitation: claudeResult.verifiedCitation,
        logicTrace: allTrace,
        provider: 'format-only',
        confidence: 0,
      };
    }

    allTrace.push('Could not fully verify this citation. Check with Westlaw or Lexis.');
    return {
      status: externalVerified ? 'partial_match' : 'not_found',
      discrepancies: [...claudeResult.discrepancies, ...externalDiscrepancies],
      referenceExamples: [],
      verifiedCitation: claudeResult.verifiedCitation || externalCitation,
      logicTrace: allTrace,
      provider: 'none',
      confidence: confirmedSources,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[verifier] verifyCaseCitation error:', message, error);

    // If external sources verified, use that
    if (externalVerified) {
      allTrace.push('AI verification failed, but case verified via external databases.');
      return {
        status: 'verified',
        discrepancies: externalDiscrepancies,
        referenceExamples: [],
        verifiedCitation: externalCitation,
        logicTrace: allTrace,
        provider: 'external-only',
        confidence: confirmedSources,
      };
    }

    allTrace.push('Verification service is currently unavailable. Bluebook formatting rules still checked.');
    return {
      status: 'pending',
      discrepancies: [],
      referenceExamples: [],
      logicTrace: allTrace,
      provider: 'format-only',
      confidence: 0,
    };
  }
}
