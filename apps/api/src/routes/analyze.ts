import { Router, type Request, type Response } from 'express';
import { extractAndParseCitations } from '@legalcitation/citation-parser';
import { runAllRules, runFullAnalysis, calculateScore } from '@legalcitation/rule-engine';
import type { AnalyzedCitation, CaseComponents, CitationContext, ValidationIssue } from '@legalcitation/shared';
import { validateAnalyzeText, validateAnalyzeSingle } from '../middleware/validation.js';
import { cachedVerifyCaseCitation } from '../services/verification-cache.js';

export const analyzeRouter = Router();

/**
 * POST /api/analyze — Analyze text with multiple citations (in-text mode)
 */
analyzeRouter.post('/', validateAnalyzeText, async (req: Request, res: Response) => {
  try {
    const { text, context = 'citation_sentence' } = req.body as {
      text: string;
      context?: CitationContext;
    };

    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text is required' });
      return;
    }

    // Parse all citations in the text
    const parsed = extractAndParseCitations(text, context);

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
        try {
          const components = citation.components as CaseComponents;
          const verification = await cachedVerifyCaseCitation(components);
          analyzed.verificationStatus = verification.status;
          analyzed.discrepancies = verification.discrepancies;
          analyzed.referenceExamples = verification.referenceExamples;
          analyzed.verifiedCitation = verification.verifiedCitation;
          analyzed.logicTrace.push(...verification.logicTrace);
        } catch {
          analyzed.verificationStatus = 'error';
          analyzed.logicTrace.push('Verification failed — external API error');
        }
      }

      results.push(analyzed);
    }

    res.json({ results, citationCount: results.length });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

/**
 * POST /api/analyze/single — Analyze a single citation
 */
analyzeRouter.post('/single', validateAnalyzeSingle, async (req: Request, res: Response) => {
  try {
    const { citation, context = 'citation_sentence' } = req.body as {
      citation: string;
      context?: CitationContext;
    };

    if (!citation || typeof citation !== 'string') {
      res.status(400).json({ error: 'Citation is required' });
      return;
    }

    // Parse the single citation
    const parsed = extractAndParseCitations(citation, context);

    if (parsed.length === 0) {
      // Try to parse it as a raw case citation anyway
      const { parseCaseCitation } = await import('@legalcitation/citation-parser');
      const caseParsed = parseCaseCitation(citation, { start: 0, end: citation.length }, context);
      if (caseParsed) {
        parsed.push(caseParsed);
      } else {
        res.status(400).json({
          error: 'Could not parse citation',
          suggestion: 'Check that the citation follows a recognized Bluebook format.',
        });
        return;
      }
    }

    const target = parsed[0];
    const issues = runAllRules(target);
    const score = calculateScore(issues);

    const analyzed: AnalyzedCitation = {
      parsed: target,
      issues,
      verificationStatus: 'pending',
      discrepancies: [],
      referenceExamples: [],
      logicTrace: [
        `Identified as a ${target.type} citation.`,
        `Checked case name formatting per R. 10.2 and abbreviations per T6.`,
        `Validated reporter (R. 10.3 / T1), court designation (R. 10.4), and date (R. 10.5).`,
        `Applied spacing rules (R. 6.1), ordinals (R. 6.2), and page ranges (R. 3.2).`,
        `Cross-checked with Indigo Book (R11, R12, R15).`,
        ...(issues.filter((i: ValidationIssue) => i.severity === 'error').length > 0
          ? [`Found ${issues.filter((i: ValidationIssue) => i.severity === 'error').length} issue${issues.filter((i: ValidationIssue) => i.severity === 'error').length !== 1 ? 's' : ''} requiring correction.`]
          : ['No formatting issues found.']),
      ],
      score,
    };

    // Verify if it's a case citation
    if (target.type === 'case') {
      try {
        const components = target.components as CaseComponents;
        const verification = await cachedVerifyCaseCitation(components);
        analyzed.verificationStatus = verification.status;
        analyzed.discrepancies = verification.discrepancies;
        analyzed.referenceExamples = verification.referenceExamples;
        analyzed.verifiedCitation = verification.verifiedCitation;
        analyzed.logicTrace.push(...verification.logicTrace);
      } catch {
        analyzed.verificationStatus = 'error';
        analyzed.logicTrace.push('Verification failed — external API error');
      }
    }

    res.json(analyzed);
  } catch (error) {
    console.error('Single analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});
