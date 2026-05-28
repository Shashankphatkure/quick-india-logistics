import React from 'react';
import Link from 'next/link';
import PageHeader from '@/components/page-header';
import StatsStrip from '@/components/stats-strip';
import StatTile, { type StatTone } from '@/components/stat-tile';
import {
  RiDashboard3Line, RiArrowRightLine, RiTruckLine, RiTimeLine,
  RiCheckboxCircleLine, RiBox3Line, RiCalendarLine, RiMoreLine,
  RiFilePaperLine, RiSnowflakeLine, RiAlertLine,
} from '@remixicon/react';
import { getDashboardMetrics, getRecentActivities } from '@/lib/db/dashboard';
import { currentOrgId } from '@/lib/tenant';
import { getSession } from '@/lib/auth';

const EVENT_COLOR: Record<string, string> = {
  blue: 'bg-information-lighter text-information-base',
  orange: 'bg-warning-lighter text-warning-base',
  green: 'bg-success-lighter text-success-base',
  purple: 'bg-feature-lighter text-feature-base',
  red: 'bg-error-lighter text-error-base',
};

export default async function DashboardPage() {
  const orgId = await currentOrgId();
  const session = await getSession();
  const branchId = session?.homeBranchId ?? session?.branchIds[0] ?? null;

  const [metrics, activities] = await Promise.all([
    getDashboardMetrics(orgId, branchId),
    getRecentActivities(orgId, 7),
  ]);

  const today = new Date();
  const thirtyAgo = new Date(today.getTime() - 30 * 86400000);
  const fmt = (d: Date) => `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={RiDashboard3Line}
        title="Dashboard"
        subtitle={`Summary for ${session?.fullName ?? 'your branch'}`}
        breadcrumbs={[{ label: 'Dashboard' }]}
      >
        <div className="flex items-center gap-1.5 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-1.5 shadow-regular-xs">
          <RiCalendarLine size={14} className="text-text-sub-600" />
          <span className="text-paragraph-sm text-text-sub-600">{fmt(thirtyAgo)}</span>
          <span className="text-text-disabled-300 mx-1">→</span>
          <span className="text-paragraph-sm text-text-sub-600">{fmt(today)}</span>
        </div>
      </PageHeader>

      <div className="flex flex-col gap-5 xl:flex-row">
        <div className="flex-1 min-w-0 space-y-5">
          <StatsStrip stats={[
            { label: 'Total Outgoing', value: metrics.outgoing, trend: 0, trendLabel: 'from my branch' },
            { label: 'Total Incoming', value: metrics.incoming, trend: 0, trendLabel: 'to my branch' },
            { label: 'Delivered Today', value: metrics.delivered_today, trend: 0, trendLabel: 'today' },
            { label: 'Pending', value: metrics.pending, trend: 0, trendLabel: 'in-progress' },
          ]} />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                {([
                  { label: 'Outgoing', value: metrics.outgoing_total, tone: 'neutral' },
                  { label: 'Delivered', value: metrics.outgoing_delivered, tone: 'success' },
                  { label: 'Pending', value: metrics.outgoing_pending, tone: 'warning' },
                  { label: 'Aged Pending', value: metrics.outgoing_all_pending, tone: 'error' },
                ] as { label: string; value: number; tone: StatTone }[]).map(s => (
                  <StatTile key={s.label} label={s.label} value={s.value} tone={s.tone} />
                ))}
              </div>
            </div>

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
                {([
                  { label: 'Incoming', value: metrics.incoming_total, tone: 'neutral' },
                  { label: 'Delivered', value: metrics.incoming_delivered, tone: 'success' },
                  { label: 'Pending', value: metrics.incoming_pending, tone: 'warning' },
                  { label: 'Aged Pending', value: metrics.incoming_all_pending, tone: 'error' },
                ] as { label: string; value: number; tone: StatTone }[]).map(s => (
                  <StatTile key={s.label} label={s.label} value={s.value} tone={s.tone} />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-regular-xs">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-verified-lighter">
                  <RiSnowflakeLine size={14} className="text-verified-base" />
                </div>
                <span className="text-label-sm text-text-strong-950">Cold Chain Orders</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {([
                  { label: 'Incoming', value: metrics.cold_incoming, tone: 'verified' },
                  { label: 'Outgoing', value: metrics.cold_outgoing, tone: 'muted' },
                ] as { label: string; value: number; tone: StatTone }[]).map(s => (
                  <StatTile key={s.label} label={s.label} value={s.value} tone={s.tone} />
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
                {([
                  { label: 'Incoming 24h', value: metrics.delay_incoming_24h, tone: 'warning' },
                  { label: 'Outgoing 24h', value: metrics.delay_outgoing_24h, tone: 'warning' },
                  { label: 'Incoming 40h', value: metrics.delay_incoming_40h, tone: 'error' },
                  { label: 'Outgoing 40h', value: metrics.delay_outgoing_40h, tone: 'error' },
                ] as { label: string; value: number; tone: StatTone }[]).map(s => (
                  <StatTile key={s.label} label={s.label} value={s.value} tone={s.tone} />
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-regular-xs">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-feature-lighter">
                <RiBox3Line size={14} className="text-feature-base" />
              </div>
              <span className="text-label-sm text-text-strong-950">Manifest / Hub Orders</span>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {[
                { title: 'Incoming Manifests', received: metrics.manifest_incoming_received, notReceived: metrics.manifest_incoming_not_received },
                { title: 'Outgoing Manifests', received: metrics.manifest_outgoing_received, notReceived: metrics.manifest_outgoing_not_received },
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

        <div className="w-full shrink-0 xl:w-72">
          <div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs xl:sticky xl:top-[80px]">
            <div className="flex items-center justify-between border-b border-stroke-soft-200 px-5 py-4">
              <div>
                <p className="text-label-sm text-text-strong-950">Recent Activities</p>
                <p className="text-paragraph-xs text-text-sub-600 mt-0.5">{activities.length} latest events</p>
              </div>
              <Link href="/booking/orders" className="text-paragraph-xs font-medium text-primary-base hover:underline no-underline">
                View all
              </Link>
            </div>
            <div className="divide-y divide-stroke-soft-200">
              {activities.length === 0 ? (
                <p className="px-5 py-4 text-paragraph-sm text-text-sub-600">No recent activity</p>
              ) : activities.map(a => (
                <div key={a.id} className="flex items-start gap-3 px-4 py-3 hover:bg-bg-weak-50 transition">
                  <div className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${EVENT_COLOR[a.color]}`}>
                    {a.docket.slice(-2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-paragraph-sm font-medium text-text-strong-950">{a.event}</p>
                    <p className="text-paragraph-xs text-text-sub-600">#{a.docket} • {a.branch}</p>
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
