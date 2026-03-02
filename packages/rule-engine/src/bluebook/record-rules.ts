import { v4 as uuid } from 'uuid';
import type { ValidationIssue, RecordComponents } from '@legalcitation/shared';
import { T12_MONTHS, UNABBREVIATED_MONTHS } from '@legalcitation/shared';

/**
 * Bluebook B17 + R. 10.8.3 — Records & Transcripts.
 *
 * Validates record/transcript citation formatting per the 22nd Edition.
 * Supports both 'law_review' and 'court_doc' styles.
 *
 * Full format: "Document Type at page, Case Name, No. docket (Court Date)."
 * Short form (B17.2): "Document Type at page."
 */
export function validateRecord(components: RecordComponents, rawText?: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  checkDocumentType(components, rawText, issues);
  checkPageReference(components, rawText, issues);
  checkCaseContext(components, issues);
  checkCourtDate(components, rawText, issues);

  return issues;
}

/**
 * Standard record/transcript abbreviations per BT1 and B17.1.1.
 * "Record" is always abbreviated to "R." in appellate litigation.
 */
const RECORD_TYPE_ABBREVIATIONS: Record<string, string> = {
  'Trial Transcript': 'Trial Tr.',
  'Deposition Transcript': 'Dep. Tr.',
  'Deposition': 'Dep.',
  'Record': 'R.',
  'Record on Appeal': 'R.',
  'Hearing Transcript': "Hr'g Tr.",
  'Joint Appendix': 'J.A.',
  'Appendix': 'App.',
  'Transcript': 'Tr.',
  'Affidavit': 'Aff.',
  'Declaration': 'Decl.',
  'Exhibit': 'Ex.',
};

/**
 * B17.1 / R. 10.8.3: Document type must be present and properly abbreviated.
 */
function checkDocumentType(
  components: RecordComponents,
  rawText: string | undefined,
  issues: ValidationIssue[]
): void {
  if (!components.documentType || components.documentType.trim().length === 0) {
    issues.push({
      id: uuid(),
      rule: 'B17.1',
      source: 'Bluebook',
      severity: 'error',
      message: 'Record citation must include a document type (e.g., "Trial Tr.", "R.", "Dep.").',
      suggestion: 'Add the document type, abbreviated per BT1.',
    });
    return;
  }

  if (!rawText) return;

  for (const [full, abbr] of Object.entries(RECORD_TYPE_ABBREVIATIONS)) {
    if (full === abbr) continue;
    const fullPattern = new RegExp(`\\b${escapeRegex(full)}\\b`, 'i');
    const abbrPattern = new RegExp(`\\b${escapeRegex(abbr)}\\b`);

    if (fullPattern.test(rawText) && !abbrPattern.test(rawText)) {
      issues.push({
        id: uuid(),
        rule: 'B17.1.1',
        source: 'Bluebook',
        severity: 'warning',
        message: `"${full}" should be abbreviated as "${abbr}" in record citations (BT1 / B17.1.1).`,
        suggestion: `Replace "${full}" with "${abbr}".`,
      });
    }
  }
}

/**
 * B17.1.2 / R. 10.8.3: Page references use "at page" format.
 * Separate page and line references by a colon (e.g., "15:21–16:4").
 * It is customary to use "at" in references to appellate records (e.g., "R. at 5").
 */
function checkPageReference(
  components: RecordComponents,
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
      message: 'Do not use "p." or "pp." in record citations. Use the page number directly or "at" before the page number.',
      suggestion: 'Remove "p." or "pp." and use "at" followed by the page number.',
    });
  }

  if (components.pinCite) {
    const pinVal = components.pinCite.trim();
    const isLineRef = /^\d+:\d+/.test(pinVal);
    const isParaRef = /^¶/.test(pinVal);

    if (/^\d/.test(pinVal) && !pinVal.startsWith('at ') && !isLineRef && !isParaRef) {
      const docType = components.documentType?.trim() || '';
      const isAppellateRecord = /^R\.?$/i.test(docType) || /Record/i.test(docType);

      if (isAppellateRecord) {
        issues.push({
          id: uuid(),
          rule: 'B17.1.2',
          source: 'Bluebook',
          severity: 'error',
          message: 'Appellate record references must use "at" before the page number (e.g., "R. at 5").',
          suggestion: `Change to "at ${pinVal}".`,
        });
      } else {
        issues.push({
          id: uuid(),
          rule: 'B17.1.2',
          source: 'Bluebook',
          severity: 'suggestion',
          message: 'Record page references customarily use "at" before the page number.',
          suggestion: `Consider formatting as "at ${pinVal}".`,
        });
      }
    }
  }
}

/**
 * R. 10.8.3: Case name and docket number should be included unless obvious from context.
 */
function checkCaseContext(components: RecordComponents, issues: ValidationIssue[]): void {
  if (!components.caseName && !components.docketNumber) {
    issues.push({
      id: uuid(),
      rule: 'R. 10.8.3',
      source: 'Bluebook',
      severity: 'suggestion',
      message: 'Record citation should include the case name and docket number unless clear from context.',
      suggestion: 'Add the case name and docket number for full citations (e.g., "Smith v. Jones, No. 22-123").',
    });
  }
}

/**
 * R. 10.8.3: Court and date in parenthetical.
 * Validates date formatting per T.12.
 */
function checkCourtDate(
  components: RecordComponents,
  rawText: string | undefined,
  issues: ValidationIssue[]
): void {
  if (!components.court && !components.date) {
    issues.push({
      id: uuid(),
      rule: 'R. 10.8.3',
      source: 'Bluebook',
      severity: 'suggestion',
      message: 'Consider including the court and date in a parenthetical (e.g., "(D. Mass. Jan. 1, 2024)").',
      suggestion: 'Add court designation and date for full citations.',
    });
    return;
  }

  if (components.date) {
    checkDateFormat(components.date, issues);
  }

  if (rawText) {
    for (const [full, abbr] of Object.entries(T12_MONTHS)) {
      if (UNABBREVIATED_MONTHS.has(full)) continue;
      const fullPattern = new RegExp(`\\b${full}\\b`);
      if (fullPattern.test(rawText) && !rawText.includes(abbr)) {
        issues.push({
          id: uuid(),
          rule: 'R. 10.8.3 / T12',
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
        rule: 'R. 10.8.3 / T12',
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
