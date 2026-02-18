import type {
  AnalyzedCitation,
  ValidationIssue,
  DocumentIntegrityReport,
  ShortFormEntry,
  ShortFormSuggestion,
  ParsedCitation,
} from '@legalcitation/shared';

export type { AnalyzedCitation, ValidationIssue, DocumentIntegrityReport, ShortFormEntry, ShortFormSuggestion };

export const API_BASE = import.meta.env.VITE_API_URL || '/api';

// --- Authenticated Fetch with Automatic Token Refresh ---

let refreshPromise: Promise<boolean> | null = null;

async function attemptTokenRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Wrapper around fetch that automatically refreshes the access token
 * when a 401 is returned. Deduplicates concurrent refresh attempts.
 * On permanent auth failure, dispatches 'auth:session-expired' so
 * the AuthContext can clear the user state.
 */
export async function authenticatedFetch(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const mergedOptions: RequestInit = { ...options, credentials: 'include' };
  const res = await fetch(url, mergedOptions);

  if (res.status !== 401) return res;

  // 401 — attempt a single token refresh, deduplicating concurrent calls
  if (!refreshPromise) {
    refreshPromise = attemptTokenRefresh().finally(() => {
      refreshPromise = null;
    });
  }

  const refreshed = await refreshPromise;

  if (refreshed) {
    // Retry the original request with the fresh cookie
    return fetch(url, mergedOptions);
  }

  // Refresh also failed — session is dead
  window.dispatchEvent(new CustomEvent('auth:session-expired'));
  return res;
}

export interface AnalyzeResponse {
  results: AnalyzedCitation[];
  citationCount: number;
}

export interface FootnoteSummary {
  number: number;
  citationCount: number;
  citationIds: string[];
}

export interface FootnoteAnalyzeResponse extends AnalyzeResponse {
  footnoteCount: number;
  footnotes: FootnoteSummary[];
  integrityReport: DocumentIntegrityReport;
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

  const res = await authenticatedFetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    throw new Error(errBody?.message || errBody?.error || `Analysis failed: ${res.status}`);
  }
  return res.json();
}

export async function analyzeFootnotes(
  text: string,
  documentIds?: string[]
): Promise<FootnoteAnalyzeResponse> {
  const body: Record<string, unknown> = { text };
  if (documentIds && documentIds.length > 0) {
    body.documentIds = documentIds;
  }

  const res = await authenticatedFetch(`${API_BASE}/analyze/footnotes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    throw new Error(errBody?.message || errBody?.error || `Footnote analysis failed: ${res.status}`);
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
  const res = await authenticatedFetch(`${API_BASE}/build/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || body?.error || `Search failed: ${res.status}`);
  }
  return res.json();
}

export async function buildCitation(input: string): Promise<AnalyzedCitation> {
  const res = await authenticatedFetch(`${API_BASE}/build`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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

  const res = await authenticatedFetch(`${API_BASE}/upload`, {
    method: 'POST',
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
  await authenticatedFetch(`${API_BASE}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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

  const res = await authenticatedFetch(`${API_BASE}/case-documents`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || body?.error || `Upload failed: ${res.status}`);
  }
  return res.json();
}

export async function getCaseDocuments(): Promise<{ documents: CaseDocument[] }> {
  const res = await authenticatedFetch(`${API_BASE}/case-documents`);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || body?.error || `Failed to fetch documents: ${res.status}`);
  }
  return res.json();
}

export async function getCaseDocument(id: string): Promise<CaseDocumentFull> {
  const res = await authenticatedFetch(`${API_BASE}/case-documents/${id}`);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || body?.error || `Failed to fetch document: ${res.status}`);
  }
  return res.json();
}

export async function deleteCaseDocument(id: string): Promise<void> {
  const res = await authenticatedFetch(`${API_BASE}/case-documents/${id}`, {
    method: 'DELETE',
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
  parsedCitation: ParsedCitation | null;
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
  const res = await authenticatedFetch(`${API_BASE}/spading/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Failed to create project: ${res.status}`);
  }
  return res.json();
}

export async function getSpadingProjects(): Promise<SpadingProject[]> {
  const res = await authenticatedFetch(`${API_BASE}/spading/projects`);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Failed to list projects: ${res.status}`);
  }
  const data = await res.json();
  return data.projects;
}

export async function getSpadingProject(id: string): Promise<SpadingProject> {
  const res = await authenticatedFetch(`${API_BASE}/spading/projects/${id}`);
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
  const res = await authenticatedFetch(`${API_BASE}/spading/projects/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Failed to update project: ${res.status}`);
  }
  return res.json();
}

export async function deleteSpadingProject(id: string): Promise<void> {
  const res = await authenticatedFetch(`${API_BASE}/spading/projects/${id}`, {
    method: 'DELETE',
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

  const res = await authenticatedFetch(`${API_BASE}/spading/projects/${projectId}/documents`, {
    method: 'POST',
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
  const res = await authenticatedFetch(`${API_BASE}/spading/projects/${projectId}/documents`);
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
  const res = await authenticatedFetch(
    `${API_BASE}/spading/projects/${projectId}/documents/${documentId}`
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
  const res = await authenticatedFetch(
    `${API_BASE}/spading/projects/${projectId}/documents/${documentId}`,
    { method: 'DELETE' }
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
  const res = await authenticatedFetch(`${API_BASE}/spading/projects/${projectId}/run`, {
    method: 'POST',
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Failed to start spading: ${res.status}`);
  }
}

export async function getSpadingAnnotations(
  projectId: string
): Promise<SpadingAnnotation[]> {
  const res = await authenticatedFetch(`${API_BASE}/spading/projects/${projectId}/annotations`);
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
  const res = await authenticatedFetch(
    `${API_BASE}/spading/projects/${projectId}/annotations/${annotationId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
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
  let eventSource: EventSource | null = null;
  let closed = false;
  let retryCount = 0;
  const MAX_RETRIES = 5;

  async function ensureFreshAuth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, { credentials: 'include' });
      if (res.ok) return true;
      // Access token expired — try refresh
      const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      return refreshRes.ok;
    } catch {
      return false;
    }
  }

  async function connect() {
    if (closed) return;

    // On reconnections (retryCount > 0), refresh the token first
    if (retryCount > 0) {
      const authed = await ensureFreshAuth();
      if (!authed && !closed) {
        window.dispatchEvent(new CustomEvent('auth:session-expired'));
        return;
      }
    }

    if (closed) return;

    const url = `${API_BASE}/spading/projects/${projectId}/progress`;
    eventSource = new EventSource(url, { withCredentials: true });

    eventSource.onmessage = (event) => {
      retryCount = 0;
      try {
        const data = JSON.parse(event.data) as SpadingProgressEvent;
        onEvent(data);

        if (data.status === 'completed' || data.status === 'error') {
          closed = true;
          eventSource?.close();
        }
      } catch {
        // Ignore parse errors
      }
    };

    eventSource.onerror = () => {
      eventSource?.close();
      if (!closed && retryCount < MAX_RETRIES) {
        retryCount++;
        const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
        setTimeout(() => { connect(); }, delay);
      }
    };
  }

  connect();

  return () => {
    closed = true;
    eventSource?.close();
  };
}

// --- Profile API ---

export async function updateProfile(
  data: { name?: string; formatPreference?: string }
): Promise<{ user: { id: string; email: string; name: string | null; formatPreference?: string; isAdmin?: boolean; oauthProvider?: string; plan?: string; createdAt?: string } }> {
  const res = await authenticatedFetch(`${API_BASE}/auth/me`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Failed to update profile: ${res.status}`);
  }
  return res.json();
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const res = await authenticatedFetch(`${API_BASE}/auth/password`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Failed to change password: ${res.status}`);
  }
}

export async function deleteAccount(confirmation: string): Promise<void> {
  const res = await authenticatedFetch(`${API_BASE}/auth/me`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ confirmation }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Failed to delete account: ${res.status}`);
  }
}
