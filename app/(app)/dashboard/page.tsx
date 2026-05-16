import React from 'react';
import Link from 'next/link';
import * as Select from '@/components/ui/select';
import PageHeader from '@/components/page-header';
import StatsStrip from '@/components/stats-strip';
import {
  RiDashboard3Line,
  RiArrowRightLine,
  RiTruckLine,
  RiTimeLine,
  RiCheckboxCircleLine,
  RiBox3Line,
  RiCalendarLine,
  RiMoreLine,
  RiFilePaperLine,
  RiSnowflakeLine,
  RiAlertLine,
} from '@remixicon/react';

const RECENT_ACTIVITIES = [
  { id: 1, docket: '738396', event: 'Order Received', branch: 'QIL-Amritsar', time: '10:32 AM', color: 'blue' as const },
  { id: 2, docket: '4188696', event: 'Shipment In Transit', branch: 'QIL-Delhi', time: '10:15 AM', color: 'orange' as const },
  { id: 3, docket: '738433', event: 'Delivered', branch: 'QIL-Amritsar', time: '09:58 AM', color: 'green' as const },
  { id: 4, docket: '750424', event: 'Arrived At Hub', branch: 'QIL-Mumbai', time: '09:30 AM', color: 'blue' as const },
  { id: 5, docket: '4187812', event: 'Manifest Created', branch: 'QIL-Delhi', time: '09:12 AM', color: 'purple' as const },
  { id: 6, docket: '4187204', event: 'Out For Delivery', branch: 'QIL-Amritsar', time: '08:55 AM', color: 'orange' as const },
  { id: 7, docket: '720011', event: 'Delivered', branch: 'QIL-Bengaluru', time: '08:40 AM', color: 'green' as const },
];

const EVENT_COLOR: Record<string, string> = {
  blue: 'bg-information-lighter text-information-base',
  orange: 'bg-warning-lighter text-warning-base',
  green: 'bg-success-lighter text-success-base',
  purple: 'bg-feature-lighter text-feature-base',
  red: 'bg-error-lighter text-error-base',
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        icon={RiDashboard3Line}
        title="Dashboard"
        subtitle="Summary Dashboard For 'Amritsar' Branch"
        breadcrumbs={[{ label: 'Dashboard' }]}
      >
        <div className="flex items-center gap-1.5 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-1.5 shadow-regular-xs">
          <RiCalendarLine size={14} className="text-text-sub-600" />
          <span className="text-paragraph-sm text-text-sub-600">12-04-2026</span>
          <span className="text-text-disabled-300 mx-1">&#8594;</span>
          <span className="text-paragraph-sm text-text-sub-600">12-05-2026</span>
        </div>
        <Select.Root defaultValue="all" size="small">
          <Select.Trigger className="w-32">
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="all">All Types</Select.Item>
            <Select.Item value="domestic">Domestic</Select.Item>
            <Select.Item value="international">International</Select.Item>
          </Select.Content>
        </Select.Root>
      </PageHeader>

      {/* Main layout: content + activity sidebar */}
      <div className="flex flex-col gap-5 xl:flex-row">
        {/* Left: stats + sections */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* Top KPI strip */}
          <StatsStrip stats={[
            { label: 'Total Outgoing', value: 11, trend: 7.1, trendLabel: 'vs prev' },
            { label: 'Total Incoming', value: 40, trend: 12, trendLabel: 'vs prev' },
            { label: 'Delivered Today', value: 39, trend: 5.3, trendLabel: 'vs prev' },
            { label: 'Pending', value: 12, trend: -2.1, trendLabel: 'vs prev' },
          ]} />

          {/* Outgoing + Incoming */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Outgoing */}
            <div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-regular-xs">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-information-lighter">
                    <RiTruckLine size={14} className="text-information-base" />
                  </div>
                  <span className="text-label-sm text-text-strong-950">Outgoing Orders</span>
                </div>
                <button className="rounded-lg p-1 text-text-sub-600 hover:bg-bg-weak-50"><RiMoreLine size={15} /></button>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { label: 'Outgoing', value: 11, color: 'text-text-strong-950' },
                  { label: 'Delivered', value: 0, color: 'text-success-base' },
                  { label: 'Pending', value: 11, color: 'text-warning-base' },
                  { label: 'All Pending', value: 17, color: 'text-error-base' },
                ].map(s => (
                  <div key={s.label} className="rounded-xl bg-bg-weak-50 px-3 py-2.5">
                    <p className="text-paragraph-xs text-text-sub-600">{s.label}</p>
                    <p className={`text-title-h6 font-bold ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Incoming */}
            <div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-regular-xs">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-success-lighter">
                    <RiCheckboxCircleLine size={14} className="text-success-base" />
                  </div>
                  <span className="text-label-sm text-text-strong-950">Incoming Orders</span>
                </div>
                <button className="rounded-lg p-1 text-text-sub-600 hover:bg-bg-weak-50"><RiMoreLine size={15} /></button>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { label: 'Incoming', value: 40, color: 'text-text-strong-950' },
                  { label: 'Delivered', value: 39, color: 'text-success-base' },
                  { label: 'Pending', value: 1, color: 'text-warning-base' },
                  { label: 'All Pending', value: 2, color: 'text-error-base' },
                ].map(s => (
                  <div key={s.label} className="rounded-xl bg-bg-weak-50 px-3 py-2.5">
                    <p className="text-paragraph-xs text-text-sub-600">{s.label}</p>
                    <p className={`text-title-h6 font-bold ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cold Chain + Delay Orders */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-regular-xs">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-verified-lighter">
                  <RiSnowflakeLine size={14} className="text-verified-base" />
                </div>
                <span className="text-label-sm text-text-strong-950">Cold Chain Orders</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { label: 'Incoming', value: 24, color: 'text-verified-base' },
                  { label: 'Outgoing', value: 0, color: 'text-text-sub-600' },
                ].map(s => (
                  <div key={s.label} className="rounded-xl bg-bg-weak-50 px-3 py-2.5">
                    <p className="text-paragraph-xs text-text-sub-600">{s.label}</p>
                    <p className={`text-title-h6 font-bold ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-regular-xs">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-warning-lighter">
                  <RiAlertLine size={14} className="text-warning-base" />
                </div>
                <span className="text-label-sm text-text-strong-950">Delay Orders</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { label: 'Incoming 24h', value: 40, color: 'text-warning-base' },
                  { label: 'Outgoing 24h', value: 11, color: 'text-warning-base' },
                  { label: 'Incoming 40h', value: 38, color: 'text-error-base' },
                  { label: 'Outgoing 40h', value: 11, color: 'text-error-base' },
                ].map(s => (
                  <div key={s.label} className="rounded-xl bg-bg-weak-50 px-3 py-2.5">
                    <p className="text-paragraph-xs text-text-sub-600">{s.label}</p>
                    <p className={`text-title-h6 font-bold ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Manifest Hub + Quick Links */}
          <div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-regular-xs">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-feature-lighter">
                <RiBox3Line size={14} className="text-feature-base" />
              </div>
              <span className="text-label-sm text-text-strong-950">Manifest / Hub Orders</span>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {[
                { title: 'Incoming Orders', received: 39, notReceived: 1 },
                { title: 'Outgoing Orders', received: 8, notReceived: 3 },
              ].map(g => (
                <div key={g.title} className="space-y-2">
                  <p className="text-subheading-2xs uppercase tracking-wider text-text-sub-600">{g.title}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-success-lighter px-3 py-2.5">
                      <p className="text-paragraph-xs text-text-sub-600">Received</p>
                      <p className="text-title-h6 font-bold text-success-dark">{g.received}</p>
                    </div>
                    <div className="rounded-xl bg-error-lighter px-3 py-2.5">
                      <p className="text-paragraph-xs text-text-sub-600">Not Received</p>
                      <p className="text-title-h6 font-bold text-error-dark">{g.notReceived}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { label: 'Add Order', href: '/booking/orders/add', icon: RiTruckLine, color: 'bg-primary-alpha-10 text-primary-base' },
              { label: 'All Orders', href: '/booking/orders', icon: RiCheckboxCircleLine, color: 'bg-success-lighter text-success-base' },
              { label: 'Pending Delivery', href: '/runsheet/pending-delivery', icon: RiTimeLine, color: 'bg-warning-lighter text-warning-base' },
              { label: 'All Manifest', href: '/manifest/all', icon: RiFilePaperLine, color: 'bg-feature-lighter text-feature-base' },
            ].map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center justify-between rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-regular-xs transition hover:border-stroke-sub-300 hover:bg-bg-weak-50 no-underline"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`flex size-8 items-center justify-center rounded-lg ${link.color}`}>
                    <link.icon size={15} />
                  </div>
                  <span className="text-label-sm text-text-strong-950">{link.label}</span>
                </div>
                <RiArrowRightLine size={14} className="text-text-disabled-300" />
              </Link>
            ))}
          </div>
        </div>

        {/* Right: Recent Activity feed */}
        <div className="w-full shrink-0 xl:w-72">
          <div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs xl:sticky xl:top-[80px]">
            <div className="flex items-center justify-between border-b border-stroke-soft-200 px-5 py-4">
              <div>
                <p className="text-label-sm text-text-strong-950">Recent Activities</p>
                <p className="text-paragraph-xs text-text-sub-600 mt-0.5">{RECENT_ACTIVITIES.length} events today</p>
              </div>
              <Link href="/booking/orders" className="text-paragraph-xs font-medium text-primary-base hover:underline no-underline">
                View all
              </Link>
            </div>
            <div className="divide-y divide-stroke-soft-200">
              {RECENT_ACTIVITIES.map(a => (
                <div key={a.id} className="flex items-start gap-3 px-4 py-3 hover:bg-bg-weak-50 transition">
                  <div className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${EVENT_COLOR[a.color]}`}>
                    {a.docket.slice(-2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-paragraph-sm font-medium text-text-strong-950">{a.event}</p>
                    <p className="text-paragraph-xs text-text-sub-600">#{a.docket} &bull; {a.branch}</p>
                  </div>
                  <p className="shrink-0 text-[11px] text-text-disabled-300">{a.time}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-stroke-soft-200 px-5 py-3">
              <Link href="/booking/orders" className="flex w-full items-center justify-center gap-1.5 text-paragraph-sm font-medium text-primary-base hover:underline no-underline">
                View all activity <RiArrowRightLine size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
