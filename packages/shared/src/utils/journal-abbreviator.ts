import { T6_ABBREVIATIONS } from '../constants/abbreviations.js';
import {
  T13_PERIODICALS,
  JOURNAL_ABBREVIATIONS,
  JOURNAL_ABBREVIATION_REVERSE,
  PERIODICAL_OMIT_WORDS,
} from '../constants/periodicals.js';
import { STATE_TO_ABBR } from '../constants/states.js';

export interface JournalLookupResult {
  abbreviation: string;
  fullName: string;
  source: 'T13' | 'T6_generated' | 'known';
}

/**
 * Check whether an abbreviated token is a single-capital abbreviation
 * (e.g., "L.", "J.", "Q.", "F.") vs. a multi-letter abbreviation (e.g., "Rev.", "Harv.").
 *
 * Per R. 6.2(a), adjacent single-capital abbreviations are closed up: "L.J."
 * while multi-letter abbreviations get a space: "L. Rev."
 */
function isSingleCapitalAbbr(token: string): boolean {
  return /^[A-Z]\.$/.test(token);
}

/**
 * Join abbreviated tokens using Bluebook R. 6.2(a) spacing rules:
 * - Adjacent single-capital abbreviations close up: "L." + "J." = "L.J."
 * - Otherwise, separate with a space: "L." + "Rev." = "L. Rev."
 */
function joinWithSpacingRules(tokens: string[]): string {
  if (tokens.length === 0) return '';
  let result = tokens[0];

  for (let i = 1; i < tokens.length; i++) {
    const prev = tokens[i - 1];
    const curr = tokens[i];

    if (isSingleCapitalAbbr(prev) && isSingleCapitalAbbr(curr)) {
      // Close up adjacent single capitals: L. + J. = L.J.
      result += curr;
    } else {
      result += ' ' + curr;
    }
  }

  return result;
}

/**
 * Try to match multi-word T13 institutional names at the given position in the word array.
 * Returns the abbreviation and number of words consumed, or null.
 */
function matchT13Institutional(words: string[], startIdx: number): { abbr: string; consumed: number } | null {
  // Try longest match first (up to 5 words)
  for (let len = Math.min(5, words.length - startIdx); len >= 2; len--) {
    const phrase = words.slice(startIdx, startIdx + len).join(' ');
    const abbr = T13_PERIODICALS[phrase];
    if (abbr) {
      return { abbr, consumed: len };
    }
  }
  return null;
}

/**
 * Abbreviate a single word using T.6 abbreviations, state names, or T.13 single-word entries.
 * Returns the abbreviation or the original word if no abbreviation exists.
 */
function abbreviateWord(word: string): string {
  // Check T13 single-word institutional names (e.g., "Harvard" → "Harv.")
  if (T13_PERIODICALS[word]) {
    return T13_PERIODICALS[word];
  }

  // Check T6 abbreviations (e.g., "Law" → "L.", "Review" → "Rev.")
  if (T6_ABBREVIATIONS[word]) {
    return T6_ABBREVIATIONS[word];
  }

  // Check state abbreviations (e.g., "Pennsylvania" → "Pa.")
  if (STATE_TO_ABBR[word]) {
    return STATE_TO_ABBR[word];
  }

  // No abbreviation found — return as-is
  return word;
}

/**
 * Abbreviate a full journal title word-by-word using T.6, T.13, and T.10 rules.
 *
 * Rules applied:
 * - Omit words in PERIODICAL_OMIT_WORDS (a, an, at, in, of, the, and, for, on, to, from, by)
 * - Look up T13 multi-word institutional names first (e.g., "George Washington" → "Geo. Wash.")
 * - Look up T13 single-word institutional names (e.g., "Harvard" → "Harv.")
 * - Look up T6 word abbreviations (e.g., "Law" → "L.", "Review" → "Rev.")
 * - Look up state abbreviations per T10 (e.g., "Pennsylvania" → "Pa.")
 * - Words with no abbreviation stay as-is (e.g., "Tax", "Yale")
 * - Spacing per R. 6.2(a): close up adjacent single capitals ("L.J."), otherwise space ("L. Rev.")
 * - Preserve "&"
 * - Handle hyphenated words (abbreviate each part)
 */
export function abbreviateJournalTitle(fullName: string): string {
  const words = fullName.split(/\s+/);
  const abbreviated: string[] = [];
  let i = 0;

  while (i < words.length) {
    const word = words[i];
    const lower = word.toLowerCase();

    // Skip omit words
    if (PERIODICAL_OMIT_WORDS.has(lower)) {
      i++;
      continue;
    }

    // Preserve "&" as-is
    if (word === '&') {
      abbreviated.push('&');
      i++;
      continue;
    }

    // Try multi-word T13 institutional match
    const t13Match = matchT13Institutional(words, i);
    if (t13Match) {
      abbreviated.push(t13Match.abbr);
      i += t13Match.consumed;
      continue;
    }

    // Handle hyphenated words: abbreviate each part separately
    if (word.includes('-')) {
      const parts = word.split('-');
      const abbrParts = parts.map((part) => abbreviateWord(part));
      abbreviated.push(abbrParts.join('-'));
      i++;
      continue;
    }

    // Abbreviate single word
    abbreviated.push(abbreviateWord(word));
    i++;
  }

  return joinWithSpacingRules(abbreviated);
}

/**
 * Look up a journal by full name or abbreviation.
 *
 * 1. Check JOURNAL_ABBREVIATIONS for exact full-name match
 * 2. Check JOURNAL_ABBREVIATION_REVERSE for exact abbreviation match (reverse lookup)
 * 3. Fall back to T.6-generated abbreviation via abbreviateJournalTitle()
 */
export function lookupJournal(input: string): JournalLookupResult | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Exact full-name match (case-insensitive)
  for (const [fullName, abbreviation] of Object.entries(JOURNAL_ABBREVIATIONS)) {
    if (fullName.toLowerCase() === trimmed.toLowerCase()) {
      return { abbreviation, fullName, source: 'known' };
    }
  }

  // Exact abbreviation match (reverse lookup)
  if (JOURNAL_ABBREVIATION_REVERSE[trimmed]) {
    return {
      abbreviation: trimmed,
      fullName: JOURNAL_ABBREVIATION_REVERSE[trimmed],
      source: 'known',
    };
  }

  // Fall back to T.6-generated abbreviation
  // Only generate if the input looks like a full name (has spaces, no trailing periods on most words)
  const words = trimmed.split(/\s+/);
  const looksLikeFullName = words.length >= 2 && words.filter(w => w.endsWith('.')).length < words.length / 2;

  if (looksLikeFullName) {
    const generated = abbreviateJournalTitle(trimmed);
    if (generated !== trimmed) {
      return {
        abbreviation: generated,
        fullName: trimmed,
        source: 'T6_generated',
      };
    }
  }

  return null;
}
