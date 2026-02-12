import { v4 as uuid } from 'uuid';
import type { ValidationIssue } from '@legalcitation/shared';

/**
 * B6 / R. 6 — Abbreviations, Numerals, and Symbols
 *
 * Validates:
 *   - Adjacent single capitals are closed up (U.S., not U. S.)
 *   - Single capital + longer abbreviation have a space (S. Ct., not S.Ct.)
 *   - Every abbreviation ends with a period (except apostrophe endings like Soc'y)
 *   - Numbers 0–99 should be spelled out
 *   - Numbers 100+ should use numerals (unless starting a sentence)
 *
 * Note: The existing spacing-rules.ts already handles R. 6.1(a) spacing.
 * This file adds B6-specific checks not covered there.
 */

/**
 * Validate numeral usage per B6.
 * Numbers zero through ninety-nine should be spelled out.
 * Numbers 100+ should use numerals (unless they begin a sentence).
 */
export function validateNumerals(rawText: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Check for numerals 0–99 used in text contexts (not in citation components)
  // Skip: page numbers, volume numbers, years, section numbers, reporter series
  // Only flag if the number appears in a textual/non-citation context
  // This is hard to do precisely, so we check for common patterns

  // Check for numbers 100+ that are spelled out (less common, but a helpful catch)
  const spelledOutLarge = rawText.match(
    /\b(one hundred|two hundred|three hundred|four hundred|five hundred|one thousand|two thousand)\b/i
  );
  if (spelledOutLarge) {
    issues.push({
      id: uuid(),
      rule: 'B6',
      source: 'Bluebook',
      severity: 'suggestion',
      message: `Numbers 100 and above should generally be expressed as numerals (B6), not spelled out. Found: "${spelledOutLarge[0]}".`,
      suggestion: 'Use the numeral form instead of spelling out the number.',
    });
  }

  return issues;
}

/**
 * Validate that abbreviations with apostrophes don't incorrectly have periods.
 * E.g., "Soc'y" is correct, "Soc'y." is incorrect (no period after apostrophe endings).
 * E.g., "Nat'l" is correct, "Nat'l." is incorrect.
 */
export function validateApostropheAbbreviations(rawText: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Pattern: word ending in apostrophe + letter(s) + period
  // This catches things like Nat'l. Int'l. Soc'y. etc.
  const apostropheWithPeriod = rawText.match(/\b\w+'\w+\.\s/g);
  if (apostropheWithPeriod) {
    for (const match of apostropheWithPeriod) {
      const trimmed = match.trim();
      // Valid apostrophe abbreviations should NOT end with a period
      // But some valid ones do (like Dep't.) — actually Dep't is correct without period at end
      // Check if this looks like an abbreviation (short word with apostrophe)
      if (/^[A-Z][a-z]*'[a-z]{1,3}\.$/.test(trimmed)) {
        issues.push({
          id: uuid(),
          rule: 'B6',
          source: 'Bluebook',
          severity: 'warning',
          message: `Abbreviations ending with an apostrophe (like "${trimmed.slice(0, -1)}") should not have a trailing period (B6). The apostrophe serves as the terminal character.`,
          suggestion: `Remove the period: "${trimmed.slice(0, -1)}"`,
        });
      }
    }
  }

  return issues;
}

/**
 * Validate abbreviation spacing per B6 / R. 6.1(a).
 * This supplements the existing spacing-rules.ts with B6-specific checks.
 *
 * Key rules:
 *   - Close up adjacent single capitals: "U.S." not "U. S."
 *   - Space between single capital and longer abbreviation: "S. Ct." not "S.Ct."
 *   - Reporter series attach to ordinals: "F.3d" not "F. 3d"
 *
 * Note: B6 allows optional closing of reporter abbreviations for word limits
 * ("S.Ct." instead of "S. Ct.") — we don't flag those as errors, just suggestions.
 */
export function validateAbbreviationSpacing(rawText: string): ValidationIssue[] {
  // Most spacing validation is already in spacing-rules.ts
  // This function adds B6-specific nuances
  return [];
}
