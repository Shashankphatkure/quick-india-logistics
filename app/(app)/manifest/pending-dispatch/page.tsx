'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import * as Button from '@/components/ui/button';
import * as Select from '@/components/ui/select';
import * as Label from '@/components/ui/label';
import * as Table from '@/components/ui/table';
import * as Radio from '@/components/ui/radio';
import { Root as Checkbox } from '@/components/ui/checkbox';
import PageHeader from '@/components/page-header';
import StatsStrip from '@/components/stats-strip';
import { RiAddLine, RiFilePaperLine } from '@remixicon/react';
import { cn } from '@/utils/cn';

const MANIFEST_TABS = [
  { label: 'Pending For Dispatch', href: '/manifest/pending-dispatch' },
  { label: 'Hub Dispatch', href: '/manifest/hub-dispatch' },
  { label: 'Forwarding Details', href: '/manifest/forwarding' },
  { label: 'Pending To Depart', href: '/manifest/pending-depart' },
  { label: 'Incoming Manifest', href: '/manifest/incoming' },
  { label: 'All Manifest', href: '/manifest/all' },
];

const ORDERS = [
  { docket: '699454', date: '12-05-2026', origin: 'Tiruvallur, 600060', destination: 'Gulbarga, 585102', client: 'Carestream Health India...', ewaybill: 'No EwayBill', weight: 4, qty: 2, damaged: 0, notReceived: 0 },
  { docket: '699455', date: '12-05-2026', origin: 'Tiruvallur, 600060', destination: 'Bangalore, 560078', client: 'Carestream Health India...', ewaybill: 'No EwayBill', weight: 1, qty: 1, damaged: 0, notReceived: 0 },
  { docket: '713494', date: '12-05-2026', origin: 'Bangalore, 560028', destination: 'Hubballi, 580028', client: 'Eli Lily And Company I P...', ewaybill: '10242593466', weight: 8, qty: 1, damaged: 0, notReceived: 0 },
  { docket: '708381', date: '12-05-2026', origin: 'Kolkata, 700026', destination: 'Beethamen, 713101', client: 'Eli Lily And Company I P...', ewaybill: '85160540350', weight: 10, qty: 1, damaged: 0, notReceived: 0 },
];

const TRANSFER_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'air', label: 'Through Air' },
  { value: 'branch', label: 'Branch Transfer' },
];

export default function PendingDispatchPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [transferMode, setTransferMode] = useState<string>('air');
  const allSelected = selected.length === ORDERS.length;

  const toggle = (id: string) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleAll = () => setSelected(allSelected ? [] : ORDERS.map(o => o.docket));

  return (
    <div className="space-y-5">
      <PageHeader
        icon={RiFilePaperLine}
        iconColor="bg-warning-lighter text-warning-base"
        title="Pending For Dispatch"
        subtitle="Orders ready to be manifested and dispatched"
        breadcrumbs={[{ label: 'Manifest', href: '/manifest/pending-dispatch' }, { label: 'Pending For Dispatch' }]}
      />

      <StatsStrip stats={[
        { label: 'Unmanifested', value: ORDERS.length, trend: -8, trendLabel: 'vs yesterday' },
        { label: 'Selected', value: selected.length },
        { label: 'Total Weight', value: ORDERS.reduce((s, o) => s + o.weight, 0) + ' kg' },
        { label: 'Total Qty', value: ORDERS.reduce((s, o) => s + o.qty, 0) },
      ]} />

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-1 shadow-regular-xs">
        {MANIFEST_TABS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              'shrink-0 rounded-lg px-3 py-1.5 text-paragraph-xs font-medium transition',
              t.href === '/manifest/pending-dispatch'
                ? 'bg-primary-base text-static-white'
                : 'text-text-sub-600 hover:bg-bg-weak-50',
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* Total banner */}
      <div className="rounded-xl border border-warning-light bg-warning-lighter px-4 py-2 text-paragraph-sm font-semibold text-warning-dark">
        Total Unmanifest Orders &mdash; {ORDERS.length}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.Head className="w-10">
                <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
              </Table.Head>
              {['Docket No', 'Date', 'Origin', 'Destination', 'Client', 'EwayBill No', 'Weight', 'Qty', 'Damaged', 'Not Rcvd', 'Action'].map(col => (
                <Table.Head key={col}>{col}</Table.Head>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {ORDERS.map(o => (
              <Table.Row key={o.docket}>
                <Table.Cell className="h-auto py-2.5 w-10">
                  <Checkbox checked={selected.includes(o.docket)} onCheckedChange={() => toggle(o.docket)} />
                </Table.Cell>
                <Table.Cell className="h-auto py-2.5 font-medium text-primary-base text-paragraph-sm whitespace-nowrap">{o.docket}</Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-xs text-text-sub-600 whitespace-nowrap">{o.date}</Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-xs text-text-sub-600 whitespace-nowrap">{o.origin}</Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-xs text-text-sub-600 whitespace-nowrap">{o.destination}</Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-xs text-text-sub-600">{o.client}</Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-xs text-text-sub-600">{o.ewaybill}</Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-xs text-text-sub-600">{o.weight}</Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-xs text-text-sub-600">{o.qty}</Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-xs text-success-dark">{o.damaged}</Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-xs text-text-sub-600">{o.notReceived}</Table.Cell>
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

      {/* Create Manifest panel */}
      {selected.length > 0 && (
        <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 sm:p-5 shadow-regular-xs space-y-4">
          <h3 className="text-label-sm text-text-strong-950">Create Manifest</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label.Root>Select Branch To Forward <Label.Asterisk /></Label.Root>
              <Select.Root size="small">
                <Select.Trigger><Select.Value placeholder="Select Branch" /></Select.Trigger>
                <Select.Content>
                  <Select.Item value="mumbai">QIL-Mumbai</Select.Item>
                  <Select.Item value="delhi">QIL-Delhi</Select.Item>
                  <Select.Item value="bangalore">QIL-Bangalore</Select.Item>
                </Select.Content>
              </Select.Root>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label.Root>Selected Branch Destination <Label.Asterisk /></Label.Root>
              <Select.Root size="small">
                <Select.Trigger><Select.Value placeholder="Select Destination" /></Select.Trigger>
                <Select.Content>
                  <Select.Item value="mumbai">Mumbai</Select.Item>
                  <Select.Item value="delhi">New Delhi</Select.Item>
                  <Select.Item value="bangalore">Bangalore</Select.Item>
                </Select.Content>
              </Select.Root>
            </div>
            <div className="flex flex-col gap-1.5 justify-end">
              <Label.Root>Transfer Mode</Label.Root>
              <Radio.Group
                value={transferMode}
                onValueChange={setTransferMode}
                className="flex gap-4 pb-0.5"
              >
                {TRANSFER_OPTIONS.map(opt => (
                  <Label.Root key={opt.value} className="flex cursor-pointer items-center gap-1.5">
                    <Radio.Item value={opt.value} />
                    <span className="text-paragraph-sm text-text-strong-950">{opt.label}</span>
                  </Label.Root>
                ))}
              </Radio.Group>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-paragraph-xs text-text-sub-600">{selected.length} order(s) selected</p>
            <Button.Root size="small">Create Manifest</Button.Root>
          </div>
        </div>
      )}
    </div>
  );
}
