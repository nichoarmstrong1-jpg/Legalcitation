import { tryGetDb, schema } from '../db/index.js';

interface TrackEventParams {
  userId?: string;
  eventType: string;
  eventData?: Record<string, unknown>;
  sessionId?: string;
}

/**
 * Fire-and-forget event tracking. Never throws or blocks the request.
 */
export function trackEvent(params: TrackEventParams): void {
  const db = tryGetDb();
  if (!db) return;

  db.insert(schema.userEvents)
    .values({
      userId: params.userId || null,
      eventType: params.eventType,
      eventData: params.eventData || null,
      sessionId: params.sessionId || null,
    })
    .catch(err => console.error('Analytics tracking error:', err));
}
