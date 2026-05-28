import React from 'react';
import * as Button from '@/components/ui/button';
import * as Input from '@/components/ui/input';
import * as Table from '@/components/ui/table';
import * as Badge from '@/components/ui/badge';
import PageHeader from '@/components/page-header';
import StatsStrip from '@/components/stats-strip';
import { RiAddLine, RiSearchLine, RiMapPin2Line } from '@remixicon/react';
import FilterPopover from '@/components/filter-popover';
import { many, one } from '@/lib/db';
import { currentOrgId } from '@/lib/tenant';

type LocationRow = {
  state: string;
  city: string;
  pincode: string;
  branch_count: number;
  order_count: number;
};

export default async function LocationsPage({ searchParams }: { searchParams?: { search?: string } }) {
  const orgId = await currentOrgId();
  const search = searchParams?.search?.trim() || null;

  // Locations are derived from branches + distinct cities used as origin/destination in orders
  const rows = await many<LocationRow>(
    `with branch_locs as (
       select state, city, pincode,
              count(*)::int as branch_count
       from branches
       where org_id = $1 and city is not null
       group by state, city, pincode
     ),
     order_locs as (
       select origin as city,
              count(*)::int as order_count
       from orders where org_id = $1 group by origin
     )
     select bl.state, bl.city, bl.pincode, bl.branch_count,
            coalesce(ol.order_count, 0) as order_count
     from branch_locs bl
     left join order_locs ol on lower(ol.city) = lower(bl.city)
     where ($2::text is null or bl.city ilike '%' || $2 || '%' or bl.state ilike '%' || $2 || '%')
     order by bl.state, bl.city`,
    [orgId, search],
  );

  const counts = await one<{ cities: string; states: string; pincodes: string }>(
    `select
       count(distinct city)::text as cities,
       count(distinct state)::text as states,
       count(distinct pincode)::text as pincodes
     from branches where org_id = $1 and city is not null`,
    [orgId],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        icon={RiMapPin2Line}
        iconColor="bg-information-lighter text-information-base"
        title="Locations"
        subtitle="Operating cities, states and pincodes (derived from branches)"
        breadcrumbs={[{ label: 'Master', href: '/master/locations' }, { label: 'Locations' }]}
      >
        <FilterPopover fields={[
          { name: 'search', label: 'City or State', type: 'text', placeholder: 'Search...' },
        ]} />
        <Button.Root size="small">
          <Button.Icon as={RiAddLine} />Add Location
        </Button.Root>
      </PageHeader>

      <StatsStrip stats={[
        { label: 'Total Cities', value: Number(counts?.cities ?? 0), trend: 0, trendLabel: 'covered' },
        { label: 'States', value: Number(counts?.states ?? 0), trend: 0, trendLabel: 'covered' },
        { label: 'Pincodes', value: Number(counts?.pincodes ?? 0), trend: 0, trendLabel: 'covered' },
        { label: 'Branches', value: rows.reduce((s, r) => s + r.branch_count, 0), trend: 0, trendLabel: 'total' },
      ]} />

      <div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <div className="border-b border-stroke-soft-200 px-4 py-3">
          <form method="GET">
            <Input.Root size="small" className="w-full max-w-xs">
              <Input.Wrapper>
                <Input.Icon as={RiSearchLine} />
                <Input.Input name="search" defaultValue={search ?? ''} placeholder="Search city or state..." />
              </Input.Wrapper>
            </Input.Root>
          </form>
        </div>
        <Table.Root>
          <Table.Header>
            <Table.Row>{['City', 'State', 'Pincode', 'Branches', 'Orders from here'].map(c => <Table.Head key={c}>{c}</Table.Head>)}</Table.Row>
          </Table.Header>
          <Table.Body>
            {rows.length === 0 ? (
              <Table.Row><Table.Cell colSpan={5} className="py-10 text-center text-paragraph-sm text-text-sub-600">No locations</Table.Cell></Table.Row>
            ) : rows.map(r => (
              <Table.Row key={`${r.state}-${r.city}-${r.pincode}`}>
                <Table.Cell className="h-auto py-3"><span className="text-paragraph-sm font-medium text-text-strong-950">{r.city}</span></Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{r.state}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600 font-mono">{r.pincode}</Table.Cell>
                <Table.Cell className="h-auto py-3">
                  <Badge.Root size="small" variant="lighter" color="blue">{r.branch_count}</Badge.Root>
                </Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{r.order_count}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </div>
    </div>
  );
}
