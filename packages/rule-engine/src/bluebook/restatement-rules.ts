import { v4 as uuid } from 'uuid';
import type { ValidationIssue, RestatementComponents } from '@legalcitation/shared';

/**
 * Bluebook R. 12.9.5 / R. 15.8 — Restatements.
 * Validates restatement citation formatting per the 22nd Edition.
 */

const VALID_SERIES = new Set(['First', 'Second', 'Third', 'Fourth']);

const RECOGNIZED_SUBJECTS = new Set([
  'Agency', 'Conflict of Laws', 'Contracts', 'Employment Law',
  'Foreign Relations Law', 'Judgments', 'Law Governing Lawyers',
  'Liability Insurance', 'Property', 'Property: Mortgages',
  'Property: Servitudes', 'Property: Wills and Other Donative Transfers',
  'Restitution', 'Restitution and Unjust Enrichment',
  'Security', 'Suretyship and Guaranty', 'Torts',
  'Torts: Apportionment of Liability', 'Torts: Intentional Torts to Persons',
  'Torts: Liability for Economic Harm', 'Torts: Liability for Physical and Emotional Harm',
  'Torts: Products Liability', 'Trusts', 'Unfair Competition',
  'Consumer Contracts', 'Copyright', 'Data Privacy',
  'Trademark Law',
]);

export function validateRestatement(components: RestatementComponents, rawText?: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  checkSeries(components, issues);
  checkSubject(components, issues);
  checkSection(components, rawText, issues);
  checkYear(components, issues);
  checkOrganization(components, issues);
  checkPinCite(components, issues);

  return issues;
}

function checkSeries(components: RestatementComponents, issues: ValidationIssue[]): void {
  if (!components.series) {
    issues.push({
      id: uuid(),
      rule: 'R. 15.8',
      source: 'Bluebook',
      severity: 'error',
      message: 'Restatement citation must include the series in parentheses.',
      suggestion: 'Use format: Restatement (Second) of Subject § section (year).',
    });
    return;
  }

  if (!VALID_SERIES.has(components.series)) {
    issues.push({
      id: uuid(),
      rule: 'R. 15.8',
      source: 'Bluebook',
      severity: 'error',
      message: `"${components.series}" is not a valid Restatement series.`,
      suggestion: 'Valid series: First, Second, Third, Fourth.',
    });
  }
}

function checkSubject(components: RestatementComponents, issues: ValidationIssue[]): void {
  if (!components.subject) {
    issues.push({
      id: uuid(),
      rule: 'R. 15.8',
      source: 'Bluebook',
      severity: 'error',
      message: 'Restatement citation must include the subject (e.g., "Torts", "Contracts").',
      suggestion: 'Add the subject after "of": Restatement (Second) of Torts.',
    });
    return;
  }

  if (!RECOGNIZED_SUBJECTS.has(components.subject)) {
    issues.push({
      id: uuid(),
      rule: 'R. 15.8',
      source: 'Bluebook',
      severity: 'suggestion',
      message: `"${components.subject}" is not a commonly recognized Restatement subject.`,
      suggestion: 'Verify the subject name is correct.',
    });
  }
}

function checkSection(components: RestatementComponents, rawText: string | undefined, issues: ValidationIssue[]): void {
  if (!components.section) {
    issues.push({
      id: uuid(),
      rule: 'R. 15.8',
      source: 'Bluebook',
      severity: 'error',
      message: 'Restatement citation must include a section number.',
      suggestion: 'Add the section: § [number].',
    });
  }

  // R. 3.3: Must use § symbol, not "section" or "sec."
  if (rawText && /\b(?:sec\.|section)\s+\d/i.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 3.3',
      source: 'Bluebook',
      severity: 'error',
      message: 'Use the section symbol "§" instead of "sec." or "section".',
      suggestion: 'Replace with "§".',
    });
  }
}

function checkYear(components: RestatementComponents, issues: ValidationIssue[]): void {
  if (!components.year) {
    issues.push({
      id: uuid(),
      rule: 'R. 15.8',
      source: 'Bluebook',
      severity: 'error',
      message: 'Restatement citation must include a year in parentheses.',
      suggestion: 'Add the year: (Am. L. Inst. 1965).',
    });
    return;
  }

  const yearNum = parseInt(components.year, 10);
  if (isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear() + 1) {
    issues.push({
      id: uuid(),
      rule: 'R. 15.8',
      source: 'Bluebook',
      severity: 'warning',
      message: `Year "${components.year}" appears invalid.`,
      suggestion: 'Use a four-digit year.',
    });
  }
}

function checkOrganization(components: RestatementComponents, issues: ValidationIssue[]): void {
  // 22nd Edition: organization should be "Am. L. Inst." before the year
  if (!components.organization) {
    issues.push({
      id: uuid(),
      rule: 'R. 15.8',
      source: 'Bluebook',
      severity: 'suggestion',
      message: 'Per the 22nd Edition, include "Am. L. Inst." before the year in the parenthetical.',
      suggestion: `Use "(Am. L. Inst. ${components.year})" instead of "(${components.year})".`,
    });
  }
}

function checkPinCite(components: RestatementComponents, issues: ValidationIssue[]): void {
  if (!components.pinCite) return;

  const pinCite = components.pinCite.trim();

  // Validate comment format: "cmt. [lowercase letter]"
  if (pinCite.startsWith('cmt.')) {
    if (!/^cmt\.\s*[a-z]$/.test(pinCite)) {
      issues.push({
        id: uuid(),
        rule: 'R. 15.8',
        source: 'Bluebook',
        severity: 'warning',
        message: `Comment pinpoint "${pinCite}" format may be incorrect.`,
        suggestion: 'Use format: "cmt. a" (lowercase letter).',
      });
    }
  }

  // Validate illustration format: "illus. [number]"
  if (pinCite.startsWith('illus.')) {
    if (!/^illus\.\s*\d+$/.test(pinCite)) {
      issues.push({
        id: uuid(),
        rule: 'R. 15.8',
        source: 'Bluebook',
        severity: 'warning',
        message: `Illustration pinpoint "${pinCite}" format may be incorrect.`,
        suggestion: 'Use format: "illus. 3".',
      });
    }
  }
}
