/**
 * Bluebook Table T1 — Reporter Abbreviations
 * Covers federal and major state reporters.
 */

export interface ReporterEntry {
  abbreviation: string;
  fullName: string;
  jurisdiction: string;
  court: string;
  courtAbbreviation?: string;
  series?: number;
  startYear?: number;
  endYear?: number;
  variations?: string[];
  citeType?: 'federal' | 'state' | 'regional' | 'specialty' | 'neutral';
  regexTemplate?: string;
  isNominative?: boolean;
}

// --- Federal Reporters ---

export const FEDERAL_REPORTERS: ReporterEntry[] = [
  // US Supreme Court
  { abbreviation: 'U.S.', fullName: 'United States Reports', jurisdiction: 'federal', court: 'Supreme Court' },
  { abbreviation: 'S. Ct.', fullName: 'Supreme Court Reporter', jurisdiction: 'federal', court: 'Supreme Court' },
  { abbreviation: 'L. Ed.', fullName: "Lawyers' Edition", jurisdiction: 'federal', court: 'Supreme Court' },
  { abbreviation: 'L. Ed. 2d', fullName: "Lawyers' Edition, Second Series", jurisdiction: 'federal', court: 'Supreme Court' },
  { abbreviation: 'U.S.L.W.', fullName: 'United States Law Week', jurisdiction: 'federal', court: 'Supreme Court' },

  // Federal Courts of Appeals
  { abbreviation: 'F.', fullName: 'Federal Reporter', jurisdiction: 'federal', court: 'Courts of Appeals', series: 1, startYear: 1880, endYear: 1924 },
  { abbreviation: 'F.2d', fullName: 'Federal Reporter, Second Series', jurisdiction: 'federal', court: 'Courts of Appeals', series: 2, startYear: 1924, endYear: 1993 },
  { abbreviation: 'F.3d', fullName: 'Federal Reporter, Third Series', jurisdiction: 'federal', court: 'Courts of Appeals', series: 3, startYear: 1993, endYear: 2021 },
  { abbreviation: 'F.4th', fullName: 'Federal Reporter, Fourth Series', jurisdiction: 'federal', court: 'Courts of Appeals', series: 4, startYear: 2021 },
  { abbreviation: 'F. App\'x', fullName: 'Federal Appendix', jurisdiction: 'federal', court: 'Courts of Appeals' },

  // Federal District Courts
  { abbreviation: 'F. Supp.', fullName: 'Federal Supplement', jurisdiction: 'federal', court: 'District Courts', series: 1, startYear: 1932, endYear: 1998 },
  { abbreviation: 'F. Supp. 2d', fullName: 'Federal Supplement, Second Series', jurisdiction: 'federal', court: 'District Courts', series: 2, startYear: 1998, endYear: 2014 },
  { abbreviation: 'F. Supp. 3d', fullName: 'Federal Supplement, Third Series', jurisdiction: 'federal', court: 'District Courts', series: 3, startYear: 2014 },

  // Federal Rules Decisions
  { abbreviation: 'F.R.D.', fullName: 'Federal Rules Decisions', jurisdiction: 'federal', court: 'District Courts' },

  // Bankruptcy
  { abbreviation: 'B.R.', fullName: 'Bankruptcy Reporter', jurisdiction: 'federal', court: 'Bankruptcy Courts' },

  // Federal Claims
  { abbreviation: 'Fed. Cl.', fullName: 'Federal Claims Reporter', jurisdiction: 'federal', court: 'Court of Federal Claims' },

  // Military
  { abbreviation: 'M.J.', fullName: 'Military Justice Reporter', jurisdiction: 'federal', court: 'Court of Appeals for the Armed Forces' },

  // Veterans
  { abbreviation: 'Vet. App.', fullName: 'Veterans Appeals Reporter', jurisdiction: 'federal', court: 'Court of Appeals for Veterans Claims' },
];

// --- Regional Reporters ---

export const REGIONAL_REPORTERS: ReporterEntry[] = [
  // Atlantic
  { abbreviation: 'A.', fullName: 'Atlantic Reporter', jurisdiction: 'regional', court: 'Atlantic', series: 1 },
  { abbreviation: 'A.2d', fullName: 'Atlantic Reporter, Second Series', jurisdiction: 'regional', court: 'Atlantic', series: 2 },
  { abbreviation: 'A.3d', fullName: 'Atlantic Reporter, Third Series', jurisdiction: 'regional', court: 'Atlantic', series: 3 },

  // North Eastern
  { abbreviation: 'N.E.', fullName: 'North Eastern Reporter', jurisdiction: 'regional', court: 'North Eastern', series: 1 },
  { abbreviation: 'N.E.2d', fullName: 'North Eastern Reporter, Second Series', jurisdiction: 'regional', court: 'North Eastern', series: 2 },
  { abbreviation: 'N.E.3d', fullName: 'North Eastern Reporter, Third Series', jurisdiction: 'regional', court: 'North Eastern', series: 3 },

  // North Western
  { abbreviation: 'N.W.', fullName: 'North Western Reporter', jurisdiction: 'regional', court: 'North Western', series: 1 },
  { abbreviation: 'N.W.2d', fullName: 'North Western Reporter, Second Series', jurisdiction: 'regional', court: 'North Western', series: 2 },

  // Pacific
  { abbreviation: 'P.', fullName: 'Pacific Reporter', jurisdiction: 'regional', court: 'Pacific', series: 1 },
  { abbreviation: 'P.2d', fullName: 'Pacific Reporter, Second Series', jurisdiction: 'regional', court: 'Pacific', series: 2 },
  { abbreviation: 'P.3d', fullName: 'Pacific Reporter, Third Series', jurisdiction: 'regional', court: 'Pacific', series: 3 },

  // South Eastern
  { abbreviation: 'S.E.', fullName: 'South Eastern Reporter', jurisdiction: 'regional', court: 'South Eastern', series: 1 },
  { abbreviation: 'S.E.2d', fullName: 'South Eastern Reporter, Second Series', jurisdiction: 'regional', court: 'South Eastern', series: 2 },

  // Southern
  { abbreviation: 'So.', fullName: 'Southern Reporter', jurisdiction: 'regional', court: 'Southern', series: 1 },
  { abbreviation: 'So. 2d', fullName: 'Southern Reporter, Second Series', jurisdiction: 'regional', court: 'Southern', series: 2 },
  { abbreviation: 'So. 3d', fullName: 'Southern Reporter, Third Series', jurisdiction: 'regional', court: 'Southern', series: 3 },

  // South Western
  { abbreviation: 'S.W.', fullName: 'South Western Reporter', jurisdiction: 'regional', court: 'South Western', series: 1 },
  { abbreviation: 'S.W.2d', fullName: 'South Western Reporter, Second Series', jurisdiction: 'regional', court: 'South Western', series: 2 },
  { abbreviation: 'S.W.3d', fullName: 'South Western Reporter, Third Series', jurisdiction: 'regional', court: 'South Western', series: 3 },
];

// --- Select State Reporters ---

export const STATE_REPORTERS: ReporterEntry[] = [
  // California
  { abbreviation: 'Cal.', fullName: 'California Reports', jurisdiction: 'California', court: 'Supreme Court' },
  { abbreviation: 'Cal. 2d', fullName: 'California Reports, Second Series', jurisdiction: 'California', court: 'Supreme Court' },
  { abbreviation: 'Cal. 3d', fullName: 'California Reports, Third Series', jurisdiction: 'California', court: 'Supreme Court' },
  { abbreviation: 'Cal. 4th', fullName: 'California Reports, Fourth Series', jurisdiction: 'California', court: 'Supreme Court' },
  { abbreviation: 'Cal. 5th', fullName: 'California Reports, Fifth Series', jurisdiction: 'California', court: 'Supreme Court' },
  { abbreviation: 'Cal. App.', fullName: 'California Appellate Reports', jurisdiction: 'California', court: 'Court of Appeal' },
  { abbreviation: 'Cal. App. 2d', fullName: 'California Appellate Reports, Second Series', jurisdiction: 'California', court: 'Court of Appeal' },
  { abbreviation: 'Cal. App. 3d', fullName: 'California Appellate Reports, Third Series', jurisdiction: 'California', court: 'Court of Appeal' },
  { abbreviation: 'Cal. App. 4th', fullName: 'California Appellate Reports, Fourth Series', jurisdiction: 'California', court: 'Court of Appeal' },
  { abbreviation: 'Cal. App. 5th', fullName: 'California Appellate Reports, Fifth Series', jurisdiction: 'California', court: 'Court of Appeal' },
  { abbreviation: 'Cal. Rptr.', fullName: 'California Reporter', jurisdiction: 'California', court: 'various' },
  { abbreviation: 'Cal. Rptr. 2d', fullName: 'California Reporter, Second Series', jurisdiction: 'California', court: 'various' },
  { abbreviation: 'Cal. Rptr. 3d', fullName: 'California Reporter, Third Series', jurisdiction: 'California', court: 'various' },

  // New York
  { abbreviation: 'N.Y.', fullName: 'New York Reports', jurisdiction: 'New York', court: 'Court of Appeals' },
  { abbreviation: 'N.Y.2d', fullName: 'New York Reports, Second Series', jurisdiction: 'New York', court: 'Court of Appeals' },
  { abbreviation: 'N.Y.3d', fullName: 'New York Reports, Third Series', jurisdiction: 'New York', court: 'Court of Appeals' },
  { abbreviation: 'A.D.', fullName: 'Appellate Division Reports', jurisdiction: 'New York', court: 'Appellate Division' },
  { abbreviation: 'A.D.2d', fullName: 'Appellate Division Reports, Second Series', jurisdiction: 'New York', court: 'Appellate Division' },
  { abbreviation: 'A.D.3d', fullName: 'Appellate Division Reports, Third Series', jurisdiction: 'New York', court: 'Appellate Division' },
  { abbreviation: 'N.Y.S.', fullName: 'New York Supplement', jurisdiction: 'New York', court: 'various' },
  { abbreviation: 'N.Y.S.2d', fullName: 'New York Supplement, Second Series', jurisdiction: 'New York', court: 'various' },
  { abbreviation: 'N.Y.S.3d', fullName: 'New York Supplement, Third Series', jurisdiction: 'New York', court: 'various' },

  // Illinois
  { abbreviation: 'Ill.', fullName: 'Illinois Reports', jurisdiction: 'Illinois', court: 'Supreme Court' },
  { abbreviation: 'Ill. 2d', fullName: 'Illinois Reports, Second Series', jurisdiction: 'Illinois', court: 'Supreme Court' },
  { abbreviation: 'Ill. App.', fullName: 'Illinois Appellate Court Reports', jurisdiction: 'Illinois', court: 'Appellate Court' },
  { abbreviation: 'Ill. App. 2d', fullName: 'Illinois Appellate Court Reports, Second Series', jurisdiction: 'Illinois', court: 'Appellate Court' },
  { abbreviation: 'Ill. App. 3d', fullName: 'Illinois Appellate Court Reports, Third Series', jurisdiction: 'Illinois', court: 'Appellate Court' },

  // Massachusetts
  { abbreviation: 'Mass.', fullName: 'Massachusetts Reports', jurisdiction: 'Massachusetts', court: 'Supreme Judicial Court' },
  { abbreviation: 'Mass. App. Ct.', fullName: 'Massachusetts Appeals Court Reports', jurisdiction: 'Massachusetts', court: 'Appeals Court' },

  // Connecticut
  { abbreviation: 'Conn.', fullName: 'Connecticut Reports', jurisdiction: 'Connecticut', court: 'Supreme Court' },
  { abbreviation: 'Conn. App.', fullName: 'Connecticut Appellate Reports', jurisdiction: 'Connecticut', court: 'Appellate Court' },

  // Pennsylvania
  { abbreviation: 'Pa.', fullName: 'Pennsylvania State Reports', jurisdiction: 'Pennsylvania', court: 'Supreme Court' },

  // Ohio
  { abbreviation: 'Ohio St.', fullName: 'Ohio State Reports', jurisdiction: 'Ohio', court: 'Supreme Court' },
  { abbreviation: 'Ohio St. 2d', fullName: 'Ohio State Reports, Second Series', jurisdiction: 'Ohio', court: 'Supreme Court' },
  { abbreviation: 'Ohio St. 3d', fullName: 'Ohio State Reports, Third Series', jurisdiction: 'Ohio', court: 'Supreme Court' },
  { abbreviation: 'Ohio App.', fullName: 'Ohio Appellate Reports', jurisdiction: 'Ohio', court: 'Court of Appeals' },
  { abbreviation: 'Ohio App. 2d', fullName: 'Ohio Appellate Reports, Second Series', jurisdiction: 'Ohio', court: 'Court of Appeals' },
  { abbreviation: 'Ohio App. 3d', fullName: 'Ohio Appellate Reports, Third Series', jurisdiction: 'Ohio', court: 'Court of Appeals' },
];

// --- All reporters combined for lookup ---

import { ALL_EXTENDED_REPORTERS } from './reporters-extended.js';

export const ALL_REPORTERS = [
  ...FEDERAL_REPORTERS,
  ...REGIONAL_REPORTERS,
  ...STATE_REPORTERS,
  ...ALL_EXTENDED_REPORTERS,
];

/** Set of all valid reporter abbreviations for quick lookup */
export const VALID_REPORTER_ABBREVIATIONS = new Set(
  ALL_REPORTERS.map(r => r.abbreviation)
);

/** Map from reporter abbreviation to entry */
export const REPORTER_MAP = new Map(
  ALL_REPORTERS.map(r => [r.abbreviation, r])
);

/**
 * Reporter variation map — maps common misspellings, spacing variations,
 * and alternative forms to their canonical abbreviation.
 * Ported from Free Law Project's reporters-db variations data.
 */
export const REPORTER_VARIATIONS: Map<string, string> = new Map([
  // United States Reports
  ['U. S.', 'U.S.'],
  ['US', 'U.S.'],
  ['U.S', 'U.S.'],

  // Supreme Court Reporter
  ['S.Ct.', 'S. Ct.'],
  ['S. Ct', 'S. Ct.'],
  ['SCt', 'S. Ct.'],

  // Lawyers' Edition
  ['L.Ed.', 'L. Ed.'],
  ['L. Ed', 'L. Ed.'],
  ['L.Ed.2d', 'L. Ed. 2d'],
  ['L. Ed.2d', 'L. Ed. 2d'],

  // Federal Reporter
  ['F', 'F.'],
  ['F 2d', 'F.2d'],
  ['F. 2d', 'F.2d'],
  ['F 3d', 'F.3d'],
  ['F. 3d', 'F.3d'],
  ['F 4th', 'F.4th'],
  ['F. 4th', 'F.4th'],

  // Federal Supplement
  ['F.Supp.', 'F. Supp.'],
  ['F Supp', 'F. Supp.'],
  ['F.Supp.2d', 'F. Supp. 2d'],
  ['F Supp 2d', 'F. Supp. 2d'],
  ['F.Supp.3d', 'F. Supp. 3d'],
  ['F Supp 3d', 'F. Supp. 3d'],

  // Atlantic
  ['A. 2d', 'A.2d'],
  ['A 2d', 'A.2d'],
  ['A. 3d', 'A.3d'],
  ['A 3d', 'A.3d'],

  // North Eastern
  ['N.E. 2d', 'N.E.2d'],
  ['NE2d', 'N.E.2d'],
  ['N.E. 3d', 'N.E.3d'],
  ['NE3d', 'N.E.3d'],

  // North Western
  ['N.W. 2d', 'N.W.2d'],
  ['NW2d', 'N.W.2d'],

  // Pacific
  ['P. 2d', 'P.2d'],
  ['P 2d', 'P.2d'],
  ['P. 3d', 'P.3d'],
  ['P 3d', 'P.3d'],

  // South Eastern
  ['S.E. 2d', 'S.E.2d'],
  ['SE2d', 'S.E.2d'],

  // Southern
  ['So.2d', 'So. 2d'],
  ['So.3d', 'So. 3d'],

  // South Western
  ['S.W. 2d', 'S.W.2d'],
  ['SW2d', 'S.W.2d'],
  ['S.W. 3d', 'S.W.3d'],
  ['SW3d', 'S.W.3d'],

  // California
  ['Cal.2d', 'Cal. 2d'],
  ['Cal.3d', 'Cal. 3d'],
  ['Cal.4th', 'Cal. 4th'],
  ['Cal.5th', 'Cal. 5th'],
  ['Cal.App.', 'Cal. App.'],
  ['Cal.App.2d', 'Cal. App. 2d'],
  ['Cal.App.3d', 'Cal. App. 3d'],
  ['Cal.App.4th', 'Cal. App. 4th'],
  ['Cal.App.5th', 'Cal. App. 5th'],
  ['Cal.Rptr.', 'Cal. Rptr.'],
  ['Cal.Rptr.2d', 'Cal. Rptr. 2d'],
  ['Cal.Rptr.3d', 'Cal. Rptr. 3d'],

  // New York
  ['NY', 'N.Y.'],
  ['NY2d', 'N.Y.2d'],
  ['NY3d', 'N.Y.3d'],
  ['NYS', 'N.Y.S.'],
  ['NYS2d', 'N.Y.S.2d'],
  ['NYS3d', 'N.Y.S.3d'],
  ['AD', 'A.D.'],
  ['AD2d', 'A.D.2d'],
  ['AD3d', 'A.D.3d'],

  // Illinois
  ['Ill.2d', 'Ill. 2d'],
  ['Ill.App.', 'Ill. App.'],
  ['Ill.App.2d', 'Ill. App. 2d'],
  ['Ill.App.3d', 'Ill. App. 3d'],

  // Ohio
  ['Ohio St.2d', 'Ohio St. 2d'],
  ['Ohio St.3d', 'Ohio St. 3d'],
  ['Ohio App.2d', 'Ohio App. 2d'],
  ['Ohio App.3d', 'Ohio App. 3d'],

  // Bankruptcy
  ['BR', 'B.R.'],
  ['B.R', 'B.R.'],

  // Federal Rules Decisions
  ['FRD', 'F.R.D.'],
  ['F.R.D', 'F.R.D.'],

  // Military
  ['MJ', 'M.J.'],
  ['M.J', 'M.J.'],

  // Federal Appendix
  ["F.App'x", "F. App'x"],
  ['F. Appx', "F. App'x"],
  ["F.Appx", "F. App'x"],
]);

/**
 * Reporters that imply Supreme Court (no court designation needed)
 */
export const SCOTUS_REPORTERS = new Set(['U.S.', 'S. Ct.', 'L. Ed.', 'L. Ed. 2d']);

/**
 * Federal circuit court abbreviations
 */
export const FEDERAL_CIRCUITS = [
  '1st Cir.', '2d Cir.', '3d Cir.', '4th Cir.', '5th Cir.',
  '6th Cir.', '7th Cir.', '8th Cir.', '9th Cir.', '10th Cir.',
  '11th Cir.', 'D.C. Cir.', 'Fed. Cir.',
];

/**
 * Federal district court patterns
 */
export const FEDERAL_DISTRICT_PATTERN = /^[NSEW]\.?D\.?\s*[A-Z][a-z]+\.?$|^D\.\s*[A-Z][a-z]+\.?$|^[A-Z]\.[A-Z]\.[A-Z]\.[A-Z]\.?$/;
