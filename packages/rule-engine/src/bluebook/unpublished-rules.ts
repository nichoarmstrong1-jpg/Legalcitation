import { v4 as uuid } from 'uuid';
import type { ValidationIssue, UnpublishedComponents } from '@legalcitation/shared';

/**
 * Bluebook R. 17 — Unpublished and Forthcoming Sources.
 * Validates unpublished manuscripts, working papers, and dissertations.
 */
export function validateUnpublished(components: UnpublishedComponents, rawText?: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  checkAuthor(components, issues);
  checkTitle(components, issues);
  checkDate(components, issues);

  switch (components.subtype) {
    case 'manuscript':
      checkManuscript(components, rawText, issues);
      break;
    case 'working_paper':
      checkWorkingPaper(components, issues);
      break;
    case 'dissertation':
      checkDissertation(components, issues);
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

function checkWorkingPaper(components: UnpublishedComponents, issues: ValidationIssue[]): void {
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
