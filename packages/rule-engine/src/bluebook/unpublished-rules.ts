import { v4 as uuid } from 'uuid';
import type { ValidationIssue, UnpublishedComponents } from '@legalcitation/shared';

/**
 * Bluebook R. 17 — Unpublished and Forthcoming Sources.
 * Validates unpublished manuscripts, working papers, dissertations,
 * letters, memoranda, press releases, emails, interviews, speeches,
 * and forthcoming publications.
 *
 * Supports both 'law_review' and 'court_doc' styles.
 *
 * Format examples:
 *   Manuscript: Author, Title (date) (unpublished manuscript) (on file with institution).
 *   Working Paper: Author, Title (institution, Working Paper No. X, year).
 *   Forthcoming: Author, Title, Vol. Journal (forthcoming year).
 *   Letter: Letter from Sender to Recipient (date) (on file with institution).
 *   E-mail: E-mail from Sender to Recipient (date, time TZ) (on file with author).
 *   Interview: Interview with Interviewee, Title, in Location (date).
 *   Speech: Speaker, Title, Address at Event (date).
 *
 * Short form: Author, supra note X, at page.
 */

type DocumentStyle = 'law_review' | 'court_doc';

export function validateUnpublished(
  components: UnpublishedComponents,
  rawText?: string,
  _style: DocumentStyle = 'law_review'
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  checkAuthor(components, issues);
  checkTitle(components, issues);
  checkDate(components, issues);
  checkOnFileFormat(components, rawText, issues);

  switch (components.subtype) {
    case 'manuscript':
      checkManuscript(components, rawText, issues);
      break;
    case 'working_paper':
      checkWorkingPaper(components, rawText, issues);
      break;
    case 'dissertation':
      checkDissertation(components, issues);
      break;
    case 'letter':
      checkLetter(components, rawText, issues);
      break;
    case 'email':
      checkEmail(components, issues);
      break;
    case 'interview':
      checkInterview(components, rawText, issues);
      break;
    case 'speech':
      checkSpeech(components, issues);
      break;
    case 'forthcoming':
      checkForthcoming(components, rawText, issues);
      break;
  }

  return issues;
}

function checkAuthor(components: UnpublishedComponents, issues: ValidationIssue[]): void {
  if (!components.author || components.author.trim().length === 0) {
    issues.push({
      id: uuid(),
      rule: 'R. 17.1',
      source: 'Bluebook',
      severity: 'error',
      message: 'Unpublished source citation must include an author.',
      suggestion: 'Add the author name before the title.',
    });
  }
}

function checkTitle(components: UnpublishedComponents, issues: ValidationIssue[]): void {
  if (!components.title || components.title.trim().length === 0) {
    issues.push({
      id: uuid(),
      rule: 'R. 17.1',
      source: 'Bluebook',
      severity: 'error',
      message: 'Unpublished source citation must include a title.',
      suggestion: 'Add the title in italics.',
    });
  }
}

function checkDate(components: UnpublishedComponents, issues: ValidationIssue[]): void {
  if (!components.date || components.date.trim().length === 0) {
    issues.push({
      id: uuid(),
      rule: 'R. 17.1',
      source: 'Bluebook',
      severity: 'error',
      message: 'Unpublished source citation must include a date.',
      suggestion: 'Add the date in parentheses.',
    });
  }
}

function checkManuscript(components: UnpublishedComponents, rawText: string | undefined, issues: ValidationIssue[]): void {
  // R. 17.2.1: Must include "(unpublished manuscript)"
  if (rawText && !/\(unpublished manuscript\)/i.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 17.2.1',
      source: 'Bluebook',
      severity: 'error',
      message: 'Unpublished manuscript must include "(unpublished manuscript)" parenthetical.',
      suggestion: 'Add "(unpublished manuscript)" after the date parenthetical.',
    });
  }

  // R. 17.2.1: Must include "(on file with ...)"
  if (!components.onFileWith) {
    issues.push({
      id: uuid(),
      rule: 'R. 17.2.1',
      source: 'Bluebook',
      severity: 'error',
      message: 'Unpublished manuscript must include "(on file with [repository])" to indicate where the manuscript can be accessed.',
      suggestion: 'Add "(on file with the [journal name or institution])".',
    });
  }
}

function checkWorkingPaper(components: UnpublishedComponents, rawText: string | undefined, issues: ValidationIssue[]): void {
  if (!components.institution) {
    issues.push({
      id: uuid(),
      rule: 'R. 17.4',
      source: 'Bluebook',
      severity: 'error',
      message: 'Working paper citation must include the institution.',
      suggestion: 'Add the institution name in the parenthetical (e.g., "(Nat\'l Bureau of Econ. Rsch., Working Paper No. 729, 2024)").',
    });
  }

  if (!components.workingPaperNumber) {
    issues.push({
      id: uuid(),
      rule: 'R. 17.4',
      source: 'Bluebook',
      severity: 'error',
      message: 'Working paper citation must include the working paper number.',
      suggestion: 'Add "Working Paper No. [number]" in the parenthetical.',
    });
  }

  // R. 17.4: Validate "Working Paper No." format
  if (rawText && components.workingPaperNumber) {
    if (!/Working Paper No\.\s/i.test(rawText)) {
      issues.push({
        id: uuid(),
        rule: 'R. 17.4',
        source: 'Bluebook',
        severity: 'warning',
        message: 'Working paper designation should use "Working Paper No." format.',
        suggestion: `Format as: "Working Paper No. ${components.workingPaperNumber}".`,
      });
    }
  }
}

function checkDissertation(components: UnpublishedComponents, issues: ValidationIssue[]): void {
  if (!components.degree) {
    issues.push({
      id: uuid(),
      rule: 'R. 17.2.2',
      source: 'Bluebook',
      severity: 'error',
      message: 'Dissertation/thesis citation must include the degree designation.',
      suggestion: 'Add the degree (e.g., "Ph.D. dissertation" or "LL.M. thesis").',
    });
  }

  if (!components.institution) {
    issues.push({
      id: uuid(),
      rule: 'R. 17.2.2',
      source: 'Bluebook',
      severity: 'error',
      message: 'Dissertation/thesis citation must include the institution.',
      suggestion: 'Add the institution name (e.g., "Harvard University").',
    });
  }
}

/**
 * R. 17.2.3: Letters, memoranda, and press releases.
 * Identify the nature of the document and give the writer and addressee
 * (if any) by name, title, and institutional affiliation.
 *
 * Format: Letter from [Sender], [Title], [Institution] to [Recipient] (date) (on file with ...).
 * For letters to the author: omit addressee name, use "to author".
 */
function checkLetter(components: UnpublishedComponents, rawText: string | undefined, issues: ValidationIssue[]): void {
  if (!components.documentNature) {
    issues.push({
      id: uuid(),
      rule: 'R. 17.2.3',
      source: 'Bluebook',
      severity: 'error',
      message: 'Letter/memorandum/press release must identify the nature of the document.',
      suggestion: 'Begin with "Letter from", "Memorandum from", or "Press Release,".',
    });
  }

  const nature = components.documentNature?.toLowerCase();
  const isLetter = nature === 'letter' || nature === 'memorandum';

  if (isLetter && !components.recipientName) {
    issues.push({
      id: uuid(),
      rule: 'R. 17.2.3',
      source: 'Bluebook',
      severity: 'warning',
      message: 'Letter/memorandum should identify the recipient.',
      suggestion: 'Add the recipient name, or use "to author" if the letter is to the citing author.',
    });
  }

  if (!components.onFileWith) {
    issues.push({
      id: uuid(),
      rule: 'R. 17.2.3',
      source: 'Bluebook',
      severity: 'error',
      message: 'Letter/memorandum/press release must include "(on file with ...)" parenthetical.',
      suggestion: 'Add "(on file with [institution or author])".',
    });
  }

  // Validate "from ... to ..." format in raw text
  if (rawText && isLetter) {
    if (!/\bfrom\b/i.test(rawText) || !/\bto\b/i.test(rawText)) {
      issues.push({
        id: uuid(),
        rule: 'R. 17.2.3',
        source: 'Bluebook',
        severity: 'suggestion',
        message: 'Letter/memorandum should use "from [sender] to [recipient]" format.',
        suggestion: 'Format as: "Letter from [Name], [Title] to [Name] (date)".',
      });
    }
  }
}

/**
 * R. 17.2.4: E-mail correspondence.
 * Analogize to unpublished letters. Include sender, recipient,
 * date with timestamp and time zone.
 *
 * Format: E-mail from [Sender], [Title], to [Recipient] (date, at HH:MM TZ) (on file with ...).
 */
function checkEmail(components: UnpublishedComponents, issues: ValidationIssue[]): void {
  if (!components.recipientName) {
    issues.push({
      id: uuid(),
      rule: 'R. 17.2.4',
      source: 'Bluebook',
      severity: 'warning',
      message: 'E-mail citation should identify the recipient.',
      suggestion: 'Add the recipient name, or use "to author" for emails to the citing author.',
    });
  }

  if (!components.timestamp) {
    issues.push({
      id: uuid(),
      rule: 'R. 17.2.4',
      source: 'Bluebook',
      severity: 'suggestion',
      message: 'E-mail citation may need a timestamp for specific identification.',
      suggestion: 'Add the time of the message (e.g., "06:15 ET").',
    });
  }

  if (components.timestamp && !components.timezone) {
    issues.push({
      id: uuid(),
      rule: 'R. 17.2.4',
      source: 'Bluebook',
      severity: 'warning',
      message: 'E-mail timestamp should include a time zone designation.',
      suggestion: 'Add a time zone after the timestamp (e.g., "ET", "PT").',
    });
  }

  if (!components.onFileWith) {
    issues.push({
      id: uuid(),
      rule: 'R. 17.2.4',
      source: 'Bluebook',
      severity: 'error',
      message: 'E-mail citation must include "(on file with ...)" parenthetical.',
      suggestion: 'Add "(on file with author)" or "(on file with [institution])".',
    });
  }
}

/**
 * R. 17.2.5: Interviews.
 * Include interviewee name, title, institutional affiliation, and date.
 * For in-person interviews, include location before the date.
 * When the author did not conduct the interview, include the interviewer name.
 *
 * Format: Interview with [Name], [Title], in [Location] (date).
 * Or: Interview by [Interviewer] with [Name], in [Location] (date).
 */
function checkInterview(components: UnpublishedComponents, rawText: string | undefined, issues: ValidationIssue[]): void {
  // Author field is the interviewee for interviews
  if (!components.author || components.author.trim().length === 0) {
    issues.push({
      id: uuid(),
      rule: 'R. 17.2.5',
      source: 'Bluebook',
      severity: 'error',
      message: 'Interview citation must include the interviewee name.',
      suggestion: 'Add the interviewee name, title, and institutional affiliation.',
    });
  }

  // Title should be "Telephone Interview with..." or "Interview with..."
  if (rawText) {
    const hasInterviewFormat = /\b(?:Telephone )?Interview\s+(?:with|by)\b/i.test(rawText);
    if (!hasInterviewFormat) {
      issues.push({
        id: uuid(),
        rule: 'R. 17.2.5',
        source: 'Bluebook',
        severity: 'warning',
        message: 'Interview citation should begin with "Interview with" or "Telephone Interview with".',
        suggestion: 'Format as: "Interview with [Name], [Title], in [Location] (date)".',
      });
    }
  }

  // When author conducted the interview, no interviewer name needed
  // When someone else conducted it, interviewer name is required
  if (components.interviewerName && rawText) {
    if (!/\bInterview by\b/i.test(rawText)) {
      issues.push({
        id: uuid(),
        rule: 'R. 17.2.5',
        source: 'Bluebook',
        severity: 'suggestion',
        message: 'When the author did not conduct the interview, use "Interview by [Interviewer] with [Interviewee]".',
        suggestion: `Format as: "Interview by ${components.interviewerName} with ${components.author}"`,
      });
    }
  }
}

/**
 * R. 17.2.6: Speeches and addresses.
 * Identify the speaker by name. Add title and institutional affiliation
 * if included in the transcript or helpful to the reader.
 * Include the title of the speech, pincite, and date.
 *
 * Format: Speaker, [Title,] Speech Title, Address at Event (date).
 * If no formal title: Speaker, Address at Event (date).
 * If transcribed but unpublished: add "(transcript available in ...)" parenthetical.
 */
function checkSpeech(components: UnpublishedComponents, issues: ValidationIssue[]): void {
  if (!components.author || components.author.trim().length === 0) {
    issues.push({
      id: uuid(),
      rule: 'R. 17.2.6',
      source: 'Bluebook',
      severity: 'error',
      message: 'Speech citation must identify the speaker.',
      suggestion: 'Add the speaker name.',
    });
  }

  if (!components.eventDescription) {
    issues.push({
      id: uuid(),
      rule: 'R. 17.2.6',
      source: 'Bluebook',
      severity: 'warning',
      message: 'Speech citation should include event information.',
      suggestion: 'Add the event description (e.g., "Address at the Harvard Law Review Annual Banquet").',
    });
  }
}

/**
 * R. 17.3: Forthcoming publications.
 * Cite as the published piece would be cited, except:
 *   (i) Do not include a pincite after the journal/book title.
 *   (ii) Add "forthcoming" in the date parenthetical.
 *   (iii) Include month of publication if available.
 * Omit volume number if not yet available.
 *
 * For pincites, use: (manuscript at [page]) (on file with ...).
 */
function checkForthcoming(components: UnpublishedComponents, rawText: string | undefined, issues: ValidationIssue[]): void {
  if (!components.forthcomingYear && !components.date) {
    issues.push({
      id: uuid(),
      rule: 'R. 17.3',
      source: 'Bluebook',
      severity: 'error',
      message: 'Forthcoming publication must include an expected date or year.',
      suggestion: 'Add the expected year: (forthcoming 2025).',
    });
  }

  if (rawText && !/\(forthcoming\b/i.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 17.3',
      source: 'Bluebook',
      severity: 'error',
      message: 'Forthcoming publication must include "(forthcoming [year])" in the date parenthetical.',
      suggestion: `Add "(forthcoming ${components.forthcomingYear || components.date || '2025'})" in the date parenthetical.`,
    });
  }

  // Pincites in forthcoming works use "(manuscript at [page])"
  if (components.pinCite && !components.manuscriptPage) {
    issues.push({
      id: uuid(),
      rule: 'R. 17.3',
      source: 'Bluebook',
      severity: 'warning',
      message: 'Pinpoint citations in forthcoming works should use "(manuscript at [page])" format.',
      suggestion: 'Use "(manuscript at 12)" instead of a bare page number.',
    });
  }

  if (components.manuscriptPage && rawText) {
    if (!/\(manuscript at\s+\d+\)/i.test(rawText)) {
      issues.push({
        id: uuid(),
        rule: 'R. 17.3',
        source: 'Bluebook',
        severity: 'warning',
        message: 'Manuscript page citation should use "(manuscript at [page])" format.',
        suggestion: `Format as: (manuscript at ${components.manuscriptPage}).`,
      });
    }
  }

  // Forthcoming manuscript pincites also need "(on file with ...)"
  if (components.manuscriptPage && !components.onFileWith) {
    issues.push({
      id: uuid(),
      rule: 'R. 17.3',
      source: 'Bluebook',
      severity: 'warning',
      message: 'Forthcoming publication with manuscript pincite should include "(on file with ...)".',
      suggestion: 'Add "(on file with authors)" or "(on file with [journal])".',
    });
  }
}

/**
 * R. 17.2: Validate "(on file with [institution/author])" formatting.
 * Applies to all unpublished materials that aren't publicly available.
 */
function checkOnFileFormat(components: UnpublishedComponents, rawText: string | undefined, issues: ValidationIssue[]): void {
  if (!rawText || !components.onFileWith) return;

  const onFilePattern = /\(on file with\s+[^)]+\)/i;
  if (!onFilePattern.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 17.2',
      source: 'Bluebook',
      severity: 'warning',
      message: '"On file with" should appear in a parenthetical: "(on file with [institution])".',
      suggestion: `Format as: (on file with ${components.onFileWith}).`,
    });
  }
}
