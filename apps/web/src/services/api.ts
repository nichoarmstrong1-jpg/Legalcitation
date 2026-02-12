const API_BASE = import.meta.env.VITE_API_URL || '/api';

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

/** Suggestion response from Tier 4 fallback (case name detected, AI lookup) */
export interface SuggestionResponse {
  suggestion: true;
  suggestedCitation: string;
  suggestedComponents: Record<string, string>;
  originalInput: string;
  logicTrace: string[];
  message: string;
}

/** Guidance response from Tier 5 (could not parse) */
export interface GuidanceResponse {
  suggestion: false;
  originalInput: string;
  message: string;
  examples: string[];
  logicTrace: string[];
}

/** Union type for /analyze/single responses */
export type SingleAnalysisResult = AnalyzedCitation | SuggestionResponse | GuidanceResponse;

export function isSuggestionResponse(result: SingleAnalysisResult): result is SuggestionResponse {
  return 'suggestion' in result && result.suggestion === true;
}

export function isGuidanceResponse(result: SingleAnalysisResult): result is GuidanceResponse {
  return 'suggestion' in result && result.suggestion === false;
}

export function isAnalyzedCitation(result: SingleAnalysisResult): result is AnalyzedCitation {
  return 'score' in result;
}

export async function analyzeText(text: string, context = 'citation_sentence'): Promise<AnalyzeResponse> {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, context }),
  });
  if (!res.ok) throw new Error(`Analysis failed: ${res.statusText}`);
  return res.json();
}

export async function analyzeSingle(citation: string, context = 'citation_sentence'): Promise<SingleAnalysisResult> {
  const res = await fetch(`${API_BASE}/analyze/single`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ citation, context }),
  });
  if (!res.ok) throw new Error(`Analysis failed: ${res.statusText}`);
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
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error(`Search failed: ${res.statusText}`);
  return res.json();
}

export async function buildCitation(input: string): Promise<AnalyzedCitation> {
  const res = await fetch(`${API_BASE}/build`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input }),
  });
  if (!res.ok) throw new Error(`Build failed: ${res.statusText}`);
  return res.json();
}

export async function uploadFile(file: File): Promise<{ extractedText: string; fileName: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
  return res.json();
}
