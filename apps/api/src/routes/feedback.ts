import { Router, type Request, type Response } from 'express';
import { eq, sql } from 'drizzle-orm';
import { getDb, isDatabaseConfigured, schema } from '../db/index.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';

export const feedbackRouter = Router();

feedbackRouter.use((_req: Request, res: Response, next) => {
  if (!isDatabaseConfigured()) {
    res.status(503).json({ error: 'Feedback is not yet configured. Coming soon!' });
    return;
  }
  next();
});

/**
 * POST /api/feedback — Submit feedback on a citation result
 */
feedbackRouter.post('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { rating, comment, citationText, expectedOutput, citationHistoryId } = req.body as {
      rating: number;
      comment?: string;
      citationText?: string;
      expectedOutput?: string;
      citationHistoryId?: string;
    };

    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({ error: 'Rating must be between 1 and 5' });
      return;
    }

    const db = getDb();

    await db.insert(schema.feedback).values({
      userId: req.user?.userId || null,
      citationHistoryId: citationHistoryId || null,
      rating,
      comment: comment || null,
      citationText: citationText || null,
      expectedOutput: expectedOutput || null,
    });

    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Feedback error:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

/**
 * GET /api/feedback/stats — Aggregated feedback stats (authenticated users only)
 */
feedbackRouter.get('/stats', requireAuth, async (req: Request, res: Response) => {
  try {
    const db = getDb();

    const [stats] = await db.select({
      totalFeedback: sql<number>`count(*)::int`,
      averageRating: sql<number>`round(avg(${schema.feedback.rating})::numeric, 2)::float`,
      positiveCount: sql<number>`count(*) filter (where ${schema.feedback.rating} >= 4)::int`,
      negativeCount: sql<number>`count(*) filter (where ${schema.feedback.rating} <= 2)::int`,
    }).from(schema.feedback);

    res.json({
      total: stats?.totalFeedback || 0,
      averageRating: stats?.averageRating || 0,
      positive: stats?.positiveCount || 0,
      negative: stats?.negativeCount || 0,
    });
  } catch (error) {
    console.error('Feedback stats error:', error);
    res.status(500).json({ error: 'Failed to get feedback stats' });
  }
});
