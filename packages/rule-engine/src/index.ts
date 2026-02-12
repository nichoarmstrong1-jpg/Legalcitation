import type {
  ParsedCitation,
  CaseComponents,
  ShortFormComponents,
  StatuteComponents,
  ConstitutionComponents,
  RegulationComponents,
  ValidationIssue,
  CitationContext,
} from '@legalcitation/shared';

import { validateCaseName } from './bluebook/case-name-rules.js';
import { validateReporter, validateCourtDesignation } from './bluebook/reporter-rules.js';
import { validateSpacing } from './bluebook/spacing-rules.js';
import { validateOrdinals } from './bluebook/ordinal-rules.js';
import { validatePageRanges } from './bluebook/page-range-rules.js';
import { validateDate } from './bluebook/date-rules.js';
import { validateShortForm } from './bluebook/short-form-rules.js';
import { validateStatute } from './bluebook/statute-rules.js';
import { validateConstitution } from './bluebook/constitution-rules.js';
import { validateRegulation } from './bluebook/regulation-rules.js';
import { validateIndigoCaseRules } from './indigo/indigo-case-rules.js';
import { validateContext } from './context/context-rules.js';
import {
  validateCitationSentence,
  validateCitationClause,
  validateCitationSentenceSemicolons,
} from './bluebook/citation-form-rules.js';
import {
  validateSignal,
  validateSignalOrder,
  validateButOmission,
} from './bluebook/signal-rules.js';
import {
  validateParenthetical,
  validateParentheticalOrder,
} from './bluebook/parenthetical-rules.js';
import { validateTypeface } from './bluebook/typeface-rules.js';
import { validateSubdivisions } from './bluebook/subdivision-rules.js';
import { validateQuotations } from './bluebook/quotation-rules.js';
import { validateNumerals, validateApostropheAbbreviations } from './bluebook/abbreviation-numeral-rules.js';
import { validateItalicization } from './bluebook/italicization-rules.js';
import { validateCapitalization } from './bluebook/capitalization-rules.js';
import { validateLegislativeMaterial } from './bluebook/legislative-rules.js';

export { RULE_EXPLANATIONS } from './explanations.js';
export { validateContext } from './context/context-rules.js';

/**
 * Run all Bluebook rules on a single parsed citation.
 */
export function runBluebookRules(citation: ParsedCitation): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // B1.1: Citation form checks (sentence vs. clause)
  issues.push(...validateCitationSentence(citation, citation.rawText));
  issues.push(...validateCitationClause(citation, citation.rawText, false));

  // B1.2 / R. 1.2: Signal validation
  issues.push(...validateSignal(citation, citation.rawText));

  // B1.3 / R. 1.5: Explanatory parenthetical validation
  issues.push(...validateParenthetical(citation, citation.rawText));
  issues.push(...validateParentheticalOrder(citation.rawText));

  // B2: Typeface validation
  issues.push(...validateTypeface(citation, citation.rawText));

  // B3 / T16: Subdivision formatting
  issues.push(...validateSubdivisions(citation.rawText));

  // B5: Quotation formatting
  issues.push(...validateQuotations(citation.rawText));

  // B6: Abbreviation and numeral checks
  issues.push(...validateNumerals(citation.rawText));
  issues.push(...validateApostropheAbbreviations(citation.rawText));

  // B7: Italicization rules
  issues.push(...validateItalicization(citation, citation.rawText));

  // B8: Capitalization rules
  issues.push(...validateCapitalization(citation.rawText));

  // R. 13: Legislative material checks
  issues.push(...validateLegislativeMaterial(citation.rawText));

  // Universal checks (apply to all citation types)
  issues.push(...validateSpacing(citation.rawText));
  issues.push(...validateOrdinals(citation.rawText));
  issues.push(...validatePageRanges(citation.rawText));

  // Type-specific checks
  switch (citation.type) {
    case 'case': {
      const components = citation.components as CaseComponents;
      issues.push(...validateCaseName(components, citation.rawText, citation.context));
      issues.push(...validateReporter(components));
      issues.push(...validateCourtDesignation(components));
      issues.push(...validateDate(components, citation.rawText));
      break;
    }
    case 'id':
    case 'supra':
    case 'short_form': {
      const components = citation.components as ShortFormComponents;
      issues.push(...validateShortForm(components, citation.rawText));
      break;
    }
    case 'statute': {
      const components = citation.components as StatuteComponents;
      issues.push(...validateStatute(components, citation.rawText));
      break;
    }
    case 'constitution': {
      const components = citation.components as ConstitutionComponents;
      issues.push(...validateConstitution(components, citation.rawText));
      break;
    }
    case 'regulation': {
      const components = citation.components as RegulationComponents;
      issues.push(...validateRegulation(components, citation.rawText));
      break;
    }
  }

  return issues;
}

/**
 * Run Indigo Book cross-check rules on a single parsed citation.
 */
export function runIndigoRules(citation: ParsedCitation): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  switch (citation.type) {
    case 'case': {
      const components = citation.components as CaseComponents;
      issues.push(...validateIndigoCaseRules(components, citation.rawText));
      break;
    }
  }

  return issues;
}

/**
 * Run ALL rules (Bluebook + Indigo) on a single citation.
 */
export function runAllRules(citation: ParsedCitation): ValidationIssue[] {
  return [
    ...runBluebookRules(citation),
    ...runIndigoRules(citation),
  ];
}

/**
 * Run all rules including context-aware validation on a list of citations.
 */
export function runFullAnalysis(citations: ParsedCitation[]): Map<string, ValidationIssue[]> {
  const issueMap = new Map<string, ValidationIssue[]>();

  // Per-citation rules
  for (const citation of citations) {
    const issues = runAllRules(citation);

    // B1.1: Check semicolon-separated citations within citation sentences
    if (citation.context === 'citation_sentence') {
      issues.push(...validateCitationSentenceSemicolons(citation.rawText));
    }

    issueMap.set(citation.id, issues);
  }

  // Context rules (cross-citation checks)
  const contextIssues = validateContext(citations);
  for (const [id, issues] of contextIssues) {
    const existing = issueMap.get(id) || [];
    issueMap.set(id, [...existing, ...issues]);
  }

  // R. 1.3: Signal ordering across citation sentences
  const orderIssues = validateSignalOrder(citations);
  for (const [id, issues] of orderIssues) {
    const existing = issueMap.get(id) || [];
    issueMap.set(id, [...existing, ...issues]);
  }

  // R. 1.2(c): "But" omission after negative signals
  const butIssues = validateButOmission(citations);
  for (const [id, issues] of butIssues) {
    const existing = issueMap.get(id) || [];
    issueMap.set(id, [...existing, ...issues]);
  }

  return issueMap;
}

/**
 * Calculate a compliance score (0-100) based on issues.
 */
export function calculateScore(issues: ValidationIssue[]): number {
  if (issues.length === 0) return 100;

  let penalty = 0;
  for (const issue of issues) {
    switch (issue.severity) {
      case 'error':
        penalty += 15;
        break;
      case 'warning':
        penalty += 8;
        break;
      case 'suggestion':
        penalty += 3;
        break;
    }
  }

  return Math.max(0, 100 - penalty);
}
