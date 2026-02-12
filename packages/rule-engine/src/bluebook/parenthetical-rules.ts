import { v4 as uuid } from 'uuid';
import type { ValidationIssue, ParsedCitation } from '@legalcitation/shared';

/**
 * B1.3 / R. 1.5 — Explanatory Parentheticals
 *
 * Validates:
 *   - Explanatory parentheticals begin with a present participle (e.g., "holding", "explaining")
 *     unless they consist of a quoted sentence or a short descriptive statement.
 *   - Quoted-sentence parentheticals begin with a capital letter and end with appropriate punctuation.
 *   - Non-quoted parentheticals do NOT begin with a capital letter.
 *   - Non-quoted parentheticals do NOT end with a period.
 *   - Parentheticals appear before subsequent history.
 *   - R. 1.5(b): Order of multiple parentheticals.
 */

/**
 * Common present participles that start explanatory parentheticals.
 */
const COMMON_PARTICIPLES = new Set([
  'holding', 'finding', 'concluding', 'explaining', 'noting',
  'reasoning', 'stating', 'discussing', 'describing', 'analyzing',
  'applying', 'interpreting', 'recognizing', 'observing', 'requiring',
  'establishing', 'affirming', 'reversing', 'rejecting', 'adopting',
  'considering', 'determining', 'addressing', 'reviewing', 'quoting',
  'citing', 'upholding', 'overruling', 'distinguishing', 'extending',
  'limiting', 'defining', 'clarifying', 'arguing', 'asserting',
  'contending', 'maintaining', 'suggesting', 'proposing', 'providing',
  'granting', 'denying', 'allowing', 'barring', 'permitting',
  'prohibiting', 'mandating', 'ordering', 'declaring', 'announcing',
  'acknowledging', 'agreeing', 'disagreeing', 'dissenting', 'concurring',
  'emphasizing', 'highlighting', 'illustrating', 'demonstrating',
  'invalidating', 'validating', 'incorporating', 'enumerating',
  'listing', 'identifying', 'examining', 'evaluating', 'assessing',
  'setting', 'relying', 'reaffirming',
]);

/**
 * Parenthetical types that are NOT explanatory (court/procedural info).
 * These appear before the explanatory parenthetical per R. 1.5(b).
 */
const PROCEDURAL_PARENTHETICALS = [
  /^\d{4}$/, // Year only
  /^[A-Z].*\d{4}$/, // Court + year (e.g., "2d Cir. 2007")
  /^en banc$/i,
  /^per curiam$/i,
  /^plurality opinion$/i,
  /^[A-Z][a-z]+,\s+[A-Z]\.,\s*(concurring|dissenting|joining|writing)/,
  /^emphasis\s+(added|in original|omitted)$/i,
  /^footnote[s]?\s+omitted$/i,
  /^citation[s]?\s+omitted$/i,
  /^alteration[s]?\s+(in original|added|omitted)$/i,
  /^internal\s+(quotation marks?|citations?)\s+omitted$/i,
  /^quoting\s/,
  /^citing\s/,
  /^hereinafter\s/,
  /^last visited\s/,
  /^first\s.*;\s*(then|and then)\s/, // Multi-source quoting/citing per R. 1.5(b)
];

/**
 * Validate explanatory parentheticals in a citation.
 */
export function validateParenthetical(
  citation: ParsedCitation,
  rawText: string
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const trimmed = rawText.trim();

  // Extract all parentheticals from the citation
  const parentheticals = extractParentheticals(trimmed);
  if (parentheticals.length === 0) return issues;

  // Find explanatory parentheticals (filter out procedural ones)
  for (const paren of parentheticals) {
    const inner = paren.slice(1, -1).trim();
    if (!inner) continue;

    // Skip procedural/metadata parentheticals
    if (isProcedural(inner)) continue;

    // This is an explanatory parenthetical — validate it

    // B1.3 / R. 1.5(a)(ii): If it's a quoted sentence, it should start with a capital
    // and have closing punctuation
    if (isQuotedSentence(inner)) {
      validateQuotedParenthetical(inner, issues);
      continue;
    }

    // B1.3 / R. 1.5(a)(i): Non-quoted explanatory parentheticals
    validateNonQuotedParenthetical(inner, issues);
  }

  return issues;
}

/**
 * R. 1.5(b): Validate the order of multiple parentheticals.
 * Order: (date) [hereinafter] (en banc) (Justice, concurring) (plurality)
 *        (per curiam) (alteration) (emphasis added) (footnote omitted)
 *        (citations omitted) (quoting...) (citing...) (explanatory), history.
 */
export function validateParentheticalOrder(
  rawText: string
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const parentheticals = extractParentheticals(rawText);
  if (parentheticals.length < 2) return issues;

  let foundExplanatory = false;
  for (let i = 0; i < parentheticals.length; i++) {
    const inner = parentheticals[i].slice(1, -1).trim();
    if (isProcedural(inner)) {
      if (foundExplanatory) {
        issues.push({
          id: uuid(),
          rule: 'R. 1.5(b)',
          source: 'Bluebook',
          severity: 'warning',
          message: `Procedural parenthetical "${inner}" appears after an explanatory parenthetical (R. 1.5(b)). Procedural parentheticals should precede explanatory ones.`,
          suggestion: 'Reorder parentheticals: procedural information before explanatory information.',
        });
      }
    } else {
      foundExplanatory = true;
    }
  }

  return issues;
}

// ── Validation helpers ──────────────────────────────────────────

function validateQuotedParenthetical(inner: string, issues: ValidationIssue[]): void {
  // Remove surrounding quotes to check content
  const unquoted = inner.replace(/^[""\u201C]/, '').replace(/[""\u201D][.)]*$/, '');

  // Quoted sentences should start with a capital letter (or bracket alteration like "[T]")
  const firstContentChar = unquoted.replace(/^\[/, '').charAt(0);
  if (firstContentChar && firstContentChar !== firstContentChar.toUpperCase() && /[a-zA-Z]/.test(firstContentChar)) {
    issues.push({
      id: uuid(),
      rule: 'R. 1.5(a)(ii)',
      source: 'Bluebook',
      severity: 'warning',
      message: 'A parenthetical quoting a full sentence should begin with a capital letter (R. 1.5(a)(ii)).',
      suggestion: 'Capitalize the first letter of the quoted sentence, or use a bracket alteration: "[L]etter".',
    });
  }
}

function validateNonQuotedParenthetical(inner: string, issues: ValidationIssue[]): void {
  const firstChar = inner.charAt(0);

  // B1.3 / R. 1.5(a)(i): Should not begin with a capital letter
  if (firstChar === firstChar.toUpperCase() && /[A-Z]/.test(firstChar)) {
    issues.push({
      id: uuid(),
      rule: 'B1.3',
      source: 'Bluebook',
      severity: 'warning',
      message: `Explanatory parenthetical should not begin with a capital letter (B1.3 / R. 1.5(a)(i)). Begin with a present participle in lowercase, e.g., "(holding that ...)".`,
      suggestion: `Change to lowercase: "(${firstChar.toLowerCase()}${inner.slice(1, 30)}…)"`,
    });
  }

  // B1.3 / R. 1.5(a)(i): Should begin with a present participle
  const firstWord = inner.split(/\s/)[0].toLowerCase().replace(/[^a-z]/g, '');
  if (firstWord && !firstWord.endsWith('ing') && !COMMON_PARTICIPLES.has(firstWord)) {
    // Only flag if it's not a short descriptive phrase (those are allowed)
    const wordCount = inner.split(/\s+/).length;
    if (wordCount > 3) {
      issues.push({
        id: uuid(),
        rule: 'B1.3',
        source: 'Bluebook',
        severity: 'suggestion',
        message: `Explanatory parenthetical should generally begin with a present participle (B1.3 / R. 1.5(a)(i)), e.g., "holding," "explaining," "noting."`,
        suggestion: `Consider rephrasing to start with a present participle: "(holding that ...)".`,
      });
    }
  }

  // Should not end with a period (unless it's quoted material)
  if (inner.endsWith('.') && !inner.includes('"') && !inner.includes('\u201D')) {
    issues.push({
      id: uuid(),
      rule: 'B1.3',
      source: 'Bluebook',
      severity: 'warning',
      message: 'Non-quoted explanatory parenthetical should not end with a period (B1.3).',
      suggestion: 'Remove the trailing period from the parenthetical.',
    });
  }
}

// ── Extraction helpers ──────────────────────────────────────────

/**
 * Extract all parenthetical groups from citation text.
 * Handles nested parentheticals per R. 1.5(b).
 */
function extractParentheticals(text: string): string[] {
  const result: string[] = [];
  let depth = 0;
  let start = -1;

  for (let i = 0; i < text.length; i++) {
    if (text[i] === '(') {
      if (depth === 0) start = i;
      depth++;
    } else if (text[i] === ')') {
      depth--;
      if (depth === 0 && start >= 0) {
        result.push(text.slice(start, i + 1));
        start = -1;
      }
    }
  }

  return result;
}

function isProcedural(inner: string): boolean {
  return PROCEDURAL_PARENTHETICALS.some(pattern => pattern.test(inner));
}

function isQuotedSentence(inner: string): boolean {
  // Starts with a quote character and contains substantial text
  return /^[""\u201C]/.test(inner) && inner.length > 10;
}
