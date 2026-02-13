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
    const db = drizzle(pool);

    // Check if this is an existing DB that was set up via drizzle-kit push
    // (tables exist but no migration history). If so, seed the migration
    // journal so the initial migration is skipped.
    const journalCheck = await pool.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = '__drizzle_migrations'
      ) AS has_journal`
    );
    const hasJournal = journalCheck.rows[0]?.has_journal;

    if (!hasJournal) {
      // Check if the schema already exists (tables were created via push)
      const tableCheck = await pool.query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = 'users'
        ) AS has_tables`
      );
      const hasTables = tableCheck.rows[0]?.has_tables;

      if (hasTables) {
        console.log('Existing database detected (created via drizzle-kit push). Seeding migration journal...');
        // Create the migration tracking table and mark initial migration as applied
        await pool.query(`
          CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
            id SERIAL PRIMARY KEY,
            hash TEXT NOT NULL,
            created_at BIGINT
          )
        `);
        // Insert the initial migration hash so it's skipped
        // Hash is the folder name from drizzle/meta/_journal.json
        const { readFileSync } = await import('fs');
        const journal = JSON.parse(readFileSync('./drizzle/meta/_journal.json', 'utf-8'));
        for (const entry of journal.entries) {
          await pool.query(
            `INSERT INTO "__drizzle_migrations" (hash, created_at) VALUES ($1, $2)
             ON CONFLICT DO NOTHING`,
            [entry.tag, entry.when]
          );
        }
        console.log('Migration journal seeded. Existing schema preserved.');
      }
    }

    console.log('Running database migrations...');
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Migrations complete.');
  } finally {
    await pool.end();
  }
}
