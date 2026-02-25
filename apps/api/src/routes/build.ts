import { Router, type Request, type Response } from 'express';
import { extractAndParseCitations, normalizeCitationInput } from '@legalcitation/citation-parser';
import { runAllRules, calculateScore } from '@legalcitation/rule-engine';
import { buildCitationWithClaude, searchCasesWithClaude } from '@legalcitation/verification';
import type { AnalyzedCitation, CaseComponents, ValidationIssue, ShortFormEntry, CitationTypeId } from '@legalcitation/shared';
import { validateSearch, validateBuild, validateFromUrl, validateCheckUrl } from '../middleware/validation.js';
import { cachedVerifyCaseCitation } from '../services/verification-cache.js';
import { logCitationCheck } from '../services/citation-logger.js';
import { buildLogicTrace } from '../services/logic-trace.js';
import { resolveUrl, identifySource } from '../services/url-resolver.js';

export const buildRouter = Router();

/**
 * POST /api/build/search — Search for cases matching free text.
 * Returns up to 5 results for the user to pick from.
 * Uses Claude API for case search.
 */
buildRouter.post('/search', validateSearch, async (req: Request, res: Response) => {
  try {
    const { query, citationType } = req.body as { query: string; citationType?: CitationTypeId };

    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: 'Search query is required' });
      return;
    }

    const searchResult = await searchCasesWithClaude(query);

    if (searchResult && searchResult.results.length > 0) {
      logCitationCheck({
        userId: (req as any).user?.userId,
        mode: citationType ? `builder_search:${citationType}` : 'builder_search',
        inputText: query,
        results: searchResult.results,
        citationCount: searchResult.results.length,
      });
      res.json({
        results: searchResult.results,
        logicTrace: searchResult.logicTrace,
      });
      return;
    }

    // Claude returned no results or is unavailable
    logCitationCheck({
      userId: (req as any).user?.userId,
      mode: citationType ? `builder_search:${citationType}` : 'builder_search',
      inputText: query,
      results: [],
      citationCount: 0,
    });
    res.json({
      results: [],
      logicTrace: [
        ...(searchResult?.logicTrace || []),
        'No matching cases found. Try a more specific search query.',
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
 */
buildRouter.post('/', validateBuild, async (req: Request, res: Response) => {
  try {
    const { input, citationType, fields } = req.body as {
      input?: string;
      citationType?: CitationTypeId;
      fields?: Record<string, string>;
    };

    if (!input && !fields) {
      res.status(400).json({ error: 'Either input text or fields are required' });
      return;
    }

    // Manual mode: construct citation from provided field components
    if (fields && !input) {
      const fieldSummary = Object.entries(fields)
        .filter(([, v]) => v)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');
      const prompt = citationType
        ? `Build a Bluebook ${citationType} citation from these components: ${fieldSummary}`
        : `Build a Bluebook citation from these components: ${fieldSummary}`;

      const claudeResult = await buildCitationWithClaude(prompt);
      if (claudeResult) {
        res.json({
          citation: claudeResult.citation,
          shortForm: claudeResult.shortForms?.[0] ?? null,
          footnote: claudeResult.citation,
          sourceUrl: null,
          components: fields,
          missingFields: [],
          confidence: 0.8,
          suggestManual: false,
        });
        return;
      }

      res.json({
        citation: null,
        shortForm: null,
        footnote: null,
        sourceUrl: null,
        components: fields,
        missingFields: [],
        confidence: 0,
        suggestManual: true,
      });
      return;
    }

    // At this point input is guaranteed to be a string (we returned above if !input && !fields, and if fields && !input)
    const inputText = input as string;

    const logicTrace: string[] = [];
    logicTrace.push(`Received free text input: "${inputText.slice(0, 100)}${inputText.length > 100 ? '...' : ''}"`);

    // First try to extract any existing citations from the input (with normalization)
    let parsed = extractAndParseCitations(inputText, 'citation_sentence');
    if (parsed.length === 0) {
      const normalized = normalizeCitationInput(inputText);
      if (normalized !== inputText) {
        parsed = extractAndParseCitations(normalized, 'citation_sentence');
        if (parsed.length > 0) {
          logicTrace.push('Applied input normalization to fix common formatting issues.');
        }
      }
    }

    if (parsed.length > 0) {
      const target = parsed[0];
      const issues = runAllRules(target);
      const score = calculateScore(issues);

      // Use shared logic trace builder for consistent, detailed output
      const detailedTrace = buildLogicTrace(target, issues);
      logicTrace.push(...detailedTrace);

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
        const components = target.components as CaseComponents;

        try {
          const verification = await cachedVerifyCaseCitation(components);
          analyzed.verificationStatus = verification.status;
          analyzed.discrepancies = verification.discrepancies;
          analyzed.verifiedCitation = verification.verifiedCitation;
          analyzed.logicTrace.push(...verification.logicTrace);
        } catch (err) {
          console.error('Build verification error:', err);
          analyzed.logicTrace.push('External verification temporarily unavailable.');
        }

        // Generate short form citations for case citations
        const shortParty = components.partyOne;
        const shortForms: ShortFormEntry[] = [
          {
            form: '*Id.*',
            type: 'id',
            label: 'Id. Citation',
            whenToUse: 'Use when citing the EXACT same source as the immediately preceding citation, with no other citations in between. The preceding citation must cite only ONE authority (no semicolons).',
            whereToPlace: `Use this immediately after the full citation of ${shortParty} appears, as long as no other source is cited between them.`,
            warnings: [
              'Never use Id. if the preceding citation contains multiple sources separated by semicolons.',
              'Id. must be italicized, including the period.',
              'Capitalize "Id." only when it begins a citation sentence.',
            ],
          },
          {
            form: '*Id.* at [pinpoint page]',
            type: 'id_pinpoint',
            label: 'Id. with Pinpoint',
            whenToUse: 'Use when citing the same source as the immediately preceding citation but referencing a DIFFERENT specific page. Replace [pinpoint page] with the actual page number.',
            whereToPlace: `Use after the full citation of ${shortParty} when you need to reference a specific page different from the one in the full citation.`,
            warnings: [
              'Use "at" before page numbers but NOT before § or ¶ symbols.',
              'Do not create a double period: "Id. at 205." is correct, not "Id.. at 205."',
            ],
          },
        ];

        if (components.volume && components.reporter) {
          shortForms.push({
            form: `*${shortParty}*, ${components.volume} ${components.reporter} at [pinpoint page]`,
            type: 'short_case',
            label: 'Short Case Form',
            whenToUse: 'Use after the full citation has been given once AND there are intervening citations to other sources (making Id. unavailable). Use only the first party name.',
            whereToPlace: `Use for any subsequent reference to this case when other citations appear between this reference and the last citation to ${shortParty}.`,
            warnings: [
              'Only use after the full citation has appeared at least once in the same document.',
              'The short form must appear within approximately 5 citations of the most recent full citation to this source.',
            ],
          });
        }

        analyzed.shortForms = shortForms;
      }

      logCitationCheck({
        userId: (req as any).user?.userId,
        mode: 'builder',
        inputText: inputText,
        results: analyzed,
        citationCount: 1,
        averageScore: analyzed.score,
      });
      res.json(analyzed);
      return;
    }

    // No parseable citation — try Claude API to build one
    logicTrace.push('No standard citation found. Using AI-powered citation builder...');

    const claudeResult = await buildCitationWithClaude(inputText);

    if (claudeResult) {
      logicTrace.push(...claudeResult.logicTrace);

      // Run rules on the Claude-built citation to get an accurate score
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
        inputText: inputText,
        results: builtResult,
        citationCount: 1,
        averageScore: builtScore,
      });
      res.json(builtResult);
      return;
    }

    // Claude not available — try to build from context clues
    logicTrace.push('AI builder not available. Attempting manual extraction...');

    const partyMatch = inputText.match(/(.+?)\s+v\.?\s+(.+?)(?:\s+(\d{4}))?$/i);

    if (partyMatch) {
      const partyOne = partyMatch[1].trim();
      const partyTwo = partyMatch[2].trim().replace(/\s+\d{4}$/, '');
      const year = partyMatch[3] || inputText.match(/\b(\d{4})\b/)?.[1] || '';

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
          // Run rules on the verified citation for accurate scoring
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
 * POST /api/build/from-url — Resolve a URL to citation metadata, then format via Claude.
 */
buildRouter.post('/from-url', validateFromUrl, async (req: Request, res: Response) => {
  try {
    const { url, citationType } = req.body as { url: string; citationType?: CitationTypeId };

    const resolved = await resolveUrl(url);

    if (!resolved.accessible || Object.keys(resolved.metadata).length === 0) {
      res.json({
        citation: null,
        shortForm: null,
        footnote: null,
        sourceUrl: url,
        components: {},
        missingFields: [],
        confidence: 0,
        suggestManual: true,
      });
      return;
    }

    const metaSummary = Object.entries(resolved.metadata)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');
    const prompt = citationType
      ? `Build a Bluebook ${citationType} citation from this ${resolved.source} source. URL: ${url}. Metadata: ${metaSummary}`
      : `Build a Bluebook citation from this ${resolved.source} source. URL: ${url}. Metadata: ${metaSummary}`;

    const claudeResult = await buildCitationWithClaude(prompt);

    if (claudeResult) {
      const missingFields = Object.entries(resolved.metadata)
        .filter(([, v]) => !v)
        .map(([k]) => k);

      res.json({
        citation: claudeResult.citation,
        shortForm: claudeResult.shortForms?.[0] ?? null,
        footnote: claudeResult.citation,
        sourceUrl: url,
        components: resolved.metadata,
        missingFields,
        confidence: missingFields.length === 0 ? 0.9 : 0.6,
        suggestManual: missingFields.length > 2,
      });
      return;
    }

    res.json({
      citation: null,
      shortForm: null,
      footnote: null,
      sourceUrl: url,
      components: resolved.metadata,
      missingFields: [],
      confidence: 0,
      suggestManual: true,
    });
  } catch (error) {
    console.error('From-URL error:', error);
    res.status(500).json({ error: 'URL citation build failed' });
  }
});

/**
 * POST /api/build/check-url — Instant URL source identification + accessibility check.
 * Called as the user types a URL for instant feedback.
 */
buildRouter.post('/check-url', validateCheckUrl, async (req: Request, res: Response) => {
  try {
    const { url } = req.body as { url: string };
    const start = performance.now();

    const identified = identifySource(url);
    if (identified) {
      const elapsed = Math.round(performance.now() - start);
      res.json({
        accessible: true,
        source: identified.source,
        identifier: identified.identifier,
        resolveTimeMs: elapsed,
      });
      return;
    }

    // No pattern match — do a HEAD request with 3s timeout
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    try {
      const headRes = await fetch(url, {
        method: 'HEAD',
        redirect: 'follow',
        signal: controller.signal,
      });
      const elapsed = Math.round(performance.now() - start);
      res.json({
        accessible: headRes.ok,
        resolveTimeMs: elapsed,
      });
    } catch {
      const elapsed = Math.round(performance.now() - start);
      res.json({
        accessible: false,
        resolveTimeMs: elapsed,
      });
    } finally {
      clearTimeout(timer);
    }
  } catch (error) {
    console.error('Check-URL error:', error);
    res.status(500).json({ error: 'URL check failed' });
  }
});

/**
 * POST /api/build/from-pdf — Extract citation from uploaded PDF.
 * TODO: Implement PDF text extraction and citation building
 */
buildRouter.post('/from-pdf', (_req: Request, res: Response) => {
  res.status(501).json({ error: 'PDF extraction coming soon' });
});
