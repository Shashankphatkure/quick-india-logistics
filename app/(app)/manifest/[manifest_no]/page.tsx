import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import * as Button from '@/components/ui/button';
import * as Badge from '@/components/ui/badge';
import * as Table from '@/components/ui/table';
import PageHeader from '@/components/page-header';
import StatsStrip from '@/components/stats-strip';
import { RiArrowLeftLine, RiFilePaperLine, RiArrowRightLine } from '@remixicon/react';
import { getManifestByNo, listManifestOrders } from '@/lib/db/manifests';
import { tenantScope } from '@/lib/tenant';
import { orderStatusLabel } from '@/lib/order-status';
import { STATUS_TO_BADGE_COLOR, type BadgeColor } from '@/lib/ui-types';

const MODE_LABEL: Record<string, string> = {
  local: 'Local', air: 'Air', surface: 'Surface', cargo: 'Cargo',
  train: 'Train', courier: 'Courier', warehouse: 'Warehouse', hub_transfer: 'Hub Transfer',
};

const STATE_COLOR: Record<string, BadgeColor> = {
  rough: 'gray', final: 'blue', departed: 'orange', arrived: 'purple', received: 'green',
};

export default async function ManifestDetailPage({ params }: { params: { manifest_no: string } }) {
  const { orgId, branchIds } = await tenantScope();
  const manifestNo = decodeURIComponent(params.manifest_no);
  const manifest = await getManifestByNo(orgId, manifestNo, branchIds);
  if (!manifest) notFound();

  const orders = await listManifestOrders(manifest.id);
  const totalWeight = orders.reduce((s, o) => s + Number(o.chargeable_weight_kg ?? 0), 0);
  const totalPcs = orders.reduce((s, o) => s + (o.no_of_pieces ?? 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={RiFilePaperLine}
        title={`Manifest ${manifest.manifest_no}`}
        subtitle={`${manifest.from_branch_name} → ${manifest.to_branch_name} · ${MODE_LABEL[manifest.mode] ?? manifest.mode}`}
        breadcrumbs={[{ label: 'Manifest', href: '/manifest/all' }, { label: manifest.manifest_no }]}
      >
        <Button.Root variant="neutral" mode="stroke" size="small" asChild>
          <Link href="/manifest/all" className="no-underline"><Button.Icon as={RiArrowLeftLine} />All Manifests</Link>
        </Button.Root>
        <Badge.Root size="medium" variant="light" color={STATE_COLOR[manifest.state] ?? 'gray'}>
          <Badge.Dot />{manifest.state}
        </Badge.Root>
      </PageHeader>

      <StatsStrip stats={[
        { label: 'Orders', value: orders.length, trend: 0, trendLabel: 'on manifest' },
        { label: 'Total Pieces', value: totalPcs, trend: 0, trendLabel: '' },
        { label: 'Chargeable Wt (kg)', value: totalWeight.toFixed(1), trend: 0, trendLabel: '' },
        { label: 'Bags / Boxes', value: `${manifest.total_bags} / ${manifest.total_boxes}`, trend: 0, trendLabel: '' },
      ]} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
          <div className="border-b border-stroke-soft-200 px-4 py-3">
            <h3 className="text-label-sm text-text-strong-950">Orders on this manifest ({orders.length})</h3>
          </div>
          <Table.Root>
            <Table.Header>
              <Table.Row>{['Docket', 'Route', 'Shipper → Consignee', 'Client', 'Wt', 'Pcs', 'Status'].map(c => <Table.Head key={c}>{c}</Table.Head>)}</Table.Row>
            </Table.Header>
            <Table.Body>
              {orders.length === 0 ? (
                <Table.Row><Table.Cell colSpan={7} className="py-10 text-center text-paragraph-sm text-text-sub-600">No orders on this manifest</Table.Cell></Table.Row>
              ) : orders.map(o => {
                const label = orderStatusLabel(o.status);
                return (
                  <Table.Row key={o.id}>
                    <Table.Cell className="h-auto py-3">
                      <Link href={`/booking/orders/${o.docket_no}`} className="text-paragraph-sm font-medium text-primary-base hover:underline no-underline">{o.docket_no}</Link>
                    </Table.Cell>
                    <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{o.origin} → {o.destination}</Table.Cell>
                    <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{o.shipper_name} → {o.consignee_name}</Table.Cell>
                    <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{o.client_name ?? '—'}</Table.Cell>
                    <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{o.chargeable_weight_kg ?? '—'}</Table.Cell>
                    <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{o.no_of_pieces}</Table.Cell>
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
          <Card title="Manifest Info">
            <Row label="Manifest No" value={manifest.manifest_no} />
            <Row label="Date" value={manifest.manifest_date} />
            <Row label="Mode" value={MODE_LABEL[manifest.mode] ?? manifest.mode} />
            <Row label="From" value={manifest.from_branch_name} />
            <Row label="To" value={manifest.to_branch_name} />
          </Card>
          <Card title="Forwarding">
            <Row label="Vendor" value={manifest.vendor_name ?? '—'} />
            <Row label="AWB" value={manifest.airway_bill_no ?? '—'} />
            <Row label="Vehicle" value={manifest.vehicle_no ?? '—'} />
            <Row label="Rate" value={manifest.rate_per_kg ? `₹${manifest.rate_per_kg}/kg` : '—'} />
            <Row label="Coloader Wt" value={manifest.coloader_chargeable_kg ? `${manifest.coloader_chargeable_kg} kg` : '—'} />
          </Card>
          <Card title="Timeline">
            <Row label="Forwarded" value={manifest.forwarding_date ?? '—'} />
            <Row label="Departed" value={manifest.departed_at ?? '—'} />
            <Row label="Received" value={manifest.received_at ?? '—'} />
            <Row label="Created By" value={manifest.created_by_name ?? '—'} />
          </Card>
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 sm:p-5 shadow-regular-xs">
      <h3 className="text-subheading-2xs uppercase tracking-wider text-text-sub-600 mb-3">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-paragraph-sm text-text-sub-600 shrink-0">{label}</span>
      <span className="text-paragraph-sm font-medium text-text-strong-950 text-right">{value}</span>
    </div>
  );
}
