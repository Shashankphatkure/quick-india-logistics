import 'server-only';
import { many, one } from '@/lib/db';
import { resolveSort } from '@/lib/sort';
import type { OrderListItem } from '@/lib/order-status';

export type OrderRow = OrderListItem;

export type OrderCounts = {
  total: number;
  delivered: number;
  in_transit: number;
  cold_chain: number;
};

export { orderStatusLabel } from '@/lib/order-status';

type BranchIds = string[] | null;

export type OrderFilters = {
  orgId: string;
  branchIds?: BranchIds;
  search?: string;
  status?: string;
  mode?: string;
  coldChain?: boolean;
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
};

// Whitelisted sortable columns → SQL expressions.
const ORDER_SORT: Record<string, string> = {
  date: 'o.booking_date',
  docket: 'o.docket_no',
  client: 'c.name',
  shipper: 'o.shipper_name',
  status: 'o.status',
  mode: 'o.mode',
  weight: 'o.chargeable_weight_kg',
};

/**
 * Shared WHERE for list + count. Params are bound positionally:
 * $1 orgId, $2 branchIds(uuid[]), $3 search, $4 status, $5 mode, $6 coldChain(bool|null), $7 from, $8 to
 */
const ORDER_WHERE = `
  o.org_id = $1
  and ($2::uuid[] is null
       or o.current_branch_id = any($2)
       or o.origin_branch_id = any($2)
       or o.destination_branch_id = any($2))
  and ($3::text is null or
       o.docket_no ilike '%' || $3 || '%' or
       o.shipper_name ilike '%' || $3 || '%' or
       o.consignee_name ilike '%' || $3 || '%' or
       c.name ilike '%' || $3 || '%')
  and ($4::text is null or o.status = $4)
  and ($5::text is null or o.mode = $5)
  and ($6::boolean is null or o.is_cold_chain = $6)
  and ($7::date is null or o.booking_date >= $7::date)
  and ($8::date is null or o.booking_date <= $8::date)
`;

function whereParams(f: OrderFilters): unknown[] {
  return [
    f.orgId,
    f.branchIds ?? null,
    f.search ?? null,
    f.status ?? null,
    f.mode ?? null,
    f.coldChain ?? null,
    f.from ?? null,
    f.to ?? null,
  ];
}

export async function listOrders(
  opts: OrderFilters & { page?: number; pageSize?: number; sort?: string; dir?: string },
): Promise<OrderRow[]> {
  const page = Math.max(1, opts.page ?? 1);
  const pageSize = Math.min(100, opts.pageSize ?? 25);
  const order = resolveSort(opts.sort, opts.dir, ORDER_SORT, 'date');
  const params = whereParams(opts);
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
     where ${ORDER_WHERE}
     order by ${order.sql} nulls last, o.created_at desc
     limit $9 offset $10`,
    [...params, pageSize, (page - 1) * pageSize],
  );
}

export async function countOrders(opts: OrderFilters): Promise<number> {
  const r = await one<{ n: string }>(
    `select count(*)::text as n from orders o
     left join clients c on c.id = o.client_id
     where ${ORDER_WHERE}`,
    whereParams(opts),
  );
  return Number(r?.n ?? 0);
}

export async function getOrderCounts(orgId: string, branchIds: BranchIds = null): Promise<OrderCounts> {
  const r = await one<{ total: string; delivered: string; in_transit: string; cold_chain: string }>(
    `select
       count(*)::text as total,
       count(*) filter (where status = 'delivered')::text as delivered,
       count(*) filter (where status in ('departed', 'arrived_at_destination', 'out_for_delivery'))::text as in_transit,
       count(*) filter (where is_cold_chain)::text as cold_chain
     from orders o
     where o.org_id = $1
       and ($2::uuid[] is null
            or o.current_branch_id = any($2)
            or o.origin_branch_id = any($2)
            or o.destination_branch_id = any($2))`,
    [orgId, branchIds],
  );
  return {
    total: Number(r?.total ?? 0),
    delivered: Number(r?.delivered ?? 0),
    in_transit: Number(r?.in_transit ?? 0),
    cold_chain: Number(r?.cold_chain ?? 0),
  };
}
