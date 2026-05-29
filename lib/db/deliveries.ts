import 'server-only';
import { many, one } from '@/lib/db';

export type DeliveryRow = {
  id: string;
  docket_no: string;
  delivered_at: string | null;
  delivery_branch_name: string | null;
  pod_recipient_name: string | null;
  pod_recipient_phone: string | null;
  pod_image_url: string | null;
  pod_signature_url: string | null;
  consignee_name: string;
  destination: string;
  status: string;
};

const PAGE_SIZE = 25;
type BranchIds = string[] | null;

export type DeliveryTab = 'delivered' | 'undelivered' | 'pending_mark';

function tabClause(tab: DeliveryTab, alias = ''): string {
  const p = alias ? `${alias}.` : '';
  if (tab === 'undelivered') return ` and ${p}status in ('not_received', 'damaged')`;
  if (tab === 'pending_mark') return ` and ${p}status in ('out_for_delivery', 'arrived_at_destination')`;
  return ` and ${p}status = 'delivered'`;
}

export async function listDeliveries(opts: {
  orgId: string;
  branchIds?: BranchIds;
  search?: string;
  page?: number;
  tab?: DeliveryTab;
}): Promise<DeliveryRow[]> {
  const page = Math.max(1, opts.page ?? 1);
  const tab: DeliveryTab = opts.tab ?? 'delivered';
  const branchIds = opts.branchIds ?? null;

  return many<DeliveryRow>(
    `select o.id, o.docket_no,
            to_char(o.delivered_at, 'DD-MM-YYYY HH24:MI') as delivered_at,
            b.name as delivery_branch_name,
            o.pod_recipient_name, o.pod_recipient_phone,
            o.pod_image_url, o.pod_signature_url,
            o.consignee_name, o.destination, o.status
     from orders o
     left join branches b on b.id = o.destination_branch_id
     where o.org_id = $1${tabClause(tab, 'o')}
       and ($5::uuid[] is null or o.destination_branch_id = any($5) or o.current_branch_id = any($5))
       and ($2::text is null or o.docket_no ilike '%' || $2 || '%' or o.consignee_name ilike '%' || $2 || '%')
     order by coalesce(o.delivered_at, o.updated_at) desc nulls last
     limit $3 offset $4`,
    [opts.orgId, opts.search ?? null, PAGE_SIZE, (page - 1) * PAGE_SIZE, branchIds],
  );
}

export async function countDeliveries(opts: { orgId: string; branchIds?: BranchIds; search?: string; tab?: DeliveryTab }) {
  const tab: DeliveryTab = opts.tab ?? 'delivered';
  const branchIds = opts.branchIds ?? null;
  const r = await one<{ n: string }>(
    `select count(*)::text as n from orders o
     where o.org_id = $1${tabClause(tab, 'o')}
       and ($3::uuid[] is null or o.destination_branch_id = any($3) or o.current_branch_id = any($3))
       and ($2::text is null or o.docket_no ilike '%' || $2 || '%' or o.consignee_name ilike '%' || $2 || '%')`,
    [opts.orgId, opts.search ?? null, branchIds],
  );
  return Number(r?.n ?? 0);
}

export async function getDeliveryCounts(orgId: string, branchIds: BranchIds = null) {
  const r = await one<{ delivered: string; undelivered: string; pending: string; total: string }>(
    `select
       count(*) filter (where status='delivered')::text as delivered,
       count(*) filter (where status in ('not_received','damaged'))::text as undelivered,
       count(*) filter (where status in ('out_for_delivery','arrived_at_destination'))::text as pending,
       count(*)::text as total
     from orders o
     where o.org_id=$1
       and ($2::uuid[] is null or o.destination_branch_id = any($2) or o.current_branch_id = any($2))`,
    [orgId, branchIds],
  );
  return {
    delivered: Number(r?.delivered ?? 0),
    undelivered: Number(r?.undelivered ?? 0),
    pending: Number(r?.pending ?? 0),
    total: Number(r?.total ?? 0),
  };
}

export const DELIVERY_PAGE_SIZE = PAGE_SIZE;
