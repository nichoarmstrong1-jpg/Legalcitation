export const API_BASE = import.meta.env.VITE_API_URL || '/api';

export interface AnalyzedCitation {
  parsed: any;
  issues: ValidationIssue[];
  verificationStatus: string;
  verifiedCitation?: string;
  verifiedCitationHtml?: string;
  discrepancies: { component: string; userValue: string; verifiedValue: string }[];
  referenceExamples: { source: string; context: string; url?: string }[];
  logicTrace: string[];
  score: number;
  shortForms?: string[];
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

export async function analyzeText(text: string, context = 'citation_sentence'): Promise<AnalyzeResponse> {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ text, context }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || body?.error || `Analysis failed: ${res.status}`);
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

export async function uploadFile(file: File): Promise<{ extractedText: string; fileName: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/upload`, {
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
