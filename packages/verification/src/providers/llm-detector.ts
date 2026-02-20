import Anthropic from '@anthropic-ai/sdk';
import type { CitationType } from '@legalcitation/shared';

export interface LLMDetectedSpan {
  text: string;
  start: number;
  end: number;
  type: CitationType;
  explanation: string;
  confidence: number;
}

export interface DetectMissedResult {
  spans: LLMDetectedSpan[];
  logicTrace: string[];
}

interface ExistingSpan {
  text: string;
  start: number;
  end: number;
}

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    });
  }
  return client;
}

function withTimeout(ms: number): { signal: AbortSignal; clear: () => void } {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, clear: () => clearTimeout(timer) };
}

/**
 * Detect citations the regex parser may have missed by sending the text
 * and already-detected spans to Claude. Returns additional spans with
 * user-facing explanations of why each was identified.
 */
export async function detectMissedCitations(
  text: string,
  existingSpans: ExistingSpan[],
): Promise<DetectMissedResult> {
  const trace: string[] = [];

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { spans: [], logicTrace: trace };
  }

  if (text.length < 20) {
    return { spans: [], logicTrace: trace };
  }

  const timeout = withTimeout(20000);

  try {
    const spanList = existingSpans.length > 0
      ? existingSpans
          .map(s => `  [${s.start}–${s.end}]: "${s.text.slice(0, 100)}"`)
          .join('\n')
      : '  (none detected)';

    const prompt = `You are a legal citation detection expert. Analyze the following legal text and identify any legal citations that were NOT already detected by the existing parser.

TEXT TO ANALYZE:
"""
${text.slice(0, 8000)}
"""

CITATIONS ALREADY DETECTED (do NOT include these):
${spanList}

TASK: Find any ADDITIONAL legal citations that were missed. Focus on:
- Non-standard short form citations (e.g., "Tunkl Id. at 98" where a case name is combined with Id.)
- Malformed or abbreviated citations from OCR or copy-paste errors
- Citations with unusual formatting or missing components
- Embedded citations that blend into prose in unusual ways
- Short form case citations where the party name is used without standard volume/reporter format

For each missed citation, return the EXACT character offsets in the original text.

Respond ONLY with a JSON object (no markdown, no code fences):
{
  "missed_citations": [
    {
      "text": "exact text from the source",
      "start": <character offset>,
      "end": <character offset>,
      "type": "<case|statute|constitution|regulation|article|book|restatement|internet|ai_source|unpublished|short_form|id|supra|infra|unknown>",
      "explanation": "<1-2 sentence explanation of what this citation is and why it uses a non-standard form. Write for a law student, not a developer. Reference Bluebook rules when relevant.>",
      "confidence": <0-100>
    }
  ]
}

RULES:
- Only include citations that are NOT in the already-detected list
- The "text" field must be the EXACT substring from the source at the given offsets
- Do NOT flag regular prose that happens to mention a case name without any citation form
- The "explanation" must be helpful and educational — explain what the correct form should be
- Only include citations with confidence >= 70
- Return an empty array if no additional citations are found
- Do NOT mention AI, APIs, or technical systems in explanations`;

    const anthropic = getClient();
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20250929',
      max_tokens: 2048,
      temperature: 0,
      messages: [{ role: 'user', content: prompt }],
    }, { signal: timeout.signal });

    timeout.clear();

    const responseText = response.content[0].type === 'text' ? response.content[0].text : '';

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { spans: [], logicTrace: trace };
    }

    const result = JSON.parse(jsonMatch[0]) as {
      missed_citations: Array<{
        text: string;
        start: number;
        end: number;
        type: string;
        explanation: string;
        confidence: number;
      }>;
    };

    if (!Array.isArray(result.missed_citations)) {
      return { spans: [], logicTrace: trace };
    }

    const validTypes = new Set<string>([
      'case', 'statute', 'constitution', 'regulation', 'article', 'book',
      'restatement', 'internet', 'ai_source', 'unpublished', 'short_form',
      'id', 'supra', 'infra', 'unknown',
    ]);

    const spans: LLMDetectedSpan[] = [];

    for (const item of result.missed_citations) {
      if (item.confidence < 70) continue;
      if (!Number.isFinite(item.start) || !Number.isFinite(item.end)) continue;
      if (item.start < 0 || item.end > text.length || item.end <= item.start) continue;

      // Verify the text at the claimed offsets matches what the LLM returned
      const actualText = text.slice(item.start, item.end);
      if (actualText !== item.text) {
        // Try to find the text nearby if offsets are slightly off
        const searchWindow = text.slice(
          Math.max(0, item.start - 50),
          Math.min(text.length, item.end + 50),
        );
        const idx = searchWindow.indexOf(item.text);
        if (idx === -1) continue;

        const correctedStart = Math.max(0, item.start - 50) + idx;
        const correctedEnd = correctedStart + item.text.length;

        if (overlapsExisting(correctedStart, correctedEnd, existingSpans)) continue;

        spans.push({
          text: item.text,
          start: correctedStart,
          end: correctedEnd,
          type: validTypes.has(item.type) ? item.type as CitationType : 'unknown',
          explanation: item.explanation,
          confidence: item.confidence,
        });
        continue;
      }

      if (overlapsExisting(item.start, item.end, existingSpans)) continue;

      spans.push({
        text: item.text,
        start: item.start,
        end: item.end,
        type: validTypes.has(item.type) ? item.type as CitationType : 'unknown',
        explanation: item.explanation,
        confidence: item.confidence,
      });
    }

    if (spans.length > 0) {
      trace.push(`Detected ${spans.length} additional citation${spans.length !== 1 ? 's' : ''} using enhanced analysis.`);
    }

    return { spans, logicTrace: trace };

  } catch (error) {
    timeout.clear();
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[llm-detector] detectMissedCitations error:', message);

    if (message.includes('aborted') || message.includes('AbortError')) {
      trace.push('Enhanced citation detection timed out. Standard detection results still apply.');
    }
    return { spans: [], logicTrace: trace };
  }
}

function overlapsExisting(start: number, end: number, existing: ExistingSpan[]): boolean {
  return existing.some(s => start < s.end && end > s.start);
}
