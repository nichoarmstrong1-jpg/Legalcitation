/**
 * Extended reporter database — ported from Free Law Project's reporters-db.
 * Covers specialty courts, tax courts, nominative reporters, vendor-neutral
 * formats, and state-specific reporters not in the base reporters.ts.
 */
import type { ReporterEntry } from './reporters.js';

export const SPECIALTY_REPORTERS: ReporterEntry[] = [
  // Tax Court
  { abbreviation: 'T.C.', fullName: 'Tax Court Reports', jurisdiction: 'federal', court: 'Tax Court', citeType: 'specialty' },
  { abbreviation: 'T.C. Memo.', fullName: 'Tax Court Memorandum Decisions', jurisdiction: 'federal', court: 'Tax Court', citeType: 'specialty', regexTemplate: String.raw`T\.C\. Memo\.?\s+\d{4}-\d+` },
  { abbreviation: 'T.C. Summary Opinion', fullName: 'Tax Court Summary Opinions', jurisdiction: 'federal', court: 'Tax Court', citeType: 'specialty', regexTemplate: String.raw`T\.C\. Summary Opinion\s+\d{4}-\d+` },
  { abbreviation: 'T.C. No.', fullName: 'Tax Court Number', jurisdiction: 'federal', court: 'Tax Court', citeType: 'specialty' },

  // Bankruptcy
  { abbreviation: 'Bankr. L. Rep. (CCH)', fullName: 'Bankruptcy Law Reporter', jurisdiction: 'federal', court: 'Bankruptcy Courts', citeType: 'specialty' },

  // Court of Claims / Federal Claims
  { abbreviation: 'Ct. Cl.', fullName: 'Court of Claims Reports', jurisdiction: 'federal', court: 'Court of Claims', citeType: 'federal' },
  { abbreviation: 'Ct. Int\'l Trade', fullName: 'Court of International Trade Reports', jurisdiction: 'federal', court: 'Court of International Trade', citeType: 'federal' },

  // Immigration
  { abbreviation: 'I. & N. Dec.', fullName: 'Immigration and Nationality Decisions', jurisdiction: 'federal', court: 'Board of Immigration Appeals', citeType: 'specialty' },

  // NLRB
  { abbreviation: 'N.L.R.B.', fullName: 'Decisions of the NLRB', jurisdiction: 'federal', court: 'NLRB', citeType: 'specialty' },

  // SEC
  { abbreviation: 'S.E.C.', fullName: 'SEC Decisions and Reports', jurisdiction: 'federal', court: 'SEC', citeType: 'specialty' },

  // Merit Systems
  { abbreviation: 'M.S.P.B.', fullName: 'Merit Systems Protection Board Decisions', jurisdiction: 'federal', court: 'MSPB', citeType: 'specialty' },

  // Public Utilities
  { abbreviation: 'P.U.R.', fullName: 'Public Utilities Reports', jurisdiction: 'federal', court: 'various', citeType: 'specialty' },

  // Westlaw / Lexis
  { abbreviation: 'WL', fullName: 'Westlaw', jurisdiction: 'federal', court: 'various', citeType: 'specialty' },
  { abbreviation: 'LEXIS', fullName: 'LexisNexis', jurisdiction: 'federal', court: 'various', citeType: 'specialty' },
];

export const NOMINATIVE_REPORTERS: ReporterEntry[] = [
  // U.S. Supreme Court nominative reporters
  { abbreviation: 'Dall.', fullName: 'Dallas Reports', jurisdiction: 'federal', court: 'Supreme Court', isNominative: true, startYear: 1790, endYear: 1800 },
  { abbreviation: 'Cranch', fullName: 'Cranch Reports', jurisdiction: 'federal', court: 'Supreme Court', isNominative: true, startYear: 1801, endYear: 1815 },
  { abbreviation: 'Wheat.', fullName: 'Wheaton Reports', jurisdiction: 'federal', court: 'Supreme Court', isNominative: true, startYear: 1816, endYear: 1827 },
  { abbreviation: 'Pet.', fullName: 'Peters Reports', jurisdiction: 'federal', court: 'Supreme Court', isNominative: true, startYear: 1828, endYear: 1842 },
  { abbreviation: 'How.', fullName: 'Howard Reports', jurisdiction: 'federal', court: 'Supreme Court', isNominative: true, startYear: 1843, endYear: 1860 },
  { abbreviation: 'Black', fullName: 'Black Reports', jurisdiction: 'federal', court: 'Supreme Court', isNominative: true, startYear: 1861, endYear: 1862 },
  { abbreviation: 'Wall.', fullName: 'Wallace Reports', jurisdiction: 'federal', court: 'Supreme Court', isNominative: true, startYear: 1863, endYear: 1874 },
];

export const VENDOR_NEUTRAL_REPORTERS: ReporterEntry[] = [
  // State public domain / vendor-neutral citation formats
  { abbreviation: 'NMCERT', fullName: 'New Mexico Certiorari', jurisdiction: 'New Mexico', court: 'Supreme Court', citeType: 'neutral', regexTemplate: String.raw`\d{4}-NMCERT-\d+` },
  { abbreviation: 'NMSC', fullName: 'New Mexico Supreme Court', jurisdiction: 'New Mexico', court: 'Supreme Court', citeType: 'neutral', regexTemplate: String.raw`\d{4}-NMSC-\d+` },
  { abbreviation: 'NMCA', fullName: 'New Mexico Court of Appeals', jurisdiction: 'New Mexico', court: 'Court of Appeals', citeType: 'neutral', regexTemplate: String.raw`\d{4}-NMCA-\d+` },
  { abbreviation: 'Ohio', fullName: 'Ohio Vendor Neutral', jurisdiction: 'Ohio', court: 'various', citeType: 'neutral', regexTemplate: String.raw`\d{4}-Ohio-\d+` },
  { abbreviation: 'ND', fullName: 'North Dakota', jurisdiction: 'North Dakota', court: 'Supreme Court', citeType: 'neutral', regexTemplate: String.raw`\d{4}\s+ND\s+\d+` },
  { abbreviation: 'SD', fullName: 'South Dakota', jurisdiction: 'South Dakota', court: 'Supreme Court', citeType: 'neutral', regexTemplate: String.raw`\d{4}\s+SD\s+\d+` },
  { abbreviation: 'UT', fullName: 'Utah', jurisdiction: 'Utah', court: 'Supreme Court', citeType: 'neutral', regexTemplate: String.raw`\d{4}\s+UT\s+\d+` },
  { abbreviation: 'VT', fullName: 'Vermont', jurisdiction: 'Vermont', court: 'Supreme Court', citeType: 'neutral', regexTemplate: String.raw`\d{4}\s+VT\s+\d+` },
  { abbreviation: 'WI', fullName: 'Wisconsin', jurisdiction: 'Wisconsin', court: 'Supreme Court', citeType: 'neutral', regexTemplate: String.raw`\d{4}\s+WI\s+\d+` },
  { abbreviation: 'WY', fullName: 'Wyoming', jurisdiction: 'Wyoming', court: 'Supreme Court', citeType: 'neutral', regexTemplate: String.raw`\d{4}\s+WY\s+\d+` },
  { abbreviation: 'ME', fullName: 'Maine', jurisdiction: 'Maine', court: 'Supreme Judicial Court', citeType: 'neutral', regexTemplate: String.raw`\d{4}\s+ME\s+\d+` },
  { abbreviation: 'MT', fullName: 'Montana', jurisdiction: 'Montana', court: 'Supreme Court', citeType: 'neutral', regexTemplate: String.raw`\d{4}\s+MT\s+\d+` },
  { abbreviation: 'IL App', fullName: 'Illinois Appellate Vendor Neutral', jurisdiction: 'Illinois', court: 'Appellate Court', citeType: 'neutral', regexTemplate: String.raw`\d{4}\s+IL\s+App\s+\(\d+(?:st|nd|rd|th)\)\s+\d+` },
  { abbreviation: 'IL', fullName: 'Illinois Supreme Vendor Neutral', jurisdiction: 'Illinois', court: 'Supreme Court', citeType: 'neutral', regexTemplate: String.raw`\d{4}\s+IL\s+\d+` },
];

export const ADDITIONAL_STATE_REPORTERS: ReporterEntry[] = [
  // Nebraska
  { abbreviation: 'Neb.', fullName: 'Nebraska Reports', jurisdiction: 'Nebraska', court: 'Supreme Court', citeType: 'state' },
  { abbreviation: 'Neb. App.', fullName: 'Nebraska Appellate Reports', jurisdiction: 'Nebraska', court: 'Court of Appeals', citeType: 'state' },

  // New Jersey
  { abbreviation: 'N.J.', fullName: 'New Jersey Reports', jurisdiction: 'New Jersey', court: 'Supreme Court', citeType: 'state' },
  { abbreviation: 'N.J. Super.', fullName: 'New Jersey Superior Court Reports', jurisdiction: 'New Jersey', court: 'Superior Court', citeType: 'state' },

  // Washington
  { abbreviation: 'Wash.', fullName: 'Washington Reports', jurisdiction: 'Washington', court: 'Supreme Court', citeType: 'state' },
  { abbreviation: 'Wash. 2d', fullName: 'Washington Reports, Second Series', jurisdiction: 'Washington', court: 'Supreme Court', citeType: 'state', series: 2 },
  { abbreviation: 'Wash. App.', fullName: 'Washington Appellate Reports', jurisdiction: 'Washington', court: 'Court of Appeals', citeType: 'state' },

  // Oregon
  { abbreviation: 'Or.', fullName: 'Oregon Reports', jurisdiction: 'Oregon', court: 'Supreme Court', citeType: 'state' },
  { abbreviation: 'Or. App.', fullName: 'Oregon Reports, Court of Appeals', jurisdiction: 'Oregon', court: 'Court of Appeals', citeType: 'state' },

  // Virginia
  { abbreviation: 'Va.', fullName: 'Virginia Reports', jurisdiction: 'Virginia', court: 'Supreme Court', citeType: 'state' },
  { abbreviation: 'Va. App.', fullName: 'Virginia Court of Appeals Reports', jurisdiction: 'Virginia', court: 'Court of Appeals', citeType: 'state' },

  // Maryland
  { abbreviation: 'Md.', fullName: 'Maryland Reports', jurisdiction: 'Maryland', court: 'Court of Appeals', citeType: 'state' },
  { abbreviation: 'Md. App.', fullName: 'Maryland Appellate Reports', jurisdiction: 'Maryland', court: 'Court of Special Appeals', citeType: 'state' },

  // Georgia
  { abbreviation: 'Ga.', fullName: 'Georgia Reports', jurisdiction: 'Georgia', court: 'Supreme Court', citeType: 'state' },
  { abbreviation: 'Ga. App.', fullName: 'Georgia Appeals Reports', jurisdiction: 'Georgia', court: 'Court of Appeals', citeType: 'state' },

  // Michigan
  { abbreviation: 'Mich.', fullName: 'Michigan Reports', jurisdiction: 'Michigan', court: 'Supreme Court', citeType: 'state' },
  { abbreviation: 'Mich. App.', fullName: 'Michigan Appeals Reports', jurisdiction: 'Michigan', court: 'Court of Appeals', citeType: 'state' },

  // Minnesota
  { abbreviation: 'Minn.', fullName: 'Minnesota Reports', jurisdiction: 'Minnesota', court: 'Supreme Court', citeType: 'state' },

  // Wisconsin
  { abbreviation: 'Wis.', fullName: 'Wisconsin Reports', jurisdiction: 'Wisconsin', court: 'Supreme Court', citeType: 'state' },
  { abbreviation: 'Wis. 2d', fullName: 'Wisconsin Reports, Second Series', jurisdiction: 'Wisconsin', court: 'Supreme Court', citeType: 'state', series: 2 },

  // Iowa
  { abbreviation: 'Iowa', fullName: 'Iowa Reports', jurisdiction: 'Iowa', court: 'Supreme Court', citeType: 'state' },

  // Kansas
  { abbreviation: 'Kan.', fullName: 'Kansas Reports', jurisdiction: 'Kansas', court: 'Supreme Court', citeType: 'state' },
  { abbreviation: 'Kan. App.', fullName: 'Kansas Court of Appeals Reports', jurisdiction: 'Kansas', court: 'Court of Appeals', citeType: 'state' },
  { abbreviation: 'Kan. App. 2d', fullName: 'Kansas Court of Appeals Reports, Second Series', jurisdiction: 'Kansas', court: 'Court of Appeals', citeType: 'state', series: 2 },

  // Arizona
  { abbreviation: 'Ariz.', fullName: 'Arizona Reports', jurisdiction: 'Arizona', court: 'Supreme Court', citeType: 'state' },
  { abbreviation: 'Ariz. App.', fullName: 'Arizona Appeals Reports', jurisdiction: 'Arizona', court: 'Court of Appeals', citeType: 'state' },

  // Colorado
  { abbreviation: 'Colo.', fullName: 'Colorado Reports', jurisdiction: 'Colorado', court: 'Supreme Court', citeType: 'state' },
  { abbreviation: 'Colo. App.', fullName: 'Colorado Court of Appeals Reports', jurisdiction: 'Colorado', court: 'Court of Appeals', citeType: 'state' },

  // Indiana
  { abbreviation: 'Ind.', fullName: 'Indiana Reports', jurisdiction: 'Indiana', court: 'Supreme Court', citeType: 'state' },
  { abbreviation: 'Ind. App.', fullName: 'Indiana Appellate Reports', jurisdiction: 'Indiana', court: 'Court of Appeals', citeType: 'state' },

  // Missouri
  { abbreviation: 'Mo.', fullName: 'Missouri Reports', jurisdiction: 'Missouri', court: 'Supreme Court', citeType: 'state' },
  { abbreviation: 'Mo. App.', fullName: 'Missouri Appeals Reports', jurisdiction: 'Missouri', court: 'Court of Appeals', citeType: 'state' },

  // Louisiana
  { abbreviation: 'La.', fullName: 'Louisiana Reports', jurisdiction: 'Louisiana', court: 'Supreme Court', citeType: 'state' },
  { abbreviation: 'La. App.', fullName: 'Louisiana Court of Appeal Reports', jurisdiction: 'Louisiana', court: 'Court of Appeal', citeType: 'state' },

  // Alabama
  { abbreviation: 'Ala.', fullName: 'Alabama Reports', jurisdiction: 'Alabama', court: 'Supreme Court', citeType: 'state' },

  // South Carolina
  { abbreviation: 'S.C.', fullName: 'South Carolina Reports', jurisdiction: 'South Carolina', court: 'Supreme Court', citeType: 'state' },

  // North Carolina
  { abbreviation: 'N.C.', fullName: 'North Carolina Reports', jurisdiction: 'North Carolina', court: 'Supreme Court', citeType: 'state' },
  { abbreviation: 'N.C. App.', fullName: 'North Carolina Court of Appeals Reports', jurisdiction: 'North Carolina', court: 'Court of Appeals', citeType: 'state' },

  // Tennessee
  { abbreviation: 'Tenn.', fullName: 'Tennessee Reports', jurisdiction: 'Tennessee', court: 'Supreme Court', citeType: 'state' },
  { abbreviation: 'Tenn. App.', fullName: 'Tennessee Appeals Reports', jurisdiction: 'Tennessee', court: 'Court of Appeals', citeType: 'state' },

  // Kentucky
  { abbreviation: 'Ky.', fullName: 'Kentucky Reports', jurisdiction: 'Kentucky', court: 'Supreme Court', citeType: 'state' },

  // Mississippi
  { abbreviation: 'Miss.', fullName: 'Mississippi Reports', jurisdiction: 'Mississippi', court: 'Supreme Court', citeType: 'state' },

  // Arkansas
  { abbreviation: 'Ark.', fullName: 'Arkansas Reports', jurisdiction: 'Arkansas', court: 'Supreme Court', citeType: 'state' },
  { abbreviation: 'Ark. App.', fullName: 'Arkansas Appellate Reports', jurisdiction: 'Arkansas', court: 'Court of Appeals', citeType: 'state' },

  // Oklahoma
  { abbreviation: 'Okla.', fullName: 'Oklahoma Reports', jurisdiction: 'Oklahoma', court: 'Supreme Court', citeType: 'state' },

  // Nevada
  { abbreviation: 'Nev.', fullName: 'Nevada Reports', jurisdiction: 'Nevada', court: 'Supreme Court', citeType: 'state' },

  // New Mexico
  { abbreviation: 'N.M.', fullName: 'New Mexico Reports', jurisdiction: 'New Mexico', court: 'Supreme Court', citeType: 'state' },

  // Hawaii
  { abbreviation: 'Haw.', fullName: 'Hawaii Reports', jurisdiction: 'Hawaii', court: 'Supreme Court', citeType: 'state' },

  // Alaska
  { abbreviation: 'Alaska', fullName: 'Alaska Reports', jurisdiction: 'Alaska', court: 'Supreme Court', citeType: 'state' },

  // Idaho
  { abbreviation: 'Idaho', fullName: 'Idaho Reports', jurisdiction: 'Idaho', court: 'Supreme Court', citeType: 'state' },

  // Montana
  { abbreviation: 'Mont.', fullName: 'Montana Reports', jurisdiction: 'Montana', court: 'Supreme Court', citeType: 'state' },

  // Vermont
  { abbreviation: 'Vt.', fullName: 'Vermont Reports', jurisdiction: 'Vermont', court: 'Supreme Court', citeType: 'state' },

  // Wyoming
  { abbreviation: 'Wyo.', fullName: 'Wyoming Reports', jurisdiction: 'Wyoming', court: 'Supreme Court', citeType: 'state' },

  // Utah
  { abbreviation: 'Utah', fullName: 'Utah Reports', jurisdiction: 'Utah', court: 'Supreme Court', citeType: 'state' },
  { abbreviation: 'Utah 2d', fullName: 'Utah Reports, Second Series', jurisdiction: 'Utah', court: 'Supreme Court', citeType: 'state', series: 2 },

  // Maine
  { abbreviation: 'Me.', fullName: 'Maine Reports', jurisdiction: 'Maine', court: 'Supreme Judicial Court', citeType: 'state' },

  // Rhode Island
  { abbreviation: 'R.I.', fullName: 'Rhode Island Reports', jurisdiction: 'Rhode Island', court: 'Supreme Court', citeType: 'state' },

  // Delaware
  { abbreviation: 'Del.', fullName: 'Delaware Reports', jurisdiction: 'Delaware', court: 'Supreme Court', citeType: 'state' },
  { abbreviation: 'Del. Ch.', fullName: 'Delaware Chancery Reports', jurisdiction: 'Delaware', court: 'Court of Chancery', citeType: 'state' },

  // New Hampshire
  { abbreviation: 'N.H.', fullName: 'New Hampshire Reports', jurisdiction: 'New Hampshire', court: 'Supreme Court', citeType: 'state' },

  // West Virginia
  { abbreviation: 'W. Va.', fullName: 'West Virginia Reports', jurisdiction: 'West Virginia', court: 'Supreme Court of Appeals', citeType: 'state' },

  // North Dakota
  { abbreviation: 'N.D.', fullName: 'North Dakota Reports', jurisdiction: 'North Dakota', court: 'Supreme Court', citeType: 'state' },

  // South Dakota
  { abbreviation: 'S.D.', fullName: 'South Dakota Reports', jurisdiction: 'South Dakota', court: 'Supreme Court', citeType: 'state' },

  // Texas
  { abbreviation: 'Tex.', fullName: 'Texas Reports', jurisdiction: 'Texas', court: 'Supreme Court', citeType: 'state' },
  { abbreviation: 'Tex. App.', fullName: 'Texas Court of Appeals Reports', jurisdiction: 'Texas', court: 'Court of Appeals', citeType: 'state' },
  { abbreviation: 'Tex. Crim. App.', fullName: 'Texas Court of Criminal Appeals Reports', jurisdiction: 'Texas', court: 'Court of Criminal Appeals', citeType: 'state' },

  // Florida
  { abbreviation: 'Fla.', fullName: 'Florida Reports', jurisdiction: 'Florida', court: 'Supreme Court', citeType: 'state' },
  { abbreviation: 'Fla. L. Weekly', fullName: 'Florida Law Weekly', jurisdiction: 'Florida', court: 'various', citeType: 'state' },
];

export const ALL_EXTENDED_REPORTERS = [
  ...SPECIALTY_REPORTERS,
  ...NOMINATIVE_REPORTERS,
  ...VENDOR_NEUTRAL_REPORTERS,
  ...ADDITIONAL_STATE_REPORTERS,
];
