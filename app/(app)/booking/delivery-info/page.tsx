import React from 'react';
import Link from 'next/link';
import * as Input from '@/components/ui/input';
import * as Table from '@/components/ui/table';
import * as Badge from '@/components/ui/badge';
import PageHeader from '@/components/page-header';
import StatsStrip from '@/components/stats-strip';
import { RiSearchLine, RiTruckLine, RiArrowUpDownLine } from '@remixicon/react';
import FilterPopover from '@/components/filter-popover';
import { cn } from '@/utils/cn';
import { listDeliveries, countDeliveries, getDeliveryCounts, DELIVERY_PAGE_SIZE, type DeliveryTab } from '@/lib/db/deliveries';
import { tenantScope } from '@/lib/tenant';
import PaginationLinks from '@/components/pagination-links';
import DeliverModal from '@/app/(app)/booking/orders/[docket]/deliver-modal';

const TABS: { key: DeliveryTab; label: string }[] = [
  { key: 'delivered', label: 'Delivery Info' },
  { key: 'undelivered', label: 'Undelivered Info' },
  { key: 'pending_mark', label: 'Mark Delivered' },
];

export default async function DeliveryInfoPage({ searchParams }: { searchParams?: { search?: string; tab?: string; page?: string } }) {
  const { orgId, branchIds } = await tenantScope();
  const search = searchParams?.search?.trim() || undefined;
  const tabKey = (TABS.find(t => t.key === searchParams?.tab)?.key) ?? 'delivered';
  const page = Math.max(1, Number(searchParams?.page) || 1);

  const [rows, total, counts] = await Promise.all([
    listDeliveries({ orgId, branchIds, search, page, tab: tabKey }),
    countDeliveries({ orgId, branchIds, search, tab: tabKey }),
    getDeliveryCounts(orgId, branchIds),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / DELIVERY_PAGE_SIZE));

  return (
    <div className="space-y-4">
      <PageHeader
        icon={RiTruckLine}
        title="Delivery Info"
        subtitle="View and manage delivery confirmations"
        breadcrumbs={[{ label: 'Booking', href: '/booking/orders' }, { label: 'Delivery Info' }]}
      >
        <FilterPopover fields={[
          { name: 'tab', label: 'Tab', type: 'select', options: [
            { value: 'delivered', label: 'Delivered' },
            { value: 'undelivered', label: 'Undelivered / Damaged' },
            { value: 'pending_mark', label: 'Pending POD Mark' },
          ]},
          { name: 'search', label: 'Docket / Consignee', type: 'text', placeholder: 'Search...' },
        ]} />
      </PageHeader>

      <StatsStrip stats={[
        { label: 'Total Orders', value: counts.total, trend: 0, trendLabel: 'all time' },
        { label: 'Delivered', value: counts.delivered, trend: 0, trendLabel: 'all time' },
        { label: 'Undelivered', value: counts.undelivered, trend: 0, trendLabel: 'all time' },
        { label: 'Pending Mark', value: counts.pending, trend: 0, trendLabel: 'awaiting POD' },
      ]} />

      <div className="flex gap-1 overflow-x-auto rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-1 shadow-regular-xs w-fit max-w-full">
        {TABS.map(t => (
          <a key={t.key} href={`/booking/delivery-info?tab=${t.key}`}
            className={cn(
              'shrink-0 rounded-lg px-3 py-1.5 text-paragraph-sm font-medium no-underline transition',
              t.key === tabKey
                ? 'bg-primary-base text-static-white shadow-regular-xs'
                : 'text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950',
            )}
          >{t.label}</a>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <div className="border-b border-stroke-soft-200 p-3">
          <form method="GET">
            <input type="hidden" name="tab" value={tabKey} />
            <Input.Root size="small" className="w-full max-w-xs">
              <Input.Wrapper>
                <Input.Icon as={RiSearchLine} />
                <Input.Input name="search" defaultValue={search ?? ''} placeholder="Search docket / consignee..." />
              </Input.Wrapper>
            </Input.Root>
          </form>
        </div>
        <Table.Root>
          <Table.Header>
            <Table.Row>
              {['Docket No', 'Delivery Branch', 'Consignee', 'Recipient', 'Phone', 'Delivered At', 'Status'].map(col => (
                <Table.Head key={col} className="whitespace-nowrap">
                  <span className="flex items-center gap-1">
                    {col}<RiArrowUpDownLine size={11} className="text-text-disabled-300" />
                  </span>
                </Table.Head>
              ))}
              {tabKey === 'pending_mark' && <Table.Head className="whitespace-nowrap">Action</Table.Head>}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {rows.length === 0 ? (
              <Table.Row><Table.Cell colSpan={tabKey === 'pending_mark' ? 8 : 7} className="py-10 text-center text-paragraph-sm text-text-sub-600">No deliveries in this tab</Table.Cell></Table.Row>
            ) : rows.map(d => (
              <Table.Row key={d.id}>
                <Table.Cell className="h-auto py-3 font-medium whitespace-nowrap">
                  <Link href={`/booking/orders/${d.docket_no}`} className="text-primary-base hover:underline no-underline">{d.docket_no}</Link>
                </Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600 whitespace-nowrap">{d.delivery_branch_name ?? '—'}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-strong-950 whitespace-nowrap">{d.consignee_name}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-strong-950 whitespace-nowrap">{d.pod_recipient_name ?? '—'}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600 whitespace-nowrap">{d.pod_recipient_phone ?? '—'}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600 whitespace-nowrap">{d.delivered_at ?? '—'}</Table.Cell>
                <Table.Cell className="h-auto py-3">
                  <Badge.Root size="medium" variant="light" color={d.status === 'delivered' ? 'green' : d.status === 'damaged' || d.status === 'not_received' ? 'red' : 'orange'}>
                    <Badge.Dot />{d.status.replace(/_/g, ' ')}
                  </Badge.Root>
                </Table.Cell>
                {tabKey === 'pending_mark' && (
                  <Table.Cell className="h-auto py-3">
                    <DeliverModal orderId={d.id} docketNo={d.docket_no} defaultConsignee={d.consignee_name} triggerLabel="Mark Delivered" triggerSize="xsmall" />
                  </Table.Cell>
                )}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
        <div className="flex items-center justify-between border-t border-stroke-soft-200 px-4 py-3">
          <span className="text-paragraph-xs text-text-sub-600">Showing {total === 0 ? 0 : (page-1)*DELIVERY_PAGE_SIZE+1}-{Math.min(page*DELIVERY_PAGE_SIZE, total)} of {total}</span>
          <PaginationLinks page={page} totalPages={totalPages} basePath="/booking/delivery-info" query={{ search, tab: tabKey }} />
        </div>
      </div>
    </div>
  );
}
