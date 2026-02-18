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
        ? (process.env.DATABASE_CA_CERT
          ? { ca: process.env.DATABASE_CA_CERT, rejectUnauthorized: true }
          : { rejectUnauthorized: false })
        : false,
  });

  try {
    const db = drizzle(pool);
    console.log('Running database migrations...');
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Migrations complete.');
  } finally {
    await pool.end();
  }
}
