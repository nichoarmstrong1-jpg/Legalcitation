/**
 * Bluebook Table T7 — Court Abbreviations
 */

export const COURT_ABBREVIATIONS: Record<string, string> = {
  // Federal
  'Supreme Court': '',
  'Court of Appeals': 'Cir.',
  'District Court': 'D.',
  'Bankruptcy Court': 'Bankr.',
  'Bankruptcy Appellate Panel': 'B.A.P.',
  'Court of Federal Claims': 'Fed. Cl.',
  'Court of International Trade': 'Ct. Int\'l Trade',
  'Tax Court': 'T.C.',
  'Judicial Panel on Multidistrict Litigation': 'J.P.M.L.',

  // State court types
  'Supreme Court (state)': 'Sup. Ct.',
  'Court of Appeals (state)': 'Ct. App.',
  'Appellate Court': 'App. Ct.',
  'Appellate Division': 'App. Div.',
  'Superior Court': 'Super. Ct.',
  'Court of Special Appeals': 'Ct. Spec. App.',
  'Court of Criminal Appeals': 'Ct. Crim. App.',
};

/**
 * State court abbreviation patterns used in parentheticals.
 * When citing a state high court using a regional reporter,
 * include the state abbreviation. For intermediate courts,
 * include state + court abbreviation.
 */
export const STATE_COURT_TYPES: Record<string, string> = {
  'Ct. App.': 'intermediate appellate',
  'App. Ct.': 'intermediate appellate',
  'App. Div.': 'intermediate appellate',
  'Super. Ct.': 'trial',
  'Sup. Ct.': 'highest',
  'Ct. Spec. App.': 'intermediate appellate',
  'Ct. Crim. App.': 'intermediate appellate',
  'Dist. Ct.': 'trial',
};

/**
 * Federal district court abbreviations by state
 */
export const FEDERAL_DISTRICTS: Record<string, string[]> = {
  'Alabama': ['N.D. Ala.', 'M.D. Ala.', 'S.D. Ala.'],
  'Alaska': ['D. Alaska'],
  'Arizona': ['D. Ariz.'],
  'Arkansas': ['E.D. Ark.', 'W.D. Ark.'],
  'California': ['N.D. Cal.', 'E.D. Cal.', 'C.D. Cal.', 'S.D. Cal.'],
  'Colorado': ['D. Colo.'],
  'Connecticut': ['D. Conn.'],
  'Delaware': ['D. Del.'],
  'District of Columbia': ['D.D.C.'],
  'Florida': ['N.D. Fla.', 'M.D. Fla.', 'S.D. Fla.'],
  'Georgia': ['N.D. Ga.', 'M.D. Ga.', 'S.D. Ga.'],
  'Hawaii': ['D. Haw.'],
  'Idaho': ['D. Idaho'],
  'Illinois': ['N.D. Ill.', 'C.D. Ill.', 'S.D. Ill.'],
  'Indiana': ['N.D. Ind.', 'S.D. Ind.'],
  'Iowa': ['N.D. Iowa', 'S.D. Iowa'],
  'Kansas': ['D. Kan.'],
  'Kentucky': ['E.D. Ky.', 'W.D. Ky.'],
  'Louisiana': ['E.D. La.', 'M.D. La.', 'W.D. La.'],
  'Maine': ['D. Me.'],
  'Maryland': ['D. Md.'],
  'Massachusetts': ['D. Mass.'],
  'Michigan': ['E.D. Mich.', 'W.D. Mich.'],
  'Minnesota': ['D. Minn.'],
  'Mississippi': ['N.D. Miss.', 'S.D. Miss.'],
  'Missouri': ['E.D. Mo.', 'W.D. Mo.'],
  'Montana': ['D. Mont.'],
  'Nebraska': ['D. Neb.'],
  'Nevada': ['D. Nev.'],
  'New Hampshire': ['D.N.H.'],
  'New Jersey': ['D.N.J.'],
  'New Mexico': ['D.N.M.'],
  'New York': ['N.D.N.Y.', 'S.D.N.Y.', 'E.D.N.Y.', 'W.D.N.Y.'],
  'North Carolina': ['E.D.N.C.', 'M.D.N.C.', 'W.D.N.C.'],
  'North Dakota': ['D.N.D.'],
  'Ohio': ['N.D. Ohio', 'S.D. Ohio'],
  'Oklahoma': ['N.D. Okla.', 'E.D. Okla.', 'W.D. Okla.'],
  'Oregon': ['D. Or.'],
  'Pennsylvania': ['E.D. Pa.', 'M.D. Pa.', 'W.D. Pa.'],
  'Rhode Island': ['D.R.I.'],
  'South Carolina': ['D.S.C.'],
  'South Dakota': ['D.S.D.'],
  'Tennessee': ['E.D. Tenn.', 'M.D. Tenn.', 'W.D. Tenn.'],
  'Texas': ['N.D. Tex.', 'S.D. Tex.', 'E.D. Tex.', 'W.D. Tex.'],
  'Utah': ['D. Utah'],
  'Vermont': ['D. Vt.'],
  'Virginia': ['E.D. Va.', 'W.D. Va.'],
  'Washington': ['E.D. Wash.', 'W.D. Wash.'],
  'West Virginia': ['N.D. W. Va.', 'S.D. W. Va.'],
  'Wisconsin': ['E.D. Wis.', 'W.D. Wis.'],
  'Wyoming': ['D. Wyo.'],
};

/** Set of all valid district abbreviations */
export const ALL_DISTRICT_ABBREVIATIONS = new Set(
  Object.values(FEDERAL_DISTRICTS).flat()
);

/**
 * R. 1.4 — Federal court hierarchy for citation ordering.
 * Lower number = higher rank = cited first.
 */
export const FEDERAL_COURT_HIERARCHY: Record<string, number> = {
  'Supreme Court': 0,
  'Courts of Appeals': 1,
  'District Courts': 2,
  'Bankruptcy Courts': 3,
  'Court of Federal Claims': 4,
  'Court of Appeals for the Armed Forces': 5,
  'Court of Appeals for Veterans Claims': 6,
  'Tax Court': 7,
  // Catch-all for state courts within federal ordering
  'Court of Appeal': 10,
  'Appellate Division': 10,
  'Appellate Court': 10,
  'various': 10,
};

/**
 * R. 1.4 — States in alphabetical order for citation ordering.
 * Within the same court level, state courts are ordered alphabetically by state.
 */
export const STATE_ALPHABETICAL = new Map<string, number>([
  ['Alabama', 0], ['Alaska', 1], ['Arizona', 2], ['Arkansas', 3],
  ['California', 4], ['Colorado', 5], ['Connecticut', 6], ['Delaware', 7],
  ['District of Columbia', 8], ['Florida', 9], ['Georgia', 10], ['Hawaii', 11],
  ['Idaho', 12], ['Illinois', 13], ['Indiana', 14], ['Iowa', 15],
  ['Kansas', 16], ['Kentucky', 17], ['Louisiana', 18], ['Maine', 19],
  ['Maryland', 20], ['Massachusetts', 21], ['Michigan', 22], ['Minnesota', 23],
  ['Mississippi', 24], ['Missouri', 25], ['Montana', 26], ['Nebraska', 27],
  ['Nevada', 28], ['New Hampshire', 29], ['New Jersey', 30], ['New Mexico', 31],
  ['New York', 32], ['North Carolina', 33], ['North Dakota', 34], ['Ohio', 35],
  ['Oklahoma', 36], ['Oregon', 37], ['Pennsylvania', 38], ['Rhode Island', 39],
  ['South Carolina', 40], ['South Dakota', 41], ['Tennessee', 42], ['Texas', 43],
  ['Utah', 44], ['Vermont', 45], ['Virginia', 46], ['Washington', 47],
  ['West Virginia', 48], ['Wisconsin', 49], ['Wyoming', 50],
]);
