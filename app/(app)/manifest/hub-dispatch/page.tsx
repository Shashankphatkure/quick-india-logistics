'use client';
import React from 'react';
import Link from 'next/link';
import * as Button from '@/components/ui/button';
import * as Table from '@/components/ui/table';
import * as CompactButton from '@/components/ui/compact-button';
import * as Tooltip from '@/components/ui/tooltip';
import PageHeader from '@/components/page-header';
import StatsStrip from '@/components/stats-strip';
import { RiFilePaperLine, RiPrinterLine } from '@remixicon/react';
import { cn } from '@/utils/cn';

const TABS = [
  { label: 'Pending For Dispatch', href: '/manifest/pending-dispatch' },
  { label: 'Hub Dispatch', href: '/manifest/hub-dispatch' },
  { label: 'Forwarding Details', href: '/manifest/forwarding' },
  { label: 'Pending To Depart', href: '/manifest/pending-depart' },
  { label: 'Incoming Manifest', href: '/manifest/incoming' },
  { label: 'All Manifest', href: '/manifest/all' },
];

const HUBS = [
  { manifest: 'QLIM096393', from: 'QIL-mumbai', to: 'QIL-aurangabad', destination: 'Aurangabad', orders: '731491, 4110378', bags: 'Bag is Not Added', boxes: 'Box is Not Added', date: '2026-05-12 13:28' },
];

export default function HubDispatchPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        icon={RiFilePaperLine}
        iconColor="bg-feature-lighter text-feature-base"
        title="Hub Dispatch"
        subtitle="Manifests dispatched via hub routes"
        breadcrumbs={[{ label: 'Manifest', href: '/manifest/hub-dispatch' }, { label: 'Hub Dispatch' }]}
      />

      <StatsStrip stats={[
        { label: 'Total Manifests', value: 1 },
        { label: 'Dispatched', value: 1 },
        { label: 'Bags Missing', value: 1 },
        { label: 'Boxes Missing', value: 1 },
      ]} />

      <div className="flex gap-1 overflow-x-auto rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-1 shadow-regular-xs">
        {TABS.map(t => (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              'shrink-0 rounded-lg px-3 py-1.5 text-paragraph-xs font-medium transition',
              t.href === '/manifest/hub-dispatch'
                ? 'bg-primary-base text-static-white'
                : 'text-text-sub-600 hover:bg-bg-weak-50',
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <Table.Root>
          <Table.Header>
            <Table.Row>
              {['Manifest', 'From Branch', 'To Branch', 'Destination', 'Total Orders', 'Total Bag', 'Total Box', 'Manifest Date', 'Print', 'Edit'].map(c => (
                <Table.Head key={c}>{c}</Table.Head>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {HUBS.map(h => (
              <Table.Row key={h.manifest}>
                <Table.Cell className="h-auto py-2.5 font-medium text-primary-base text-paragraph-sm whitespace-nowrap">{h.manifest}</Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-xs text-text-sub-600 whitespace-nowrap">{h.from}</Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-xs text-text-sub-600 whitespace-nowrap">{h.to}</Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-xs text-text-sub-600">{h.destination}</Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-xs text-text-sub-600">{h.orders}</Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-xs text-warning-dark">{h.bags}</Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-xs text-warning-dark">{h.boxes}</Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-xs text-text-sub-600 whitespace-nowrap">{h.date}</Table.Cell>
                <Table.Cell className="h-auto py-2.5">
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <CompactButton.Root variant="ghost" size="large">
                        <CompactButton.Icon as={RiPrinterLine} />
                      </CompactButton.Root>
                    </Tooltip.Trigger>
                    <Tooltip.Content>Print manifest</Tooltip.Content>
                  </Tooltip.Root>
                </Table.Cell>
                <Table.Cell className="h-auto py-2.5">
                  <Button.Root size="small" variant="neutral" mode="stroke">Edit</Button.Root>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </div>
    </div>
  );
}
