import { v4 as uuid } from 'uuid';
import type { ValidationIssue, NewspaperComponents } from '@legalcitation/shared';
import { T12_MONTHS, UNABBREVIATED_MONTHS, T6_ABBREVIATIONS } from '@legalcitation/shared';

/**
 * Bluebook B16 + R. 16.6 — Newspapers (Print and Online).
 * Validates newspaper article citation formatting per the 22nd Edition.
 *
 * Supports both 'law_review' (academic) and 'court_doc' (practitioner) styles.
 *
 * Print format:
 *   Author, Title, Newspaper, Date, at Page.
 *   Example: Adam Liptak, Title, N.Y. Times, Jan. 1, 2024, at A1.
 *
 * Online format (R. 16.6(f)):
 *   Author, Title, Newspaper (Date), URL [perma URL].
 *
 * Short form:
 *   Author, supra note X.
 */

type DocumentStyle = 'law_review' | 'court_doc';

/**
 * Common newspaper name abbreviations per T6/T10/T13.
 * Includes leading "The" removal and standard geographic/institutional abbreviations.
 */
export const NEWSPAPER_ABBREVIATIONS: Record<string, string> = {
  'The New York Times': 'N.Y. Times',
  'New York Times': 'N.Y. Times',
  'The Wall Street Journal': 'Wall St. J.',
  'Wall Street Journal': 'Wall St. J.',
  'The Washington Post': 'Wash. Post',
  'Washington Post': 'Wash. Post',
  'The Los Angeles Times': 'L.A. Times',
  'Los Angeles Times': 'L.A. Times',
  'The Chicago Tribune': 'Chi. Trib.',
  'Chicago Tribune': 'Chi. Trib.',
  'The Boston Globe': 'Bos. Globe',
  'Boston Globe': 'Bos. Globe',
  'The San Francisco Chronicle': 'S.F. Chron.',
  'San Francisco Chronicle': 'S.F. Chron.',
  'The Seattle Times': 'Seattle Times',
  'The Daily Telegraph': 'Daily Tel.',
  'The Guardian': 'Guardian',
  'The Financial Times': 'Fin. Times',
  'Financial Times': 'Fin. Times',
  'The Dallas Morning News': 'Dallas Morning News',
  'The Atlanta Journal-Constitution': 'Atlanta J.-Const.',
  'The Miami Herald': 'Miami Herald',
  'The Philadelphia Inquirer': 'Phila. Inquirer',
  'Philadelphia Inquirer': 'Phila. Inquirer',
  'The Houston Chronicle': 'Hous. Chron.',
  'Houston Chronicle': 'Hous. Chron.',
  'The Denver Post': 'Denver Post',
  'The Arizona Republic': 'Ariz. Republic',
  'USA Today': 'USA Today',
  'The Times': 'Times',
  'The Economist': 'Economist',
  'The Christian Science Monitor': 'Christian Sci. Monitor',
};

const VALID_DESIGNATIONS = new Set([
  'Editorial',
  'Opinion',
  'Letter to the Editor',
]);

export function validateNewspaper(
  components: NewspaperComponents,
  rawText?: string,
  style: DocumentStyle = 'law_review'
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  checkAuthorByline(components, issues);
  checkTitle(components, rawText, issues);
  checkNewspaperNameAbbreviation(components, rawText, issues);
  checkDateFormat(components, issues);
  checkPage(components, issues);
  checkDesignation(components, rawText, issues);
  checkSection(components, rawText, issues);
  checkOnlineFormat(components, rawText, issues);
  checkPlaceOfPublication(components, rawText, issues);
  checkWireService(components, issues);

  return issues;
}

/**
 * R. 16.6(a): Author by byline if available.
 * Citations to signed articles include the author's full name.
 * Citations to unsigned pieces begin with the title.
 */
function checkAuthorByline(
  components: NewspaperComponents,
  issues: ValidationIssue[]
): void {
  if (!components.author) return;

  const author = components.author.trim();

  if (/^[A-Z\s]+$/.test(author) && author.length > 3) {
    issues.push({
      id: uuid(),
      rule: 'R. 16.6(a)',
      source: 'Bluebook',
      severity: 'error',
      message: `Author "${author}" appears to be in ALL CAPITALS. Use standard capitalization.`,
      suggestion: 'Use standard capitalization for author names (e.g., "Ari L. Goldman").',
    });
  }

  if (/^[A-Z][a-z]*$/.test(author)) {
    issues.push({
      id: uuid(),
      rule: 'R. 16.6(a)',
      source: 'Bluebook',
      severity: 'warning',
      message: `Author "${author}" appears to be a single name. Use full name format.`,
      suggestion: 'Authors should appear as "First Last" (e.g., "Ari L. Goldman").',
    });
  }
}

/**
 * R. 16.6: Article title in italics.
 */
function checkTitle(
  components: NewspaperComponents,
  rawText: string | undefined,
  issues: ValidationIssue[]
): void {
  if (!components.title || components.title.trim().length === 0) {
    issues.push({
      id: uuid(),
      rule: 'R. 16.6',
      source: 'Bluebook',
      severity: 'error',
      message: 'Newspaper citation must include an article title.',
      suggestion: 'Add the article title in italics.',
    });
    return;
  }

  if (rawText) {
    const title = components.title.trim();
    const isItalicized = rawText.includes(`*${title}*`) || rawText.includes(`_${title}_`);
    if (!isItalicized && rawText.includes(title)) {
      issues.push({
        id: uuid(),
        rule: 'R. 16.6',
        source: 'Bluebook',
        severity: 'warning',
        message: 'Newspaper article title should be italicized.',
        suggestion: `Italicize the title: *${title}*`,
      });
    }
  }
}

/**
 * R. 16.6: Newspaper name abbreviation.
 * Drop initial "The". Abbreviate per T6/T10.
 * Validate against known abbreviations.
 */
function checkNewspaperNameAbbreviation(
  components: NewspaperComponents,
  rawText: string | undefined,
  issues: ValidationIssue[]
): void {
  if (!components.newspaperName || components.newspaperName.trim().length === 0) {
    issues.push({
      id: uuid(),
      rule: 'R. 16.6',
      source: 'Bluebook',
      severity: 'error',
      message: 'Newspaper citation must include the newspaper name.',
      suggestion: 'Add the newspaper name, abbreviated per T6 and T10 (e.g., "N.Y. Times").',
    });
    return;
  }

  const name = components.newspaperName.trim();

  // Check if name starts with "The" — it should be dropped
  if (/^The\s+/i.test(name)) {
    issues.push({
      id: uuid(),
      rule: 'R. 16.6',
      source: 'Bluebook',
      severity: 'error',
      message: `Newspaper name "${name}" should not begin with "The".`,
      suggestion: `Drop the leading "The": "${name.replace(/^The\s+/i, '')}".`,
    });
  }

  // Check against known full names that should be abbreviated
  const knownAbbrev = NEWSPAPER_ABBREVIATIONS[name];
  if (knownAbbrev && knownAbbrev !== name) {
    issues.push({
      id: uuid(),
      rule: 'R. 16.6',
      source: 'Bluebook',
      severity: 'error',
      message: `Newspaper name "${name}" should be abbreviated.`,
      suggestion: `Use "${knownAbbrev}" instead of "${name}".`,
    });
    return;
  }

  // Check if individual words could be abbreviated per T6
  checkWordAbbreviations(name, issues);
}

/**
 * R. 16.6: Full date required using T12 month abbreviations.
 * Newspapers do not use volume numbers — they use full dates.
 */
function checkDateFormat(
  components: NewspaperComponents,
  issues: ValidationIssue[]
): void {
  if (!components.date || components.date.trim().length === 0) {
    issues.push({
      id: uuid(),
      rule: 'R. 16.6',
      source: 'Bluebook',
      severity: 'error',
      message: 'Newspaper citation must include a full date.',
      suggestion: 'Add the full date using T12 abbreviations (e.g., "Jan. 1, 2024").',
    });
    return;
  }

  validateMonthAbbreviation(components.date, 'R. 16.6', issues);

  // Check that the date includes a year
  if (!/\d{4}/.test(components.date)) {
    issues.push({
      id: uuid(),
      rule: 'R. 16.6',
      source: 'Bluebook',
      severity: 'warning',
      message: 'Newspaper date should include a four-digit year.',
      suggestion: 'Include the year in the date (e.g., "Oct. 29, 2014").',
    });
  }
}

/**
 * R. 16.6(a): "at" page notation for print editions.
 * Give only the first page of the piece.
 * Do not indicate the location of specific material.
 */
function checkPage(
  components: NewspaperComponents,
  issues: ValidationIssue[]
): void {
  if (components.onlineOnly) return;

  if (!components.page && !components.url) {
    issues.push({
      id: uuid(),
      rule: 'R. 16.6(a)',
      source: 'Bluebook',
      severity: 'warning',
      message: 'Print newspaper citation should include a page reference (e.g., "at A1").',
      suggestion: 'Add the page preceded by "at" (e.g., "at A1").',
    });
  }

  if (components.page) {
    // Check for page range — R. 16.6(a)(iii) says give only the first page
    if (/[-–]\d/.test(components.page)) {
      issues.push({
        id: uuid(),
        rule: 'R. 16.6(a)',
        source: 'Bluebook',
        severity: 'warning',
        message: 'Give only the first page of the newspaper article, not a page range.',
        suggestion: `Use only the first page number from "${components.page}".`,
      });
    }
  }
}

/**
 * R. 16.6(a)(i): Designation — Editorial, Opinion, Letter to the Editor.
 * When appropriate, designate the work in ordinary roman type after the
 * author's name but before the title, or at the beginning if no author.
 */
function checkDesignation(
  components: NewspaperComponents,
  rawText: string | undefined,
  issues: ValidationIssue[]
): void {
  if (!components.designation) return;

  if (!VALID_DESIGNATIONS.has(components.designation)) {
    issues.push({
      id: uuid(),
      rule: 'R. 16.6(a)',
      source: 'Bluebook',
      severity: 'warning',
      message: `"${components.designation}" is not a standard newspaper designation.`,
      suggestion: 'Valid designations: "Editorial", "Opinion", "Letter to the Editor".',
    });
  }

  // Designation should be in roman type (not italicized)
  if (rawText && components.designation) {
    const designation = components.designation;
    if (rawText.includes(`*${designation}*`) || rawText.includes(`_${designation}_`)) {
      issues.push({
        id: uuid(),
        rule: 'R. 16.6(a)',
        source: 'Bluebook',
        severity: 'error',
        message: `Designation "${designation}" should be in ordinary roman type, not italics.`,
        suggestion: `Remove italic formatting from "${designation}".`,
      });
    }
  }
}

/**
 * R. 16.6(a)(ii): Section designation in parentheses if needed.
 * After the date, give the section designation in a parenthetical
 * if necessary to identify the page unambiguously.
 */
function checkSection(
  components: NewspaperComponents,
  rawText: string | undefined,
  issues: ValidationIssue[]
): void {
  if (!components.section) return;

  if (rawText) {
    const sectionPattern = new RegExp(`\\(§\\s*${escapeRegex(components.section)}\\)`);
    const altPattern = new RegExp(`\\(${escapeRegex(components.section)}\\)`);
    if (!sectionPattern.test(rawText) && !altPattern.test(rawText)) {
      issues.push({
        id: uuid(),
        rule: 'R. 16.6(a)',
        source: 'Bluebook',
        severity: 'warning',
        message: 'Section designation should appear in parentheses after the date.',
        suggestion: `Format as: (§ ${components.section}).`,
      });
    }
  }
}

/**
 * R. 16.6(f): Online newspaper articles.
 * Cite to the online source directly per R. 18.2.2.
 * URL and archive are required for online-only articles.
 */
function checkOnlineFormat(
  components: NewspaperComponents,
  rawText: string | undefined,
  issues: ValidationIssue[]
): void {
  if (!components.onlineOnly && !components.url) return;

  if (components.onlineOnly || components.url) {
    if (!components.url) {
      issues.push({
        id: uuid(),
        rule: 'R. 16.6(f)',
        source: 'Bluebook',
        severity: 'error',
        message: 'Online newspaper article must include a URL.',
        suggestion: 'Add the URL to the online article per R. 18.2.2.',
      });
    }

    // Online articles need archival per R. 18.2.1(d)
    if (components.url) {
      const hasArchive = !!components.archiveUrl;
      const hasOnFileWith = rawText ? /\(on file with\s+[^)]+\)/i.test(rawText) : false;
      if (!hasArchive && !hasOnFileWith) {
        issues.push({
          id: uuid(),
          rule: 'R. 18.2.1(d)',
          source: 'Bluebook',
          severity: 'error',
          message: 'Online newspaper article must include an archive URL or "(on file with)" per R. 18.2.1(d).',
          suggestion: 'Add a perma.cc archive URL in brackets or "(on file with [journal name])".',
        });
      }
    }

    // Online format uses parenthetical date, not comma-separated
    if (rawText && components.url && components.date) {
      const dateInParens = new RegExp(`\\(${escapeRegex(components.date)}\\)`);
      if (!dateInParens.test(rawText)) {
        issues.push({
          id: uuid(),
          rule: 'R. 16.6(f)',
          source: 'Bluebook',
          severity: 'suggestion',
          message: 'For online newspaper articles, the date should appear in parentheses before the URL.',
          suggestion: `Format as: Newspaper (${components.date}), URL.`,
        });
      }
    }
  }
}

/**
 * R. 16.6(b): Place of publication.
 * Include place of publication in parentheses after the newspaper name
 * if not clear from the name itself.
 */
function checkPlaceOfPublication(
  components: NewspaperComponents,
  rawText: string | undefined,
  issues: ValidationIssue[]
): void {
  if (!components.placeOfPublication) return;

  if (rawText) {
    const place = components.placeOfPublication;
    const placeInParens = new RegExp(`\\(${escapeRegex(place)}\\)`);
    if (!placeInParens.test(rawText)) {
      issues.push({
        id: uuid(),
        rule: 'R. 16.6(b)',
        source: 'Bluebook',
        severity: 'warning',
        message: 'Place of publication should appear in parentheses after the newspaper name.',
        suggestion: `Format as: Newspaper (${place}).`,
      });
    }
  }
}

/**
 * R. 16.6(d): Wire service articles.
 * Include wire service name (in small caps) only if citing the service itself.
 */
function checkWireService(
  components: NewspaperComponents,
  issues: ValidationIssue[]
): void {
  if (!components.wireService) return;

  if (!components.url && !components.page) {
    issues.push({
      id: uuid(),
      rule: 'R. 16.6(d)',
      source: 'Bluebook',
      severity: 'warning',
      message: 'Wire service articles should be cited to a print newspaper, electronic database, or webpage.',
      suggestion: 'Cite the article to the newspaper where it was published, or provide a URL.',
    });
  }
}

/**
 * Check if individual words in the newspaper name could be abbreviated per T6.
 */
function checkWordAbbreviations(name: string, issues: ValidationIssue[]): void {
  const words = name.split(/\s+/);
  for (const word of words) {
    const abbrev = T6_ABBREVIATIONS[word];
    if (abbrev && word !== abbrev && word.length > 3) {
      issues.push({
        id: uuid(),
        rule: 'R. 16.6',
        source: 'Bluebook',
        severity: 'suggestion',
        message: `"${word}" in the newspaper name may need abbreviation per T6.`,
        suggestion: `Abbreviate "${word}" as "${abbrev}".`,
      });
      break;
    }
  }
}

function validateMonthAbbreviation(dateStr: string, rule: string, issues: ValidationIssue[]): void {
  const fullMonths = Object.keys(T12_MONTHS);
  for (const month of fullMonths) {
    if (UNABBREVIATED_MONTHS.has(month)) continue;
    const abbrev = T12_MONTHS[month];
    if (dateStr.includes(month) && !dateStr.includes(abbrev)) {
      issues.push({
        id: uuid(),
        rule,
        source: 'Bluebook',
        severity: 'error',
        message: `Month "${month}" should be abbreviated as "${abbrev}" per T12.`,
        suggestion: `Use "${abbrev}" instead of "${month}".`,
      });
      break;
    }
  }
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
