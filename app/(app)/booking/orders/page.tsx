'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import * as Button from '@/components/ui/button';
import * as Input from '@/components/ui/input';
import * as Table from '@/components/ui/table';
import * as Badge from '@/components/ui/badge';
import * as Pagination from '@/components/ui/pagination';
import * as Drawer from '@/components/ui/drawer';
import * as Tooltip from '@/components/ui/tooltip';
import { Root as Checkbox } from '@/components/ui/checkbox';
import PageHeader from '@/components/page-header';
import StatsStrip from '@/components/stats-strip';
import {
  RiAddLine, RiSearchLine, RiFilterLine, RiDownloadLine,
  RiPrinterLine, RiEyeLine, RiBarcodeLine, RiArrowUpDownLine,
  RiArrowLeftSLine, RiArrowRightSLine, RiArrowRightLine, RiCalendarCheckLine,
  RiMapPinLine,
} from '@remixicon/react';
import { STATUS_TO_BADGE_COLOR, type BadgeColor } from '@/lib/ui-types';
import { cn } from '@/utils/cn';

const ORDERS = [
  { docket: '738396', date: '09-05-2026', client: 'Mylan Pharmaceuticals', origin: 'New Delhi', destination: 'Amritsar, Punjab', shipper: 'Mylan Pharma', consignee: 'C&F Delhi Mylan', status: 'New', type: 'Domestic', cold: true },
  { docket: '4188696', date: '07-05-2026', client: 'Quick India Logistics', origin: 'Amritsar', destination: 'New Delhi', shipper: 'Quick India', consignee: 'Quick India Logistics Pvt', status: 'In Transit', type: 'Domestic', cold: false },
  { docket: '4188475', date: '06-05-2026', client: 'Quick India Logistics', origin: 'Amritsar', destination: 'New Delhi', shipper: 'Quick India', consignee: 'Quick India Logistics', status: 'New', type: 'Domestic', cold: false },
  { docket: '738433', date: '06-05-2026', client: 'Mylan Pharmaceuticals', origin: 'New Delhi', destination: 'Amritsar, Punjab', shipper: 'Mylan Pharma', consignee: 'B.d.s Pharma', status: 'Delivered', type: 'Domestic', cold: true },
  { docket: '750424', date: '06-05-2026', client: 'Mylan Pharmaceuticals', origin: 'New Delhi', destination: 'Amritsar', shipper: 'Mylan Pharma', consignee: 'Geetax Medicine Centre', status: 'In Transit', type: 'Domestic', cold: true },
  { docket: '4187812', date: '06-05-2026', client: 'Quick India Logistics', origin: 'Amritsar', destination: 'New Delhi', shipper: 'Quick India', consignee: 'Quick India Logistics', status: 'New', type: 'Domestic', cold: false },
  { docket: '4187204', date: '06-05-2026', client: 'Goldmend Health', origin: 'New Delhi', destination: 'Amritsar', shipper: 'Goldmend Health', consignee: 'The Care Sri Cghs', status: 'Delivered', type: 'Domestic', cold: false },
];

const STATUS_TIMELINE = [
  { status: 'Shipment Order Received', time: '09-05-2026 18:12', by: 'Sunilkumar', done: true },
  { status: 'Shipment Picked Up', time: '09-05-2026 22:24', by: 'Amarnath', done: true },
  { status: 'Shipment Arrived At Hub', time: '09-05-2026 22:24', by: 'Amarnath', done: true },
  { status: 'Shipment In Transit', time: '09-05-2026 22:46', by: 'Amarnath', done: false },
];

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function Avatar({ name }: { name: string }) {
  const colors = ['bg-primary-alpha-16 text-primary-base', 'bg-success-lighter text-success-dark', 'bg-feature-lighter text-feature-base'];
  return (
    <div className={cn('flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold', colors[name.charCodeAt(0) % colors.length])}>
      {initials(name)}
    </div>
  );
}

export default function OrdersPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<typeof ORDERS[0] | null>(null);
  const allSelected = selected.length === ORDERS.length;

  const toggleAll = () => setSelected(allSelected ? [] : ORDERS.map(o => o.docket));
  const toggle = (id: string) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={RiCalendarCheckLine}
        title="Orders"
        subtitle="Manage and track all bookings"
        breadcrumbs={[
          { label: 'Booking', href: '/booking/orders' },
          { label: 'Orders' },
        ]}
      >
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <Button.Root variant="neutral" mode="stroke" size="small">
              <Button.Icon as={RiDownloadLine} />Export
            </Button.Root>
          </Tooltip.Trigger>
          <Tooltip.Content>Export orders to Excel</Tooltip.Content>
        </Tooltip.Root>
        <Button.Root variant="neutral" mode="stroke" size="small">
          <Button.Icon as={RiFilterLine} />Filter
        </Button.Root>
        <Button.Root size="small" asChild>
          <Link href="/booking/orders/add" className="no-underline">
            <Button.Icon as={RiAddLine} />Add Order
          </Link>
        </Button.Root>
      </PageHeader>

      <StatsStrip stats={[
        { label: 'Total Orders', value: 7, trend: 4.2, trendLabel: 'vs last week' },
        { label: 'Delivered', value: 2, trend: 8.1, trendLabel: 'vs last week' },
        { label: 'In Transit', value: 2, trend: -1.5, trendLabel: 'vs last week' },
        { label: 'Cold Chain', value: 3, trend: 12, trendLabel: 'this week' },
      ]} />

      <div className="overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <div className="flex items-center justify-between border-b border-stroke-soft-200 px-4 py-3">
          <Input.Root size="small" className="w-64">
            <Input.Wrapper>
              <Input.Icon as={RiSearchLine} />
              <Input.Input placeholder="Search docket, shipper, client..." />
            </Input.Wrapper>
          </Input.Root>
          {selected.length > 0 && (
            <Button.Root variant="neutral" mode="stroke" size="small">
              Update Status ({selected.length})
            </Button.Root>
          )}
        </div>

        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.Head className="w-10">
                <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
              </Table.Head>
              {['Docket No', 'Client', 'Route', 'Shipper', 'Status', 'Type', ''].map(col => (
                <Table.Head key={col}>
                  {col && <span className="flex items-center gap-1">{col}<RiArrowUpDownLine size={11} className="text-text-disabled-300" /></span>}
                </Table.Head>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {ORDERS.map(order => (
              <Table.Row
                key={order.docket}
                className={cn('cursor-pointer', selectedOrder?.docket === order.docket && 'bg-primary-alpha-10')}
                onClick={() => setSelectedOrder(order)}
              >
                <Table.Cell className="h-auto py-3 w-10" onClick={e => e.stopPropagation()}>
                  <Checkbox checked={selected.includes(order.docket)} onCheckedChange={() => toggle(order.docket)} />
                </Table.Cell>
                <Table.Cell className="h-auto py-3">
                  <div>
                    <span className="text-paragraph-sm font-semibold text-primary-base">{order.docket}</span>
                    {order.cold && <Badge.Root size="small" variant="lighter" color="sky" className="ml-1.5">Cold</Badge.Root>}
                    <p className="text-paragraph-xs text-text-sub-600 mt-0.5">{order.date}</p>
                  </div>
                </Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-strong-950">{order.client}</Table.Cell>
                <Table.Cell className="h-auto py-3">
                  <div className="flex items-center gap-1 text-paragraph-xs text-text-sub-600">
                    <RiMapPinLine size={11} className="text-text-disabled-300 shrink-0" />
                    <span className="truncate max-w-[90px]">{order.origin}</span>
                    <span className="text-text-disabled-300">&#8594;</span>
                    <span className="truncate max-w-[90px]">{order.destination}</span>
                  </div>
                </Table.Cell>
                <Table.Cell className="h-auto py-3">
                  <div className="flex items-center gap-2">
                    <Avatar name={order.shipper} />
                    <span className="text-paragraph-sm text-text-strong-950 truncate max-w-[100px]">{order.shipper}</span>
                  </div>
                </Table.Cell>
                <Table.Cell className="h-auto py-3">
                  <Badge.Root size="medium" variant="light" color={(STATUS_TO_BADGE_COLOR[order.status] ?? 'gray') as BadgeColor}>
                    <Badge.Dot />{order.status}
                  </Badge.Root>
                </Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{order.type}</Table.Cell>
                <Table.Cell className="h-auto py-3">
                  <div className="flex items-center gap-1 opacity-0 transition group-hover/row:opacity-100">
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <button onClick={e => { e.stopPropagation(); setSelectedOrder(order); }} className="rounded-lg p-1.5 text-text-sub-600 hover:bg-bg-soft-200">
                          <RiEyeLine size={14} />
                        </button>
                      </Tooltip.Trigger>
                      <Tooltip.Content>View details</Tooltip.Content>
                    </Tooltip.Root>
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <button onClick={e => e.stopPropagation()} className="rounded-lg p-1.5 text-text-sub-600 hover:bg-bg-soft-200">
                          <RiPrinterLine size={14} />
                        </button>
                      </Tooltip.Trigger>
                      <Tooltip.Content>Print docket</Tooltip.Content>
                    </Tooltip.Root>
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <button onClick={e => e.stopPropagation()} className="rounded-lg p-1.5 text-text-sub-600 hover:bg-bg-soft-200">
                          <RiBarcodeLine size={14} />
                        </button>
                      </Tooltip.Trigger>
                      <Tooltip.Content>Print barcode</Tooltip.Content>
                    </Tooltip.Root>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>

        <div className="flex items-center justify-between border-t border-stroke-soft-200 px-5 py-3">
          <span className="text-paragraph-sm text-text-sub-600">Showing 1-7 of 7 orders</span>
          <Pagination.Root variant="rounded">
            <Pagination.NavButton><Pagination.NavIcon as={RiArrowLeftSLine} /></Pagination.NavButton>
            <Pagination.Item current>1</Pagination.Item>
            <Pagination.NavButton><Pagination.NavIcon as={RiArrowRightSLine} /></Pagination.NavButton>
          </Pagination.Root>
        </div>
      </div>

      {/* Order Detail Drawer */}
      <Drawer.Root open={!!selectedOrder} onOpenChange={open => !open && setSelectedOrder(null)}>
        <Drawer.Content>
          {selectedOrder && (
            <>
              <Drawer.Header>
                <Drawer.Title>Order #{selectedOrder.docket}</Drawer.Title>
                <Badge.Root size="medium" variant="light" color={(STATUS_TO_BADGE_COLOR[selectedOrder.status] ?? 'gray') as BadgeColor}>
                  {selectedOrder.status}
                </Badge.Root>
              </Drawer.Header>

              <Drawer.Body className="overflow-y-auto divide-y divide-stroke-soft-200">
                {/* Summary */}
                <div className="px-5 py-4 space-y-3">
                  <p className="text-subheading-2xs uppercase tracking-wider text-text-sub-600">Order Summary</p>
                  {[
                    { label: 'Date', value: selectedOrder.date },
                    { label: 'Client', value: selectedOrder.client },
                    { label: 'Shipper', value: selectedOrder.shipper },
                    { label: 'Consignee', value: selectedOrder.consignee },
                    { label: 'Type', value: selectedOrder.type },
                    { label: 'Cold Chain', value: selectedOrder.cold ? 'Yes' : 'No' },
                  ].map(row => (
                    <div key={row.label} className="flex items-start justify-between gap-3">
                      <span className="text-paragraph-sm text-text-sub-600 shrink-0">{row.label}</span>
                      <span className="text-paragraph-sm font-medium text-text-strong-950 text-right">{row.value}</span>
                    </div>
                  ))}
                </div>

                {/* Route */}
                <div className="px-5 py-4 space-y-3">
                  <p className="text-subheading-2xs uppercase tracking-wider text-text-sub-600">Route</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 rounded-xl bg-bg-weak-50 px-3 py-2.5 text-center">
                      <p className="text-paragraph-xs text-text-sub-600">Origin</p>
                      <p className="text-paragraph-sm font-semibold text-text-strong-950 mt-0.5">{selectedOrder.origin}</p>
                    </div>
                    <RiArrowRightLine size={14} className="shrink-0 text-text-disabled-300" />
                    <div className="flex-1 rounded-xl bg-bg-weak-50 px-3 py-2.5 text-center">
                      <p className="text-paragraph-xs text-text-sub-600">Destination</p>
                      <p className="text-paragraph-sm font-semibold text-text-strong-950 mt-0.5">{selectedOrder.destination}</p>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="px-5 py-4 space-y-4">
                  <p className="text-subheading-2xs uppercase tracking-wider text-text-sub-600">Status Timeline</p>
                  {STATUS_TIMELINE.map((t, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={cn(
                          'flex size-5 shrink-0 items-center justify-center rounded-full',
                          !t.done ? 'bg-primary-base' : 'bg-success-lighter border border-success-light',
                        )}>
                          <div className={cn('size-1.5 rounded-full', !t.done ? 'bg-white' : 'bg-success-base')} />
                        </div>
                        {i < STATUS_TIMELINE.length - 1 && (
                          <div className="mt-1 h-7 w-px bg-stroke-soft-200" />
                        )}
                      </div>
                      <div className="pb-1 min-w-0">
                        <p className="text-paragraph-sm font-medium text-text-strong-950 leading-tight">{t.status}</p>
                        <p className="text-paragraph-xs text-text-sub-600 mt-0.5">{t.time} &bull; {t.by}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Drawer.Body>

              <Drawer.Footer>
                <Button.Root variant="neutral" mode="stroke" className="flex-1" asChild>
                  <Link href={`/booking/orders/${selectedOrder.docket}`} className="no-underline">View Full Order</Link>
                </Button.Root>
                <Button.Root className="flex-1">
                  Update Status
                </Button.Root>
              </Drawer.Footer>
            </>
          )}
        </Drawer.Content>
      </Drawer.Root>
    </div>
  );
}
