import { useState } from 'react';
import type { AnalyzedCitation } from '../services/api.ts';
import type {
  CaseComponents,
  StatuteComponents,
  ConstitutionComponents,
  RegulationComponents,
  ArticleComponents,
  BookComponents,
  RestatementComponents,
  InternetComponents,
  AiSourceComponents,
  UnpublishedComponents,
  ShortFormComponents,
} from '@legalcitation/shared';

interface ComponentRuleMapping {
  rule: string;
  label: string;
}

const CASE_COMPONENT_RULES: Record<string, ComponentRuleMapping> = {
  caseName: { rule: 'R. 10.2.1', label: 'Case Name' },
  volume: { rule: 'R. 10.3', label: 'Volume' },
  reporter: { rule: 'T1', label: 'Reporter' },
  firstPage: { rule: 'R. 3.2', label: 'First Page' },
  pinCite: { rule: 'R. 3.2(a)', label: 'Pinpoint Citation' },
  court: { rule: 'R. 10.4 / T7', label: 'Court' },
  year: { rule: 'R. 10.5', label: 'Year' },
  subsequentHistory: { rule: 'R. 10.7', label: 'Subsequent History' },
  parentheticals: { rule: 'R. 1.5', label: 'Parenthetical' },
  docketNumber: { rule: 'R. 10.8.1', label: 'Docket Number' },
  database: { rule: 'R. 10.8.1', label: 'Database' },
};

const STATUTE_COMPONENT_RULES: Record<string, ComponentRuleMapping> = {
  title: { rule: 'R. 12.3', label: 'Title' },
  code: { rule: 'R. 12.3 / T1', label: 'Code' },
  section: { rule: 'R. 12.3', label: 'Section' },
  year: { rule: 'R. 12.3', label: 'Year' },
  supplement: { rule: 'R. 12.3.2', label: 'Supplement' },
};

const CONSTITUTION_COMPONENT_RULES: Record<string, ComponentRuleMapping> = {
  jurisdiction: { rule: 'R. 11', label: 'Jurisdiction' },
  article: { rule: 'R. 11', label: 'Article' },
  amendment: { rule: 'R. 11', label: 'Amendment' },
  section: { rule: 'R. 11', label: 'Section' },
  clause: { rule: 'R. 11', label: 'Clause' },
};

const REGULATION_COMPONENT_RULES: Record<string, ComponentRuleMapping> = {
  title: { rule: 'R. 14.2', label: 'Title' },
  source: { rule: 'R. 14.2', label: 'Source' },
  section: { rule: 'R. 14.2', label: 'Section' },
  year: { rule: 'R. 14.2', label: 'Year' },
};

const ARTICLE_COMPONENT_RULES: Record<string, ComponentRuleMapping> = {
  authors: { rule: 'R. 15.1', label: 'Author(s)' },
  title: { rule: 'R. 16.3', label: 'Article Title' },
  journal: { rule: 'T13', label: 'Journal' },
  volume: { rule: 'R. 16.4', label: 'Volume' },
  firstPage: { rule: 'R. 3.2', label: 'First Page' },
  pinCite: { rule: 'R. 3.2(a)', label: 'Pinpoint Citation' },
  year: { rule: 'R. 16.4', label: 'Year' },
  studentDesignator: { rule: 'R. 16.7.1', label: 'Student Work' },
};

const BOOK_COMPONENT_RULES: Record<string, ComponentRuleMapping> = {
  authors: { rule: 'R. 15.1', label: 'Author(s)' },
  title: { rule: 'R. 15.3', label: 'Book Title' },
  section: { rule: 'R. 3.3', label: 'Section' },
  page: { rule: 'R. 3.2(b)', label: 'Page' },
  pinCite: { rule: 'R. 3.2(a)', label: 'Pinpoint Citation' },
  volume: { rule: 'R. 15.8', label: 'Volume' },
  edition: { rule: 'R. 15.4', label: 'Edition' },
  publisher: { rule: 'R. 15.4', label: 'Publisher' },
  year: { rule: 'R. 15.4', label: 'Year' },
  editor: { rule: 'R. 15.2', label: 'Editor' },
  translator: { rule: 'R. 15.2', label: 'Translator' },
};

const RESTATEMENT_COMPONENT_RULES: Record<string, ComponentRuleMapping> = {
  series: { rule: 'R. 12.9.5', label: 'Series' },
  subject: { rule: 'R. 12.9.5', label: 'Subject' },
  section: { rule: 'R. 3.3', label: 'Section' },
  pinCite: { rule: 'R. 12.9.5', label: 'Pinpoint' },
  organization: { rule: 'R. 12.9.5', label: 'Organization' },
  year: { rule: 'R. 12.9.5', label: 'Year' },
};

const INTERNET_COMPONENT_RULES: Record<string, ComponentRuleMapping> = {
  author: { rule: 'R. 18.2.2(a)', label: 'Author' },
  title: { rule: 'R. 18.2.2(b)', label: 'Title' },
  websiteName: { rule: 'R. 18.2.2(b)', label: 'Website' },
  url: { rule: 'R. 18.2.2(d)', label: 'URL' },
  archiveUrl: { rule: 'R. 18.2.1(d)', label: 'Archive URL' },
  date: { rule: 'R. 18.2.2(c)', label: 'Date' },
  lastVisited: { rule: 'R. 18.2.2(c)', label: 'Last Visited' },
  pinCite: { rule: 'R. 3.2(a)', label: 'Pinpoint' },
};

const AI_SOURCE_COMPONENT_RULES: Record<string, ComponentRuleMapping> = {
  subtype: { rule: 'R. 18.3', label: 'Source Type' },
  modelName: { rule: 'R. 18.3', label: 'AI Model' },
  modelVersion: { rule: 'R. 18.3', label: 'Model Version' },
  prompt: { rule: 'R. 18.3(a)', label: 'Prompt' },
  promptAuthor: { rule: 'R. 18.3(a)', label: 'Prompt Author' },
  searchEngine: { rule: 'R. 18.3(b)', label: 'Search Engine' },
  query: { rule: 'R. 18.3(b)', label: 'Search Query' },
  date: { rule: 'R. 18.3', label: 'Date' },
  onFileWith: { rule: 'R. 18.3', label: 'On File With' },
};

const UNPUBLISHED_COMPONENT_RULES: Record<string, ComponentRuleMapping> = {
  subtype: { rule: 'R. 17', label: 'Source Type' },
  author: { rule: 'R. 17.1', label: 'Author' },
  title: { rule: 'R. 17.1', label: 'Title' },
  page: { rule: 'R. 3.2', label: 'Page' },
  date: { rule: 'R. 17.1', label: 'Date' },
  institution: { rule: 'R. 17.2.2', label: 'Institution' },
  degree: { rule: 'R. 17.2.2', label: 'Degree' },
  workingPaperNumber: { rule: 'R. 17.4', label: 'Paper Number' },
  onFileWith: { rule: 'R. 17.2.1', label: 'On File With' },
  pinCite: { rule: 'R. 3.2(a)', label: 'Pinpoint' },
};

const SHORT_FORM_COMPONENT_RULES: Record<string, ComponentRuleMapping> = {
  type: { rule: 'R. 4', label: 'Short Form Type' },
  partyName: { rule: 'R. 10.9', label: 'Party Name' },
  pinCite: { rule: 'R. 3.2(a)', label: 'Pinpoint' },
  supraNoteNumber: { rule: 'R. 4.2(a)', label: 'Note Number' },
  infraNoteNumber: { rule: 'R. 3.5', label: 'Note Number' },
};

function getComponentRules(citationType?: string): Record<string, ComponentRuleMapping> {
  switch (citationType) {
    case 'case': return CASE_COMPONENT_RULES;
    case 'statute': return STATUTE_COMPONENT_RULES;
    case 'constitution': return CONSTITUTION_COMPONENT_RULES;
    case 'regulation': return REGULATION_COMPONENT_RULES;
    case 'article': return ARTICLE_COMPONENT_RULES;
    case 'book': return BOOK_COMPONENT_RULES;
    case 'restatement': return RESTATEMENT_COMPONENT_RULES;
    case 'internet': return INTERNET_COMPONENT_RULES;
    case 'ai_source': return AI_SOURCE_COMPONENT_RULES;
    case 'unpublished': return UNPUBLISHED_COMPONENT_RULES;
    case 'id':
    case 'supra':
    case 'infra':
    case 'short_form':
      return SHORT_FORM_COMPONENT_RULES;
    default: return CASE_COMPONENT_RULES;
  }
}

const SHORT_FORM_TYPE_LABELS: Record<string, string> = {
  id: 'Id.',
  supra: 'Supra',
  hereinafter: 'Hereinafter',
  short_case: 'Short Case',
  short_statute: 'Short Statute',
};

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

  const parts: { key: string; value: string; rule: ComponentRuleMapping; highlight?: boolean }[] = [];

  // Type-specific component extraction
  if (parsed.type === 'case' && 'partyOne' in components) {
    const comp = components as CaseComponents;
    const caseName = comp.partyTwo
      ? `${comp.partyOne} v. ${comp.partyTwo}`
      : comp.partyOne;
    if (caseName.trim() && ruleMap['caseName']) {
      parts.push({ key: 'caseName', value: caseName.trim(), rule: ruleMap['caseName'] });
    }
    if (comp.volume && ruleMap['volume']) parts.push({ key: 'volume', value: comp.volume, rule: ruleMap['volume'] });
    if (comp.reporter && ruleMap['reporter']) parts.push({ key: 'reporter', value: comp.reporter, rule: ruleMap['reporter'], highlight: true });
    if (comp.firstPage && ruleMap['firstPage']) parts.push({ key: 'firstPage', value: comp.firstPage, rule: ruleMap['firstPage'] });
    if (comp.firstPage === '' && ruleMap['firstPage']) parts.push({ key: 'firstPage', value: '___', rule: ruleMap['firstPage'] });
    if (comp.pinCite && ruleMap['pinCite']) parts.push({ key: 'pinCite', value: comp.pinCite, rule: ruleMap['pinCite'] });
    if (comp.court && ruleMap['court']) parts.push({ key: 'court', value: comp.court, rule: ruleMap['court'] });
    if (comp.year && ruleMap['year']) parts.push({ key: 'year', value: comp.year, rule: ruleMap['year'] });
    if (comp.subsequentHistory && ruleMap['subsequentHistory']) parts.push({ key: 'subsequentHistory', value: comp.subsequentHistory, rule: ruleMap['subsequentHistory'] });
    if (comp.parentheticals?.length && ruleMap['parentheticals']) parts.push({ key: 'parentheticals', value: comp.parentheticals.join('; '), rule: ruleMap['parentheticals'] });
    if (comp.docketNumber && ruleMap['docketNumber']) parts.push({ key: 'docketNumber', value: comp.docketNumber, rule: ruleMap['docketNumber'] });
    if (comp.database && ruleMap['database']) parts.push({ key: 'database', value: comp.database, rule: ruleMap['database'] });
  } else if (parsed.type === 'article' && 'authors' in components) {
    const comp = components as ArticleComponents;
    if (comp.authors.length > 0 && ruleMap['authors']) parts.push({ key: 'authors', value: comp.authors.join(' & '), rule: ruleMap['authors'] });
    if (comp.title && ruleMap['title']) parts.push({ key: 'title', value: comp.title, rule: ruleMap['title'] });
    if (comp.volume && ruleMap['volume']) parts.push({ key: 'volume', value: comp.volume, rule: ruleMap['volume'] });
    if (comp.journal && ruleMap['journal']) parts.push({ key: 'journal', value: comp.journal, rule: ruleMap['journal'], highlight: true });
    if (comp.firstPage && ruleMap['firstPage']) parts.push({ key: 'firstPage', value: comp.firstPage, rule: ruleMap['firstPage'] });
    if (comp.pinCite && ruleMap['pinCite']) parts.push({ key: 'pinCite', value: comp.pinCite, rule: ruleMap['pinCite'] });
    if (comp.year && ruleMap['year']) parts.push({ key: 'year', value: comp.year, rule: ruleMap['year'] });
    if (comp.studentDesignator && ruleMap['studentDesignator']) parts.push({ key: 'studentDesignator', value: comp.studentDesignator, rule: ruleMap['studentDesignator'] });
  } else if (parsed.type === 'book' && 'authors' in components) {
    const comp = components as BookComponents;
    if (comp.authors.length > 0 && ruleMap['authors']) parts.push({ key: 'authors', value: comp.authors.join(' & '), rule: ruleMap['authors'] });
    if (comp.title && ruleMap['title']) parts.push({ key: 'title', value: comp.title, rule: ruleMap['title'] });
    if (comp.volume && ruleMap['volume']) parts.push({ key: 'volume', value: comp.volume, rule: ruleMap['volume'] });
    if (comp.section && ruleMap['section']) parts.push({ key: 'section', value: comp.section, rule: ruleMap['section'] });
    if (comp.page && ruleMap['page']) parts.push({ key: 'page', value: comp.page, rule: ruleMap['page'] });
    if (comp.pinCite && ruleMap['pinCite']) parts.push({ key: 'pinCite', value: comp.pinCite, rule: ruleMap['pinCite'] });
    if (comp.edition && ruleMap['edition']) parts.push({ key: 'edition', value: comp.edition, rule: ruleMap['edition'] });
    if (comp.publisher && ruleMap['publisher']) parts.push({ key: 'publisher', value: comp.publisher, rule: ruleMap['publisher'] });
    if (comp.year && ruleMap['year']) parts.push({ key: 'year', value: comp.year, rule: ruleMap['year'] });
    if (comp.editor && ruleMap['editor']) parts.push({ key: 'editor', value: comp.editor, rule: ruleMap['editor'] });
    if (comp.translator && ruleMap['translator']) parts.push({ key: 'translator', value: comp.translator, rule: ruleMap['translator'] });
  } else if ((parsed.type === 'id' || parsed.type === 'supra' || parsed.type === 'infra' || parsed.type === 'short_form') && 'type' in components) {
    const comp = components as ShortFormComponents;
    const typeLabel = SHORT_FORM_TYPE_LABELS[comp.type] || comp.type;
    if (ruleMap['type']) parts.push({ key: 'type', value: typeLabel, rule: ruleMap['type'] });
    if (comp.partyName && ruleMap['partyName']) parts.push({ key: 'partyName', value: comp.partyName, rule: ruleMap['partyName'] });
    if (comp.pinCite && ruleMap['pinCite']) parts.push({ key: 'pinCite', value: comp.pinCite, rule: ruleMap['pinCite'] });
    if (comp.supraNoteNumber !== undefined && ruleMap['supraNoteNumber']) parts.push({ key: 'supraNoteNumber', value: String(comp.supraNoteNumber), rule: ruleMap['supraNoteNumber'] });
    if (comp.infraNoteNumber !== undefined && ruleMap['infraNoteNumber']) parts.push({ key: 'infraNoteNumber', value: String(comp.infraNoteNumber), rule: ruleMap['infraNoteNumber'] });
  } else {
    // Generic fallback — iterate all string/number fields and match to ruleMap
    for (const [key, value] of Object.entries(components)) {
      if (key === 'partyOne' || key === 'partyTwo') continue;
      if (value === undefined || value === null) continue;

      const ruleEntry = ruleMap[key];
      if (!ruleEntry) continue;

      if (Array.isArray(value)) {
        if (value.length > 0) {
          parts.push({ key, value: value.join(', '), rule: ruleEntry });
        }
      } else if (typeof value === 'string' && value.trim()) {
        parts.push({ key, value: value.trim(), rule: ruleEntry });
      } else if (typeof value === 'number') {
        parts.push({ key, value: String(value), rule: ruleEntry });
      }
    }
  }

  if (parts.length === 0) return null;

  const renderValue = (value: string, key: string) => {
    if (key === 'caseName' || key === 'title') {
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
        {parts.map(({ key, value, rule, highlight }) => (
          <div
            key={key}
            className={`flex items-start justify-between gap-3 px-3 py-2 rounded-xl transition-colors duration-150 ${
              highlight ? 'bg-primary-50/50' : ''
            } ${
              hoveredComponent === key ? 'bg-primary-50' : 'hover:bg-surface-50'
            }`}
            onMouseEnter={() => setHoveredComponent(key)}
            onMouseLeave={() => setHoveredComponent(null)}
          >
            <div className="flex-1 min-w-0">
              <div className="font-serif text-sm break-words">{renderValue(value, key)}</div>
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
