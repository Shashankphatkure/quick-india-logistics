import 'server-only';
import { many, one } from '@/lib/db';
import { resolveSort } from '@/lib/sort';

const MANIFEST_SORT: Record<string, string> = {
  date: 'm.manifest_date',
  manifest: 'm.manifest_no',
  mode: 'm.mode',
  state: 'm.state',
};

export type ManifestRow = {
  id: string;
  manifest_no: string;
  manifest_date: string;
  from_branch_name: string;
  to_branch_name: string;
  mode: string;
  vendor_name: string | null;
  airway_bill_no: string | null;
  vehicle_no: string | null;
  total_bags: number;
  total_boxes: number;
  coloader_chargeable_kg: string | null;
  rate_per_kg: string | null;
  state: string;
  order_count: number;
};

const PAGE_SIZE = 25;
type BranchIds = string[] | null;

// Branch scope for manifests: from/to branch. $n is a uuid[] param.
const MANIFEST_BRANCH = (n: number) =>
  `and ($${n}::uuid[] is null or m.from_branch_id = any($${n}) or m.to_branch_id = any($${n}))`;
// Branch scope for orders inside pending-dispatch.
const ORDER_BRANCH = (n: number) =>
  `and ($${n}::uuid[] is null or o.current_branch_id = any($${n}) or o.origin_branch_id = any($${n}) or o.destination_branch_id = any($${n}))`;

export async function listManifests(opts: { orgId: string; branchIds?: BranchIds; search?: string; state?: string; toBranchId?: string; page?: number; sort?: string; dir?: string }) {
  const page = Math.max(1, opts.page ?? 1);
  const branchIds = opts.branchIds ?? null;
  const order = resolveSort(opts.sort, opts.dir, MANIFEST_SORT, 'date');
  return many<ManifestRow>(
    `select m.id, m.manifest_no,
            to_char(m.manifest_date, 'DD-MM-YYYY') as manifest_date,
            fb.name as from_branch_name, tb.name as to_branch_name,
            m.mode, v.name as vendor_name, m.airway_bill_no, m.vehicle_no,
            m.total_bags, m.total_boxes, m.coloader_chargeable_kg::text,
            m.rate_per_kg::text, m.state,
            (select count(*)::int from manifest_orders mo where mo.manifest_id = m.id) as order_count
     from manifests m
     join branches fb on fb.id = m.from_branch_id
     join branches tb on tb.id = m.to_branch_id
     left join vendors v on v.id = m.vendor_id
     where m.org_id = $1
       ${MANIFEST_BRANCH(7)}
       and ($2::text is null or m.manifest_no ilike '%' || $2 || '%')
       and ($3::text is null or m.state = $3)
       and ($4::uuid is null or m.to_branch_id = $4::uuid)
     order by ${order.sql} nulls last, m.created_at desc
     limit $5 offset $6`,
    [opts.orgId, opts.search ?? null, opts.state ?? null, opts.toBranchId ?? null, PAGE_SIZE, (page - 1) * PAGE_SIZE, branchIds],
  );
}

export async function countManifests(opts: { orgId: string; branchIds?: BranchIds; search?: string; state?: string; toBranchId?: string }) {
  const branchIds = opts.branchIds ?? null;
  const r = await one<{ n: string }>(
    `select count(*)::text as n from manifests m
     where m.org_id=$1
       ${MANIFEST_BRANCH(5)}
       and ($2::text is null or m.manifest_no ilike '%' || $2 || '%')
       and ($3::text is null or m.state = $3)
       and ($4::uuid is null or m.to_branch_id = $4::uuid)`,
    [opts.orgId, opts.search ?? null, opts.state ?? null, opts.toBranchId ?? null, branchIds],
  );
  return Number(r?.n ?? 0);
}

export async function getManifestCounts(orgId: string, branchIds: BranchIds = null) {
  const r = await one<{ total: string; rough: string; final: string; departed: string; received: string }>(
    `select count(*)::text as total,
       count(*) filter (where state='rough')::text as rough,
       count(*) filter (where state='final')::text as final,
       count(*) filter (where state='departed')::text as departed,
       count(*) filter (where state='received')::text as received
     from manifests m
     where m.org_id=$1
       ${MANIFEST_BRANCH(2)}`,
    [orgId, branchIds],
  );
  return {
    total: Number(r?.total ?? 0),
    rough: Number(r?.rough ?? 0),
    final: Number(r?.final ?? 0),
    departed: Number(r?.departed ?? 0),
    received: Number(r?.received ?? 0),
  };
}

export type PendingDispatchOrder = {
  id: string;
  docket_no: string;
  booking_date: string;
  origin: string;
  destination: string;
  client_name: string | null;
  ewaybill_no: string | null;
  chargeable_weight_kg: string | null;
  no_of_pieces: number;
  is_cold_chain: boolean;
};

export async function listPendingDispatchOrders(opts: { orgId: string; branchIds?: BranchIds; page?: number }) {
  const page = Math.max(1, opts.page ?? 1);
  const branchIds = opts.branchIds ?? null;
  return many<PendingDispatchOrder>(
    `select o.id, o.docket_no,
            to_char(o.booking_date, 'DD-MM-YYYY') as booking_date,
            o.origin, o.destination,
            c.name as client_name,
            o.ewaybill_no, o.chargeable_weight_kg::text,
            o.no_of_pieces, o.is_cold_chain
     from orders o
     left join clients c on c.id = o.client_id
     where o.org_id=$1
       and o.status in ('received', 'pickup_done', 'arrived_at_hub')
       and not exists (select 1 from manifest_orders mo where mo.order_id = o.id)
       ${ORDER_BRANCH(4)}
     order by o.booking_date desc, o.created_at desc
     limit $2 offset $3`,
    [opts.orgId, PAGE_SIZE, (page - 1) * PAGE_SIZE, branchIds],
  );
}

export async function countPendingDispatchOrders(orgId: string, branchIds: BranchIds = null) {
  const r = await one<{ n: string; weight: string | null; pcs: string | null }>(
    `select count(*)::text as n,
       coalesce(sum(chargeable_weight_kg), 0)::text as weight,
       coalesce(sum(no_of_pieces), 0)::text as pcs
     from orders o
     where o.org_id=$1
       and o.status in ('received', 'pickup_done', 'arrived_at_hub')
       and not exists (select 1 from manifest_orders mo where mo.order_id = o.id)
       ${ORDER_BRANCH(2)}`,
    [orgId, branchIds],
  );
  return {
    count: Number(r?.n ?? 0),
    totalWeight: Number(r?.weight ?? 0),
    totalPieces: Number(r?.pcs ?? 0),
  };
}

export type ManifestDetail = {
  id: string;
  manifest_no: string;
  manifest_date: string;
  from_branch_name: string;
  to_branch_name: string;
  mode: string;
  vendor_name: string | null;
  airway_bill_no: string | null;
  vehicle_no: string | null;
  total_bags: number;
  total_boxes: number;
  coloader_chargeable_kg: string | null;
  rate_per_kg: string | null;
  state: string;
  forwarding_date: string | null;
  departed_at: string | null;
  received_at: string | null;
  created_by_name: string | null;
};

export type ManifestMemberOrder = {
  id: string;
  docket_no: string;
  status: string;
  origin: string;
  destination: string;
  shipper_name: string;
  consignee_name: string;
  client_name: string | null;
  chargeable_weight_kg: string | null;
  no_of_pieces: number;
};

export async function getManifestByNo(orgId: string, manifestNo: string, branchIds: BranchIds = null): Promise<ManifestDetail | null> {
  return one<ManifestDetail>(
    `select m.id, m.manifest_no,
            to_char(m.manifest_date, 'DD-MM-YYYY') as manifest_date,
            fb.name as from_branch_name, tb.name as to_branch_name,
            m.mode, v.name as vendor_name, m.airway_bill_no, m.vehicle_no,
            m.total_bags, m.total_boxes, m.coloader_chargeable_kg::text, m.rate_per_kg::text, m.state,
            to_char(m.forwarding_date, 'DD-MM-YYYY HH24:MI') as forwarding_date,
            to_char(m.departed_at, 'DD-MM-YYYY HH24:MI') as departed_at,
            to_char(m.received_at, 'DD-MM-YYYY HH24:MI') as received_at,
            u.full_name as created_by_name
     from manifests m
     join branches fb on fb.id = m.from_branch_id
     join branches tb on tb.id = m.to_branch_id
     left join vendors v on v.id = m.vendor_id
     left join users u on u.id = m.created_by
     where m.org_id = $1 and lower(m.manifest_no) = lower($2)
       ${MANIFEST_BRANCH(3)}`,
    [orgId, manifestNo, branchIds],
  );
}

export async function listManifestOrders(manifestId: string): Promise<ManifestMemberOrder[]> {
  return many<ManifestMemberOrder>(
    `select o.id, o.docket_no, o.status, o.origin, o.destination,
            o.shipper_name, o.consignee_name, c.name as client_name,
            o.chargeable_weight_kg::text, o.no_of_pieces
     from manifest_orders mo
     join orders o on o.id = mo.order_id
     left join clients c on c.id = o.client_id
     where mo.manifest_id = $1
     order by o.docket_no`,
    [manifestId],
  );
}

export const MANIFEST_PAGE_SIZE = PAGE_SIZE;
