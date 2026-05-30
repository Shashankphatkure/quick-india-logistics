import React from 'react';
import Link from 'next/link';
import * as Button from '@/components/ui/button';
import * as Input from '@/components/ui/input';
import * as Table from '@/components/ui/table';
import * as Badge from '@/components/ui/badge';
import PageHeader from '@/components/page-header';
import StatsStrip from '@/components/stats-strip';
import { RiSearchLine, RiListCheck2 } from '@remixicon/react';
import { listRunsheets, countRunsheets, getRunsheetCounts, RUNSHEET_PAGE_SIZE } from '@/lib/db/runsheets';
import { tenantScope } from '@/lib/tenant';
import PaginationLinks from '@/components/pagination-links';
import RunsheetTabs from '@/components/runsheet-tabs';
import FilterPopover from '@/components/filter-popover';
import SortableHeader from '@/components/sortable-header';

const STATE_LABEL: Record<string, { label: string; color: 'gray' | 'blue' | 'orange' | 'green' }> = {
  rough: { label: 'Rough', color: 'gray' },
  final: { label: 'Final', color: 'blue' },
  out_for_delivery: { label: 'Out for Delivery', color: 'orange' },
  completed: { label: 'Completed', color: 'green' },
};

export default async function AllRunsheetsPage({ searchParams }: { searchParams?: { search?: string; state?: string; page?: string; sort?: string; dir?: string } }) {
  const { orgId, branchIds } = await tenantScope();
  const search = searchParams?.search?.trim() || undefined;
  const state = searchParams?.state;
  const sort = searchParams?.sort;
  const dir = searchParams?.dir;
  const page = Math.max(1, Number(searchParams?.page) || 1);

  const [rows, total, counts] = await Promise.all([
    listRunsheets({ orgId, branchIds, search, state, page, sort, dir }),
    countRunsheets({ orgId, branchIds, search, state }),
    getRunsheetCounts(orgId, branchIds),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / RUNSHEET_PAGE_SIZE));

  return (
    <div className="space-y-6">
      <PageHeader
        icon={RiListCheck2}
        title="All Runsheets"
        subtitle="Local delivery runsheets across all branches"
        breadcrumbs={[{ label: 'Runsheet', href: '/runsheet/all' }, { label: 'All' }]}
      >
        <FilterPopover fields={[
          { name: 'state', label: 'State', type: 'select', options: [
            { value: 'rough', label: 'Rough' },
            { value: 'final', label: 'Final' },
            { value: 'out_for_delivery', label: 'Out for Delivery' },
            { value: 'completed', label: 'Completed' },
          ]},
          { name: 'search', label: 'Runsheet No', type: 'text', placeholder: 'RUN...' },
        ]} />
      </PageHeader>

      <StatsStrip stats={[
        { label: 'Total Runsheets', value: counts.total, trend: 0, trendLabel: 'all time' },
        { label: 'Rough', value: counts.rough, trend: 0, trendLabel: 'all time' },
        { label: 'Out for Delivery', value: counts.out_for_delivery, trend: 0, trendLabel: 'now' },
        { label: 'Completed', value: counts.completed, trend: 0, trendLabel: 'all time' },
      ]} />

      <RunsheetTabs active="/runsheet/all" />

      <div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <div className="border-b border-stroke-soft-200 px-4 py-3">
          <form method="GET">
            <Input.Root size="small" className="w-full max-w-xs">
              <Input.Wrapper>
                <Input.Icon as={RiSearchLine} />
                <Input.Input name="search" defaultValue={search ?? ''} placeholder="Search runsheet no..." />
              </Input.Wrapper>
            </Input.Root>
          </form>
        </div>
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.Head><SortableHeader column="runsheet">Runsheet No</SortableHeader></Table.Head>
              <Table.Head><SortableHeader column="date">Date</SortableHeader></Table.Head>
              <Table.Head className="hidden md:table-cell"><SortableHeader column="branch">Branch</SortableHeader></Table.Head>
              <Table.Head className="hidden lg:table-cell">Route</Table.Head>
              <Table.Head className="hidden md:table-cell">Vehicle</Table.Head>
              <Table.Head className="hidden lg:table-cell">Driver</Table.Head>
              <Table.Head className="hidden lg:table-cell">Phone</Table.Head>
              <Table.Head className="hidden md:table-cell">Orders</Table.Head>
              <Table.Head className="hidden lg:table-cell">Verified By</Table.Head>
              <Table.Head><SortableHeader column="state">Status</SortableHeader></Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {rows.length === 0 ? (
              <Table.Row><Table.Cell colSpan={10} className="py-10 text-center text-paragraph-sm text-text-sub-600">No runsheets found</Table.Cell></Table.Row>
            ) : rows.map(r => {
              const sl = STATE_LABEL[r.state] ?? { label: r.state, color: 'gray' as const };
              return (
                <Table.Row key={r.id}>
                  <Table.Cell className="h-auto py-3"><Link href={`/runsheet/${r.runsheet_no}`} className="text-paragraph-sm font-medium text-primary-base hover:underline no-underline">{r.runsheet_no}</Link></Table.Cell>
                  <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{r.runsheet_date}</Table.Cell>
                  <Table.Cell className="hidden md:table-cell h-auto py-3 text-paragraph-sm text-text-sub-600">{r.branch_name}</Table.Cell>
                  <Table.Cell className="hidden lg:table-cell h-auto py-3 text-paragraph-sm text-text-sub-600">{r.route ?? '—'}</Table.Cell>
                  <Table.Cell className="hidden md:table-cell h-auto py-3 text-paragraph-xs text-text-sub-600">{r.vehicle_no ?? '—'}</Table.Cell>
                  <Table.Cell className="hidden lg:table-cell h-auto py-3 text-paragraph-sm text-text-sub-600">{r.driver_name ?? '—'}</Table.Cell>
                  <Table.Cell className="hidden lg:table-cell h-auto py-3 text-paragraph-xs text-text-sub-600">{r.driver_phone ?? '—'}</Table.Cell>
                  <Table.Cell className="hidden md:table-cell h-auto py-3 text-paragraph-sm text-text-sub-600">{r.order_count}</Table.Cell>
                  <Table.Cell className="hidden lg:table-cell h-auto py-3 text-paragraph-xs text-text-sub-600">{r.verified_by_name ?? '—'}</Table.Cell>
                  <Table.Cell className="h-auto py-3"><Badge.Root size="medium" variant="light" color={sl.color}><Badge.Dot />{sl.label}</Badge.Root></Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table.Root>
        <div className="flex items-center justify-between border-t border-stroke-soft-200 px-4 py-3">
          <span className="text-paragraph-xs text-text-sub-600">Showing {total === 0 ? 0 : (page-1)*RUNSHEET_PAGE_SIZE+1}-{Math.min(page*RUNSHEET_PAGE_SIZE, total)} of {total}</span>
          <PaginationLinks page={page} totalPages={totalPages} basePath="/runsheet/all" query={{ search, state, sort, dir }} />
        </div>
      </div>
    </div>
  );
}
