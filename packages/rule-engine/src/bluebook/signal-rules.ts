import { v4 as uuid } from 'uuid';
import type { ValidationIssue, ParsedCitation } from '@legalcitation/shared';
import {
  SIGNALS,
  ALL_SIGNALS,
  SIGNAL_MAP,
  SIGNAL_TYPE_ORDER,
  type SignalInfo,
  type SignalType,
} from '@legalcitation/shared';

/**
 * B1.2 / R. 1.2–1.4 — Introductory Signals
 *
 * Validates:
 *   - Signal is a recognized Bluebook signal
 *   - Signal capitalization matches context (sentence vs. clause)
 *   - Signals requiring parentheticals have them (see also, cf., but cf., see generally, compare, contrast)
 *   - Compare/contrast signals include "with"
 *   - "But" is omitted from "but see" / "but cf." after another negative signal
 *   - Signal ordering within citation sentences (R. 1.3)
 */

// ── Single-citation signal checks ─────────────────────────────────

/**
 * Validate the signal used in a single citation.
 */
export function validateSignal(
  citation: ParsedCitation,
  rawText: string
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const trimmed = rawText.trim();

  const extracted = extractSignal(trimmed);
  if (!extracted) return issues; // No signal present — "[no signal]" is valid

  const { signal, signalInfo } = extracted;

  // B1.2: Capitalization — signals capitalized in citation sentences, lowercase in clauses
  if (citation.context === 'citation_sentence') {
    // First signal in a citation sentence should be capitalized
    if (signal.charAt(0) !== signal.charAt(0).toUpperCase() && isLetter(signal.charAt(0))) {
      issues.push({
        id: uuid(),
        rule: 'B1.2',
        source: 'Bluebook',
        severity: 'error',
        message: `The signal "${signal}" must be capitalized when it begins a citation sentence (B1.2).`,
        suggestion: `Capitalize: "${capitalize(signal)}"`,
      });
    }
  } else if (citation.context === 'citation_clause') {
    // Signals in citation clauses should be lowercase
    if (signal.charAt(0) === signal.charAt(0).toUpperCase() && isLetter(signal.charAt(0))) {
      issues.push({
        id: uuid(),
        rule: 'B1.2',
        source: 'Bluebook',
        severity: 'error',
        message: `The signal "${signal}" should be lowercase when used in a citation clause (B1.2).`,
        suggestion: `Use lowercase: "${signal.toLowerCase()}"`,
      });
    }
  }

  // R. 1.2: Required parenthetical for certain signals
  if (signalInfo.requiresParenthetical) {
    const hasExplanatoryParenthetical = hasExplanatory(trimmed);
    if (!hasExplanatoryParenthetical) {
      // Strict signals (see also, cf., but cf., see generally) are errors per R. 1.2
      const strictSignals = new Set(['see also', 'cf.', 'but cf.', 'see generally']);
      const isStrict = strictSignals.has(signalInfo.signal.toLowerCase());
      issues.push({
        id: uuid(),
        rule: 'R. 1.2',
        source: 'Bluebook',
        severity: isStrict ? 'error' : 'warning',
        message: `The signal "${signalInfo.signal}" requires an explanatory parenthetical to clarify the source's relevance (R. 1.2).`,
        suggestion: `Add a parenthetical, e.g.: ... ${signalInfo.signal} Source (explaining ...).`,
      });
    }
  }

  // R. 2.1(d): Signals must be italicized
  const signalText = trimmed.slice(0, signal.length);
  const beforeSignal = trimmed.slice(0, Math.max(0, trimmed.indexOf(signalText)));
  const afterSignalChar = trimmed.charAt(signal.length);
  const isWrappedInItalicMarkers =
    (beforeSignal.endsWith('*') && afterSignalChar === '*') ||
    (beforeSignal.endsWith('*') && trimmed.charAt(signal.length) === ' ');
  // Check for italic markers around the signal text
  const textBeforeSignal = trimmed.slice(0, 10);
  const hasItalicMarker = textBeforeSignal.includes('*') || /^<[ei]m?>/.test(textBeforeSignal) || /^<u>/.test(textBeforeSignal);
  if (!hasItalicMarker && signal.length > 0) {
    issues.push({
      id: uuid(),
      rule: 'R. 2.1(d)',
      source: 'Bluebook',
      severity: 'warning',
      message: `The signal "${signal}" should be italicized (R. 2.1(d)).`,
      suggestion: `Italicize the signal: "*${signal}*"`,
    });
  }

  // R. 1.2(b): "Compare" and "contrast" must include "with"
  if (signalInfo.signal === 'compare' || signalInfo.signal === 'contrast') {
    const lowerText = trimmed.toLowerCase();
    if (!lowerText.includes(' with ') && !lowerText.includes(', with ')) {
      issues.push({
        id: uuid(),
        rule: 'R. 1.2(b)',
        source: 'Bluebook',
        severity: 'error',
        message: `The signal "${signalInfo.signal}" must be used in conjunction with "with" (R. 1.2(b)). Format: ${capitalize(signalInfo.signal)} [authority], with [authority].`,
        suggestion: `Add "with" to complete the ${signalInfo.signal} construction.`,
      });
    }
  }

  // R. 1.2(f): Pincites required for all signals except "see generally"
  if (signalInfo.signal !== 'see generally' && signalInfo.signal !== '[no signal]') {
    // This is more of a reminder — actual pincite validation is in page-range-rules
    // We check if there's likely a pincite (comma + number after first page)
    // Skipping deep pincite validation here as it's handled elsewhere
  }

  return issues;
}

// ── Context-level signal checks (across multiple citations) ──────

/**
 * R. 1.3: Validate signal ordering across a citation sentence.
 * Signals of the same type must be grouped together.
 * Signals of different types must appear in separate citation sentences.
 * Within a citation clause, mixed signal types are allowed (separated by semicolons).
 */
export function validateSignalOrder(
  citations: ParsedCitation[]
): Map<string, ValidationIssue[]> {
  const issueMap = new Map<string, ValidationIssue[]>();

  // Group citations by their citation sentence/clause
  // For citation sentences, signals of the same type must be strung together
  // and different types must be in separate sentences
  const sentenceCitations = citations.filter(c => c.context === 'citation_sentence');

  let lastSignalType: SignalType | null = null;
  let lastSignalOrder = -1;

  for (const citation of sentenceCitations) {
    const extracted = extractSignal(citation.rawText.trim());
    if (!extracted) continue;

    const { signalInfo } = extracted;
    const currentType = signalInfo.type;
    const currentOrder = signalInfo.order;

    // R. 1.3: Signals must appear in the order listed in R. 1.2
    if (lastSignalOrder >= 0 && currentOrder < lastSignalOrder) {
      const issues = issueMap.get(citation.id) || [];
      issues.push({
        id: uuid(),
        rule: 'R. 1.3',
        source: 'Bluebook',
        severity: 'warning',
        message: `Signal "${signalInfo.signal}" appears out of order (R. 1.3). Signals should appear in the order listed in R. 1.2: supportive → comparative → contradictory → background.`,
        suggestion: 'Reorder signals to match the sequence in R. 1.2.',
      });
      issueMap.set(citation.id, issues);
    }

    // R. 1.3: Different signal types should be in separate citation sentences
    if (lastSignalType && currentType !== lastSignalType) {
      // Check if these are in the same citation sentence (adjacent with semicolons)
      // This is a heuristic — if both are citation_sentence context and appear to be
      // in the same sentence, flag it
      const issues = issueMap.get(citation.id) || [];
      issues.push({
        id: uuid(),
        rule: 'R. 1.3',
        source: 'Bluebook',
        severity: 'suggestion',
        message: `Signal "${signalInfo.signal}" (${currentType}) follows a "${lastSignalType}" signal. Signals of different types should generally appear in separate citation sentences (R. 1.3).`,
        suggestion: 'Start a new citation sentence for signals of a different type.',
      });
      issueMap.set(citation.id, issues);
    }

    lastSignalType = currentType;
    lastSignalOrder = currentOrder;
  }

  return issueMap;
}

/**
 * R. 1.2(c): Validate "but" omission.
 * "But" should be omitted from "but see" and "but cf." when one of these
 * signals follows another negative signal.
 */
export function validateButOmission(
  citations: ParsedCitation[]
): Map<string, ValidationIssue[]> {
  const issueMap = new Map<string, ValidationIssue[]>();

  let lastWasNegative = false;

  for (const citation of citations) {
    const extracted = extractSignal(citation.rawText.trim());
    if (!extracted) {
      lastWasNegative = false;
      continue;
    }

    const { signal, signalInfo } = extracted;
    const isNegativeSignal = signalInfo.type === 'contradictory';

    if (lastWasNegative && isNegativeSignal) {
      const lowerSignal = signal.toLowerCase();
      if (lowerSignal.startsWith('but ')) {
        const issues = issueMap.get(citation.id) || [];
        issues.push({
          id: uuid(),
          rule: 'R. 1.2(c)',
          source: 'Bluebook',
          severity: 'warning',
          message: `Omit "but" from "${signal}" when it follows another contradictory signal (R. 1.2(c)).`,
          suggestion: `Use "${signal.replace(/^[Bb]ut\s+/, '')}" instead of "${signal}".`,
        });
        issueMap.set(citation.id, issues);
      }
    }

    lastWasNegative = isNegativeSignal;
  }

  return issueMap;
}

// ── Helpers ──────────────────────────────────────────────────────

/**
 * Extract the signal from the beginning of a citation text.
 * Returns the matched signal text and its SignalInfo, or null if no signal.
 */
export function extractSignal(text: string): { signal: string; signalInfo: SignalInfo } | null {
  const lower = text.toLowerCase();

  // Sort by signal length descending so compound signals ("see, e.g.,") match before simple ones ("see")
  const sorted = [...ALL_SIGNALS]
    .filter(s => s.signal !== '[no signal]')
    .sort((a, b) => b.signal.length - a.signal.length);

  for (const s of sorted) {
    const signalLower = s.signal.toLowerCase();
    if (lower.startsWith(signalLower)) {
      const afterSignal = text.charAt(s.signal.length);
      // Signal must be followed by a space, end of string, or punctuation
      if (!afterSignal || afterSignal === ' ' || afterSignal === ',' || afterSignal === ';') {
        return {
          signal: text.slice(0, s.signal.length),
          signalInfo: s,
        };
      }
    }
  }

  return null;
}

function isLetter(ch: string): boolean {
  return /^[a-zA-Z]$/.test(ch);
}

/**
 * Detect if text contains an explanatory parenthetical (not just a court/year parenthetical).
 * Court parentheticals look like "(2d Cir. 2007)" or "(1803)".
 * Explanatory ones start with a present participle or a quoted sentence.
 */
function hasExplanatory(text: string): boolean {
  // Find all parentheticals
  const parens = text.match(/\([^)]+\)/g);
  if (!parens) return false;

  for (const paren of parens) {
    const inner = paren.slice(1, -1).trim();
    // Skip court/year parentheticals: "(2d Cir. 2007)", "(1803)", "(S.D.N.Y. 2010)"
    if (/^\d{4}$/.test(inner)) continue; // Just a year
    if (/^[A-Z]/.test(inner) && /\d{4}\)?$/.test(inner) && inner.length < 30) continue; // Court + year
    // Explanatory: starts with present participle (lowercase -ing word) or quoted text
    if (/^[a-z]/.test(inner) || inner.startsWith('"') || inner.startsWith('\u201C')) return true;
    // Also count longer parentheticals with descriptive content
    if (inner.length > 30) return true;
  }

  return false;
}

function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}
