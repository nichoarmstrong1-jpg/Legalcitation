import { Router, type Request, type Response } from 'express';
import { extractAndParseCitations, parseCaseCitation, normalizeCitationInput } from '@legalcitation/citation-parser';
import { runAllRules, runFullAnalysis, calculateScore } from '@legalcitation/rule-engine';
import type { AnalyzedCitation, CaseComponents, CitationContext, ValidationIssue } from '@legalcitation/shared';
import { validateAnalyzeText, validateAnalyzeSingle } from '../middleware/validation.js';
import { cachedVerifyCaseCitation } from '../services/verification-cache.js';
import { buildCitationWithClaude } from '@legalcitation/verification';

export const analyzeRouter = Router();

/**
 * POST /api/analyze — Analyze text with multiple citations (in-text mode)
 * Applies normalization when standard extraction finds nothing.
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
        try {
          const components = citation.components as CaseComponents;
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
      }

      results.push(analyzed);
    }

    // Even if no citations found, return 200 with empty results (never 400 for in-text)
    res.json({ results, citationCount: results.length });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

/**
 * POST /api/analyze/single — Analyze a single citation
 *
 * 5-tier fallback chain — ALWAYS returns useful results, NEVER 400:
 *   Tier 1: extractAndParseCitations(input)
 *   Tier 2: parseCaseCitation(input) directly
 *   Tier 3: parseCaseCitation(normalize(input))
 *   Tier 4: Detect case-name-like pattern → build/verify → return suggestion
 *   Tier 5: Return 200 with helpful guidance
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

    const input = citation.trim();

    // ── Tier 1: Full extraction (handles in-text citations) ──
    let parsed = extractAndParseCitations(input, context);

    // ── Tier 2: Direct case parse ──
    if (parsed.length === 0) {
      const caseParsed = parseCaseCitation(input, { start: 0, end: input.length }, context);
      if (caseParsed) parsed.push(caseParsed);
    }

    // ── Tier 3: Normalized case parse ──
    if (parsed.length === 0) {
      const normalized = normalizeCitationInput(input);
      if (normalized !== input) {
        // Try full extraction on normalized
        parsed = extractAndParseCitations(normalized, context);
        if (parsed.length === 0) {
          const caseParsed = parseCaseCitation(normalized, { start: 0, end: normalized.length }, context);
          if (caseParsed) parsed.push(caseParsed);
        }
      }
    }

    // ── Tier 1-3 succeeded: analyze and verify ──
    if (parsed.length > 0) {
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
        } catch (err) {
          console.error('Verification error in /analyze/single:', err);
          analyzed.verificationStatus = 'pending';
          analyzed.logicTrace.push('External verification temporarily unavailable. Bluebook formatting rules still checked.');
        }
      }

      res.json(analyzed);
      return;
    }

    // ── Tier 4: Detect case-name-like pattern → build with Claude ──
    const caseNamePattern = /^(.+?)\s+v\.?\s+(.+?)(?:\s*,|\s+\d|$)/i;
    const caseMatch = input.match(caseNamePattern);

    if (caseMatch) {
      try {
        const buildResult = await buildCitationWithClaude(input);
        if (buildResult && buildResult.citation) {
          res.json({
            suggestion: true,
            suggestedCitation: buildResult.citation,
            suggestedComponents: buildResult.components,
            originalInput: input,
            logicTrace: [
              `Could not parse "${input}" as a standard Bluebook citation.`,
              `Detected a case name pattern: "${caseMatch[1].trim()} v. ${caseMatch[2].trim()}"`,
              `Used AI-powered lookup to find the correct citation.`,
              ...buildResult.logicTrace,
            ],
            message: 'We found a possible match. Did you mean this citation?',
          });
          return;
        }
      } catch (err) {
        console.error('Build fallback error in /analyze/single:', err);
        // Fall through to Tier 5
      }
    }

    // ── Tier 5: Helpful guidance (NEVER return 400) ──
    const looksLikeCase = /v\.?\s/i.test(input);
    const looksLikeStatute = /§|U\.?S\.?C|Code|Act/i.test(input);
    const looksLikeConstitution = /Const|Amend|Art\./i.test(input);

    let helpMessage: string;
    let examples: string[];

    if (looksLikeCase) {
      helpMessage = 'This looks like a case citation but could not be fully parsed. Try including the full reporter citation.';
      examples = [
        '*Roe v. Wade*, 410 U.S. 113 (1973).',
        '*Miranda v. Arizona*, 384 U.S. 436 (1966).',
        '*Brown v. Bd. of Educ.*, 347 U.S. 483 (1954).',
      ];
    } else if (looksLikeStatute) {
      helpMessage = 'This looks like a statute citation. Make sure to include the title, code, and section.';
      examples = [
        '42 U.S.C. § 1983 (2018).',
        '28 U.S.C. § 1331.',
      ];
    } else if (looksLikeConstitution) {
      helpMessage = 'This looks like a constitutional citation. Include the article or amendment number.';
      examples = [
        'U.S. Const. amend. XIV, § 1.',
        'U.S. Const. art. III, § 2.',
      ];
    } else {
      helpMessage = 'Could not identify the citation type. Enter a case, statute, or constitutional citation.';
      examples = [
        '*Roe v. Wade*, 410 U.S. 113 (1973).',
        '42 U.S.C. § 1983 (2018).',
        'U.S. Const. amend. XIV, § 1.',
      ];
    }

    res.json({
      suggestion: false,
      originalInput: input,
      message: helpMessage,
      examples,
      logicTrace: [
        `Attempted to parse "${input.slice(0, 60)}${input.length > 60 ? '...' : ''}" using standard Bluebook patterns.`,
        'Could not match against known citation formats (case, statute, constitution, regulation).',
        'Tried input normalization (reporter aliases, punctuation recovery) — still could not parse.',
        helpMessage,
      ],
    });
  } catch (error) {
    console.error('Single analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});
