import type { Request, Response, NextFunction } from 'express';
import { eq } from 'drizzle-orm';
import { getDb, isDatabaseConfigured, schema } from '../db/index.js';

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!isDatabaseConfigured()) {
    res.status(503).json({ error: 'Database not configured' });
    return;
  }

  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    const db = getDb();
    const [user] = await db.select({ isAdmin: schema.users.isAdmin })
      .from(schema.users)
      .where(eq(schema.users.id, req.user.userId))
      .limit(1);

    if (!user?.isAdmin) {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ error: 'Authorization check failed' });
  }
}
