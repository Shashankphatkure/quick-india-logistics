import React from 'react';
import * as Input from '@/components/ui/input';
import * as Table from '@/components/ui/table';
import * as Badge from '@/components/ui/badge';
import PageHeader from '@/components/page-header';
import StatsStrip from '@/components/stats-strip';
import { RiSearchLine, RiMapPin2Line } from '@remixicon/react';
import FilterPopover from '@/components/filter-popover';
import { listLocations, countLocations, getLocationCounts, LOCATION_PAGE_SIZE } from '@/lib/db/locations';
import { listBranchesForSelect } from '@/lib/db/branches';
import { currentOrgId } from '@/lib/tenant';
import PaginationLinks from '@/components/pagination-links';
import AddLocationForm from './add-location-form';

export default async function LocationsPage({ searchParams }: { searchParams?: { search?: string; page?: string } }) {
  const orgId = await currentOrgId();
  const search = searchParams?.search?.trim() || undefined;
  const page = Math.max(1, Number(searchParams?.page) || 1);

  const [rows, total, counts, branches] = await Promise.all([
    listLocations({ orgId, search, page }),
    countLocations({ orgId, search }),
    getLocationCounts(orgId),
    listBranchesForSelect(orgId),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / LOCATION_PAGE_SIZE));

  return (
    <div className="space-y-6">
      <PageHeader
        icon={RiMapPin2Line}
        iconColor="bg-information-lighter text-information-base"
        title="Locations"
        subtitle="Operating locations — Country → Pincode → State → City → Branch"
        breadcrumbs={[{ label: 'Master', href: '/master/locations' }, { label: 'Locations' }]}
      >
        <FilterPopover fields={[
          { name: 'search', label: 'City / State / Pincode', type: 'text', placeholder: 'Search...' },
        ]} />
        <AddLocationForm branches={branches} />
      </PageHeader>

      <StatsStrip stats={[
        { label: 'Total Locations', value: counts.total, trend: 0, trendLabel: 'all locations' },
        { label: 'States', value: counts.states, trend: 0, trendLabel: 'covered' },
        { label: 'Cities', value: counts.cities, trend: 0, trendLabel: 'covered' },
        { label: 'Pincodes', value: counts.pincodes, trend: 0, trendLabel: 'covered' },
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
            <Table.Row>{['Country', 'Pincode', 'State', 'City', 'Assigned Branch', 'In Use', 'Created By', 'Validated By', 'Status'].map(c => <Table.Head key={c}>{c}</Table.Head>)}</Table.Row>
          </Table.Header>
          <Table.Body>
            {rows.length === 0 ? (
              <Table.Row><Table.Cell colSpan={9} className="py-10 text-center text-paragraph-sm text-text-sub-600">No locations</Table.Cell></Table.Row>
            ) : rows.map(l => (
              <Table.Row key={l.id}>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{l.country}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600 font-mono">{l.pincode ?? '—'}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{l.state}</Table.Cell>
                <Table.Cell className="h-auto py-3"><span className="text-paragraph-sm font-medium text-text-strong-950">{l.city}</span></Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{l.assigned_branch_name ?? '—'}</Table.Cell>
                <Table.Cell className="h-auto py-3">
                  <Badge.Root size="small" variant="lighter" color={l.in_use ? 'green' : 'gray'}>{l.in_use ? 'In Use' : 'Idle'}</Badge.Root>
                </Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{l.created_by_name ?? '—'}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{l.validated_by_name ?? '—'}</Table.Cell>
                <Table.Cell className="h-auto py-3">
                  <Badge.Root size="medium" variant="light" color={l.is_active ? 'green' : 'gray'}>
                    <Badge.Dot />{l.is_active ? 'Active' : 'Inactive'}
                  </Badge.Root>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
        <div className="flex items-center justify-between border-t border-stroke-soft-200 px-4 py-3">
          <span className="text-paragraph-xs text-text-sub-600">Showing {total === 0 ? 0 : (page-1)*LOCATION_PAGE_SIZE+1}-{Math.min(page*LOCATION_PAGE_SIZE, total)} of {total}</span>
          <PaginationLinks page={page} totalPages={totalPages} basePath="/master/locations" query={{ search }} />
        </div>
      </div>
    </div>
  );
}
