import React from 'react';
import PageHeader from '@/components/page-header';
import StatsStrip from '@/components/stats-strip';
import { RiRouteLine } from '@remixicon/react';
import { many, one } from '@/lib/db';
import { currentOrgId } from '@/lib/tenant';
import FilterPopover from '@/components/filter-popover';
import AddRouteForm from './add-route-form';
import RoutesTable, { type RouteRow } from './routes-table';

const MODE_LABEL: Record<string, string> = {
  local: 'Local', air: 'Air', surface: 'Surface', cargo: 'Cargo',
  train: 'Train', courier: 'Courier', warehouse: 'Warehouse',
};

type Option = { id: string; name: string };

export default async function RoutesPage({ searchParams }: { searchParams?: { search?: string; mode?: string } }) {
  const orgId = await currentOrgId();
  const search = searchParams?.search?.trim() || null;
  const mode = searchParams?.mode?.trim() || null;

  const [rows, counts, clients, branches] = await Promise.all([
    many<RouteRow>(
      `select t.id, c.name as client_name,
              t.mode,
              ob.name as origin_name, db.name as destination_name,
              t.tat_hours, t.rate_per_kg::text
       from tat_routes t
       join clients c on c.id = t.client_id
       join bill_to bt on bt.id = c.bill_to_id
       join branches ob on ob.id = t.origin_branch_id
       join branches db on db.id = t.destination_branch_id
       where bt.org_id = $1
         and ($2::text is null or c.name ilike '%' || $2 || '%' or ob.name ilike '%' || $2 || '%' or db.name ilike '%' || $2 || '%')
         and ($3::text is null or t.mode = $3)
       order by c.name, t.mode, ob.name`,
      [orgId, search, mode],
    ),
    one<{ total: string; modes: string; clients: string }>(
      `select count(*)::text as total,
         count(distinct t.mode)::text as modes,
         count(distinct t.client_id)::text as clients
       from tat_routes t
       join clients c on c.id = t.client_id
       join bill_to bt on bt.id = c.bill_to_id
       where bt.org_id = $1`,
      [orgId],
    ),
    many<Option>(
      `select c.id, c.name from clients c
       join bill_to bt on bt.id = c.bill_to_id
       where bt.org_id = $1 and c.is_active order by c.name`,
      [orgId],
    ),
    many<Option>(
      `select id, name from branches where org_id = $1 and is_active order by name`,
      [orgId],
    ),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={RiRouteLine}
        iconColor="bg-information-lighter text-information-base"
        title="Routes"
        subtitle="Per-client TAT (turn-around-time) per route, with rates"
        breadcrumbs={[{ label: 'Master' }, { label: 'Routes' }]}
      >
        <FilterPopover fields={[
          { name: 'mode', label: 'Mode', type: 'select', options: Object.entries(MODE_LABEL).map(([v, l]) => ({ value: v, label: l })) },
          { name: 'search', label: 'Client / Branch', type: 'text', placeholder: 'Search...' },
        ]} />
        <AddRouteForm clients={clients} branches={branches} />
      </PageHeader>

      <StatsStrip stats={[
        { label: 'Total Routes', value: Number(counts?.total ?? 0), trend: 0, trendLabel: 'all time' },
        { label: 'Modes', value: Number(counts?.modes ?? 0), trend: 0, trendLabel: 'in use' },
        { label: 'Clients', value: Number(counts?.clients ?? 0), trend: 0, trendLabel: 'covered' },
        { label: 'Showing', value: rows.length, trend: 0, trendLabel: 'in filter' },
      ]} />

      <div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <RoutesTable rows={rows} />
      </div>
    </div>
  );
}
