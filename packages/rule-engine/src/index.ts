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

export { RULE_EXPLANATIONS } from './explanations.js';
export { validateContext } from './context/context-rules.js';

/**
 * Run all Bluebook rules on a single parsed citation.
 */
export function runBluebookRules(citation: ParsedCitation): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

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
    issueMap.set(citation.id, issues);
  }

  // Context rules (cross-citation checks)
  const contextIssues = validateContext(citations);
  for (const [id, issues] of contextIssues) {
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
