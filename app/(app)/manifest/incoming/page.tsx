'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import * as Button from '@/components/ui/button';
import { RiPrinterLine } from '@remixicon/react';
import { cn } from '@/utils/cn';

const TABS = [
  { label: 'Pending For Dispatch', href: '/manifest/pending-dispatch' },
  { label: 'Hub Dispatch', href: '/manifest/hub-dispatch' },
  { label: 'Forwarding Details', href: '/manifest/forwarding' },
  { label: 'Pending To Depart', href: '/manifest/pending-depart' },
  { label: 'Incoming Manifest', href: '/manifest/incoming' },
  { label: 'All Manifest', href: '/manifest/all' },
];

const SUB_TABS = ['Incoming Manifest (Air)', 'Incoming Manifest (Branch)', 'Picked Orders'];

const INCOMING = [
  { manifest: 'QLIM096271', date: '12-05-2026 19:59', origin: 'Lucknow', destination: 'Gorakhpur', orders: '787477', coloader: 'Patel Integrated Logistics Ltd', bags: 0, boxes: 1, weight: 2 },
];

export default function IncomingManifestPage() {
  const [subTab, setSubTab] = useState(0);

  return (
    <div className="space-y-4">
      <div><h1 className="text-label-lg font-bold text-text-strong-950">Manifest</h1><p className="text-paragraph-xs text-text-sub-600">Manifests / Incoming Manifest</p></div>
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-1 shadow-regular-xs">
        {TABS.map(t => <Link key={t.href} href={t.href} className={cn('shrink-0 rounded-lg px-3 py-1.5 text-paragraph-xs font-medium transition', t.href === '/manifest/incoming' ? 'bg-primary-base text-white' : 'text-text-sub-600 hover:bg-bg-weak-50')}>{t.label}</Link>)}
      </div>
      <div className="flex gap-1 rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-1 w-fit">
        {SUB_TABS.map((t, i) => <button key={t} onClick={() => setSubTab(i)} className={cn('rounded-md px-3 py-1 text-paragraph-xs font-medium transition', i === subTab ? 'bg-bg-soft-200 text-text-strong-950' : 'text-text-sub-600 hover:bg-bg-weak-50')}>{t}</button>)}
      </div>
      <div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <table className="w-full text-paragraph-sm">
          <thead><tr className="border-b border-stroke-soft-200 bg-bg-weak-50">
            {['Manifest No', 'Date', 'Origin', 'Destination', 'Total Orders', 'Coloader', 'Total Bags', 'Total Box', 'Total Weight', 'Print', 'Action'].map(c => <th key={c} className="whitespace-nowrap px-3 py-2.5 text-left text-paragraph-xs font-semibold text-text-sub-600">{c}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-stroke-soft-200">
            {INCOMING.map(r => (
              <tr key={r.manifest} className="hover:bg-bg-weak-50">
                <td className="px-3 py-2.5 font-medium text-primary-base">{r.manifest}</td>
                <td className="px-3 py-2.5 text-paragraph-xs">{r.date}</td>
                <td className="px-3 py-2.5 text-paragraph-xs">{r.origin}</td>
                <td className="px-3 py-2.5 text-paragraph-xs">{r.destination}</td>
                <td className="px-3 py-2.5 text-paragraph-xs">{r.orders}</td>
                <td className="px-3 py-2.5 text-paragraph-xs">{r.coloader}</td>
                <td className="px-3 py-2.5 text-paragraph-xs">{r.bags}</td>
                <td className="px-3 py-2.5 text-paragraph-xs">{r.boxes}</td>
                <td className="px-3 py-2.5 text-paragraph-xs">{r.weight}</td>
                <td className="px-3 py-2.5"><button className="text-text-sub-600 hover:text-primary-base"><RiPrinterLine size={14} /></button></td>
                <td className="px-3 py-2.5"><Button.Root size="small" variant="neutral" mode="stroke">Receive</Button.Root></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
