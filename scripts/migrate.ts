import { config as loadEnv } from 'dotenv';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

loadEnv({ path: '.env.local' });
loadEnv({ path: '.env' });

const sub = process.argv[2] ?? 'up';
const extra = process.argv.slice(3);

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL not set in .env.local');
  process.exit(1);
}

const args = [
  'node-pg-migrate',
  sub,
  '--migrations-dir',
  path.resolve('migrations'),
  '--database-url-var',
  'DATABASE_URL',
  ...extra,
];

const useSsl = /rds\.amazonaws\.com/.test(databaseUrl);
const env = {
  ...process.env,
  DATABASE_URL: databaseUrl,
  ...(useSsl ? { PGSSLMODE: 'no-verify' } : {}),
};

const result = spawnSync('npx', args, { stdio: 'inherit', env, shell: true });
process.exit(result.status ?? 0);
