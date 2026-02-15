import { v4 as uuid } from 'uuid';
import type { ValidationIssue, CaseComponents } from '@legalcitation/shared';
import { ALL_HISTORY_ABBREVIATIONS } from '@legalcitation/shared';

/**
 * R. 10.7 — Subsequent and Prior History
 *
 * Validates:
 *   - History phrases are properly italicized (T8)
 *   - History citation format includes reporter info
 *   - Sub nom. usage includes an alternate case name
 *   - Denial of cert. omission rules per R. 10.7.1(a)
 */
export function validateSubsequentHistory(
  components: CaseComponents,
  rawText: string
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!components.subsequentHistory) return issues;

  const history = components.subsequentHistory;

  // R. 10.7 / T8: History phrases must be italicized
  for (const abbr of ALL_HISTORY_ABBREVIATIONS) {
    if (history.toLowerCase().includes(abbr.toLowerCase())) {
      // Check if the phrase is wrapped in italic markers
      const escapedAbbr = abbr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const italicPattern = new RegExp(`\\*${escapedAbbr}\\*`, 'i');
      if (!italicPattern.test(rawText)) {
        issues.push({
          id: uuid(),
          rule: 'R. 10.7',
          source: 'Bluebook',
          severity: 'warning',
          message: `The history phrase "${abbr}" should be italicized per T8 (R. 10.7).`,
          suggestion: `Italicize: "*${abbr}*"`,
        });
        break; // Only flag once per citation
      }
    }
  }

  // R. 10.7: History citation should include reporter info (volume + reporter + page)
  const hasReporterInfo = /\d{1,4}\s+[A-Z]/.test(history);
  const isShortHistory = /^(?:cert\.\s*denied|cert\.\s*dismissed|reh'g\s*denied|reh'g\s*en\s*banc\s*denied)$/i.test(history.trim());
  if (!hasReporterInfo && !isShortHistory && history.length > 10) {
    issues.push({
      id: uuid(),
      rule: 'R. 10.7',
      source: 'Bluebook',
      severity: 'suggestion',
      message: 'Subsequent history should include the full citation of the later case (R. 10.7).',
      suggestion: 'Include volume, reporter, and page for the subsequent case.',
    });
  }

  // R. 10.7: Sub nom. must be followed by the alternate case name
  if (/sub\s*nom\./i.test(history)) {
    const afterSubNom = history.match(/sub\s*nom\.\s*(.*)/i);
    if (afterSubNom && afterSubNom[1].trim().length < 3) {
      issues.push({
        id: uuid(),
        rule: 'R. 10.7',
        source: 'Bluebook',
        severity: 'error',
        message: '"Sub nom." must be followed by the alternate case name (R. 10.7).',
        suggestion: 'Include the case name after "sub nom.", e.g., "rev\'d sub nom. New Case Name, Vol Reporter Page (Year)".',
      });
    }
  }

  // R. 10.7.1(a): Denial of certiorari should generally be omitted unless:
  // (1) lower court opinion is less than 2 years old, or
  // (2) a Justice dissented from the denial
  if (/cert\.\s*denied/i.test(history)) {
    issues.push({
      id: uuid(),
      rule: 'R. 10.7.1(a)',
      source: 'Bluebook',
      severity: 'suggestion',
      message: 'Denial of certiorari should generally be omitted per R. 10.7.1(a), unless the lower court opinion is less than two years old or a Justice dissented from the denial.',
      suggestion: 'Consider omitting "cert. denied" unless it meets an exception under R. 10.7.1(a).',
    });
  }

  return issues;
}
