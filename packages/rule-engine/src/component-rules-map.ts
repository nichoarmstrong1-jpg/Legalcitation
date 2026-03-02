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

export const ARTICLE_COMPONENT_RULES: Record<string, ComponentRuleMapping> = {
  authors: { rule: 'R. 15.1', label: 'Author(s)' },
  title: { rule: 'R. 16.3', label: 'Article Title' },
  journal: { rule: 'T13', label: 'Journal' },
  volume: { rule: 'R. 16.4', label: 'Volume' },
  firstPage: { rule: 'R. 3.2', label: 'First Page' },
  pinCite: { rule: 'R. 3.2(a)', label: 'Pinpoint Citation' },
  year: { rule: 'R. 16.4', label: 'Year' },
};

export const BOOK_COMPONENT_RULES: Record<string, ComponentRuleMapping> = {
  authors: { rule: 'R. 15.1', label: 'Author(s)' },
  title: { rule: 'R. 15.3', label: 'Book Title' },
  section: { rule: 'R. 3.3', label: 'Section' },
  page: { rule: 'R. 3.2(b)', label: 'Page' },
  volume: { rule: 'R. 15.8', label: 'Volume' },
  edition: { rule: 'R. 15.4', label: 'Edition' },
  year: { rule: 'R. 15.4', label: 'Year' },
};

export const RESTATEMENT_COMPONENT_RULES: Record<string, ComponentRuleMapping> = {
  series: { rule: 'R. 15.8', label: 'Series' },
  subject: { rule: 'R. 15.8', label: 'Subject' },
  section: { rule: 'R. 3.3', label: 'Section' },
  pinCite: { rule: 'R. 15.8', label: 'Pinpoint' },
  organization: { rule: 'R. 15.8', label: 'Organization' },
  year: { rule: 'R. 15.8', label: 'Year' },
};

export const INTERNET_COMPONENT_RULES: Record<string, ComponentRuleMapping> = {
  author: { rule: 'R. 18.2.2(a)', label: 'Author' },
  title: { rule: 'R. 18.2.2(b)', label: 'Title' },
  websiteName: { rule: 'R. 18.2.2(b)', label: 'Website' },
  url: { rule: 'R. 18.2.2(d)', label: 'URL' },
  archiveUrl: { rule: 'R. 18.2.1(d)', label: 'Archive URL' },
  date: { rule: 'R. 18.2.2(c)', label: 'Date' },
  lastVisited: { rule: 'R. 18.2.2(c)', label: 'Last Visited' },
};

export const AI_SOURCE_COMPONENT_RULES: Record<string, ComponentRuleMapping> = {
  modelName: { rule: 'R. 18.3', label: 'AI Model' },
  prompt: { rule: 'R. 18.3(a)', label: 'Prompt' },
  promptAuthor: { rule: 'R. 18.3(a)', label: 'Prompt Author' },
  searchEngine: { rule: 'R. 18.3(b)', label: 'Search Engine' },
  query: { rule: 'R. 18.3(b)', label: 'Search Query' },
  date: { rule: 'R. 18.3', label: 'Date' },
  onFileWith: { rule: 'R. 18.3', label: 'On File With' },
};

export const WEBSITE_COMPONENT_RULES: Record<string, ComponentRuleMapping> = {
  author: { rule: 'R. 18.2.2(a)', label: 'Author' },
  title: { rule: 'R. 18.2.2(b)', label: 'Page Title' },
  websiteName: { rule: 'R. 18.2.2(b)(i)', label: 'Website Name' },
  subdivision: { rule: 'R. 18.2.2(b)(ii)', label: 'Subdivision' },
  url: { rule: 'R. 18.2.2(d)', label: 'URL' },
  archiveUrl: { rule: 'R. 18.2.1(d)', label: 'Archive URL' },
  date: { rule: 'R. 18.2.2(c)', label: 'Date' },
  timestamp: { rule: 'R. 18.2.2(c)', label: 'Timestamp' },
  lastVisited: { rule: 'R. 18.2.2(c)', label: 'Last Visited' },
};

export const NEWSPAPER_COMPONENT_RULES: Record<string, ComponentRuleMapping> = {
  author: { rule: 'R. 16.6(a)', label: 'Author' },
  title: { rule: 'R. 16.6', label: 'Article Title' },
  newspaperName: { rule: 'R. 16.6', label: 'Newspaper Name' },
  date: { rule: 'R. 16.6', label: 'Date' },
  page: { rule: 'R. 16.6(a)', label: 'Page' },
  section: { rule: 'R. 16.6(a)(ii)', label: 'Section' },
  designation: { rule: 'R. 16.6(a)(i)', label: 'Designation' },
  placeOfPublication: { rule: 'R. 16.6(b)', label: 'Place of Publication' },
  url: { rule: 'R. 16.6(f)', label: 'URL' },
  archiveUrl: { rule: 'R. 18.2.1(d)', label: 'Archive URL' },
};

export const UNPUBLISHED_COMPONENT_RULES: Record<string, ComponentRuleMapping> = {
  author: { rule: 'R. 17.1', label: 'Author' },
  title: { rule: 'R. 17.1', label: 'Title' },
  date: { rule: 'R. 17.1', label: 'Date' },
  institution: { rule: 'R. 17.2.2', label: 'Institution' },
  degree: { rule: 'R. 17.2.2', label: 'Degree' },
  workingPaperNumber: { rule: 'R. 17.4', label: 'Paper Number' },
  onFileWith: { rule: 'R. 17.2.1', label: 'On File With' },
  recipientName: { rule: 'R. 17.2.3', label: 'Recipient' },
  documentNature: { rule: 'R. 17.2.3', label: 'Document Type' },
  location: { rule: 'R. 17.2.5', label: 'Location' },
  eventDescription: { rule: 'R. 17.2.6', label: 'Event' },
  forthcomingYear: { rule: 'R. 17.3', label: 'Forthcoming Year' },
  manuscriptPage: { rule: 'R. 17.3', label: 'Manuscript Page' },
};

export const BRIEF_COMPONENT_RULES: Record<string, ComponentRuleMapping> = {
  documentType: { rule: 'B17.1', label: 'Document Type' },
  caseName: { rule: 'R. 10.8.3', label: 'Case Name' },
  docketNumber: { rule: 'R. 10.8.3', label: 'Docket Number' },
  court: { rule: 'R. 10.8.3', label: 'Court' },
  filedDate: { rule: 'B17.1 / T12', label: 'Filing Date' },
  pinCite: { rule: 'B17.1.2', label: 'Page Reference' },
  electronicDocket: { rule: 'B17.1.4', label: 'Electronic Docket' },
  party: { rule: 'B17.1.1', label: 'Party Designation' },
};

export const RECORD_COMPONENT_RULES: Record<string, ComponentRuleMapping> = {
  documentType: { rule: 'B17.1', label: 'Document Type' },
  pinCite: { rule: 'B17.1.2', label: 'Page Reference' },
  caseName: { rule: 'R. 10.8.3', label: 'Case Name' },
  docketNumber: { rule: 'R. 10.8.3', label: 'Docket Number' },
  court: { rule: 'R. 10.8.3', label: 'Court' },
  date: { rule: 'R. 10.8.3 / T12', label: 'Date' },
  electronicDocket: { rule: 'B17.1.4', label: 'Electronic Docket' },
  volume: { rule: 'B17.1.2', label: 'Volume' },
  exhibit: { rule: 'B17.1.2', label: 'Exhibit' },
};

export const TREATY_COMPONENT_RULES: Record<string, ComponentRuleMapping> = {
  name: { rule: 'R. 21.4.1', label: 'Treaty Name' },
  parties: { rule: 'R. 21.4.2', label: 'Parties' },
  subdivision: { rule: 'R. 21.4.3 / T16', label: 'Subdivision' },
  dateOfSigning: { rule: 'R. 21.4.4 / T12', label: 'Date of Signing' },
  sources: { rule: 'R. 21.4.5 / T4', label: 'Treaty Source' },
  enteredIntoForce: { rule: 'R. 21.4.4', label: 'Entered into Force' },
  hereinafter: { rule: 'R. 4.2(b)', label: 'Hereinafter' },
  treatyType: { rule: 'R. 21.4', label: 'Treaty Type' },
};

export const SHORT_FORM_COMPONENT_RULES: Record<string, ComponentRuleMapping> = {
  type: { rule: 'R. 4', label: 'Short Form Type' },
  partyName: { rule: 'R. 10.9', label: 'Party Name' },
  pinCite: { rule: 'R. 3.2(a)', label: 'Pinpoint Citation' },
  supraNoteNumber: { rule: 'R. 4.2(a)', label: 'Note Number' },
  infraNoteNumber: { rule: 'R. 3.5', label: 'Note Number' },
};

export function getComponentRules(citationType?: string): Record<string, ComponentRuleMapping> {
  switch (citationType) {
    case 'case': return CASE_COMPONENT_RULES;
    case 'statute': return STATUTE_COMPONENT_RULES;
    case 'constitution': return CONSTITUTION_COMPONENT_RULES;
    case 'regulation': return REGULATION_COMPONENT_RULES;
    case 'article': return ARTICLE_COMPONENT_RULES;
    case 'book': return BOOK_COMPONENT_RULES;
    case 'restatement': return RESTATEMENT_COMPONENT_RULES;
    case 'internet': return INTERNET_COMPONENT_RULES;
    case 'website': return WEBSITE_COMPONENT_RULES;
    case 'newspaper': return NEWSPAPER_COMPONENT_RULES;
    case 'ai_source': return AI_SOURCE_COMPONENT_RULES;
    case 'unpublished': return UNPUBLISHED_COMPONENT_RULES;
    case 'brief': return BRIEF_COMPONENT_RULES;
    case 'record': return RECORD_COMPONENT_RULES;
    case 'treaty': return TREATY_COMPONENT_RULES;
    case 'id':
    case 'supra':
    case 'infra':
    case 'short_form':
      return SHORT_FORM_COMPONENT_RULES;
    default: return CASE_COMPONENT_RULES;
  }
}
