import 'server-only';
import { many, one } from '@/lib/db';

export type EwaybillRow = {
  id: string;
  docket_no: string;
  booking_date: string;
  ewaybill_no: string | null;
  ewaybill_valid_until: string | null;
  part_b_done: boolean;
  shipper_name: string;
  consignee_name: string;
  origin: string;
  destination: string;
  mode: string;
  status: string;
  client_name: string | null;
};

const PAGE_SIZE = 25;
type BranchIds = string[] | null;

const BRANCH_CLAUSE = (n: number) =>
  `and ($${n}::uuid[] is null or o.current_branch_id = any($${n}) or o.origin_branch_id = any($${n}) or o.destination_branch_id = any($${n}))`;

export async function listEwaybillOrders(opts: { orgId: string; branchIds?: BranchIds; search?: string; page?: number; onlyMissingPartB?: boolean }) {
  const page = Math.max(1, opts.page ?? 1);
  const branchIds = opts.branchIds ?? null;
  const partBClause = opts.onlyMissingPartB ? 'and o.ewaybill_part_b_done = false' : '';
  return many<EwaybillRow>(
    `select o.id, o.docket_no,
            to_char(o.booking_date, 'DD-MM-YYYY') as booking_date,
            o.ewaybill_no,
            to_char(o.ewaybill_valid_until, 'DD-MM-YYYY HH24:MI') as ewaybill_valid_until,
            o.ewaybill_part_b_done as part_b_done,
            o.shipper_name, o.consignee_name, o.origin, o.destination, o.mode, o.status,
            c.name as client_name
     from orders o left join clients c on c.id = o.client_id
     where o.org_id=$1 and o.ewaybill_no is not null
       ${BRANCH_CLAUSE(5)}
       and ($2::text is null or o.ewaybill_no ilike '%' || $2 || '%' or o.docket_no ilike '%' || $2 || '%')
       ${partBClause}
     order by o.booking_date desc, o.created_at desc
     limit $3 offset $4`,
    [opts.orgId, opts.search ?? null, PAGE_SIZE, (page - 1) * PAGE_SIZE, branchIds],
  );
}

export async function countEwaybillOrders(opts: { orgId: string; branchIds?: BranchIds; search?: string; onlyMissingPartB?: boolean }) {
  const branchIds = opts.branchIds ?? null;
  const partBClause = opts.onlyMissingPartB ? 'and o.ewaybill_part_b_done = false' : '';
  const r = await one<{ n: string }>(
    `select count(*)::text as n from orders o
     where o.org_id=$1 and o.ewaybill_no is not null
       ${BRANCH_CLAUSE(3)}
       and ($2::text is null or o.ewaybill_no ilike '%' || $2 || '%' or o.docket_no ilike '%' || $2 || '%')
       ${partBClause}`,
    [opts.orgId, opts.search ?? null, branchIds],
  );
  return Number(r?.n ?? 0);
}

export async function getEwaybillCounts(orgId: string, branchIds: BranchIds = null) {
  const r = await one<{ total: string; with_eway: string; missing: string; part_b_done: string }>(
    `select count(*)::text as total,
       count(*) filter (where ewaybill_no is not null)::text as with_eway,
       count(*) filter (where ewaybill_no is null)::text as missing,
       count(*) filter (where ewaybill_no is not null and ewaybill_part_b_done)::text as part_b_done
     from orders o
     where o.org_id=$1
       ${BRANCH_CLAUSE(2)}`,
    [orgId, branchIds],
  );
  return {
    total: Number(r?.total ?? 0),
    with_eway: Number(r?.with_eway ?? 0),
    missing: Number(r?.missing ?? 0),
    part_b_done: Number(r?.part_b_done ?? 0),
  };
}

export const EWAYBILL_PAGE_SIZE = PAGE_SIZE;
