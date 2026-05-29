import React from 'react';
import Link from 'next/link';
import * as Button from '@/components/ui/button';
import * as Table from '@/components/ui/table';
import * as Badge from '@/components/ui/badge';
import PageHeader from '@/components/page-header';
import StatsStrip from '@/components/stats-strip';
import { RiFilePaperLine } from '@remixicon/react';
import FilterPopover from '@/components/filter-popover';
import { listManifests, getManifestCounts, MANIFEST_PAGE_SIZE } from '@/lib/db/manifests';
import { currentOrgId } from '@/lib/tenant';
import { getSession } from '@/lib/auth';
import PaginationLinks from '@/components/pagination-links';
import ManifestTabs from '@/components/manifest-tabs';

const MODE_LABEL: Record<string, string> = {
  local: 'Local', air: 'Air', surface: 'Surface', cargo: 'Cargo',
  train: 'Train', courier: 'Courier', warehouse: 'Warehouse', hub_transfer: 'Hub Transfer',
};

export default async function IncomingManifestPage({ searchParams }: { searchParams?: { page?: string } }) {
  const orgId = await currentOrgId();
  const page = Math.max(1, Number(searchParams?.page) || 1);
  const session = await getSession();
  // Show manifests inbound to the user's home branch (fallback to first assigned branch)
  const toBranchId = session?.homeBranchId ?? session?.branchIds[0];

  // Inbound = state in departed or arrived (not yet received) AND to_branch_id = user's branch
  const rows = toBranchId ? await listManifests({
    orgId, toBranchId, state: 'departed', page,
  }) : [];
  const counts = await getManifestCounts(orgId);

  const totalPages = 1;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={RiFilePaperLine}
        iconColor="bg-information-lighter text-information-base"
        title="Incoming Manifest"
        subtitle={`Manifests inbound to your branch${toBranchId ? '' : ' — no branch assigned'}`}
        breadcrumbs={[{ label: 'Manifest', href: '/manifest/incoming' }, { label: 'Incoming' }]}
      >
        <FilterPopover fields={[]} />
      </PageHeader>

      <StatsStrip stats={[
        { label: 'Incoming', value: rows.length, trend: 0, trendLabel: 'now' },
        { label: 'Departed (Total)', value: counts.departed, trend: 0, trendLabel: 'all time' },
        { label: 'Received', value: counts.received, trend: 0, trendLabel: 'all time' },
        { label: 'Total Manifests', value: counts.total, trend: 0, trendLabel: 'all time' },
      ]} />

      <ManifestTabs active="/manifest/incoming" />

      <div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <Table.Root>
          <Table.Header>
            <Table.Row>{['Manifest No', 'Date', 'From', 'Mode', 'Vendor / Vehicle', 'AWB', 'Orders', 'Weight (kg)', 'State'].map(c => <Table.Head key={c}>{c}</Table.Head>)}</Table.Row>
          </Table.Header>
          <Table.Body>
            {rows.length === 0 ? (
              <Table.Row><Table.Cell colSpan={9} className="py-10 text-center text-paragraph-sm text-text-sub-600">No incoming manifests</Table.Cell></Table.Row>
            ) : rows.map(m => (
              <Table.Row key={m.id}>
                <Table.Cell className="h-auto py-3"><Link href={`/manifest/${m.manifest_no}`} className="text-paragraph-sm font-medium text-primary-base hover:underline no-underline">{m.manifest_no}</Link></Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{m.manifest_date}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{m.from_branch_name}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{MODE_LABEL[m.mode] ?? m.mode}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{m.vendor_name ?? m.vehicle_no ?? '—'}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{m.airway_bill_no ?? '—'}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{m.order_count}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{m.coloader_chargeable_kg ?? '—'}</Table.Cell>
                <Table.Cell className="h-auto py-3"><Badge.Root size="medium" variant="light" color="orange"><Badge.Dot />Inbound</Badge.Root></Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </div>
    </div>
  );
}
