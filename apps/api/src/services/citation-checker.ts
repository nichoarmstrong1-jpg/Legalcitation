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
import { v4 as uuid } from 'uuid';
import { loadBluebookContext } from './citation-pipeline.js';

// --- Types ---

export interface CheckIssue {
  field?: string;
  rule: string;
  issue: string;
  suggestion: string;
  severity: 'error' | 'warning' | 'suggestion';
  source: 'rule_engine' | 'claude' | 'both';
}

export interface CheckResult {
  valid: boolean;
  issues: CheckIssue[];
  overallScore: number;
  correctedCitation?: string;
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

// --- Helpers ---

const TYPE_ID_TO_TYPE: Record<string, CitationType> = {
  journal_article: 'article',
  report: 'book',
  legislative: 'statute',
};

function toRuleEngineType(typeId: CitationTypeId): CitationType {
  return (TYPE_ID_TO_TYPE[typeId] as CitationType) ?? (typeId as CitationType);
}

function stripMarkdownFences(text: string): string {
  return text.replace(/^```(?:json)?\s*\n?/gm, '').replace(/\n?```\s*$/gm, '');
}

function parseJsonResponse<T>(text: string): T | null {
  const cleaned = stripMarkdownFences(text.trim());
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const jsonMatch = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
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
    console.error('[citation-checker] Claude call failed:', message);
    return null;
  }
}

// --- Merge logic ---

function issueKey(field: string | undefined, rule: string): string {
  return `${field ?? '_'}::${rule}`;
}

function mergeIssues(
  ruleEngineIssues: ValidationIssue[],
  claudeIssues: Array<{ field?: string; rule: string; issue: string; suggestion: string; severity: string }>,
): CheckIssue[] {
  const merged = new Map<string, CheckIssue>();

  for (const ri of ruleEngineIssues) {
    const key = issueKey(ri.position ? String(ri.position.start) : undefined, ri.rule);
    merged.set(key, {
      field: ri.position ? String(ri.position.start) : undefined,
      rule: ri.rule,
      issue: ri.message,
      suggestion: ri.suggestion,
      severity: ri.severity,
      source: 'rule_engine',
    });
  }

  for (const ci of claudeIssues) {
    const severity = (['error', 'warning', 'suggestion'].includes(ci.severity)
      ? ci.severity
      : 'suggestion') as 'error' | 'warning' | 'suggestion';

    const key = issueKey(ci.field, ci.rule);
    const existing = merged.get(key);
    if (existing) {
      existing.source = 'both';
      if (!existing.suggestion && ci.suggestion) {
        existing.suggestion = ci.suggestion;
      }
    } else {
      merged.set(key, {
        field: ci.field,
        rule: ci.rule,
        issue: ci.issue,
        suggestion: ci.suggestion ?? '',
        severity,
        source: 'claude',
      });
    }
  }

  return Array.from(merged.values());
}

function computeOverallScore(issues: CheckIssue[]): number {
  let score = 100;
  for (const issue of issues) {
    switch (issue.severity) {
      case 'error':
        score -= 10;
        break;
      case 'warning':
        score -= 5;
        break;
      case 'suggestion':
        score -= 2;
        break;
    }
  }
  return Math.max(0, score);
}

// --- Main check function ---

export async function checkCitation(
  citation: string,
  typeId: CitationTypeId,
  style: 'law_review' | 'court_doc' = 'court_doc',
): Promise<CheckResult> {
  const trace: string[] = [];

  // Step 1: Extract components from the existing citation via Claude
  trace.push('Extracting components from citation...');
  const extractPrompt = buildPrompt(typeId, citation, 'extract', style);
  const extractText = await callClaude(extractPrompt);

  let components: Record<string, string> = {};
  if (extractText) {
    const extracted = parseJsonResponse<Record<string, unknown>>(extractText);
    if (extracted) {
      if (extracted.components && typeof extracted.components === 'object' && !Array.isArray(extracted.components)) {
        components = extracted.components as Record<string, string>;
      } else {
        const { confidence: _c, missingFields: _m, citation: _ci, shortForm: _s, footnote: _f, courtDoc: _d, ...rest } = extracted;
        components = Object.fromEntries(
          Object.entries(rest).filter(([, v]) => typeof v === 'string'),
        ) as Record<string, string>;
      }
      trace.push(`Extracted ${Object.keys(components).length} components.`);
    }
  }

  // Step 2: Run rule engine on the citation
  trace.push('Running deterministic rule checks...');
  const parsed: ParsedCitation = {
    id: uuid(),
    rawText: citation,
    type: toRuleEngineType(typeId),
    context: 'citation_sentence',
    position: { start: 0, end: citation.length },
    components: components as unknown as CitationComponents,
  };

  let ruleIssues: ValidationIssue[] = [];
  let ruleScore = 100;
  try {
    ruleIssues = runAllRules(parsed);
    ruleScore = calculateScore(ruleIssues);
    trace.push(`Rule engine: ${ruleIssues.length} issue(s), score ${ruleScore}/100.`);
  } catch (ruleError) {
    const msg = ruleError instanceof Error ? ruleError.message : 'Unknown error';
    console.error('[citation-checker] Rule engine error:', msg);
    trace.push(`Rule engine encountered an error: ${msg}. Using AI check only.`);
  }

  // Step 3: Claude semantic check with Bluebook context
  trace.push('Running AI semantic check...');
  const bluebookContext = loadBluebookContext(typeId);
  const checkPromptBase = buildPrompt(typeId, citation, 'check', style);
  const checkPrompt = bluebookContext
    ? `${checkPromptBase}\n\nUse ONLY the following official Bluebook rules for verification:\n\n${bluebookContext}`
    : checkPromptBase;

  const checkText = await callClaude(checkPrompt);
  let claudeIssues: Array<{ field?: string; rule: string; issue: string; suggestion: string; severity: string }> = [];
  let correctedCitation: string | undefined;

  if (checkText) {
    const checkResult = parseJsonResponse<
      | Array<{ field?: string; rule: string; issue: string; suggestion: string; severity: string }>
      | { issues?: Array<{ field?: string; rule: string; issue: string; suggestion: string; severity: string }>; correctedCitation?: string }
    >(checkText);

    if (Array.isArray(checkResult)) {
      claudeIssues = checkResult;
    } else if (checkResult?.issues) {
      claudeIssues = checkResult.issues;
      correctedCitation = checkResult.correctedCitation;
    }
    trace.push(`AI check: ${claudeIssues.length} issue(s) found.`);
  } else {
    trace.push('AI semantic check unavailable. Using rule engine results only.');
  }

  // Step 4: Merge and deduplicate
  const mergedIssues = mergeIssues(ruleIssues, claudeIssues);
  const overallScore = computeOverallScore(mergedIssues);
  const valid = mergedIssues.filter((i) => i.severity === 'error').length === 0;

  trace.push(`Final: ${mergedIssues.length} total issue(s), score ${overallScore}/100, valid: ${valid}.`);

  return {
    valid,
    issues: mergedIssues,
    overallScore,
    correctedCitation,
    logicTrace: trace,
  };
}
