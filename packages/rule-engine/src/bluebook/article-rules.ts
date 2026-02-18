import { v4 as uuid } from 'uuid';
import type { ValidationIssue, ArticleComponents } from '@legalcitation/shared';
import { JOURNAL_ABBREVIATIONS, JOURNAL_ABBREVIATION_REVERSE, lookupJournal } from '@legalcitation/shared';

/**
 * Bluebook R. 15 — Periodicals (Journals, Magazines, Newspapers)
 * Validates article citation formatting per the 22nd Edition.
 */

const KNOWN_ABBREVIATED_FORMS = new Set(Object.values(JOURNAL_ABBREVIATIONS));

const STUDENT_DESIGNATORS = new Set([
  'Note', 'Comment', 'Recent Development', 'Book Review', 'Essay',
  'Recent Case', 'Recent Legislation', 'Case Comment', 'Student Note',
]);

export function validateArticle(components: ArticleComponents, rawText?: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  checkAuthors(components, rawText, issues);
  checkTitle(components, rawText, issues);
  checkJournalAbbreviation(components, issues);
  checkForthcoming(components, issues);
  checkVolume(components, issues);
  checkPage(components, issues);
  checkYear(components, issues);
  checkStudentDesignator(components, rawText, issues);
  checkPinCite(components, issues);

  return issues;
}

function checkAuthors(components: ArticleComponents, rawText: string | undefined, issues: ValidationIssue[]): void {
  if (!components.authors || components.authors.length === 0) {
    issues.push({
      id: uuid(),
      rule: 'R. 15.1',
      source: 'Bluebook',
      severity: 'error',
      message: 'Article citation must include at least one author.',
      suggestion: 'Add the author name in "First Last" format before the article title.',
    });
    return;
  }

  for (const author of components.authors) {
    if (/^[A-Z][a-z]*$/.test(author.trim())) {
      issues.push({
        id: uuid(),
        rule: 'R. 15.1',
        source: 'Bluebook',
        severity: 'warning',
        message: `Author "${author}" appears to be a single name. Use full name format.`,
        suggestion: 'Authors should appear as "First Last" (e.g., "Cass R. Sunstein").',
      });
    }

    if (/^[A-Z\s]+$/.test(author.trim()) && author.trim().length > 1) {
      issues.push({
        id: uuid(),
        rule: 'R. 15.1',
        source: 'Bluebook',
        severity: 'error',
        message: `Author "${author}" appears to be all caps.`,
        suggestion: 'Use standard capitalization for author names (e.g., "John Smith").',
      });
    }
  }

  if (components.authors.length === 2) {
    if (rawText && !rawText.includes('&') && !rawText.includes(' and ')) {
      issues.push({
        id: uuid(),
        rule: 'R. 15.1',
        source: 'Bluebook',
        severity: 'warning',
        message: 'Two authors should be joined with "&" (not "and").',
        suggestion: 'Format as "Author One & Author Two".',
      });
    }
  }

  if (components.authors.length > 2) {
    const authorText = components.authors.join(', ');
    if (!authorText.includes('et al.')) {
      issues.push({
        id: uuid(),
        rule: 'R. 15.1',
        source: 'Bluebook',
        severity: 'suggestion',
        message: 'For three or more authors, consider using "et al." after the first author.',
        suggestion: `Format as "${components.authors[0]} et al."`,
      });
    }
  }
}

function checkTitle(components: ArticleComponents, rawText: string | undefined, issues: ValidationIssue[]): void {
  if (!components.title || components.title.trim().length === 0) {
    issues.push({
      id: uuid(),
      rule: 'R. 15.1',
      source: 'Bluebook',
      severity: 'error',
      message: 'Article citation must include a title.',
      suggestion: 'Add the article title in italics after the author name.',
    });
    return;
  }

  if (rawText) {
    const titleInText = rawText.includes(`*${components.title}*`) || rawText.includes(`_${components.title}_`);
    if (!titleInText && !rawText.includes(components.title)) {
      return;
    }
    if (!titleInText && rawText.includes(components.title)) {
      issues.push({
        id: uuid(),
        rule: 'R. 15.1 / B9',
        source: 'Bluebook',
        severity: 'warning',
        message: 'Article title should be italicized.',
        suggestion: `Italicize the title: *${components.title}*`,
      });
    }
  }

  const minorWords = new Set(['a', 'an', 'the', 'and', 'but', 'or', 'nor', 'for', 'yet', 'so', 'in', 'on', 'at', 'to', 'of', 'by', 'as']);
  const words = components.title.split(/\s+/);
  for (let idx = 1; idx < words.length; idx++) {
    const word = words[idx];
    const lower = word.toLowerCase();
    if (!minorWords.has(lower)) {
      if (word[0] && word[0] === word[0].toLowerCase() && /^[a-z]/.test(word)) {
        issues.push({
          id: uuid(),
          rule: 'R. 8(a)',
          source: 'Bluebook',
          severity: 'warning',
          message: `"${word}" in the title should be capitalized.`,
          suggestion: `Capitalize as "${word[0].toUpperCase()}${word.slice(1)}".`,
        });
        break;
      }
    }
  }
}

function checkJournalAbbreviation(components: ArticleComponents, issues: ValidationIssue[]): void {
  if (!components.journal || components.journal.trim().length === 0) {
    issues.push({
      id: uuid(),
      rule: 'R. 15.1',
      source: 'Bluebook',
      severity: 'error',
      message: 'Article citation must include a journal name.',
      suggestion: 'Add the journal name in abbreviated form per T13 (e.g., "Harv. L. Rev.").',
    });
    return;
  }

  const journal = components.journal.trim();

  // Check if the journal is a known full name that should be abbreviated
  const result = lookupJournal(journal);
  if (result && result.abbreviation.toLowerCase() !== journal.toLowerCase()) {
    // User provided a full name or unabbreviated form
    const sourceLabel = result.source === 'known' ? 'T13' : 'T6';
    issues.push({
      id: uuid(),
      rule: `R. 15.1 / ${sourceLabel}`,
      source: 'Bluebook',
      severity: 'error',
      message: `Journal name "${journal}" should be abbreviated.`,
      suggestion: `Use "${result.abbreviation}" instead of "${result.fullName}".`,
    });
    return;
  }

  // If not in our known database and doesn't look abbreviated, suggest abbreviation
  if (!journal.includes('.') && !KNOWN_ABBREVIATED_FORMS.has(journal)) {
    const hasMultiWordUnabbreviated = journal.split(/\s+/).length >= 3 && !/\.$/.test(journal);
    if (hasMultiWordUnabbreviated) {
      // Try to generate an abbreviation via T6
      const generated = lookupJournal(journal);
      const suggestion = generated
        ? `Use "${generated.abbreviation}".`
        : 'Abbreviate journal words per T13 (e.g., "Review" → "Rev.", "Journal" → "J.", "Law" → "L.").';
      issues.push({
        id: uuid(),
        rule: 'R. 15.1 / T13',
        source: 'Bluebook',
        severity: 'suggestion',
        message: `Journal name "${journal}" may need abbreviation per T13.`,
        suggestion,
      });
    }
  }
}

function checkVolume(components: ArticleComponents, issues: ValidationIssue[]): void {
  if (!components.volume || components.volume.trim().length === 0) {
    // Volume is optional for forthcoming articles (R. 17.3)
    if (components.forthcoming) return;
    issues.push({
      id: uuid(),
      rule: 'R. 15.1',
      source: 'Bluebook',
      severity: 'error',
      message: 'Article citation must include a volume number.',
      suggestion: 'Add the volume number before the journal abbreviation.',
    });
    return;
  }

  if (!/^\d+$/.test(components.volume.trim())) {
    issues.push({
      id: uuid(),
      rule: 'R. 15.1',
      source: 'Bluebook',
      severity: 'warning',
      message: `Volume "${components.volume}" should be a number.`,
      suggestion: 'Use the numeric volume number (e.g., "128").',
    });
  }
}

function checkPage(components: ArticleComponents, issues: ValidationIssue[]): void {
  if (!components.firstPage || components.firstPage.trim().length === 0) {
    // Page number is not available for forthcoming articles (R. 17.3)
    if (components.forthcoming) return;
    issues.push({
      id: uuid(),
      rule: 'R. 15.1',
      source: 'Bluebook',
      severity: 'error',
      message: 'Article citation must include a starting page number.',
      suggestion: 'Add the first page number after the journal abbreviation.',
    });
    return;
  }

  if (!/^\d+$/.test(components.firstPage.trim())) {
    issues.push({
      id: uuid(),
      rule: 'R. 15.1',
      source: 'Bluebook',
      severity: 'warning',
      message: `First page "${components.firstPage}" should be a number.`,
      suggestion: 'Use the numeric starting page (e.g., "1045").',
    });
  }
}

function checkYear(components: ArticleComponents, issues: ValidationIssue[]): void {
  if (!components.year || components.year.trim().length === 0) {
    issues.push({
      id: uuid(),
      rule: 'R. 15.1',
      source: 'Bluebook',
      severity: 'error',
      message: 'Article citation must include a year.',
      suggestion: 'Add the publication year in parentheses (e.g., "(2024)").',
    });
    return;
  }

  const yearNum = parseInt(components.year, 10);
  if (isNaN(yearNum) || yearNum < 1800 || yearNum > new Date().getFullYear() + 1) {
    issues.push({
      id: uuid(),
      rule: 'R. 15.1',
      source: 'Bluebook',
      severity: 'warning',
      message: `Year "${components.year}" appears invalid.`,
      suggestion: 'Use a four-digit year (e.g., "2024").',
    });
  }
}

function checkStudentDesignator(components: ArticleComponents, rawText: string | undefined, issues: ValidationIssue[]): void {
  if (!components.studentDesignator) return;

  if (!STUDENT_DESIGNATORS.has(components.studentDesignator)) {
    issues.push({
      id: uuid(),
      rule: 'R. 15.5.1',
      source: 'Bluebook',
      severity: 'warning',
      message: `"${components.studentDesignator}" is not a recognized student-written piece designator.`,
      suggestion: 'Valid designators: Note, Comment, Recent Development, Book Review, Essay.',
    });
  }

  if (rawText && components.studentDesignator) {
    const designator = components.studentDesignator;
    const afterTitle = rawText.indexOf(designator);
    if (afterTitle > 0) {
      const beforeDesignator = rawText.substring(afterTitle - 2, afterTitle);
      if (!beforeDesignator.includes(',')) {
        issues.push({
          id: uuid(),
          rule: 'R. 15.5.1',
          source: 'Bluebook',
          severity: 'suggestion',
          message: `Student designator "${designator}" should follow the title after a comma.`,
          suggestion: `Format as: Author, *Title*, ${designator}, Vol. Journal Page (Year).`,
        });
      }
    }
  }
}

function checkForthcoming(components: ArticleComponents, issues: ValidationIssue[]): void {
  if (!components.forthcoming) return;

  // R. 17.3: Forthcoming articles must include a year
  if (!components.forthcomingYear && !components.year) {
    issues.push({
      id: uuid(),
      rule: 'R. 17.3',
      source: 'Bluebook',
      severity: 'error',
      message: 'Forthcoming article must include a year.',
      suggestion: 'Add the expected year: (forthcoming 2025).',
    });
  }

  // R. 17.3: Pinpoint citations in forthcoming works use manuscript pages
  if (components.pinCite && !components.manuscriptPage) {
    issues.push({
      id: uuid(),
      rule: 'R. 17.3',
      source: 'Bluebook',
      severity: 'warning',
      message: 'Pinpoint citations in forthcoming articles should use "(manuscript at [page])" format.',
      suggestion: 'Use "(manuscript at 12)" instead of a bare page number.',
    });
  }

  // R. 17.3: Volume number is optional for forthcoming works
  // (don't flag missing volume if forthcoming)
}

function checkPinCite(components: ArticleComponents, issues: ValidationIssue[]): void {
  if (!components.pinCite) return;

  const pinCite = components.pinCite.trim();
  if (!/^\d+([–-]\d+)?$/.test(pinCite)) {
    issues.push({
      id: uuid(),
      rule: 'R. 3.2(a)',
      source: 'Bluebook',
      severity: 'warning',
      message: `Pinpoint citation "${pinCite}" format may be incorrect.`,
      suggestion: 'Use page numbers (e.g., "1050" or "1050–52") after a comma and space.',
    });
  }

  if (components.firstPage && components.pinCite) {
    const firstPageNum = parseInt(components.firstPage, 10);
    const pinPageNum = parseInt(components.pinCite, 10);
    if (!isNaN(firstPageNum) && !isNaN(pinPageNum) && pinPageNum < firstPageNum) {
      issues.push({
        id: uuid(),
        rule: 'R. 3.2(a)',
        source: 'Bluebook',
        severity: 'error',
        message: `Pinpoint page ${pinPageNum} is before the article's first page ${firstPageNum}.`,
        suggestion: `Pinpoint citation must reference a page at or after page ${firstPageNum}.`,
      });
    }
  }
}
