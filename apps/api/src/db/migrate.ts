import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';

export async function runMigrations(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    console.log('DATABASE_URL not set — skipping migrations.');
    return;
  }

  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('.railway.internal')
      ? false
      : process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
  });

  try {
    // Check if this is an existing DB set up via drizzle-kit push (tables exist
    // but no Drizzle migration tracking table). If so, skip migrations to avoid
    // CREATE TYPE/TABLE conflicts with the existing schema.
    const tableCheck = await pool.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'users'
      ) AS has_tables`
    );
    const migrationCheck = await pool.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = '__drizzle_migrations'
      ) AS has_migrations`
    );

    const hasTables = tableCheck.rows[0]?.has_tables;
    const hasMigrations = migrationCheck.rows[0]?.has_migrations;

    if (hasTables && !hasMigrations) {
      console.log('Existing database detected (set up via drizzle-kit push). Skipping initial migration.');
      return;
    }

    const db = drizzle(pool);
    if (!hasTables) {
      console.log('Fresh database — running all migrations...');
    } else {
      console.log('Checking for pending migrations...');
    }
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Migrations complete.');
  } finally {
    await pool.end();
  }
}
