/**
 * Seed manifests, runsheets, assets, vehicles tied to existing orders/branches.
 */
import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env.local' });
loadEnv({ path: '.env' });

import { Pool } from 'pg';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}
const ORG = '00000000-0000-0000-0000-000000000001';
const SUPER_ADMIN = '00000000-0000-0000-0000-0000000000a1';

const pool = new Pool({
  connectionString: url,
  ssl: url.includes('rds.amazonaws.com') ? { rejectUnauthorized: false } : undefined,
});

function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pad(n: number, len: number): string { return n.toString().padStart(len, '0'); }

const LOGGER_TYPES = ['single_use', 'multi_use', 'dry_ice_single', 'dry_ice_multi', 'liquid_nitrogen'];
const BOX_TYPES = ['credo', 'vype', 'cool_guard', 'iqo', 'sytle', 'vaq_tec'];
const BOX_CAPACITIES = [2, 4, 7, 12, 14, 18, 28];
const VEHICLE_TYPES = ['truck', 'van', 'bike', 'tempo', 'mini_truck'] as const;
const OWNER_TYPES = ['owned', 'partner', 'market'] as const;

async function seedVehicles() {
  console.log('Seeding vehicles...');
  let added = 0;
  for (let i = 0; i < 25; i++) {
    const num = `MH${randInt(1, 50).toString().padStart(2, '0')}AB${randInt(1000, 9999)}`;
    const r = await pool.query(
      `insert into vehicles (org_id, number, vehicle_type, owner_type, model, capacity_kg)
       values ($1, $2, $3, $4, $5, $6)
       on conflict do nothing returning id`,
      [ORG, num, rand(VEHICLE_TYPES as unknown as string[]), rand(OWNER_TYPES as unknown as string[]),
       rand(['Tata Ace', 'Mahindra Bolero Pickup', 'Ashok Leyland Dost', 'Eicher Pro 1049', 'Tata 407']),
       randInt(500, 5000)],
    );
    if (r.rowCount && r.rowCount > 0) added++;
  }
  console.log(`  added ${added} vehicles`);
}

async function seedAssets() {
  console.log('Seeding assets...');
  const branches = await pool.query(`select id from branches where org_id=$1`, [ORG]);
  const branchIds = branches.rows.map(r => r.id as string);

  let added = 0;
  // 60 loggers
  for (let i = 1; i <= 60; i++) {
    const assigned = rand(branchIds);
    const calFrom = new Date(Date.now() - randInt(0, 200) * 86400000);
    const calTo = new Date(calFrom.getTime() + 365 * 86400000);
    const r = await pool.query(
      `insert into assets (
        org_id, asset_kind, asset_id, barcode, logger_type, manufacturer,
        manufacturer_pid, cal_from, cal_to, cal_issuer,
        assigned_branch_id, current_branch_id, in_use, usage_count, verified_by
       ) values ($1, 'logger', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       on conflict do nothing returning id`,
      [
        ORG, `LOG-${pad(i, 4)}`, `BAR-L${pad(i, 4)}`,
        rand(LOGGER_TYPES), rand(['Sensitech', 'EM-TC', 'Logtag', 'Berlinger']),
        `PID-L-${pad(i, 5)}`,
        calFrom.toISOString().slice(0, 10), calTo.toISOString().slice(0, 10),
        rand(['Sensitech Lab', 'EM-TC Cal Center', 'Logtag India']),
        assigned, assigned, Math.random() < 0.3, randInt(0, 25), SUPER_ADMIN,
      ],
    );
    if (r.rowCount && r.rowCount > 0) added++;
  }
  // 40 boxes
  for (let i = 1; i <= 40; i++) {
    const assigned = rand(branchIds);
    const r = await pool.query(
      `insert into assets (
        org_id, asset_kind, asset_id, barcode, box_type, capacity_liters,
        manufacturer, manufacturer_pid, old_box_number,
        assigned_branch_id, current_branch_id, in_use, usage_count, verified_by
       ) values ($1, 'box', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       on conflict do nothing returning id`,
      [
        ORG, `BOX-${pad(i, 4)}`, `BAR-B${pad(i, 4)}`,
        rand(BOX_TYPES), rand(BOX_CAPACITIES),
        rand(['Va-Q-Tec', 'Credo Cube', 'Cold Chain Tech']),
        `PID-B-${pad(i, 5)}`, `OLD-${pad(i, 5)}`,
        assigned, assigned, Math.random() < 0.35, randInt(0, 20), SUPER_ADMIN,
      ],
    );
    if (r.rowCount && r.rowCount > 0) added++;
  }
  console.log(`  added ${added} assets`);
}

async function seedManifests() {
  console.log('Seeding manifests...');
  const orders = await pool.query(
    `select id, origin_branch_id, destination_branch_id, mode from orders
     where org_id=$1 and origin_branch_id is not null and destination_branch_id is not null
     order by random() limit 80`,
    [ORG],
  );
  if (orders.rowCount === 0) {
    console.log('  no orders to manifest');
    return;
  }
  const vendors = await pool.query(`select id from vendors where org_id=$1`, [ORG]);
  const vendorIds = vendors.rows.map(r => r.id as string);

  // Group orders by (origin, destination, mode) and create one manifest per group of up to 6
  const groups = new Map<string, typeof orders.rows>();
  for (const o of orders.rows) {
    const key = `${o.origin_branch_id}__${o.destination_branch_id}__${o.mode}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(o);
  }

  let added = 0;
  let i = 1;
  const states = ['rough', 'final', 'departed', 'departed', 'received'];
  for (const [key, group] of groups) {
    while (group.length > 0) {
      const slice = group.splice(0, randInt(2, 6));
      const [from, to, mode] = key.split('__');
      const state = rand(states);
      const manifestNo = `MAN${pad(Date.now() % 1000000 + i, 7)}`;
      const departedAt = state !== 'rough' && state !== 'final' ? new Date(Date.now() - randInt(0, 30) * 86400000) : null;
      const arrivedAt = state === 'received' ? new Date((departedAt?.getTime() ?? Date.now()) + randInt(1, 48) * 3600000) : null;

      const r = await pool.query(
        `insert into manifests (
          org_id, manifest_no, from_branch_id, to_branch_id, manifest_date, mode,
          vendor_id, airway_bill_no, vehicle_no, forwarding_date,
          total_bags, total_boxes, docket_weight_kg, coloader_actual_kg, coloader_chargeable_kg,
          rate_per_kg, tax_slab_pct, state, created_by, departed_at, arrived_at, received_at
        ) values (
          $1, $2, $3, $4, current_date, $5,
          $6, $7, $8, $9,
          $10, $11, $12, $13, $14,
          $15, $16, $17, $18, $19, $20, $21
        ) returning id`,
        [
          ORG, manifestNo, from, to, mode,
          mode === 'air' ? rand(vendorIds) : null,
          mode === 'air' ? `AWB${randInt(10000000, 99999999)}` : null,
          mode !== 'air' ? `MH${randInt(1,50)}AB${randInt(1000,9999)}` : null,
          departedAt,
          randInt(1, 8), randInt(0, 6),
          Number((slice.length * (Math.random() * 15 + 1)).toFixed(2)),
          Number((slice.length * (Math.random() * 18 + 1)).toFixed(2)),
          Number((slice.length * (Math.random() * 20 + 1)).toFixed(2)),
          randInt(20, 120), 18,
          state, SUPER_ADMIN, departedAt, arrivedAt, arrivedAt,
        ],
      );
      const manifestId = r.rows[0].id;
      for (const o of slice) {
        await pool.query(
          `insert into manifest_orders (manifest_id, order_id) values ($1, $2) on conflict do nothing`,
          [manifestId, o.id],
        );
      }
      added++;
      i++;
    }
  }
  console.log(`  added ${added} manifests`);
}

async function seedRunsheets() {
  console.log('Seeding runsheets...');
  const branches = await pool.query(`select id, name from branches where org_id=$1`, [ORG]);
  const branchIds = branches.rows.map(r => r.id as string);

  // Get delivered + out_for_delivery orders to attach to runsheets
  const orders = await pool.query(
    `select id, destination_branch_id from orders
     where org_id=$1 and status in ('out_for_delivery', 'delivered', 'arrived_at_destination')
       and destination_branch_id is not null
     order by random() limit 60`,
    [ORG],
  );

  const ordersByBranch = new Map<string, typeof orders.rows>();
  for (const o of orders.rows) {
    if (!ordersByBranch.has(o.destination_branch_id)) ordersByBranch.set(o.destination_branch_id, []);
    ordersByBranch.get(o.destination_branch_id)!.push(o);
  }

  const states = ['rough', 'final', 'out_for_delivery', 'completed', 'completed'];
  const drivers = ['Ramesh Kumar', 'Ajay Singh', 'Suresh Patil', 'Vikram Reddy', 'Mohan Lal', 'Pradeep Yadav'];
  let added = 0;
  let i = 1;
  for (const [branchId, branchOrders] of ordersByBranch) {
    while (branchOrders.length > 0) {
      const slice = branchOrders.splice(0, randInt(2, 6));
      const runsheetNo = `RUN${pad(Date.now() % 1000000 + i, 7)}`;
      const r = await pool.query(
        `insert into runsheets (
          org_id, runsheet_no, branch_id, route, vehicle_no, driver_name, driver_phone, state, created_by
         ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9) returning id`,
        [
          ORG, runsheetNo, branchId,
          `Route ${rand(['North', 'South', 'East', 'West', 'Central'])} ${randInt(1, 9)}`,
          `MH${randInt(1,50)}AB${randInt(1000,9999)}`,
          rand(drivers),
          `98${randInt(10000000, 99999999)}`,
          rand(states), SUPER_ADMIN,
        ],
      );
      const runsheetId = r.rows[0].id;
      let seq = 1;
      for (const o of slice) {
        await pool.query(
          `insert into runsheet_orders (runsheet_id, order_id, sequence_no) values ($1, $2, $3) on conflict do nothing`,
          [runsheetId, o.id, seq++],
        );
      }
      added++;
      i++;
    }
  }
  console.log(`  added ${added} runsheets`);
}

async function seedLoginEvents() {
  console.log('Seeding login events...');
  const users = await pool.query(`select id from users where org_id=$1`, [ORG]);
  const userIds = users.rows.map(r => r.id as string);
  let added = 0;
  const eventTypes = ['login_success', 'login_success', 'login_success', 'login_failure', 'logout'];
  for (let i = 0; i < 80; i++) {
    const userId = rand(userIds);
    const evt = rand(eventTypes);
    const at = new Date(Date.now() - randInt(0, 30) * 86400000 - randInt(0, 24) * 3600000);
    await pool.query(
      `insert into login_events (user_id, event_type, ip_address, user_agent, occurred_at)
       values ($1, $2, $3, $4, $5)`,
      [userId, evt, `10.0.${randInt(0,255)}.${randInt(1,254)}`,
       rand(['Mozilla/5.0 Windows', 'Mozilla/5.0 Android', 'Mozilla/5.0 iPhone']),
       at],
    );
    added++;
  }
  console.log(`  added ${added} login events`);
}

(async () => {
  try {
    await seedVehicles();
    await seedAssets();
    await seedManifests();
    await seedRunsheets();
    await seedLoginEvents();
    console.log('Done.');
  } catch (e) {
    console.error('Seeding failed:', e);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
