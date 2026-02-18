export type CitationType =
  | 'case'
  | 'statute'
  | 'constitution'
  | 'regulation'
  | 'article'
  | 'book'
  | 'restatement'
  | 'internet'
  | 'ai_source'
  | 'unpublished'
  | 'short_form'
  | 'id'
  | 'supra'
  | 'infra'
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
export type FormatStyle = 'italics' | 'underline' | 'small_caps';

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
  /** Student-written piece designator: Note, Comment, Recent Development, Book Review, Essay */
  studentDesignator?: string;
  /** Whether the article is forthcoming (not yet published) */
  forthcoming?: boolean;
  /** Year of expected publication for forthcoming articles */
  forthcomingYear?: string;
  /** Manuscript page for pincites in forthcoming articles */
  manuscriptPage?: string;
  /** Repository for forthcoming article manuscripts */
  onFileWith?: string;
}

export interface BookComponents {
  authors: string[];
  title: string;
  section?: string;
  page?: string;
  pinCite?: string;
  volume?: string;
  edition?: string;
  publisher?: string;
  year: string;
  editor?: string;
  translator?: string;
}

export interface RestatementComponents {
  series: string;
  subject: string;
  section: string;
  pinCite?: string;
  organization?: string;
  year: string;
}

export interface InternetComponents {
  author?: string;
  title: string;
  websiteName?: string;
  date?: string;
  url: string;
  archiveUrl?: string;
  lastVisited?: string;
  pinCite?: string;
}

export interface AiSourceComponents {
  subtype: 'llm' | 'search' | 'generated_content';
  promptAuthor?: string;
  modelName: string;
  modelVersion?: string;
  prompt?: string;
  searchEngine?: string;
  query?: string;
  resultCount?: string;
  date: string;
  onFileWith?: string;
  contentDescription?: string;
  generatedByModel?: string;
}

export interface UnpublishedComponents {
  subtype: 'manuscript' | 'working_paper' | 'dissertation';
  author: string;
  title: string;
  page?: string;
  date: string;
  institution?: string;
  workingPaperNumber?: string;
  degree?: string;
  onFileWith?: string;
  pinCite?: string;
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
  /** The note number referenced by supra (e.g., "supra note 5" → 5). */
  supraNoteNumber?: number;
  /** The note number referenced by infra (e.g., "infra note 12" → 12). */
  infraNoteNumber?: number;
}

export type CitationComponents =
  | CaseComponents
  | StatuteComponents
  | ConstitutionComponents
  | RegulationComponents
  | ArticleComponents
  | BookComponents
  | RestatementComponents
  | InternetComponents
  | AiSourceComponents
  | UnpublishedComponents
  | ShortFormComponents;

export interface FootnoteContext {
  footnoteNumber: number;
  /** 0-based index of this citation within its footnote. */
  positionInFootnote: number;
  /** Total number of citations in this footnote. */
  totalInFootnote: number;
}

export interface ParsedCitation {
  id: string;
  rawText: string;
  type: CitationType;
  context: CitationContext;
  position: { start: number; end: number };
  components: CitationComponents;
  footnoteContext?: FootnoteContext;
}

export interface ValidationIssue {
  id: string;
  rule: string;
  source: IssueSource;
  severity: IssueSeverity;
  message: string;
  suggestion: string;
  position?: { start: number; end: number };
  antecedentIndex?: number;
  antecedentText?: string;
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

export interface PinpointMatchResult {
  documentId: string;
  documentName: string;
  matched: boolean;
  pages: Array<{ pageNumber: number; found: boolean; textSnippet?: string }>;
}

export interface ShortFormEntry {
  form: string;
  type: 'id' | 'id_pinpoint' | 'short_case' | 'supra';
  label: string;
  whenToUse: string;
  whereToPlace: string;
  warnings?: string[];
}

export interface ShortFormSuggestion {
  citationIndex: number;
  suggestedForm: string;
  reason: string;
  contextSnippet: string;
}

export interface FormattingDirective {
  start: number;
  end: number;
  style: 'italic' | 'roman' | 'small_caps';
  /** Which part of the citation this directive applies to (e.g., 'case_name', 'journal_title', 'author') */
  component: string;
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
  pinpointMatch?: PinpointMatchResult;
  shortForms?: (string | ShortFormEntry)[];
  shortFormSuggestions?: ShortFormSuggestion[];
  formattingDirectives?: FormattingDirective[];
}

export interface HistoryEntry {
  id: string;
  mode: 'in_text' | 'individual' | 'builder' | 'bulk' | 'footnote';
  input: string;
  results: AnalyzedCitation[];
  timestamp: string;
}

export interface DocumentCitationMap {
  footnotes: Map<number, ParsedCitation[]>;
  allCitations: ParsedCitation[];
  footnoteCount: number;
}

export interface CrossReferenceIssue {
  type: 'orphaned_supra' | 'orphaned_infra' | 'broken_id_chain'
    | 'cross_footnote_id_ambiguous' | 'unused_hereinafter' | 'unestablished_hereinafter';
  citationId: string;
  footnoteNumber?: number;
  message: string;
  suggestion: string;
  severity: IssueSeverity;
  referencedFootnote?: number;
}

export interface DocumentIntegrityReport {
  totalCitations: number;
  totalFootnotes: number;
  crossReferenceIssues: CrossReferenceIssue[];
  citationOrderIssues: ValidationIssue[];
}
