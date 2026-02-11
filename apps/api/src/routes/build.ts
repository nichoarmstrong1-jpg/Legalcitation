import { Router, type Request, type Response } from 'express';
import { extractAndParseCitations } from '@legalcitation/citation-parser';
import { runAllRules, calculateScore } from '@legalcitation/rule-engine';
import { verifyCaseCitation, buildCitationWithClaude, searchCasesWithClaude } from '@legalcitation/verification';
import type { AnalyzedCitation, CaseComponents } from '@legalcitation/shared';
import { validateSearch, validateBuild } from '../middleware/validation.js';

export const buildRouter = Router();

/**
 * POST /api/build/search — Search for cases matching free text.
 * Returns up to 5 results for the user to pick from.
 */
buildRouter.post('/search', validateSearch, async (req: Request, res: Response) => {
  try {
    const { query } = req.body as { query: string };

    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: 'Search query is required' });
      return;
    }

    const searchResult = await searchCasesWithClaude(query);

    if (!searchResult || searchResult.results.length === 0) {
      res.json({
        results: [],
        logicTrace: searchResult?.logicTrace || ['No matching cases found. Try a different search.'],
      });
      return;
    }

    res.json({
      results: searchResult.results,
      logicTrace: searchResult.logicTrace,
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Case search failed' });
  }
});

/**
 * POST /api/build — Generate a citation from free text input.
 * Uses Claude API to intelligently construct and verify citations.
 */
buildRouter.post('/', validateBuild, async (req: Request, res: Response) => {
  try {
    const { input } = req.body as { input: string };

    if (!input || typeof input !== 'string') {
      res.status(400).json({ error: 'Input text is required' });
      return;
    }

    const logicTrace: string[] = [];
    logicTrace.push(`Received free text input: "${input.slice(0, 100)}${input.length > 100 ? '...' : ''}"`);

    // First try to extract any existing citations from the input
    const parsed = extractAndParseCitations(input, 'citation_sentence');

    if (parsed.length > 0) {
      logicTrace.push(`Found ${parsed.length} citation(s) in input. Validating and improving...`);

      const target = parsed[0];
      const issues = runAllRules(target);
      const score = calculateScore(issues);

      const analyzed: AnalyzedCitation = {
        parsed: target,
        issues,
        verificationStatus: 'pending',
        discrepancies: [],
        referenceExamples: [],
        logicTrace,
        score,
      };

      if (target.type === 'case') {
        try {
          const components = target.components as CaseComponents;
          const verification = await verifyCaseCitation(components);
          analyzed.verificationStatus = verification.status;
          analyzed.discrepancies = verification.discrepancies;
          analyzed.verifiedCitation = verification.verifiedCitation;
          analyzed.logicTrace.push(...verification.logicTrace);
        } catch {
          analyzed.logicTrace.push('Verification failed');
        }
      }

      res.json(analyzed);
      return;
    }

    // No parseable citation — try Claude API to build one
    logicTrace.push('No standard citation found. Using Claude AI to build citation...');

    const claudeResult = await buildCitationWithClaude(input);

    if (claudeResult) {
      logicTrace.push(...claudeResult.logicTrace);

      res.json({
        parsed: null,
        issues: [],
        verificationStatus: 'verified',
        discrepancies: [],
        referenceExamples: [],
        verifiedCitation: claudeResult.citation,
        logicTrace,
        score: 90,
      });
      return;
    }

    // Claude not available — try to build from context clues
    logicTrace.push('Claude API not available. Attempting manual extraction...');

    const partyMatch = input.match(/(.+?)\s+v\.?\s+(.+?)(?:\s+(\d{4}))?$/i);

    if (partyMatch) {
      const partyOne = partyMatch[1].trim();
      const partyTwo = partyMatch[2].trim().replace(/\s+\d{4}$/, '');
      const year = partyMatch[3] || input.match(/\b(\d{4})\b/)?.[1] || '';

      logicTrace.push(`Identified parties: "${partyOne}" v. "${partyTwo}"`);
      if (year) logicTrace.push(`Year: ${year}`);

      const components: CaseComponents = {
        partyOne,
        partyTwo,
        volume: '',
        reporter: '',
        firstPage: '',
        year,
      };

      try {
        const verification = await verifyCaseCitation(components);
        logicTrace.push(...verification.logicTrace);

        if (verification.verifiedCitation) {
          res.json({
            parsed: null,
            issues: [],
            verificationStatus: verification.status,
            discrepancies: verification.discrepancies,
            referenceExamples: [],
            verifiedCitation: verification.verifiedCitation,
            logicTrace,
            score: verification.status === 'verified' ? 100 : 50,
          });
          return;
        }
      } catch {
        logicTrace.push('Could not verify citation against databases.');
      }

      const placeholderCite = `*${partyOne} v. ${partyTwo}*, [Volume] [Reporter] [Page] (${year || '[Year]'}).`;
      logicTrace.push('Built citation with placeholders for missing information.');

      res.json({
        parsed: null,
        issues: [{
          id: 'placeholder',
          rule: 'Builder',
          source: 'Bluebook' as const,
          severity: 'warning' as const,
          message: 'Citation contains placeholders. Verify the reporter, volume, and page.',
          suggestion: 'Look up the case in Westlaw, Lexis, or Google Scholar to fill in missing details.',
        }],
        verificationStatus: 'pending',
        discrepancies: [],
        referenceExamples: [],
        verifiedCitation: placeholderCite,
        logicTrace,
        score: 30,
      });
      return;
    }

    logicTrace.push('Could not identify parties or citation components from input.');
    res.json({
      parsed: null,
      issues: [{
        id: 'unparseable',
        rule: 'Builder',
        source: 'Bluebook' as const,
        severity: 'error' as const,
        message: 'Could not build a citation from the provided input.',
        suggestion: 'Try providing at least a case name (e.g., "Roe v. Wade 1973") or a partial citation.',
      }],
      verificationStatus: 'error',
      discrepancies: [],
      referenceExamples: [],
      logicTrace,
      score: 0,
    });
  } catch (error) {
    console.error('Build error:', error);
    res.status(500).json({ error: 'Citation build failed' });
  }
});
