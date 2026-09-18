import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';
import type { DB } from '#types/db';

const { Pool } = pg;

import.meta.hot?.decline();

const isProd = process.env.NODE_ENV === 'production';
async function getConnectionStringFromSSM(): Promise<string> {
  const ssm = new SSMClient({});
  const command = new GetParameterCommand({
    Name: process.env.NEON_DATABASE_URL_PARAM,
    WithDecryption: true,
  });
  const response = await ssm.send(command);

  if (!response.Parameter?.Value) {
    throw new Error('Missing NEON_DATABASE_URL in SSM Parameter Store');
  }
  return response.Parameter.Value;
}

const connectionString = isProd ? await getConnectionStringFromSSM() : process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  ssl: isProd ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('[PG POOL] Error', err);
});

export const db = new Kysely<DB>({
  dialect: new PostgresDialect({ pool }),
});
