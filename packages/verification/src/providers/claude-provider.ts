import Anthropic from '@anthropic-ai/sdk';
import type { CaseComponents, VerificationStatus, CitationDiscrepancy } from '@legalcitation/shared';

export interface ClaudeVerificationResult {
  status: VerificationStatus;
  discrepancies: CitationDiscrepancy[];
  verifiedCitation?: string;
  caseName?: string;
  logicTrace: string[];
}

export interface CaseSearchResult {
  caseName: string;
  citation: string;
  year: string;
  court: string;
  summary: string;
  confidence: number;
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

/** Create an AbortController with a timeout (ms). */
function withTimeout(ms: number): { signal: AbortSignal; clear: () => void } {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, clear: () => clearTimeout(timer) };
}

/**
 * Verify a case citation using Claude API.
 * Returns law-student-facing analysis — no technical API details.
 */
export async function verifyWithClaude(
  components: CaseComponents
): Promise<ClaudeVerificationResult> {
  const trace: string[] = [];
  const discrepancies: CitationDiscrepancy[] = [];

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { status: 'pending', discrepancies: [], logicTrace: trace };
  }

  const timeout = withTimeout(30000);

  try {
    const caseName = components.partyTwo
      ? `${components.partyOne} v. ${components.partyTwo}`
      : components.partyOne;

    const targetCite = `${components.volume} ${components.reporter} ${components.firstPage}`;

    trace.push(`Searching for "${caseName}, ${targetCite} (${components.year})" in case law databases...`);

    const prompt = `You are a legal citation verification expert. Verify the case citation below and respond ONLY with a JSON object (no markdown, no code fences, no extra text).

CITATION TO VERIFY:
Case Name: ${caseName}
Reporter Citation: ${targetCite}
Court: ${components.court || 'not specified'}
Year: ${components.year}
Pin Cite: ${components.pinCite || 'none'}

REQUIRED JSON FIELDS:
- "verified": boolean — true ONLY if you are confident this is a real case with accurate citation details. If uncertain, use false.
- "correct_case_name": string — proper Bluebook case name (T6 abbreviations in citation sentences)
- "correct_citation": string — full Bluebook citation with *italics* for case name
- "correct_volume": string
- "correct_reporter": string (T1 abbreviation)
- "correct_first_page": string
- "correct_court": string — court abbreviation per R. 10.4 / T7 / T10 (empty string if not needed, e.g., U.S. Reports = SCOTUS)
- "correct_year": string
- "reasoning": string[] — exactly 4-6 steps, each referencing Bluebook rules. Write for a 1L student, not a developer.
- "discrepancies": array of {"component": string, "user_value": string, "correct_value": string} — empty array if none

RULES:
- Return null for any field you cannot determine rather than guessing.
- Do NOT mention APIs, databases, or technical systems in reasoning.
- For reasoning, reference specific rules: R. 10.2.1 (case names), R. 10.3 (reporters), R. 10.4 (court), R. 10.5 (date), T1, T6, T7, T10.

EXAMPLE (correct output for Brown v. Board of Education):
{"verified":true,"correct_case_name":"Brown v. Bd. of Educ.","correct_citation":"*Brown v. Bd. of Educ.*, 347 U.S. 483 (1954).","correct_volume":"347","correct_reporter":"U.S.","correct_first_page":"483","correct_court":"","correct_year":"1954","reasoning":["Identified as Brown v. Board of Education of Topeka, a landmark 1954 U.S. Supreme Court case (R. 10.2.1).","Case name abbreviated per T6: 'Board' → 'Bd.', 'Education' → 'Educ.' (R. 10.2.1(c)).","Reporter citation 347 U.S. 483 is correct per T1 — U.S. Reports is the official reporter for SCOTUS decisions (R. 10.3.1).","No court designation needed because U.S. Reports is unique to the Supreme Court (R. 10.4(a)).","Year 1954 is accurate — case decided May 17, 1954 (R. 10.5)."],"discrepancies":[]}`;

    const anthropic = getClient();
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      temperature: 0,
      messages: [{ role: 'user', content: prompt }],
    }, { signal: timeout.signal });

    timeout.clear();

    const responseText = response.content[0].type === 'text' ? response.content[0].text : '';

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      trace.push('Could not verify this citation. Please check manually with Westlaw or Lexis.');
      return { status: 'error', discrepancies: [], logicTrace: trace };
    }

    const result = JSON.parse(jsonMatch[0]) as {
      verified: boolean;
      correct_case_name: string | null;
      correct_citation: string | null;
      correct_volume: string | null;
      correct_reporter: string | null;
      correct_first_page: string | null;
      correct_court: string | null;
      correct_year: string | null;
      reasoning: string[];
      discrepancies: Array<{ component: string; user_value: string; correct_value: string }>;
    };

    // Validate required fields — reject malformed responses
    if (typeof result.verified !== 'boolean' || !Array.isArray(result.reasoning)) {
      trace.push('Verification returned an unexpected response format. Please check manually.');
      return { status: 'error', discrepancies: [], logicTrace: trace };
    }

    if (result.reasoning) {
      for (const step of result.reasoning) {
        trace.push(step);
      }
    }

    if (result.discrepancies) {
      for (const d of result.discrepancies) {
        discrepancies.push({
          component: d.component,
          userValue: d.user_value,
          verifiedValue: d.correct_value,
        });
      }
    }

    if (result.verified) {
      trace.push('All citation components verified as accurate.');
      return {
        status: 'verified',
        discrepancies,
        verifiedCitation: result.correct_citation ?? undefined,
        caseName: result.correct_case_name ?? undefined,
        logicTrace: trace,
      };
    } else {
      trace.push('Some citation components could not be verified. Review the discrepancies below.');
      return {
        status: 'partial_match',
        discrepancies,
        verifiedCitation: result.correct_citation ?? undefined,
        caseName: result.correct_case_name ?? undefined,
        logicTrace: trace,
      };
    }

  } catch (error) {
    timeout.clear();
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[claude-provider] verifyWithClaude error:', message, error);

    if (message.includes('aborted') || message.includes('AbortError')) {
      trace.push('Verification timed out. Bluebook formatting rules still checked.');
    } else if (message.includes('401') || message.includes('auth')) {
      trace.push('Verification service temporarily unavailable. Citation format checks still apply.');
    } else {
      trace.push('Could not complete external verification. Bluebook formatting rules still checked.');
    }
    return { status: 'error', discrepancies: [], logicTrace: trace };
  }
}

/**
 * Search for cases matching free text input — returns up to 5 results
 * that the user can choose from.
 */
export async function searchCasesWithClaude(
  freeText: string
): Promise<{
  results: CaseSearchResult[];
  logicTrace: string[];
} | null> {
  const trace: string[] = [];

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return null;
  }

  const timeout = withTimeout(30000);

  try {
    trace.push(`Searching case law for "${freeText.slice(0, 80)}${freeText.length > 80 ? '...' : ''}"...`);

    const anthropic = getClient();
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: `You are a legal research assistant helping a law student find a case. Given the following search query, return up to 5 real cases that best match. Respond ONLY with valid JSON (no markdown, no code fences).

Search query: "${freeText}"

Respond with a JSON object:
- "results": array of up to 5 case objects, each with:
  - "case_name": string (full case name as it would appear in Bluebook format)
  - "citation": string (full Bluebook citation with *asterisks* for italicized case name)
  - "year": string (year decided)
  - "court": string (e.g., "U.S. Supreme Court", "9th Circuit", "S.D.N.Y.")
  - "summary": string (1-2 sentence summary of what the case is about, written for a law student)
  - "confidence": number (0-100, how confident you are this matches what the user is looking for)
- "reasoning": string[] (2-3 steps explaining your search strategy, e.g., "Searched for cases involving [topic] with party name [name]...")

IMPORTANT:
- Only include REAL cases with accurate citations
- Use proper Bluebook formatting (T1 reporters, T6 abbreviations, R. 10 formatting)
- Order results by confidence (highest first)
- If the query is very specific (e.g., "Roe v Wade"), the first result should be the exact case
- If the query is broad (e.g., "free speech student case"), return diverse relevant cases
- For each case, the citation must be complete and accurate`
      }],
    }, { signal: timeout.signal });

    timeout.clear();

    const responseText = response.content[0].type === 'text' ? response.content[0].text : '';

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      trace.push('Could not find matching cases. Try a more specific search.');
      return { results: [], logicTrace: trace };
    }

    const result = JSON.parse(jsonMatch[0]) as {
      results: Array<{
        case_name: string;
        citation: string;
        year: string;
        court: string;
        summary: string;
        confidence: number;
      }>;
      reasoning: string[];
    };

    if (result.reasoning) {
      for (const step of result.reasoning) {
        trace.push(step);
      }
    }

    const searchResults: CaseSearchResult[] = (result.results || []).map(r => ({
      caseName: r.case_name,
      citation: r.citation,
      year: r.year,
      court: r.court,
      summary: r.summary,
      confidence: r.confidence,
    }));

    trace.push(`Found ${searchResults.length} matching case${searchResults.length !== 1 ? 's' : ''}.`);

    return {
      results: searchResults,
      logicTrace: trace,
    };

  } catch (error) {
    timeout.clear();
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[claude-provider] searchCasesWithClaude error:', message, error);

    if (message.includes('aborted') || message.includes('AbortError')) {
      trace.push('Case search timed out. Try a shorter or more specific query.');
    } else if (message.includes('401') || message.includes('auth')) {
      trace.push('Case search service temporarily unavailable.');
    } else {
      trace.push('Could not search for cases. Try entering a more complete citation.');
    }
    return { results: [], logicTrace: trace };
  }
}

/**
 * Build a full citation from a selected case search result.
 */
export async function buildCitationWithClaude(
  freeText: string
): Promise<{
  citation: string;
  components: Partial<CaseComponents>;
  logicTrace: string[];
} | null> {
  const trace: string[] = [];

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return null;
  }

  const timeout = withTimeout(30000);

  try {
    trace.push(`Building Bluebook citation for "${freeText.slice(0, 80)}${freeText.length > 80 ? '...' : ''}"...`);

    const anthropic = getClient();
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `You are a Bluebook (21st ed.) citation expert helping a law student build a proper citation. Given the following free text describing a legal source, construct a properly formatted Bluebook citation. Respond ONLY with valid JSON (no markdown, no code fences):

Input: "${freeText}"

Respond with a JSON object:
- "citation": string (the full Bluebook citation, use *asterisks* for italicized portions like case names)
- "type": string (case, statute, constitution, regulation, article)
- "components": object with relevant fields (partyOne, partyTwo, volume, reporter, firstPage, pinCite, court, year)
- "reasoning": string[] (4-6 steps explaining your work in law-student-facing language:
    - Reference Bluebook rules by number
    - Explain abbreviation choices citing T6/T10
    - Explain court designation choices citing R. 10.4
    - Write as a helpful law librarian, not a computer)
- "confidence": number (0-100, how confident you are in the citation)

Use proper Bluebook formatting: T6 abbreviations for party names in citation sentences, proper reporter abbreviations (T1), court designations (T7/T10), etc.
If you cannot determine some information, use [placeholder] brackets.`
      }],
    }, { signal: timeout.signal });

    timeout.clear();

    const responseText = response.content[0].type === 'text' ? response.content[0].text : '';

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      trace.push('Could not build a citation from the provided input.');
      return null;
    }

    const result = JSON.parse(jsonMatch[0]) as {
      citation: string;
      type: string;
      components: Partial<CaseComponents>;
      reasoning: string[];
      confidence: number;
    };

    if (result.reasoning) {
      for (const step of result.reasoning) {
        trace.push(step);
      }
    }

    if (result.confidence < 70) {
      trace.push('Note: Some details could not be fully confirmed. Verify with Westlaw or Lexis before submitting.');
    }

    return {
      citation: result.citation,
      components: result.components,
      logicTrace: trace,
    };

  } catch (error) {
    timeout.clear();
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[claude-provider] buildCitationWithClaude error:', message, error);

    if (message.includes('aborted') || message.includes('AbortError')) {
      trace.push('Citation lookup timed out. Try a shorter input.');
    } else if (message.includes('401') || message.includes('auth')) {
      trace.push('Citation lookup service temporarily unavailable.');
    } else {
      trace.push('Could not build citation automatically. Try entering a more complete citation.');
    }
    return null;
  }
}
