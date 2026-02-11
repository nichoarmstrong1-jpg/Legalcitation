import { pgTable, uuid, varchar, text, integer, timestamp, boolean, pgEnum, jsonb } from 'drizzle-orm/pg-core';

export const planEnum = pgEnum('plan', ['free', 'student', 'professional']);
export const oauthProviderEnum = pgEnum('oauth_provider', ['google', 'email']);

// Users
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  passwordHash: varchar('password_hash', { length: 255 }),
  oauthProvider: oauthProviderEnum('oauth_provider'),
  oauthId: varchar('oauth_id', { length: 255 }),
  emailVerified: boolean('email_verified').notNull().default(false),
  formatPreference: varchar('format_preference', { length: 20 }).default('italics'),
  plan: planEnum('plan').notNull().default('free'),
  referralCode: varchar('referral_code', { length: 20 }).notNull().unique(),
  referredBy: uuid('referred_by'),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Usage tracking per billing period
export const usagePeriods = pgTable('usage_periods', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  checkCount: integer('check_count').notNull().default(0),
  periodStart: timestamp('period_start').notNull(),
  periodEnd: timestamp('period_end').notNull(),
});

// Citation history (replaces localStorage)
export const citationHistory = pgTable('citation_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  mode: varchar('mode', { length: 20 }).notNull(),
  inputText: text('input_text').notNull(),
  results: jsonb('results').notNull(),
  citationCount: integer('citation_count').notNull().default(1),
  averageScore: integer('average_score'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Verification result cache (shared across all users)
export const verificationCache = pgTable('verification_cache', {
  id: uuid('id').primaryKey().defaultRandom(),
  cacheKey: varchar('cache_key', { length: 500 }).notNull().unique(),
  result: jsonb('result').notNull(),
  provider: varchar('provider', { length: 50 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  expiresAt: timestamp('expires_at').notNull(),
});

// Referral tracking
export const referrals = pgTable('referrals', {
  id: uuid('id').primaryKey().defaultRandom(),
  referrerId: uuid('referrer_id').notNull().references(() => users.id),
  referredUserId: uuid('referred_user_id').notNull().references(() => users.id),
  bonusChecks: integer('bonus_checks').notNull().default(5),
  redeemed: boolean('redeemed').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// User feedback on citation outputs
export const feedback = pgTable('feedback', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  citationHistoryId: uuid('citation_history_id').references(() => citationHistory.id),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  citationText: text('citation_text'),
  expectedOutput: text('expected_output'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// JWT refresh token sessions
export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  refreshToken: varchar('refresh_token', { length: 500 }).notNull(),
  userAgent: varchar('user_agent', { length: 500 }),
  ipAddress: varchar('ip_address', { length: 45 }),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
