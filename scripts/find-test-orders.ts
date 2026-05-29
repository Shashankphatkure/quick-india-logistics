import { config } from 'dotenv';
config({ path: '.env.local' });
import { Pool } from 'pg';
const url = process.env.DATABASE_URL!;
const ORG = '00000000-0000-0000-0000-000000000001';
const p = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });
(async () => {
  const r1 = await p.query(`select docket_no, status from orders where org_id=$1 and status='received' order by created_at desc limit 1`, [ORG]);
  const r2 = await p.query(`select docket_no, status from orders where org_id=$1 and status='out_for_delivery' order by created_at desc limit 1`, [ORG]);
  console.log('RECEIVED ' + JSON.stringify(r1.rows[0] || null));
  console.log('OFD ' + JSON.stringify(r2.rows[0] || null));
  await p.end();
})();
