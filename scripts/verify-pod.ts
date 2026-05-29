import { config } from 'dotenv';
config({ path: '.env.local' });
import { Pool } from 'pg';
const url = process.env.DATABASE_URL!;
const p = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });
(async () => {
  const o = await p.query(
    `select docket_no, status, pod_recipient_name, pod_image_url,
            to_char(delivered_at, 'DD-MM HH24:MI') as delivered_at
     from orders where pod_recipient_name = 'E2E Recipient' order by delivered_at desc limit 2`,
  );
  console.log('DELIVERED ' + JSON.stringify(o.rows, null, 2));
  if (o.rows[0]) {
    const img = await p.query(
      `select oi.kind, oi.s3_key from order_images oi join orders ord on ord.id = oi.order_id where ord.docket_no = $1 and oi.kind='pod'`,
      [o.rows[0].docket_no],
    );
    console.log('POD_IMAGES ' + JSON.stringify(img.rows));
  }
  await p.end();
})();
