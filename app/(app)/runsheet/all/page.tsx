'use client';
import React from 'react';
import Link from 'next/link';
import * as Button from '@/components/ui/button';
import * as Table from '@/components/ui/table';
import * as Badge from '@/components/ui/badge';
import * as CompactButton from '@/components/ui/compact-button';
import * as Tooltip from '@/components/ui/tooltip';
import PageHeader from '@/components/page-header';
import StatsStrip from '@/components/stats-strip';
import { RiFilterLine, RiPrinterLine, RiListCheck2, RiArrowUpDownLine } from '@remixicon/react';
import { STATUS_TO_BADGE_COLOR, type BadgeColor } from '@/lib/ui-types';
import { cn } from '@/utils/cn';

const RS_TABS = [
  { label: 'Pending Delivery', href: '/runsheet/pending-delivery' },
  { label: 'Hub Dispatch', href: '/runsheet/hub-dispatch' },
  { label: 'Incoming Runsheet', href: '/runsheet/incoming' },
  { label: 'All Runsheet', href: '/runsheet/all' },
];

const RUNSHEETS = [
  { no: 'QLRS63427', branch: 'QIL-bhiwandi', orders: '4111010, 4111012 +46', verifiedBy: 'Super User', status: 'Active', dateTime: '12-05-2026 15:40:55', route: 'Kalher', vehicle: 'MH04BR4827', driver: 'Mohang', deliveryStatus: 'Not Delivered' },
];

const DELIVERY_STATUS_COLOR: Record<string, BadgeColor> = {
  'Not Delivered': 'orange',
  'Delivered': 'green',
  'Partial': 'yellow',
};

export default function AllRunsheetPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        icon={RiListCheck2}
        iconColor="bg-success-lighter text-success-base"
        title="All Runsheet"
        subtitle="Track all delivery runsheets and driver assignments"
        breadcrumbs={[{ label: 'Runsheet', href: '/runsheet/all' }, { label: 'All Runsheet' }]}
      >
        <Button.Root variant="neutral" mode="stroke" size="small">
          <Button.Icon as={RiFilterLine} />Filter
        </Button.Root>
      </PageHeader>

      <StatsStrip stats={[
        { label: 'Total Runsheets', value: 1, trend: 0 },
        { label: 'Active', value: 1, trend: 0 },
        { label: 'Not Delivered', value: 1, trend: -5, trendLabel: 'vs last week' },
        { label: 'Delivered', value: 0, trend: 0 },
      ]} />

      {/* Tab strip */}
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-1 shadow-regular-xs">
        {RS_TABS.map(t => (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              'shrink-0 rounded-lg px-3 py-1.5 text-paragraph-xs font-medium transition',
              t.href === '/runsheet/all'
                ? 'bg-primary-base text-static-white'
                : 'text-text-sub-600 hover:bg-bg-weak-50',
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* Table card */}
      <div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <Table.Root>
          <Table.Header>
            <Table.Row>
              {['Runsheet No', 'Branch', 'Total Orders', 'Verified By', 'Status', 'Date & Time', 'Route', 'Vehicle No', 'Driver', 'Print', 'Delivery Status'].map(col => (
                <Table.Head key={col} className="whitespace-nowrap">
                  <span className="flex items-center gap-1">
                    {col}
                    {!['Print'].includes(col) && (
                      <RiArrowUpDownLine size={11} className="text-text-disabled-300" />
                    )}
                  </span>
                </Table.Head>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {RUNSHEETS.map(r => (
              <Table.Row key={r.no}>
                <Table.Cell className="h-auto py-2.5">
                  <span className="text-paragraph-sm font-medium text-primary-base cursor-pointer hover:underline">
                    {r.no}
                  </span>
                </Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-xs text-text-sub-600 whitespace-nowrap">
                  {r.branch}
                </Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-xs text-text-sub-600 max-w-[180px] truncate">
                  {r.orders}
                </Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-xs text-text-sub-600">
                  {r.verifiedBy}
                </Table.Cell>
                <Table.Cell className="h-auto py-2.5">
                  <Badge.Root
                    size="medium"
                    variant="light"
                    color={(STATUS_TO_BADGE_COLOR[r.status] ?? 'gray') as BadgeColor}
                  >
                    <Badge.Dot />{r.status}
                  </Badge.Root>
                </Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-xs text-text-sub-600 whitespace-nowrap">
                  {r.dateTime}
                </Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-xs text-text-sub-600">
                  {r.route}
                </Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-xs text-text-sub-600 whitespace-nowrap">
                  {r.vehicle}
                </Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-xs text-text-sub-600">
                  {r.driver}
                </Table.Cell>
                <Table.Cell className="h-auto py-2.5">
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <CompactButton.Root variant="ghost" size="large">
                        <CompactButton.Icon as={RiPrinterLine} />
                      </CompactButton.Root>
                    </Tooltip.Trigger>
                    <Tooltip.Content>Print runsheet</Tooltip.Content>
                  </Tooltip.Root>
                </Table.Cell>
                <Table.Cell className="h-auto py-2.5">
                  <Badge.Root
                    size="medium"
                    variant="light"
                    color={(DELIVERY_STATUS_COLOR[r.deliveryStatus] ?? 'gray') as BadgeColor}
                  >
                    <Badge.Dot />{r.deliveryStatus}
                  </Badge.Root>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>

        <div className="border-t border-stroke-soft-200 px-4 py-3">
          <span className="text-paragraph-xs text-text-sub-600">Showing 1-1 of 1</span>
        </div>
      </div>
    </div>
  );
}
