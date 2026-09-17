import { config } from 'dotenv';
import { Kysely, PostgresDialect } from 'kysely';
import { defineConfig } from 'kysely-ctl';
import pg from 'pg';

config({ path: '../../.env' });

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = new Kysely({
  dialect: new PostgresDialect({
    pool,
  }),
});

export default defineConfig({
  kysely: db,
  migrations: {
    migrationFolder: './src/database/migrations',
  },
});
