'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import * as Button from '@/components/ui/button';
import { Root as Checkbox } from '@/components/ui/checkbox';
import PageHeader from '@/components/page-header';
import StatsStrip from '@/components/stats-strip';
import { RiAddLine, RiListCheck2 } from '@remixicon/react';
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

export default function PendingDeliveryPage() {
  const [selected, setSelected] = useState<string[]>([]);
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
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-1 shadow-regular-xs">
        {RS_TABS.map(t => <Link key={t.href} href={t.href} className={cn('shrink-0 rounded-lg px-3 py-1.5 text-paragraph-xs font-medium transition', t.href === '/runsheet/pending-delivery' ? 'bg-primary-base text-white' : 'text-text-sub-600 hover:bg-bg-weak-50')}>{t.label}</Link>)}
      </div>

      <div className="rounded-xl border border-information-light bg-information-lighter px-4 py-2 text-paragraph-sm font-semibold text-information-dark">
        Total Local Order - {ORDERS.length}
      </div>

      <div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-paragraph-sm">
            <thead><tr className="border-b border-stroke-soft-200 bg-bg-weak-50">
              <th className="p-3"><Checkbox /></th>
              {['Docket No', 'Booking Date', 'Origin', 'Destination', 'Client', 'EwayBill No', 'Actual Weight', 'Total Qty', 'Action'].map(c => <th key={c} className="whitespace-nowrap px-3 py-2.5 text-left text-paragraph-xs font-semibold text-text-sub-600">{c}</th>)}
            </tr></thead>
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
                  <td className="px-3 py-2.5"><Button.Root size="small" onClick={() => toggle(o.docket)}><Button.Icon as={RiAddLine} />Add</Button.Root></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Runsheet */}
      <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-regular-xs space-y-4">
        <h3 className="text-paragraph-sm font-semibold text-text-strong-950">Create Runsheet</h3>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-paragraph-sm cursor-pointer"><input type="radio" name="rstype" defaultChecked className="accent-primary-base" />Create Runsheet</label>
          <label className="flex items-center gap-2 text-paragraph-sm cursor-pointer"><input type="radio" name="rstype" className="accent-primary-base" />Hub Transfer</label>
          <Button.Root size="small" disabled={selected.length === 0}>Create</Button.Root>
        </div>
        {selected.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-stroke-soft-200">
            <table className="w-full text-paragraph-xs">
              <thead><tr className="border-b border-stroke-soft-200 bg-bg-weak-50">
                {['Docket No', 'Booking Date', 'Origin', 'Destination', 'Client', 'EwayBill No', 'Actual Weight', 'Total Qty', 'Damaged'].map(c => <th key={c} className="px-3 py-2 text-left font-semibold text-text-sub-600">{c}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-stroke-soft-200">
                {ORDERS.filter(o => selected.includes(o.docket)).map(o => (
                  <tr key={o.docket}>
                    <td className="px-3 py-2 font-medium text-primary-base">{o.docket}</td>
                    <td className="px-3 py-2">{o.date}</td>
                    <td className="px-3 py-2">{o.origin}</td>
                    <td className="px-3 py-2">{o.destination}</td>
                    <td className="px-3 py-2">{o.client}</td>
                    <td className="px-3 py-2">{o.ewaybill}</td>
                    <td className="px-3 py-2">{o.weight}</td>
                    <td className="px-3 py-2">{o.qty}</td>
                    <td className="px-3 py-2">0</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-paragraph-xs text-text-sub-600 italic">No rows to show. Select orders above to add them.</p>
        )}
      </div>
    </div>
  );
}
