/**
 * T13 — Institutional Names in Periodical Titles
 * Common institutional names found in periodical titles.
 *
 * KEY RULES:
 * - Abbreviate "University" as "U."
 * - Omit "a," "at," "in," "of," and "the" (but retain "on")
 * - If title is one word after omitting articles, do NOT abbreviate
 * - Omit commas from periodical title abbreviations
 * - For titles with colons, omit words after colon
 * - For online supplements, append supplement name
 */
export const T13_PERIODICALS: Record<string, string> = {
  'Air Force': 'A.F.',
  'Albany': 'Alb.',
  'American Intellectual Property Law Association': 'AIPLA',
  'American Medical Association': 'AMA',
  'Journal of the American Medical Association': 'JAMA',
  'American Society of Composers, Authors & Publishers': 'ASCAP',
  'Boston College': 'B.C.',
  'Boston University': 'B.U.',
  'Brigham Young University': 'BYU',
  'Brooklyn': 'Brook.',
  'Buffalo': 'Buff.',
  'California': 'Calif.',
  'Capital': 'Cap.',
  'Chapman': 'Chap.',
  'Chartered Life Underwriters': 'C.L.U.',
  'Cincinnati': 'Cin.',
  'City University of New York': 'CUNY',
  'Cleveland': 'Clev.',
  'Columbia': 'Colum.',
  'Cornell': 'Corn.',
  'Cumberland': 'Cumb.',
  'Detroit': 'Det.',
  'Dickinson': 'Dick.',
  'Duquesne': 'Duq.',
  'Florida International University': 'FIU',
  'George Mason': 'Geo. Mason',
  'George Washington': 'Geo. Wash.',
  'Georgetown': 'Geo.',
  'Gonzaga': 'Gonz.',
  'Harvard': 'Harv.',
  'Howard': 'How.',
  'John Marshall': 'J. Marshall',
  'Judge Advocate General': 'JAG',
  'Lawyers Reports Annotated': 'L.R.A.',
  'Loyola': 'Loy.',
  'Marquette': 'Marq.',
  'Memphis': 'Mem.',
  'New England': 'New Eng.',
  'New England Journal of Medicine': 'NEJM',
  'New York University': 'N.Y.U.',
  'Penn State': 'Penn. St.',
  'Pepperdine': 'Pepp.',
  'Pittsburgh': 'Pitt.',
  'Proceedings of the National Academy of Sciences': 'PNAS',
  'Richmond': 'Rich.',
  'Saint Louis': 'St. Louis',
  'Southern Methodist University': 'SMU',
  'Stanford': 'Stan.',
  'State': 'St.',
  'Temple': 'Temp.',
  'Thomas Jefferson': 'T. Jefferson',
  'Thurgood Marshall': 'T. Marshall',
  'Toledo': 'Tol.',
  'Tulane': 'Tul.',
  'Universidad de Puerto Rico': 'U.P.R.',
  'University of California': 'U.C.',
  'University of California, Los Angeles': 'UCLA',
  'University of Missouri-Kansas City': 'UMKC',
  'University of West Los Angeles': 'UWLA',
  'Vanderbilt': 'Vand.',
  'Villanova': 'Vill.',
  'Washington & Lee': 'Wash. & Lee',
  'William & Mary': 'Wm. & Mary',
  'William Mitchell': 'Wm. Mitchell',
};

/** Words to omit from periodical titles */
export const PERIODICAL_OMIT_WORDS = new Set(['a', 'at', 'in', 'of', 'the']);
