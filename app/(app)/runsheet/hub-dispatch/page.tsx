'use client';
import React from 'react';
import Link from 'next/link';
import * as Table from '@/components/ui/table';
import * as CompactButton from '@/components/ui/compact-button';
import * as Tooltip from '@/components/ui/tooltip';
import PageHeader from '@/components/page-header';
import StatsStrip from '@/components/stats-strip';
import { RiListCheck2, RiArrowUpDownLine, RiPrinterLine, RiEditLine } from '@remixicon/react';
import { cn } from '@/utils/cn';

const RS_TABS = [
  { label: 'Pending Delivery', href: '/runsheet/pending-delivery' },
  { label: 'Hub Dispatch', href: '/runsheet/hub-dispatch' },
  { label: 'Incoming Runsheet', href: '/runsheet/incoming' },
  { label: 'All Runsheet', href: '/runsheet/all' },
];

const HUB_DISPATCHES: {
  hubTransferNo: string;
  fromBranch: string;
  toBranch: string;
  destination: string;
  totalOrders: number;
  totalBox: number;
  manifestDate: string;
}[] = [];

const TABLE_COLS = [
  'Hub Transfer No',
  'From Branch',
  'To Branch',
  'Destination',
  'Total Orders',
  'Total Box',
  'Manifest Date',
  'Print',
  'Edit',
];

export default function HubDispatchRunsheetPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        icon={RiListCheck2}
        iconColor="bg-feature-lighter text-feature-base"
        title="Hub Dispatch"
        subtitle="Manage hub-to-hub transfer runsheets"
        breadcrumbs={[
          { label: 'Runsheet', href: '/runsheet/hub-dispatch' },
          { label: 'Hub Dispatch' },
        ]}
      />

      <StatsStrip stats={[
        { label: 'Total Hub Dispatches', value: 0, trend: 0 },
        { label: 'In Transit', value: 0, trend: 0 },
        { label: 'Completed', value: 0, trend: 0 },
        { label: 'Pending', value: 0, trend: 0 },
      ]} />

      {/* Tab strip */}
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-1 shadow-regular-xs">
        {RS_TABS.map(t => (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              'shrink-0 rounded-lg px-3 py-1.5 text-paragraph-xs font-medium transition',
              t.href === '/runsheet/hub-dispatch'
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
                  {['Print', 'Edit'].includes(col) ? (
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
            {HUB_DISPATCHES.length === 0 ? (
              <Table.Row>
                <Table.Cell
                  colSpan={TABLE_COLS.length}
                  className="h-auto py-10 text-center text-paragraph-sm text-text-sub-600"
                >
                  No data found
                </Table.Cell>
              </Table.Row>
            ) : (
              HUB_DISPATCHES.map(r => (
                <Table.Row key={r.hubTransferNo}>
                  <Table.Cell className="h-auto py-2.5">
                    <span className="text-paragraph-sm font-medium text-primary-base cursor-pointer hover:underline">
                      {r.hubTransferNo}
                    </span>
                  </Table.Cell>
                  <Table.Cell className="h-auto py-2.5 text-paragraph-xs text-text-sub-600 whitespace-nowrap">
                    {r.fromBranch}
                  </Table.Cell>
                  <Table.Cell className="h-auto py-2.5 text-paragraph-xs text-text-sub-600 whitespace-nowrap">
                    {r.toBranch}
                  </Table.Cell>
                  <Table.Cell className="h-auto py-2.5 text-paragraph-xs text-text-sub-600">
                    {r.destination}
                  </Table.Cell>
                  <Table.Cell className="h-auto py-2.5 text-paragraph-xs text-text-sub-600">
                    {r.totalOrders}
                  </Table.Cell>
                  <Table.Cell className="h-auto py-2.5 text-paragraph-xs text-text-sub-600">
                    {r.totalBox}
                  </Table.Cell>
                  <Table.Cell className="h-auto py-2.5 text-paragraph-xs text-text-sub-600 whitespace-nowrap">
                    {r.manifestDate}
                  </Table.Cell>
                  <Table.Cell className="h-auto py-2.5">
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <CompactButton.Root variant="ghost" size="large">
                          <CompactButton.Icon as={RiPrinterLine} />
                        </CompactButton.Root>
                      </Tooltip.Trigger>
                      <Tooltip.Content>Print dispatch</Tooltip.Content>
                    </Tooltip.Root>
                  </Table.Cell>
                  <Table.Cell className="h-auto py-2.5">
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <CompactButton.Root variant="ghost" size="large">
                          <CompactButton.Icon as={RiEditLine} />
                        </CompactButton.Root>
                      </Tooltip.Trigger>
                      <Tooltip.Content>Edit dispatch</Tooltip.Content>
                    </Tooltip.Root>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table.Root>
      </div>
    </div>
  );
}
