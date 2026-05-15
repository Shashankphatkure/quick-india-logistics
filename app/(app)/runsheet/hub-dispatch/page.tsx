'use client';
import React from 'react';
import Link from 'next/link';
import { cn } from '@/utils/cn';

const RS_TABS = [
  { label: 'Pending Delivery', href: '/runsheet/pending-delivery' },
  { label: 'Hub Dispatch', href: '/runsheet/hub-dispatch' },
  { label: 'Incoming Runsheet', href: '/runsheet/incoming' },
  { label: 'All Runsheet', href: '/runsheet/all' },
];

export default function HubDispatchRunsheetPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-label-lg font-bold text-text-strong-950">Runsheet</h1>
        <p className="text-paragraph-xs text-text-sub-600">Runsheet / Hub Dispatch</p>
      </div>
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-1 shadow-regular-xs">
        {RS_TABS.map(t => (
          <Link key={t.href} href={t.href} className={cn('shrink-0 rounded-lg px-3 py-1.5 text-paragraph-xs font-medium transition', t.href === '/runsheet/hub-dispatch' ? 'bg-primary-base text-white' : 'text-text-sub-600 hover:bg-bg-weak-50')}>
            {t.label}
          </Link>
        ))}
      </div>
      <div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <table className="w-full text-paragraph-sm">
          <thead>
            <tr className="border-b border-stroke-soft-200 bg-bg-weak-50">
              {['Hub Transfer No', 'From Branch', 'To Branch', 'Destination', 'Total Orders', 'Total Box', 'Manifest Date', 'Print', 'Edit'].map(c => (
                <th key={c} className="whitespace-nowrap px-3 py-2.5 text-left text-paragraph-xs font-semibold text-text-sub-600">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={9} className="px-4 py-10 text-center text-paragraph-sm text-text-sub-600">No data found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
