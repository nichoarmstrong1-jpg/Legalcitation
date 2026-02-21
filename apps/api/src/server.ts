import { config as dotenvConfig } from 'dotenv';
import { resolve } from 'path';

dotenvConfig({ path: resolve(process.cwd(), '.env') });
dotenvConfig({ path: resolve(process.cwd(), '../../.env') });
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { analyzeRouter } from './routes/analyze.js';
import { buildRouter } from './routes/build.js';
import { uploadRouter } from './routes/upload.js';
import { authRouter } from './routes/auth.js';
import { feedbackRouter } from './routes/feedback.js';
import { caseDocumentsRouter } from './routes/case-documents.js';
import { spadingRouter } from './routes/spading.js';
import { analyticsRouter } from './routes/analytics.js';
import { adminRouter } from './routes/admin.js';
import { optionalAuth } from './middleware/auth.js';
import { isDatabaseConfigured } from './db/index.js';
import { runMigrations } from './db/migrate.js';
import { validateFileStorage } from './services/file-storage.js';

const app = express();
const PORT = process.env.PORT || 3001;
const isDev = process.env.NODE_ENV !== 'production';

function parseCsvEnv(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function wildcardToRegex(pattern: string): RegExp {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
  const regexSource = `^${escaped.replace(/\*/g, '.*')}$`;
  return new RegExp(regexSource);
}

function isOriginAllowed(
  origin: string | undefined,
  exactOrigins: Set<string>,
  wildcardOriginPatterns: RegExp[]
): boolean {
  if (!origin) return true;
  if (exactOrigins.has(origin)) return true;
  return wildcardOriginPatterns.some((pattern) => pattern.test(origin));
}

// Trust proxy — required behind Railway/Vercel reverse proxies for correct
// client IP detection in rate limiting and secure cookies.
app.set('trust proxy', 1);

// Security headers
app.use(helmet({
  contentSecurityPolicy: isDev ? false : {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        'https://accounts.google.com',
        'https://appleid.cdn-apple.com',
        'https://alcdn.msauth.net',
      ],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'blob:'],
      connectSrc: [
        "'self'",
        'https://accounts.google.com',
        'https://appleid.apple.com',
        'https://login.microsoftonline.com',
      ],
      frameSrc: [
        "'self'",
        'https://accounts.google.com',
        'https://appleid.apple.com',
        'https://login.microsoftonline.com',
      ],
    },
  },
}));

// CORS — explicit allow-list with optional wildcard patterns (e.g. https://legalcitation-*.vercel.app)
const defaultOrigins = [
  'http://localhost:5173',
  'https://legalcitation.vercel.app',
];
const configuredOrigins = parseCsvEnv(process.env.CORS_ORIGIN);
const allowedOrigins = configuredOrigins.length > 0 ? configuredOrigins : defaultOrigins;
const wildcardOriginPatterns = parseCsvEnv(process.env.CORS_ORIGIN_PATTERNS).map(wildcardToRegex);
const allowedOriginSet = new Set(allowedOrigins);
const devLocalhostPattern = /^https?:\/\/(?:localhost|127\.0\.0\.1):\d+$/;

app.use(cors({
  origin: (origin, callback) => {
    if (isDev && origin && devLocalhostPattern.test(origin)) {
      callback(null, true);
      return;
    }
    if (isOriginAllowed(origin, allowedOriginSet, wildcardOriginPatterns)) {
      callback(null, true);
      return;
    }
    callback(new Error(`CORS blocked for origin: ${origin ?? 'unknown'}`));
  },
  credentials: true,
}));

// Cookie parser (for httpOnly JWT cookies)
app.use(cookieParser());

// Body parsing
app.use(express.json({ limit: '10mb' }));

// Global rate limit: 200 requests per 15 minutes per IP
// Excludes /api/analyze and /api/build which have their own stricter limits
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path.startsWith('/api/analyze') || req.path.startsWith('/api/build'),
  message: { error: 'Too many requests. Please try again later.' },
});
app.use('/api/', globalLimiter);

// Stricter limit for analysis endpoints (Claude API costs)
const analysisLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Analysis rate limit reached. Please wait a moment.' },
});
app.use('/api/analyze', analysisLimiter);
app.use('/api/build', analysisLimiter);

// Routes
app.use('/api/auth', authRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/admin', adminRouter);
// Analysis routes
app.use('/api/analyze', optionalAuth, analyzeRouter);
app.use('/api/build', optionalAuth, buildRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/case-documents', caseDocumentsRouter);
app.use('/api/spading', spadingRouter);

// Health check — includes service status for debugging
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: isDatabaseConfigured() ? 'configured' : 'not configured',
      anthropic: process.env.ANTHROPIC_API_KEY ? 'configured' : 'not configured',
      courtlistener: process.env.COURTLISTENER_API_TOKEN ? 'configured' : 'not configured',
      google_oauth: process.env.GOOGLE_CLIENT_ID ? 'configured' : 'not configured',
      apple_oauth: process.env.APPLE_CLIENT_ID ? 'configured' : 'not configured',
      microsoft_oauth: process.env.MICROSOFT_CLIENT_ID ? 'configured' : 'not configured',
    },
  });
});

// Run database migrations (if DATABASE_URL is set), then start the server
runMigrations()
  .then(() => validateFileStorage())
  .then(() => {
    app.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`LegalCitation API running on 0.0.0.0:${PORT}`);
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  CORS origins: ${allowedOrigins.join(', ')}`);
      if (wildcardOriginPatterns.length > 0) {
        console.log(`  CORS wildcard patterns: ${parseCsvEnv(process.env.CORS_ORIGIN_PATTERNS).join(', ')}`);
      }
      console.log(`  Database: ${isDatabaseConfigured() ? 'connected' : 'NOT configured (auth disabled)'}`);
      console.log(`  Anthropic: ${process.env.ANTHROPIC_API_KEY ? 'configured' : 'NOT configured (verification disabled)'}`);
      console.log(`  CourtListener: ${process.env.COURTLISTENER_API_TOKEN ? 'configured' : 'NOT configured (case lookup disabled)'}`);
    });
  })
  .catch((err) => {
    console.error('Failed to run migrations:', err);
    process.exit(1);
  });

export default app;
