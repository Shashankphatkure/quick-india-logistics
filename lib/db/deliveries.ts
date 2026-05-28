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

export type DeliveryTab = 'delivered' | 'undelivered' | 'pending_mark';

export async function listDeliveries(opts: {
  orgId: string;
  search?: string;
  page?: number;
  tab?: DeliveryTab;
}): Promise<DeliveryRow[]> {
  const page = Math.max(1, opts.page ?? 1);
  const tab: DeliveryTab = opts.tab ?? 'delivered';

  let where = `o.org_id = $1`;
  if (tab === 'delivered') where += ` and o.status = 'delivered'`;
  else if (tab === 'undelivered') where += ` and o.status in ('not_received', 'damaged')`;
  else if (tab === 'pending_mark') where += ` and o.status in ('out_for_delivery', 'arrived_at_destination')`;

  return many<DeliveryRow>(
    `select o.id, o.docket_no,
            to_char(o.delivered_at, 'DD-MM-YYYY HH24:MI') as delivered_at,
            b.name as delivery_branch_name,
            o.pod_recipient_name, o.pod_recipient_phone,
            o.pod_image_url, o.pod_signature_url,
            o.consignee_name, o.destination, o.status
     from orders o
     left join branches b on b.id = o.destination_branch_id
     where ${where}
       and ($2::text is null or o.docket_no ilike '%' || $2 || '%' or o.consignee_name ilike '%' || $2 || '%')
     order by coalesce(o.delivered_at, o.updated_at) desc nulls last
     limit $3 offset $4`,
    [opts.orgId, opts.search ?? null, PAGE_SIZE, (page - 1) * PAGE_SIZE],
  );
}

export async function countDeliveries(opts: { orgId: string; search?: string; tab?: DeliveryTab }) {
  const tab: DeliveryTab = opts.tab ?? 'delivered';
  let where = `org_id = $1`;
  if (tab === 'delivered') where += ` and status = 'delivered'`;
  else if (tab === 'undelivered') where += ` and status in ('not_received', 'damaged')`;
  else if (tab === 'pending_mark') where += ` and status in ('out_for_delivery', 'arrived_at_destination')`;
  const r = await one<{ n: string }>(
    `select count(*)::text as n from orders
     where ${where}
       and ($2::text is null or docket_no ilike '%' || $2 || '%' or consignee_name ilike '%' || $2 || '%')`,
    [opts.orgId, opts.search ?? null],
  );
  return Number(r?.n ?? 0);
}

export async function getDeliveryCounts(orgId: string) {
  const r = await one<{ delivered: string; undelivered: string; pending: string; total: string }>(
    `select
       count(*) filter (where status='delivered')::text as delivered,
       count(*) filter (where status in ('not_received','damaged'))::text as undelivered,
       count(*) filter (where status in ('out_for_delivery','arrived_at_destination'))::text as pending,
       count(*)::text as total
     from orders where org_id=$1`,
    [orgId],
  );
  return {
    delivered: Number(r?.delivered ?? 0),
    undelivered: Number(r?.undelivered ?? 0),
    pending: Number(r?.pending ?? 0),
    total: Number(r?.total ?? 0),
  };
}

export const DELIVERY_PAGE_SIZE = PAGE_SIZE;
