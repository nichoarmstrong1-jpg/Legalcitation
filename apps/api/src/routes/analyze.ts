import { Router, type Request, type Response } from 'express';
import { extractAndParseCitations, normalizeCitationInput } from '@legalcitation/citation-parser';
import { runFullAnalysis, calculateScore } from '@legalcitation/rule-engine';
import type { AnalyzedCitation, CaseComponents, CitationContext, ValidationIssue, ShortFormEntry, ShortFormSuggestion } from '@legalcitation/shared';
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

      // Generate short forms for case citations
      if (citation.type === 'case') {
        const comp = citation.components as CaseComponents;
        const shortParty = comp.partyOne;

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

        // Short case form (only if we have reporter info)
        if (comp.volume && comp.reporter) {
          shortForms.push({
            form: `*${shortParty}*, ${comp.volume} ${comp.reporter} at [pinpoint page]`,
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

      results.push(analyzed);
    }

    // Post-processing: detect duplicate case citations and suggest short forms
    const shortFormSuggestions = generateShortFormSuggestions(results, text);
    if (shortFormSuggestions.length > 0) {
      // Attach suggestions to the first citation result
      results[0].shortFormSuggestions = shortFormSuggestions;
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

/**
 * Detect duplicate case citations in the analyzed results and generate
 * natural-language suggestions for where to use short forms.
 */
function generateShortFormSuggestions(
  results: AnalyzedCitation[],
  fullText: string
): ShortFormSuggestion[] {
  const suggestions: ShortFormSuggestion[] = [];

  // Track case citations by a normalized key (partyOne + reporter + volume)
  const caseOccurrences = new Map<string, number[]>();

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (result.parsed?.type !== 'case') continue;

    const comp = result.parsed.components as CaseComponents;
    const key = `${comp.partyOne}|${comp.volume}|${comp.reporter}`.toLowerCase();

    if (!caseOccurrences.has(key)) {
      caseOccurrences.set(key, []);
    }
    caseOccurrences.get(key)!.push(i);
  }

  // For each case that appears more than once, suggest short forms for subsequent appearances
  for (const [, indices] of caseOccurrences) {
    if (indices.length < 2) continue;

    const firstIdx = indices[0];
    const firstResult = results[firstIdx];
    const firstComp = firstResult.parsed.components as CaseComponents;
    const caseName = firstComp.partyTwo
      ? `${firstComp.partyOne} v. ${firstComp.partyTwo}`
      : firstComp.partyOne;

    for (let j = 1; j < indices.length; j++) {
      const dupIdx = indices[j];
      const dupResult = results[dupIdx];
      const pos = dupResult.parsed?.position;

      // Extract a snippet of surrounding text for context
      let contextSnippet = '';
      if (pos) {
        const snippetStart = Math.max(0, pos.start - 80);
        const rawSnippet = fullText.slice(snippetStart, pos.start).trim();
        // Get the last sentence fragment
        const lastSentence = rawSnippet.split(/[.!?]\s+/).pop() || rawSnippet;
        contextSnippet = lastSentence.slice(0, 60);
        if (lastSentence.length > 60) contextSnippet += '...';
      }

      // Determine if the previous citation is the same case (Id.) or different (short form)
      const prevIdx = dupIdx - 1;
      const prevIsSameCase =
        prevIdx >= 0 &&
        results[prevIdx].parsed?.type === 'case' &&
        (() => {
          const prevComp = results[prevIdx].parsed.components as CaseComponents;
          return prevComp.partyOne.toLowerCase() === firstComp.partyOne.toLowerCase() &&
                 prevComp.volume === firstComp.volume;
        })();

      if (prevIsSameCase) {
        suggestions.push({
          citationIndex: dupIdx,
          suggestedForm: '*Id.*',
          reason: `This is the same case as the immediately preceding citation. Use Id. instead of repeating the full citation to ${caseName}.`,
          contextSnippet: contextSnippet
            ? `After the text "${contextSnippet}", replace the full citation with *Id.*`
            : `Replace this repeated citation to ${caseName} with *Id.*`,
        });
      } else {
        const shortForm = firstComp.volume && firstComp.reporter
          ? `*${firstComp.partyOne}*, ${firstComp.volume} ${firstComp.reporter} at [page]`
          : `*${firstComp.partyOne}*`;

        suggestions.push({
          citationIndex: dupIdx,
          suggestedForm: shortForm,
          reason: `You already cited ${caseName} in full earlier. Since other sources were cited in between, use the short case form.`,
          contextSnippet: contextSnippet
            ? `After the text "${contextSnippet}", replace the full citation with the short form: ${shortForm}`
            : `Replace this citation to ${caseName} with: ${shortForm}`,
        });
      }
    }
  }

  return suggestions;
}
