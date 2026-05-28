/**
 * Bulk seed for QA — adds enough rows to make pagination meaningful.
 * Idempotent-ish: skips rows that violate unique indexes.
 *
 * Usage: npx tsx scripts/seed-bulk.ts
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
const SUPER_ADMIN = '00000000-0000-0000-0000-0000000000a1';

const pool = new Pool({
  connectionString: url,
  ssl: url.includes('rds.amazonaws.com') ? { rejectUnauthorized: false } : undefined,
});

const COMMODITY_NAMES = [
  'Cement Pipe', 'Cricket Balls', 'Sweet', 'Expiry Goods', 'Sample', 'Boundary Matters',
  'Paints', 'Sales', 'Shooting Material', 'Spare Parts',
  'Steel Pipes', 'Plastic Bottles', 'Glass Containers', 'Rubber Sheets', 'Wooden Crates',
  'Pharmaceuticals', 'Vaccines', 'Insulin', 'Blood Samples', 'Lab Reagents',
  'Garment Bales', 'Cotton Yarn', 'Silk Fabric', 'Wool Textiles', 'Denim Rolls',
  'Electronics Parts', 'Computer Boards', 'Server Racks', 'Network Cables', 'Mobile Phones',
  'Stationery', 'Office Furniture', 'Books', 'Magazines', 'Newspapers',
  'Fresh Vegetables', 'Frozen Meat', 'Dairy Products', 'Ice Cream', 'Seafood',
  'Auto Parts', 'Tyres', 'Batteries', 'Engine Oil', 'Brake Pads',
  'Construction Tools', 'Plumbing Fittings', 'Tiles', 'Marble Slabs', 'Bricks',
  'Agricultural Seeds', 'Fertilizers', 'Pesticides', 'Animal Feed', 'Crop Samples',
  'Solar Panels', 'Wind Turbine Parts', 'Cable Drums', 'Transformer Coils', 'Switchgear',
];

const COMMODITY_TYPES: Record<string, string> = {
  pharmaceuticals: '00000000-0000-0000-0000-0000000000b2',
  vaccines: '00000000-0000-0000-0000-0000000000b2',
  insulin: '00000000-0000-0000-0000-0000000000b2',
  'blood samples': '00000000-0000-0000-0000-0000000000b4',
  'lab reagents': '00000000-0000-0000-0000-0000000000b4',
  'frozen meat': '00000000-0000-0000-0000-0000000000b2',
  'fresh vegetables': '00000000-0000-0000-0000-0000000000b2',
  'dairy products': '00000000-0000-0000-0000-0000000000b2',
  'ice cream': '00000000-0000-0000-0000-0000000000b2',
  seafood: '00000000-0000-0000-0000-0000000000b2',
  'expiry goods': '00000000-0000-0000-0000-0000000000b3',
  sample: '00000000-0000-0000-0000-0000000000b4',
};

function commodityTypeFor(name: string): string {
  return COMMODITY_TYPES[name.toLowerCase()] ?? '00000000-0000-0000-0000-0000000000b1';
}

const BRANCH_CITIES: { city: string; state: string; pincode: string; type: 'hub' | 'branch' | 'franchise' | 'vendor' }[] = [
  { city: 'Bengaluru',  state: 'Karnataka',      pincode: '560001', type: 'hub' },
  { city: 'Hyderabad',  state: 'Telangana',      pincode: '500001', type: 'hub' },
  { city: 'Chennai',    state: 'Tamil Nadu',     pincode: '600001', type: 'hub' },
  { city: 'Kolkata',    state: 'West Bengal',    pincode: '700001', type: 'hub' },
  { city: 'Pune',       state: 'Maharashtra',    pincode: '411001', type: 'branch' },
  { city: 'Ahmedabad',  state: 'Gujarat',        pincode: '380001', type: 'branch' },
  { city: 'Surat',      state: 'Gujarat',        pincode: '395003', type: 'branch' },
  { city: 'Jaipur',     state: 'Rajasthan',      pincode: '302001', type: 'branch' },
  { city: 'Lucknow',    state: 'Uttar Pradesh',  pincode: '226001', type: 'branch' },
  { city: 'Kanpur',     state: 'Uttar Pradesh',  pincode: '208001', type: 'branch' },
  { city: 'Indore',     state: 'Madhya Pradesh', pincode: '452001', type: 'branch' },
  { city: 'Bhopal',     state: 'Madhya Pradesh', pincode: '462001', type: 'branch' },
  { city: 'Patna',      state: 'Bihar',          pincode: '800001', type: 'branch' },
  { city: 'Visakhapatnam', state: 'Andhra Pradesh', pincode: '530001', type: 'branch' },
  { city: 'Coimbatore', state: 'Tamil Nadu',     pincode: '641001', type: 'branch' },
  { city: 'Vadodara',   state: 'Gujarat',        pincode: '390001', type: 'branch' },
  { city: 'Ludhiana',   state: 'Punjab',         pincode: '141001', type: 'branch' },
  { city: 'Agra',       state: 'Uttar Pradesh',  pincode: '282001', type: 'franchise' },
  { city: 'Nashik',     state: 'Maharashtra',    pincode: '422001', type: 'franchise' },
  { city: 'Rajkot',     state: 'Gujarat',        pincode: '360001', type: 'franchise' },
  { city: 'Meerut',     state: 'Uttar Pradesh',  pincode: '250001', type: 'franchise' },
  { city: 'Aurangabad', state: 'Maharashtra',    pincode: '431001', type: 'vendor' },
  { city: 'Dhanbad',    state: 'Jharkhand',      pincode: '826001', type: 'vendor' },
  { city: 'Guwahati',   state: 'Assam',          pincode: '781001', type: 'vendor' },
  { city: 'Ranchi',     state: 'Jharkhand',      pincode: '834001', type: 'vendor' },
];

const FIRST_NAMES = [
  'Aarav', 'Vihaan', 'Aditya', 'Vivaan', 'Arjun', 'Reyansh', 'Krishna', 'Sai',
  'Ishaan', 'Shaurya', 'Atharv', 'Rudra', 'Aaryan', 'Ayaan', 'Krish', 'Veer',
  'Saanvi', 'Aanya', 'Aadhya', 'Aaradhya', 'Anaya', 'Pari', 'Anvi', 'Myra',
  'Sara', 'Ira', 'Ahana', 'Anika', 'Navya', 'Diya', 'Avni', 'Riya',
  'Rohan', 'Karan', 'Amit', 'Sunil', 'Priya', 'Neha', 'Pooja', 'Sneha',
];

const LAST_NAMES = [
  'Sharma', 'Verma', 'Gupta', 'Patel', 'Singh', 'Kumar', 'Iyer', 'Reddy',
  'Nair', 'Mehta', 'Khan', 'Joshi', 'Shah', 'Desai', 'Pillai', 'Rao',
  'Chopra', 'Kapoor', 'Malhotra', 'Bose', 'Das', 'Ghosh', 'Banerjee', 'Mukherjee',
];

const DEPTS = [
  '00000000-0000-0000-0000-0000000000c2', // Operation
  '00000000-0000-0000-0000-0000000000c3', // Customer Support
  '00000000-0000-0000-0000-0000000000c4', // Data Entry
  '00000000-0000-0000-0000-0000000000c5', // Accounts
];

const DESIGS = [
  '00000000-0000-0000-0000-0000000000d3', // Admin Executive
  '00000000-0000-0000-0000-0000000000d5', // Executive
  '00000000-0000-0000-0000-0000000000d6', // Senior Executive
  '00000000-0000-0000-0000-0000000000d4', // Manager
];

const USER_TYPES = ['employee', 'employee', 'employee', 'manager'];
const CHANNELS = ['web', 'web', 'web_and_mobile', 'mobile'];

const ORDER_MODES = ['air', 'surface', 'cargo', 'train', 'local', 'courier'];
const ORDER_STATUSES = [
  'received', 'received', 'pickup_done', 'arrived_at_hub', 'connected',
  'departed', 'departed', 'arrived_at_destination', 'out_for_delivery',
  'delivered', 'delivered', 'delivered',
];
const LOCK_STATES_BY_STATUS: Record<string, string> = {
  received: 'data_entry',
  pickup_done: 'customer_care',
  arrived_at_hub: 'customer_care',
  connected: 'operation',
  departed: 'operation',
  arrived_at_destination: 'operation',
  out_for_delivery: 'operation',
  delivered: 'accounts',
  damaged: 'admin_locked',
  not_received: 'admin_locked',
  cancelled: 'admin_locked',
};

const SHIPPERS = [
  'Mylan Pharma', 'Goldmend Health', 'Cipla Logistics', 'Sun Pharma Group',
  'Dr Reddys', 'Lupin Ltd', 'Aurobindo', 'Zydus Cadila',
  'Tata Auto Parts', 'Bajaj Industries', 'Mahindra Distribution',
  'Reliance Retail', 'Future Group', 'Big Bazaar',
  'Quick India', 'Express Cargo', 'Speedy Logistics',
];

const CONSIGNEES = [
  'C&F Delhi Mylan', 'B.d.s Pharma', 'Geetax Medicine Centre', 'The Care Sri Cghs',
  'Apollo Pharmacy', 'MedPlus Stores', 'Wellness Forever', 'Netmeds Hub',
  'City Hospital Stores', 'Sun Medico', 'Healing Hands Clinic',
  'Quick India Logistics', 'Local Distributor', 'Final Mile Hub',
];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function dateAgo(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

async function seedCommodities() {
  console.log('Seeding commodities...');
  let added = 0;
  for (const name of COMMODITY_NAMES) {
    const typeId = commodityTypeFor(name);
    const verifier = Math.random() < 0.5 ? SUPER_ADMIN : '00000000-0000-0000-0000-0000000000a2';
    const r = await pool.query(
      `insert into commodities (org_id, type_id, name, verified_by)
       values ($1, $2, $3, $4)
       on conflict do nothing
       returning id`,
      [ORG, typeId, name, verifier],
    );
    if (r.rowCount && r.rowCount > 0) added++;
  }
  console.log(`  added ${added} commodities`);
}

async function seedBranches() {
  console.log('Seeding branches...');
  let added = 0;
  for (const b of BRANCH_CITIES) {
    const code = `QIL-${b.city.toUpperCase().replace(/\s+/g, '-')}`;
    const r = await pool.query(
      `insert into branches (
         org_id, code, name, alias, branch_type, email, phone,
         address_line, state, city, pincode, head_name, head_email, head_phone, verified_by
       ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       on conflict do nothing returning id`,
      [
        ORG, code, code, `${b.city} Branch`, b.type,
        `${b.city.toLowerCase()}@quickindialogistics.com`,
        `98${randInt(10000000, 99999999)}`,
        `Main Road, ${b.city}`, b.state, b.city, b.pincode,
        `${rand(FIRST_NAMES)} ${rand(LAST_NAMES)}`,
        `head.${b.city.toLowerCase()}@quickindialogistics.com`,
        `98${randInt(10000000, 99999999)}`,
        SUPER_ADMIN,
      ],
    );
    if (r.rowCount && r.rowCount > 0) added++;
  }
  console.log(`  added ${added} branches`);
}

async function seedUsers() {
  console.log('Seeding users...');
  const passwordHash = await bcrypt.hash('user12345', 12);
  const branches = await pool.query(
    `select id from branches where org_id = $1 order by random() limit 30`,
    [ORG],
  );
  const branchIds = branches.rows.map((r) => r.id as string);

  let added = 0;
  const used = new Set<string>();
  for (let i = 0; i < 30; i++) {
    const first = rand(FIRST_NAMES);
    const last = rand(LAST_NAMES);
    const baseUser = `${first.toLowerCase()}.${last.toLowerCase()}`;
    let username = baseUser;
    let suffix = 1;
    while (used.has(username)) {
      username = `${baseUser}${suffix++}`;
    }
    used.add(username);
    const idx = i % branchIds.length;
    const r = await pool.query(
      `insert into users (
         org_id, username, password_hash, full_name, email, phone,
         user_type, channel_access, department_id, designation_id, home_branch_id,
         must_change_pw
       ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, false)
       on conflict do nothing returning id`,
      [
        ORG, username, passwordHash, `${first} ${last}`,
        `${username}@quickindialogistics.com`,
        `98${randInt(10000000, 99999999)}`,
        rand(USER_TYPES), rand(CHANNELS),
        rand(DEPTS), rand(DESIGS), branchIds[idx] ?? null,
      ],
    );
    if (r.rowCount && r.rowCount > 0) {
      const userId = r.rows[0].id as string;
      // Assign primary home branch + 2-3 random other branches
      await pool.query(
        `insert into user_branches (user_id, branch_id, is_primary) values ($1, $2, true)
         on conflict do nothing`,
        [userId, branchIds[idx]],
      );
      added++;
    }
  }
  console.log(`  added ${added} users`);
}

async function seedOrders(count: number) {
  console.log(`Seeding ${count} orders...`);
  const branches = await pool.query(
    `select id, name from branches where org_id = $1`,
    [ORG],
  );
  const branchIds = branches.rows.map((r) => r.id as string);
  const branchesByName = new Map(branches.rows.map((r) => [r.name as string, r.id as string]));

  const clients = await pool.query(
    `select c.id, c.name, bt.id as bill_to_id from clients c join bill_to bt on bt.id = c.bill_to_id where bt.org_id = $1`,
    [ORG],
  );
  if (clients.rowCount === 0) {
    console.log('  no clients to associate; skip');
    return;
  }

  let added = 0;
  for (let i = 0; i < count; i++) {
    const docketNo = `D${randInt(100000, 9999999)}-${i}`;
    const status = rand(ORDER_STATUSES);
    const client = clients.rows[Math.floor(Math.random() * clients.rows.length)];
    const originId = branchIds[Math.floor(Math.random() * branchIds.length)];
    let destId = branchIds[Math.floor(Math.random() * branchIds.length)];
    while (destId === originId) {
      destId = branchIds[Math.floor(Math.random() * branchIds.length)];
    }
    const isCold = Math.random() < 0.3;
    const mode = rand(ORDER_MODES);

    const r = await pool.query(
      `insert into orders (
         org_id, docket_no, booking_date, bill_to_id, client_id,
         shipper_name, consignee_name, origin, destination,
         origin_branch_id, destination_branch_id,
         mode, delivery_type, is_cold_chain, priority,
         actual_weight_kg, chargeable_weight_kg, no_of_pieces, no_of_boxes,
         invoice_value, status, lock_state,
         created_branch_id, current_branch_id, created_by
       ) values (
         $1, $2, $3, $4, $5,
         $6, $7, $8, $9,
         $10, $11,
         $12, $13, $14, $15,
         $16, $17, $18, $19,
         $20, $21, $22,
         $23, $24, $25
       ) on conflict do nothing returning id`,
      [
        ORG, docketNo, dateAgo(randInt(0, 45)),
        client.bill_to_id, client.id,
        rand(SHIPPERS), rand(CONSIGNEES),
        await branchNameFor(originId, branches.rows),
        await branchNameFor(destId, branches.rows),
        originId, destId,
        mode, Math.random() < 0.85 ? 'domestic' : Math.random() < 0.5 ? 'local' : 'international',
        isCold, Math.random() < 0.2 ? 'priority' : 'normal',
        Number((Math.random() * 30 + 0.5).toFixed(2)),
        Number((Math.random() * 35 + 1).toFixed(2)),
        randInt(1, 25), randInt(0, 8),
        randInt(1000, 200000),
        status, LOCK_STATES_BY_STATUS[status] ?? 'data_entry',
        originId, status === 'delivered' ? destId : originId, SUPER_ADMIN,
      ],
    );
    if (r.rowCount && r.rowCount > 0) added++;
  }
  console.log(`  added ${added} orders`);
}

async function branchNameFor(id: string, rows: { id: string; name: string }[]): Promise<string> {
  const row = rows.find((r) => r.id === id);
  return row?.name?.replace(/^QIL-/, '').replace(/-/g, ' ') ?? id;
}

(async () => {
  try {
    await seedCommodities();
    await seedBranches();
    await seedUsers();
    await seedOrders(200);
    console.log('Done.');
  } catch (e) {
    console.error('Seeding failed:', e);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
