import { config } from 'dotenv';
config({ path: '.env.local' });
import { Pool } from 'pg';
const url = process.env.DATABASE_URL!;
const p = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });
const docket = process.argv[2] ?? 'D6799227-196';
(async () => {
  const o = await p.query(`select docket_no, status, to_char(delivered_at, 'DD-MM HH24:MI') as delivered_at, pod_recipient_name from orders where docket_no = $1`, [docket]);
  const e = await p.query(
    `select se.status, se.note, to_char(se.performed_at, 'HH24:MI') as t
     from order_status_events se join orders o on o.id = se.order_id
     where o.docket_no = $1 order by se.performed_at desc limit 4`,
    [docket],
  );
  const img = await p.query(
    `select oi.kind, oi.s3_key from order_images oi join orders o on o.id = oi.order_id where o.docket_no = $1 order by oi.uploaded_at desc limit 3`,
    [docket],
  );
  console.log('ORDER ' + JSON.stringify(o.rows[0]));
  console.log('EVENTS ' + JSON.stringify(e.rows));
  console.log('IMAGES ' + JSON.stringify(img.rows));
  await p.end();
})();
