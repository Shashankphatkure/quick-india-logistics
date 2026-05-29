import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import * as Button from '@/components/ui/button';
import * as Badge from '@/components/ui/badge';
import * as Table from '@/components/ui/table';
import PageHeader from '@/components/page-header';
import StatsStrip from '@/components/stats-strip';
import { RiArrowLeftLine, RiListCheck2 } from '@remixicon/react';
import { getRunsheetByNo, listRunsheetStops } from '@/lib/db/runsheets';
import { tenantScope } from '@/lib/tenant';
import { orderStatusLabel } from '@/lib/order-status';
import { STATUS_TO_BADGE_COLOR, type BadgeColor } from '@/lib/ui-types';

const STATE_COLOR: Record<string, BadgeColor> = {
  rough: 'gray', final: 'blue', out_for_delivery: 'orange', completed: 'green',
};

export default async function RunsheetDetailPage({ params }: { params: { runsheet_no: string } }) {
  const { orgId, branchIds } = await tenantScope();
  const runsheetNo = decodeURIComponent(params.runsheet_no);
  const runsheet = await getRunsheetByNo(orgId, runsheetNo, branchIds);
  if (!runsheet) notFound();

  const stops = await listRunsheetStops(runsheet.id);
  const delivered = stops.filter((s) => s.status === 'delivered').length;
  const totalWeight = stops.reduce((s, o) => s + Number(o.actual_weight_kg ?? 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={RiListCheck2}
        title={`Runsheet ${runsheet.runsheet_no}`}
        subtitle={`${runsheet.branch_name}${runsheet.route ? ` · ${runsheet.route}` : ''}`}
        breadcrumbs={[{ label: 'Runsheet', href: '/runsheet/all' }, { label: runsheet.runsheet_no }]}
      >
        <Button.Root variant="neutral" mode="stroke" size="small" asChild>
          <Link href="/runsheet/all" className="no-underline"><Button.Icon as={RiArrowLeftLine} />All Runsheets</Link>
        </Button.Root>
        <Badge.Root size="medium" variant="light" color={STATE_COLOR[runsheet.state] ?? 'gray'}>
          <Badge.Dot />{runsheet.state.replace(/_/g, ' ')}
        </Badge.Root>
      </PageHeader>

      <StatsStrip stats={[
        { label: 'Stops', value: stops.length, trend: 0, trendLabel: 'on runsheet' },
        { label: 'Delivered', value: delivered, trend: 0, trendLabel: `of ${stops.length}` },
        { label: 'Pending', value: stops.length - delivered, trend: 0, trendLabel: '' },
        { label: 'Total Wt (kg)', value: totalWeight.toFixed(1), trend: 0, trendLabel: '' },
      ]} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
          <div className="border-b border-stroke-soft-200 px-4 py-3">
            <h3 className="text-label-sm text-text-strong-950">Delivery stops ({stops.length})</h3>
          </div>
          <Table.Root>
            <Table.Header>
              <Table.Row>{['#', 'Docket', 'Consignee', 'Destination', 'Client', 'Wt', 'Pcs', 'Delivered', 'Status'].map(c => <Table.Head key={c}>{c}</Table.Head>)}</Table.Row>
            </Table.Header>
            <Table.Body>
              {stops.length === 0 ? (
                <Table.Row><Table.Cell colSpan={9} className="py-10 text-center text-paragraph-sm text-text-sub-600">No stops on this runsheet</Table.Cell></Table.Row>
              ) : stops.map((o) => {
                const label = orderStatusLabel(o.status);
                return (
                  <Table.Row key={o.id}>
                    <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-disabled-300">{o.sequence_no ?? '—'}</Table.Cell>
                    <Table.Cell className="h-auto py-3">
                      <Link href={`/booking/orders/${o.docket_no}`} className="text-paragraph-sm font-medium text-primary-base hover:underline no-underline">{o.docket_no}</Link>
                    </Table.Cell>
                    <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-strong-950">{o.consignee_name}</Table.Cell>
                    <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{o.destination}</Table.Cell>
                    <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{o.client_name ?? '—'}</Table.Cell>
                    <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{o.actual_weight_kg ?? '—'}</Table.Cell>
                    <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{o.no_of_pieces}</Table.Cell>
                    <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{o.delivered_at ?? '—'}</Table.Cell>
                    <Table.Cell className="h-auto py-3">
                      <Badge.Root size="small" variant="lighter" color={(STATUS_TO_BADGE_COLOR[label] ?? 'gray') as BadgeColor}>{label}</Badge.Root>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table.Root>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 sm:p-5 shadow-regular-xs">
            <h3 className="text-subheading-2xs uppercase tracking-wider text-text-sub-600 mb-3">Runsheet Info</h3>
            <div className="space-y-2">
              {[
                ['Runsheet No', runsheet.runsheet_no],
                ['Date', runsheet.runsheet_date],
                ['Branch', runsheet.branch_name],
                ['Route', runsheet.route ?? '—'],
                ['Vehicle', runsheet.vehicle_no ?? '—'],
                ['Driver', runsheet.driver_name ?? '—'],
                ['Driver Phone', runsheet.driver_phone ?? '—'],
                ['Created By', runsheet.created_by_name ?? '—'],
              ].map(([l, v]) => (
                <div key={l} className="flex items-start justify-between gap-3">
                  <span className="text-paragraph-sm text-text-sub-600 shrink-0">{l}</span>
                  <span className="text-paragraph-sm font-medium text-text-strong-950 text-right">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
