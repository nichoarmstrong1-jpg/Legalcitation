import { v4 as uuid } from 'uuid';
import type { ValidationIssue, ParsedCitation, CitationContext } from '@legalcitation/shared';
import { SIGNALS } from '@legalcitation/shared';

/**
 * B1.1 — Citation Sentences and Clauses
 *
 * Validates the structural form of a citation:
 *   - Citation sentences begin with a capital letter and end with a period.
 *   - Citation clauses are set off by commas and do NOT begin with a capital
 *     letter (unless the source would otherwise be capitalized) and do NOT end
 *     with a period (unless it is the last clause in the sentence).
 */

/**
 * Signals that are always capitalized (proper nouns, start of sentences, etc.)
 * — these are allowed to begin citation clauses with a capital letter.
 */
const INHERENTLY_CAPITALIZED_STARTS = new Set([
  'In re',
  'Ex parte',
  'United States',
  'Id.',
]);

/**
 * Signals that legitimately start citation clauses with lowercase.
 */
const LOWERCASE_SIGNALS = new Set(
  SIGNALS.filter(s => s.signal !== '[no signal]').map(s => s.signal.toLowerCase())
);

/**
 * Validate citation sentence formatting (B1.1).
 *
 * A citation sentence:
 *   - Begins with a capital letter
 *   - Ends with a period
 *   - May contain multiple citations separated by semicolons
 */
export function validateCitationSentence(
  citation: ParsedCitation,
  rawSentence: string
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (citation.context !== 'citation_sentence') return issues;

  const normalized = normalizeForFormChecks(rawSentence);
  if (!normalized) return issues;

  // B1.1: Citation sentence must begin with a capital letter
  const firstChar = normalized.charAt(0);
  if (firstChar !== firstChar.toUpperCase() || !isLetter(firstChar)) {
    // Check if it starts with a signal that is inherently lowercase (e.g., "see")
    const startsWithSignal = signalAtStart(normalized);
    if (!startsWithSignal) {
      issues.push({
        id: uuid(),
        rule: 'B1.1',
        source: 'Bluebook',
        severity: 'error',
        message:
          'A citation sentence must begin with a capital letter (B1.1). Citation sentences are standalone sentences that cite authority for the entire preceding proposition.',
        suggestion: `Capitalize the first letter: "${firstChar.toUpperCase()}${normalized.slice(1, 20)}…"`,
      });
    }
  }

  // B1.1: Citation sentence must end with a period
  if (!normalized.endsWith('.')) {
    // #region agent log
    fetch('http://127.0.0.1:7472/ingest/c1a4ccbe-c7b9-4841-b61e-69a7587183b0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'9e31dc'},body:JSON.stringify({sessionId:'9e31dc',runId:'pre-fix',hypothesisId:'H7',location:'packages/rule-engine/src/bluebook/citation-form-rules.ts:74',message:'Citation sentence flagged missing period',data:{citationType:citation.type,rawSentence:rawSentence.slice(0,140),normalized},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    issues.push({
      id: uuid(),
      rule: 'B1.1',
      source: 'Bluebook',
      severity: 'error',
      message:
        'A citation sentence must end with a period (B1.1). Each citation sentence is a complete sentence of its own.',
      suggestion: 'Add a period at the end of the citation sentence.',
    });
  }

  return issues;
}

/**
 * Validate citation clause formatting (B1.1).
 *
 * A citation clause:
 *   - Is set off from the surrounding text by commas
 *   - Does NOT begin with a capital letter (unless the source is inherently capitalized)
 *   - Does NOT end with a period (unless it is the last clause in the sentence)
 */
export function validateCitationClause(
  citation: ParsedCitation,
  rawClause: string,
  isLastClauseInSentence: boolean
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (citation.context !== 'citation_clause') return issues;

  const normalized = normalizeForFormChecks(rawClause);
  if (!normalized) return issues;

  // B1.1: Citation clause should NOT begin with a capital letter
  // (unless the source is inherently capitalized, e.g., a case name or "Id.")
  const firstChar = normalized.charAt(0);
  if (isLetter(firstChar) && firstChar === firstChar.toUpperCase()) {
    // Allow if starts with an inherently capitalized term
    const startsCapitalized = [...INHERENTLY_CAPITALIZED_STARTS].some(term =>
      normalized.startsWith(term)
    );
    // Allow if starts with a case name (party name — always capitalized)
    const startsWithCaseName =
      citation.type === 'case' || citation.type === 'short_form';

    if (!startsCapitalized && !startsWithCaseName) {
      // Check if it's a signal that should be lowercase in a clause
      const signalMatch = signalAtStart(normalized);
      if (signalMatch) {
        issues.push({
          id: uuid(),
          rule: 'B1.1',
          source: 'Bluebook',
          severity: 'warning',
          message: `In a citation clause, do not capitalize the signal "${signalMatch}" unless it begins a sentence (B1.1).`,
          suggestion: `Use lowercase: "${signalMatch.toLowerCase()}"`,
        });
      }
    }
  }

  // B1.1: Citation clause should NOT end with a period (unless last clause in sentence)
  if (normalized.endsWith('.') && !isLastClauseInSentence) {
    issues.push({
      id: uuid(),
      rule: 'B1.1',
      source: 'Bluebook',
      severity: 'error',
      message:
        'A citation clause should not end with a period unless it is the last clause in the sentence (B1.1). Citation clauses are set off by commas within a sentence.',
      suggestion: 'Remove the trailing period, or use a semicolon to separate from the next citation.',
    });
  }

  return issues;
}

/**
 * Validate semicolon-separated citations within a citation sentence (B1.1).
 *
 * When a citation sentence contains multiple authorities, they are separated
 * by semicolons. Each authority after the first should begin lowercase
 * (unless it begins with an inherently capitalized term like a case name).
 */
export function validateCitationSentenceSemicolons(
  rawSentence: string
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const trimmed = rawSentence.trim();

  // Split on semicolons to find multiple citations
  const parts = trimmed.split(';').map(p => p.trim());
  if (parts.length < 2) return issues; // Only relevant for multi-citation sentences

  // The first citation must be capitalized (already checked by validateCitationSentence).
  // Subsequent citations after a semicolon should be lowercase unless the
  // source starts with a proper noun (case name, statute title, etc.) — but
  // signals after semicolons are lowercase per B1.1.
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;

    // If a signal starts the part and is incorrectly capitalized
    const signalMatch = signalAtStart(part);
    if (signalMatch && part.charAt(0) === part.charAt(0).toUpperCase()) {
      // Signals after semicolons should be lowercase
      // But only flag if the signal itself isn't naturally capitalized
      const isNaturallyCapitalized = INHERENTLY_CAPITALIZED_STARTS.has(signalMatch);
      if (!isNaturallyCapitalized) {
        issues.push({
          id: uuid(),
          rule: 'B1.1',
          source: 'Bluebook',
          severity: 'warning',
          message: `After a semicolon within a citation sentence, the signal "${signalMatch}" should not be capitalized (B1.1).`,
          suggestion: `Use lowercase: "${signalMatch.toLowerCase()}"`,
        });
      }
    }
  }

  return issues;
}

// ── Helpers ────────────────────────────────────────────────────────

function isLetter(ch: string): boolean {
  return /^[a-zA-Z]$/.test(ch);
}

/**
 * Check if the text starts with a recognized citation signal.
 * Returns the matched signal string or null.
 */
function signalAtStart(text: string): string | null {
  const lower = text.toLowerCase();
  for (const s of SIGNALS) {
    if (s.signal === '[no signal]') continue;
    if (lower.startsWith(s.signal.toLowerCase())) {
      // Make sure the signal is followed by a space or the end of string
      const afterSignal = text.charAt(s.signal.length);
      if (!afterSignal || afterSignal === ' ') {
        return text.slice(0, s.signal.length);
      }
    }
  }
  return null;
}

function normalizeForFormChecks(text: string): string {
  return text
    .replace(/<[^>]+>/g, '')
    .replace(/[*_]/g, '')
    .trim();
}
