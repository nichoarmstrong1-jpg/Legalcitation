import Anthropic from '@anthropic-ai/sdk';
import { calculateScore, runAllRules } from '@legalcitation/rule-engine';
import type {
    CitationComponents,
    CitationType,
    CitationTypeId,
    ParsedCitation,
    ValidationIssue,
} from '@legalcitation/shared';
import { buildPrompt } from '@legalcitation/shared/prompts';
import { existsSync, readFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuid } from 'uuid';

const __filename_esm = fileURLToPath(import.meta.url);
const __dirname_esm = dirname(__filename_esm);

// --- Types ---

export interface BuildResponse {
  citation?: string;
  shortForm?: string;
  footnote?: string;
  courtDoc?: string;
  sourceUrl?: string;
  components: Record<string, string>;
  missingFields: string[];
  confidence: number;
  suggestManual: boolean;
  validationIssues: ValidationIssue[];
  corrections: Array<{ field: string; rule: string; before: string; after: string }>;
  logicTrace: string[];
}

// --- Claude client (mirrors verification package pattern) ---

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || '',
      maxRetries: 8,
    });
  }
  return client;
}

function withTimeout(ms: number): { signal: AbortSignal; clear: () => void } {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, clear: () => clearTimeout(timer) };
}

// --- CitationTypeId -> CitationType mapping ---

const TYPE_ID_TO_TYPE: Record<string, CitationType> = {
  journal_article: 'article',
  report: 'book',
  legislative: 'statute',
};

function toRuleEngineType(typeId: CitationTypeId): CitationType {
  return (TYPE_ID_TO_TYPE[typeId] as CitationType) ?? (typeId as CitationType);
}

// --- Bluebook context loading ---

const DATA_BASE_PATH = resolve(__dirname_esm, '../../../../packages/shared/src/data');

const TYPE_RULE_FILE_MAP: Record<string, string> = {
  case: 'case.md',
  statute: 'statute.md',
  constitution: 'constitution.md',
  regulation: 'regulation.md',
  journal_article: 'journal-article.md',
  book: 'book.md',
  report: 'report.md',
  restatement: 'restatement.md',
  legislative: 'legislative.md',
  website: 'website.md',
  newspaper: 'newspaper.md',
  unpublished: 'unpublished.md',
  ai_source: 'ai-source.md',
  social_media: 'social-media.md',
  audio_video: 'audio-video.md',
  brief: 'brief.md',
  record: 'record.md',
  treaty: 'treaty.md',
};

const TYPE_TABLE_MAP: Record<string, string[]> = {
  case: ['t1-federal.md', 't1-states.md', 't7-courts.md', 't6-case-names.md', 't8-explanatory.md'],
  statute: ['t1-federal.md', 't1-states.md', 't16-subdivisions.md'],
  constitution: ['t16-subdivisions.md'],
  regulation: ['t1-federal.md', 't16-subdivisions.md'],
  journal_article: ['t13-periodicals.md', 't6-case-names.md', 't10-geographic.md'],
  book: ['t14-publishing.md', 't6-case-names.md'],
  report: ['t9-legislative.md', 't6-case-names.md'],
  legislative: ['t9-legislative.md', 't6-case-names.md'],
  website: ['t10-geographic.md', 't12-months.md'],
  newspaper: ['t13-periodicals.md', 't6-case-names.md', 't10-geographic.md'],
  unpublished: ['t12-months.md'],
  social_media: ['t12-months.md'],
  audio_video: ['t12-months.md'],
  treaty: ['t2-foreign.md', 't3-intergovernmental.md', 't4-treaty-sources.md'],
};

function safeReadFile(filePath: string): string {
  if (!existsSync(filePath)) return '';
  const content = readFileSync(filePath, 'utf-8');
  if (content.includes('[Paste') || content.includes('[paste text]')) return '';
  return content;
}

export function loadBluebookContext(typeId: CitationTypeId): string {
  const rulesPath = join(DATA_BASE_PATH, 'bluebook-rules');
  const tablesPath = join(DATA_BASE_PATH, 'bluebook-tables');

  const sections: string[] = [];

  const generalRules = safeReadFile(join(rulesPath, 'general-rules.md'));
  if (generalRules) {
    sections.push(`<general_rules>\n${generalRules}\n</general_rules>`);
  }

  const ruleFile = TYPE_RULE_FILE_MAP[typeId];
  if (ruleFile) {
    const ruleText = safeReadFile(join(rulesPath, ruleFile));
    if (ruleText) {
      sections.push(`<type_rules>\n${ruleText}\n</type_rules>`);
    }
  }

  const tableFiles = TYPE_TABLE_MAP[typeId] ?? [];
  for (const tableFile of tableFiles) {
    const tableText = safeReadFile(join(tablesPath, tableFile));
    if (tableText) {
      sections.push(`<table file="${tableFile}">\n${tableText}\n</table>`);
    }
  }

  return sections.join('\n\n');
}

// --- JSON parsing helpers ---

function stripMarkdownFences(text: string): string {
  return text.replace(/^```(?:json)?\s*\n?/gm, '').replace(/\n?```\s*$/gm, '');
}

function parseJsonResponse<T>(text: string): T | null {
  const cleaned = stripMarkdownFences(text.trim());

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}

// --- Core pipeline ---

async function callClaude(prompt: string, timeoutMs: number = 30000): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const timeout = withTimeout(timeoutMs);
  try {
    const anthropic = getClient();
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2048,
      temperature: 0,
      messages: [{ role: 'user', content: prompt }],
    }, { signal: timeout.signal });

    timeout.clear();
    return response.content[0].type === 'text' ? response.content[0].text : null;
  } catch (error) {
    timeout.clear();
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[citation-pipeline] Claude call failed:', message);
    return null;
  }
}

interface ExtractionResult {
  components: Record<string, string>;
  citation?: string;
  shortForm?: string;
  footnote?: string;
  courtDoc?: string;
  confidence: number;
  missingFields: string[];
}

function constructParsedCitation(
  rawText: string,
  typeId: CitationTypeId,
  components: Record<string, string>,
): ParsedCitation {
  return {
    id: uuid(),
    rawText,
    type: toRuleEngineType(typeId),
    context: 'citation_sentence',
    position: { start: 0, end: rawText.length },
    components: components as unknown as CitationComponents,
  };
}

export async function buildCitation(
  input: string,
  typeId: CitationTypeId,
  mode: 'search' | 'url' | 'manual',
  style: 'law_review' | 'court_doc' = 'court_doc',
  preExtractedComponents?: Record<string, string>,
): Promise<BuildResponse> {
  const trace: string[] = [];
  const corrections: BuildResponse['corrections'] = [];
  let extractionConfidence = 0.5;
  let missingFields: string[] = [];
  let components: Record<string, string>;
  let citation: string | undefined;
  let shortForm: string | undefined;
  let footnote: string | undefined;
  let courtDoc: string | undefined;

  // Step 1: Extract components
  if (preExtractedComponents) {
    components = preExtractedComponents;
    extractionConfidence = 0.8;
    trace.push('Using pre-extracted components from URL resolver or manual input.');
  } else {
    trace.push(`Extracting citation components via AI (type: ${typeId}, mode: ${mode})...`);
    const prompt = buildPrompt(typeId, input, 'extract', style);
    const responseText = await callClaude(prompt);

    if (!responseText) {
      trace.push('AI extraction unavailable. Returning partial result.');
      return {
        components: {},
        missingFields: ['all'],
        confidence: 0.1,
        suggestManual: true,
        validationIssues: [],
        corrections: [],
        logicTrace: trace,
      };
    }

    const extracted = parseJsonResponse<Record<string, unknown>>(responseText);
    if (!extracted) {
      trace.push('Could not parse AI extraction response.');
      return {
        components: {},
        missingFields: ['all'],
        confidence: 0.1,
        suggestManual: true,
        validationIssues: [],
        corrections: [],
        logicTrace: trace,
      };
    }

    // Claude may return components nested or at the top level
    if (extracted.components && typeof extracted.components === 'object' && !Array.isArray(extracted.components)) {
      components = extracted.components as Record<string, string>;
    } else {
      // Treat the whole response as components, pulling out known meta fields
      const { confidence: _c, missingFields: _m, citation: _ci, shortForm: _s, footnote: _f, courtDoc: _d, ...rest } = extracted;
      components = Object.fromEntries(
        Object.entries(rest).filter(([, v]) => typeof v === 'string'),
      ) as Record<string, string>;
    }

    extractionConfidence = typeof extracted.confidence === 'number' ? extracted.confidence : 0.7;
    missingFields = Array.isArray(extracted.missingFields) ? (extracted.missingFields as string[]) : [];
    citation = typeof extracted.citation === 'string' ? extracted.citation : undefined;
    shortForm = typeof extracted.shortForm === 'string' ? extracted.shortForm : undefined;
    footnote = typeof extracted.footnote === 'string' ? extracted.footnote : undefined;
    courtDoc = typeof extracted.courtDoc === 'string' ? extracted.courtDoc : undefined;
    trace.push(`Extracted ${Object.keys(components).length} components (confidence: ${extractionConfidence}).`);
    if (missingFields.length > 0) {
      trace.push(`Missing fields: ${missingFields.join(', ')}`);
    }
  }

  // Step 2: Construct ParsedCitation for rule engine
  const rawText = citation ?? input;
  const parsed = constructParsedCitation(rawText, typeId, components);

  // Step 3: Run all rules (deterministic, <10ms)
  let issues: ValidationIssue[] = [];
  let score = 0;
  try {
    issues = runAllRules(parsed);
    score = calculateScore(issues);
    trace.push(`Rule engine found ${issues.length} issue(s). Score: ${score}/100.`);
  } catch (ruleError) {
    const msg = ruleError instanceof Error ? ruleError.message : 'Unknown error';
    console.error('[citation-pipeline] Rule engine error:', msg);
    trace.push(`Rule engine encountered an error: ${msg}. Continuing with AI results only.`);
    score = Math.round(extractionConfidence * 100);
  }

  // Step 4: Check for errors that need re-prompting
  const errors = issues.filter((i) => i.severity === 'error');
  let finalIssues = issues;
  let finalScore = score;

  if (errors.length > 0) {
    trace.push(`${errors.length} error(s) found. Re-prompting AI for corrections...`);

    const issueDescriptions = errors.map((e) =>
      `- [${e.rule}] ${e.message}${e.suggestion ? ` Suggestion: ${e.suggestion}` : ''}`
    ).join('\n');

    const bluebookContext = loadBluebookContext(typeId);
    const correctionPrompt = [
      'You are a Bluebook citation expert. Use ONLY the following official Bluebook rules to correct this citation:\n',
      bluebookContext,
      `\nThe rule engine found these issues with the citation:\n${issueDescriptions}`,
      `\nCurrent components:\n${JSON.stringify(components, null, 2)}`,
      `\nCurrent formatted citation: ${rawText}`,
      '\nPlease correct the components and provide a properly formatted citation.',
      'Return JSON with: "citation", "shortForm" (or null), "footnote", "courtDoc", "components", "corrections" (array of {field, rule, before, after}).',
    ].join('\n');

    const formatPrompt = buildPrompt(typeId, correctionPrompt, 'format', style);
    const correctionText = await callClaude(formatPrompt);

    if (correctionText) {
      const corrected = parseJsonResponse<{
        citation?: string;
        shortForm?: string;
        footnote?: string;
        courtDoc?: string;
        components?: Record<string, string>;
        corrections?: Array<{ field: string; rule: string; before: string; after: string }>;
      }>(correctionText);

      if (corrected) {
        if (corrected.citation) citation = corrected.citation;
        if (corrected.shortForm) shortForm = corrected.shortForm;
        if (corrected.footnote) footnote = corrected.footnote;
        if (corrected.courtDoc) courtDoc = corrected.courtDoc;
        if (corrected.components) {
          components = { ...components, ...corrected.components };
        }
        if (corrected.corrections) {
          corrections.push(...corrected.corrections);
        }

        // Re-validate with corrected citation
        const correctedRawText = citation ?? rawText;
        const reParsed = constructParsedCitation(correctedRawText, typeId, components);
        finalIssues = runAllRules(reParsed);
        finalScore = calculateScore(finalIssues);
        trace.push(`After corrections: ${finalIssues.length} issue(s). Score: ${finalScore}/100.`);
      } else {
        trace.push('Could not parse AI correction response. Using original results.');
      }
    } else {
      trace.push('AI correction unavailable. Using original rule engine results.');
    }
  }

  const confidence = computeConfidence(extractionConfidence, finalIssues);

  return {
    citation,
    shortForm,
    footnote,
    courtDoc,
    components,
    missingFields,
    confidence,
    suggestManual: missingFields.length > 2 || confidence < 0.5,
    validationIssues: finalIssues,
    corrections,
    logicTrace: trace,
  };
}

export function computeConfidence(
  extractionConfidence: number,
  issues: ValidationIssue[],
): number {
  let conf = extractionConfidence;
  for (const issue of issues) {
    switch (issue.severity) {
      case 'error':
        conf -= 0.1;
        break;
      case 'warning':
        conf -= 0.05;
        break;
      case 'suggestion':
        conf -= 0.02;
        break;
    }
  }
  return Math.max(0.1, Math.min(1, conf));
}
