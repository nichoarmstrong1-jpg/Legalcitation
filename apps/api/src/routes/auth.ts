import { Router, type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { eq } from 'drizzle-orm';
import { getDb, isDatabaseConfigured, schema } from '../db/index.js';
import { generateAccessToken, generateRefreshToken, verifyToken, type TokenPayload } from '../services/jwt.js';
import { requireAuth, COOKIE_NAME } from '../middleware/auth.js';

export const authRouter = Router();

// Guard: all auth routes require a database
authRouter.use((_req: Request, res: Response, next) => {
  if (!isDatabaseConfigured()) {
    res.status(503).json({ error: 'Authentication is not yet configured. Coming soon!' });
    return;
  }
  next();
});

const SALT_ROUNDS = 12;
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 15 * 60 * 1000, // 15 minutes
  path: '/',
};

const REFRESH_COOKIE = 'legalcitation_refresh';
const REFRESH_COOKIE_OPTIONS = {
  ...COOKIE_OPTIONS,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/api/auth',
};

function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * POST /api/auth/signup — Email + password registration
 */
authRouter.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, name, referralCode: refCode } = req.body as {
      email: string;
      password: string;
      name?: string;
      referralCode?: string;
    };

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters' });
      return;
    }

    const db = getDb();

    // Check if email already exists
    const existing = await db.select().from(schema.users).where(eq(schema.users.email, email.toLowerCase())).limit(1);
    if (existing.length > 0) {
      res.status(409).json({ error: 'An account with this email already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const referralCodeGen = generateReferralCode();

    // Check referral code if provided
    let referredBy: string | null = null;
    if (refCode) {
      const referrer = await db.select().from(schema.users).where(eq(schema.users.referralCode, refCode)).limit(1);
      if (referrer.length > 0) {
        referredBy = referrer[0].id;
      }
    }

    const [user] = await db.insert(schema.users).values({
      email: email.toLowerCase(),
      name: name || null,
      passwordHash,
      oauthProvider: 'email',
      emailVerified: false,
      referralCode: referralCodeGen,
      referredBy,
    }).returning();

    // Create referral record if applicable
    if (referredBy) {
      await db.insert(schema.referrals).values({
        referrerId: referredBy,
        referredUserId: user.id,
      });
    }

    const payload: TokenPayload = { userId: user.id, email: user.email, plan: user.plan };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store refresh token
    await db.insert(schema.sessions).values({
      userId: user.id,
      refreshToken,
      userAgent: req.headers['user-agent'] || null,
      ipAddress: req.ip || null,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.cookie(COOKIE_NAME, accessToken, COOKIE_OPTIONS);
    res.cookie(REFRESH_COOKIE, refreshToken, REFRESH_COOKIE_OPTIONS);

    res.status(201).json({
      user: { id: user.id, email: user.email, name: user.name, plan: user.plan, referralCode: user.referralCode },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Signup failed' });
  }
});

/**
 * POST /api/auth/login — Email + password login
 */
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const db = getDb();
    const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email.toLowerCase())).limit(1);

    if (!user || !user.passwordHash) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const payload: TokenPayload = { userId: user.id, email: user.email, plan: user.plan };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await db.insert(schema.sessions).values({
      userId: user.id,
      refreshToken,
      userAgent: req.headers['user-agent'] || null,
      ipAddress: req.ip || null,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.cookie(COOKIE_NAME, accessToken, COOKIE_OPTIONS);
    res.cookie(REFRESH_COOKIE, refreshToken, REFRESH_COOKIE_OPTIONS);

    res.json({
      user: { id: user.id, email: user.email, name: user.name, plan: user.plan, referralCode: user.referralCode },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * POST /api/auth/google — Google OAuth login/signup
 */
authRouter.post('/google', async (req: Request, res: Response) => {
  try {
    const { idToken, referralCode: refCode } = req.body as { idToken: string; referralCode?: string };

    if (!idToken) {
      res.status(400).json({ error: 'Google ID token is required' });
      return;
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      res.status(500).json({ error: 'Google OAuth not configured' });
      return;
    }

    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({ idToken, audience: clientId });
    const googlePayload = ticket.getPayload();

    if (!googlePayload?.email) {
      res.status(400).json({ error: 'Invalid Google token' });
      return;
    }

    const db = getDb();

    // Check if user exists
    let [user] = await db.select().from(schema.users).where(eq(schema.users.email, googlePayload.email.toLowerCase())).limit(1);

    if (!user) {
      // Create new user
      let referredBy: string | null = null;
      if (refCode) {
        const referrer = await db.select().from(schema.users).where(eq(schema.users.referralCode, refCode)).limit(1);
        if (referrer.length > 0) referredBy = referrer[0].id;
      }

      [user] = await db.insert(schema.users).values({
        email: googlePayload.email.toLowerCase(),
        name: googlePayload.name || null,
        oauthProvider: 'google',
        oauthId: googlePayload.sub,
        emailVerified: true,
        referralCode: generateReferralCode(),
        referredBy,
      }).returning();

      if (referredBy) {
        await db.insert(schema.referrals).values({
          referrerId: referredBy,
          referredUserId: user.id,
        });
      }
    }

    const payload: TokenPayload = { userId: user.id, email: user.email, plan: user.plan };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await db.insert(schema.sessions).values({
      userId: user.id,
      refreshToken,
      userAgent: req.headers['user-agent'] || null,
      ipAddress: req.ip || null,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.cookie(COOKIE_NAME, accessToken, COOKIE_OPTIONS);
    res.cookie(REFRESH_COOKIE, refreshToken, REFRESH_COOKIE_OPTIONS);

    res.json({
      user: { id: user.id, email: user.email, name: user.name, plan: user.plan, referralCode: user.referralCode },
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Google authentication failed' });
  }
});

/**
 * POST /api/auth/logout — Clear auth cookies
 */
authRouter.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie(COOKIE_NAME, { path: '/' });
  res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
  res.json({ success: true });
});

/**
 * GET /api/auth/me — Get current user from JWT
 */
authRouter.get('/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, req.user!.userId)).limit(1);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      user: { id: user.id, email: user.email, name: user.name, plan: user.plan, referralCode: user.referralCode, formatPreference: user.formatPreference },
    });
  } catch (error) {
    console.error('Me error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

/**
 * POST /api/auth/refresh — Refresh access token using refresh cookie
 */
authRouter.post('/refresh', async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE];
    if (!refreshToken) {
      res.status(401).json({ error: 'No refresh token' });
      return;
    }

    const decoded = verifyToken(refreshToken);
    const db = getDb();

    // Verify session exists
    const [session] = await db.select().from(schema.sessions)
      .where(eq(schema.sessions.refreshToken, refreshToken)).limit(1);

    if (!session || session.expiresAt < new Date()) {
      res.status(401).json({ error: 'Invalid or expired refresh token' });
      return;
    }

    // Get fresh user data
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, decoded.userId)).limit(1);
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    const payload: TokenPayload = { userId: user.id, email: user.email, plan: user.plan };
    const newAccessToken = generateAccessToken(payload);

    res.cookie(COOKIE_NAME, newAccessToken, COOKIE_OPTIONS);
    res.json({ success: true });
  } catch {
    res.status(401).json({ error: 'Token refresh failed' });
  }
});
