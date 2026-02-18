import { eq } from 'drizzle-orm';
import { extractAndParseCitations } from '@legalcitation/citation-parser';
import { runFullAnalysis, calculateScore } from '@legalcitation/rule-engine';
import type {
  ParsedCitation,
  CaseComponents,
  ValidationIssue,
  AnnotationStatus,
} from '@legalcitation/shared';
import { getDb, schema } from '../db/index.js';
import { cachedVerifyCaseCitation } from './verification-cache.js';
import { matchCitationToSource } from './source-matcher.js';
import { emitProgress, cleanupProgress } from './spading-progress.js';
import type { PageMapping } from './document-processor.js';

const BATCH_SIZE = 5;

interface SourceDoc {
  id: string;
  fileName: string;
  caseName: string | null;
  citation: string | null;
  extractedText: string;
  pageMapping: PageMapping[] | null;
}

/**
 * Extract quoted text near a citation (looking backward in the journal text).
 */
function extractQuotedTextNearCitation(
  fullText: string,
  citationStart: number
): string | null {
  const lookback = Math.max(0, citationStart - 500);
  const beforeText = fullText.slice(lookback, citationStart);

  // Match the last quoted passage before the citation
  // Handles both straight and curly quotes
  const quoteMatch = beforeText.match(/["\u201C]([^"\u201D]{10,300})["\u201D]\s*$/);
  if (quoteMatch) return quoteMatch[1];

  return null;
}

/**
 * Verify a quote against the source document text.
 * Uses fuzzy matching to handle whitespace/punctuation differences.
 */
function verifyQuote(
  quote: string,
  sourceText: string
): { accurate: boolean; foundText: string | null } {
  // Normalize both texts for comparison
  const normalizeForComparison = (text: string): string =>
    text
      .replace(/\s+/g, ' ')
      .replace(/[""]/g, '"')
      .replace(/['']/g, "'")
      .replace(/—/g, '--')
      .toLowerCase()
      .trim();

  const normalizedQuote = normalizeForComparison(quote);
  const normalizedSource = normalizeForComparison(sourceText);

  // Direct substring match
  if (normalizedSource.includes(normalizedQuote)) {
    // Find the actual text in the original source
    const idx = normalizedSource.indexOf(normalizedQuote);
    const foundText = sourceText.slice(idx, idx + quote.length + 50).trim();
    return { accurate: true, foundText };
  }

  // Try matching with more aggressive normalization (strip all punctuation)
  const stripPunct = (text: string): string =>
    text.replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ');

  if (stripPunct(normalizedSource).includes(stripPunct(normalizedQuote))) {
    return { accurate: true, foundText: null };
  }

  return { accurate: false, foundText: null };
}

/**
 * Match a pinpoint citation against a source document's page mapping.
 * Adapted from pinpoint-matcher.ts to work with project documents.
 */
function matchPinpoint(
  pinCite: string,
  firstPage: string | undefined,
  pageMapping: PageMapping[]
): { pageNumber: number; textSnippet: string } | null {
  const cleaned = pinCite.replace(/\s*n\.\d+/g, '').trim();
  const pageNum = parseInt(cleaned, 10);
  if (isNaN(pageNum)) return null;

  // Convert reporter page to PDF page using firstPage as anchor
  let pdfPage = pageNum;
  if (firstPage) {
    const anchor = parseInt(firstPage, 10);
    if (!isNaN(anchor)) {
      pdfPage = pageNum - anchor + 1;
    }
  }

  if (pdfPage < 1) return null;

  const page = pageMapping.find(p => p.pageNumber === pdfPage);
  if (!page) return null;

  const snippet = page.text.trim().slice(0, 300).replace(/\s+/g, ' ');
  return { pageNumber: pdfPage, textSnippet: snippet };
}

/**
 * Process a single citation and return the annotation data.
 */
async function processCitation(
  citation: ParsedCitation,
  journalText: string,
  sourceDocs: SourceDoc[],
  issueMap: Map<string, ValidationIssue[]>
): Promise<{
  status: AnnotationStatus;
  issues: ValidationIssue[];
  score: number;
  verifiedCitation: string | null;
  discrepancies: unknown[];
  logicTrace: string[];
  matchedDocumentId: string | null;
  matchedPageNumber: number | null;
  matchedTextSnippet: string | null;
  quotedText: string | null;
  sourceText: string | null;
  quoteAccurate: boolean | null;
}> {
  const issues = issueMap.get(citation.id) || [];
  const score = calculateScore(issues);
  let status: AnnotationStatus = 'pending';
  let verifiedCitation: string | null = null;
  let discrepancies: unknown[] = [];
  const logicTrace: string[] = [
    `Identified as a ${citation.type} citation.`,
    `Checked against ${issues.length} Bluebook rules.`,
  ];
  let matchedDocumentId: string | null = null;
  let matchedPageNumber: number | null = null;
  let matchedTextSnippet: string | null = null;
  let quotedText: string | null = null;
  let sourceText: string | null = null;
  let quoteAccurate: boolean | null = null;

  // Source matching
  const sourceMatch = matchCitationToSource(citation, sourceDocs);
  if (sourceMatch) {
    matchedDocumentId = sourceMatch.documentId;
    const matchedDoc = sourceDocs.find(d => d.id === sourceMatch.documentId);
    logicTrace.push(
      `Matched to source document "${matchedDoc?.fileName}" (${sourceMatch.matchMethod}, confidence: ${Math.round(sourceMatch.confidence * 100)}%).`
    );

    // Pinpoint verification
    if (citation.type === 'case' && matchedDoc?.pageMapping) {
      const components = citation.components as CaseComponents;
      if (components.pinCite) {
        const pinpointResult = matchPinpoint(
          components.pinCite,
          components.firstPage,
          matchedDoc.pageMapping
        );
        if (pinpointResult) {
          matchedPageNumber = pinpointResult.pageNumber;
          matchedTextSnippet = pinpointResult.textSnippet;
          logicTrace.push(
            `Pinpoint page ${components.pinCite} verified at PDF page ${pinpointResult.pageNumber}.`
          );
        } else {
          logicTrace.push(
            `Pinpoint page ${components.pinCite} could not be located in the source document.`
          );
        }
      }
    }

    // Quote verification
    quotedText = extractQuotedTextNearCitation(journalText, citation.position.start);
    if (quotedText && matchedDoc) {
      const quoteResult = verifyQuote(quotedText, matchedDoc.extractedText);
      quoteAccurate = quoteResult.accurate;
      sourceText = quoteResult.foundText;
      logicTrace.push(
        quoteResult.accurate
          ? 'Quoted text verified against source document.'
          : 'WARNING: Quoted text could not be found in the source document.'
      );
    }
  } else {
    logicTrace.push('No matching source document found among uploaded documents.');
  }

  // AI verification (for case citations)
  if (citation.type === 'case') {
    const components = citation.components as CaseComponents;
    try {
      const verification = await cachedVerifyCaseCitation(components);
      verifiedCitation = verification.verifiedCitation || null;
      discrepancies = verification.discrepancies || [];
      logicTrace.push(...verification.logicTrace);
    } catch (err) {
      logicTrace.push('AI verification temporarily unavailable.');
    }
  }

  // Determine final status
  if (!sourceMatch) {
    status = 'not_found';
  } else if (quoteAccurate === false) {
    status = 'quote_mismatch';
  } else if (score < 60) {
    status = 'format_error';
  } else if (
    sourceMatch.confidence >= 0.8 &&
    score >= 80
  ) {
    status = 'verified';
  } else {
    status = 'partial_match';
  }

  return {
    status,
    issues,
    score,
    verifiedCitation,
    discrepancies,
    logicTrace,
    matchedDocumentId,
    matchedPageNumber,
    matchedTextSnippet,
    quotedText,
    sourceText,
    quoteAccurate,
  };
}

/**
 * Run the full spading pipeline for a project.
 * Processes citations in parallel batches of 5.
 */
export async function runSpadingPipeline(projectId: string): Promise<void> {
  const db = getDb();

  try {
    // Status already set to 'processing' by the route handler (atomic guard).
    // Emit initial progress event.
    emitProgress(projectId, {
      progress: 5,
      currentStep: 'Loading journal entry...',
      status: 'processing',
    });

    // Step 1: Load journal document
    const [project] = await db
      .select()
      .from(schema.spadingProjects)
      .where(eq(schema.spadingProjects.id, projectId));

    if (!project?.journalDocumentId) {
      throw new Error('No journal entry uploaded for this project.');
    }

    const [journalDoc] = await db
      .select()
      .from(schema.projectDocuments)
      .where(eq(schema.projectDocuments.id, project.journalDocumentId));

    if (!journalDoc) {
      throw new Error('Journal document not found.');
    }

    const journalText = journalDoc.extractedText;

    // Step 2: Parse all citations
    emitProgress(projectId, {
      progress: 10,
      currentStep: 'Parsing citations...',
      status: 'processing',
    });

    const parsedCitations = extractAndParseCitations(journalText, 'citation_sentence');

    if (parsedCitations.length === 0) {
      await db
        .update(schema.spadingProjects)
        .set({
          status: 'completed',
          progress: 100,
          citationCount: 0,
          verifiedCount: 0,
          issueCount: 0,
          currentStep: 'No citations found',
          completedAt: new Date(),
        })
        .where(eq(schema.spadingProjects.id, projectId));

      emitProgress(projectId, {
        progress: 100,
        currentStep: 'No citations found in journal entry.',
        totalCitations: 0,
        status: 'completed',
      });
      return;
    }

    await db
      .update(schema.spadingProjects)
      .set({
        citationCount: parsedCitations.length,
        currentStep: `Found ${parsedCitations.length} citations. Running rule checks...`,
      })
      .where(eq(schema.spadingProjects.id, projectId));

    emitProgress(projectId, {
      progress: 15,
      currentStep: `Found ${parsedCitations.length} citations. Running rule checks...`,
      totalCitations: parsedCitations.length,
      status: 'processing',
    });

    // Run rule engine on all citations at once (includes context rules)
    const issueMap = runFullAnalysis(parsedCitations, journalText);

    // Step 3: Load source documents
    emitProgress(projectId, {
      progress: 20,
      currentStep: 'Loading source documents...',
      totalCitations: parsedCitations.length,
      status: 'processing',
    });

    const sourceDocsRaw = await db
      .select()
      .from(schema.projectDocuments)
      .where(eq(schema.projectDocuments.projectId, projectId));

    const sourceDocs: SourceDoc[] = sourceDocsRaw
      .filter(d => d.role === 'source')
      .map(d => ({
        id: d.id,
        fileName: d.fileName,
        caseName: d.caseName,
        citation: d.citation,
        extractedText: d.extractedText,
        pageMapping: d.pageMapping as PageMapping[] | null,
      }));

    // Step 4: Process citations in parallel batches
    // Clear any existing annotations from a previous run
    await db
      .delete(schema.spadingAnnotations)
      .where(eq(schema.spadingAnnotations.projectId, projectId));

    let completedCount = 0;
    let verifiedCount = 0;
    let issueCount = 0;

    for (let i = 0; i < parsedCitations.length; i += BATCH_SIZE) {
      const batch = parsedCitations.slice(i, i + BATCH_SIZE);

      const results = await Promise.allSettled(
        batch.map(citation => processCitation(citation, journalText, sourceDocs, issueMap))
      );

      // Save each result
      for (let j = 0; j < results.length; j++) {
        const citation = batch[j];
        const result = results[j];

        if (result.status === 'fulfilled') {
          const data = result.value;

          await db.insert(schema.spadingAnnotations).values({
            projectId,
            startOffset: citation.position.start,
            endOffset: citation.position.end,
            rawCitationText: citation.rawText,
            parsedCitation: citation as unknown as Record<string, unknown>,
            status: data.status,
            issues: data.issues as unknown as Record<string, unknown>[],
            score: data.score,
            verifiedCitation: data.verifiedCitation,
            discrepancies: data.discrepancies as unknown as Record<string, unknown>[],
            logicTrace: data.logicTrace as unknown as string[],
            matchedDocumentId: data.matchedDocumentId,
            matchedPageNumber: data.matchedPageNumber,
            matchedTextSnippet: data.matchedTextSnippet,
            quotedText: data.quotedText,
            sourceText: data.sourceText,
            quoteAccurate: data.quoteAccurate,
          });

          if (data.status === 'verified') verifiedCount++;
          if (data.issues.length > 0) issueCount++;
        } else {
          // Citation processing failed — store as error
          await db.insert(schema.spadingAnnotations).values({
            projectId,
            startOffset: citation.position.start,
            endOffset: citation.position.end,
            rawCitationText: citation.rawText,
            parsedCitation: citation as unknown as Record<string, unknown>,
            status: 'error',
            logicTrace: [`Processing error: ${result.reason}`] as unknown as string[],
          });
          issueCount++;
        }

        completedCount++;
      }

      // Update progress after each batch
      const progress = Math.round(20 + (80 * completedCount / parsedCitations.length));
      const step = `Processed ${completedCount}/${parsedCitations.length} citations...`;

      await db
        .update(schema.spadingProjects)
        .set({
          progress,
          currentStep: step,
          verifiedCount,
          issueCount,
        })
        .where(eq(schema.spadingProjects.id, projectId));

      emitProgress(projectId, {
        progress,
        currentStep: step,
        citationIndex: completedCount,
        totalCitations: parsedCitations.length,
        status: 'processing',
      });
    }

    // Step 5: Mark as completed
    await db
      .update(schema.spadingProjects)
      .set({
        status: 'completed',
        progress: 100,
        verifiedCount,
        issueCount,
        currentStep: 'Spading complete',
        completedAt: new Date(),
      })
      .where(eq(schema.spadingProjects.id, projectId));

    emitProgress(projectId, {
      progress: 100,
      currentStep: `Complete. ${verifiedCount}/${parsedCitations.length} citations verified.`,
      citationIndex: parsedCitations.length,
      totalCitations: parsedCitations.length,
      status: 'completed',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Spading pipeline error:', error);

    await db
      .update(schema.spadingProjects)
      .set({
        status: 'error',
        errorMessage,
        currentStep: 'Error: ' + errorMessage,
      })
      .where(eq(schema.spadingProjects.id, projectId));

    emitProgress(projectId, {
      progress: 0,
      currentStep: 'Error: ' + errorMessage,
      status: 'error',
      errorMessage,
    });
  } finally {
    // Clean up SSE emitter after a delay to allow clients to receive final event
    setTimeout(() => cleanupProgress(projectId), 5000);
  }
}
