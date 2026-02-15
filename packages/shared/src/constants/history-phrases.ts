/**
 * Bluebook Table T8 — Explanatory Phrases for Prior & Subsequent History
 * These phrases should be italicized.
 */

export const SUBSEQUENT_HISTORY_PHRASES: Record<string, string> = {
  "affirmed": "aff'd",
  "affirming": "aff'g",
  "affirmed in part": "aff'd in part",
  "affirmed sub nom.": "aff'd sub nom.",
  "appeal docketed": "appeal docketed",
  "appeal filed": "appeal filed",
  "certiorari denied": "cert. denied",
  "certiorari dismissed": "cert. dismissed",
  "certiorari granted": "cert. granted",
  "enforced": "enforced",
  "enforcing": "enforcing",
  "memorandum": "mem.",
  "modified": "modified",
  "modifying": "modifying",
  "no opinion": "no opinion",
  "overruled": "overruled",
  "overruled by": "overruled by",
  "overruling": "overruling",
  "petition for certiorari filed": "petition for cert. filed",
  "probable jurisdiction noted": "prob. juris. noted",
  "rehearing denied": "reh'g denied",
  "rehearing en banc denied": "reh'g en banc denied",
  "rehearing granted": "reh'g granted",
  "remanded": "remanded",
  "reversed": "rev'd",
  "reversing": "rev'g",
  "reversed and remanded": "rev'd & remanded",
  "reversed in part": "rev'd in part",
  "reversed on other grounds": "rev'd on other grounds",
  "reversed sub nom.": "rev'd sub nom.",
  "vacated": "vacated",
  "vacating": "vacating",
  "withdrawn": "withdrawn",
};

export const PRIOR_HISTORY_PHRASES: Record<string, string> = {
  "affirming": "aff'g",
  "enforcing": "enforcing",
  "modifying": "modifying",
  "overruling": "overruling",
  "reversing": "rev'g",
  "vacating": "vacating",
};

/** Abbreviations used with sub nom. */
export const SUB_NOM = 'sub nom.';

/** All valid history phrase abbreviations */
export const ALL_HISTORY_ABBREVIATIONS = new Set([
  ...Object.values(SUBSEQUENT_HISTORY_PHRASES),
  ...Object.values(PRIOR_HISTORY_PHRASES),
]);
