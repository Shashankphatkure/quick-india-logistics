'use client';
import React from 'react';
import Link from 'next/link';
import * as Button from '@/components/ui/button';
import * as Table from '@/components/ui/table';
import * as CompactButton from '@/components/ui/compact-button';
import * as Tooltip from '@/components/ui/tooltip';
import PageHeader from '@/components/page-header';
import StatsStrip from '@/components/stats-strip';
import { RiPrinterLine, RiListCheck2, RiArrowUpDownLine } from '@remixicon/react';
import { cn } from '@/utils/cn';

const RS_TABS = [
  { label: 'Pending Delivery', href: '/runsheet/pending-delivery' },
  { label: 'Hub Dispatch', href: '/runsheet/hub-dispatch' },
  { label: 'Incoming Runsheet', href: '/runsheet/incoming' },
  { label: 'All Runsheet', href: '/runsheet/all' },
];

const ROWS = [
  { hubNo: 'QLIH300119', origin: 'Shivani', destination: 'Shiwandi', orders: '612562, 612571, 612572 +11', boxes: 23, weight: 0 },
];

const TABLE_COLS = ['Hub Transfer No', 'Origin', 'Destination', 'Total Orders', 'Total Box', 'Total Weight', 'Print', 'Action'];

export default function IncomingRunsheetPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        icon={RiListCheck2}
        iconColor="bg-information-lighter text-information-base"
        title="Incoming Runsheet"
        subtitle="Review and receive incoming hub transfer runsheets"
        breadcrumbs={[
          { label: 'Runsheet', href: '/runsheet/incoming' },
          { label: 'Incoming Runsheet' },
        ]}
      />

      <StatsStrip stats={[
        { label: 'Total Incoming', value: ROWS.length, trend: 0 },
        { label: 'Total Boxes', value: ROWS.reduce((s, r) => s + r.boxes, 0), trend: 0 },
        { label: 'Total Weight (kg)', value: ROWS.reduce((s, r) => s + r.weight, 0), trend: 0 },
        { label: 'Pending Receipt', value: ROWS.length, trend: 0 },
      ]} />

      {/* Tab strip */}
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-1 shadow-regular-xs">
        {RS_TABS.map(t => (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              'shrink-0 rounded-lg px-3 py-1.5 text-paragraph-xs font-medium transition',
              t.href === '/runsheet/incoming'
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
              {TABLE_COLS.map(col => (
                <Table.Head key={col} className="whitespace-nowrap">
                  {['Print', 'Action'].includes(col) ? (
                    col
                  ) : (
                    <span className="flex items-center gap-1">
                      {col}
                      <RiArrowUpDownLine size={11} className="text-text-disabled-300" />
                    </span>
                  )}
                </Table.Head>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {ROWS.map(r => (
              <Table.Row key={r.hubNo}>
                <Table.Cell className="h-auto py-2.5">
                  <span className="text-paragraph-sm font-medium text-primary-base cursor-pointer hover:underline">
                    {r.hubNo}
                  </span>
                </Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-xs text-text-sub-600">
                  {r.origin}
                </Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-xs text-text-sub-600">
                  {r.destination}
                </Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-xs text-text-sub-600 max-w-[200px] truncate">
                  {r.orders}
                </Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-xs text-text-sub-600">
                  {r.boxes}
                </Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-xs text-text-sub-600">
                  {r.weight}
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
                  <Button.Root size="small" variant="neutral" mode="stroke">
                    Receive
                  </Button.Root>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>

        <div className="border-t border-stroke-soft-200 px-4 py-3">
          <span className="text-paragraph-xs text-text-sub-600">Showing 1-{ROWS.length} of {ROWS.length}</span>
        </div>
      </div>
    </div>
  );
}
