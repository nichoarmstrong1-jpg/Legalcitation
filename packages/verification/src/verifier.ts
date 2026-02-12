import type { CaseComponents, VerificationStatus, CitationDiscrepancy, ReferenceExample } from '@legalcitation/shared';
import { verifyWithClaude } from './providers/claude-provider.js';

export interface FullVerificationResult {
  status: VerificationStatus;
  discrepancies: CitationDiscrepancy[];
  referenceExamples: ReferenceExample[];
  verifiedCitation?: string;
  logicTrace: string[];
  provider: string;
}

/**
 * Verify a case citation using the Claude API.
 * All trace messages are law-student-facing — no technical API jargon.
 */
export async function verifyCaseCitation(
  components: CaseComponents
): Promise<FullVerificationResult> {
  const allTrace: string[] = [];

  allTrace.push('Running AI-powered case law verification...');

  try {
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
      return {
        status: 'partial_match',
        discrepancies: claudeResult.discrepancies,
        referenceExamples: [],
        verifiedCitation: claudeResult.verifiedCitation,
        logicTrace: allTrace,
        provider: 'primary',
      };
    }

    // Format-only mode (no API key configured)
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

    // Claude returned error
    if (claudeResult.status === 'error') {
      allTrace.push('Verification service is currently unavailable. Bluebook formatting rules still checked.');
      return {
        status: 'pending',
        discrepancies: [],
        referenceExamples: [],
        verifiedCitation: claudeResult.verifiedCitation,
        logicTrace: allTrace,
        provider: 'format-only',
      };
    }

    allTrace.push('Could not fully verify this citation. Check with Westlaw or Lexis.');
    return {
      status: 'not_found',
      discrepancies: claudeResult.discrepancies,
      referenceExamples: [],
      verifiedCitation: claudeResult.verifiedCitation,
      logicTrace: allTrace,
      provider: 'none',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[verifier] verifyCaseCitation error:', message, error);
    allTrace.push('Verification service is currently unavailable. Bluebook formatting rules still checked.');
    return {
      status: 'pending',
      discrepancies: [],
      referenceExamples: [],
      logicTrace: allTrace,
      provider: 'format-only',
    };
  }
}
