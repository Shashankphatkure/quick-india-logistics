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
import { currentOrgId } from '@/lib/tenant';
import OrdersTable from './orders-table';

const PAGE_SIZE = 25;

export default async function OrdersPage({
  searchParams,
}: {
  searchParams?: { search?: string; page?: string };
}) {
  const orgId = await currentOrgId();
  const search = searchParams?.search?.trim() || undefined;
  const page = Math.max(1, Number(searchParams?.page) || 1);

  const [orders, total, counts] = await Promise.all([
    listOrders({ orgId, search, page, pageSize: PAGE_SIZE }),
    countOrders({ orgId, search }),
    getOrderCounts(orgId),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const fromRow = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const toRow = Math.min(page * PAGE_SIZE, total);

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
            <Button.Root variant="neutral" mode="stroke" size="small">
              <Button.Icon as={RiDownloadLine} />
              Export
            </Button.Root>
          </Tooltip.Trigger>
          <Tooltip.Content>Export orders to Excel</Tooltip.Content>
        </Tooltip.Root>
        <Button.Root variant="neutral" mode="stroke" size="small">
          <Button.Icon as={RiFilterLine} />
          Filter
        </Button.Root>
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
            query={{ search }}
          />
        </div>
      </div>
    </div>
  );
}
