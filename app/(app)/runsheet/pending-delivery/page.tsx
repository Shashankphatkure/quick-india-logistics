import React from 'react';
import * as Button from '@/components/ui/button';
import PageHeader from '@/components/page-header';
import StatsStrip from '@/components/stats-strip';
import { RiListCheck2 } from '@remixicon/react';
import FilterPopover from '@/components/filter-popover';
import { listPendingDeliveryOrders, countPendingDeliveryOrders } from '@/lib/db/runsheets';
import { tenantScope } from '@/lib/tenant';
import { many } from '@/lib/db';
import PaginationLinks from '@/components/pagination-links';
import RunsheetTabs from '@/components/runsheet-tabs';
import PendingDeliveryTable from './pending-delivery-table';

const PAGE_SIZE = 25;

export default async function PendingDeliveryPage({ searchParams }: { searchParams?: { page?: string } }) {
  const { orgId, branchIds } = await tenantScope();
  const page = Math.max(1, Number(searchParams?.page) || 1);

  const [rows, summary, branches] = await Promise.all([
    listPendingDeliveryOrders({ orgId, branchIds, page }),
    countPendingDeliveryOrders(orgId, branchIds),
    many<{ id: string; name: string }>(
      `select id, name from branches where org_id = $1 and is_active order by name`,
      [orgId],
    ),
  ]);
  const totalPages = Math.max(1, Math.ceil(summary.count / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <PageHeader
        icon={RiListCheck2}
        iconColor="bg-warning-lighter text-warning-base"
        title="Pending Delivery"
        subtitle="Orders ready to be assigned to a runsheet"
        breadcrumbs={[{ label: 'Runsheet', href: '/runsheet/pending-delivery' }, { label: 'Pending Delivery' }]}
      >
        <FilterPopover fields={[]} />
      </PageHeader>

      <StatsStrip stats={[
        { label: 'Total Pending', value: summary.count, trend: 0, trendLabel: 'now' },
        { label: 'Total Weight (kg)', value: summary.totalWeight.toFixed(1), trend: 0, trendLabel: 'now' },
        { label: 'Total Pieces', value: summary.totalPieces, trend: 0, trendLabel: 'now' },
        { label: 'On Page', value: rows.length, trend: 0, trendLabel: 'now' },
      ]} />

      <RunsheetTabs active="/runsheet/pending-delivery" />

      <div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <div className="rounded-t-xl bg-information-lighter border-b border-stroke-soft-200 px-4 py-2">
          <p className="text-paragraph-sm font-medium text-information-dark">Total Local Orders — {summary.count}</p>
        </div>
        <div className="p-4">
          <PendingDeliveryTable rows={rows} branches={branches} />
        </div>
        <div className="flex items-center justify-between border-t border-stroke-soft-200 px-4 py-3">
          <span className="text-paragraph-xs text-text-sub-600">Showing {summary.count === 0 ? 0 : (page-1)*PAGE_SIZE+1}-{Math.min(page*PAGE_SIZE, summary.count)} of {summary.count}</span>
          <PaginationLinks page={page} totalPages={totalPages} basePath="/runsheet/pending-delivery" query={{}} />
        </div>
      </div>
    </div>
  );
}
