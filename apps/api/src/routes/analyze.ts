import { Router, type Request, type Response } from 'express';
import { extractAndParseCitations, normalizeCitationInput } from '@legalcitation/citation-parser';
import { runFullAnalysis, calculateScore } from '@legalcitation/rule-engine';
import type { AnalyzedCitation, CaseComponents, CitationContext, ValidationIssue } from '@legalcitation/shared';
import { validateAnalyzeText } from '../middleware/validation.js';
import { cachedVerifyCaseCitation } from '../services/verification-cache.js';
import { logCitationCheck } from '../services/citation-logger.js';
import { matchPinpointToDocument } from '../services/pinpoint-matcher.js';

export const analyzeRouter = Router();

/**
 * POST /api/analyze — Analyze text with multiple citations (in-text mode)
 * Applies normalization when standard extraction finds nothing.
 */
analyzeRouter.post('/', validateAnalyzeText, async (req: Request, res: Response) => {
  try {
    const { text, context = 'citation_sentence', documentIds } = req.body as {
      text: string;
      context?: CitationContext;
      documentIds?: string[];
    };

    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text is required' });
      return;
    }

    // Try standard extraction first, then normalized
    let parsed = extractAndParseCitations(text, context);
    if (parsed.length === 0) {
      const normalized = normalizeCitationInput(text);
      if (normalized !== text) {
        parsed = extractAndParseCitations(normalized, context);
      }
    }

    // Run rules on all citations (including context rules)
    const issueMap = runFullAnalysis(parsed);

    // Build analyzed citation results
    const results: AnalyzedCitation[] = [];

    for (const citation of parsed) {
      const issues = issueMap.get(citation.id) || [];
      const score = calculateScore(issues);

      const analyzed: AnalyzedCitation = {
        parsed: citation,
        issues,
        verificationStatus: 'pending',
        discrepancies: [],
        referenceExamples: [],
        logicTrace: [
          `Identified as a ${citation.type} citation.`,
          `Checked against ${issues.length} Bluebook and Indigo Book rules.`,
          ...(issues.filter((i: ValidationIssue) => i.severity === 'error').length > 0
            ? [`Found ${issues.filter((i: ValidationIssue) => i.severity === 'error').length} formatting issue${issues.filter((i: ValidationIssue) => i.severity === 'error').length !== 1 ? 's' : ''} requiring correction.`]
            : ['No formatting issues found — citation format looks correct.']),
        ],
        score,
      };

      // Verify case citations
      if (citation.type === 'case') {
        const components = citation.components as CaseComponents;

        try {
          const verification = await cachedVerifyCaseCitation(components);
          analyzed.verificationStatus = verification.status;
          analyzed.discrepancies = verification.discrepancies;
          analyzed.referenceExamples = verification.referenceExamples;
          analyzed.verifiedCitation = verification.verifiedCitation;
          analyzed.logicTrace.push(...verification.logicTrace);
        } catch (err) {
          console.error('Verification error in /analyze:', err);
          analyzed.verificationStatus = 'pending';
          analyzed.logicTrace.push('External verification temporarily unavailable. Bluebook formatting rules still checked.');
        }

        // Pinpoint-PDF matching: check pinCite against uploaded documents
        if (components.pinCite && documentIds && documentIds.length > 0) {
          for (const docId of documentIds) {
            try {
              const match = await matchPinpointToDocument(
                components.pinCite,
                docId,
                components.firstPage
              );
              if (match && match.matched) {
                analyzed.pinpointMatch = match;
                analyzed.logicTrace.push(
                  `Pinpoint page verified against uploaded source "${match.documentName}".`
                );
                break;
              }
            } catch {
              // Non-critical — continue without pinpoint match
            }
          }
        }
      }

      results.push(analyzed);
    }

    // Even if no citations found, return 200 with empty results (never 400 for in-text)
    logCitationCheck({
      userId: (req as any).user?.userId,
      mode: 'in_text',
      inputText: text,
      results,
      citationCount: results.length,
      averageScore: results.length > 0
        ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
        : undefined,
    });
    res.json({ results, citationCount: results.length });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});
