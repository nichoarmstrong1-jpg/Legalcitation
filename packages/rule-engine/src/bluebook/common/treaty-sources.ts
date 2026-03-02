/**
 * T4 — Treaty Sources
 * Maps full treaty source names to their Bluebook abbreviations.
 * Used by treaty-rules.ts to validate source citations per R. 21.4.5.
 */

/** U.S. treaty sources in order of preference per R. 21.4.5(a)(i) */
export const T4_US_TREATY_SOURCES: Record<string, string> = {
  'United States Treaties in Force': 'U.S.T.I.F.',
  'Treaties and Other International Acts Series': 'T.I.A.S.',
  'Treaty Series': 'T.S.',
  'Executive Agreement Series': 'E.A.S.',
  'United Nations Treaty Series': 'U.N.T.S.',
  'Senate Treaty Documents': 'S. Treaty Doc.',
  'Senate Executive Documents': 'S. Exec. Doc.',
  'United States Treaties and Other International Agreements': 'U.S.T.',
  'Statutes at Large': 'Stat.',
  'Department of State Dispatch': "Dep't State Dispatch",
  'Department of State Bulletin': "Dep't State Bull.",
};

/** International treaty sources per R. 21.4.5(a)(ii) and (b) */
export const T4_INTERNATIONAL_TREATY_SOURCES: Record<string, string> = {
  'United Nations Treaty Series': 'U.N.T.S.',
  'League of Nations Treaty Series': 'L.N.T.S.',
  'Organization of American States Treaty Series': 'O.A.S.T.S.',
  'Pan-American Treaty Series': 'Pan-Am. T.S.',
  'Official Journal': 'O.J.',
  'European Treaty Series': 'E.T.S.',
  'Council of Europe Treaty Series': 'C.E.T.S.',
};

/** Unofficial treaty sources per R. 21.4.5(c) */
export const T4_UNOFFICIAL_TREATY_SOURCES: Record<string, string> = {
  'International Legal Materials': 'I.L.M.',
};

/** All recognized treaty source abbreviations for validation */
export const T4_TREATY_SOURCE_ABBREVIATIONS = new Set([
  'U.S.T.I.F.',
  'T.I.A.S.',
  'T.S.',
  'E.A.S.',
  'U.N.T.S.',
  'S. Treaty Doc.',
  'S. Exec. Doc.',
  'U.S.T.',
  'Stat.',
  "Dep't State Dispatch",
  "Dep't State Bull.",
  'L.N.T.S.',
  'O.A.S.T.S.',
  'Pan-Am. T.S.',
  'O.J.',
  'E.T.S.',
  'C.E.T.S.',
  'I.L.M.',
]);
