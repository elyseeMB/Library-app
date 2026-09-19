import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';
import type { DB } from '#types/db';

const { Pool } = pg;

import.meta.hot?.decline();

const isProd = process.env.NODE_ENV === 'production';

/**
 * Récupère la chaîne de connexion à la base de données stockée dans AWS SSM Parameter Store.
 *
 * @returns La chaîne de connexion PostgreSQL (Neon DATABASE).
 * @throws Si le paramètre est introuvable ou vide.
 */
async function getConnectionStringFromSSM(): Promise<string> {
  const ssm = new SSMClient({});
  const command = new GetParameterCommand({
    Name: '/library-api/prod/neon-database-url',
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
  max: isProd ? 3 : 10,
  connectionTimeoutMillis: 10_000,
  ssl: isProd,
});

pool.on('error', (err) => {
  console.error('[PG POOL] Error', err);
});

export const db = new Kysely<DB>({
  dialect: new PostgresDialect({ pool }),
});
