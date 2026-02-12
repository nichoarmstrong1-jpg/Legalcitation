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

    const prompt = `You are a legal citation verification expert using the Bluebook (22nd ed.). Verify the case citation below and respond ONLY with a JSON object (no markdown, no code fences, no extra text).

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

BLUEBOOK DECISION LOGIC — apply these rules systematically:

1. CASE NAMES (R. 10.2.1 — 4-step process):
   Step 1: Identify parties — only the FIRST-NAMED party on each side of "v."
   Step 2: Determine party type (individual, business, government, union, organization)
   Step 3: Handle additional info — omit "et al.", descriptive terms (Trustee, Executor, Esq., M.D.), given names of individuals (keep surnames only), "The" at start
   Step 4: Write the name with proper abbreviations:
     - In citation sentences: abbreviate ALL T6 words (Ass'n, Bd., Bros., Co., Comm'n, Comm'r, Corp., Dep't, Dist., Educ., Gov't, Inc., Ins., Int'l, Ltd., Mfg., Nat'l, No., R.R., Sch., Sec'y, Soc'y, Univ.)
     - ALWAYS abbreviate these 8 words regardless of context: &, Ass'n, Bros., Co., Corp., Inc., Ltd., No. (R. 10.2.1(c))
     - Business designations: keep first if in the R. 10.2.1(h) list (Inc., Ltd., L.L.C., N.A., F.S.B., R.R., Ass'n, Bros., Co., Corp., Ins.); drop second if BOTH are in the list
     - Government parties: "United States" in federal cases, "State"/"Commonwealth"/"People" in state courts (R. 10.2.1(f))
     - Widely known acronyms: NO periods (NAACP, FHA, FBI) — (R. 10.2.1(d))

2. REPORTERS (R. 10.3 / T1):
   - Cite ONLY the T1-preferred reporter for that jurisdiction
   - Include the correct series number (e.g., F.3d not F.2d for recent federal appellate)
   - Spacing: single capital + ordinal = no space (F.3d); single capital + longer abbr = space (F. Supp. 3d)

3. COURT DESIGNATION (R. 10.4):
   - OMIT jurisdiction if the reporter name unambiguously identifies it (e.g., U.S., Cal. App.)
   - OMIT court if (a) it's the highest court in the jurisdiction, or (b) the reporter identifies the court
   - Regional reporters (N.E., S.W., etc.) NEVER identify jurisdiction — always include state abbreviation
   - Use 2d and 3d (NOT 2nd and 3rd) for circuits

4. PINPOINTS (R. 3.2):
   - First page MUST be repeated as pinpoint: "363, 363" not just "363"
   - Consecutive page ranges: retain last TWO digits minimum
   - Non-consecutive pages: retain ALL digits, use comma: "414, 418"
   - Use en dash (–) not hyphen (-) for ranges

5. YEAR (R. 10.5):
   - Year of decision for reported cases
   - Must be in parentheses with court designation

RULES:
- Return null for any field you cannot determine rather than guessing.
- Do NOT mention APIs, databases, or technical systems in reasoning.
- NEVER rely on the source itself for citation form — always conform to Bluebook rules.

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
        content: `You are a Bluebook (22nd ed.) citation expert helping a law student build a proper citation. Given the following free text describing a legal source, construct a properly formatted Bluebook citation. Respond ONLY with valid JSON (no markdown, no code fences):

Input: "${freeText}"

Respond with a JSON object:
- "citation": string (the full Bluebook citation, use *asterisks* for italicized portions like case names)
- "type": string (case, statute, constitution, regulation, article, procedural_rule)
- "components": object with relevant fields (partyOne, partyTwo, volume, reporter, firstPage, pinCite, court, year)
- "reasoning": string[] (4-6 steps explaining your work in law-student-facing language:
    - Reference Bluebook rules by number
    - Explain abbreviation choices citing T6/T10
    - Explain court designation choices citing R. 10.4
    - Write as a helpful law librarian, not a computer)
- "confidence": number (0-100, how confident you are in the citation)
- "short_forms": string[] (1-3 acceptable short form citations for subsequent references)

BLUEBOOK FORMATTING RULES:

CASES (R. 10, B10):
- Apply the 4-step case name process: identify parties → determine type → handle additional info → abbreviate per T6
- Always abbreviate the 8 mandatory words: &, Ass'n, Bros., Co., Corp., Inc., Ltd., No.
- Use T1-preferred reporter only
- Omit court if reporter identifies it; omit jurisdiction if reporter identifies it
- Year of decision in parentheses with court designation
- Short forms: (1) Id., (2) party name + vol + rep + "at" + page, (3) party name + "at" + page

STATUTES (R. 12, B12):
- Format: [title] [code] § [section] ([publisher] [year])
- Federal official (U.S.C.): year optional
- Unofficial (U.S.C.A., U.S.C.S.): publisher required
- Subject matter states (Cal., Md., N.Y., Tex.): include subject matter code name
- Use § symbol, not "Section" or "Sec."
- Short forms: Id. § [section] or § [section]

CONSTITUTIONS (R. 11, B11):
- Format: [jurisdiction] Const. art./amend. [Roman numeral], § [Arabic], cl. [Arabic]
- Article/amendment numbers: ROMAN numerals
- Section/clause numbers: ARABIC numerals
- No date for provisions currently in force
- Only "id." allowed as short form — NO supra, NO hereinafter

REGULATIONS (R. 14, B14):
- C.F.R.: [title] C.F.R. § [section] ([year of C.F.R. edition])
- Fed. Reg.: [volume] Fed. Reg. [page] ([full date])
- I.R.C.: I.R.C. § [section]([subsection])
- Treas. Reg.: Treas. Reg. § [section] ([year])

PROCEDURAL RULES (R. 12.9.3, B12.1.3):
- Fed. R. Civ. P., Fed. R. Crim. P., Fed. R. Evid., Fed. R. App. P.
- Current rules: NO date
- Court rules: [court abbreviation] R. [number]

CITATION PLACEMENT:
- Prefer citation sentences (period at end) over citation clauses
- Include pinpoint citations whenever citing specific material
- "at" before page numbers; no "at" before § or ¶

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
