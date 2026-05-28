import { config } from 'dotenv';
config({ path: '.env.local' });
import { Pool } from 'pg';

const url = process.env.DATABASE_URL!;
const ORG = '00000000-0000-0000-0000-000000000001';
const AMRITSAR = '00000000-0000-0000-0000-0000000000e1';
const SUPER_ADMIN = '00000000-0000-0000-0000-0000000000a1';

const p = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });

(async () => {
  // Find 2 orders eligible for runsheet (arrived_at_destination, not on any runsheet)
  const orders = await p.query(
    `select id, docket_no from orders
     where org_id=$1 and status in ('arrived_at_destination','out_for_delivery')
       and not exists (select 1 from runsheet_orders ro where ro.order_id = orders.id)
     limit 2`,
    [ORG],
  );
  console.log('Found orders:', orders.rows);
  if (orders.rowCount === 0) {
    console.log('No eligible orders');
    await p.end();
    return;
  }

  const runsheetNo = `RUNE2E${Date.now().toString().slice(-5)}`;
  const client = await p.connect();
  try {
    await client.query('begin');
    const r = await client.query(
      `insert into runsheets (org_id, runsheet_no, branch_id, route, vehicle_no, driver_name, driver_phone, state, created_by)
       values ($1,$2,$3,$4,$5,$6,$7,'out_for_delivery',$8) returning id`,
      [ORG, runsheetNo, AMRITSAR, 'E2E DB Test Route', 'MH99E2EDB99', 'E2E DB Driver', '9999988888', SUPER_ADMIN],
    );
    const rsId = r.rows[0].id;
    let seq = 1;
    for (const o of orders.rows) {
      await client.query(
        `insert into runsheet_orders (runsheet_id, order_id, sequence_no) values ($1, $2, $3)`,
        [rsId, o.id, seq++],
      );
      await client.query(
        `update orders set status='out_for_delivery', current_branch_id=$2 where id=$1`,
        [o.id, AMRITSAR],
      );
      await client.query(
        `insert into order_status_events (order_id, status, note, performed_by) values ($1, 'out_for_delivery', $2, $3)`,
        [o.id, `Loaded on runsheet ${runsheetNo}`, SUPER_ADMIN],
      );
    }
    await client.query('commit');
    console.log('Created runsheet:', runsheetNo, 'with', orders.rowCount, 'orders');
  } catch (e) {
    await client.query('rollback');
    console.error('Failed:', e);
  } finally {
    client.release();
    await p.end();
  }
})();
