import React from 'react';
import * as Button from '@/components/ui/button';
import * as Input from '@/components/ui/input';
import * as Table from '@/components/ui/table';
import * as Badge from '@/components/ui/badge';
import PageHeader from '@/components/page-header';
import StatsStrip from '@/components/stats-strip';
import { RiSearchLine, RiFilePaperLine } from '@remixicon/react';
import { listManifests, countManifests, getManifestCounts, MANIFEST_PAGE_SIZE } from '@/lib/db/manifests';
import { currentOrgId } from '@/lib/tenant';
import PaginationLinks from '@/components/pagination-links';
import ManifestTabs from '@/components/manifest-tabs';
import FilterPopover from '@/components/filter-popover';

const STATE_LABEL: Record<string, { label: string; color: 'gray' | 'blue' | 'orange' | 'green' | 'purple' }> = {
  rough: { label: 'Rough', color: 'gray' },
  final: { label: 'Final', color: 'blue' },
  departed: { label: 'Departed', color: 'orange' },
  arrived: { label: 'Arrived', color: 'purple' },
  received: { label: 'Received', color: 'green' },
};

const MODE_LABEL: Record<string, string> = {
  local: 'Local', air: 'Air', surface: 'Surface', cargo: 'Cargo',
  train: 'Train', courier: 'Courier', warehouse: 'Warehouse', hub_transfer: 'Hub Transfer',
};

export default async function AllManifestsPage({ searchParams }: { searchParams?: { search?: string; state?: string; page?: string } }) {
  const orgId = await currentOrgId();
  const search = searchParams?.search?.trim() || undefined;
  const state = searchParams?.state;
  const page = Math.max(1, Number(searchParams?.page) || 1);

  const [rows, total, counts] = await Promise.all([
    listManifests({ orgId, search, state, page }),
    countManifests({ orgId, search, state }),
    getManifestCounts(orgId),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / MANIFEST_PAGE_SIZE));

  return (
    <div className="space-y-6">
      <PageHeader
        icon={RiFilePaperLine}
        title="All Manifests"
        subtitle="Outbound shipment manifests across all states"
        breadcrumbs={[{ label: 'Manifest', href: '/manifest/all' }, { label: 'All' }]}
      >
        <FilterPopover fields={[
          { name: 'state', label: 'State', type: 'select', options: [
            { value: 'rough', label: 'Rough' },
            { value: 'final', label: 'Final' },
            { value: 'departed', label: 'Departed' },
            { value: 'arrived', label: 'Arrived' },
            { value: 'received', label: 'Received' },
          ]},
          { name: 'search', label: 'Manifest No', type: 'text', placeholder: 'MAN...' },
        ]} />
      </PageHeader>

      <StatsStrip stats={[
        { label: 'Total Manifests', value: counts.total, trend: 0, trendLabel: 'all time' },
        { label: 'Final', value: counts.final, trend: 0, trendLabel: 'all time' },
        { label: 'Departed', value: counts.departed, trend: 0, trendLabel: 'all time' },
        { label: 'Received', value: counts.received, trend: 0, trendLabel: 'all time' },
      ]} />

      <ManifestTabs active="/manifest/all" />

      <div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <div className="border-b border-stroke-soft-200 px-4 py-3">
          <form method="GET">
            <Input.Root size="small" className="w-full max-w-xs">
              <Input.Wrapper>
                <Input.Icon as={RiSearchLine} />
                <Input.Input name="search" defaultValue={search ?? ''} placeholder="Search manifest no..." />
              </Input.Wrapper>
            </Input.Root>
          </form>
        </div>
        <Table.Root>
          <Table.Header>
            <Table.Row>{['Manifest No', 'Date', 'From → To', 'Mode', 'Vendor / Vehicle', 'AWB', 'Orders', 'Bags / Boxes', 'Weight (kg)', 'State'].map(c => <Table.Head key={c}>{c}</Table.Head>)}</Table.Row>
          </Table.Header>
          <Table.Body>
            {rows.length === 0 ? (
              <Table.Row><Table.Cell colSpan={10} className="py-10 text-center text-paragraph-sm text-text-sub-600">No manifests found</Table.Cell></Table.Row>
            ) : rows.map(m => {
              const sl = STATE_LABEL[m.state] ?? { label: m.state, color: 'gray' as const };
              return (
                <Table.Row key={m.id}>
                  <Table.Cell className="h-auto py-3"><span className="text-paragraph-sm font-medium text-primary-base">{m.manifest_no}</span></Table.Cell>
                  <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{m.manifest_date}</Table.Cell>
                  <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{m.from_branch_name} <span className="text-text-disabled-300">→</span> {m.to_branch_name}</Table.Cell>
                  <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{MODE_LABEL[m.mode] ?? m.mode}</Table.Cell>
                  <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{m.vendor_name ?? m.vehicle_no ?? '—'}</Table.Cell>
                  <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{m.airway_bill_no ?? '—'}</Table.Cell>
                  <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{m.order_count}</Table.Cell>
                  <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{m.total_bags} / {m.total_boxes}</Table.Cell>
                  <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{m.coloader_chargeable_kg ?? '—'}</Table.Cell>
                  <Table.Cell className="h-auto py-3"><Badge.Root size="medium" variant="light" color={sl.color}><Badge.Dot />{sl.label}</Badge.Root></Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table.Root>
        <div className="flex items-center justify-between border-t border-stroke-soft-200 px-4 py-3">
          <span className="text-paragraph-xs text-text-sub-600">Showing {total === 0 ? 0 : (page-1)*MANIFEST_PAGE_SIZE+1}-{Math.min(page*MANIFEST_PAGE_SIZE, total)} of {total}</span>
          <PaginationLinks page={page} totalPages={totalPages} basePath="/manifest/all" query={{ search, state }} />
        </div>
      </div>
    </div>
  );
}
