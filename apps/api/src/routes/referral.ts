import { Router, type Request, type Response } from 'express';
import { eq, sql } from 'drizzle-orm';
import { getDb, isDatabaseConfigured, schema } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';

export const referralRouter = Router();

referralRouter.use((_req: Request, res: Response, next) => {
  if (!isDatabaseConfigured()) {
    res.status(503).json({ error: 'Referrals are not yet configured. Coming soon!' });
    return;
  }
  next();
});

/**
 * GET /api/referral/code — Get current user's referral code and link
 */
referralRouter.get('/code', requireAuth, async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const [user] = await db.select({
      referralCode: schema.users.referralCode,
    }).from(schema.users).where(eq(schema.users.id, req.user!.userId)).limit(1);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.json({
      code: user.referralCode,
      link: `${baseUrl}/?ref=${user.referralCode}`,
    });
  } catch (error) {
    console.error('Referral code error:', error);
    res.status(500).json({ error: 'Failed to get referral code' });
  }
});

/**
 * GET /api/referral/stats — Get referral stats for current user
 */
referralRouter.get('/stats', requireAuth, async (req: Request, res: Response) => {
  try {
    const db = getDb();

    const [stats] = await db.select({
      totalReferrals: sql<number>`count(*)::int`,
      bonusChecks: sql<number>`coalesce(sum(${schema.referrals.bonusChecks}), 0)::int`,
    }).from(schema.referrals).where(eq(schema.referrals.referrerId, req.user!.userId));

    res.json({
      totalReferrals: stats?.totalReferrals || 0,
      bonusChecks: stats?.bonusChecks || 0,
    });
  } catch (error) {
    console.error('Referral stats error:', error);
    res.status(500).json({ error: 'Failed to get referral stats' });
  }
});
