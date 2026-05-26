'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import * as Button from '@/components/ui/button';
import * as Table from '@/components/ui/table';
import * as Label from '@/components/ui/label';
import { Root as Checkbox } from '@/components/ui/checkbox';
import PageHeader from '@/components/page-header';
import StatsStrip from '@/components/stats-strip';
import { RiAddLine, RiListCheck2, RiArrowUpDownLine } from '@remixicon/react';
import { cn } from '@/utils/cn';

const RS_TABS = [
  { label: 'Pending Delivery', href: '/runsheet/pending-delivery' },
  { label: 'Hub Dispatch', href: '/runsheet/hub-dispatch' },
  { label: 'Incoming Runsheet', href: '/runsheet/incoming' },
  { label: 'All Runsheet', href: '/runsheet/all' },
];

const ORDERS = [
  { docket: '4111021', date: '12-05-2026', origin: 'Mumbai, 400055', destination: 'Bhiwandi, 421302', client: 'Krutishi Dist', ewaybill: 'Z12200252213', weight: 90, qty: 9 },
  { docket: '4110946', date: '12-05-2026', origin: 'Bhiwandi, 421302', destination: 'Vadape, 421307', client: 'Sun Pharma Distributors...', ewaybill: 'No EwayBill', weight: 10, qty: 1 },
  { docket: '4110945', date: '12-05-2026', origin: 'Bhiwandi, 421302', destination: 'Vadape, 421307', client: 'Sun Pharma Distributors...', ewaybill: 'No EwayBill', weight: 10, qty: 1 },
  { docket: '4110944', date: '12-05-2026', origin: 'Ghatkopar, 400086', destination: 'Vadape, 421307', client: 'Bharat Serums And Vacc...', ewaybill: 'No EwayBill', weight: 10, qty: 1 },
  { docket: '4110940', date: '12-05-2026', origin: 'Vadape, 421307', destination: 'Vadape, 421307', client: 'Sun Pharma Distributors...', ewaybill: 'No EwayBill', weight: 10, qty: 1 },
];

const ORDERS_COLS = ['Docket No', 'Booking Date', 'Origin', 'Destination', 'Client', 'EwayBill No', 'Actual Weight', 'Total Qty', 'Action'];
const RS_COLS = ['Docket No', 'Booking Date', 'Origin', 'Destination', 'Client', 'EwayBill No', 'Actual Weight', 'Total Qty', 'Damaged'];

type RunsheetType = 'runsheet' | 'hub';

export default function PendingDeliveryPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [rsType, setRsType] = useState<RunsheetType>('runsheet');
  const toggle = (id: string) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  return (
    <div className="space-y-5">
      <PageHeader
        icon={RiListCheck2}
        iconColor="bg-warning-lighter text-warning-base"
        title="Pending Delivery"
        subtitle="Orders ready to be assigned to a runsheet"
        breadcrumbs={[{ label: 'Runsheet', href: '/runsheet/pending-delivery' }, { label: 'Pending Delivery' }]}
      />

      <StatsStrip stats={[
        { label: 'Total Pending', value: ORDERS.length, trend: -3.2, trendLabel: 'vs yesterday' },
        { label: 'Selected', value: selected.length },
        { label: 'Total Weight', value: ORDERS.reduce((s, o) => s + o.weight, 0) + ' kg' },
        { label: 'Total Qty', value: ORDERS.reduce((s, o) => s + o.qty, 0) },
      ]} />

      {/* Tab strip */}
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-1 shadow-regular-xs">
        {RS_TABS.map(t => (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              'shrink-0 rounded-lg px-3 py-1.5 text-paragraph-xs font-medium transition',
              t.href === '/runsheet/pending-delivery'
                ? 'bg-primary-base text-static-white'
                : 'text-text-sub-600 hover:bg-bg-weak-50',
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* Info banner */}
      <div className="rounded-xl border border-information-light bg-information-lighter px-4 py-2 text-paragraph-sm font-semibold text-information-dark">
        Total Local Order - {ORDERS.length}
      </div>

      {/* Orders table card */}
      <div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.Head className="w-10">
                <Checkbox />
              </Table.Head>
              {ORDERS_COLS.map(col => (
                <Table.Head key={col} className="whitespace-nowrap">
                  {col === 'Action' ? (
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
            {ORDERS.map(o => (
              <Table.Row key={o.docket}>
                <Table.Cell className="h-auto py-2.5 w-10">
                  <Checkbox
                    checked={selected.includes(o.docket)}
                    onCheckedChange={() => toggle(o.docket)}
                  />
                </Table.Cell>
                <Table.Cell className="h-auto py-2.5">
                  <span className="text-paragraph-sm font-medium text-primary-base cursor-pointer hover:underline">
                    {o.docket}
                  </span>
                </Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-xs text-text-sub-600 whitespace-nowrap">
                  {o.date}
                </Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-xs text-text-sub-600 whitespace-nowrap">
                  {o.origin}
                </Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-xs text-text-sub-600 whitespace-nowrap">
                  {o.destination}
                </Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-xs text-text-sub-600">
                  {o.client}
                </Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-xs text-text-sub-600">
                  {o.ewaybill}
                </Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-xs text-text-sub-600">
                  {o.weight}
                </Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-xs text-text-sub-600">
                  {o.qty}
                </Table.Cell>
                <Table.Cell className="h-auto py-2.5">
                  <Button.Root size="small" onClick={() => toggle(o.docket)}>
                    <Button.Icon as={RiAddLine} />Add
                  </Button.Root>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </div>

      {/* Create Runsheet panel */}
      <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 sm:p-5 shadow-regular-xs space-y-4">
        <p className="text-label-sm text-text-strong-950">Create Runsheet</p>

        <div className="flex flex-wrap items-center gap-4">
          {/* Radio options using Label + native radio (AlignUI has no radio component) */}
          <Label.Root className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="rstype"
              value="runsheet"
              checked={rsType === 'runsheet'}
              onChange={() => setRsType('runsheet')}
              className="accent-primary-base"
            />
            <span className="text-paragraph-sm text-text-strong-950">Create Runsheet</span>
          </Label.Root>
          <Label.Root className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="rstype"
              value="hub"
              checked={rsType === 'hub'}
              onChange={() => setRsType('hub')}
              className="accent-primary-base"
            />
            <span className="text-paragraph-sm text-text-strong-950">Hub Transfer</span>
          </Label.Root>
          <Button.Root size="small" disabled={selected.length === 0}>
            Create
          </Button.Root>
        </div>

        {selected.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-stroke-soft-200">
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  {RS_COLS.map(col => (
                    <Table.Head key={col} className="whitespace-nowrap">
                      {col}
                    </Table.Head>
                  ))}
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {ORDERS.filter(o => selected.includes(o.docket)).map(o => (
                  <Table.Row key={o.docket}>
                    <Table.Cell className="h-auto py-2">
                      <span className="text-paragraph-xs font-medium text-primary-base">{o.docket}</span>
                    </Table.Cell>
                    <Table.Cell className="h-auto py-2 text-paragraph-xs text-text-sub-600 whitespace-nowrap">
                      {o.date}
                    </Table.Cell>
                    <Table.Cell className="h-auto py-2 text-paragraph-xs text-text-sub-600 whitespace-nowrap">
                      {o.origin}
                    </Table.Cell>
                    <Table.Cell className="h-auto py-2 text-paragraph-xs text-text-sub-600 whitespace-nowrap">
                      {o.destination}
                    </Table.Cell>
                    <Table.Cell className="h-auto py-2 text-paragraph-xs text-text-sub-600">
                      {o.client}
                    </Table.Cell>
                    <Table.Cell className="h-auto py-2 text-paragraph-xs text-text-sub-600">
                      {o.ewaybill}
                    </Table.Cell>
                    <Table.Cell className="h-auto py-2 text-paragraph-xs text-text-sub-600">
                      {o.weight}
                    </Table.Cell>
                    <Table.Cell className="h-auto py-2 text-paragraph-xs text-text-sub-600">
                      {o.qty}
                    </Table.Cell>
                    <Table.Cell className="h-auto py-2 text-paragraph-xs text-text-sub-600">
                      0
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </div>
        ) : (
          <p className="text-paragraph-xs text-text-sub-600 italic">
            No rows to show. Select orders above to add them.
          </p>
        )}
      </div>
    </div>
  );
}
