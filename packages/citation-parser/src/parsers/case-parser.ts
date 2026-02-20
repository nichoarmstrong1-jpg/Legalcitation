import { v4 as uuid } from 'uuid';
import type { ParsedCitation, CaseComponents, CitationContext } from '@legalcitation/shared';
import { VALID_REPORTER_ABBREVIATIONS, ALL_HISTORY_ABBREVIATIONS, REPORTER_MAP, REPORTER_VARIATIONS } from '@legalcitation/shared';

const REPORTER_ALT = Array.from(VALID_REPORTER_ABBREVIATIONS)
  .sort((a, b) => b.length - a.length)
  .map(r => r.replace(/\./g, '\\.').replace(/'/g, "\\'"))
  .join('|');

/**
 * Reporter alias map — maps common lazy/incorrect reporter forms
 * to their proper Bluebook abbreviations.
 * Order matters: longer patterns first to prevent partial matches.
 */
const REPORTER_ALIASES: [RegExp, string][] = [
  // Multi-word reporters (must come first)
  [/\bF\.?\s*Supp\.?\s*3d\b\.?/gi, 'F. Supp. 3d'],
  [/\bF\.?\s*Supp\.?\s*2d\b\.?/gi, 'F. Supp. 2d'],
  [/\bF\.?\s*Supp\b\.?/gi, 'F. Supp.'],
  [/\bF\.?\s*App'?x\b\.?/gi, "F. App'x"],
  [/\bL\.?\s*Ed\.?\s*2d\b\.?/gi, 'L. Ed. 2d'],
  [/\bL\.?\s*Ed\b\.?/gi, 'L. Ed.'],
  [/\bS\.?\s*Ct\b\.?/gi, 'S. Ct.'],
  [/\bS\.?\s*E\.?\s*2d\b\.?/gi, 'S.E.2d'],
  [/\bS\.?\s*W\.?\s*3d\b\.?/gi, 'S.W.3d'],
  [/\bS\.?\s*W\.?\s*2d\b\.?/gi, 'S.W.2d'],
  [/\bN\.?\s*E\.?\s*3d\b\.?/gi, 'N.E.3d'],
  [/\bN\.?\s*E\.?\s*2d\b\.?/gi, 'N.E.2d'],
  [/\bN\.?\s*W\.?\s*2d\b\.?/gi, 'N.W.2d'],
  [/\bN\.?\s*Y\.?\s*S\.?\s*2d\b\.?/gi, 'N.Y.S.2d'],
  [/\bN\.?\s*Y\.?\s*S\b\.?/gi, 'N.Y.S.'],
  [/\bFed\.?\s*Cl\b\.?/gi, 'Fed. Cl.'],
  [/\bU\.?\s*S\.?\s*L\.?\s*W\b\.?/gi, 'U.S.L.W.'],
  // Series reporters
  [/\bF\.?\s*4th\b\.?/gi, 'F.4th'],
  [/\bF\.?\s*3d\b\.?/gi, 'F.3d'],
  [/\bF\.?\s*2d\b\.?/gi, 'F.2d'],
  [/\bA\.?\s*3d\b\.?/gi, 'A.3d'],
  [/\bA\.?\s*2d\b\.?/gi, 'A.2d'],
  [/\bP\.?\s*3d\b\.?/gi, 'P.3d'],
  [/\bP\.?\s*2d\b\.?/gi, 'P.2d'],
  // Core reporters — "US" to "U.S." only when between numbers (volume US page)
  [/(\d)\s+US\s+(\d)/g, '$1 U.S. $2'],
  [/(\d)\s+U\.S\s+(\d)/g, '$1 U.S. $2'],
  // Other reporters
  [/\bF\.?\s*R\.?\s*D\b\.?/gi, 'F.R.D.'],
  [/\bB\.?\s*R\b\.?/gi, 'B.R.'],
  [/\bM\.?\s*J\b\.?/gi, 'M.J.'],
  [/\bCal\.?\s*Rptr\.?\s*3d\b\.?/gi, 'Cal. Rptr. 3d'],
  [/\bCal\.?\s*Rptr\.?\s*2d\b\.?/gi, 'Cal. Rptr. 2d'],
  [/\bCal\.?\s*Rptr\b\.?/gi, 'Cal. Rptr.'],
];

/**
 * Normalize a citation string to improve parsing success.
 * Handles missing periods, incorrect reporter abbreviations,
 * missing commas, missing parentheses, and similar user input issues.
 */
export function normalizeCitationInput(text: string): string {
  let normalized = text.trim();

  // Join hard-wrapped lines from copied briefs/OCR while preserving paragraph breaks.
  normalized = normalized
    .replace(/\r\n?/g, '\n')
    .replace(/([A-Za-z0-9.,;:)\]])\n(?=[A-Za-z0-9([{"'])/g, '$1 ');

  // Fix "v" without period: "Party v Party" → "Party v. Party"
  // Match " v " that's not already " v. "
  normalized = normalized.replace(/(\s+)v(\s+)(?!\.)/gi, '$1v.$2');

  // Apply reporter aliases
  for (const [pattern, replacement] of REPORTER_ALIASES) {
    normalized = normalized.replace(pattern, replacement);
  }

  // Apply variation normalization from the comprehensive variations map
  for (const [variation, canonical] of REPORTER_VARIATIONS) {
    if (normalized.includes(variation)) {
      normalized = normalized.replace(variation, canonical);
    }
  }

  // Insert comma before volume number if missing
  // "Party v. Party 347 U.S." → "Party v. Party, 347 U.S."
  const reporterAbbrsSorted = Array.from(VALID_REPORTER_ABBREVIATIONS)
    .sort((a, b) => b.length - a.length);

  for (const abbr of reporterAbbrsSorted) {
    const escapedAbbr = abbr.replace(/\./g, '\\.').replace(/'/g, "\\'");
    // Match: word/letter followed by space then digits then reporter — without a comma
    const commaPattern = new RegExp(
      `([a-zA-Z.'"])\\s+(\\d{1,4}\\s+${escapedAbbr}\\s+\\d)`,
    );
    const commaMatch = normalized.match(commaPattern);
    if (commaMatch && commaMatch.index !== undefined) {
      // Check there's no comma before the volume already
      const beforeMatch = normalized.slice(Math.max(0, commaMatch.index - 2), commaMatch.index + commaMatch[1].length);
      if (!beforeMatch.includes(',')) {
        normalized = normalized.replace(commaPattern, '$1, $2');
        break;
      }
    }
  }

  // Wrap bare trailing year in parentheses
  // "... 483 1954" → "... 483 (1954)" / "... 483 1954." → "... 483 (1954)."
  normalized = normalized.replace(
    /(\d{1,5})\s+(\d{4})(\.\s*)?$/,
    (match, page, year, trailing) => {
      const y = parseInt(year);
      if (y >= 1700 && y <= 2030) {
        return `${page} (${year})${trailing || ''}`;
      }
      return match;
    }
  );

  return normalized;
}

/**
 * Parse a full case citation string into structured components.
 * Handles the standard Bluebook format:
 *   Party One v. Party Two, Vol Reporter Page, PinCite (Court Year) (parentheticals), history.
 * Automatically normalizes input (fixing common typos, missing periods, etc.) if standard parse fails.
 */
export function parseCaseCitation(
  rawText: string,
  position: { start: number; end: number },
  context: CitationContext = 'citation_sentence'
): ParsedCitation | null {
  const text = rawText.trim();

  // Try standard case pattern first
  let result = parseStandardCase(text);

  // If standard parse fails, try with normalization
  if (!result) {
    const normalized = normalizeCitationInput(text);
    if (normalized !== text) {
      result = parseStandardCase(normalized);
    }
  }

  if (!result) return null;

  return {
    id: uuid(),
    rawText: text,
    type: 'case',
    context,
    position,
    components: result,
  };
}

function parseStandardCase(text: string): CaseComponents | null {
  // Step 1: Extract case name (everything before "vol reporter page")
  // Look for the pattern: ..., <number> <reporter> <number>
  const reporterAbbrsSorted = Array.from(VALID_REPORTER_ABBREVIATIONS)
    .sort((a, b) => b.length - a.length);

  let caseName = '';
  let volume = '';
  let reporter = '';
  let firstPage = '';
  let remainder = '';

  for (const abbr of reporterAbbrsSorted) {
    const escapedAbbr = abbr.replace(/\./g, '\\.').replace(/'/g, "\\'");
    // Page: digits, underscores/dashes (placeholder), or roman numerals
    const pattern = new RegExp(
      `^(.+?),\\s*(\\d{1,4})\\s+(${escapedAbbr})\\s+(\\d{1,5}|_+|[—–-]{2,}|[ivxlc]{1,10})(.*)$`,
      'si'
    );
    const match = text.match(pattern);
    if (match) {
      caseName = match[1].trim();
      volume = match[2];
      reporter = abbr;
      // Normalize placeholder pages (underscores, dashes) to empty string
      const rawPage = match[4];
      firstPage = /^[_—–-]+$/.test(rawPage) ? '' : rawPage;
      remainder = match[5].trim();
      break;
    }
  }

  if (!caseName) return null;

  // Step 1b: Edition disambiguation — if reporter matches multiple editions, prefer
  // the one whose date range includes the citation year (extracted later, but we can
  // do a quick forward-peek for the year parenthetical here).
  const reporterEntry = REPORTER_MAP.get(reporter);
  if (reporterEntry && reporterEntry.startYear && reporterEntry.endYear) {
    const yearPeek = remainder.match(/\((?:[^)]*?)(\d{4})\s*\)/);
    if (yearPeek) {
      const citYear = parseInt(yearPeek[1], 10);
      if (citYear < reporterEntry.startYear || citYear > reporterEntry.endYear) {
        // The year doesn't match this edition — look for a better match
        for (const [abbr, entry] of REPORTER_MAP) {
          if (abbr === reporter) continue;
          if (entry.fullName === reporterEntry.fullName && entry.startYear && entry.endYear) {
            if (citYear >= entry.startYear && citYear <= entry.endYear) {
              reporter = abbr;
              break;
            }
          }
        }
      }
    }
  }

  // Step 2: Parse case name into parties
  const { partyOne, partyTwo } = parseCaseNameParties(caseName);

  // Step 3: Extract pincite from remainder (comes before the date parenthetical)
  let pinCite: string | undefined;
  let afterPinCite = remainder;

  // Strip leading parallel citations (e.g., ", 90 S. Ct. 498, 24 L. Ed. 2d 586")
  // so date/court parsing can still run on the trailing parenthetical.
  const parallel = stripLeadingParallelCitations(afterPinCite);
  afterPinCite = parallel.remaining;

  // Expanded pincite: digits, ranges, ¶, §, *, pp., pg., p., footnote refs, page:paragraph
  const PIN_CITE_RE = new RegExp(
    String.raw`^,\s*` +
    String.raw`(` +
      String.raw`(?:p(?:p|g|age)?\.?\s*)?[*]*[\d]+[\d\u2013\-:,\s&*]*(?:(?:n\.|nn\.|fn\.)\s*\d+)?` +
      String.raw`|\u00b6\u00b6?\s*[\d.]+(?:[\u2013\-]\d+)?` +
      String.raw`|\u00a7\u00a7?\s*[\d.]+(?:\([a-zA-Z0-9]+\))*` +
    String.raw`)` +
    String.raw`\s*(\(.*)$`
  );
  const pinCiteMatch = afterPinCite.match(PIN_CITE_RE);
  if (pinCiteMatch) {
    pinCite = pinCiteMatch[1].trim();
    afterPinCite = pinCiteMatch[2];
  }

  // Step 4: Extract date parenthetical — (Court Year)
  let court: string | undefined;
  let year = '';
  let afterDate = afterPinCite;

  const dateParenMatch = afterPinCite.match(/^\s*\(([^)]+)\)\s*(.*)/s);
  if (dateParenMatch) {
    const parenContent = dateParenMatch[1].trim();
    afterDate = dateParenMatch[2];

    // Extract year (last 4 digits)
    const yearMatch = parenContent.match(/(\d{4})\s*$/);
    if (yearMatch) {
      year = yearMatch[1];
      const beforeYear = parenContent.slice(0, parenContent.length - yearMatch[0].length).trim();
      if (beforeYear) {
        court = beforeYear;
      }
    } else {
      // No year found — the whole thing might be a year
      year = parenContent;
    }
  }

  // Step 5: Extract additional parentheticals
  const parentheticals: string[] = [];
  let parenRemainder = afterDate;
  const parenRegex = /^\s*\(([^)]+)\)\s*/;
  let parenMatch;
  while ((parenMatch = parenRemainder.match(parenRegex))) {
    parentheticals.push(parenMatch[1].trim());
    parenRemainder = parenRemainder.slice(parenMatch[0].length);
  }

  // Step 6: Extract subsequent history using shared constants (T8)
  let subsequentHistory: string | undefined;
  const historyAbbrs = Array.from(ALL_HISTORY_ABBREVIATIONS)
    .sort((a, b) => b.length - a.length)
    .map(h => h.replace(/\./g, '\\.').replace(/'/g, "\\'"));
  const historyAlternation = historyAbbrs.join('|');
  const historyRegex = new RegExp(`^,?\\s*(${historyAlternation})\\s*.*`, 'i');
  const historyMatch = parenRemainder.match(historyRegex);
  if (historyMatch) {
    subsequentHistory = parenRemainder.replace(/^,?\s*/, '').replace(/\.\s*$/, '').trim();
  }

  // Step 7: Check for electronic database citations (WL, LEXIS)
  let docketNumber: string | undefined;
  let database: string | undefined;
  let electronicReportNumber: string | undefined;

  if (reporter === 'WL' || reporter === 'LEXIS') {
    database = reporter;
    // Volume is actually year, firstPage is the report number
    electronicReportNumber = firstPage;
  }

  // Check for docket number in the case name
  const docketMatch = caseName.match(/,?\s*No\.\s*([\w\d-]+)/);
  if (docketMatch) {
    docketNumber = docketMatch[1];
  }

  return {
    partyOne,
    partyTwo,
    volume,
    reporter,
    firstPage,
    pinCite,
    court,
    year,
    parentheticals: parentheticals.length > 0 ? parentheticals : undefined,
    subsequentHistory,
    docketNumber,
    database,
    electronicReportNumber,
  };
}

function stripLeadingParallelCitations(remainder: string): { remaining: string } {
  let remaining = remainder;

  const parallelPattern = new RegExp(
    `^,\\s*\\d{1,4}\\s+(?:${REPORTER_ALT})\\s+\\d{1,5}(?:,\\s*\\d[\\d–,\\s-]*)?`
  );

  while (true) {
    const match = remaining.match(parallelPattern);
    if (!match) break;
    remaining = remaining.slice(match[0].length);
  }

  return { remaining };
}

/**
 * Split a case name into party one and party two.
 * Accepts both "v." (correct) and "v" (lazy) as separators.
 */
function parseCaseNameParties(name: string): { partyOne: string; partyTwo: string } {
  // Handle non-adversarial procedural phrases — no "v."
  // R. 10.2.1(b): In re, Ex parte, In the Matter of, Estate of, Guardianship of, Ex rel.
  if (/^(?:In re|Ex parte|In the Matter of|Estate of|Guardianship of)\s+/i.test(name)) {
    return { partyOne: name, partyTwo: '' };
  }

  // Handle "Ex rel." — State ex rel. Party v. Party
  if (/\bex\s+rel\.\s/i.test(name)) {
    const vIndex = name.search(/\s+v\.?\s+/);
    if (vIndex !== -1) {
      const partyOne = name.slice(0, vIndex).trim();
      const partyTwo = name.slice(vIndex).replace(/^\s+v\.?\s+/, '').trim();
      return { partyOne, partyTwo };
    }
    return { partyOne: name, partyTwo: '' };
  }

  // Standard adversarial: Party v. Party or Party v Party
  // For consolidated cases with multiple "v." patterns, use only the first action
  const vMatches = [...name.matchAll(/\s+v\.?\s+/gi)];
  if (vMatches.length === 0) {
    return { partyOne: name, partyTwo: '' };
  }

  // Use the first "v." occurrence
  const firstV = vMatches[0];
  const vIndex = firstV.index!;

  const partyOne = name.slice(0, vIndex).trim();
  let partyTwo = name.slice(vIndex).replace(/^\s+v\.?\s+/, '').trim();

  // R. 10.2.1(a): Only first-named defendant — trim after "and", "&", or second "v."
  // But preserve corporate names like "Smith & Wesson" or "Johnson & Johnson"
  // Only split on standalone " and " or " & " that separate distinct parties
  const andSplit = partyTwo.match(/^(.+?)(?:\s+and\s+|\s+&\s+)(?=[A-Z][a-z]+ (?:v\.|of |ex ))/i);
  if (andSplit) {
    partyTwo = andSplit[1].trim();
  }

  return { partyOne, partyTwo };
}

/**
 * Parse a short-form case citation.
 * Pattern: Party, Vol Rep at Page
 */
export function parseShortCaseCitation(
  rawText: string,
  position: { start: number; end: number },
  context: CitationContext = 'citation_sentence'
): ParsedCitation | null {
  const text = rawText.trim();

  const reporterAbbrsSorted = Array.from(VALID_REPORTER_ABBREVIATIONS)
    .sort((a, b) => b.length - a.length);

  for (const abbr of reporterAbbrsSorted) {
    const escapedAbbr = abbr.replace(/\./g, '\\.').replace(/'/g, "\\'");
    const pattern = new RegExp(
      `^(.+?),\\s*(\\d{1,4})\\s+(${escapedAbbr})\\s+at\\s+(?:p(?:p|g|age)?\\.?\\s*)?([*]*\\d[\\d–\\-:,\\s*]*)$`
    );
    const match = text.match(pattern);
    if (match) {
      return {
        id: uuid(),
        rawText: text,
        type: 'short_form',
        context,
        position,
        components: {
          type: 'short_case',
          partyName: match[1].trim(),
          pinCite: match[4].trim(),
        },
      };
    }
  }

  return null;
}
