/**
 * Seed the TAT master (tat_routes) for every (client × mode × origin × destination)
 * lane that existing orders actually use, so ETA computation has data to work with.
 * TAT hours are mode-based defaults; idempotent via the tat_routes unique index.
 *
 * Run: npx tsx scripts/seed-tat-routes.ts
 */
import { config } from 'dotenv';
config({ path: '.env.local' });
import { Pool } from 'pg';

const TAT_HOURS_BY_MODE: Record<string, number> = {
  local: 12,
  air: 24,
  warehouse: 24,
  courier: 48,
  surface: 72,
  train: 96,
  cargo: 120,
};

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL not set');
  const pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });

  // Distinct lanes used by real orders that have all four keys populated.
  const lanes = await pool.query<{
    client_id: string; mode: string; origin_branch_id: string; destination_branch_id: string; rate: string | null;
  }>(
    `select distinct o.client_id, o.mode, o.origin_branch_id, o.destination_branch_id,
            null::text as rate
     from orders o
     where o.client_id is not null
       and o.origin_branch_id is not null
       and o.destination_branch_id is not null
       and o.origin_branch_id <> o.destination_branch_id`,
  );

  let inserted = 0;
  for (const l of lanes.rows) {
    const tat = TAT_HOURS_BY_MODE[l.mode] ?? 72;
    const ratePerKg = (8 + (tat % 7)).toString(); // arbitrary but stable per-mode-ish rate
    const r = await pool.query(
      `insert into tat_routes (client_id, mode, origin_branch_id, destination_branch_id, tat_hours, rate_per_kg)
       values ($1, $2, $3, $4, $5, $6)
       on conflict (client_id, mode, origin_branch_id, destination_branch_id) do nothing`,
      [l.client_id, l.mode, l.origin_branch_id, l.destination_branch_id, tat, ratePerKg],
    );
    inserted += r.rowCount ?? 0;
  }

  const total = await pool.query<{ n: string }>(`select count(*)::text as n from tat_routes`);
  console.log(`Lanes scanned: ${lanes.rowCount}. Inserted: ${inserted}. tat_routes total: ${total.rows[0].n}`);
  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
