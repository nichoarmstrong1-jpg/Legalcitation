export type CitationType =
  | 'case'
  | 'statute'
  | 'constitution'
  | 'regulation'
  | 'article'
  | 'short_form'
  | 'id'
  | 'supra'
  | 'unknown';

export type CitationContext =
  | 'textual_sentence'
  | 'citation_sentence'
  | 'citation_clause';

export type VerificationStatus =
  | 'verified'
  | 'not_found'
  | 'partial_match'
  | 'pending'
  | 'error';

export type IssueSeverity = 'error' | 'warning' | 'suggestion';
export type IssueSource = 'Bluebook' | 'Indigo' | 'Context' | 'Verification';
export type FormatStyle = 'italics' | 'underline';

export interface CaseComponents {
  partyOne: string;
  partyTwo: string;
  volume: string;
  reporter: string;
  firstPage: string;
  pinCite?: string;
  court?: string;
  year: string;
  parentheticals?: string[];
  subsequentHistory?: string;
  docketNumber?: string;
  database?: string;
  electronicReportNumber?: string;
}

export interface StatuteComponents {
  title: string;
  code: string;
  section: string;
  year?: string;
  supplement?: string;
}

export interface ConstitutionComponents {
  jurisdiction: string;
  article?: string;
  amendment?: string;
  section?: string;
  clause?: string;
}

export interface RegulationComponents {
  title: string;
  source: string;
  section: string;
  year?: string;
}

export interface ArticleComponents {
  authors: string[];
  title: string;
  journal: string;
  volume: string;
  firstPage: string;
  pinCite?: string;
  year: string;
}

export interface ShortFormComponents {
  type: 'id' | 'supra' | 'hereinafter' | 'short_case' | 'short_statute';
  pinCite?: string;
  antecedentId?: string;
  partyName?: string;
  /** Whether the short-form term (Id., supra, etc.) is italicized in the source text. */
  italicized?: boolean;
  /** Number of authorities in the immediately preceding citation (for Id. validation). */
  precedingCitationCount?: number;
  /** Whether a hereinafter designation was established in the first citation to the source. */
  hereinafterEstablished?: boolean;
}

export type CitationComponents =
  | CaseComponents
  | StatuteComponents
  | ConstitutionComponents
  | RegulationComponents
  | ArticleComponents
  | ShortFormComponents;

export interface ParsedCitation {
  id: string;
  rawText: string;
  type: CitationType;
  context: CitationContext;
  position: { start: number; end: number };
  components: CitationComponents;
}

export interface ValidationIssue {
  id: string;
  rule: string;
  source: IssueSource;
  severity: IssueSeverity;
  message: string;
  suggestion: string;
  position?: { start: number; end: number };
}

export interface CitationDiscrepancy {
  component: string;
  userValue: string;
  verifiedValue: string;
}

export interface ReferenceExample {
  source: string;
  context: string;
  url?: string;
}

export interface AnalyzedCitation {
  parsed: ParsedCitation;
  issues: ValidationIssue[];
  verificationStatus: VerificationStatus;
  verifiedCitation?: string;
  verifiedCitationHtml?: string;
  discrepancies: CitationDiscrepancy[];
  referenceExamples: ReferenceExample[];
  logicTrace: string[];
  score: number;
}

export interface HistoryEntry {
  id: string;
  mode: 'in_text' | 'individual' | 'builder' | 'bulk';
  input: string;
  results: AnalyzedCitation[];
  timestamp: string;
}
