import { pgTable, uuid, varchar, text, integer, timestamp, boolean, pgEnum, jsonb } from 'drizzle-orm/pg-core';

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
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Citation history (replaces localStorage)
export const citationHistory = pgTable('citation_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
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

// Uploaded case documents
export const caseDocuments = pgTable('case_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  fileName: text('file_name').notNull(),
  caseName: text('case_name'),
  citation: text('citation'),
  extractedText: text('extracted_text').notNull(),
  pageMapping: jsonb('page_mapping'),
  fileSize: integer('file_size').notNull(),
  pageCount: integer('page_count'),
  uploadedAt: timestamp('uploaded_at').notNull().defaultNow(),
});

// --- Spading Feature ---

export const spadingStatusEnum = pgEnum('spading_status', [
  'draft',
  'processing',
  'completed',
  'error',
]);

export const documentRoleEnum = pgEnum('document_role', [
  'journal_entry',
  'source',
]);

export const annotationStatusEnum = pgEnum('annotation_status', [
  'verified',
  'partial_match',
  'not_found',
  'format_error',
  'quote_mismatch',
  'pending',
  'error',
]);

export const spadingProjects = pgTable('spading_projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 500 }).notNull(),
  description: text('description'),
  status: spadingStatusEnum('status').notNull().default('draft'),
  journalDocumentId: uuid('journal_document_id'),
  citationCount: integer('citation_count'),
  verifiedCount: integer('verified_count'),
  issueCount: integer('issue_count'),
  progress: integer('progress').default(0),
  currentStep: varchar('current_step', { length: 200 }),
  errorMessage: text('error_message'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const projectDocuments = pgTable('project_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => spadingProjects.id, { onDelete: 'cascade' }),
  role: documentRoleEnum('role').notNull(),
  fileName: text('file_name').notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  fileSize: integer('file_size').notNull(),
  filePath: text('file_path'),
  extractedText: text('extracted_text').notNull(),
  pageMapping: jsonb('page_mapping'),
  pageCount: integer('page_count'),
  caseName: text('case_name'),
  citation: text('citation'),
  uploadedAt: timestamp('uploaded_at').notNull().defaultNow(),
});

export const spadingAnnotations = pgTable('spading_annotations', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => spadingProjects.id, { onDelete: 'cascade' }),
  startOffset: integer('start_offset').notNull(),
  endOffset: integer('end_offset').notNull(),
  rawCitationText: text('raw_citation_text').notNull(),
  parsedCitation: jsonb('parsed_citation').notNull(),
  status: annotationStatusEnum('status').notNull().default('pending'),
  issues: jsonb('issues'),
  score: integer('score'),
  verifiedCitation: text('verified_citation'),
  discrepancies: jsonb('discrepancies'),
  logicTrace: jsonb('logic_trace'),
  matchedDocumentId: uuid('matched_document_id').references(() => projectDocuments.id, { onDelete: 'set null' }),
  matchedPageNumber: integer('matched_page_number'),
  matchedTextSnippet: text('matched_text_snippet'),
  quotedText: text('quoted_text'),
  sourceText: text('source_text'),
  quoteAccurate: boolean('quote_accurate'),
  editorNote: text('editor_note'),
  resolved: boolean('resolved').default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
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
