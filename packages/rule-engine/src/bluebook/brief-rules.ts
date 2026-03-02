import { v4 as uuid } from 'uuid';
import type { ValidationIssue, BriefComponents } from '@legalcitation/shared';
import { BT1_COURT_DOCUMENTS, BT1_NOT_ABBREVIATED } from '@legalcitation/shared';
import { T12_MONTHS, UNABBREVIATED_MONTHS } from '@legalcitation/shared';

/**
 * Bluebook B17 + R. 10.8.3 — Court Documents: Briefs, Motions, Petitions, Complaints.
 *
 * Validates brief/court filing citation formatting per the 22nd Edition.
 * Supports both 'law_review' and 'court_doc' styles.
 *
 * Full format: "Document Type at page, Case Name, No. docket (Court filed Date)."
 * Short form (B17.2): "Document Type at page."
 */
export function validateBrief(components: BriefComponents, rawText?: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  checkDocumentType(components, rawText, issues);
  checkPageReference(components, rawText, issues);
  checkCaseName(components, issues);
  checkDocketNumber(components, rawText, issues);
  checkCourtDate(components, rawText, issues);

  return issues;
}

/**
 * B17.1 / R. 10.8.3: Document name must be present and properly abbreviated per BT1.
 */
function checkDocumentType(
  components: BriefComponents,
  rawText: string | undefined,
  issues: ValidationIssue[]
): void {
  if (!components.documentType || components.documentType.trim().length === 0) {
    issues.push({
      id: uuid(),
      rule: 'B17.1',
      source: 'Bluebook',
      severity: 'error',
      message: 'Brief citation must include a document type (e.g., "Brief for Petitioner", "Memorandum in Support").',
      suggestion: 'Add the document name, abbreviated per BT1.',
    });
    return;
  }

  if (!rawText) return;

  for (const [full, abbr] of Object.entries(BT1_COURT_DOCUMENTS)) {
    if (BT1_NOT_ABBREVIATED.has(full)) continue;
    if (full === abbr) continue;

    const fullPattern = new RegExp(`\\b${escapeRegex(full)}\\b`, 'i');
    const abbrPattern = new RegExp(`\\b${escapeRegex(abbr)}\\b`);

    if (fullPattern.test(rawText) && !abbrPattern.test(rawText)) {
      issues.push({
        id: uuid(),
        rule: 'B17.1',
        source: 'Bluebook',
        severity: 'warning',
        message: `"${full}" should be abbreviated as "${abbr}" in court document citations (BT1).`,
        suggestion: `Replace "${full}" with "${abbr}".`,
      });
    }
  }
}

/**
 * B17.1.2: Page references use "at page" format.
 * Page references should not be preceded by "p." but should use "at" where customary.
 */
function checkPageReference(
  components: BriefComponents,
  rawText: string | undefined,
  issues: ValidationIssue[]
): void {
  if (!rawText) return;

  if (/\bp{1,2}\.\s*\d/.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'B17.1.2',
      source: 'Bluebook',
      severity: 'error',
      message: 'Do not use "p." or "pp." in court document citations. Use the page number directly or "at" before the page number.',
      suggestion: 'Remove "p." or "pp." and use "at" followed by the page number (e.g., "at 12").',
    });
  }

  if (components.pinCite) {
    const pinVal = components.pinCite.trim();
    if (/^\d/.test(pinVal) && !pinVal.startsWith('at ')) {
      const isLineRef = /^\d+:\d+/.test(pinVal);
      if (!isLineRef) {
        issues.push({
          id: uuid(),
          rule: 'B17.1.2',
          source: 'Bluebook',
          severity: 'suggestion',
          message: 'Brief page references customarily use "at" before the page number (e.g., "at 12").',
          suggestion: `Consider formatting as "at ${pinVal}".`,
        });
      }
    }
  }
}

/**
 * R. 10.8.3 / R. 10.2.1: Case name should be present in full citations.
 */
function checkCaseName(components: BriefComponents, issues: ValidationIssue[]): void {
  if (!components.caseName || components.caseName.trim().length === 0) {
    issues.push({
      id: uuid(),
      rule: 'R. 10.8.3',
      source: 'Bluebook',
      severity: 'warning',
      message: 'Full brief citation should include the case name unless it is clear from context.',
      suggestion: 'Add the case name (e.g., "Smith v. Jones").',
    });
  }
}

/**
 * R. 10.8.3: Docket number in "No. XX-XXXX" format.
 */
function checkDocketNumber(
  components: BriefComponents,
  rawText: string | undefined,
  issues: ValidationIssue[]
): void {
  if (!components.docketNumber) return;

  const docket = components.docketNumber.trim();

  if (docket.length > 0 && !docket.startsWith('No.')) {
    if (/^\d/.test(docket)) {
      issues.push({
        id: uuid(),
        rule: 'R. 10.8.3',
        source: 'Bluebook',
        severity: 'error',
        message: `Docket number "${docket}" should be preceded by "No." (e.g., "No. ${docket}").`,
        suggestion: `Change to "No. ${docket}".`,
      });
    }
  }

  if (rawText && /\bDocket\s+(?:Number|#)/i.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 10.8.3',
      source: 'Bluebook',
      severity: 'warning',
      message: 'Use "No." instead of "Docket Number" or "Docket #" for the docket number.',
      suggestion: 'Abbreviate to "No." followed by the docket number.',
    });
  }
}

/**
 * B17.1 / R. 10.8.3: Court and date parenthetical — "(Court filed Date)".
 * Validates court designation and date formatting per T.12.
 */
function checkCourtDate(
  components: BriefComponents,
  rawText: string | undefined,
  issues: ValidationIssue[]
): void {
  if (!components.court && !components.filedDate) {
    issues.push({
      id: uuid(),
      rule: 'B17.1',
      source: 'Bluebook',
      severity: 'suggestion',
      message: 'Consider including the court and filing date in a parenthetical (e.g., "(S. Ct. filed Jan. 1, 2024)").',
      suggestion: 'Add court designation and date.',
    });
    return;
  }

  if (components.filedDate) {
    checkDateFormat(components.filedDate, issues);
  }

  if (rawText) {
    for (const [full, abbr] of Object.entries(T12_MONTHS)) {
      if (UNABBREVIATED_MONTHS.has(full)) continue;
      const fullPattern = new RegExp(`\\b${full}\\b`);
      if (fullPattern.test(rawText) && !rawText.includes(abbr)) {
        issues.push({
          id: uuid(),
          rule: 'B17.1 / T12',
          source: 'Bluebook',
          severity: 'warning',
          message: `Month "${full}" should be abbreviated as "${abbr}" in citations (T12).`,
          suggestion: `Replace "${full}" with "${abbr}".`,
        });
      }
    }
  }
}

function checkDateFormat(date: string, issues: ValidationIssue[]): void {
  const dateStr = date.trim();
  if (dateStr.length === 0) return;

  const validDatePattern = /^(?:Jan\.|Feb\.|Mar\.|Apr\.|May|June|July|Aug\.|Sep\.|Oct\.|Nov\.|Dec\.)\s+\d{1,2},\s+\d{4}$/;
  if (!validDatePattern.test(dateStr)) {
    const yearOnly = /^\d{4}$/.test(dateStr);
    if (!yearOnly) {
      issues.push({
        id: uuid(),
        rule: 'B17.1 / T12',
        source: 'Bluebook',
        severity: 'warning',
        message: `Date "${dateStr}" may not be in proper Bluebook format. Use abbreviated month, day, year (e.g., "Jan. 1, 2024").`,
        suggestion: 'Format the date as "Mon. Day, Year" with months abbreviated per T12.',
      });
    }
  }
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
