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
      max: parseInt(process.env.DB_POOL_MAX || '20', 10),
      idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000', 10),
      connectionTimeoutMillis: parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT || '5000', 10),
      ssl: process.env.DATABASE_URL?.includes('.railway.internal') ? false
        : process.env.NODE_ENV === 'production'
          ? (process.env.DATABASE_CA_CERT
            ? { ca: process.env.DATABASE_CA_CERT, rejectUnauthorized: true }
            : { rejectUnauthorized: false })
          : false,
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
