import { config } from 'dotenv';
config({ path: '.env.local' });
import { Pool } from 'pg';
const url = process.env.DATABASE_URL!;
const p = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });
(async () => {
  const r1 = await p.query(`select runsheet_no, route, vehicle_no, driver_name, state, created_at from runsheets where route ilike '%E2E%' or vehicle_no ilike '%E2E%' order by created_at desc limit 5`);
  console.log('runsheets matching E2E:', JSON.stringify(r1.rows, null, 2));
  const r2 = await p.query(`select count(*)::int as n from runsheets`);
  console.log('total runsheets:', r2.rows[0].n);
  await p.end();
})();
