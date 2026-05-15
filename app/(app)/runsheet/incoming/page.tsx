'use client';
import React from 'react';
import Link from 'next/link';
import * as Button from '@/components/ui/button';
import { RiPrinterLine } from '@remixicon/react';
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

export default function IncomingRunsheetPage() {
  return (
    <div className="space-y-4">
      <div><h1 className="text-label-lg font-bold text-text-strong-950">Runsheet</h1><p className="text-paragraph-xs text-text-sub-600">Runsheet / Incoming Runsheet</p></div>
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-1 shadow-regular-xs">
        {RS_TABS.map(t => <Link key={t.href} href={t.href} className={cn('shrink-0 rounded-lg px-3 py-1.5 text-paragraph-xs font-medium transition', t.href === '/runsheet/incoming' ? 'bg-primary-base text-white' : 'text-text-sub-600 hover:bg-bg-weak-50')}>{t.label}</Link>)}
      </div>
      <div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <table className="w-full text-paragraph-sm">
          <thead><tr className="border-b border-stroke-soft-200 bg-bg-weak-50">
            {['Hub Transfer No', 'Origin', 'Destination', 'Total Orders', 'Total Box', 'Total Weight', 'Print', 'Action'].map(c => <th key={c} className="whitespace-nowrap px-3 py-2.5 text-left text-paragraph-xs font-semibold text-text-sub-600">{c}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-stroke-soft-200">
            {ROWS.map(r => (
              <tr key={r.hubNo} className="hover:bg-bg-weak-50">
                <td className="px-3 py-2.5 font-medium text-primary-base">{r.hubNo}</td>
                <td className="px-3 py-2.5 text-paragraph-xs">{r.origin}</td>
                <td className="px-3 py-2.5 text-paragraph-xs">{r.destination}</td>
                <td className="px-3 py-2.5 text-paragraph-xs max-w-[200px] truncate">{r.orders}</td>
                <td className="px-3 py-2.5 text-paragraph-xs">{r.boxes}</td>
                <td className="px-3 py-2.5 text-paragraph-xs">{r.weight}</td>
                <td className="px-3 py-2.5"><button className="text-text-sub-600 hover:text-primary-base"><RiPrinterLine size={14} /></button></td>
                <td className="px-3 py-2.5"><Button.Root size="small" variant="neutral" mode="stroke">Receive</Button.Root></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t border-stroke-soft-200 px-4 py-3"><span className="text-paragraph-xs text-text-sub-600">Showing 1-1 of 1</span></div>
      </div>
    </div>
  );
}
