/**
 * Shared citation processing function used by BOTH the citation builder and checker.
 * Every citation — whether checked individually or as part of a bulk document —
 * goes through this exact same pipeline. No shortcuts, no "bulk mode lite."
 */
import { runAllRules, calculateScore } from '@legalcitation/rule-engine';
import type {
  AnalyzedCitation,
  CaseComponents,
  ParsedCitation,
  ResolutionResult,
  ValidationIssue,
} from '@legalcitation/shared';
import { cachedVerifyCaseCitation } from './verification-cache.js';
import { buildLogicTrace } from './logic-trace.js';
import { generateShortForms } from './short-form-generator.js';

export interface ProcessCitationOptions {
  /** Resolution data for Id./supra/infra chains (bulk checker provides this) */
  resolution?: ResolutionResult;
  /** Pre-computed validation issues (if rules were already run, e.g., by runFullAnalysis) */
  precomputedIssues?: ValidationIssue[];
  /** Document IDs for pinpoint matching */
  documentIds?: string[];
  /** Skip external verification (useful when caller will handle it separately) */
  skipVerification?: boolean;
}

/**
 * Process a single citation through the full pipeline — identical treatment
 * whether called from the builder (1 citation) or checker (N citations).
 *
 * Steps:
 * 1. Run Bluebook rules (or use pre-computed issues)
 * 2. Calculate score
 * 3. Build detailed logic trace with Bluebook rule references
 * 4. Verify against external databases (CourtListener v4 + Harvard + Claude)
 * 5. Generate short forms with "when to use" explanations
 * 6. Return fully populated AnalyzedCitation
 */
export async function processVerifiedCitation(
  citation: ParsedCitation,
  options: ProcessCitationOptions = {},
): Promise<AnalyzedCitation> {
  const { resolution, precomputedIssues, skipVerification } = options;

  // Step 1: Run Bluebook rules
  const issues = precomputedIssues ?? runAllRules(citation);

  // Step 2: Calculate score
  const score = calculateScore(issues);

  // Step 3: Build detailed logic trace
  const logicTrace = buildLogicTrace(citation, issues, resolution);

  // Step 4: Build the base result
  const analyzed: AnalyzedCitation = {
    parsed: citation,
    issues,
    verificationStatus: 'pending',
    discrepancies: [],
    referenceExamples: [],
    logicTrace,
    score,
  };

  // Step 5: Generate short forms (every type, with full explanations)
  const shortForms = generateShortForms(citation);
  if (shortForms.length > 0) {
    analyzed.shortForms = shortForms;
  }

  // Step 6: Verify against external databases
  if (!skipVerification && citation.type === 'case') {
    const components = citation.components as CaseComponents;
    try {
      const verification = await cachedVerifyCaseCitation(components);
      analyzed.verificationStatus = verification.status;
      analyzed.discrepancies = verification.discrepancies;
      analyzed.referenceExamples = verification.referenceExamples;
      analyzed.verifiedCitation = verification.verifiedCitation;
      analyzed.logicTrace.push(...verification.logicTrace);
    } catch (err) {
      console.error('[process-citation] Verification error:', err);
      analyzed.verificationStatus = 'pending';
      analyzed.logicTrace.push(
        'External verification temporarily unavailable. Bluebook formatting rules still checked.',
      );
    }
  }

  return analyzed;
}

/**
 * Process multiple citations through the full pipeline in parallel.
 * Each citation gets the exact same treatment as a single citation in the builder.
 */
export async function processVerifiedCitations(
  citations: ParsedCitation[],
  issueMap: Map<string, ValidationIssue[]>,
  options: Omit<ProcessCitationOptions, 'precomputedIssues'> = {},
): Promise<AnalyzedCitation[]> {
  const results = await Promise.all(
    citations.map(citation =>
      processVerifiedCitation(citation, {
        ...options,
        precomputedIssues: issueMap.get(citation.id),
      }),
    ),
  );

  return results;
}
