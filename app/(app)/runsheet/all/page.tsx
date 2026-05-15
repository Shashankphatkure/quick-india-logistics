'use client';
import React from 'react';
import Link from 'next/link';
import * as Button from '@/components/ui/button';
import PageHeader from '@/components/page-header';
import StatsStrip from '@/components/stats-strip';
import { RiFilterLine, RiPrinterLine, RiListCheck2 } from '@remixicon/react';
import { cn } from '@/utils/cn';

const RS_TABS = [
  { label: 'Pending Delivery', href: '/runsheet/pending-delivery' },
  { label: 'Hub Dispatch', href: '/runsheet/hub-dispatch' },
  { label: 'Incoming Runsheet', href: '/runsheet/incoming' },
  { label: 'All Runsheet', href: '/runsheet/all' },
];

const RUNSHEETS = [
  { no: 'QLRS63427', branch: 'QIL-bhiwandi', orders: '4111010, 4111012 +46', verifiedBy: 'Super User', status: 'Active', dateTime: '12-05-2026 15:40:55', route: 'Kalher', vehicle: 'MH04BR4827', driver: 'Mohang', deliveryStatus: 'Not Delivered' },
];

const STATUS_COLOR: Record<string, string> = {
  Active: 'bg-success-lighter text-success-dark border-success-light',
  Completed: 'bg-information-lighter text-information-dark border-information-light',
};

export default function AllRunsheetPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        icon={RiListCheck2}
        iconColor="bg-success-lighter text-success-base"
        title="All Runsheet"
        subtitle="Track all delivery runsheets and driver assignments"
        breadcrumbs={[{ label: 'Runsheet', href: '/runsheet/all' }, { label: 'All Runsheet' }]}
      >
        <Button.Root variant="neutral" mode="stroke" size="small">
          <Button.Icon as={RiFilterLine} />Filter
        </Button.Root>
      </PageHeader>

      <StatsStrip stats={[
        { label: 'Total Runsheets', value: 1, trend: 0 },
        { label: 'Active', value: 1, trend: 0 },
        { label: 'Not Delivered', value: 1, trend: -5, trendLabel: 'vs last week' },
        { label: 'Delivered', value: 0, trend: 0 },
      ]} />
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-1 shadow-regular-xs">
        {RS_TABS.map(t => <Link key={t.href} href={t.href} className={cn('shrink-0 rounded-lg px-3 py-1.5 text-paragraph-xs font-medium transition', t.href === '/runsheet/all' ? 'bg-primary-base text-white' : 'text-text-sub-600 hover:bg-bg-weak-50')}>{t.label}</Link>)}
      </div>
      <div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-paragraph-sm">
            <thead><tr className="border-b border-stroke-soft-200 bg-bg-weak-50">
              {['Runsheet No', 'Branch', 'Total Orders', 'Verified By', 'Status', 'Date & Time', 'Route', 'Vehicle No', 'Driver', 'Print', 'Delivery Status'].map(c => <th key={c} className="whitespace-nowrap px-3 py-2.5 text-left text-paragraph-xs font-semibold text-text-sub-600">{c}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-stroke-soft-200">
              {RUNSHEETS.map(r => (
                <tr key={r.no} className="hover:bg-bg-weak-50">
                  <td className="px-3 py-2.5 font-medium text-primary-base cursor-pointer hover:underline">{r.no}</td>
                  <td className="px-3 py-2.5 text-paragraph-xs">{r.branch}</td>
                  <td className="px-3 py-2.5 text-paragraph-xs max-w-[180px] truncate">{r.orders}</td>
                  <td className="px-3 py-2.5 text-paragraph-xs">{r.verifiedBy}</td>
                  <td className="px-3 py-2.5"><span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium', STATUS_COLOR[r.status])}>{r.status}</span></td>
                  <td className="px-3 py-2.5 text-paragraph-xs whitespace-nowrap">{r.dateTime}</td>
                  <td className="px-3 py-2.5 text-paragraph-xs">{r.route}</td>
                  <td className="px-3 py-2.5 text-paragraph-xs">{r.vehicle}</td>
                  <td className="px-3 py-2.5 text-paragraph-xs">{r.driver}</td>
                  <td className="px-3 py-2.5"><button className="text-text-sub-600 hover:text-primary-base"><RiPrinterLine size={14} /></button></td>
                  <td className="px-3 py-2.5"><span className="inline-flex items-center rounded-full bg-warning-lighter border border-warning-light px-2 py-0.5 text-[11px] font-medium text-warning-dark">{r.deliveryStatus}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-stroke-soft-200 px-4 py-3"><span className="text-paragraph-xs text-text-sub-600">Showing 1-1 of 1</span></div>
      </div>
    </div>
  );
}
