import type { CitationTypeId } from '@legalcitation/shared';

export interface BluebookRule {
  id: string; // Unique rule identifier, e.g. "case-party-abbreviation"
  rule: string; // Bluebook rule reference, e.g. "R. 10.2.1(c)"
  description: string; // Human-readable description
  validate: (components: CitationComponents) => ValidationResult;
  fix?: (components: CitationComponents) => CitationComponents;
  severity: 'error' | 'warning' | 'suggestion';
}

export interface ValidationResult {
  valid: boolean;
  ruleId: string;
  rule: string; // Bluebook rule reference
  message: string; // What's wrong
  field?: string; // Which component field has the issue
  suggestion?: string; // How to fix it
  autoFixable: boolean; // Can we fix it automatically?
}

export interface CitationComponents {
  [key: string]: string | undefined;
}

export interface FormattedCitation {
  full: string; // Full Bluebook citation
  shortForm: string | null; // Short form for subsequent references
  footnote: string; // Footnote variant (law review style)
  courtDoc: string; // Court document variant (practitioner style)
  components: CitationComponents;
  validationResults: ValidationResult[];
  confidence: number; // 0-1
}

// Per-type component interfaces — extend CitationComponents
export interface CaseComponents extends CitationComponents {
  partyOne?: string;
  partyTwo?: string;
  volume?: string;
  reporter?: string;
  firstPage?: string;
  year?: string;
  pinCite?: string;
  court?: string;
  parallelCitations?: string;
  subsequentHistory?: string;
  priorHistory?: string;
}

export interface StatuteComponents extends CitationComponents {
  title?: string;
  code?: string;
  section?: string;
  year?: string;
  supplement?: string;
  subsection?: string;
  sessionLaw?: string;
}

export interface ConstitutionComponents extends CitationComponents {
  jurisdiction?: string;
  articleOrAmendment?: string;
  section?: string;
  clause?: string;
  repealed?: string;
}

export interface RegulationComponents extends CitationComponents {
  title?: string;
  source?: string;
  section?: string;
  year?: string;
  subsection?: string;
  federalRegisterVol?: string;
  federalRegisterPage?: string;
}

export interface JournalArticleComponents extends CitationComponents {
  author?: string;
  title?: string;
  volume?: string;
  journal?: string;
  firstPage?: string;
  year?: string;
  pinCite?: string;
  doi?: string;
  url?: string;
}

export interface BookComponents extends CitationComponents {
  author?: string;
  title?: string;
  pageOrSection?: string;
  edition?: string;
  year?: string;
  volume?: string;
  publisher?: string;
  editor?: string;
  translator?: string;
}

export interface ReportComponents extends CitationComponents {
  author?: string;
  title?: string;
  reportNumber?: string;
  year?: string;
  url?: string;
  publisher?: string;
}

export interface RestatementComponents extends CitationComponents {
  series?: string;
  subject?: string;
  section?: string;
  year?: string;
  comment?: string;
  illustration?: string;
  publisher?: string;
}

export interface LegislativeComponents extends CitationComponents {
  documentType?: string;
  number?: string;
  congress?: string;
  session?: string;
  year?: string;
  page?: string;
  title?: string;
  committee?: string;
}

export interface WebsiteComponents extends CitationComponents {
  author?: string;
  title?: string;
  websiteName?: string;
  date?: string;
  url?: string;
  lastVisited?: string;
  archiveUrl?: string;
}

export interface NewspaperComponents extends CitationComponents {
  author?: string;
  title?: string;
  newspaper?: string;
  date?: string;
  page?: string;
  url?: string;
  section?: string;
}

export interface UnpublishedComponents extends CitationComponents {
  author?: string;
  title?: string;
  year?: string;
  institution?: string;
  paperNumber?: string;
  url?: string;
  status?: string;
}

export interface AiSourceComponents extends CitationComponents {
  model?: string;
  promptDescription?: string;
  date?: string;
  version?: string;
  onFileWith?: string;
}

export interface SocialMediaComponents extends CitationComponents {
  author?: string;
  handle?: string;
  platform?: string;
  date?: string;
  time?: string;
  url?: string;
  content?: string;
}

export interface AudioVideoComponents extends CitationComponents {
  title?: string;
  medium?: string;
  date?: string;
  author?: string;
  publisher?: string;
  url?: string;
  episodeTitle?: string;
  timestamp?: string;
}

export interface BriefComponents extends CitationComponents {
  documentType?: string;
  page?: string;
  caseName?: string;
  docketNumber?: string;
  court?: string;
  date?: string;
  author?: string;
  url?: string;
}

export interface RecordComponents extends CitationComponents {
  documentType?: string;
  page?: string;
  caseName?: string;
  docketNumber?: string;
  court?: string;
  date?: string;
}

export interface TreatyComponents extends CitationComponents {
  name?: string;
  dateAdopted?: string;
  dateInForce?: string;
  source?: string;
  parties?: string;
  url?: string;
  articleOrSection?: string;
}
