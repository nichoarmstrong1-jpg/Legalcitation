import { extractAndParseCitations, normalizeCitationInput } from '@legalcitation/citation-parser';
import { calculateScore, runAllRules } from '@legalcitation/rule-engine';
import type { CaseComponents, CitationTypeId, ValidationIssue } from '@legalcitation/shared';
import { buildCitationWithClaude, searchCasesWithClaude, searchCourtListenerCases } from '@legalcitation/verification';
import { Router, type Request, type Response } from 'express';
import {
    validateBuild,
    validateBuildBatch,
    validateBuildCheck,
    validateBuildFromUrl,
    validateSearch,
} from '../middleware/validation.js';
import { checkCitation } from '../services/citation-checker.js';
import { logCitationCheck } from '../services/citation-logger.js';
import { buildCitation } from '../services/citation-pipeline.js';
import { processVerifiedCitation } from '../services/process-citation.js';
import { identifySource, resolveUrl } from '../services/url-resolver.js';
import { cachedVerifyCaseCitation } from '../services/verification-cache.js';

export const buildRouter = Router();

/**
 * POST /api/build/search — Search for cases matching free text.
 * Uses CourtListener search API (ground truth) + Claude AI (formatting/summaries) in parallel.
 * Returns up to 5 results for the user to pick from.
 */
buildRouter.post('/search', validateSearch, async (req: Request, res: Response) => {
  try {
    const { query } = req.body as { query: string };

    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: 'Search query is required' });
      return;
    }

    // Run CourtListener search and Claude search in parallel
    const [clResults, claudeResult] = await Promise.allSettled([
      searchCourtListenerCases(query).catch(() => []),
      searchCasesWithClaude(query),
    ]);

    const courtListenerHits = clResults.status === 'fulfilled' ? clResults.value : [];
    const claudeData = claudeResult.status === 'fulfilled' ? claudeResult.value : null;
    const claudeHits = claudeData?.results || [];

    const mergedResults = mergeSearchResults(courtListenerHits, claudeHits);
    const logicTrace: string[] = [];

    if (courtListenerHits.length > 0) {
      logicTrace.push(`Found ${courtListenerHits.length} case(s) in CourtListener database.`);
    }
    if (claudeData?.logicTrace) {
      logicTrace.push(...claudeData.logicTrace);
    }
    if (mergedResults.length === 0) {
      logicTrace.push('No matching cases found. Try a more specific search query.');
    } else {
      logicTrace.push(`Returning ${mergedResults.length} result(s).`);
    }

    logCitationCheck({
      userId: (req as any).user?.userId,
      mode: 'builder_search',
      inputText: query,
      results: mergedResults,
      citationCount: mergedResults.length,
    });

    res.json({ results: mergedResults, logicTrace });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Case search failed' });
  }
});

/**
 * POST /api/build — Generate a citation from free text input.
 * When citationType is provided, uses the two-layer pipeline (Claude + rule engine).
 * Otherwise falls back to the legacy flow (parser + processVerifiedCitation).
 */
buildRouter.post('/', validateBuild, async (req: Request, res: Response) => {
  try {
    const { input, citationType, style, fields } = req.body as {
      input: string;
      citationType?: CitationTypeId;
      style?: 'law_review' | 'court_doc';
      fields?: Record<string, string>;
    };

    if (!input || typeof input !== 'string') {
      res.status(400).json({ error: 'Input text is required' });
      return;
    }

    // New pipeline: when citationType is provided, use the two-layer build
    if (citationType) {
      const mode = fields ? 'manual' : 'search';
      const result = await buildCitation(input, citationType, mode, style ?? 'court_doc', fields);

      logCitationCheck({
        userId: (req as any).user?.userId,
        mode: 'builder',
        inputText: input,
        results: result,
        citationCount: 1,
        averageScore: Math.round(result.confidence * 100),
      });
      res.json(result);
      return;
    }

    // Legacy flow: no citationType specified
    const logicTrace: string[] = [];
    logicTrace.push(`Received free text input: "${input.slice(0, 100)}${input.length > 100 ? '...' : ''}"`);

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
      const analyzed = await processVerifiedCitation(parsed[0]);
      analyzed.logicTrace = [...logicTrace, ...analyzed.logicTrace];

      logCitationCheck({
        userId: (req as any).user?.userId,
        mode: 'builder',
        inputText: input,
        results: analyzed,
        citationCount: 1,
        averageScore: analyzed.score,
      });
      res.json(analyzed);
      return;
    }

    logicTrace.push('No standard citation found. Using AI-powered citation builder...');

    const claudeResult = await buildCitationWithClaude(input);

    if (claudeResult) {
      logicTrace.push(...claudeResult.logicTrace);

      let builtIssues: ValidationIssue[] = [];
      let builtScore = 90;
      const builtParsed = extractAndParseCitations(claudeResult.citation, 'citation_sentence');
      if (builtParsed.length > 0) {
        builtIssues = runAllRules(builtParsed[0]);
        builtScore = calculateScore(builtIssues);
      }

      const builtResult = {
        parsed: builtParsed.length > 0 ? builtParsed[0] : null,
        issues: builtIssues,
        verificationStatus: 'verified',
        discrepancies: [],
        referenceExamples: [],
        verifiedCitation: claudeResult.citation,
        shortForms: claudeResult.shortForms || [],
        logicTrace,
        score: builtScore,
      };
      logCitationCheck({
        userId: (req as any).user?.userId,
        mode: 'builder',
        inputText: input,
        results: builtResult,
        citationCount: 1,
        averageScore: builtScore,
      });
      res.json(builtResult);
      return;
    }

    logicTrace.push('AI builder not available. Attempting manual extraction...');

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
          let verifiedIssues: ValidationIssue[] = [];
          let verifiedScore = verification.status === 'verified' ? 100 : 50;
          const verifiedParsed = extractAndParseCitations(verification.verifiedCitation, 'citation_sentence');
          if (verifiedParsed.length > 0) {
            verifiedIssues = runAllRules(verifiedParsed[0]);
            verifiedScore = calculateScore(verifiedIssues);
          }

          res.json({
            parsed: verifiedParsed.length > 0 ? verifiedParsed[0] : null,
            issues: verifiedIssues,
            verificationStatus: verification.status,
            discrepancies: verification.discrepancies,
            referenceExamples: [],
            verifiedCitation: verification.verifiedCitation,
            logicTrace,
            score: verifiedScore,
          });
          return;
        }
      } catch (err) {
        console.error('Build verification error:', err);
        logicTrace.push('Could not verify citation.');
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

/**
 * POST /api/build/from-url — Build a citation from a URL.
 * Resolves the URL to get metadata, then runs the two-layer pipeline.
 */
buildRouter.post('/from-url', validateBuildFromUrl, async (req: Request, res: Response) => {
  try {
    const { url, citationType, style } = req.body as {
      url: string;
      citationType?: CitationTypeId;
      style?: 'law_review' | 'court_doc';
    };

    const resolved = await resolveUrl(url);
    const typeId: CitationTypeId = citationType ?? 'website';
    const preExtracted = Object.keys(resolved.metadata).length > 0 ? resolved.metadata : undefined;

    const result = await buildCitation(url, typeId, 'url', style ?? 'court_doc', preExtracted);
    result.sourceUrl = url;

    logCitationCheck({
      userId: (req as any).user?.userId,
      mode: 'builder',
      inputText: url,
      results: result,
      citationCount: 1,
      averageScore: Math.round(result.confidence * 100),
    });

    res.json({ ...result, resolvedSource: resolved.source, resolveTimeMs: resolved.resolveTimeMs });
  } catch (error) {
    console.error('Build from URL error:', error);
    res.status(500).json({ error: 'Citation build from URL failed' });
  }
});

/**
 * POST /api/build/check-url — Quick URL accessibility and source identification.
 * Returns instant pattern match result + HEAD check for unknown sources.
 */
buildRouter.post('/check-url', async (req: Request, res: Response) => {
  try {
    const { url } = req.body as { url: string };
    if (!url || typeof url !== 'string') {
      res.status(400).json({ error: 'URL is required' });
      return;
    }

    const start = performance.now();
    const identified = identifySource(url);

    if (identified) {
      res.json({
        accessible: true,
        source: identified.source,
        identifier: identified.identifier,
        resolveTimeMs: Math.round(performance.now() - start),
      });
      return;
    }

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3000);
      const headRes = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: controller.signal });
      clearTimeout(timer);
      res.json({
        accessible: headRes.ok,
        resolveTimeMs: Math.round(performance.now() - start),
      });
    } catch {
      res.json({
        accessible: false,
        resolveTimeMs: Math.round(performance.now() - start),
      });
    }
  } catch (error) {
    console.error('Check URL error:', error);
    res.status(500).json({ error: 'URL check failed' });
  }
});

/**
 * POST /api/build/from-pdf — Extract text from PDF and build citation.
 * Stub: returns 501 Not Implemented for now.
 */
buildRouter.post('/from-pdf', (_req: Request, res: Response) => {
  res.status(501).json({ error: 'PDF citation building is not yet implemented' });
});

/**
 * POST /api/build/check — Check/validate an existing citation.
 * Uses both the deterministic rule engine and Claude semantic check.
 */
buildRouter.post('/check', validateBuildCheck, async (req: Request, res: Response) => {
  try {
    const { citation, citationType, style } = req.body as {
      citation: string;
      citationType: CitationTypeId;
      style?: 'law_review' | 'court_doc';
    };

    const result = await checkCitation(citation, citationType, style ?? 'court_doc');

    logCitationCheck({
      userId: (req as any).user?.userId,
      mode: 'builder',
      inputText: citation,
      results: result,
      citationCount: 1,
      averageScore: result.overallScore,
    });

    res.json(result);
  } catch (error) {
    console.error('Citation check error:', error);
    res.status(500).json({ error: 'Citation check failed' });
  }
});

/**
 * POST /api/build/batch — Build multiple citations in parallel.
 * Processes up to 20 citations with a concurrency limit of 3.
 */
buildRouter.post('/batch', validateBuildBatch, async (req: Request, res: Response) => {
  try {
    const { citations, style } = req.body as {
      citations: Array<{ input: string; typeId: CitationTypeId }>;
      style?: 'law_review' | 'court_doc';
    };

    const concurrencyLimit = 3;
    const results: Array<Awaited<ReturnType<typeof buildCitation>>> = [];

    for (let i = 0; i < citations.length; i += concurrencyLimit) {
      const batch = citations.slice(i, i + concurrencyLimit);
      const batchResults = await Promise.all(
        batch.map((c) => buildCitation(c.input, c.typeId, 'search', style ?? 'court_doc')),
      );
      results.push(...batchResults);
    }

    res.json({ results });
  } catch (error) {
    console.error('Batch build error:', error);
    res.status(500).json({ error: 'Batch citation build failed' });
  }
});

// --- Search result merging ---

interface MergedSearchResult {
  caseName: string;
  citation: string;
  year: string;
  court: string;
  summary: string;
  confidence: number;
  source: 'courtlistener' | 'claude' | 'both';
}

function mergeSearchResults(
  clHits: Array<{ caseName: string; citations: string[]; court: string; dateFiled: string; snippet: string }>,
  claudeHits: Array<{ caseName: string; citation: string; year: string; court: string; summary: string; confidence: number }>,
): MergedSearchResult[] {
  const results: MergedSearchResult[] = [];
  const seenCitations = new Set<string>();

  // CourtListener results first (ground truth — these cases definitely exist)
  for (const cl of clHits) {
    const primaryCitation = cl.citations[0] || '';
    const year = cl.dateFiled?.split('-')[0] || '';
    const key = primaryCitation.toLowerCase();

    if (key && seenCitations.has(key)) continue;
    if (key) seenCitations.add(key);

    // Check if Claude also returned this case
    const claudeMatch = claudeHits.find(ch =>
      ch.caseName.toLowerCase().includes(cl.caseName.split(' v')[0]?.toLowerCase().trim() || '___') ||
      (primaryCitation && ch.citation.includes(primaryCitation))
    );

    results.push({
      caseName: cl.caseName,
      citation: primaryCitation ? `*${cl.caseName}*, ${primaryCitation} (${year}).` : `*${cl.caseName}*`,
      year,
      court: cl.court,
      summary: claudeMatch?.summary || cl.snippet || '',
      confidence: claudeMatch ? Math.min(claudeMatch.confidence + 10, 100) : 85,
      source: claudeMatch ? 'both' : 'courtlistener',
    });
  }

  // Add Claude-only results that weren't in CourtListener
  for (const ch of claudeHits) {
    const citeParts = ch.citation.replace(/\*/g, '').match(/\d+\s+\S+\s+\d+/);
    const citeKey = citeParts ? citeParts[0].toLowerCase() : ch.citation.toLowerCase();

    if (seenCitations.has(citeKey)) continue;
    seenCitations.add(citeKey);

    results.push({
      caseName: ch.caseName,
      citation: ch.citation,
      year: ch.year,
      court: ch.court,
      summary: ch.summary,
      confidence: ch.confidence,
      source: 'claude',
    });
  }

  return results
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5);
}
