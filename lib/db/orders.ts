import 'server-only';
import { many, one } from '@/lib/db';
import type { OrderListItem } from '@/lib/order-status';

export type OrderRow = OrderListItem;

export type OrderCounts = {
  total: number;
  delivered: number;
  in_transit: number;
  cold_chain: number;
};

export { orderStatusLabel } from '@/lib/order-status';

export async function listOrders(opts: {
  orgId: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<OrderRow[]> {
  const page = Math.max(1, opts.page ?? 1);
  const pageSize = Math.min(100, opts.pageSize ?? 25);
  return many<OrderRow>(
    `select
       o.id, o.docket_no,
       to_char(o.booking_date, 'DD-MM-YYYY') as booking_date,
       c.name as client_name,
       bt.name as bill_to_name,
       o.shipper_name, o.consignee_name,
       o.origin, o.destination,
       o.mode, o.delivery_type, o.is_cold_chain, o.status, o.priority,
       cb.name as current_branch_name
     from orders o
     left join clients c on c.id = o.client_id
     left join bill_to bt on bt.id = o.bill_to_id
     left join branches cb on cb.id = o.current_branch_id
     where o.org_id = $1
       and ($2::text is null or
            o.docket_no ilike '%' || $2 || '%' or
            o.shipper_name ilike '%' || $2 || '%' or
            o.consignee_name ilike '%' || $2 || '%' or
            c.name ilike '%' || $2 || '%')
     order by o.booking_date desc, o.created_at desc
     limit $3 offset $4`,
    [opts.orgId, opts.search ?? null, pageSize, (page - 1) * pageSize],
  );
}

export async function countOrders(opts: { orgId: string; search?: string }): Promise<number> {
  const r = await one<{ n: string }>(
    `select count(*)::text as n from orders o
     left join clients c on c.id = o.client_id
     where o.org_id = $1 and ($2::text is null or
       o.docket_no ilike '%' || $2 || '%' or
       o.shipper_name ilike '%' || $2 || '%' or
       o.consignee_name ilike '%' || $2 || '%' or
       c.name ilike '%' || $2 || '%')`,
    [opts.orgId, opts.search ?? null],
  );
  return Number(r?.n ?? 0);
}

export async function getOrderCounts(orgId: string): Promise<OrderCounts> {
  const r = await one<{ total: string; delivered: string; in_transit: string; cold_chain: string }>(
    `select
       count(*)::text as total,
       count(*) filter (where status = 'delivered')::text as delivered,
       count(*) filter (where status in ('departed', 'arrived_at_destination', 'out_for_delivery'))::text as in_transit,
       count(*) filter (where is_cold_chain)::text as cold_chain
     from orders where org_id = $1`,
    [orgId],
  );
  return {
    total: Number(r?.total ?? 0),
    delivered: Number(r?.delivered ?? 0),
    in_transit: Number(r?.in_transit ?? 0),
    cold_chain: Number(r?.cold_chain ?? 0),
  };
}
