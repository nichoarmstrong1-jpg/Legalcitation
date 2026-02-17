import { tryGetDb, schema } from '../db/index.js';
import { trackEvent } from './analytics.js';

/**
 * Fire-and-forget citation logging for data collection and accuracy monitoring.
 * Logs every citation check (input + output) to the citation_history table.
 * Never throws or blocks the request — errors are silently caught.
 */
export function logCitationCheck(params: {
  userId?: string;
  mode: string;
  inputText: string;
  results: unknown;
  citationCount: number;
  averageScore?: number;
}): void {
  const db = tryGetDb();
  if (!db) return;

  db.insert(schema.citationHistory)
    .values({
      userId: params.userId || null,
      mode: params.mode,
      inputText: params.inputText,
      results: params.results,
      citationCount: params.citationCount,
      averageScore: params.averageScore ?? null,
    })
    .catch(err => console.error('Citation logging error:', err));

  trackEvent({
    userId: params.userId,
    eventType: 'citation_check_server',
    eventData: {
      mode: params.mode,
      citationCount: params.citationCount,
      averageScore: params.averageScore,
    },
  });
}
