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
 * 1. CourtListener v4 citation-lookup (PRIMARY — exact match by volume/reporter/page against 18M+ citations)
 * 2. Harvard Caselaw Access Project (secondary fallback)
 * 3. Claude AI (cross-reference + Bluebook formatting expertise)
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

  // Step 1: CourtListener (primary) + Caselaw (secondary) in parallel
  const [courtListenerResult, caselawResult] = await Promise.allSettled([
    verifyWithCourtListener(components).catch(() => null),
    verifyWithCaselaw(components).catch(() => null),
  ]);

  const clResult = courtListenerResult.status === 'fulfilled' ? courtListenerResult.value : null;
  const capResult = caselawResult.status === 'fulfilled' ? caselawResult.value : null;

  let externalVerified = false;
  let externalCitation: string | undefined;
  const externalDiscrepancies: CitationDiscrepancy[] = [];

  if (clResult && clResult.status === 'verified') {
    externalVerified = true;
    confirmedSources++;
    externalCitation = clResult.verifiedCitation;
    externalDiscrepancies.push(...clResult.discrepancies);
    allTrace.push(...clResult.logicTrace);
  } else if (clResult && clResult.status === 'partial_match') {
    confirmedSources += 0.5;
    allTrace.push(...clResult.logicTrace);
  } else if (clResult && clResult.status === 'not_found') {
    allTrace.push(...clResult.logicTrace);
  }

  if (capResult && capResult.status === 'verified') {
    externalVerified = true;
    confirmedSources++;
    if (!externalCitation) externalCitation = capResult.citation;
    externalDiscrepancies.push(...capResult.discrepancies);
    allTrace.push('Case also verified in Harvard Caselaw Access Project.');
  } else if (capResult && capResult.status === 'partial_match') {
    confirmedSources += 0.5;
    allTrace.push('Partial match found in Harvard Caselaw Access Project.');
  }

  // Step 2: Claude AI verification for cross-referencing + Bluebook expertise
  try {
    const claudeResult = await verifyWithClaude(components);
    allTrace.push(...claudeResult.logicTrace);

    if (claudeResult.status === 'verified') {
      confirmedSources++;

      if (externalVerified && externalDiscrepancies.length > 0 && claudeResult.discrepancies.length === 0) {
        allTrace.push('Note: External databases found discrepancies that AI verification did not flag. Review carefully.');
      }

      const allDiscrepancies = [...claudeResult.discrepancies, ...externalDiscrepancies];
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
        verifiedCitation: externalCitation || claudeResult.verifiedCitation,
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
        verifiedCitation: externalCitation || claudeResult.verifiedCitation,
        logicTrace: allTrace,
        provider: externalVerified ? 'multi-source' : 'primary',
        confidence: confirmedSources,
      };
    }

    // Format-only mode (no Anthropic API key configured)
    if (claudeResult.status === 'pending') {
      if (externalVerified) {
        allTrace.push('Verified via external case law databases.');
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
