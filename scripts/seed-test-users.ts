/**
 * Creates fixed test users for role-based access testing.
 *   emp1 / test12345 - employee
 *   mgr1 / test12345 - manager
 *   adm1 / test12345 - admin
 */
import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env.local' });
loadEnv({ path: '.env' });

import bcrypt from 'bcryptjs';
import { Pool } from 'pg';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const ORG = '00000000-0000-0000-0000-000000000001';
const HOME_BRANCH = '00000000-0000-0000-0000-0000000000e1';

const pool = new Pool({
  connectionString: url,
  ssl: url.includes('rds.amazonaws.com') ? { rejectUnauthorized: false } : undefined,
});

const USERS = [
  { username: 'emp1', fullName: 'Emily Employee', user_type: 'employee' },
  { username: 'mgr1', fullName: 'Manny Manager',  user_type: 'manager' },
  { username: 'adm1', fullName: 'Andy Admin',     user_type: 'admin' },
];

(async () => {
  const hash = await bcrypt.hash('test12345', 12);
  for (const u of USERS) {
    const r = await pool.query(
      `insert into users (
         org_id, username, password_hash, full_name, email,
         user_type, channel_access, home_branch_id, must_change_pw, is_active
       ) values (
         $1, $2, $3, $4, $5,
         $6, 'web_and_mobile', $7, false, true
       )
       on conflict (org_id, lower(username)) do update set
         password_hash = excluded.password_hash,
         full_name = excluded.full_name,
         user_type = excluded.user_type,
         must_change_pw = false,
         is_active = true
       returning id`,
      [ORG, u.username, hash, u.fullName, `${u.username}@qil.test`, u.user_type, HOME_BRANCH],
    );
    console.log(`${u.username} (${u.user_type}): ${r.rows[0].id}`);
  }
  await pool.end();
})();
