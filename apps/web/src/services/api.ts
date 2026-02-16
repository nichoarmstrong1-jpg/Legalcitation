import type {
  ShortFormEntry,
  ShortFormSuggestion,
  PinpointMatchResult,
} from '@legalcitation/shared';

export type { ShortFormEntry, ShortFormSuggestion };

export const API_BASE = import.meta.env.VITE_API_URL || '/api';

export interface AnalyzedCitation {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parsed: any;
  issues: ValidationIssue[];
  verificationStatus: string;
  verifiedCitation?: string;
  verifiedCitationHtml?: string;
  discrepancies: { component: string; userValue: string; verifiedValue: string }[];
  referenceExamples: { source: string; context: string; url?: string }[];
  logicTrace: string[];
  score: number;
  shortForms?: (string | ShortFormEntry)[];
  shortFormSuggestions?: ShortFormSuggestion[];
  pinpointMatch?: PinpointMatchResult;
}

export interface ValidationIssue {
  id: string;
  rule: string;
  source: 'Bluebook' | 'Indigo' | 'Context' | 'Verification';
  severity: 'error' | 'warning' | 'suggestion';
  message: string;
  suggestion: string;
}

export interface AnalyzeResponse {
  results: AnalyzedCitation[];
  citationCount: number;
}

export async function analyzeText(
  text: string,
  context = 'citation_sentence',
  documentIds?: string[]
): Promise<AnalyzeResponse> {
  const body: Record<string, unknown> = { text, context };
  if (documentIds && documentIds.length > 0) {
    body.documentIds = documentIds;
  }

  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    throw new Error(errBody?.message || errBody?.error || `Analysis failed: ${res.status}`);
  }
  return res.json();
}

export interface CaseSearchResult {
  caseName: string;
  citation: string;
  year: string;
  court: string;
  summary: string;
  confidence: number;
}

export interface CaseSearchResponse {
  results: CaseSearchResult[];
  logicTrace: string[];
}

export async function searchCases(query: string): Promise<CaseSearchResponse> {
  const res = await fetch(`${API_BASE}/build/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ query }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || body?.error || `Search failed: ${res.status}`);
  }
  return res.json();
}

export async function buildCitation(input: string): Promise<AnalyzedCitation> {
  const res = await fetch(`${API_BASE}/build`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ input }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || body?.error || `Build failed: ${res.status}`);
  }
  return res.json();
}

export interface UploadError {
  error: string;
  suggestion?: string;
  code?: string;
}

export async function uploadFile(file: File): Promise<{ extractedText: string; fileName: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null) as UploadError | null;
    const err = new Error(body?.error || `Upload failed: ${res.status}`);
    if (body?.suggestion) (err as UploadErrorWithSuggestion).suggestion = body.suggestion;
    if (body?.code) (err as UploadErrorWithSuggestion).code = body.code;
    throw err;
  }
  return res.json();
}

export interface UploadErrorWithSuggestion extends Error {
  suggestion?: string;
  code?: string;
}

export async function submitFeedback(data: {
  rating: number;
  comment?: string;
  citationText?: string;
  expectedOutput?: string;
}): Promise<void> {
  await fetch(`${API_BASE}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
}

// --- Case Documents API ---

export interface CaseDocument {
  id: string;
  fileName: string;
  caseName: string | null;
  citation: string | null;
  fileSize: number;
  pageCount: number | null;
  uploadedAt: string;
}

export interface CaseDocumentFull extends CaseDocument {
  extractedText: string;
  pageMapping: { pageNumber: number; startOffset: number; endOffset: number; text: string }[] | null;
}

export async function uploadCaseDocuments(files: File[]): Promise<{ documents: CaseDocument[] }> {
  const formData = new FormData();
  for (const file of files) {
    formData.append('files', file);
  }

  const res = await fetch(`${API_BASE}/case-documents`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || body?.error || `Upload failed: ${res.status}`);
  }
  return res.json();
}

export async function getCaseDocuments(): Promise<{ documents: CaseDocument[] }> {
  const res = await fetch(`${API_BASE}/case-documents`, {
    credentials: 'include',
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || body?.error || `Failed to fetch documents: ${res.status}`);
  }
  return res.json();
}

export async function getCaseDocument(id: string): Promise<CaseDocumentFull> {
  const res = await fetch(`${API_BASE}/case-documents/${id}`, {
    credentials: 'include',
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || body?.error || `Failed to fetch document: ${res.status}`);
  }
  return res.json();
}

export async function deleteCaseDocument(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/case-documents/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || body?.error || `Failed to delete document: ${res.status}`);
  }
}

// --- Spading API ---

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parsedCitation: any;
  status: AnnotationStatus;
  issues: ValidationIssue[];
  score: number | null;
  verifiedCitation: string | null;
  discrepancies: { component: string; userValue: string; verifiedValue: string }[];
  logicTrace: string[];
  matchedDocumentId: string | null;
  matchedPageNumber: number | null;
  matchedTextSnippet: string | null;
  quotedText: string | null;
  sourceText: string | null;
  quoteAccurate: boolean | null;
  editorNote: string | null;
  resolved: boolean;
}

export interface SpadingProgressEvent {
  progress: number;
  currentStep: string;
  citationIndex?: number;
  totalCitations?: number;
  status: 'processing' | 'completed' | 'error';
  errorMessage?: string;
}

export async function createSpadingProject(
  name: string,
  description?: string
): Promise<SpadingProject> {
  const res = await fetch(`${API_BASE}/spading/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ name, description }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Failed to create project: ${res.status}`);
  }
  return res.json();
}

export async function getSpadingProjects(): Promise<SpadingProject[]> {
  const res = await fetch(`${API_BASE}/spading/projects`, {
    credentials: 'include',
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Failed to list projects: ${res.status}`);
  }
  const data = await res.json();
  return data.projects;
}

export async function getSpadingProject(id: string): Promise<SpadingProject> {
  const res = await fetch(`${API_BASE}/spading/projects/${id}`, {
    credentials: 'include',
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Failed to get project: ${res.status}`);
  }
  return res.json();
}

export async function updateSpadingProject(
  id: string,
  data: { name?: string; description?: string }
): Promise<SpadingProject> {
  const res = await fetch(`${API_BASE}/spading/projects/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Failed to update project: ${res.status}`);
  }
  return res.json();
}

export async function deleteSpadingProject(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/spading/projects/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Failed to delete project: ${res.status}`);
  }
}

export async function uploadProjectDocuments(
  projectId: string,
  files: File[],
  role: DocumentRole
): Promise<{ documents: ProjectDocument[] }> {
  const formData = new FormData();
  formData.append('role', role);
  for (const file of files) {
    formData.append('files', file);
  }

  const res = await fetch(`${API_BASE}/spading/projects/${projectId}/documents`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Failed to upload documents: ${res.status}`);
  }
  return res.json();
}

export async function getProjectDocuments(
  projectId: string
): Promise<ProjectDocument[]> {
  const res = await fetch(`${API_BASE}/spading/projects/${projectId}/documents`, {
    credentials: 'include',
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Failed to list documents: ${res.status}`);
  }
  const data = await res.json();
  return data.documents;
}

export async function getProjectDocument(
  projectId: string,
  documentId: string
): Promise<ProjectDocument & { extractedText: string }> {
  const res = await fetch(
    `${API_BASE}/spading/projects/${projectId}/documents/${documentId}`,
    { credentials: 'include' }
  );
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Failed to get document: ${res.status}`);
  }
  return res.json();
}

export async function deleteProjectDocument(
  projectId: string,
  documentId: string
): Promise<void> {
  const res = await fetch(
    `${API_BASE}/spading/projects/${projectId}/documents/${documentId}`,
    { method: 'DELETE', credentials: 'include' }
  );
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Failed to delete document: ${res.status}`);
  }
}

export function getProjectDocumentFileUrl(
  projectId: string,
  documentId: string
): string {
  return `${API_BASE}/spading/projects/${projectId}/documents/${documentId}/file`;
}

export async function runSpading(projectId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/spading/projects/${projectId}/run`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Failed to start spading: ${res.status}`);
  }
}

export async function getSpadingAnnotations(
  projectId: string
): Promise<SpadingAnnotation[]> {
  const res = await fetch(`${API_BASE}/spading/projects/${projectId}/annotations`, {
    credentials: 'include',
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Failed to get annotations: ${res.status}`);
  }
  const data = await res.json();
  return data.annotations;
}

export async function updateSpadingAnnotation(
  projectId: string,
  annotationId: string,
  data: { editorNote?: string; resolved?: boolean }
): Promise<SpadingAnnotation> {
  const res = await fetch(
    `${API_BASE}/spading/projects/${projectId}/annotations/${annotationId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    }
  );
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Failed to update annotation: ${res.status}`);
  }
  return res.json();
}

export function subscribeSpadingProgress(
  projectId: string,
  onEvent: (event: SpadingProgressEvent) => void
): () => void {
  const url = `${API_BASE}/spading/projects/${projectId}/progress`;
  const eventSource = new EventSource(url, { withCredentials: true });

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data) as SpadingProgressEvent;
      onEvent(data);

      if (data.status === 'completed' || data.status === 'error') {
        eventSource.close();
      }
    } catch {
      // Ignore parse errors
    }
  };

  eventSource.onerror = () => {
    eventSource.close();
  };

  return () => eventSource.close();
}
