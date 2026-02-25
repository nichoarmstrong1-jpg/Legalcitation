import type { CitationTypeId } from '@legalcitation/shared';
import type { BluebookRule, CitationComponents, FormattedCitation, ValidationResult } from '../types';

const ruleMap: Record<string, BluebookRule[]> = {};
const formatMap: Record<string, (c: CitationComponents, style: 'law_review' | 'court_doc') => string> = {};
const shortFormMap: Record<string, (c: CitationComponents) => string | null> = {};

export function getRulesForType(typeId: CitationTypeId): BluebookRule[] {
  return ruleMap[typeId] ?? [];
}

export function validateCitation(typeId: CitationTypeId, components: CitationComponents): ValidationResult[] {
  const rules = getRulesForType(typeId);
  return rules
    .map((rule) => rule.validate(components))
    .filter((result) => !result.valid);
}

export function formatCitation(
  typeId: CitationTypeId,
  components: CitationComponents,
  style: 'law_review' | 'court_doc' = 'court_doc'
): FormattedCitation {
  const formatter = formatMap[typeId];
  const full = formatter ? formatter(components, style) : Object.values(components).filter(Boolean).join(', ');
  const courtDoc = formatter ? formatter(components, 'court_doc') : full;
  const footnote = formatter ? formatter(components, 'law_review') : full;
  const shortForm = generateShortForm(typeId, components);
  const validationResults = validateCitation(typeId, components);

  return {
    full,
    shortForm,
    footnote,
    courtDoc,
    components,
    validationResults,
    confidence: validationResults.length === 0 ? 0.95 : Math.max(0.5, 0.95 - validationResults.length * 0.1),
  };
}

export function generateShortForm(typeId: CitationTypeId, components: CitationComponents): string | null {
  const generator = shortFormMap[typeId];
  return generator ? generator(components) : null;
}

// Registration function — called by each type's rule file
export function registerTypeRules(
  typeId: string,
  rules: BluebookRule[],
  formatter: (c: CitationComponents, style: 'law_review' | 'court_doc') => string,
  shortFormGenerator: (c: CitationComponents) => string | null
): void {
  ruleMap[typeId] = rules;
  formatMap[typeId] = formatter;
  shortFormMap[typeId] = shortFormGenerator;
}
