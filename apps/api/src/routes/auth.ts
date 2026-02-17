import { Router, type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { eq } from 'drizzle-orm';
import { getDb, isDatabaseConfigured, schema } from '../db/index.js';
import { generateAccessToken, generateRefreshToken, verifyToken, type TokenPayload } from '../services/jwt.js';
import { requireAuth, COOKIE_NAME } from '../middleware/auth.js';
import { validateEmail } from '../services/email-validator.js';
import { verifyAppleToken } from '../services/apple-auth.js';
import { verifyMicrosoftToken } from '../services/microsoft-auth.js';

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

/**
 * Helper: create session tokens and set cookies
 */
async function createSession(
  user: { id: string; email: string; name: string | null },
  req: Request,
  res: Response,
  statusCode = 200
) {
  const db = getDb();
  const payload: TokenPayload = { userId: user.id, email: user.email };
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

  res.status(statusCode).json({
    user: { id: user.id, email: user.email, name: user.name },
  });
}

/**
 * POST /api/auth/validate-email — Check email validity before registration
 */
authRouter.post('/validate-email', async (req: Request, res: Response) => {
  try {
    const { email } = req.body as { email: string };
    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }
    const result = await validateEmail(email);
    res.json(result);
  } catch (error) {
    console.error('Email validation error:', error);
    res.status(500).json({ error: 'Email validation failed' });
  }
});

/**
 * POST /api/auth/signup — Email + password registration
 */
authRouter.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body as {
      email: string;
      password: string;
      name?: string;
    };

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters' });
      return;
    }

    // Validate email format, domain, and disposable check
    const emailValidation = await validateEmail(email);
    if (!emailValidation.valid) {
      res.status(400).json({ error: emailValidation.reason || 'Invalid email address' });
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

    const [user] = await db.insert(schema.users).values({
      email: email.toLowerCase(),
      name: name || null,
      passwordHash,
      oauthProvider: 'email',
      emailVerified: false,
    }).returning();

    await createSession(user, req, res, 201);
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

    await createSession(user, req, res);
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
    const { idToken } = req.body as { idToken: string };

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

    let [user] = await db.select().from(schema.users).where(eq(schema.users.email, googlePayload.email.toLowerCase())).limit(1);

    if (!user) {
      [user] = await db.insert(schema.users).values({
        email: googlePayload.email.toLowerCase(),
        name: googlePayload.name || null,
        oauthProvider: 'google',
        oauthId: googlePayload.sub,
        emailVerified: true,
      }).returning();
    }

    await createSession(user, req, res);
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Google authentication failed' });
  }
});

/**
 * POST /api/auth/apple — Apple Sign In login/signup
 */
authRouter.post('/apple', async (req: Request, res: Response) => {
  try {
    const { idToken, name } = req.body as { idToken: string; name?: string };

    if (!idToken) {
      res.status(400).json({ error: 'Apple ID token is required' });
      return;
    }

    const clientId = process.env.APPLE_CLIENT_ID;
    if (!clientId) {
      res.status(500).json({ error: 'Apple Sign In not configured' });
      return;
    }

    const applePayload = await verifyAppleToken(idToken, clientId);

    const db = getDb();

    let [user] = await db.select().from(schema.users).where(eq(schema.users.email, applePayload.email.toLowerCase())).limit(1);

    if (!user) {
      [user] = await db.insert(schema.users).values({
        email: applePayload.email.toLowerCase(),
        name: name || null,
        oauthProvider: 'apple',
        oauthId: applePayload.sub,
        emailVerified: applePayload.emailVerified,
      }).returning();
    }

    await createSession(user, req, res);
  } catch (error) {
    console.error('Apple auth error:', error);
    res.status(500).json({ error: 'Apple authentication failed' });
  }
});

/**
 * POST /api/auth/microsoft — Microsoft login/signup
 */
authRouter.post('/microsoft', async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body as { idToken: string };

    if (!idToken) {
      res.status(400).json({ error: 'Microsoft ID token is required' });
      return;
    }

    const clientId = process.env.MICROSOFT_CLIENT_ID;
    if (!clientId) {
      res.status(500).json({ error: 'Microsoft login not configured' });
      return;
    }

    const msPayload = await verifyMicrosoftToken(idToken, clientId);

    const db = getDb();

    let [user] = await db.select().from(schema.users).where(eq(schema.users.email, msPayload.email.toLowerCase())).limit(1);

    if (!user) {
      [user] = await db.insert(schema.users).values({
        email: msPayload.email.toLowerCase(),
        name: msPayload.name || null,
        oauthProvider: 'microsoft',
        oauthId: msPayload.sub,
        emailVerified: true,
      }).returning();
    }

    await createSession(user, req, res);
  } catch (error) {
    console.error('Microsoft auth error:', error);
    res.status(500).json({ error: 'Microsoft authentication failed' });
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
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        formatPreference: user.formatPreference,
        isAdmin: user.isAdmin,
      },
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

    const payload: TokenPayload = { userId: user.id, email: user.email };
    const newAccessToken = generateAccessToken(payload);

    res.cookie(COOKIE_NAME, newAccessToken, COOKIE_OPTIONS);
    res.json({ success: true });
  } catch {
    res.status(401).json({ error: 'Token refresh failed' });
  }
});
