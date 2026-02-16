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
import { optionalAuth } from './middleware/auth.js';
import { isDatabaseConfigured } from './db/index.js';
import { runMigrations } from './db/migrate.js';

const app = express();
const PORT = process.env.PORT || 3001;
const isDev = process.env.NODE_ENV !== 'production';

// Trust proxy — required behind Railway/Vercel reverse proxies for correct
// client IP detection in rate limiting and secure cookies.
app.set('trust proxy', 1);

// Security headers
app.use(helmet({
  contentSecurityPolicy: isDev ? false : {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
    },
  },
}));

// CORS — allow Vercel frontend in production
const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [
  'http://localhost:5173',
  'https://legalcitation.vercel.app',
];
app.use(cors({
  origin: allowedOrigins,
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
      google_oauth: process.env.GOOGLE_CLIENT_ID ? 'configured' : 'not configured',
    },
  });
});

// Run database migrations (if DATABASE_URL is set), then start the server
runMigrations()
  .then(() => {
    app.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`LegalCitation API running on 0.0.0.0:${PORT}`);
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  CORS origins: ${allowedOrigins.join(', ')}`);
      console.log(`  Database: ${isDatabaseConfigured() ? 'connected' : 'NOT configured (auth disabled)'}`);
      console.log(`  Anthropic: ${process.env.ANTHROPIC_API_KEY ? 'configured' : 'NOT configured (verification disabled)'}`);
    });
  })
  .catch((err) => {
    console.error('Failed to run migrations:', err);
    process.exit(1);
  });

export default app;
