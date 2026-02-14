/**
 * Maps citation component field names to their governing Bluebook rules.
 * Used by the CitationBreakdown component to show which rule governs each part.
 */

export interface ComponentRuleMapping {
  rule: string;
  label: string;
}

export const CASE_COMPONENT_RULES: Record<string, ComponentRuleMapping> = {
  partyOne: { rule: 'R. 10.2.1', label: 'Case Name' },
  partyTwo: { rule: 'R. 10.2.1', label: 'Case Name' },
  caseName: { rule: 'R. 10.2.1', label: 'Case Name' },
  volume: { rule: 'R. 10.3', label: 'Volume' },
  reporter: { rule: 'T1', label: 'Reporter' },
  firstPage: { rule: 'R. 3.2', label: 'First Page' },
  pinCite: { rule: 'R. 3.2(a)', label: 'Pinpoint Citation' },
  court: { rule: 'R. 10.4 / T7', label: 'Court Designation' },
  year: { rule: 'R. 10.5', label: 'Year' },
};

export const STATUTE_COMPONENT_RULES: Record<string, ComponentRuleMapping> = {
  title: { rule: 'R. 12.3', label: 'Title' },
  code: { rule: 'R. 12.3 / T1', label: 'Code' },
  section: { rule: 'R. 12.3', label: 'Section' },
  year: { rule: 'R. 12.3', label: 'Year' },
};

export const CONSTITUTION_COMPONENT_RULES: Record<string, ComponentRuleMapping> = {
  jurisdiction: { rule: 'R. 11', label: 'Jurisdiction' },
  article: { rule: 'R. 11', label: 'Article' },
  amendment: { rule: 'R. 11', label: 'Amendment' },
  section: { rule: 'R. 11', label: 'Section' },
  clause: { rule: 'R. 11', label: 'Clause' },
};

export const REGULATION_COMPONENT_RULES: Record<string, ComponentRuleMapping> = {
  title: { rule: 'R. 14', label: 'Title' },
  source: { rule: 'R. 14', label: 'Source' },
  section: { rule: 'R. 14', label: 'Section' },
  year: { rule: 'R. 14', label: 'Year' },
};

export function getComponentRules(citationType?: string): Record<string, ComponentRuleMapping> {
  switch (citationType) {
    case 'case': return CASE_COMPONENT_RULES;
    case 'statute': return STATUTE_COMPONENT_RULES;
    case 'constitution': return CONSTITUTION_COMPONENT_RULES;
    case 'regulation': return REGULATION_COMPONENT_RULES;
    default: return CASE_COMPONENT_RULES;
  }
}
