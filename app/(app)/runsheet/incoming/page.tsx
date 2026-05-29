import React from 'react';
import Link from 'next/link';
import * as Button from '@/components/ui/button';
import * as Table from '@/components/ui/table';
import * as Badge from '@/components/ui/badge';
import PageHeader from '@/components/page-header';
import StatsStrip from '@/components/stats-strip';
import { RiListCheck2 } from '@remixicon/react';
import FilterPopover from '@/components/filter-popover';
import { many } from '@/lib/db';
import { currentOrgId } from '@/lib/tenant';
import { getSession } from '@/lib/auth';
import PaginationLinks from '@/components/pagination-links';
import RunsheetTabs from '@/components/runsheet-tabs';

const PAGE_SIZE = 25;

type Row = {
  id: string;
  runsheet_no: string;
  runsheet_date: string;
  branch_name: string;
  route: string | null;
  vehicle_no: string | null;
  driver_name: string | null;
  order_count: number;
  state: string;
};

export default async function IncomingRunsheetPage({ searchParams }: { searchParams?: { page?: string } }) {
  const orgId = await currentOrgId();
  const page = Math.max(1, Number(searchParams?.page) || 1);
  const session = await getSession();
  const myBranchId = session?.homeBranchId ?? session?.branchIds[0];

  let rows: Row[] = [];
  let total = 0;
  if (myBranchId) {
    rows = await many<Row>(
      `select r.id, r.runsheet_no,
              to_char(r.runsheet_date, 'DD-MM-YYYY') as runsheet_date,
              b.name as branch_name, r.route, r.vehicle_no, r.driver_name, r.state,
              (select count(*)::int from runsheet_orders ro where ro.runsheet_id = r.id) as order_count
       from runsheets r
       join branches b on b.id = r.branch_id
       where r.org_id=$1 and r.branch_id=$2 and r.state in ('out_for_delivery', 'final')
       order by r.runsheet_date desc
       limit $3 offset $4`,
      [orgId, myBranchId, PAGE_SIZE, (page - 1) * PAGE_SIZE],
    );
    const r = await many<{ n: string }>(
      `select count(*)::text as n from runsheets where org_id=$1 and branch_id=$2 and state in ('out_for_delivery', 'final')`,
      [orgId, myBranchId],
    );
    total = Number(r[0]?.n ?? 0);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={RiListCheck2}
        iconColor="bg-information-lighter text-information-base"
        title="Incoming Runsheet"
        subtitle={`Runsheets active at your branch${myBranchId ? '' : ' — no branch assigned'}`}
        breadcrumbs={[{ label: 'Runsheet', href: '/runsheet/incoming' }, { label: 'Incoming' }]}
      >
        <FilterPopover fields={[]} />
      </PageHeader>

      <StatsStrip stats={[
        { label: 'Active at My Branch', value: total, trend: 0, trendLabel: 'now' },
        { label: 'Orders Inside', value: rows.reduce((s, r) => s + r.order_count, 0), trend: 0, trendLabel: 'this page' },
        { label: 'On Page', value: rows.length, trend: 0, trendLabel: 'now' },
        { label: 'My Branch', value: rows[0]?.branch_name ?? '—', trend: 0, trendLabel: '' },
      ]} />

      <RunsheetTabs active="/runsheet/incoming" />

      <div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <Table.Root>
          <Table.Header>
            <Table.Row>{['Runsheet No', 'Date', 'Route', 'Vehicle', 'Driver', 'Orders', 'State'].map(c => <Table.Head key={c}>{c}</Table.Head>)}</Table.Row>
          </Table.Header>
          <Table.Body>
            {rows.length === 0 ? (
              <Table.Row><Table.Cell colSpan={7} className="py-10 text-center text-paragraph-sm text-text-sub-600">No incoming runsheets</Table.Cell></Table.Row>
            ) : rows.map(r => (
              <Table.Row key={r.id}>
                <Table.Cell className="h-auto py-3"><Link href={`/runsheet/${r.runsheet_no}`} className="text-paragraph-sm font-medium text-primary-base hover:underline no-underline">{r.runsheet_no}</Link></Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{r.runsheet_date}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{r.route ?? '—'}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{r.vehicle_no ?? '—'}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{r.driver_name ?? '—'}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{r.order_count}</Table.Cell>
                <Table.Cell className="h-auto py-3"><Badge.Root size="small" variant="lighter" color="orange">{r.state}</Badge.Root></Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </div>
    </div>
  );
}
