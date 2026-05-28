import 'server-only';
import { Pool, type QueryResult, type QueryResultRow } from 'pg';

declare global {
  // eslint-disable-next-line no-var
  var __qil_pg_pool: Pool | undefined;
}

function buildPool(): Pool {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not set. Add it to .env.local');
  }
  return new Pool({
    connectionString: url,
    ssl: url.includes('rds.amazonaws.com') ? { rejectUnauthorized: false } : undefined,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });
}

export const pool: Pool = global.__qil_pg_pool ?? buildPool();
if (process.env.NODE_ENV !== 'production') global.__qil_pg_pool = pool;

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<QueryResult<T>> {
  return pool.query<T>(text, params as unknown[] | undefined);
}

export async function one<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<T | null> {
  const r = await query<T>(text, params);
  return r.rows[0] ?? null;
}

export async function many<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<T[]> {
  const r = await query<T>(text, params);
  return r.rows;
}
