import React from 'react';
import Link from 'next/link';
import * as Button from '@/components/ui/button';
import * as Input from '@/components/ui/input';
import PaginationLinks from '@/components/pagination-links';
import * as Tooltip from '@/components/ui/tooltip';
import PageHeader from '@/components/page-header';
import StatsStrip from '@/components/stats-strip';
import {
  RiAddLine,
  RiSearchLine,
  RiDownloadLine,
  RiCalendarCheckLine,
} from '@remixicon/react';
import { listOrders, countOrders, getOrderCounts } from '@/lib/db/orders';
import { tenantScope } from '@/lib/tenant';
import OrdersTable from './orders-table';
import FilterPopover from '@/components/filter-popover';

const PAGE_SIZE = 25;

export default async function OrdersPage({
  searchParams,
}: {
  searchParams?: {
    search?: string; page?: string; sort?: string; dir?: string;
    status?: string; mode?: string; cold?: string; from?: string; to?: string;
  };
}) {
  const { orgId, branchIds } = await tenantScope();
  const search = searchParams?.search?.trim() || undefined;
  const status = searchParams?.status || undefined;
  const mode = searchParams?.mode || undefined;
  const coldChain = searchParams?.cold === '1' ? true : undefined;
  const from = searchParams?.from || undefined;
  const to = searchParams?.to || undefined;
  const sort = searchParams?.sort;
  const dir = searchParams?.dir;
  const page = Math.max(1, Number(searchParams?.page) || 1);

  const filters = { orgId, branchIds, search, status, mode, coldChain, from, to };

  const [orders, total, counts] = await Promise.all([
    listOrders({ ...filters, page, pageSize: PAGE_SIZE, sort, dir }),
    countOrders(filters),
    getOrderCounts(orgId, branchIds),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const fromRow = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const toRow = Math.min(page * PAGE_SIZE, total);

  // Carry every active filter through pagination + export links.
  const query: Record<string, string | undefined> = { search, status, mode, cold: searchParams?.cold, from, to, sort, dir };
  const exportQs = new URLSearchParams(
    Object.entries(query).filter(([, v]) => v) as [string, string][],
  ).toString();

  return (
    <div className="space-y-6">
      <PageHeader
        icon={RiCalendarCheckLine}
        title="Orders"
        subtitle="Manage and track all bookings"
        breadcrumbs={[{ label: 'Booking', href: '/booking/orders' }, { label: 'Orders' }]}
      >
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <Button.Root variant="neutral" mode="stroke" size="small" asChild>
              <a href={`/api/export/orders${exportQs ? `?${exportQs}` : ''}`} className="no-underline">
                <Button.Icon as={RiDownloadLine} />
                Export
              </a>
            </Button.Root>
          </Tooltip.Trigger>
          <Tooltip.Content>Download filtered orders as CSV</Tooltip.Content>
        </Tooltip.Root>
        <FilterPopover fields={[
          { name: 'status', label: 'Status', type: 'select', options: [
            { value: 'received', label: 'New' },
            { value: 'pickup_done', label: 'Picked Up' },
            { value: 'arrived_at_hub', label: 'At Hub' },
            { value: 'connected', label: 'Connected' },
            { value: 'departed', label: 'In Transit' },
            { value: 'arrived_at_destination', label: 'At Destination' },
            { value: 'out_for_delivery', label: 'Out for Delivery' },
            { value: 'delivered', label: 'Delivered' },
            { value: 'damaged', label: 'Damaged' },
            { value: 'not_received', label: 'Not Received' },
            { value: 'cancelled', label: 'Cancelled' },
          ]},
          { name: 'mode', label: 'Mode', type: 'select', options: [
            { value: 'air', label: 'Air' }, { value: 'surface', label: 'Surface' },
            { value: 'cargo', label: 'Cargo' }, { value: 'train', label: 'Train' },
            { value: 'local', label: 'Local' }, { value: 'courier', label: 'Courier' },
            { value: 'warehouse', label: 'Warehouse' },
          ]},
          { name: 'cold', label: 'Cold Chain', type: 'select', options: [{ value: '1', label: 'Cold chain only' }] },
          { name: 'from', label: 'Booked From', type: 'date' },
          { name: 'to', label: 'Booked To', type: 'date' },
          { name: 'search', label: 'Docket / Shipper / Client', type: 'text', placeholder: 'Search...' },
        ]} />
        <Button.Root size="small" asChild>
          <Link href="/booking/orders/add" className="no-underline">
            <Button.Icon as={RiAddLine} />
            Add Order
          </Link>
        </Button.Root>
      </PageHeader>

      <StatsStrip
        stats={[
          { label: 'Total Orders', value: counts.total, trend: 0, trendLabel: 'all time' },
          { label: 'Delivered', value: counts.delivered, trend: 0, trendLabel: 'all time' },
          { label: 'In Transit', value: counts.in_transit, trend: 0, trendLabel: 'all time' },
          { label: 'Cold Chain', value: counts.cold_chain, trend: 0, trendLabel: 'all time' },
        ]}
      />

      <div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <div className="flex items-center justify-between border-b border-stroke-soft-200 px-4 py-3">
          <form method="GET" className="w-64">
            <Input.Root size="small">
              <Input.Wrapper>
                <Input.Icon as={RiSearchLine} />
                <Input.Input
                  name="search"
                  defaultValue={search ?? ''}
                  placeholder="Search docket, shipper, client..."
                />
              </Input.Wrapper>
            </Input.Root>
          </form>
          <span className="text-paragraph-sm text-text-sub-600">{total} {total === 1 ? 'order' : 'orders'}</span>
        </div>

        <OrdersTable orders={orders} />

        <div className="flex items-center justify-between border-t border-stroke-soft-200 px-5 py-3">
          <span className="text-paragraph-sm text-text-sub-600">
            Showing {fromRow}-{toRow} of {total} orders
          </span>
          <PaginationLinks
            page={page}
            totalPages={totalPages}
            basePath="/booking/orders"
            query={query}
          />
        </div>
      </div>
    </div>
  );
}
