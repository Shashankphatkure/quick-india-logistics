'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import * as Button from '@/components/ui/button';
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

export default function PendingDispatchPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const toggle = (id: string) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

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
          <Link key={t.href} href={t.href}
            className={cn('shrink-0 rounded-lg px-3 py-1.5 text-paragraph-xs font-medium transition',
              t.href === '/manifest/pending-dispatch' ? 'bg-primary-base text-white' : 'text-text-sub-600 hover:bg-bg-weak-50')}>
            {t.label}
          </Link>
        ))}
      </div>

      {/* Total */}
      <div className="rounded-xl border border-warning-light bg-warning-lighter px-4 py-2 text-paragraph-sm font-semibold text-warning-dark">
        Total Unmanifest Orders &mdash; {ORDERS.length}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-paragraph-sm">
            <thead>
              <tr className="border-b border-stroke-soft-200 bg-bg-weak-50">
                <th className="p-3"><Checkbox /></th>
                {['Docket No', 'Date', 'Origin', 'Destination', 'Client', 'EwayBill No', 'Weight', 'Qty', 'Damaged', 'Not Rcvd', 'Action'].map(col => (
                  <th key={col} className="whitespace-nowrap px-3 py-2.5 text-left text-paragraph-xs font-semibold text-text-sub-600">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke-soft-200">
              {ORDERS.map(o => (
                <tr key={o.docket} className="hover:bg-bg-weak-50">
                  <td className="p-3"><Checkbox checked={selected.includes(o.docket)} onCheckedChange={() => toggle(o.docket)} /></td>
                  <td className="px-3 py-2.5 font-medium text-primary-base">{o.docket}</td>
                  <td className="px-3 py-2.5 text-paragraph-xs text-text-sub-600">{o.date}</td>
                  <td className="px-3 py-2.5 text-paragraph-xs">{o.origin}</td>
                  <td className="px-3 py-2.5 text-paragraph-xs">{o.destination}</td>
                  <td className="px-3 py-2.5 text-paragraph-xs">{o.client}</td>
                  <td className="px-3 py-2.5 text-paragraph-xs">{o.ewaybill}</td>
                  <td className="px-3 py-2.5 text-paragraph-xs">{o.weight}</td>
                  <td className="px-3 py-2.5 text-paragraph-xs">{o.qty}</td>
                  <td className="px-3 py-2.5 text-paragraph-xs text-success-dark">{o.damaged}</td>
                  <td className="px-3 py-2.5 text-paragraph-xs">{o.notReceived}</td>
                  <td className="px-3 py-2.5">
                    <Button.Root size="small" onClick={() => toggle(o.docket)}>
                      <Button.Icon as={RiAddLine} />
                      Add
                    </Button.Root>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Manifest */}
      {selected.length > 0 && (
        <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-regular-xs space-y-4">
          <h3 className="text-paragraph-sm font-semibold text-text-strong-950">Create Manifest</h3>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-paragraph-xs font-medium text-text-sub-600">Select Branch To Forward *</label>
              <select className="rounded-lg border border-stroke-soft-200 px-3 py-2 text-paragraph-sm outline-none"><option>Select Branch</option></select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-paragraph-xs font-medium text-text-sub-600">Selected Branch Destination *</label>
              <select className="rounded-lg border border-stroke-soft-200 px-3 py-2 text-paragraph-sm outline-none"><option>Select Destination</option></select>
            </div>
            <div className="flex gap-4 pb-1">
              <label className="flex items-center gap-1.5 text-paragraph-sm cursor-pointer"><input type="radio" name="transfer" defaultChecked className="accent-primary-base" />Through Air</label>
              <label className="flex items-center gap-1.5 text-paragraph-sm cursor-pointer"><input type="radio" name="transfer" className="accent-primary-base" />Branch Transfer</label>
            </div>
            <Button.Root size="small">Create Manifest</Button.Root>
          </div>
          <p className="text-paragraph-xs text-text-sub-600">{selected.length} order(s) selected</p>
        </div>
      )}
    </div>
  );
}
