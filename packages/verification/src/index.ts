export { verifyCaseCitation, type FullVerificationResult } from './verifier.js';
export { verifyWithClaude, buildCitationWithClaude, searchCasesWithClaude, type CaseSearchResult } from './providers/claude-provider.js';
export { detectMissedCitations, type LLMDetectedSpan, type DetectMissedResult } from './providers/llm-detector.js';
export {
  verifyWithCourtListener,
  lookupCitation,
  lookupCitationsInText,
  searchCourtListenerCases,
  hasCourtListenerToken,
  type CitationLookupResult,
  type ClusterObject,
  type SearchHit,
} from './providers/courtlistener-provider.js';
export { caseNamesOverlap } from './utils.js';
