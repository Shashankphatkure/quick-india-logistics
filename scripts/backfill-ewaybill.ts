import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env.local' });
loadEnv({ path: '.env' });
import { Pool } from 'pg';

const url = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString: url, ssl: url.includes('rds.amazonaws.com') ? { rejectUnauthorized: false } : undefined });

(async () => {
  // Give ~85% of orders an EwayBill no; ~60% of those have Part B done.
  // Random 12-digit number, valid 24-72 hours from booking_date.
  const r = await pool.query(
    `update orders set
       ewaybill_no = lpad((random()*899999999999 + 100000000000)::bigint::text, 12, '0'),
       ewaybill_valid_until = booking_date + (interval '1 hour' * (24 + (random() * 48)::int)),
       ewaybill_part_b_done = (random() < 0.55)
     where org_id = '00000000-0000-0000-0000-000000000001'
       and random() < 0.85
       and ewaybill_no is null`,
  );
  console.log(`Updated ${r.rowCount} orders with EwayBills`);
  await pool.end();
})();
