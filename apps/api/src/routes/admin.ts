import { Router, type Request, type Response } from 'express';
import { sql, desc } from 'drizzle-orm';
import { getDb, isDatabaseConfigured, schema } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import { computeImprovementInsights } from '../services/improvement-pipeline.js';
import { getCached, setCache } from '../services/cache.js';

export const adminRouter = Router();

adminRouter.use(requireAuth);
adminRouter.use(requireAdmin);

adminRouter.use((_req: Request, res: Response, next) => {
  if (!isDatabaseConfigured()) {
    res.status(503).json({ error: 'Database not configured' });
    return;
  }
  next();
});

/**
 * GET /api/admin/stats — Overview dashboard stats
 */
adminRouter.get('/stats', async (_req: Request, res: Response) => {
  try {
    const cacheKey = 'admin:stats';
    const cached = await getCached<Record<string, unknown>>(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }

    const db = getDb();

    const [userStats] = await db.select({
      total: sql<number>`count(*)::int`,
      last7Days: sql<number>`count(*) filter (where ${schema.users.createdAt} > now() - interval '7 days')::int`,
      last30Days: sql<number>`count(*) filter (where ${schema.users.createdAt} > now() - interval '30 days')::int`,
    }).from(schema.users);

    const [feedbackStats] = await db.select({
      total: sql<number>`count(*)::int`,
      avgRating: sql<number>`round(coalesce(avg(${schema.feedback.rating}), 0)::numeric, 2)::float`,
      positive: sql<number>`count(*) filter (where ${schema.feedback.rating} >= 4)::int`,
      negative: sql<number>`count(*) filter (where ${schema.feedback.rating} <= 2)::int`,
    }).from(schema.feedback);

    const [citationStats] = await db.select({
      total: sql<number>`count(*)::int`,
      last7Days: sql<number>`count(*) filter (where ${schema.citationHistory.createdAt} > now() - interval '7 days')::int`,
    }).from(schema.citationHistory);

    const featureUsage = await db.select({
      eventType: schema.userEvents.eventType,
      count: sql<number>`count(*)::int`,
    }).from(schema.userEvents)
      .groupBy(schema.userEvents.eventType)
      .orderBy(desc(sql`count(*)`))
      .limit(20);

    const result = {
      users: userStats,
      feedback: feedbackStats,
      citations: citationStats,
      featureUsage,
    };

    await setCache(cacheKey, result, 300); // 5 min cache
    res.json(result);
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

/**
 * GET /api/admin/users — Paginated user list
 */
adminRouter.get('/users', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    const users = await db.select({
      id: schema.users.id,
      email: schema.users.email,
      name: schema.users.name,
      oauthProvider: schema.users.oauthProvider,
      plan: schema.users.plan,
      isAdmin: schema.users.isAdmin,
      createdAt: schema.users.createdAt,
    }).from(schema.users)
      .orderBy(desc(schema.users.createdAt))
      .limit(limit)
      .offset(offset);

    const [countResult] = await db.select({
      total: sql<number>`count(*)::int`,
    }).from(schema.users);

    res.json({ users, total: countResult?.total || 0 });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/**
 * GET /api/admin/feedback — Recent feedback with pagination
 */
adminRouter.get('/feedback', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    const items = await db.select({
      id: schema.feedback.id,
      rating: schema.feedback.rating,
      comment: schema.feedback.comment,
      citationText: schema.feedback.citationText,
      expectedOutput: schema.feedback.expectedOutput,
      createdAt: schema.feedback.createdAt,
      userId: schema.feedback.userId,
    }).from(schema.feedback)
      .orderBy(desc(schema.feedback.createdAt))
      .limit(limit)
      .offset(offset);

    res.json({ feedback: items });
  } catch (error) {
    console.error('Admin feedback error:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

/**
 * GET /api/admin/signups — Daily signup counts for last 30 days
 */
adminRouter.get('/signups', async (_req: Request, res: Response) => {
  try {
    const cacheKey = 'admin:signups';
    const cached = await getCached<Record<string, unknown>>(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }

    const db = getDb();
    const signups = await db.execute(sql`
      SELECT date_trunc('day', created_at)::date as day, count(*)::int as signups
      FROM users
      WHERE created_at > now() - interval '30 days'
      GROUP BY 1 ORDER BY 1
    `);

    const result = { signups: signups.rows };
    await setCache(cacheKey, result, 300);
    res.json(result);
  } catch (error) {
    console.error('Admin signups error:', error);
    res.status(500).json({ error: 'Failed to fetch signups' });
  }
});

/**
 * GET /api/admin/insights — Improvement insights
 */
adminRouter.get('/insights', async (_req: Request, res: Response) => {
  try {
    const db = getDb();
    const insights = await db.select()
      .from(schema.improvementInsights)
      .orderBy(desc(schema.improvementInsights.occurrences))
      .limit(50);

    res.json({ insights });
  } catch (error) {
    console.error('Admin insights error:', error);
    res.status(500).json({ error: 'Failed to fetch insights' });
  }
});

/**
 * POST /api/admin/compute-insights — Trigger improvement pipeline
 */
adminRouter.post('/compute-insights', async (_req: Request, res: Response) => {
  try {
    const count = await computeImprovementInsights();
    res.json({ success: true, insightsComputed: count });
  } catch (error) {
    console.error('Compute insights error:', error);
    res.status(500).json({ error: 'Failed to compute insights' });
  }
});
