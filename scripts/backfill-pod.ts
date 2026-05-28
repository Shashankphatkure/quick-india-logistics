import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env.local' });
loadEnv({ path: '.env' });
import { Pool } from 'pg';

const url = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString: url, ssl: url.includes('rds.amazonaws.com') ? { rejectUnauthorized: false } : undefined });

const RECIPIENTS = [
  'Apollo Pharmacy', 'CGHS Wellness', 'Singh Medicos', 'MedPlus Stores',
  'Wellness Forever', 'Sanjay Kumar', 'Priya Sharma', 'Hospital Receiving',
  'Counter Staff', 'Anita Reddy', 'Vikram Singh', 'Rohan Mehta',
];

function pad(n: number, len: number) { return n.toString().padStart(len, '0'); }

(async () => {
  const orders = await pool.query(
    `select id from orders where org_id='00000000-0000-0000-0000-000000000001'
       and status='delivered' and pod_recipient_name is null`,
  );
  let updated = 0;
  for (const o of orders.rows) {
    const recipient = RECIPIENTS[Math.floor(Math.random() * RECIPIENTS.length)];
    const phone = '98' + pad(Math.floor(Math.random() * 99999999), 8);
    await pool.query(
      `update orders set
         pod_recipient_name = $1,
         pod_recipient_phone = $2,
         delivered_at = updated_at - (random() * interval '12 hours')
       where id = $3`,
      [recipient, phone, o.id],
    );
    updated++;
  }
  console.log(`Backfilled POD for ${updated} delivered orders`);
  await pool.end();
})();
