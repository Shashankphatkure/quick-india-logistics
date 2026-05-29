'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import * as Button from '@/components/ui/button';
import * as Table from '@/components/ui/table';
import * as Badge from '@/components/ui/badge';
import * as Drawer from '@/components/ui/drawer';
import * as Tooltip from '@/components/ui/tooltip';
import * as Avatar from '@/components/ui/avatar';
import * as CompactButton from '@/components/ui/compact-button';
import { Root as Checkbox } from '@/components/ui/checkbox';
import {
  RiPrinterLine,
  RiEyeLine,
  RiBarcodeLine,
  RiArrowRightLine,
  RiMapPinLine,
} from '@remixicon/react';
import { STATUS_TO_BADGE_COLOR, type BadgeColor } from '@/lib/ui-types';
import { cn } from '@/utils/cn';
import { orderStatusLabel, DELIVERY_TYPE_LABEL, type OrderListItem as OrderRow } from '@/lib/order-status';
import { coldChainTier, COLD_CHAIN_TIER_META } from '@/lib/cold-chain';
import SortableHeader from '@/components/sortable-header';

const AVATAR_TONES = [
  'bg-primary-alpha-16 text-primary-base',
  'bg-success-lighter text-success-dark',
  'bg-feature-lighter text-feature-base',
];

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

function ShipperAvatar({ name }: { name: string }) {
  const tone = AVATAR_TONES[name.charCodeAt(0) % AVATAR_TONES.length];
  return (
    <Avatar.Root size="32" className={cn(tone, 'text-label-xs font-bold')}>
      {initials(name)}
    </Avatar.Root>
  );
}

export default function OrdersTable({ orders }: { orders: OrderRow[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderRow | null>(null);

  const allSelected = orders.length > 0 && selected.length === orders.length;
  const toggleAll = () => setSelected(allSelected ? [] : orders.map((o) => o.id));
  const toggle = (id: string) =>
    setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  return (
    <>
      {selected.length > 0 && (
        <div className="flex justify-end">
          <Button.Root variant="neutral" mode="stroke" size="small">
            Update Status ({selected.length})
          </Button.Root>
        </div>
      )}

      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.Head className="w-10">
              <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
            </Table.Head>
            <Table.Head><SortableHeader column="docket">Docket No</SortableHeader></Table.Head>
            <Table.Head><SortableHeader column="client">Client</SortableHeader></Table.Head>
            <Table.Head>Route</Table.Head>
            <Table.Head><SortableHeader column="shipper">Shipper</SortableHeader></Table.Head>
            <Table.Head><SortableHeader column="status">Status</SortableHeader></Table.Head>
            <Table.Head>Type</Table.Head>
            <Table.Head />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {orders.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={8} className="py-10 text-center text-paragraph-sm text-text-sub-600">
                No orders found
              </Table.Cell>
            </Table.Row>
          ) : (
            orders.map((order) => {
              const statusLabel = orderStatusLabel(order.status);
              const tier = coldChainTier(order.sla_hours);
              return (
                <Table.Row
                  key={order.id}
                  className={cn(
                    'group/row cursor-pointer',
                    tier === 'breach' && 'bg-error-lighter/40',
                    selectedOrder?.id === order.id && 'bg-primary-alpha-10',
                  )}
                  onClick={() => setSelectedOrder(order)}
                >
                  <Table.Cell className="h-auto py-3 w-10" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selected.includes(order.id)}
                      onCheckedChange={() => toggle(order.id)}
                    />
                  </Table.Cell>
                  <Table.Cell className="h-auto py-3">
                    <div>
                      <span className="text-paragraph-sm font-semibold text-primary-base">
                        {order.docket_no}
                      </span>
                      {order.is_cold_chain && (
                        <Badge.Root size="small" variant="lighter" color="sky" className="ml-1.5">
                          Cold
                        </Badge.Root>
                      )}
                      {tier !== 'ok' && (
                        <Badge.Root size="small" variant="light" color={COLD_CHAIN_TIER_META[tier].color} className="ml-1.5">
                          {COLD_CHAIN_TIER_META[tier].label}
                        </Badge.Root>
                      )}
                      <p className="text-paragraph-xs text-text-sub-600 mt-0.5">{order.booking_date}</p>
                    </div>
                  </Table.Cell>
                  <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-strong-950">
                    {order.client_name ?? '—'}
                  </Table.Cell>
                  <Table.Cell className="h-auto py-3">
                    <div className="flex items-center gap-1 text-paragraph-xs text-text-sub-600">
                      <RiMapPinLine size={11} className="text-text-disabled-300 shrink-0" />
                      <span className="truncate max-w-[90px]">{order.origin}</span>
                      <span className="text-text-disabled-300">→</span>
                      <span className="truncate max-w-[90px]">{order.destination}</span>
                    </div>
                  </Table.Cell>
                  <Table.Cell className="h-auto py-3">
                    <div className="flex items-center gap-2">
                      <ShipperAvatar name={order.shipper_name} />
                      <span className="text-paragraph-sm text-text-strong-950 truncate max-w-[100px]">
                        {order.shipper_name}
                      </span>
                    </div>
                  </Table.Cell>
                  <Table.Cell className="h-auto py-3">
                    <Badge.Root
                      size="medium"
                      variant="light"
                      color={(STATUS_TO_BADGE_COLOR[statusLabel] ?? 'gray') as BadgeColor}
                    >
                      <Badge.Dot />
                      {statusLabel}
                    </Badge.Root>
                  </Table.Cell>
                  <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">
                    {DELIVERY_TYPE_LABEL[order.delivery_type] ?? order.delivery_type}
                  </Table.Cell>
                  <Table.Cell className="h-auto py-3">
                    <div className="flex items-center gap-1 opacity-0 transition group-hover/row:opacity-100">
                      <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                          <CompactButton.Root
                            variant="ghost"
                            size="large"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrder(order);
                            }}
                          >
                            <CompactButton.Icon as={RiEyeLine} />
                          </CompactButton.Root>
                        </Tooltip.Trigger>
                        <Tooltip.Content>View details</Tooltip.Content>
                      </Tooltip.Root>
                      <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                          <CompactButton.Root variant="ghost" size="large" onClick={(e) => e.stopPropagation()}>
                            <CompactButton.Icon as={RiPrinterLine} />
                          </CompactButton.Root>
                        </Tooltip.Trigger>
                        <Tooltip.Content>Print docket</Tooltip.Content>
                      </Tooltip.Root>
                      <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                          <CompactButton.Root variant="ghost" size="large" onClick={(e) => e.stopPropagation()}>
                            <CompactButton.Icon as={RiBarcodeLine} />
                          </CompactButton.Root>
                        </Tooltip.Trigger>
                        <Tooltip.Content>Print barcode</Tooltip.Content>
                      </Tooltip.Root>
                    </div>
                  </Table.Cell>
                </Table.Row>
              );
            })
          )}
        </Table.Body>
      </Table.Root>

      <Drawer.Root open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <Drawer.Content>
          {selectedOrder && (
            <>
              <Drawer.Header>
                <Drawer.Title>Order #{selectedOrder.docket_no}</Drawer.Title>
                <Badge.Root
                  size="medium"
                  variant="light"
                  color={
                    (STATUS_TO_BADGE_COLOR[orderStatusLabel(selectedOrder.status)] ?? 'gray') as BadgeColor
                  }
                >
                  {orderStatusLabel(selectedOrder.status)}
                </Badge.Root>
              </Drawer.Header>

              <Drawer.Body className="overflow-y-auto divide-y divide-stroke-soft-200">
                <div className="px-5 py-4 space-y-3">
                  <p className="text-subheading-2xs uppercase tracking-wider text-text-sub-600">
                    Order Summary
                  </p>
                  {[
                    { label: 'Booking Date', value: selectedOrder.booking_date },
                    { label: 'Bill To', value: selectedOrder.bill_to_name ?? '—' },
                    { label: 'Client', value: selectedOrder.client_name ?? '—' },
                    { label: 'Shipper', value: selectedOrder.shipper_name },
                    { label: 'Consignee', value: selectedOrder.consignee_name },
                    { label: 'Mode', value: selectedOrder.mode },
                    { label: 'Type', value: DELIVERY_TYPE_LABEL[selectedOrder.delivery_type] ?? selectedOrder.delivery_type },
                    { label: 'Cold Chain', value: selectedOrder.is_cold_chain ? 'Yes' : 'No' },
                    { label: 'Current Branch', value: selectedOrder.current_branch_name ?? '—' },
                  ].map((row) => (
                    <div key={row.label} className="flex items-start justify-between gap-3">
                      <span className="text-paragraph-sm text-text-sub-600 shrink-0">{row.label}</span>
                      <span className="text-paragraph-sm font-medium text-text-strong-950 text-right">
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="px-5 py-4 space-y-3">
                  <p className="text-subheading-2xs uppercase tracking-wider text-text-sub-600">Route</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 rounded-xl bg-bg-weak-50 px-3 py-2.5 text-center">
                      <p className="text-paragraph-xs text-text-sub-600">Origin</p>
                      <p className="text-paragraph-sm font-semibold text-text-strong-950 mt-0.5">
                        {selectedOrder.origin}
                      </p>
                    </div>
                    <RiArrowRightLine size={14} className="shrink-0 text-text-disabled-300" />
                    <div className="flex-1 rounded-xl bg-bg-weak-50 px-3 py-2.5 text-center">
                      <p className="text-paragraph-xs text-text-sub-600">Destination</p>
                      <p className="text-paragraph-sm font-semibold text-text-strong-950 mt-0.5">
                        {selectedOrder.destination}
                      </p>
                    </div>
                  </div>
                </div>
              </Drawer.Body>

              <Drawer.Footer>
                <Button.Root variant="neutral" mode="stroke" className="flex-1" asChild>
                  <Link
                    href={`/booking/orders/${selectedOrder.docket_no}`}
                    className="no-underline"
                  >
                    View Full Order
                  </Link>
                </Button.Root>
                <Button.Root className="flex-1">Update Status</Button.Root>
              </Drawer.Footer>
            </>
          )}
        </Drawer.Content>
      </Drawer.Root>
    </>
  );
}
