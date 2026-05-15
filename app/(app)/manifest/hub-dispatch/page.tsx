'use client';
import React from 'react';
import Link from 'next/link';
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

const HUBS = [
  { manifest: 'QLIM096393', from: 'QIL-mumbai', to: 'QIL-aurangabad', destination: 'Aurangabad', orders: '731491, 4110378', bags: 'Bag is Not Added', boxes: 'Box is Not Added', date: '2026-05-12 13:28' },
];

export default function HubDispatchPage() {
  return (
    <div className="space-y-4">
      <div><h1 className="text-label-lg font-bold text-text-strong-950">Manifest</h1><p className="text-paragraph-xs text-text-sub-600">Manifests / Hub Dispatch</p></div>
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-1 shadow-regular-xs">
        {TABS.map(t => <Link key={t.href} href={t.href} className={cn('shrink-0 rounded-lg px-3 py-1.5 text-paragraph-xs font-medium transition', t.href === '/manifest/hub-dispatch' ? 'bg-primary-base text-white' : 'text-text-sub-600 hover:bg-bg-weak-50')}>{t.label}</Link>)}
      </div>
      <div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <table className="w-full text-paragraph-sm">
          <thead><tr className="border-b border-stroke-soft-200 bg-bg-weak-50">
            {['Manifest', 'From Branch', 'To Branch', 'Destination', 'Total Orders', 'Total Bag', 'Total Box', 'Manifest Date', 'Print', 'Edit'].map(c => <th key={c} className="whitespace-nowrap px-3 py-2.5 text-left text-paragraph-xs font-semibold text-text-sub-600">{c}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-stroke-soft-200">
            {HUBS.map(h => (
              <tr key={h.manifest} className="hover:bg-bg-weak-50">
                <td className="px-3 py-2.5 font-medium text-primary-base">{h.manifest}</td>
                <td className="px-3 py-2.5 text-paragraph-xs">{h.from}</td>
                <td className="px-3 py-2.5 text-paragraph-xs">{h.to}</td>
                <td className="px-3 py-2.5 text-paragraph-xs">{h.destination}</td>
                <td className="px-3 py-2.5 text-paragraph-xs">{h.orders}</td>
                <td className="px-3 py-2.5 text-paragraph-xs text-warning-dark">{h.bags}</td>
                <td className="px-3 py-2.5 text-paragraph-xs text-warning-dark">{h.boxes}</td>
                <td className="px-3 py-2.5 text-paragraph-xs">{h.date}</td>
                <td className="px-3 py-2.5"><button className="text-text-sub-600 hover:text-primary-base"><RiPrinterLine size={14} /></button></td>
                <td className="px-3 py-2.5"><button className="rounded-lg border border-stroke-soft-200 px-2 py-0.5 text-paragraph-xs hover:bg-bg-weak-50">Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
