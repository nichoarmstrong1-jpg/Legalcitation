import { API_BASE } from './api.ts';

let currentSessionId: string | null = null;

function getSessionId(): string {
  if (!currentSessionId) {
    currentSessionId = crypto.randomUUID();
  }
  return currentSessionId;
}

export function trackEvent(eventType: string, eventData?: Record<string, unknown>): void {
  fetch(`${API_BASE}/analytics/event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      eventType,
      eventData,
      sessionId: getSessionId(),
    }),
  }).catch(() => {
    // Silently fail — analytics should never disrupt the user
  });
}
