import { Router, type Request, type Response } from 'express';
import { extractAndParseCitations, normalizeCitationInput } from '@legalcitation/citation-parser';
import { runAllRules, calculateScore } from '@legalcitation/rule-engine';
import { buildCitationWithClaude, searchCasesWithClaude, verifyWithCourtListener, verifyWithCaselaw } from '@legalcitation/verification';
import type { AnalyzedCitation, CaseComponents } from '@legalcitation/shared';
import { validateSearch, validateBuild } from '../middleware/validation.js';
import { cachedVerifyCaseCitation } from '../services/verification-cache.js';

export const buildRouter = Router();

/**
 * Search for cases using free APIs as fallback when Claude is unavailable.
 * Queries CourtListener and case.law in parallel.
 */
async function searchWithFreeAPIs(query: string): Promise<{
  results: Array<{ caseName: string; citation: string; year: string; court: string; summary: string; confidence: number }>;
  logicTrace: string[];
}> {
  const trace: string[] = [];
  trace.push(`Searching free legal databases for "${query.slice(0, 80)}${query.length > 80 ? '...' : ''}"...`);

  // Extract a potential party name and year from the query
  const partyMatch = query.match(/^(.+?)\s+v\.?\s+(.+?)(?:\s+(\d{4}))?$/i);
  if (!partyMatch) {
    // Try a simpler search
    trace.push('Could not identify party names. Try "Party v. Party" format.');
    return { results: [], logicTrace: trace };
  }

  const components: CaseComponents = {
    partyOne: partyMatch[1].trim(),
    partyTwo: partyMatch[2].trim().replace(/\s+\d{4}$/, ''),
    volume: '',
    reporter: '',
    firstPage: '',
    year: partyMatch[3] || '',
  };

  const [clResult, caselawResult] = await Promise.allSettled([
    verifyWithCourtListener(components),
    verifyWithCaselaw(components),
  ]);

  const results: Array<{ caseName: string; citation: string; year: string; court: string; summary: string; confidence: number }> = [];

  if (clResult.status === 'fulfilled' && clResult.value.status !== 'error') {
    const cl = clResult.value;
    if (cl.verifiedCitation) {
      results.push({
        caseName: cl.verifiedCitation.replace(/\*([^*]+)\*/, '$1').split(',')[0] || query,
        citation: cl.verifiedCitation,
        year: components.year || '',
        court: '',
        summary: `Found via CourtListener. Status: ${cl.status}.`,
        confidence: cl.status === 'verified' ? 90 : 60,
      });
    }
    trace.push(...cl.logicTrace.filter(e => !e.includes('http')));
  }

  if (caselawResult.status === 'fulfilled' && caselawResult.value.status !== 'error') {
    const caselaw = caselawResult.value;
    if (caselaw.caseName) {
      const cite = caselaw.citation || '';
      results.push({
        caseName: caselaw.caseName,
        citation: cite ? `*${caselaw.caseName}*, ${cite}` : `*${caselaw.caseName}*`,
        year: components.year || '',
        court: '',
        summary: `Found via Harvard Caselaw Access Project. Status: ${caselaw.status}.`,
        confidence: caselaw.status === 'verified' ? 85 : 55,
      });
    }
    trace.push(...caselaw.logicTrace.filter(e => !e.includes('http')));
  }

  // Deduplicate by case name similarity
  const seen = new Set<string>();
  const deduped = results.filter(r => {
    const key = r.caseName.toLowerCase().replace(/[^a-z]/g, '');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  trace.push(`Found ${deduped.length} result${deduped.length !== 1 ? 's' : ''} from free databases.`);
  return { results: deduped, logicTrace: trace };
}

/**
 * POST /api/build/search — Search for cases matching free text.
 * Returns up to 5 results for the user to pick from.
 * Falls back to free APIs (CourtListener, case.law) when Claude is unavailable.
 */
buildRouter.post('/search', validateSearch, async (req: Request, res: Response) => {
  try {
    const { query } = req.body as { query: string };

    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: 'Search query is required' });
      return;
    }

    // Try Claude first
    const searchResult = await searchCasesWithClaude(query);

    if (searchResult && searchResult.results.length > 0) {
      res.json({
        results: searchResult.results,
        logicTrace: searchResult.logicTrace,
      });
      return;
    }

    // Claude unavailable or no results — fallback to free APIs
    const freeResults = await searchWithFreeAPIs(query);

    res.json({
      results: freeResults.results,
      logicTrace: [
        ...(searchResult?.logicTrace || []),
        ...freeResults.logicTrace,
      ],
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Case search failed' });
  }
});

/**
 * POST /api/build — Generate a citation from free text input.
 * Uses Claude API to intelligently construct and verify citations.
 * Falls back to free APIs and normalization when Claude is unavailable.
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

    // First try to extract any existing citations from the input (with normalization)
    let parsed = extractAndParseCitations(input, 'citation_sentence');
    if (parsed.length === 0) {
      const normalized = normalizeCitationInput(input);
      if (normalized !== input) {
        parsed = extractAndParseCitations(normalized, 'citation_sentence');
        if (parsed.length > 0) {
          logicTrace.push('Applied input normalization to fix common formatting issues.');
        }
      }
    }

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
          const verification = await cachedVerifyCaseCitation(components);
          analyzed.verificationStatus = verification.status;
          analyzed.discrepancies = verification.discrepancies;
          analyzed.verifiedCitation = verification.verifiedCitation;
          analyzed.logicTrace.push(...verification.logicTrace);
        } catch (err) {
          console.error('Build verification error:', err);
          analyzed.logicTrace.push('External verification temporarily unavailable.');
        }
      }

      res.json(analyzed);
      return;
    }

    // No parseable citation — try Claude API to build one
    logicTrace.push('No standard citation found. Using AI-powered citation builder...');

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

    // Claude not available — try to build from context clues + free APIs
    logicTrace.push('AI builder not available. Attempting manual extraction with free databases...');

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
        const verification = await cachedVerifyCaseCitation(components);
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
      } catch (err) {
        console.error('Build free API verification error:', err);
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
      verificationStatus: 'pending',
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
