import { v4 as uuid } from 'uuid';
import type { ValidationIssue, InternetComponents } from '@legalcitation/shared';
import { T12_MONTHS, UNABBREVIATED_MONTHS, T6_ABBREVIATIONS } from '@legalcitation/shared';

/**
 * Bluebook B18 + R. 18.2 — Internet Sources (Web Pages, Blog Posts, Online-Only Content).
 * Validates website/internet citation formatting per the 22nd Edition.
 *
 * Supports both 'law_review' (academic) and 'court_doc' (practitioner) styles.
 *
 * Full citation format:
 *   Author, Title, Website Name (date), URL [perma URL].
 *
 * Short form (B18.2):
 *   Author, supra note X.
 */

type DocumentStyle = 'law_review' | 'court_doc';

export function validateWebsite(
  components: InternetComponents,
  rawText?: string,
  style: DocumentStyle = 'law_review'
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  checkAuthorFormat(components, rawText, issues);
  checkTitlePresence(components, rawText, issues);
  checkWebsiteName(components, rawText, style, issues);
  checkDateFormat(components, rawText, issues);
  checkUrlFormat(components, issues);
  checkArchiveRequirement(components, rawText, issues);
  checkLastVisited(components, rawText, issues);
  checkTimestamp(components, issues);
  checkSubdivision(components, rawText, issues);

  return issues;
}

/**
 * R. 18.2.2(a): Author name, if available, in ordinary roman type.
 * When no author is clearly announced, omit author information unless
 * there is a clear institutional owner of the domain.
 * Institutional authors should be abbreviated per R. 15.1(e) / T6.
 */
function checkAuthorFormat(
  components: InternetComponents,
  rawText: string | undefined,
  issues: ValidationIssue[]
): void {
  if (!components.author) return;

  const author = components.author.trim();

  if (/^[A-Z\s]+$/.test(author) && author.length > 3) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.2.2(a)',
      source: 'Bluebook',
      severity: 'error',
      message: `Author "${author}" appears to be in ALL CAPITALS. Use standard capitalization.`,
      suggestion: 'Use standard capitalization for author names (e.g., "David Lat").',
    });
  }

  // Check if institutional author could be abbreviated per T6
  for (const [full, abbrev] of Object.entries(T6_ABBREVIATIONS)) {
    if (author.includes(full) && !author.includes(abbrev)) {
      issues.push({
        id: uuid(),
        rule: 'R. 18.2.2(a)',
        source: 'Bluebook',
        severity: 'suggestion',
        message: `Institutional author may need abbreviation: "${full}" → "${abbrev}" per T6.`,
        suggestion: `Abbreviate "${full}" as "${abbrev}" per R. 15.1(e).`,
      });
      break;
    }
  }
}

/**
 * R. 18.2.2(b): Webpage or web-object titles.
 * Titles should sufficiently identify the page but not be unwieldy.
 * Titles are italicized in citations; descriptive titles are not italicized.
 */
function checkTitlePresence(
  components: InternetComponents,
  rawText: string | undefined,
  issues: ValidationIssue[]
): void {
  if (!components.title || components.title.trim().length === 0) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.2.2(b)',
      source: 'Bluebook',
      severity: 'error',
      message: 'Website citation must include a title identifying the page.',
      suggestion: 'Add the page title from the browser title bar or a clearly announced heading.',
    });
    return;
  }

  if (rawText) {
    const title = components.title.trim();
    const isItalicized = rawText.includes(`*${title}*`) || rawText.includes(`_${title}_`);
    if (!isItalicized && rawText.includes(title)) {
      issues.push({
        id: uuid(),
        rule: 'R. 18.2.2(b)',
        source: 'Bluebook',
        severity: 'warning',
        message: 'Website page title should be italicized.',
        suggestion: `Italicize the title: *${title}*`,
      });
    }
  }
}

/**
 * R. 18.2.2(b)(i): Main page title.
 * The citation should always include the homepage or domain name.
 * In law review style, the website name uses SMALL CAPS.
 * In court doc style, the website name is in ordinary roman type.
 * Main page titles should be abbreviated per T6, T10, T13.
 */
function checkWebsiteName(
  components: InternetComponents,
  rawText: string | undefined,
  style: DocumentStyle,
  issues: ValidationIssue[]
): void {
  if (!components.websiteName || components.websiteName.trim().length === 0) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.2.2(b)(i)',
      source: 'Bluebook',
      severity: 'error',
      message: 'Website citation must include the main page title (website name).',
      suggestion: 'Add the website name (e.g., "SCOTUSblog", "N.Y. Times").',
    });
    return;
  }

  if (style === 'law_review' && rawText) {
    const name = components.websiteName.trim();
    // In academic citations, website name should be in SMALL CAPS (not all caps)
    if (/^[A-Z\s.&]+$/.test(name) && name.length > 5) {
      const hasLowercaseLetters = /[a-z]/.test(name);
      if (!hasLowercaseLetters) {
        issues.push({
          id: uuid(),
          rule: 'R. 18.2.2(b)(i)',
          source: 'Bluebook',
          severity: 'warning',
          message: `Website name "${name}" appears to be in ALL CAPITALS. Use large and small caps for academic citations.`,
          suggestion: 'Format the website name in large and small caps, not all capitals.',
        });
      }
    }
  }
}

/**
 * R. 18.2.2(c): Date and time.
 * The date should be provided as it appears on the internet site.
 * Use only dates that refer clearly to the material cited.
 * If updated/corrected on a different date, use that date instead.
 * Timestamps should use 24-hour clock format with time zone.
 */
function checkDateFormat(
  components: InternetComponents,
  rawText: string | undefined,
  issues: ValidationIssue[]
): void {
  const hasDate = !!components.date;
  const hasLastVisited = !!components.lastVisited;

  if (!hasDate && !hasLastVisited) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.2.2(c)',
      source: 'Bluebook',
      severity: 'warning',
      message: 'Website citation should include a publication date or a "last visited" date.',
      suggestion: 'Add a publication date (e.g., "Jan. 15, 2024") or "(last visited Mar. 1, 2024)".',
    });
    return;
  }

  if (hasDate) {
    validateMonthAbbreviation(components.date!, 'R. 18.2.2(c)', issues);
  }

  if (hasLastVisited) {
    validateMonthAbbreviation(components.lastVisited!, 'R. 18.2.2(c)', issues);
  }
}

/**
 * R. 18.2.2(d): The URL.
 * URL should point directly to the cited source.
 * Prefer shortlinks that clearly identify the source.
 * If URL is long/unwieldy, root URL with navigational parenthetical is acceptable.
 */
function checkUrlFormat(
  components: InternetComponents,
  issues: ValidationIssue[]
): void {
  if (!components.url) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.2.2(d)',
      source: 'Bluebook',
      severity: 'error',
      message: 'Website citation must include a URL.',
      suggestion: 'Add the direct URL to the cited content.',
    });
    return;
  }

  if (components.url.startsWith('http://')) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.2.2(d)',
      source: 'Bluebook',
      severity: 'suggestion',
      message: 'URL uses HTTP instead of HTTPS. Prefer HTTPS when available.',
      suggestion: 'Use the HTTPS version of the URL if available.',
    });
  }

  // Warn if URL is a homepage rather than a direct link
  const urlPath = components.url.replace(/^https?:\/\//, '').replace(/^www\./, '');
  if (/^[^/]+\/?$/.test(urlPath)) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.2.2(d)',
      source: 'Bluebook',
      severity: 'warning',
      message: 'URL appears to be a homepage rather than a link to the specific cited content.',
      suggestion: 'Use a URL that links directly to the cited material per R. 18.2.2(d).',
    });
  }

  // Warn about bit.ly and other opaque shortlinks
  const hostname = extractHostname(components.url);
  const opaqueShorteners = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly'];
  if (hostname && opaqueShorteners.includes(hostname)) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.2.2(d)',
      source: 'Bluebook',
      severity: 'warning',
      message: `Opaque URL shortener "${hostname}" does not clearly indicate the source.`,
      suggestion: 'Use the full URL or a shortlink that identifies the source (e.g., wapo.st, imdb.to).',
    });
  }
}

/**
 * R. 18.2.1(d): Archival.
 * ALL online content cited must be captured and stored permanently.
 * Archive via perma.cc (append in brackets) or save on file.
 * This is MANDATORY in the 22nd Edition.
 */
function checkArchiveRequirement(
  components: InternetComponents,
  rawText: string | undefined,
  issues: ValidationIssue[]
): void {
  const hasArchive = !!components.archiveUrl;
  const hasOnFileWith = rawText ? /\(on file with\s+[^)]+\)/i.test(rawText) : false;

  if (!hasArchive && !hasOnFileWith) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.2.1(d)',
      source: 'Bluebook',
      severity: 'error',
      message: 'Online sources must include a permanent archive link (e.g., https://perma.cc/XXXX-XXXX) or state "(on file with [journal])" per R. 18.2.1(d). This is required by the 22nd Edition.',
      suggestion: 'Add a perma.cc archive URL in brackets after the main URL, or add "(on file with [journal name])".',
    });
  }

  if (components.archiveUrl) {
    if (!/^https?:\/\/(?:perma\.cc|web\.archive\.org|dx\.doi\.org)\//.test(components.archiveUrl)) {
      issues.push({
        id: uuid(),
        rule: 'R. 18.2.1(d)',
        source: 'Bluebook',
        severity: 'suggestion',
        message: 'Archive URL should typically be from perma.cc, web.archive.org, or dx.doi.org.',
        suggestion: 'Use https://perma.cc/ to create a permanent archive of the cited page.',
      });
    }

    if (rawText && !rawText.includes(`[${components.archiveUrl}]`) && !rawText.includes(`[${components.archiveUrl}`)) {
      issues.push({
        id: uuid(),
        rule: 'R. 18.2.1(d)',
        source: 'Bluebook',
        severity: 'warning',
        message: 'Archive URL should be enclosed in brackets.',
        suggestion: `Format as: [${components.archiveUrl}].`,
      });
    }
  }
}

/**
 * R. 18.2.2(c): "Last visited" date.
 * When material is otherwise undated, the date the website was last visited
 * should be placed in a parenthetical after the URL.
 */
function checkLastVisited(
  components: InternetComponents,
  rawText: string | undefined,
  issues: ValidationIssue[]
): void {
  if (components.date) return;

  if (!components.lastVisited) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.2.2(c)',
      source: 'Bluebook',
      severity: 'error',
      message: 'When no publication date is available, a "last visited" date is required.',
      suggestion: 'Add "(last visited [date])" after the URL (e.g., "(last visited Mar. 1, 2024)").',
    });
    return;
  }

  if (rawText && !/\(last visited\s+/i.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.2.2(c)',
      source: 'Bluebook',
      severity: 'warning',
      message: '"Last visited" date should appear in a parenthetical: "(last visited [date])".',
      suggestion: 'Format as: (last visited Mar. 1, 2024).',
    });
  }
}

/**
 * R. 18.2.2(c): Timestamps.
 * Timestamps should use 24-hour clock formatting with a time zone designation.
 * The time zone is determined by the source; if none, use the device's time zone.
 */
function checkTimestamp(
  components: InternetComponents,
  issues: ValidationIssue[]
): void {
  if (!components.timestamp) return;

  // Validate 24-hour clock format (e.g., "15:31")
  if (!/^\d{1,2}:\d{2}$/.test(components.timestamp.trim())) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.2.2(c)',
      source: 'Bluebook',
      severity: 'warning',
      message: `Timestamp "${components.timestamp}" should use 24-hour clock format.`,
      suggestion: 'Format timestamp as HH:MM (e.g., "15:31").',
    });
  }

  if (!components.timezone) {
    issues.push({
      id: uuid(),
      rule: 'R. 18.2.2(c)',
      source: 'Bluebook',
      severity: 'warning',
      message: 'Timestamp should include a time zone designation.',
      suggestion: 'Add a time zone (e.g., "ET", "PT", "UTC") after the timestamp.',
    });
  }
}

/**
 * R. 18.2.2(b)(ii): Subdivisions within larger sites.
 * If the cited source is published under a blog or subdivision with its own
 * content and presence, both the site name and subdivision should be included,
 * separated by a colon.
 */
function checkSubdivision(
  components: InternetComponents,
  rawText: string | undefined,
  issues: ValidationIssue[]
): void {
  if (!components.subdivision || !components.websiteName) return;

  if (rawText) {
    const expectedFormat = `${components.websiteName}: ${components.subdivision}`;
    if (!rawText.includes(expectedFormat) && !rawText.includes(`${components.websiteName}:`)) {
      issues.push({
        id: uuid(),
        rule: 'R. 18.2.2(b)(ii)',
        source: 'Bluebook',
        severity: 'warning',
        message: 'Subdivision name should follow the main site name with a colon.',
        suggestion: `Format as: ${expectedFormat}`,
      });
    }
  }
}

/**
 * Validate that month names in a date string use T12 abbreviations.
 */
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

function extractHostname(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}
