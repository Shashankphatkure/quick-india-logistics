import React from 'react';
import * as Button from '@/components/ui/button';
import * as Input from '@/components/ui/input';
import * as Table from '@/components/ui/table';
import PageHeader from '@/components/page-header';
import StatsStrip from '@/components/stats-strip';
import { RiSearchLine, RiFilePaperLine } from '@remixicon/react';
import FilterPopover from '@/components/filter-popover';
import { listManifests, countManifests, getManifestCounts, MANIFEST_PAGE_SIZE } from '@/lib/db/manifests';
import { currentOrgId } from '@/lib/tenant';
import PaginationLinks from '@/components/pagination-links';
import ManifestTabs from '@/components/manifest-tabs';

const MODE_LABEL: Record<string, string> = {
  local: 'Local', air: 'Air', surface: 'Surface', cargo: 'Cargo',
  train: 'Train', courier: 'Courier', warehouse: 'Warehouse', hub_transfer: 'Hub Transfer',
};

export default async function ForwardingPage({ searchParams }: { searchParams?: { search?: string; page?: string } }) {
  const orgId = await currentOrgId();
  const search = searchParams?.search?.trim() || undefined;
  const page = Math.max(1, Number(searchParams?.page) || 1);

  const [rows, total, counts] = await Promise.all([
    listManifests({ orgId, search, state: 'final', page }),
    countManifests({ orgId, search, state: 'final' }),
    getManifestCounts(orgId),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / MANIFEST_PAGE_SIZE));

  return (
    <div className="space-y-6">
      <PageHeader
        icon={RiFilePaperLine}
        iconColor="bg-information-lighter text-information-base"
        title="Forwarding Details"
        subtitle="Final manifests ready to forward to coloader / airline"
        breadcrumbs={[{ label: 'Manifest', href: '/manifest/forwarding' }, { label: 'Forwarding' }]}
      >
        <FilterPopover fields={[
          { name: 'search', label: 'Manifest No', type: 'text', placeholder: 'MAN...' },
        ]} />
      </PageHeader>

      <StatsStrip stats={[
        { label: 'Final', value: counts.final, trend: 0, trendLabel: 'awaiting forward' },
        { label: 'Departed', value: counts.departed, trend: 0, trendLabel: 'all time' },
        { label: 'Received', value: counts.received, trend: 0, trendLabel: 'all time' },
        { label: 'Total', value: counts.total, trend: 0, trendLabel: 'all time' },
      ]} />

      <ManifestTabs active="/manifest/forwarding" />

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
            <Table.Row>{['Manifest No', 'Date', 'Destination', 'Mode', 'Vendor', 'AWB', 'Vehicle', 'Orders', 'Weight (kg)', 'Rate'].map(c => <Table.Head key={c}>{c}</Table.Head>)}</Table.Row>
          </Table.Header>
          <Table.Body>
            {rows.length === 0 ? (
              <Table.Row><Table.Cell colSpan={10} className="py-10 text-center text-paragraph-sm text-text-sub-600">No manifests awaiting forwarding</Table.Cell></Table.Row>
            ) : rows.map(m => (
              <Table.Row key={m.id}>
                <Table.Cell className="h-auto py-3"><span className="text-paragraph-sm font-medium text-primary-base">{m.manifest_no}</span></Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{m.manifest_date}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{m.to_branch_name}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{MODE_LABEL[m.mode] ?? m.mode}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{m.vendor_name ?? '—'}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-strong-950 font-mono">{m.airway_bill_no ?? '—'}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{m.vehicle_no ?? '—'}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{m.order_count}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{m.coloader_chargeable_kg ?? '—'}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{m.rate_per_kg ? `₹${m.rate_per_kg}/kg` : '—'}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
        <div className="flex items-center justify-between border-t border-stroke-soft-200 px-4 py-3">
          <span className="text-paragraph-xs text-text-sub-600">Showing {total === 0 ? 0 : (page-1)*MANIFEST_PAGE_SIZE+1}-{Math.min(page*MANIFEST_PAGE_SIZE, total)} of {total}</span>
          <PaginationLinks page={page} totalPages={totalPages} basePath="/manifest/forwarding" query={{ search }} />
        </div>
      </div>
    </div>
  );
}
