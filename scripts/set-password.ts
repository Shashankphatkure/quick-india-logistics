/**
 * One-off script to set/reset a user's password.
 * Usage: npx tsx scripts/set-password.ts <username> <password>
 */
import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env.local' });
loadEnv({ path: '.env' });

import bcrypt from 'bcryptjs';
import { Pool } from 'pg';

const [, , username, password] = process.argv;

if (!username || !password) {
  console.error('Usage: tsx scripts/set-password.ts <username> <password>');
  process.exit(1);
}

if (password.length < 8) {
  console.error('Password must be at least 8 characters');
  process.exit(1);
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const pool = new Pool({
  connectionString: url,
  ssl: url.includes('rds.amazonaws.com') ? { rejectUnauthorized: false } : undefined,
});

(async () => {
  const hash = await bcrypt.hash(password, 12);
  const res = await pool.query(
    `update users set password_hash = $1, must_change_pw = false where lower(username) = lower($2) returning id, username, full_name`,
    [hash, username],
  );

  if (res.rowCount === 0) {
    console.error(`No user found with username "${username}"`);
    process.exit(1);
  }
  console.log(`Set password for ${res.rows[0].full_name} (${res.rows[0].username})`);
  await pool.end();
})();
