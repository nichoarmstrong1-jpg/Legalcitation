import { v4 as uuid } from 'uuid';
import type { ParsedCitation, CaseComponents, CitationContext } from '@legalcitation/shared';
import { VALID_REPORTER_ABBREVIATIONS, ALL_REPORTERS } from '@legalcitation/shared';

/**
 * Parse a full case citation string into structured components.
 * Handles the standard Bluebook format:
 *   Party One v. Party Two, Vol Reporter Page, PinCite (Court Year) (parentheticals), history.
 */
export function parseCaseCitation(
  rawText: string,
  position: { start: number; end: number },
  context: CitationContext = 'citation_sentence'
): ParsedCitation | null {
  const text = rawText.trim();

  // Try standard case pattern first
  const result = parseStandardCase(text);
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
    const pattern = new RegExp(
      `^(.+?),\\s*(\\d{1,4})\\s+(${escapedAbbr})\\s+(\\d{1,5})(.*)$`,
      's'
    );
    const match = text.match(pattern);
    if (match) {
      caseName = match[1].trim();
      volume = match[2];
      reporter = abbr;
      firstPage = match[4];
      remainder = match[5].trim();
      break;
    }
  }

  if (!caseName) return null;

  // Step 2: Parse case name into parties
  const { partyOne, partyTwo } = parseCaseNameParties(caseName);

  // Step 3: Extract pincite from remainder (comes before the date parenthetical)
  let pinCite: string | undefined;
  let afterPinCite = remainder;

  const pinCiteMatch = remainder.match(/^,\s*([\d–\-,\s]+(?:n\.\d+)?)\s*(\(.*)$/);
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

  // Step 6: Extract subsequent history
  let subsequentHistory: string | undefined;
  const historyMatch = parenRemainder.match(/^,?\s*(aff'd|rev'd|cert\.\s*denied|vacated|modified|reh'g\s*denied|overruled|rev'd\s*sub\s*nom\.|aff'd\s*sub\s*nom\.)\s*.*/i);
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

/**
 * Split a case name into party one and party two.
 */
function parseCaseNameParties(name: string): { partyOne: string; partyTwo: string } {
  // Handle "In re", "Ex parte" — no "v."
  if (/^(?:In re|Ex parte)\s+/i.test(name)) {
    return { partyOne: name, partyTwo: '' };
  }

  // Standard adversarial: Party v. Party
  const vIndex = name.search(/\s+v\.\s+/);
  if (vIndex === -1) {
    return { partyOne: name, partyTwo: '' };
  }

  const partyOne = name.slice(0, vIndex).trim();
  const partyTwo = name.slice(vIndex).replace(/^\s+v\.\s+/, '').trim();

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
      `^(.+?),\\s*(\\d{1,4})\\s+(${escapedAbbr})\\s+at\\s+(\\d[\\d–\\-,\\s]*)$`
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
