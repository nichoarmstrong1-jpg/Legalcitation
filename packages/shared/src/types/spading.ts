import type { ParsedCitation, ValidationIssue, CitationDiscrepancy } from './citation.js';

export type SpadingStatus = 'draft' | 'processing' | 'completed' | 'error';
export type DocumentRole = 'journal_entry' | 'source';
export type AnnotationStatus =
  | 'verified'
  | 'partial_match'
  | 'not_found'
  | 'format_error'
  | 'quote_mismatch'
  | 'pending'
  | 'error';

export interface SpadingProject {
  id: string;
  name: string;
  description: string | null;
  status: SpadingStatus;
  journalDocumentId: string | null;
  citationCount: number | null;
  verifiedCount: number | null;
  issueCount: number | null;
  progress: number;
  currentStep: string | null;
  errorMessage: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDocument {
  id: string;
  projectId: string;
  role: DocumentRole;
  fileName: string;
  mimeType: string;
  fileSize: number;
  pageCount: number | null;
  caseName: string | null;
  citation: string | null;
  uploadedAt: string;
}

export interface SpadingAnnotation {
  id: string;
  projectId: string;
  startOffset: number;
  endOffset: number;
  rawCitationText: string;
  parsedCitation: ParsedCitation;
  status: AnnotationStatus;
  issues: ValidationIssue[];
  score: number | null;
  verifiedCitation: string | null;
  discrepancies: CitationDiscrepancy[];
  logicTrace: string[];
  matchedDocumentId: string | null;
  matchedPageNumber: number | null;
  matchedTextSnippet: string | null;
  quotedText: string | null;
  sourceText: string | null;
  quoteAccurate: boolean | null;
  editorNote: string | null;
  resolved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SpadingProgressEvent {
  progress: number;
  currentStep: string;
  citationIndex?: number;
  totalCitations?: number;
  status: 'processing' | 'completed' | 'error';
  errorMessage?: string;
}
