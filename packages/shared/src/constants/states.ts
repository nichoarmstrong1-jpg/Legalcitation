/**
 * Bluebook Table T10 — State, Territory, and City Abbreviations
 */

export interface StateEntry {
  full: string;
  abbreviation: string;
  postalCode: string;
}

export const T10_STATES: StateEntry[] = [
  { full: 'Alabama', abbreviation: 'Ala.', postalCode: 'AL' },
  { full: 'Alaska', abbreviation: 'Alaska', postalCode: 'AK' },
  { full: 'Arizona', abbreviation: 'Ariz.', postalCode: 'AZ' },
  { full: 'Arkansas', abbreviation: 'Ark.', postalCode: 'AR' },
  { full: 'California', abbreviation: 'Cal.', postalCode: 'CA' },
  { full: 'Colorado', abbreviation: 'Colo.', postalCode: 'CO' },
  { full: 'Connecticut', abbreviation: 'Conn.', postalCode: 'CT' },
  { full: 'Delaware', abbreviation: 'Del.', postalCode: 'DE' },
  { full: 'Florida', abbreviation: 'Fla.', postalCode: 'FL' },
  { full: 'Georgia', abbreviation: 'Ga.', postalCode: 'GA' },
  { full: 'Hawaii', abbreviation: 'Haw.', postalCode: 'HI' },
  { full: 'Idaho', abbreviation: 'Idaho', postalCode: 'ID' },
  { full: 'Illinois', abbreviation: 'Ill.', postalCode: 'IL' },
  { full: 'Indiana', abbreviation: 'Ind.', postalCode: 'IN' },
  { full: 'Iowa', abbreviation: 'Iowa', postalCode: 'IA' },
  { full: 'Kansas', abbreviation: 'Kan.', postalCode: 'KS' },
  { full: 'Kentucky', abbreviation: 'Ky.', postalCode: 'KY' },
  { full: 'Louisiana', abbreviation: 'La.', postalCode: 'LA' },
  { full: 'Maine', abbreviation: 'Me.', postalCode: 'ME' },
  { full: 'Maryland', abbreviation: 'Md.', postalCode: 'MD' },
  { full: 'Massachusetts', abbreviation: 'Mass.', postalCode: 'MA' },
  { full: 'Michigan', abbreviation: 'Mich.', postalCode: 'MI' },
  { full: 'Minnesota', abbreviation: 'Minn.', postalCode: 'MN' },
  { full: 'Mississippi', abbreviation: 'Miss.', postalCode: 'MS' },
  { full: 'Missouri', abbreviation: 'Mo.', postalCode: 'MO' },
  { full: 'Montana', abbreviation: 'Mont.', postalCode: 'MT' },
  { full: 'Nebraska', abbreviation: 'Neb.', postalCode: 'NE' },
  { full: 'Nevada', abbreviation: 'Nev.', postalCode: 'NV' },
  { full: 'New Hampshire', abbreviation: 'N.H.', postalCode: 'NH' },
  { full: 'New Jersey', abbreviation: 'N.J.', postalCode: 'NJ' },
  { full: 'New Mexico', abbreviation: 'N.M.', postalCode: 'NM' },
  { full: 'New York', abbreviation: 'N.Y.', postalCode: 'NY' },
  { full: 'North Carolina', abbreviation: 'N.C.', postalCode: 'NC' },
  { full: 'North Dakota', abbreviation: 'N.D.', postalCode: 'ND' },
  { full: 'Ohio', abbreviation: 'Ohio', postalCode: 'OH' },
  { full: 'Oklahoma', abbreviation: 'Okla.', postalCode: 'OK' },
  { full: 'Oregon', abbreviation: 'Or.', postalCode: 'OR' },
  { full: 'Pennsylvania', abbreviation: 'Pa.', postalCode: 'PA' },
  { full: 'Rhode Island', abbreviation: 'R.I.', postalCode: 'RI' },
  { full: 'South Carolina', abbreviation: 'S.C.', postalCode: 'SC' },
  { full: 'South Dakota', abbreviation: 'S.D.', postalCode: 'SD' },
  { full: 'Tennessee', abbreviation: 'Tenn.', postalCode: 'TN' },
  { full: 'Texas', abbreviation: 'Tex.', postalCode: 'TX' },
  { full: 'Utah', abbreviation: 'Utah', postalCode: 'UT' },
  { full: 'Vermont', abbreviation: 'Vt.', postalCode: 'VT' },
  { full: 'Virginia', abbreviation: 'Va.', postalCode: 'VA' },
  { full: 'Washington', abbreviation: 'Wash.', postalCode: 'WA' },
  { full: 'West Virginia', abbreviation: 'W. Va.', postalCode: 'WV' },
  { full: 'Wisconsin', abbreviation: 'Wis.', postalCode: 'WI' },
  { full: 'Wyoming', abbreviation: 'Wyo.', postalCode: 'WY' },
];

export const T10_TERRITORIES: StateEntry[] = [
  { full: 'American Samoa', abbreviation: 'Am. Sam.', postalCode: 'AS' },
  { full: 'District of Columbia', abbreviation: 'D.C.', postalCode: 'DC' },
  { full: 'Guam', abbreviation: 'Guam', postalCode: 'GU' },
  { full: 'Northern Mariana Islands', abbreviation: 'N. Mar. I.', postalCode: 'MP' },
  { full: 'Puerto Rico', abbreviation: 'P.R.', postalCode: 'PR' },
  { full: 'Virgin Islands', abbreviation: 'V.I.', postalCode: 'VI' },
];

export const T10_CITIES: Record<string, string> = {
  'Baltimore': 'Balt.',
  'Boston': 'Bos.',
  'Chicago': 'Chi.',
  'Dallas': 'Dall.',
  'District of Columbia': 'D.C.',
  'Houston': 'Hous.',
  'Los Angeles': 'L.A.',
  'Miami': 'Mia.',
  'New York City': 'N.Y.C.',
  'Philadelphia': 'Phila.',
  'Phoenix': 'Phx.',
  'San Francisco': 'S.F.',
};

/** Quick lookup: full state name → abbreviation */
export const STATE_TO_ABBR: Record<string, string> = Object.fromEntries(
  [...T10_STATES, ...T10_TERRITORIES].map(s => [s.full, s.abbreviation])
);

/** Quick lookup: abbreviation → full state name */
export const ABBR_TO_STATE: Record<string, string> = Object.fromEntries(
  [...T10_STATES, ...T10_TERRITORIES].map(s => [s.abbreviation, s.full])
);
