import { v4 as uuid } from 'uuid';
import type { ValidationIssue, TreatyComponents } from '@legalcitation/shared';
import { T12_MONTHS, UNABBREVIATED_MONTHS } from '@legalcitation/shared';
import { T4_TREATY_SOURCE_ABBREVIATIONS } from './common/treaty-sources.js';
import { T16_SUBDIVISIONS } from './subdivision-rules.js';

/**
 * Bluebook B20-B21 + R. 21 — International Materials: Treaties, Conventions, Agreements.
 *
 * Validates treaty/international agreement citation formatting per the 22nd Edition.
 * Supports both 'law_review' and 'court_doc' styles.
 *
 * Multilateral format: "Treaty Name, date, source."
 * Bilateral format: "Treaty Name, Country A-Country B, date, source."
 * Founding document format: "U.N. Charter art. 94, ¶ 1."
 */
export function validateTreaty(components: TreatyComponents, rawText?: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  checkTreatyName(components, issues);
  checkTreatyDate(components, rawText, issues);
  checkTreatySource(components, issues);
  checkTreatyParties(components, rawText, issues);
  checkArticleSection(components, rawText, issues);

  return issues;
}

/**
 * R. 21.4.1: Treaty name must be present.
 * First citation should contain the full name including form and subject matter.
 * Use the English-language version whenever possible.
 */
function checkTreatyName(components: TreatyComponents, issues: ValidationIssue[]): void {
  if (!components.name || components.name.trim().length === 0) {
    issues.push({
      id: uuid(),
      rule: 'R. 21.4.1',
      source: 'Bluebook',
      severity: 'error',
      message: 'Treaty citation must include the name of the agreement.',
      suggestion: 'Add the full treaty name (e.g., "Convention on the Rights of the Child").',
    });
    return;
  }

  const name = components.name.trim();

  if (components.treatyType !== 'founding' && !hasFormDesignation(name)) {
    issues.push({
      id: uuid(),
      rule: 'R. 21.4.1(a)(i)',
      source: 'Bluebook',
      severity: 'suggestion',
      message: 'Treaty name should indicate the form of the agreement (e.g., Agreement, Convention, Protocol, Treaty).',
      suggestion: 'Ensure the treaty name includes its form designation.',
    });
  }
}

const TREATY_FORM_DESIGNATIONS = [
  'Agreement', 'Convention', 'Covenant', 'Charter', 'Declaration',
  'Memorandum', 'Protocol', 'Statute', 'Treaty', 'Understanding',
  'Pact', 'Accord', 'Exchange of Notes',
];

function hasFormDesignation(name: string): boolean {
  const lowerName = name.toLowerCase();
  return TREATY_FORM_DESIGNATIONS.some(form => lowerName.includes(form.toLowerCase()));
}

/**
 * R. 21.4.4: Date of signing must be present and formatted per T.12.
 * Bilateral: exact date of signing.
 * Multilateral: date adopted or opened for signature.
 */
function checkTreatyDate(
  components: TreatyComponents,
  rawText: string | undefined,
  issues: ValidationIssue[]
): void {
  if (components.treatyType === 'founding') return;

  if (!components.dateOfSigning || components.dateOfSigning.trim().length === 0) {
    issues.push({
      id: uuid(),
      rule: 'R. 21.4.4',
      source: 'Bluebook',
      severity: 'error',
      message: 'Treaty citation must include the date of signing.',
      suggestion: 'Add the signing date (e.g., "Apr. 2, 1953").',
    });
    return;
  }

  const dateStr = components.dateOfSigning.trim();
  checkDateFormat(dateStr, 'R. 21.4.4', issues);

  if (rawText) {
    for (const [full, abbr] of Object.entries(T12_MONTHS)) {
      if (UNABBREVIATED_MONTHS.has(full)) continue;
      const fullPattern = new RegExp(`\\b${full}\\b`);
      if (fullPattern.test(rawText) && !rawText.includes(abbr)) {
        issues.push({
          id: uuid(),
          rule: 'R. 21.4.4 / T12',
          source: 'Bluebook',
          severity: 'warning',
          message: `Month "${full}" should be abbreviated as "${abbr}" in treaty citations (T12).`,
          suggestion: `Replace "${full}" with "${abbr}".`,
        });
      }
    }
  }

  if (components.enteredIntoForce) {
    const eifPattern = /^\(entered into force\s+/;
    if (!eifPattern.test(components.enteredIntoForce)) {
      issues.push({
        id: uuid(),
        rule: 'R. 21.4.4',
        source: 'Bluebook',
        severity: 'suggestion',
        message: 'Entry-into-force date should be in parenthetical format: "(entered into force [date])".',
        suggestion: 'Format as "(entered into force Nov. 16, 1994)".',
      });
    }
  }
}

/**
 * R. 21.4.5: Treaty source must be present and use recognized abbreviations.
 * Bilateral U.S. treaties: cite one U.S. source per hierarchy.
 * Multilateral U.S. treaties: cite one U.S. source + one international source.
 * Non-U.S. treaties: cite one international organization source.
 */
function checkTreatySource(components: TreatyComponents, issues: ValidationIssue[]): void {
  if (components.treatyType === 'founding') return;

  if (!components.sources || components.sources.length === 0) {
    issues.push({
      id: uuid(),
      rule: 'R. 21.4.5',
      source: 'Bluebook',
      severity: 'error',
      message: 'Treaty citation must include at least one source where the treaty can be found.',
      suggestion: 'Add a treaty source (e.g., "1577 U.N.T.S. 3" or "4 U.S.T. 2063").',
    });
    return;
  }

  for (const sourceStr of components.sources) {
    const trimmed = sourceStr.trim();
    if (trimmed.length === 0) continue;

    const hasRecognizedAbbr = Array.from(T4_TREATY_SOURCE_ABBREVIATIONS).some(
      abbr => trimmed.includes(abbr)
    );

    if (!hasRecognizedAbbr) {
      issues.push({
        id: uuid(),
        rule: 'R. 21.4.5',
        source: 'Bluebook',
        severity: 'warning',
        message: `Treaty source "${trimmed}" does not contain a recognized treaty source abbreviation (T4).`,
        suggestion: 'Use a recognized source abbreviation (e.g., U.N.T.S., U.S.T., T.I.A.S., Stat., L.N.T.S., I.L.M.).',
      });
    }
  }

  if (components.treatyType === 'multilateral') {
    const hasUsSource = components.sources.some(src =>
      src.includes('U.S.T.') || src.includes('Stat.') || src.includes('T.I.A.S.') ||
      src.includes('T.S.') || src.includes('E.A.S.') || src.includes('S. Treaty Doc.')
    );
    const hasIntlSource = components.sources.some(src =>
      src.includes('U.N.T.S.') || src.includes('L.N.T.S.') || src.includes('O.A.S.T.S.') ||
      src.includes('O.J.') || src.includes('E.T.S.') || src.includes('C.E.T.S.')
    );

    if (hasUsSource && !hasIntlSource && components.sources.length === 1) {
      issues.push({
        id: uuid(),
        rule: 'R. 21.4.5(a)(ii)',
        source: 'Bluebook',
        severity: 'suggestion',
        message: 'Multilateral treaties to which the U.S. is a party should cite one U.S. source plus one international source.',
        suggestion: 'Add a parallel citation to an international source (e.g., U.N.T.S.).',
      });
    }
  }
}

/**
 * R. 21.4.2: Bilateral treaties must list both parties abbreviated per T.10 in alphabetical order.
 * Multilateral treaties do not list parties.
 */
function checkTreatyParties(
  components: TreatyComponents,
  rawText: string | undefined,
  issues: ValidationIssue[]
): void {
  if (components.treatyType === 'bilateral') {
    if (!components.parties || components.parties.trim().length === 0) {
      issues.push({
        id: uuid(),
        rule: 'R. 21.4.2',
        source: 'Bluebook',
        severity: 'error',
        message: 'Bilateral treaty citation must include both parties (e.g., "Japan-U.S.").',
        suggestion: 'Add the parties abbreviated per T10, in alphabetical order, separated by a hyphen.',
      });
      return;
    }

    const parties = components.parties.trim();
    if (!parties.includes('-')) {
      issues.push({
        id: uuid(),
        rule: 'R. 21.4.2',
        source: 'Bluebook',
        severity: 'error',
        message: `Bilateral treaty parties "${parties}" should be separated by a hyphen (e.g., "Japan-U.S.").`,
        suggestion: 'Separate the two parties with a hyphen.',
      });
    } else {
      const [partyA, partyB] = parties.split('-').map(p => p.trim());
      if (partyA && partyB && partyA.localeCompare(partyB) > 0) {
        issues.push({
          id: uuid(),
          rule: 'R. 21.4.2',
          source: 'Bluebook',
          severity: 'warning',
          message: `Treaty parties should be in alphabetical order. "${partyB}-${partyA}" should precede "${partyA}-${partyB}".`,
          suggestion: `Reorder to "${partyB}-${partyA}".`,
        });
      }
    }
  }

  if (components.treatyType === 'multilateral' && components.parties) {
    issues.push({
      id: uuid(),
      rule: 'R. 21.4.2',
      source: 'Bluebook',
      severity: 'warning',
      message: 'Multilateral treaties should not list parties in the citation.',
      suggestion: 'Remove the parties designation from the citation.',
    });
  }
}

/**
 * R. 21.4.3: Subdivisions (articles, paragraphs) should use T.16 abbreviations.
 * When citing a subdivision, pincites to the treaty series are not necessary.
 */
function checkArticleSection(
  components: TreatyComponents,
  rawText: string | undefined,
  issues: ValidationIssue[]
): void {
  if (!rawText || !components.subdivision) return;

  for (const [term, abbr] of Object.entries(T16_SUBDIVISIONS)) {
    const fullPattern = new RegExp(`\\b${term}\\s+\\d`, 'i');
    const abbrPattern = new RegExp(`\\b${escapeRegex(abbr)}\\s*\\d`, 'i');

    if (fullPattern.test(rawText) && !abbrPattern.test(rawText)) {
      issues.push({
        id: uuid(),
        rule: 'R. 21.4.3 / T16',
        source: 'Bluebook',
        severity: 'warning',
        message: `Subdivision "${term}" should be abbreviated as "${abbr}" in treaty citations (T16).`,
        suggestion: `Replace "${term}" with "${abbr}".`,
      });
    }
  }

  if (/\bArticle\s+\d/i.test(rawText) && !/\bart\.\s*\d/i.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 21.4.3 / T16',
      source: 'Bluebook',
      severity: 'warning',
      message: '"Article" should be abbreviated as "art." in treaty citations (T16).',
      suggestion: 'Replace "Article" with "art.".',
    });
  }

  if (/\bParagraph\s+\d/i.test(rawText) && !/\b(?:para\.|¶)\s*\d/i.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 21.4.3 / T16',
      source: 'Bluebook',
      severity: 'warning',
      message: '"Paragraph" should be abbreviated as "para." or use "¶" in treaty citations (T16).',
      suggestion: 'Replace "Paragraph" with "¶" or "para.".',
    });
  }
}

function checkDateFormat(date: string, rule: string, issues: ValidationIssue[]): void {
  const dateStr = date.trim();
  if (dateStr.length === 0) return;

  // Allow date ranges for bilateral treaties with multiple signing dates (R. 21.4.4)
  if (dateStr.includes('–') || dateStr.includes('-')) {
    return;
  }

  // Allow "opened for signature" prefix (R. 21.4.4)
  const cleanDate = dateStr.replace(/^opened for signature\s+/i, '');

  const validDatePattern = /^(?:Jan\.|Feb\.|Mar\.|Apr\.|May|June|July|Aug\.|Sep\.|Oct\.|Nov\.|Dec\.)\s+\d{1,2},\s+\d{4}$/;
  if (!validDatePattern.test(cleanDate)) {
    const yearOnly = /^\d{4}$/.test(cleanDate);
    if (!yearOnly) {
      issues.push({
        id: uuid(),
        rule: `${rule} / T12`,
        source: 'Bluebook',
        severity: 'warning',
        message: `Date "${dateStr}" may not be in proper Bluebook format. Use abbreviated month, day, year (e.g., "Apr. 2, 1953").`,
        suggestion: 'Format the date as "Mon. Day, Year" with months abbreviated per T12.',
      });
    }
  }
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
