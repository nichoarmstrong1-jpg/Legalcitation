import { Router, type Request, type Response } from 'express';
import { optionalAuth } from '../middleware/auth.js';
import { trackEvent } from '../services/analytics.js';

export const analyticsRouter = Router();

/**
 * POST /api/analytics/event — Log a user behavior event
 */
analyticsRouter.post('/event', optionalAuth, (req: Request, res: Response) => {
  const { eventType, eventData, sessionId } = req.body as {
    eventType: string;
    eventData?: Record<string, unknown>;
    sessionId?: string;
  };

  if (!eventType || typeof eventType !== 'string') {
    res.status(400).json({ error: 'eventType is required' });
    return;
  }

  trackEvent({
    userId: req.user?.userId,
    eventType,
    eventData,
    sessionId,
  });

  res.status(202).json({ accepted: true });
});
