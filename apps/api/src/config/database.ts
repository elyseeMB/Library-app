import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';
import type { DB } from '../types/db.ts';

const { Pool } = pg;

import.meta.hot?.decline();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on('error', (err) => {
  console.error('[PG POOL] Erreur inattendue sur une connexion idle', err);
});

export const db = new Kysely<DB>({
  dialect: new PostgresDialect({ pool }),
});
