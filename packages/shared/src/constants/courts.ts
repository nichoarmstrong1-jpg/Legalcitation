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
