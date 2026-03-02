import type {
  ParsedCitation,
  CaseComponents,
  ShortFormComponents,
  StatuteComponents,
  ConstitutionComponents,
  RegulationComponents,
  ArticleComponents,
  BookComponents,
  RestatementComponents,
  InternetComponents,
  NewspaperComponents,
  AiSourceComponents,
  SocialMediaComponents,
  AudioVideoComponents,
  UnpublishedComponents,
  ValidationIssue,
  DocumentCitationMap,
  DocumentIntegrityReport,
  ResolutionResult,
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
import { validateTypeface, validateAcademicTypeface } from './bluebook/typeface-rules.js';
import { validateSubdivisions } from './bluebook/subdivision-rules.js';
import { validateQuotations } from './bluebook/quotation-rules.js';
import { validateNumerals, validateApostropheAbbreviations } from './bluebook/abbreviation-numeral-rules.js';
import { validateItalicization } from './bluebook/italicization-rules.js';
import { validateCapitalization } from './bluebook/capitalization-rules.js';
import { validateLegislativeMaterial } from './bluebook/legislative-rules.js';
import { validatePinpoints } from './bluebook/pinpoint-rules.js';
import { validateProceduralRules } from './bluebook/procedural-rule-rules.js';
import { validateSubsequentHistory } from './bluebook/subsequent-history-rules.js';
import { validateArticle } from './bluebook/article-rules.js';
import { validateBook } from './bluebook/book-rules.js';
import { validateRestatement } from './bluebook/restatement-rules.js';
import { validateInternet } from './bluebook/internet-rules.js';
import { validateWebsite } from './bluebook/website-rules.js';
import { validateNewspaper } from './bluebook/newspaper-rules.js';
import { validateAiSource } from './bluebook/ai-source-rules.js';
import { validateSocialMedia } from './bluebook/social-media-rules.js';
import { validateAudioVideo } from './bluebook/audio-video-rules.js';
import { validateUnpublished } from './bluebook/unpublished-rules.js';
import { validateCitationOrder } from './bluebook/citation-order-rules.js';
import { validateFootnoteContext } from './context/footnote-rules.js';
import { validateCrossReferences } from './context/cross-reference-validator.js';

export { RULE_EXPLANATIONS } from './explanations.js';
export type { RuleExplanation } from './explanations.js';
export { getComponentRules } from './component-rules-map.js';
export type { ComponentRuleMapping } from './component-rules-map.js';
export { validateContext } from './context/context-rules.js';
export { validateCitationOrder } from './bluebook/citation-order-rules.js';
export { validateFootnoteContext } from './context/footnote-rules.js';
export { validateCrossReferences } from './context/cross-reference-validator.js';

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

  // B2: Typeface validation (Bluepages)
  issues.push(...validateTypeface(citation, citation.rawText));

  // R. 2: Typeface validation (Whitepages/academic)
  issues.push(...validateAcademicTypeface(citation, citation.rawText));

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
  issues.push(...validatePinpoints(citation, citation.rawText));

  // R. 12.9.3 / B12.1.3: Procedural and court rule checks
  issues.push(...validateProceduralRules(citation.rawText));

  // Type-specific checks
  switch (citation.type) {
    case 'case': {
      const components = citation.components as CaseComponents;
      issues.push(...validateCaseName(components, citation.rawText, citation.context, citation.footnoteContext));
      issues.push(...validateReporter(components));
      issues.push(...validateCourtDesignation(components));
      issues.push(...validateDate(components, citation.rawText));
      issues.push(...validateSubsequentHistory(components, citation.rawText));
      break;
    }
    case 'id':
    case 'supra':
    case 'infra':
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
    case 'article': {
      const components = citation.components as ArticleComponents;
      issues.push(...validateArticle(components, citation.rawText));
      break;
    }
    case 'book': {
      const components = citation.components as BookComponents;
      issues.push(...validateBook(components, citation.rawText));
      break;
    }
    case 'restatement': {
      const components = citation.components as RestatementComponents;
      issues.push(...validateRestatement(components, citation.rawText));
      break;
    }
    case 'internet': {
      const components = citation.components as InternetComponents;
      issues.push(...validateInternet(components, citation.rawText));
      break;
    }
    case 'website': {
      const components = citation.components as InternetComponents;
      issues.push(...validateWebsite(components, citation.rawText));
      break;
    }
    case 'newspaper': {
      const components = citation.components as NewspaperComponents;
      issues.push(...validateNewspaper(components, citation.rawText));
      break;
    }
    case 'ai_source': {
      const components = citation.components as AiSourceComponents;
      issues.push(...validateAiSource(components, citation.rawText));
      break;
    }
    case 'social_media': {
      const components = citation.components as SocialMediaComponents;
      issues.push(...validateSocialMedia(components, citation.rawText));
      break;
    }
    case 'audio_video': {
      const components = citation.components as AudioVideoComponents;
      issues.push(...validateAudioVideo(components, citation.rawText));
      break;
    }
    case 'unpublished': {
      const components = citation.components as UnpublishedComponents;
      issues.push(...validateUnpublished(components, citation.rawText));
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
 * When resolution data is provided, context validators use it for more
 * accurate Id./supra/short-form chain validation.
 */
export function runFullAnalysis(
  citations: ParsedCitation[],
  sourceText?: string,
  resolution?: ResolutionResult
): Map<string, ValidationIssue[]> {
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

  // Context rules (cross-citation checks) — pass resolution for accurate antecedent identification
  const contextIssues = validateContext(citations, resolution);
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

  // R. 1.4: Citation ordering within string citations
  const citOrderIssues = validateCitationOrder(citations, sourceText);
  for (const [id, issues] of citOrderIssues) {
    const existing = issueMap.get(id) || [];
    issueMap.set(id, [...existing, ...issues]);
  }

  return issueMap;
}

/**
 * Merge issues from one map into another.
 */
function mergeIssues(
  target: Map<string, ValidationIssue[]>,
  source: Map<string, ValidationIssue[]>
): void {
  for (const [id, issues] of source) {
    const existing = target.get(id) || [];
    target.set(id, [...existing, ...issues]);
  }
}

/**
 * Run full analysis in footnote mode.
 * Applies per-citation rules, footnote-aware context rules,
 * citation ordering within footnotes, and cross-reference validation.
 */
export function runFootnoteAnalysis(
  docMap: DocumentCitationMap,
  sourceText?: string,
  resolution?: ResolutionResult
): { issueMap: Map<string, ValidationIssue[]>; integrityReport: DocumentIntegrityReport } {
  const issueMap = new Map<string, ValidationIssue[]>();
  const allCitations = docMap.allCitations;

  // Per-citation rules
  for (const citation of allCitations) {
    const issues = runAllRules(citation);
    if (citation.context === 'citation_sentence') {
      issues.push(...validateCitationSentenceSemicolons(citation.rawText));
    }
    issueMap.set(citation.id, issues);
  }

  // Flat context rules (Id. chains, short form proximity) — pass resolution data
  const contextIssues = validateContext(allCitations, resolution);
  mergeIssues(issueMap, contextIssues);

  // Footnote-specific context rules
  const footnoteIssues = validateFootnoteContext(docMap);
  mergeIssues(issueMap, footnoteIssues);

  // R. 1.4: Citation ordering within each footnote
  for (const [, citations] of docMap.footnotes) {
    const orderIssues = validateCitationOrder(citations, sourceText);
    mergeIssues(issueMap, orderIssues);
  }

  // Signal ordering
  const sigOrderIssues = validateSignalOrder(allCitations);
  mergeIssues(issueMap, sigOrderIssues);

  // R. 1.2(c): "But" omission
  const butOmissionIssues = validateButOmission(allCitations);
  mergeIssues(issueMap, butOmissionIssues);

  // Cross-reference chain validation (Scope 8)
  const integrityReport = validateCrossReferences(docMap);

  return { issueMap, integrityReport };
}

/**
 * Rule-specific weight multipliers for critical rules.
 * Higher weights for rules whose violations are most impactful.
 */
const RULE_WEIGHTS: Record<string, number> = {
  'R. 4.1': 2.0,        // Id. misuse breaks citation chain
  'R. 3.2(a)': 1.5,     // Pinpoint errors highly visible
  'R. 3.3': 1.5,        // Section pinpoint errors common
  'R. 10.2.1': 1.3,     // Case name errors affect readability
  'R. 10.2.1(c)': 1.3,  // Abbreviation errors
  'R. 10.2.1(f)': 1.3,  // Government party errors
  'R. 10.2.1(g)': 1.3,  // Given name errors
  'R. 10.2.1(h)': 1.3,  // Business designation errors
  'R. 10.4': 1.2,       // Court designation
  'R. 12.9.3': 1.2,     // Procedural rule abbreviation
  'R. 6.2(c)': 1.2,     // Section symbol spacing
  'R. 11': 1.2,         // Constitution citation
  'R. 14.2': 1.1,       // Regulation citation
  'B1.1': 1.2,          // Placement errors affect flow
  'R. 15.1': 1.2,       // Book/article author errors
  'R. 15.4': 1.2,       // Book parenthetical errors
  'R. 15.8': 1.1,       // Restatement format
  'R. 17.1': 1.1,       // Unpublished source errors
  'R. 18.2.1(d)': 2.0,  // Archive requirement (22nd ed. critical change)
  'R. 18.3': 1.5,       // AI citation format (new in 22nd ed.)
  'R. 18.3(a)': 1.5,    // LLM citation format
  'R. 18.3(b)': 1.3,    // Search result citation format
  'R. 18.3(c)': 1.3,    // AI-generated content parenthetical
  'R. 18.7': 1.1,       // Videographic media
  'R. 18.7.1': 1.1,     // Film citations
  'R. 18.7.2': 1.1,     // Television series
  'R. 18.7.3': 1.1,     // Live streaming
  'R. 18.7.4': 1.1,     // Web-based videos
  'R. 18.8': 1.1,       // Audio recordings
  'R. 18.8.1(a)': 1.1,  // Physical commercial audio
  'R. 18.8.1(b)': 1.1,  // Physical noncommercial audio
  'R. 18.8.1(c)': 1.0,  // Episodic recordings
  'R. 18.8.2': 1.0,     // Audio streaming services
  'R. 18.8.3': 1.1,     // Unpublished audio recordings
  'R. 18.8.4': 1.0,     // Websites containing audio
  'R. 18.10': 1.2,      // Social media citations
  'R. 18.10.1': 1.2,    // Social media platforms
  'R. 18.10.1(a)': 1.2, // Visual/audio content
  'R. 18.10.1(b)': 1.0, // Textual content
  'R. 18.10.1(c)': 1.0, // Profiles
  'R. 18.10.1(d)': 1.2, // Reposts
  'R. 18.10.1(e)': 1.1, // Federated social media
  'R. 1.4': 1.2,        // Citation ordering
  'R. 4.2': 1.5,        // Supra note reference errors
  'R. 3.5': 1.2,        // Infra reference errors
};

/**
 * Calculate a compliance score (0-100) based on issues.
 * Uses rule-specific weights for critical rules.
 */
export function calculateScore(issues: ValidationIssue[]): number {
  if (issues.length === 0) return 100;

  let penalty = 0;
  for (const issue of issues) {
    let basePenalty: number;
    switch (issue.severity) {
      case 'error':
        basePenalty = 15;
        break;
      case 'warning':
        basePenalty = 8;
        break;
      case 'suggestion':
        basePenalty = 3;
        break;
    }

    // Apply rule-specific weight multiplier
    const weight = RULE_WEIGHTS[issue.rule] || 1.0;
    penalty += basePenalty * weight;
  }

  return Math.max(0, Math.round(100 - penalty));
}
