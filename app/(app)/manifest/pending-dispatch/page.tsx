import React from 'react';
import * as Button from '@/components/ui/button';
import PageHeader from '@/components/page-header';
import StatsStrip from '@/components/stats-strip';
import { RiFilePaperLine } from '@remixicon/react';
import FilterPopover from '@/components/filter-popover';
import { listPendingDispatchOrders, countPendingDispatchOrders } from '@/lib/db/manifests';
import { currentOrgId } from '@/lib/tenant';
import { many } from '@/lib/db';
import PaginationLinks from '@/components/pagination-links';
import ManifestTabs from '@/components/manifest-tabs';
import PendingDispatchTable from './pending-dispatch-table';

const PAGE_SIZE = 25;

export default async function PendingDispatchPage({ searchParams }: { searchParams?: { page?: string } }) {
  const orgId = await currentOrgId();
  const page = Math.max(1, Number(searchParams?.page) || 1);

  const [rows, summary, branches, vendors] = await Promise.all([
    listPendingDispatchOrders({ orgId, page }),
    countPendingDispatchOrders(orgId),
    many<{ id: string; name: string }>(
      `select id, name from branches where org_id = $1 and is_active order by name`,
      [orgId],
    ),
    many<{ id: string; name: string }>(
      `select id, name from vendors where org_id = $1 and is_active and status = 'approved' order by name`,
      [orgId],
    ),
  ]);
  const totalPages = Math.max(1, Math.ceil(summary.count / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <PageHeader
        icon={RiFilePaperLine}
        iconColor="bg-warning-lighter text-warning-base"
        title="Pending For Dispatch"
        subtitle="Orders ready to be added to a manifest"
        breadcrumbs={[{ label: 'Manifest', href: '/manifest/pending-dispatch' }, { label: 'Pending For Dispatch' }]}
      >
        <FilterPopover fields={[]} />
      </PageHeader>

      <StatsStrip stats={[
        { label: 'Unmanifested', value: summary.count, trend: 0, trendLabel: 'now' },
        { label: 'Total Weight (kg)', value: summary.totalWeight.toFixed(1), trend: 0, trendLabel: 'now' },
        { label: 'Total Pieces', value: summary.totalPieces, trend: 0, trendLabel: 'now' },
        { label: 'Cold Chain', value: rows.filter(r => r.is_cold_chain).length, trend: 0, trendLabel: 'this page' },
      ]} />

      <ManifestTabs active="/manifest/pending-dispatch" />

      <div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <div className="rounded-t-xl bg-warning-lighter border-b border-stroke-soft-200 px-4 py-2">
          <p className="text-paragraph-sm font-medium text-warning-dark">Total Unmanifest Orders — {summary.count}</p>
        </div>

        <div className="p-4 space-y-4">
          <PendingDispatchTable rows={rows} branches={branches} vendors={vendors} />
        </div>

        <div className="flex items-center justify-between border-t border-stroke-soft-200 px-4 py-3">
          <span className="text-paragraph-xs text-text-sub-600">Showing {summary.count === 0 ? 0 : (page-1)*PAGE_SIZE+1}-{Math.min(page*PAGE_SIZE, summary.count)} of {summary.count}</span>
          <PaginationLinks page={page} totalPages={totalPages} basePath="/manifest/pending-dispatch" query={{}} />
        </div>
      </div>
    </div>
  );
}
