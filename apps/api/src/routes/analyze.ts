import { Router, type Request, type Response } from 'express';
import { extractParseAndResolve, normalizeCitationInput, extractFootnoteCitations, resolveCitations, parseSingleSpan, mergeAdditionalCitations } from '@legalcitation/citation-parser';
import { runFullAnalysis, runFootnoteAnalysis } from '@legalcitation/rule-engine';
import type { CaseComponents, CitationContext, DocumentCitationMap, ParsedCitation } from '@legalcitation/shared';
import { stripMarkersWithOffsetMap } from '@legalcitation/shared';
import { detectMissedCitations, type LLMDetectedSpan } from '@legalcitation/verification';
import { validateAnalyzeText } from '../middleware/validation.js';
import { logCitationCheck } from '../services/citation-logger.js';
import { matchPinpointToDocument } from '../services/pinpoint-matcher.js';
import { generateShortFormSuggestions } from '../services/short-form-generator.js';
import { processVerifiedCitations } from '../services/process-citation.js';
import { v4 as uuid } from 'uuid';

/**
 * Build a minimal ParsedCitation for LLM-detected spans that no regex parser could handle.
 * Uses the LLM's type classification and stores the raw text for display.
 */
function buildFallbackCitation(
  span: LLMDetectedSpan,
  position: { start: number; end: number },
): ParsedCitation {
  return {
    id: uuid(),
    rawText: span.text,
    type: span.type === 'short_form' || span.type === 'id' || span.type === 'supra' || span.type === 'infra'
      ? span.type
      : span.type,
    context: 'citation_sentence',
    position,
    components: {
      type: 'short_case',
      pinCite: undefined,
    },
  };
}

export const analyzeRouter = Router();


/**
 * POST /api/analyze — Analyze text with multiple citations (in-text mode)
 * Every citation gets the same treatment as a single citation in the builder.
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

    // Strip formatting markers before detection so positions are clean
    const { stripped, toOriginal } = stripMarkersWithOffsetMap(text);
    const hasMarkers = stripped.length !== text.length;

    // Extract and parse citations with resolution
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
      translatePositions(parsed, text, toOriginal);
    }

    // LLM detection pass: find citations the regex missed
    const llmDetectedIds = new Set<string>();
    const llmExplanations = new Map<string, string>();
    try {
      const existingSpans = parsed
        .filter(c => c.position)
        .map(c => ({ text: c.rawText, start: c.position.start, end: c.position.end }));

      const llmResult = await detectMissedCitations(stripped, existingSpans);

      if (llmResult.spans.length > 0) {
        const llmParsed: ParsedCitation[] = [];
        for (const span of llmResult.spans) {
          const position = hasMarkers
            ? { start: toOriginal(span.start), end: toOriginal(span.end) }
            : { start: span.start, end: span.end };

          let citation = parseSingleSpan(span.text, position, stripped);
          if (!citation) {
            citation = buildFallbackCitation(span, position);
          }

          llmDetectedIds.add(citation.id);
          llmExplanations.set(citation.id, span.explanation);
          llmParsed.push(citation);
        }

        parsed = mergeAdditionalCitations(parsed, llmParsed);
        resolution = resolveCitations(parsed);
      }
    } catch (err) {
      console.error('LLM detection pass error (non-fatal):', err);
    }

    // Run context-aware rules (signal ordering, citation ordering, Id./supra chains)
    const issueMap = runFullAnalysis(parsed, text, resolution);

    // Process EVERY citation through the shared pipeline — identical to builder
    const results = await processVerifiedCitations(parsed, issueMap, {
      resolution,
      documentIds,
    });

    // Overlay LLM detection metadata onto results
    for (const result of results) {
      const isLlmDetected = llmDetectedIds.has(result.parsed.id);
      if (isLlmDetected) {
        result.detectionSource = 'llm';
        result.detectionExplanation = llmExplanations.get(result.parsed.id);
        const explanation = llmExplanations.get(result.parsed.id);
        if (explanation) {
          result.logicTrace.unshift(explanation);
        }
      }
    }

    // Post-processing: pinpoint matching for case citations with pinCites
    await addPinpointMatches(results, documentIds);

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
 * Every citation gets the same treatment as a single citation in the builder.
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
        translatePositions(fn.citations, text, toOriginal);
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

    // Resolve citations across all footnotes
    const resolution = resolveCitations(allCitations);

    // Run footnote analysis with resolution data
    const { issueMap, integrityReport } = runFootnoteAnalysis(docMap, text, resolution);

    // Process EVERY citation through the shared pipeline — identical to builder
    const results = await processVerifiedCitations(allCitations, issueMap, {
      resolution,
      documentIds,
    });

    // Add footnote-specific context to logic traces
    for (const result of results) {
      if (result.parsed.footnoteContext) {
        const fn = result.parsed.footnoteContext;
        result.logicTrace.unshift(
          `Located in footnote ${fn.footnoteNumber} (citation ${fn.positionInFootnote + 1} of ${fn.totalInFootnote}).`,
        );
      }
    }

    // Post-processing: pinpoint matching
    await addPinpointMatches(results, documentIds);

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

// --- Shared helpers ---

function translatePositions(
  citations: ParsedCitation[],
  originalText: string,
  toOriginal: (pos: number) => number,
): void {
  for (const citation of citations) {
    if (!citation.position) continue;

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
      mappedEnd <= originalText.length
    ) {
      let rawStart = mappedStart;
      let rawEnd = mappedEnd;
      if (rawStart > 0 && (originalText[rawStart - 1] === '*' || originalText[rawStart - 1] === '_')) {
        rawStart -= 1;
      }
      if (rawEnd < originalText.length && (originalText[rawEnd] === '*' || originalText[rawEnd] === '_')) {
        rawEnd += 1;
      }
      citation.rawText = originalText.slice(rawStart, rawEnd);
    }
  }
}

async function addPinpointMatches(
  results: Array<{ parsed: ParsedCitation; pinpointMatch?: { documentId: string; documentName: string; matched: boolean; pages: Array<{ pageNumber: number; found: boolean; textSnippet?: string }> }; logicTrace: string[] }>,
  documentIds?: string[],
): Promise<void> {
  if (!documentIds || documentIds.length === 0) return;

  await Promise.all(results.map(async (analyzed) => {
    if (analyzed.parsed.type !== 'case') return;

    const components = analyzed.parsed.components as CaseComponents;
    if (!components.pinCite) return;

    for (const docId of documentIds) {
      try {
        const match = await matchPinpointToDocument(
          components.pinCite,
          docId,
          components.firstPage,
        );
        if (match && match.matched) {
          analyzed.pinpointMatch = match;
          analyzed.logicTrace.push(
            `Pinpoint page verified against uploaded source "${match.documentName}".`,
          );
          break;
        }
      } catch {
        // Non-critical
      }
    }
  }));
}
