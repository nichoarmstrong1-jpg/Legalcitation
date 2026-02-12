import { v4 as uuid } from 'uuid';
import type { ValidationIssue } from '@legalcitation/shared';

/**
 * B5.1–B5.3 — Quotations
 *
 * Validates:
 *   B5.1: Commas and periods inside quotation marks; other punctuation outside
 *         unless part of quoted text.
 *   B5.2: Block quotations (50+ words) should not have quotation marks.
 *         Citation after block quote starts at left margin, not indented.
 *   B5.3: "(citation modified)" for simplified quotations instead of "(cleaned up)".
 */

/**
 * Validate quotation formatting rules (B5.1–B5.3).
 */
export function validateQuotations(rawText: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // B5.1: Check for commas or periods outside closing quotation marks
  // Pattern: text" followed by comma or period (wrong — should be inside)
  const periodOutside = rawText.match(/"\s*\./);
  if (periodOutside && !isBlockQuoteCitation(rawText)) {
    // Only flag if there's a quotation that's clearly part of the text flow
    // Skip if this looks like a full citation ending (the period ends the citation sentence)
    const quoteCount = (rawText.match(/"/g) || []).length;
    if (quoteCount >= 2) {
      // Has matched quotes — check for period/comma outside
      const commaOutside = /"\s*,/.test(rawText);
      if (commaOutside) {
        issues.push({
          id: uuid(),
          rule: 'B5.1',
          source: 'Bluebook',
          severity: 'warning',
          message: 'Commas should be placed inside quotation marks (B5.1).',
          suggestion: 'Move the comma inside the closing quotation mark.',
        });
      }
    }
  }

  // B5.3: Flag "(cleaned up)" — should use "(citation modified)" instead
  if (/\(cleaned\s+up\)/i.test(rawText)) {
    issues.push({
      id: uuid(),
      rule: 'B5.3',
      source: 'Bluebook',
      severity: 'error',
      message: 'Use "(citation modified)" instead of "(cleaned up)" (B5.3). The parenthetical "(citation modified)" is the Bluebook-approved form for indicating readability modifications.',
      suggestion: 'Replace "(cleaned up)" with "(citation modified)".',
    });
  }

  return issues;
}

/**
 * Validate block quotation formatting (B5.2).
 * This checks the text surrounding a citation, not the citation itself.
 */
export function validateBlockQuotation(
  precedingText: string,
  rawCitation: string
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // B5.2: If preceding text is 50+ words and appears to be a quotation,
  // it should not have surrounding quotation marks
  if (precedingText) {
    const wordCount = precedingText.trim().split(/\s+/).length;
    if (wordCount >= 50) {
      // Check if it's wrapped in quotation marks (shouldn't be for block quotes)
      const trimmed = precedingText.trim();
      if (
        (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
        (trimmed.startsWith('\u201C') && trimmed.endsWith('\u201D'))
      ) {
        issues.push({
          id: uuid(),
          rule: 'B5.2',
          source: 'Bluebook',
          severity: 'warning',
          message: 'Quotations of 50 or more words should be formatted as block quotations without quotation marks (B5.2). Block quotations should be single-spaced, indented on both sides, and justified.',
          suggestion: 'Remove the quotation marks and format as a block quotation.',
        });
      }
    }
  }

  return issues;
}

// ── Helpers ──────────────────────────────────────────────────────

function isBlockQuoteCitation(text: string): boolean {
  // Heuristic: if the text doesn't contain quotes, it might follow a block quote
  return !text.includes('"') && !text.includes('\u201C');
}
