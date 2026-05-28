import React from 'react';
import * as Button from '@/components/ui/button';
import * as Table from '@/components/ui/table';
import PageHeader from '@/components/page-header';
import StatsStrip from '@/components/stats-strip';
import { RiFilterLine, RiFilePaperLine } from '@remixicon/react';
import { many, one } from '@/lib/db';
import { currentOrgId } from '@/lib/tenant';
import PaginationLinks from '@/components/pagination-links';
import ManifestTabs from '@/components/manifest-tabs';
import DepartButton from './depart-button';

const PAGE_SIZE = 25;
const MODE_LABEL: Record<string, string> = {
  local: 'Local', air: 'Air', surface: 'Surface', cargo: 'Cargo',
  train: 'Train', courier: 'Courier', warehouse: 'Warehouse', hub_transfer: 'Hub Transfer',
};

type Row = {
  id: string; manifest_no: string; manifest_date: string;
  to_branch_name: string; mode: string;
  vendor_name: string | null; vehicle_no: string | null; airway_bill_no: string | null;
  order_count: number;
};

export default async function PendingDepartPage({ searchParams }: { searchParams?: { page?: string } }) {
  const orgId = await currentOrgId();
  const page = Math.max(1, Number(searchParams?.page) || 1);

  const rows = await many<Row>(
    `select m.id, m.manifest_no,
            to_char(m.manifest_date, 'DD-MM-YYYY') as manifest_date,
            tb.name as to_branch_name, m.mode,
            v.name as vendor_name, m.vehicle_no, m.airway_bill_no,
            (select count(*)::int from manifest_orders mo where mo.manifest_id = m.id) as order_count
     from manifests m
     join branches tb on tb.id = m.to_branch_id
     left join vendors v on v.id = m.vendor_id
     where m.org_id=$1 and m.state='final'
       and (m.vehicle_no is not null or m.airway_bill_no is not null)
     order by m.manifest_date desc
     limit $2 offset $3`,
    [orgId, PAGE_SIZE, (page - 1) * PAGE_SIZE],
  );
  const cnt = await one<{ n: string }>(
    `select count(*)::text as n from manifests where org_id=$1 and state='final'
     and (vehicle_no is not null or airway_bill_no is not null)`,
    [orgId],
  );
  const total = Number(cnt?.n ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <PageHeader
        icon={RiFilePaperLine}
        iconColor="bg-warning-lighter text-warning-base"
        title="Pending To Depart"
        subtitle="Manifests with vehicle / AWB assigned, awaiting physical depart"
        breadcrumbs={[{ label: 'Manifest', href: '/manifest/pending-depart' }, { label: 'Pending To Depart' }]}
      >
        <Button.Root variant="neutral" mode="stroke" size="small">
          <Button.Icon as={RiFilterLine} />Filter
        </Button.Root>
      </PageHeader>

      <StatsStrip stats={[
        { label: 'Awaiting Depart', value: total, trend: 0, trendLabel: 'now' },
        { label: 'Orders Inside', value: rows.reduce((s, r) => s + r.order_count, 0), trend: 0, trendLabel: 'this page' },
        { label: 'On Page', value: rows.length, trend: 0, trendLabel: 'now' },
        { label: 'Pages', value: totalPages, trend: 0, trendLabel: '' },
      ]} />

      <ManifestTabs active="/manifest/pending-depart" />

      <div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <Table.Root>
          <Table.Header>
            <Table.Row>{['Manifest No', 'Date', 'Destination', 'Mode', 'Vendor', 'AWB', 'Vehicle', 'Orders', 'Action'].map(c => <Table.Head key={c}>{c}</Table.Head>)}</Table.Row>
          </Table.Header>
          <Table.Body>
            {rows.length === 0 ? (
              <Table.Row><Table.Cell colSpan={9} className="py-10 text-center text-paragraph-sm text-text-sub-600">No manifests pending depart</Table.Cell></Table.Row>
            ) : rows.map(m => (
              <Table.Row key={m.id}>
                <Table.Cell className="h-auto py-3"><span className="text-paragraph-sm font-medium text-primary-base">{m.manifest_no}</span></Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{m.manifest_date}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{m.to_branch_name}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{MODE_LABEL[m.mode] ?? m.mode}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{m.vendor_name ?? '—'}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-strong-950 font-mono">{m.airway_bill_no ?? '—'}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{m.vehicle_no ?? '—'}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{m.order_count}</Table.Cell>
                <Table.Cell className="h-auto py-3"><DepartButton manifestId={m.id} /></Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
        <div className="flex items-center justify-between border-t border-stroke-soft-200 px-4 py-3">
          <span className="text-paragraph-xs text-text-sub-600">Showing {total === 0 ? 0 : (page-1)*PAGE_SIZE+1}-{Math.min(page*PAGE_SIZE, total)} of {total}</span>
          <PaginationLinks page={page} totalPages={totalPages} basePath="/manifest/pending-depart" query={{}} />
        </div>
      </div>
    </div>
  );
}
