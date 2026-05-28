import React from 'react';
import * as Button from '@/components/ui/button';
import * as Input from '@/components/ui/input';
import * as Table from '@/components/ui/table';
import * as Badge from '@/components/ui/badge';
import PageHeader from '@/components/page-header';
import StatsStrip from '@/components/stats-strip';
import { RiAddLine, RiSearchLine, RiRouteLine, RiArrowRightLine } from '@remixicon/react';
import { many, one } from '@/lib/db';
import { currentOrgId } from '@/lib/tenant';
import FilterPopover from '@/components/filter-popover';

type RouteRow = {
  id: string;
  client_name: string;
  mode: string;
  origin_name: string;
  destination_name: string;
  tat_hours: number;
  rate_per_kg: string | null;
};

const MODE_LABEL: Record<string, string> = {
  local: 'Local', air: 'Air', surface: 'Surface', cargo: 'Cargo',
  train: 'Train', courier: 'Courier', warehouse: 'Warehouse',
};

export default async function RoutesPage({ searchParams }: { searchParams?: { search?: string; mode?: string } }) {
  const orgId = await currentOrgId();
  const search = searchParams?.search?.trim() || null;
  const mode = searchParams?.mode?.trim() || null;

  const rows = await many<RouteRow>(
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
  );

  const counts = await one<{ total: string; modes: string; clients: string }>(
    `select count(*)::text as total,
       count(distinct t.mode)::text as modes,
       count(distinct t.client_id)::text as clients
     from tat_routes t
     join clients c on c.id = t.client_id
     join bill_to bt on bt.id = c.bill_to_id
     where bt.org_id = $1`,
    [orgId],
  );

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
        <Button.Root size="small">
          <Button.Icon as={RiAddLine} />Add Route
        </Button.Root>
      </PageHeader>

      <StatsStrip stats={[
        { label: 'Total Routes', value: Number(counts?.total ?? 0), trend: 0, trendLabel: 'all time' },
        { label: 'Modes', value: Number(counts?.modes ?? 0), trend: 0, trendLabel: 'in use' },
        { label: 'Clients', value: Number(counts?.clients ?? 0), trend: 0, trendLabel: 'covered' },
        { label: 'Showing', value: rows.length, trend: 0, trendLabel: 'in filter' },
      ]} />

      <div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <Table.Root>
          <Table.Header>
            <Table.Row>{['Client', 'Mode', 'Origin → Destination', 'TAT', 'Rate (₹/kg)'].map(c => <Table.Head key={c}>{c}</Table.Head>)}</Table.Row>
          </Table.Header>
          <Table.Body>
            {rows.length === 0 ? (
              <Table.Row><Table.Cell colSpan={5} className="py-10 text-center text-paragraph-sm text-text-sub-600">No routes configured</Table.Cell></Table.Row>
            ) : rows.map(r => (
              <Table.Row key={r.id}>
                <Table.Cell className="h-auto py-3"><span className="text-paragraph-sm font-medium text-text-strong-950">{r.client_name}</span></Table.Cell>
                <Table.Cell className="h-auto py-3">
                  <Badge.Root size="small" variant="lighter" color="blue">{MODE_LABEL[r.mode] ?? r.mode}</Badge.Root>
                </Table.Cell>
                <Table.Cell className="h-auto py-3">
                  <span className="inline-flex items-center gap-1.5 text-paragraph-sm text-text-sub-600">
                    {r.origin_name}
                    <RiArrowRightLine size={12} className="text-text-disabled-300" />
                    {r.destination_name}
                  </span>
                </Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{r.tat_hours} hrs</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{r.rate_per_kg ? `₹${r.rate_per_kg}` : '—'}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </div>
    </div>
  );
}
