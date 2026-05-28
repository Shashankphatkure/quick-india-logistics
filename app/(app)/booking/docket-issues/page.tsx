import React from 'react';
import Link from 'next/link';
import * as Button from '@/components/ui/button';
import * as Table from '@/components/ui/table';
import * as Badge from '@/components/ui/badge';
import PageHeader from '@/components/page-header';
import StatsStrip from '@/components/stats-strip';
import { RiAlertLine } from '@remixicon/react';
import { many, one } from '@/lib/db';
import { currentOrgId } from '@/lib/tenant';
import { orderStatusLabel } from '@/lib/order-status';
import FilterPopover from '@/components/filter-popover';

type IssueRow = {
  id: string;
  docket_no: string;
  booking_date: string;
  client_name: string | null;
  shipper_name: string;
  consignee_name: string;
  origin: string;
  destination: string;
  status: string;
  current_branch_name: string | null;
};

const ISSUE_STATUSES = ['damaged', 'not_received', 'cancelled'] as const;

export default async function DocketIssuesPage({ searchParams }: { searchParams?: { status?: string; search?: string } }) {
  const orgId = await currentOrgId();
  const status = searchParams?.status?.trim() || null;
  const search = searchParams?.search?.trim() || null;

  const statusFilter = status && (ISSUE_STATUSES as readonly string[]).includes(status)
    ? `o.status = $2`
    : `o.status = any($2::text[])`;
  const statusParam = status && (ISSUE_STATUSES as readonly string[]).includes(status)
    ? status
    : (ISSUE_STATUSES as readonly string[]);

  const rows = await many<IssueRow>(
    `select o.id, o.docket_no,
            to_char(o.booking_date, 'DD-MM-YYYY') as booking_date,
            c.name as client_name,
            o.shipper_name, o.consignee_name, o.origin, o.destination, o.status,
            cb.name as current_branch_name
     from orders o
     left join clients c on c.id = o.client_id
     left join branches cb on cb.id = o.current_branch_id
     where o.org_id = $1
       and ${statusFilter}
       and ($3::text is null or o.docket_no ilike '%' || $3 || '%')
     order by o.updated_at desc
     limit 100`,
    [orgId, statusParam, search],
  );

  const counts = await one<{ damaged: string; not_received: string; cancelled: string; total: string }>(
    `select
       count(*) filter (where status='damaged')::text as damaged,
       count(*) filter (where status='not_received')::text as not_received,
       count(*) filter (where status='cancelled')::text as cancelled,
       count(*) filter (where status = any($2::text[]))::text as total
     from orders where org_id = $1`,
    [orgId, ISSUE_STATUSES as readonly string[]],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        icon={RiAlertLine}
        iconColor="bg-error-lighter text-error-base"
        title="Docket Issues"
        subtitle="Orders flagged as damaged, not received, or cancelled — needs operational follow-up"
        breadcrumbs={[{ label: 'Booking' }, { label: 'Docket Issues' }]}
      >
        <FilterPopover fields={[
          { name: 'status', label: 'Issue Type', type: 'select', options: [
            { value: 'damaged', label: 'Damaged' },
            { value: 'not_received', label: 'Not Received' },
            { value: 'cancelled', label: 'Cancelled' },
          ]},
          { name: 'search', label: 'Docket No', type: 'text', placeholder: 'Search...' },
        ]} />
      </PageHeader>

      <StatsStrip stats={[
        { label: 'Total Issues', value: Number(counts?.total ?? 0), trend: 0, trendLabel: 'all time' },
        { label: 'Damaged', value: Number(counts?.damaged ?? 0), trend: 0, trendLabel: 'damaged' },
        { label: 'Not Received', value: Number(counts?.not_received ?? 0), trend: 0, trendLabel: 'not received' },
        { label: 'Cancelled', value: Number(counts?.cancelled ?? 0), trend: 0, trendLabel: 'cancelled' },
      ]} />

      <div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <Table.Root>
          <Table.Header>
            <Table.Row>{['Docket', 'Date', 'Client', 'Shipper → Consignee', 'Route', 'Current Branch', 'Issue'].map(c => <Table.Head key={c}>{c}</Table.Head>)}</Table.Row>
          </Table.Header>
          <Table.Body>
            {rows.length === 0 ? (
              <Table.Row><Table.Cell colSpan={7} className="py-10 text-center text-paragraph-sm text-text-sub-600">No issues 🎉</Table.Cell></Table.Row>
            ) : rows.map(r => (
              <Table.Row key={r.id}>
                <Table.Cell className="h-auto py-3">
                  <Link href={`/booking/orders/${r.docket_no}`} className="text-paragraph-sm font-medium text-primary-base hover:underline no-underline">{r.docket_no}</Link>
                </Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{r.booking_date}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{r.client_name ?? '—'}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{r.shipper_name} → {r.consignee_name}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{r.origin} → {r.destination}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{r.current_branch_name ?? '—'}</Table.Cell>
                <Table.Cell className="h-auto py-3">
                  <Badge.Root size="small" variant="lighter" color={r.status === 'cancelled' ? 'gray' : 'red'}>
                    {orderStatusLabel(r.status)}
                  </Badge.Root>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </div>
    </div>
  );
}
