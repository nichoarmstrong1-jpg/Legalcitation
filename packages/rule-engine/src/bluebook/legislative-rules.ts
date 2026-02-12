import { v4 as uuid } from 'uuid';
import type { ValidationIssue } from '@legalcitation/shared';

/**
 * Validate legislative material citations against Bluebook Rule 13.
 *
 * R. 13 covers:
 *   - Bills and resolutions (R. 13.2)
 *   - Committee hearings (R. 13.3)
 *   - Reports, documents, and committee prints (R. 13.4)
 *   - Floor debates (R. 13.5)
 *   - Separately bound legislative histories (R. 13.6)
 *
 * Key formatting requirements:
 *   - Include abbreviated house name, Congress number, material number, year
 *   - Abbreviate per Table T9
 *   - Use ordinal Congress numbers (e.g., "105th Cong.")
 */
export function validateLegislativeMaterial(rawText: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Only run checks if text looks like a legislative citation
  if (!isLegislativeMaterial(rawText)) return issues;

  checkCongressFormat(rawText, issues);
  checkHouseAbbreviations(rawText, issues);
  checkReportFormat(rawText, issues);
  checkCongressionalRecordFormat(rawText, issues);
  checkHearingFormat(rawText, issues);

  return issues;
}

/**
 * Heuristic: does the raw text look like a legislative material citation?
 */
function isLegislativeMaterial(rawText: string): boolean {
  return /\bCong\b|\bH\.R\.\b|\bS\.\s*(Res|Rep|Doc|J)\b|\bCong\.\s*Rec\b|\bHearing\b|\bComm\.\s*Print\b/i.test(rawText);
}

function checkCongressFormat(rawText: string, issues: ValidationIssue[]): void {
  // Congress number should use ordinals (e.g., "105th Cong.")
  if (/\bCong\b/i.test(rawText) && !/\bCong\.\b/.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 13',
      source: 'Bluebook',
      severity: 'error',
      message: '"Congress" should be abbreviated as "Cong." with a period.',
      suggestion: 'Use "Cong." — e.g., "105th Cong."',
    });
  }

  // Check for spelled-out ordinal: "One Hundred Fifth Congress"
  if (/\bCongress\b/i.test(rawText) && !/\bCong\.\b/.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 13',
      source: 'Bluebook',
      severity: 'error',
      message: '"Congress" should be abbreviated as "Cong." in citations.',
      suggestion: 'Abbreviate to "Cong." — e.g., "105th Cong."',
    });
  }
}

function checkHouseAbbreviations(rawText: string, issues: ValidationIssue[]): void {
  // "House" should be "H.R." or "H." depending on context
  if (/\bHouse of Representatives\b/i.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 13 / T9',
      source: 'Bluebook',
      severity: 'error',
      message: '"House of Representatives" should be abbreviated in citations.',
      suggestion: 'Use "H.R." for bills or "H." for committees — e.g., "H.R. 3224" or "H. Comm."',
    });
  }

  // "Senate" should be "S." in citations
  if (/\bSenate\b/i.test(rawText) && !/\bS\.\b/.test(rawText)) {
    // Exception: "Senate" in hearing titles is acceptable
    if (!/Hearing\b/i.test(rawText)) {
      issues.push({
        id: uuid(),
        rule: 'R. 13 / T9',
        source: 'Bluebook',
        severity: 'warning',
        message: '"Senate" should typically be abbreviated as "S." in legislative citations.',
        suggestion: 'Use "S." — e.g., "S. 1234" or "S. Rep."',
      });
    }
  }

  // "Committee" should be "Comm."
  if (/\bCommittee\b/i.test(rawText) && !/\bComm\.\b/.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 13 / T9',
      source: 'Bluebook',
      severity: 'error',
      message: '"Committee" should be abbreviated as "Comm." in citations.',
      suggestion: 'Use "Comm." — e.g., "H. Comm. on the Judiciary".',
    });
  }

  // "Subcommittee" should be "Subcomm."
  if (/\bSubcommittee\b/i.test(rawText) && !/\bSubcomm\.\b/.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 13 / T9',
      source: 'Bluebook',
      severity: 'error',
      message: '"Subcommittee" should be abbreviated as "Subcomm." in citations.',
      suggestion: 'Use "Subcomm." — e.g., "Subcomm. on the Constitution".',
    });
  }
}

function checkReportFormat(rawText: string, issues: ValidationIssue[]): void {
  // Reports should use "No." format: "H.R. Rep. No. 101-524"
  if (/\b(H\.R\.|S\.)\s*Rep\./i.test(rawText) && !/\bNo\.\b/.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 13.4',
      source: 'Bluebook',
      severity: 'warning',
      message: 'Congressional reports should include "No." followed by the Congress number and report number.',
      suggestion: 'Use "H.R. Rep. No. 101-524" or "S. Rep. No. 86-187" format.',
    });
  }

  // "Report" should be abbreviated "Rep."
  if (/\bReport\b/i.test(rawText) && !/\bRep\.\b/.test(rawText) && /\bCong\.\b/.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 13 / T9',
      source: 'Bluebook',
      severity: 'error',
      message: '"Report" should be abbreviated as "Rep." in legislative citations.',
      suggestion: 'Use "Rep." — e.g., "H.R. Rep. No. 101-524".',
    });
  }

  // "Document" should be abbreviated "Doc."
  if (/\bDocument\b/i.test(rawText) && !/\bDoc\.\b/.test(rawText) && /\bCong\.\b/.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 13 / T9',
      source: 'Bluebook',
      severity: 'error',
      message: '"Document" should be abbreviated as "Doc." in legislative citations.',
      suggestion: 'Use "Doc." — e.g., "H.R. Doc. No. 102-399".',
    });
  }
}

function checkCongressionalRecordFormat(rawText: string, issues: ValidationIssue[]): void {
  // "Congressional Record" should be "Cong. Rec."
  if (/\bCongressional Record\b/i.test(rawText) && !/\bCong\.\s*Rec\.\b/.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'R. 13.5',
      source: 'Bluebook',
      severity: 'error',
      message: '"Congressional Record" should be abbreviated as "Cong. Rec." in citations.',
      suggestion: 'Use "Cong. Rec." — e.g., "145 Cong. Rec. H1817".',
    });
  }

  // Daily edition should include "(daily ed. [date])"
  if (/\bCong\.\s*Rec\.\b/.test(rawText) && !/\bdaily ed\.\b/i.test(rawText) && !/\bbound\b/i.test(rawText)) {
    // Most modern Cong. Rec. citations are to the daily edition
    issues.push({
      id: uuid(),
      rule: 'R. 13.5',
      source: 'Bluebook',
      severity: 'suggestion',
      message: 'Congressional Record citations typically include "(daily ed. [date])" for the daily edition.',
      suggestion: 'Add "(daily ed. Apr. 12, 1999)" if citing the daily edition.',
    });
  }
}

function checkHearingFormat(rawText: string, issues: ValidationIssue[]): void {
  // Hearings should include "Hearing Before" or "Hearings Before"
  if (/\bHearing\b/i.test(rawText) && /\bCong\.\b/.test(rawText)) {
    if (!/\bHearings?\s+Before\b/i.test(rawText) && !/\bHearings?\s+on\b/i.test(rawText)) {
      issues.push({
        id: uuid(),
        rule: 'R. 13.3',
        source: 'Bluebook',
        severity: 'suggestion',
        message: 'Committee hearing citations should typically include "Hearing Before" or "Hearings Before" followed by the committee name.',
        suggestion: 'Format as "[Title]: Hearing Before the [Subcomm./Comm.], [Cong.] [page] ([year])".',
      });
    }
  }
}
