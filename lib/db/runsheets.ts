import 'server-only';
import { many, one } from '@/lib/db';
import { resolveSort } from '@/lib/sort';

const RUNSHEET_SORT: Record<string, string> = {
  date: 'r.runsheet_date',
  runsheet: 'r.runsheet_no',
  branch: 'b.name',
  state: 'r.state',
};

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
type BranchIds = string[] | null;

const RUNSHEET_BRANCH = (n: number) => `and ($${n}::uuid[] is null or r.branch_id = any($${n}))`;
const ORDER_BRANCH = (n: number) =>
  `and ($${n}::uuid[] is null or o.current_branch_id = any($${n}) or o.origin_branch_id = any($${n}) or o.destination_branch_id = any($${n}))`;

export async function listRunsheets(opts: { orgId: string; branchIds?: BranchIds; search?: string; state?: string; page?: number; sort?: string; dir?: string }) {
  const page = Math.max(1, opts.page ?? 1);
  const branchIds = opts.branchIds ?? null;
  const order = resolveSort(opts.sort, opts.dir, RUNSHEET_SORT, 'date');
  return many<RunsheetRow>(
    `select r.id, r.runsheet_no,
            to_char(r.runsheet_date, 'DD-MM-YYYY') as runsheet_date,
            b.name as branch_name,
            r.route, r.vehicle_no, r.driver_name, r.driver_phone, r.state,
            (select count(*)::int from runsheet_orders ro where ro.runsheet_id = r.id) as order_count
     from runsheets r join branches b on b.id = r.branch_id
     where r.org_id = $1
       ${RUNSHEET_BRANCH(6)}
       and ($2::text is null or r.runsheet_no ilike '%' || $2 || '%')
       and ($3::text is null or r.state = $3)
     order by ${order.sql} nulls last, r.created_at desc
     limit $4 offset $5`,
    [opts.orgId, opts.search ?? null, opts.state ?? null, PAGE_SIZE, (page - 1) * PAGE_SIZE, branchIds],
  );
}

export async function countRunsheets(opts: { orgId: string; branchIds?: BranchIds; search?: string; state?: string }) {
  const branchIds = opts.branchIds ?? null;
  const r = await one<{ n: string }>(
    `select count(*)::text as n from runsheets r where r.org_id=$1
       ${RUNSHEET_BRANCH(4)}
       and ($2::text is null or r.runsheet_no ilike '%' || $2 || '%')
       and ($3::text is null or r.state = $3)`,
    [opts.orgId, opts.search ?? null, opts.state ?? null, branchIds],
  );
  return Number(r?.n ?? 0);
}

export async function getRunsheetCounts(orgId: string, branchIds: BranchIds = null) {
  const r = await one<{ total: string; rough: string; out: string; completed: string }>(
    `select count(*)::text as total,
       count(*) filter (where state='rough')::text as rough,
       count(*) filter (where state='out_for_delivery')::text as out,
       count(*) filter (where state='completed')::text as completed
     from runsheets r where r.org_id=$1
       ${RUNSHEET_BRANCH(2)}`,
    [orgId, branchIds],
  );
  return {
    total: Number(r?.total ?? 0),
    rough: Number(r?.rough ?? 0),
    out_for_delivery: Number(r?.out ?? 0),
    completed: Number(r?.completed ?? 0),
  };
}

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

export async function listPendingDeliveryOrders(opts: { orgId: string; branchIds?: BranchIds; page?: number }) {
  const page = Math.max(1, opts.page ?? 1);
  const branchIds = opts.branchIds ?? null;
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
       ${ORDER_BRANCH(4)}
     order by o.booking_date desc, o.created_at desc
     limit $2 offset $3`,
    [opts.orgId, PAGE_SIZE, (page - 1) * PAGE_SIZE, branchIds],
  );
}

export async function countPendingDeliveryOrders(orgId: string, branchIds: BranchIds = null) {
  const r = await one<{ n: string; weight: string | null; pcs: string | null }>(
    `select count(*)::text as n,
       coalesce(sum(actual_weight_kg), 0)::text as weight,
       coalesce(sum(no_of_pieces), 0)::text as pcs
     from orders o
     where o.org_id=$1
       and o.status in ('arrived_at_destination', 'out_for_delivery')
       and not exists (select 1 from runsheet_orders ro where ro.order_id = o.id)
       ${ORDER_BRANCH(2)}`,
    [orgId, branchIds],
  );
  return {
    count: Number(r?.n ?? 0),
    totalWeight: Number(r?.weight ?? 0),
    totalPieces: Number(r?.pcs ?? 0),
  };
}

export type RunsheetDetail = {
  id: string;
  runsheet_no: string;
  runsheet_date: string;
  branch_name: string;
  route: string | null;
  vehicle_no: string | null;
  driver_name: string | null;
  driver_phone: string | null;
  state: string;
  created_by_name: string | null;
};

export type RunsheetStop = {
  id: string;
  docket_no: string;
  status: string;
  sequence_no: number | null;
  consignee_name: string;
  destination: string;
  client_name: string | null;
  actual_weight_kg: string | null;
  no_of_pieces: number;
  delivered_at: string | null;
};

export async function getRunsheetByNo(orgId: string, runsheetNo: string, branchIds: BranchIds = null): Promise<RunsheetDetail | null> {
  return one<RunsheetDetail>(
    `select r.id, r.runsheet_no,
            to_char(r.runsheet_date, 'DD-MM-YYYY') as runsheet_date,
            b.name as branch_name, r.route, r.vehicle_no, r.driver_name, r.driver_phone, r.state,
            u.full_name as created_by_name
     from runsheets r
     join branches b on b.id = r.branch_id
     left join users u on u.id = r.created_by
     where r.org_id = $1 and lower(r.runsheet_no) = lower($2)
       ${RUNSHEET_BRANCH(3)}`,
    [orgId, runsheetNo, branchIds],
  );
}

export async function listRunsheetStops(runsheetId: string): Promise<RunsheetStop[]> {
  return many<RunsheetStop>(
    `select o.id, o.docket_no, o.status, ro.sequence_no,
            o.consignee_name, o.destination, c.name as client_name,
            o.actual_weight_kg::text, o.no_of_pieces,
            to_char(o.delivered_at, 'DD-MM HH24:MI') as delivered_at
     from runsheet_orders ro
     join orders o on o.id = ro.order_id
     left join clients c on c.id = o.client_id
     where ro.runsheet_id = $1
     order by ro.sequence_no nulls last, o.docket_no`,
    [runsheetId],
  );
}

export const RUNSHEET_PAGE_SIZE = PAGE_SIZE;
