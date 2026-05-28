import 'server-only';
import { many, one } from '@/lib/db';

export type RunsheetRow = {
  id: string;
  runsheet_no: string;
  runsheet_date: string;
  branch_name: string;
  route: string | null;
  vehicle_no: string | null;
  driver_name: string | null;
  driver_phone: string | null;
  state: string;
  order_count: number;
};

const PAGE_SIZE = 25;

export async function listRunsheets(opts: { orgId: string; search?: string; state?: string; page?: number }) {
  const page = Math.max(1, opts.page ?? 1);
  return many<RunsheetRow>(
    `select r.id, r.runsheet_no,
            to_char(r.runsheet_date, 'DD-MM-YYYY') as runsheet_date,
            b.name as branch_name,
            r.route, r.vehicle_no, r.driver_name, r.driver_phone, r.state,
            (select count(*)::int from runsheet_orders ro where ro.runsheet_id = r.id) as order_count
     from runsheets r join branches b on b.id = r.branch_id
     where r.org_id = $1
       and ($2::text is null or r.runsheet_no ilike '%' || $2 || '%')
       and ($3::text is null or r.state = $3)
     order by r.runsheet_date desc, r.created_at desc
     limit $4 offset $5`,
    [opts.orgId, opts.search ?? null, opts.state ?? null, PAGE_SIZE, (page - 1) * PAGE_SIZE],
  );
}

export async function countRunsheets(opts: { orgId: string; search?: string; state?: string }) {
  const r = await one<{ n: string }>(
    `select count(*)::text as n from runsheets where org_id=$1
       and ($2::text is null or runsheet_no ilike '%' || $2 || '%')
       and ($3::text is null or state = $3)`,
    [opts.orgId, opts.search ?? null, opts.state ?? null],
  );
  return Number(r?.n ?? 0);
}

export async function getRunsheetCounts(orgId: string) {
  const r = await one<{ total: string; rough: string; out: string; completed: string }>(
    `select count(*)::text as total,
       count(*) filter (where state='rough')::text as rough,
       count(*) filter (where state='out_for_delivery')::text as out,
       count(*) filter (where state='completed')::text as completed
     from runsheets where org_id=$1`,
    [orgId],
  );
  return {
    total: Number(r?.total ?? 0),
    rough: Number(r?.rough ?? 0),
    out_for_delivery: Number(r?.out ?? 0),
    completed: Number(r?.completed ?? 0),
  };
}

/**
 * Local orders that arrived at the destination branch and are ready for a runsheet
 *   - status = arrived_at_destination
 *   - NOT already on a runsheet
 */
export type PendingDeliveryOrder = {
  id: string;
  docket_no: string;
  booking_date: string;
  origin: string;
  destination: string;
  client_name: string | null;
  ewaybill_no: string | null;
  actual_weight_kg: string | null;
  no_of_pieces: number;
};

export async function listPendingDeliveryOrders(opts: { orgId: string; page?: number }) {
  const page = Math.max(1, opts.page ?? 1);
  return many<PendingDeliveryOrder>(
    `select o.id, o.docket_no,
            to_char(o.booking_date, 'DD-MM-YYYY') as booking_date,
            o.origin, o.destination,
            c.name as client_name,
            o.ewaybill_no, o.actual_weight_kg::text, o.no_of_pieces
     from orders o
     left join clients c on c.id = o.client_id
     where o.org_id=$1
       and o.status in ('arrived_at_destination', 'out_for_delivery')
       and not exists (select 1 from runsheet_orders ro where ro.order_id = o.id)
     order by o.booking_date desc, o.created_at desc
     limit $2 offset $3`,
    [opts.orgId, PAGE_SIZE, (page - 1) * PAGE_SIZE],
  );
}

export async function countPendingDeliveryOrders(orgId: string) {
  const r = await one<{ n: string; weight: string | null; pcs: string | null }>(
    `select count(*)::text as n,
       coalesce(sum(actual_weight_kg), 0)::text as weight,
       coalesce(sum(no_of_pieces), 0)::text as pcs
     from orders o
     where o.org_id=$1
       and o.status in ('arrived_at_destination', 'out_for_delivery')
       and not exists (select 1 from runsheet_orders ro where ro.order_id = o.id)`,
    [orgId],
  );
  return {
    count: Number(r?.n ?? 0),
    totalWeight: Number(r?.weight ?? 0),
    totalPieces: Number(r?.pcs ?? 0),
  };
}

export const RUNSHEET_PAGE_SIZE = PAGE_SIZE;
