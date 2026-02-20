import { Router, type Request, type Response } from 'express';
import { extractParseAndResolve, normalizeCitationInput, extractFootnoteCitations, resolveCitations } from '@legalcitation/citation-parser';
import { runFullAnalysis, runFootnoteAnalysis, calculateScore } from '@legalcitation/rule-engine';
import type { AnalyzedCitation, CaseComponents, CitationContext, DocumentCitationMap, ParsedCitation } from '@legalcitation/shared';
import { stripMarkersWithOffsetMap } from '@legalcitation/shared';
import { validateAnalyzeText } from '../middleware/validation.js';
import { cachedVerifyCaseCitation } from '../services/verification-cache.js';
import { logCitationCheck } from '../services/citation-logger.js';
import { matchPinpointToDocument } from '../services/pinpoint-matcher.js';
import { generateShortForms, generateShortFormSuggestions } from '../services/short-form-generator.js';
import { buildLogicTrace } from '../services/logic-trace.js';

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

    // Strip formatting markers before detection so positions are clean,
    // then translate positions back to the original marker-inclusive text
    const { stripped, toOriginal } = stripMarkersWithOffsetMap(text);
    const hasMarkers = stripped.length !== text.length;

    // Try standard extraction with resolution first, then normalized
    let { citations: parsed, resolution } = extractParseAndResolve(stripped, context);
    if (parsed.length === 0) {
      const normalized = normalizeCitationInput(stripped);
      if (normalized !== stripped) {
        const result = extractParseAndResolve(normalized, context);
        parsed = result.citations;
        resolution = result.resolution;
      }
    }

    // Translate positions back to original text coordinates if markers were present
    if (hasMarkers) {
      for (const citation of parsed) {
        if (citation.position) {
          citation.position = {
            start: toOriginal(citation.position.start),
            end: toOriginal(citation.position.end),
          };
          const mappedStart = citation.position.start;
          const mappedEnd = citation.position.end;
          if (
            Number.isFinite(mappedStart) &&
            Number.isFinite(mappedEnd) &&
            mappedStart >= 0 &&
            mappedEnd > mappedStart &&
            mappedEnd <= text.length
          ) {
            // Preserve marker boundaries around mapped spans (e.g., *Id.*)
            // so typeface checks and UI rendering can retain italics/underline.
            let rawStart = mappedStart;
            let rawEnd = mappedEnd;
            if (rawStart > 0 && (text[rawStart - 1] === '*' || text[rawStart - 1] === '_')) {
              rawStart -= 1;
            }
            if (rawEnd < text.length && (text[rawEnd] === '*' || text[rawEnd] === '_')) {
              rawEnd += 1;
            }
            citation.rawText = text.slice(rawStart, rawEnd);
          }
        }
      }
    }

    // Run rules on all citations (including context rules) with resolution data
    const issueMap = runFullAnalysis(parsed, text, resolution);

    // Build analyzed citation results
    const results: AnalyzedCitation[] = parsed.map(citation => {
      const issues = issueMap.get(citation.id) || [];
      const score = calculateScore(issues);

      const logicTrace = buildLogicTrace(citation, issues, resolution);

      const analyzed: AnalyzedCitation = {
        parsed: citation,
        issues,
        verificationStatus: 'pending',
        discrepancies: [],
        referenceExamples: [],
        logicTrace,
        score,
      };

      const shortForms = generateShortForms(citation);
      if (shortForms.length > 0) {
        analyzed.shortForms = shortForms;
      }

      return analyzed;
    });

    // Verify case citations in parallel
    await Promise.all(results.map(async (analyzed) => {
      if (analyzed.parsed.type !== 'case') return;

      const components = analyzed.parsed.components as CaseComponents;

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
    }));

    // Post-processing: detect duplicate case citations and suggest short forms
    const shortFormSuggestions = generateShortFormSuggestions(results, text);
    if (shortFormSuggestions.length > 0) {
      for (const suggestion of shortFormSuggestions) {
        const targetIdx = suggestion.citationIndex;
        if (targetIdx >= 0 && targetIdx < results.length) {
          if (!results[targetIdx].shortFormSuggestions) {
            results[targetIdx].shortFormSuggestions = [];
          }
          results[targetIdx].shortFormSuggestions!.push(suggestion);
        }
      }
    }

    // Even if no citations found, return 200 with empty results (never 400 for in-text)
    logCitationCheck({
      userId: req.user?.userId,
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

/**
 * POST /api/analyze/footnotes — Analyze text with footnote-structured citations
 * Parses footnote boundaries, validates cross-references, and checks ordering.
 */
analyzeRouter.post('/footnotes', validateAnalyzeText, async (req: Request, res: Response) => {
  try {
    const { text, documentIds } = req.body as {
      text: string;
      documentIds?: string[];
    };

    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text is required' });
      return;
    }

    const { stripped, toOriginal } = stripMarkersWithOffsetMap(text);
    const hasMarkers = stripped.length !== text.length;

    const parsedFootnotes = extractFootnoteCitations(stripped);

    if (parsedFootnotes.length === 0) {
      res.json({
        results: [],
        citationCount: 0,
        footnoteCount: 0,
        footnotes: [],
        integrityReport: { totalCitations: 0, totalFootnotes: 0, crossReferenceIssues: [], citationOrderIssues: [] },
      });
      return;
    }

    // Translate positions back if markers were present
    if (hasMarkers) {
      for (const fn of parsedFootnotes) {
        for (const citation of fn.citations) {
          if (citation.position) {
            citation.position = {
              start: toOriginal(citation.position.start),
              end: toOriginal(citation.position.end),
            };
            const mappedStart = citation.position.start;
            const mappedEnd = citation.position.end;
            if (
              Number.isFinite(mappedStart) &&
              Number.isFinite(mappedEnd) &&
              mappedStart >= 0 &&
              mappedEnd > mappedStart &&
              mappedEnd <= text.length
            ) {
              let rawStart = mappedStart;
              let rawEnd = mappedEnd;
              if (rawStart > 0 && (text[rawStart - 1] === '*' || text[rawStart - 1] === '_')) {
                rawStart -= 1;
              }
              if (rawEnd < text.length && (text[rawEnd] === '*' || text[rawEnd] === '_')) {
                rawEnd += 1;
              }
              citation.rawText = text.slice(rawStart, rawEnd);
            }
          }
        }
      }
    }

    // Build DocumentCitationMap
    const footnoteMap = new Map<number, ParsedCitation[]>();
    const allCitations: ParsedCitation[] = [];
    for (const fn of parsedFootnotes) {
      footnoteMap.set(fn.footnoteNumber, fn.citations);
      allCitations.push(...fn.citations);
    }

    const docMap: DocumentCitationMap = {
      footnotes: footnoteMap,
      allCitations,
      footnoteCount: parsedFootnotes.length,
    };

    // Resolve citations across all footnotes for accurate cross-reference validation
    const resolution = resolveCitations(allCitations);

    // Run footnote analysis with resolution data
    const { issueMap, integrityReport } = runFootnoteAnalysis(docMap, text, resolution);

    // Build analyzed citation results
    const results: AnalyzedCitation[] = allCitations.map(citation => {
      const issues = issueMap.get(citation.id) || [];
      const score = calculateScore(issues);
      const logicTrace = buildLogicTrace(citation, issues, resolution);
      // Prepend footnote-specific context
      if (citation.footnoteContext) {
        logicTrace.unshift(`Located in footnote ${citation.footnoteContext.footnoteNumber} (citation ${citation.footnoteContext.positionInFootnote + 1} of ${citation.footnoteContext.totalInFootnote}).`);
      }

      return {
        parsed: citation,
        issues,
        verificationStatus: 'pending' as const,
        discrepancies: [],
        referenceExamples: [],
        logicTrace,
        score,
      };
    });

    // Verify case citations in parallel
    await Promise.all(results.map(async (analyzed) => {
      if (analyzed.parsed.type !== 'case') return;

      const components = analyzed.parsed.components as CaseComponents;
      try {
        const verification = await cachedVerifyCaseCitation(components);
        analyzed.verificationStatus = verification.status;
        analyzed.discrepancies = verification.discrepancies;
        analyzed.referenceExamples = verification.referenceExamples;
        analyzed.verifiedCitation = verification.verifiedCitation;
        analyzed.logicTrace.push(...verification.logicTrace);
      } catch {
        analyzed.verificationStatus = 'pending';
        analyzed.logicTrace.push('External verification temporarily unavailable.');
      }

      if (components.pinCite && documentIds && documentIds.length > 0) {
        for (const docId of documentIds) {
          try {
            const match = await matchPinpointToDocument(components.pinCite, docId, components.firstPage);
            if (match && match.matched) {
              analyzed.pinpointMatch = match;
              break;
            }
          } catch {
            // Non-critical
          }
        }
      }
    }));

    const footnoteSummary = parsedFootnotes.map(fn => ({
      number: fn.footnoteNumber,
      citationCount: fn.citations.length,
      citationIds: fn.citations.map(c => c.id),
    }));

    logCitationCheck({
      userId: req.user?.userId,
      mode: 'footnote',
      inputText: text,
      results,
      citationCount: results.length,
      averageScore: results.length > 0
        ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
        : undefined,
    });

    res.json({
      results,
      citationCount: results.length,
      footnoteCount: parsedFootnotes.length,
      footnotes: footnoteSummary,
      integrityReport,
    });
  } catch (error) {
    console.error('Footnote analysis error:', error);
    res.status(500).json({ error: 'Footnote analysis failed' });
  }
});

