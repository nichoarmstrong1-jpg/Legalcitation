import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.js';

let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

/**
 * Returns true if a DATABASE_URL is configured.
 */
export function isDatabaseConfigured(): boolean {
  return !!process.env.DATABASE_URL;
}

function initDb() {
  if (!db && process.env.DATABASE_URL) {
    const pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
    db = drizzle(pool, { schema });
  }
  return db;
}

/**
 * Get the database connection. Throws if DATABASE_URL is not set.
 * Use this in routes guarded by isDatabaseConfigured() checks.
 */
export function getDb() {
  const conn = initDb();
  if (!conn) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return conn;
}

/**
 * Try to get the database connection. Returns null if DATABASE_URL is not set.
 * Use this in code that can degrade gracefully without a database.
 */
export function tryGetDb() {
  return initDb();
}

export { schema };
