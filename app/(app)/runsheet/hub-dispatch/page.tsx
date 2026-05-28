import React from 'react';
import * as Button from '@/components/ui/button';
import * as Table from '@/components/ui/table';
import * as Badge from '@/components/ui/badge';
import PageHeader from '@/components/page-header';
import StatsStrip from '@/components/stats-strip';
import { RiFilterLine, RiListCheck2 } from '@remixicon/react';
import { listManifests, MANIFEST_PAGE_SIZE, countManifests, getManifestCounts } from '@/lib/db/manifests';
import { currentOrgId } from '@/lib/tenant';
import PaginationLinks from '@/components/pagination-links';
import RunsheetTabs from '@/components/runsheet-tabs';

// Hub Dispatch on the runsheet side = hub-transfer manifests (cross-branch vehicle moves)
export default async function RunsheetHubDispatchPage({ searchParams }: { searchParams?: { page?: string } }) {
  const orgId = await currentOrgId();
  const page = Math.max(1, Number(searchParams?.page) || 1);

  // Filter manifests where mode='hub_transfer' OR vehicle-based local cross-branch
  const [rows, total, counts] = await Promise.all([
    listManifests({ orgId, page }),
    countManifests({ orgId }),
    getManifestCounts(orgId),
  ]);
  // Show only vehicle-based (no airway bill) manifests
  const vehicleRows = rows.filter(r => !r.airway_bill_no);
  const totalPages = Math.max(1, Math.ceil(total / MANIFEST_PAGE_SIZE));

  return (
    <div className="space-y-6">
      <PageHeader
        icon={RiListCheck2}
        iconColor="bg-feature-lighter text-feature-base"
        title="Hub Dispatch"
        subtitle="Cross-branch vehicle transfers"
        breadcrumbs={[{ label: 'Runsheet', href: '/runsheet/hub-dispatch' }, { label: 'Hub Dispatch' }]}
      >
        <Button.Root variant="neutral" mode="stroke" size="small">
          <Button.Icon as={RiFilterLine} />Filter
        </Button.Root>
      </PageHeader>

      <StatsStrip stats={[
        { label: 'Total Vehicle Manifests', value: vehicleRows.length, trend: 0, trendLabel: 'this page' },
        { label: 'Departed', value: counts.departed, trend: 0, trendLabel: 'all time' },
        { label: 'Received', value: counts.received, trend: 0, trendLabel: 'all time' },
        { label: 'Total Manifests', value: counts.total, trend: 0, trendLabel: 'all time' },
      ]} />

      <RunsheetTabs active="/runsheet/hub-dispatch" />

      <div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <Table.Root>
          <Table.Header>
            <Table.Row>{['Manifest No', 'Date', 'From → To', 'Vehicle', 'Orders', 'Bags / Boxes', 'Weight (kg)', 'State'].map(c => <Table.Head key={c}>{c}</Table.Head>)}</Table.Row>
          </Table.Header>
          <Table.Body>
            {vehicleRows.length === 0 ? (
              <Table.Row><Table.Cell colSpan={8} className="py-10 text-center text-paragraph-sm text-text-sub-600">No vehicle manifests</Table.Cell></Table.Row>
            ) : vehicleRows.map(m => (
              <Table.Row key={m.id}>
                <Table.Cell className="h-auto py-3"><span className="text-paragraph-sm font-medium text-primary-base">{m.manifest_no}</span></Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{m.manifest_date}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{m.from_branch_name} → {m.to_branch_name}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{m.vehicle_no ?? '—'}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{m.order_count}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{m.total_bags} / {m.total_boxes}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{m.coloader_chargeable_kg ?? '—'}</Table.Cell>
                <Table.Cell className="h-auto py-3"><Badge.Root size="small" variant="lighter" color="gray">{m.state}</Badge.Root></Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
        <div className="flex items-center justify-between border-t border-stroke-soft-200 px-4 py-3">
          <span className="text-paragraph-xs text-text-sub-600">Showing {vehicleRows.length} of {total}</span>
          <PaginationLinks page={page} totalPages={totalPages} basePath="/runsheet/hub-dispatch" query={{}} />
        </div>
      </div>
    </div>
  );
}
