import React from 'react';
import Link from 'next/link';
import * as Badge from '@/components/ui/badge';
import * as Button from '@/components/ui/button';
import PageHeader from '@/components/page-header';
import {
  RiBarChartLine, RiFileListLine, RiTruckLine, RiCheckboxCircleLine,
  RiArrowRightLine, RiDownloadLine,
} from '@remixicon/react';

const REPORT_GROUPS = [
  {
    title: 'Orders & Shipments',
    icon: RiFileListLine,
    iconColor: 'bg-primary-alpha-10 text-primary-base',
    reports: [
      { name: 'Detailed Report (MIS)', desc: 'Full order details with status, weight, and billing info', href: '/analytics/reports/mis', tag: 'Most used' },
      { name: 'Incoming Shipment Report', desc: 'All incoming shipments by branch and date range', href: '/analytics/reports/incoming' },
      { name: 'Pending Shipment Report', desc: 'Orders not yet delivered or in transit', href: '/analytics/reports/pending' },
      { name: 'Daily Followup Report', desc: 'Co-loader daily tracking summary', href: '/analytics/reports/coloader-followup' },
      { name: 'Vendor Bill Report', desc: 'Billing summary grouped by vendor', href: '/analytics/reports/vendor-bill' },
      { name: 'Airport Order Report', desc: 'Airport-specific order tracking', href: '/analytics/reports/airport' },
    ],
  },
  {
    title: 'Runsheets',
    icon: RiTruckLine,
    iconColor: 'bg-success-lighter text-success-base',
    reports: [
      { name: 'Local Runsheet Report', desc: 'Daily local delivery runsheet summary', href: '/analytics/reports/local-runsheet', tag: 'Daily' },
    ],
  },
  {
    title: 'Manifest & Co-loader',
    icon: RiBarChartLine,
    iconColor: 'bg-feature-lighter text-feature-base',
    reports: [
      { name: 'Coloader Report', desc: 'Co-loader wise manifest and forwarding data', href: '/analytics/reports/coloader' },
      { name: 'Weight Difference Report', desc: 'Actual vs charged weight discrepancies', href: '/analytics/reports/weight-diff' },
    ],
  },
  {
    title: 'Users & Assets',
    icon: RiCheckboxCircleLine,
    iconColor: 'bg-warning-lighter text-warning-base',
    reports: [
      { name: 'User Report', desc: 'User activity and login summary by branch', href: '/analytics/reports/user' },
      { name: 'Branch Report', desc: 'Branch-wise order and delivery performance', href: '/analytics/reports/branch' },
      { name: 'Asset Report', desc: 'Logger and temperature box asset inventory', href: '/analytics/reports/asset' },
      { name: 'Asset Inventory Report', desc: 'Detailed asset calibration and usage', href: '/analytics/reports/asset-inventory' },
    ],
  },
  {
    title: 'Validation',
    icon: RiCheckboxCircleLine,
    iconColor: 'bg-error-lighter text-error-base',
    reports: [
      { name: 'Order Status Mismatch Report', desc: 'Orders where system status doesn\'t match actual delivery state', href: '/analytics/reports/status-mismatch' },
    ],
  },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={RiBarChartLine}
        iconColor="bg-feature-lighter text-feature-base"
        title="Reports"
        subtitle="Analytics and insights across all modules"
        breadcrumbs={[{ label: 'Analytics', href: '/analytics/reports' }, { label: 'Reports' }]}
      >
        <Button.Root variant="neutral" mode="stroke" size="small">
          <Button.Icon as={RiDownloadLine} />
          Export All
        </Button.Root>
      </PageHeader>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {REPORT_GROUPS.map(group => (
          <div key={group.title} className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs overflow-hidden">
            <div className="flex items-center gap-3 border-b border-stroke-soft-200 px-5 py-4">
              <div className={`flex size-8 items-center justify-center rounded-xl ${group.iconColor}`}>
                <group.icon size={16} />
              </div>
              <h2 className="text-label-sm text-text-strong-950">{group.title}</h2>
              <span className="ml-auto text-paragraph-xs text-text-sub-600">{group.reports.length} reports</span>
            </div>
            <div className="divide-y divide-stroke-soft-200">
              {group.reports.map(r => (
                <Link
                  key={r.href}
                  href={r.href}
                  className="flex items-center justify-between px-5 py-3.5 no-underline transition hover:bg-bg-weak-50 group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-paragraph-sm font-medium text-text-strong-950 group-hover:text-primary-base transition-colors">
                        {r.name}
                      </span>
                      {r.tag && (
                        <Badge.Root size="small" variant="lighter" color="blue">{r.tag}</Badge.Root>
                      )}
                    </div>
                    <p className="text-paragraph-xs text-text-sub-600 mt-0.5 truncate">{r.desc}</p>
                  </div>
                  <RiArrowRightLine size={14} className="ml-3 shrink-0 text-text-disabled-300 group-hover:text-primary-base transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
