import { useState } from 'react';
import type { AnalyzedCitation } from '../services/api.ts';

interface ComponentRuleMapping {
  rule: string;
  label: string;
}

const CASE_COMPONENT_RULES: Record<string, ComponentRuleMapping> = {
  partyOne: { rule: 'R. 10.2.1', label: 'Case Name' },
  partyTwo: { rule: 'R. 10.2.1', label: 'Case Name' },
  volume: { rule: 'R. 10.3', label: 'Volume' },
  reporter: { rule: 'T1', label: 'Reporter' },
  firstPage: { rule: 'R. 3.2', label: 'First Page' },
  pinCite: { rule: 'R. 3.2(a)', label: 'Pinpoint Citation' },
  court: { rule: 'R. 10.4 / T7', label: 'Court' },
  year: { rule: 'R. 10.5', label: 'Year' },
};

const STATUTE_COMPONENT_RULES: Record<string, ComponentRuleMapping> = {
  title: { rule: 'R. 12.3', label: 'Title' },
  code: { rule: 'R. 12.3 / T1', label: 'Code' },
  section: { rule: 'R. 12.3', label: 'Section' },
  year: { rule: 'R. 12.3', label: 'Year' },
};

function getComponentRules(citationType?: string): Record<string, ComponentRuleMapping> {
  switch (citationType) {
    case 'statute': return STATUTE_COMPONENT_RULES;
    default: return CASE_COMPONENT_RULES;
  }
}

interface CitationBreakdownProps {
  citation: AnalyzedCitation;
  formatStyle: 'italics' | 'underline';
}

export function CitationBreakdown({ citation, formatStyle }: CitationBreakdownProps) {
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null);

  const parsed = citation.parsed;
  if (!parsed?.components) return null;

  const components = parsed.components;
  const ruleMap = getComponentRules(parsed.type);

  // Build the list of component parts that have values
  const parts: { key: string; value: string; rule: ComponentRuleMapping }[] = [];

  for (const [key, value] of Object.entries(components)) {
    if (value && typeof value === 'string' && value.trim() && ruleMap[key]) {
      parts.push({ key, value: value.trim(), rule: ruleMap[key] });
    }
  }

  if (parts.length === 0) return null;

  const renderValue = (value: string, key: string) => {
    // Italicize case name parts
    if (key === 'partyOne' || key === 'partyTwo') {
      return formatStyle === 'italics'
        ? <em className="font-serif">{value}</em>
        : <u>{value}</u>;
    }
    return <span>{value}</span>;
  };

  return (
    <div className="card border border-surface-200">
      <div className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-3">
        Citation Components
      </div>
      <div className="space-y-2">
        {parts.map(({ key, value, rule }) => (
          <div
            key={key}
            className={`flex items-start justify-between gap-3 px-3 py-2 rounded-xl transition-colors duration-150 ${
              hoveredComponent === key ? 'bg-primary-50' : 'hover:bg-surface-50'
            }`}
            onMouseEnter={() => setHoveredComponent(key)}
            onMouseLeave={() => setHoveredComponent(null)}
          >
            <div className="flex-1 min-w-0">
              <div className="font-serif text-sm">{renderValue(value, key)}</div>
              <div className="text-[10px] text-surface-400 mt-0.5">{rule.label}</div>
            </div>
            <span className="shrink-0 text-[10px] font-mono text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md border border-primary-100">
              {rule.rule}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
