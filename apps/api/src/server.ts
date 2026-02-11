import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { analyzeRouter } from './routes/analyze.js';
import { buildRouter } from './routes/build.js';
import { uploadRouter } from './routes/upload.js';
import { authRouter } from './routes/auth.js';
import { billingRouter, handleWebhook } from './routes/billing.js';
import { referralRouter } from './routes/referral.js';
import { feedbackRouter } from './routes/feedback.js';
import { optionalAuth } from './middleware/auth.js';
import { trackUsage } from './middleware/usage.js';

const app = express();
const PORT = process.env.PORT || 3001;
const isDev = process.env.NODE_ENV !== 'production';

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

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
  credentials: true,
}));

// Cookie parser (for httpOnly JWT cookies)
app.use(cookieParser());

// Stripe webhook needs raw body — must be registered BEFORE json parsing
app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Body parsing
app.use(express.json({ limit: '10mb' }));

// Global rate limit: 100 requests per 15 minutes per IP
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
}));

// Stricter limit for analysis endpoints (Claude API costs)
const analysisLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Analysis rate limit reached. Please wait a moment.' },
});
app.use('/api/analyze', analysisLimiter);
app.use('/api/build', analysisLimiter);

// Routes
app.use('/api/auth', authRouter);
app.use('/api/billing', billingRouter);
app.use('/api/referral', referralRouter);
app.use('/api/feedback', feedbackRouter);
// Analysis routes: check auth (optional), then track usage (enforces 5-check wall)
app.use('/api/analyze', optionalAuth, trackUsage, analyzeRouter);
app.use('/api/build', optionalAuth, trackUsage, buildRouter);
app.use('/api/upload', uploadRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`LegalCitation API running on port ${PORT}`);
});

export default app;
