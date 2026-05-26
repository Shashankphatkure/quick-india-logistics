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

const ROWS = [
  { manifest: 'QLIM096078', origin: 'Jaipur', destination: 'Udaipur', orders: '4110039', coloader: 'By Vehicle', bags: 0, boxes: 1, weight: 17, qty: 1 },
];

export default function PendingDepartPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        icon={RiFilePaperLine}
        iconColor="bg-warning-lighter text-warning-base"
        title="Pending To Depart"
        subtitle="Manifests awaiting departure"
        breadcrumbs={[{ label: 'Manifest', href: '/manifest/pending-depart' }, { label: 'Pending To Depart' }]}
      />

      <StatsStrip stats={[
        { label: 'Pending Departure', value: 1 },
        { label: 'Total Orders', value: 1 },
        { label: 'Total Weight', value: '17 kg' },
        { label: 'Total Qty', value: 1 },
      ]} />

      <div className="flex gap-1 overflow-x-auto rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-1 shadow-regular-xs">
        {TABS.map(t => (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              'shrink-0 rounded-lg px-3 py-1.5 text-paragraph-xs font-medium transition',
              t.href === '/manifest/pending-depart'
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
              {['Manifest No', 'Origin', 'Destination', 'Total Orders', 'Coloader', 'Total Bags', 'Total Box', 'Total Weight', 'Total Qty', 'Print', 'Action'].map(c => (
                <Table.Head key={c}>{c}</Table.Head>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {ROWS.map(r => (
              <Table.Row key={r.manifest}>
                <Table.Cell className="h-auto py-2.5 font-medium text-primary-base text-paragraph-sm whitespace-nowrap">{r.manifest}</Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-xs text-text-sub-600">{r.origin}</Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-xs text-text-sub-600">{r.destination}</Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-xs text-text-sub-600">{r.orders}</Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-xs text-text-sub-600">{r.coloader}</Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-xs text-text-sub-600">{r.bags}</Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-xs text-text-sub-600">{r.boxes}</Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-xs text-text-sub-600">{r.weight}</Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-xs text-text-sub-600">{r.qty}</Table.Cell>
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
                  <Button.Root size="small">Depart</Button.Root>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </div>
    </div>
  );
}
