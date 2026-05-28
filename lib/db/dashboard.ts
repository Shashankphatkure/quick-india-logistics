import 'server-only';
import { many, one } from '@/lib/db';

export type DashboardMetrics = {
  outgoing: number;
  incoming: number;
  delivered_today: number;
  pending: number;
  // outgoing detail
  outgoing_total: number;
  outgoing_delivered: number;
  outgoing_pending: number;
  outgoing_all_pending: number;
  // incoming detail
  incoming_total: number;
  incoming_delivered: number;
  incoming_pending: number;
  incoming_all_pending: number;
  // cold chain
  cold_incoming: number;
  cold_outgoing: number;
  // delay
  delay_incoming_24h: number;
  delay_outgoing_24h: number;
  delay_incoming_40h: number;
  delay_outgoing_40h: number;
  // manifest
  manifest_incoming_received: number;
  manifest_incoming_not_received: number;
  manifest_outgoing_received: number;
  manifest_outgoing_not_received: number;
};

export async function getDashboardMetrics(orgId: string, branchId: string | null): Promise<DashboardMetrics> {
  const r = await one<Record<string, string>>(
    `select
       count(*) filter (where origin_branch_id = $2)::text as outgoing,
       count(*) filter (where destination_branch_id = $2)::text as incoming,
       count(*) filter (where status='delivered' and delivered_at::date = current_date)::text as delivered_today,
       count(*) filter (where status not in ('delivered','cancelled') and current_branch_id = $2)::text as pending,

       count(*) filter (where origin_branch_id = $2 and booking_date >= current_date - interval '30 days')::text as outgoing_total,
       count(*) filter (where origin_branch_id = $2 and status='delivered')::text as outgoing_delivered,
       count(*) filter (where origin_branch_id = $2 and status not in ('delivered','cancelled'))::text as outgoing_pending,
       count(*) filter (where origin_branch_id = $2 and status not in ('delivered','cancelled') and booking_date < current_date - interval '2 days')::text as outgoing_all_pending,

       count(*) filter (where destination_branch_id = $2 and booking_date >= current_date - interval '30 days')::text as incoming_total,
       count(*) filter (where destination_branch_id = $2 and status='delivered')::text as incoming_delivered,
       count(*) filter (where destination_branch_id = $2 and status not in ('delivered','cancelled'))::text as incoming_pending,
       count(*) filter (where destination_branch_id = $2 and status not in ('delivered','cancelled') and booking_date < current_date - interval '2 days')::text as incoming_all_pending,

       count(*) filter (where is_cold_chain and destination_branch_id = $2 and status not in ('delivered','cancelled'))::text as cold_incoming,
       count(*) filter (where is_cold_chain and origin_branch_id = $2 and status not in ('delivered','cancelled'))::text as cold_outgoing,

       count(*) filter (where destination_branch_id = $2 and status not in ('delivered','cancelled') and booking_date < current_date - interval '1 day')::text as delay_incoming_24h,
       count(*) filter (where origin_branch_id = $2 and status not in ('delivered','cancelled') and booking_date < current_date - interval '1 day')::text as delay_outgoing_24h,
       count(*) filter (where destination_branch_id = $2 and status not in ('delivered','cancelled') and booking_date < current_date - interval '2 days')::text as delay_incoming_40h,
       count(*) filter (where origin_branch_id = $2 and status not in ('delivered','cancelled') and booking_date < current_date - interval '2 days')::text as delay_outgoing_40h
     from orders where org_id = $1`,
    [orgId, branchId],
  );

  // Manifest counts (received vs not received)
  const m = await one<Record<string, string>>(
    `select
       count(*) filter (where to_branch_id = $2 and state='received')::text as manifest_incoming_received,
       count(*) filter (where to_branch_id = $2 and state in ('rough','final','departed','arrived'))::text as manifest_incoming_not_received,
       count(*) filter (where from_branch_id = $2 and state='received')::text as manifest_outgoing_received,
       count(*) filter (where from_branch_id = $2 and state in ('rough','final','departed','arrived'))::text as manifest_outgoing_not_received
     from manifests where org_id = $1`,
    [orgId, branchId],
  );

  const num = (k: string) => Number(r?.[k] ?? 0);
  const mnum = (k: string) => Number(m?.[k] ?? 0);

  return {
    outgoing: num('outgoing'),
    incoming: num('incoming'),
    delivered_today: num('delivered_today'),
    pending: num('pending'),
    outgoing_total: num('outgoing_total'),
    outgoing_delivered: num('outgoing_delivered'),
    outgoing_pending: num('outgoing_pending'),
    outgoing_all_pending: num('outgoing_all_pending'),
    incoming_total: num('incoming_total'),
    incoming_delivered: num('incoming_delivered'),
    incoming_pending: num('incoming_pending'),
    incoming_all_pending: num('incoming_all_pending'),
    cold_incoming: num('cold_incoming'),
    cold_outgoing: num('cold_outgoing'),
    delay_incoming_24h: num('delay_incoming_24h'),
    delay_outgoing_24h: num('delay_outgoing_24h'),
    delay_incoming_40h: num('delay_incoming_40h'),
    delay_outgoing_40h: num('delay_outgoing_40h'),
    manifest_incoming_received: mnum('manifest_incoming_received'),
    manifest_incoming_not_received: mnum('manifest_incoming_not_received'),
    manifest_outgoing_received: mnum('manifest_outgoing_received'),
    manifest_outgoing_not_received: mnum('manifest_outgoing_not_received'),
  };
}

export type RecentActivity = {
  id: string;
  docket: string;
  event: string;
  branch: string;
  time: string;
  color: 'blue' | 'orange' | 'green' | 'purple' | 'red';
};

const STATUS_TO_EVENT: Record<string, { label: string; color: RecentActivity['color'] }> = {
  received: { label: 'Order Received', color: 'blue' },
  pickup_done: { label: 'Pickup Done', color: 'blue' },
  arrived_at_hub: { label: 'Arrived At Hub', color: 'blue' },
  connected: { label: 'Manifest Created', color: 'purple' },
  departed: { label: 'Shipment In Transit', color: 'orange' },
  arrived_at_destination: { label: 'Arrived At Destination', color: 'blue' },
  out_for_delivery: { label: 'Out For Delivery', color: 'orange' },
  delivered: { label: 'Delivered', color: 'green' },
  damaged: { label: 'Damaged', color: 'red' },
  not_received: { label: 'Not Received', color: 'red' },
  cancelled: { label: 'Cancelled', color: 'red' },
};

export async function getRecentActivities(orgId: string, limit = 7): Promise<RecentActivity[]> {
  const rows = await many<{ id: string; docket: string; status: string; branch: string; created_at: string }>(
    `select o.id, o.docket_no as docket, o.status,
            coalesce(b.name, '—') as branch,
            to_char(o.updated_at, 'HH24:MI') as created_at
     from orders o
     left join branches b on b.id = o.current_branch_id
     where o.org_id = $1
     order by o.updated_at desc
     limit $2`,
    [orgId, limit],
  );
  return rows.map((r) => {
    const e = STATUS_TO_EVENT[r.status] ?? { label: r.status, color: 'blue' as const };
    return {
      id: r.id,
      docket: r.docket,
      event: e.label,
      branch: r.branch,
      time: r.created_at,
      color: e.color,
    };
  });
}
