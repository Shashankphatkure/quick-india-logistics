import React from 'react';
import * as Button from '@/components/ui/button';
import * as Input from '@/components/ui/input';
import * as Table from '@/components/ui/table';
import * as Badge from '@/components/ui/badge';
import PageHeader from '@/components/page-header';
import StatsStrip from '@/components/stats-strip';
import { RiBarChart2Line, RiDownloadLine, RiSearchLine } from '@remixicon/react';
import { many, one } from '@/lib/db';
import { currentOrgId } from '@/lib/tenant';
import { orderStatusLabel } from '@/lib/order-status';
import PaginationLinks from '@/components/pagination-links';

const PAGE_SIZE = 25;

type Row = {
  id: string;
  docket_no: string;
  booking_date: string;
  client_name: string | null;
  shipper_name: string;
  consignee_name: string;
  origin: string;
  destination: string;
  mode: string;
  status: string;
  actual_weight_kg: string | null;
  invoice_value: string | null;
};

export default async function AnalyticsReportsPage({ searchParams }: { searchParams?: { from?: string; to?: string; client?: string; mode?: string; page?: string } }) {
  const orgId = await currentOrgId();
  const from = searchParams?.from || new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const to = searchParams?.to || new Date().toISOString().slice(0, 10);
  const client = searchParams?.client?.trim() || null;
  const mode = searchParams?.mode || null;
  const page = Math.max(1, Number(searchParams?.page) || 1);

  // Lookup clients for filter dropdown
  const clientOptions = await many<{ id: string; name: string }>(
    `select c.id, c.name from clients c join bill_to bt on bt.id = c.bill_to_id where bt.org_id = $1 order by c.name`,
    [orgId],
  );

  const where = `o.org_id = $1
    and o.booking_date between $2::date and $3::date
    and ($4::uuid is null or o.client_id = $4::uuid)
    and ($5::text is null or o.mode = $5)`;

  const rows = await many<Row>(
    `select o.id, o.docket_no,
            to_char(o.booking_date, 'DD-MM-YYYY') as booking_date,
            c.name as client_name,
            o.shipper_name, o.consignee_name, o.origin, o.destination,
            o.mode, o.status,
            o.actual_weight_kg::text, o.invoice_value::text
     from orders o left join clients c on c.id = o.client_id
     where ${where}
     order by o.booking_date desc
     limit $6 offset $7`,
    [orgId, from, to, client, mode, PAGE_SIZE, (page - 1) * PAGE_SIZE],
  );

  const totals = await one<{ count: string; weight: string; value: string; delivered: string }>(
    `select count(*)::text as count,
            coalesce(sum(actual_weight_kg), 0)::text as weight,
            coalesce(sum(invoice_value), 0)::text as value,
            count(*) filter (where status='delivered')::text as delivered
     from orders o where ${where}`,
    [orgId, from, to, client, mode],
  );
  const total = Number(totals?.count ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <PageHeader
        icon={RiBarChart2Line}
        iconColor="bg-feature-lighter text-feature-base"
        title="Reports"
        subtitle="Filter shipments by date range, client, mode"
        breadcrumbs={[{ label: 'Analytics' }, { label: 'Reports' }]}
      >
        <Button.Root variant="neutral" mode="stroke" size="small">
          <Button.Icon as={RiDownloadLine} />Export CSV
        </Button.Root>
      </PageHeader>

      <StatsStrip stats={[
        { label: 'Orders in Range', value: total, trend: 0, trendLabel: 'matching filter' },
        { label: 'Delivered', value: Number(totals?.delivered ?? 0), trend: 0, trendLabel: 'in range' },
        { label: 'Total Weight (kg)', value: Number(totals?.weight ?? 0).toFixed(1), trend: 0, trendLabel: 'in range' },
        { label: 'Total Value (₹)', value: Number(totals?.value ?? 0).toLocaleString('en-IN'), trend: 0, trendLabel: 'in range' },
      ]} />

      <form method="GET" className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-regular-xs">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-paragraph-xs text-text-sub-600">From Date</label>
            <Input.Root size="small">
              <Input.Wrapper>
                <Input.Input type="date" name="from" defaultValue={from} />
              </Input.Wrapper>
            </Input.Root>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-paragraph-xs text-text-sub-600">To Date</label>
            <Input.Root size="small">
              <Input.Wrapper>
                <Input.Input type="date" name="to" defaultValue={to} />
              </Input.Wrapper>
            </Input.Root>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-paragraph-xs text-text-sub-600">Client</label>
            <select name="client" defaultValue={client ?? ''} className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-2 py-1.5 text-paragraph-sm text-text-strong-950">
              <option value="">All Clients</option>
              {clientOptions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-paragraph-xs text-text-sub-600">Mode</label>
            <select name="mode" defaultValue={mode ?? ''} className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-2 py-1.5 text-paragraph-sm text-text-strong-950">
              <option value="">All Modes</option>
              <option value="air">Air</option>
              <option value="surface">Surface</option>
              <option value="cargo">Cargo</option>
              <option value="train">Train</option>
              <option value="local">Local</option>
              <option value="courier">Courier</option>
              <option value="warehouse">Warehouse</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button.Root size="small" type="submit" className="w-full">
              <Button.Icon as={RiSearchLine} />Apply Filters
            </Button.Root>
          </div>
        </div>
      </form>

      <div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <Table.Root>
          <Table.Header>
            <Table.Row>{['Docket', 'Date', 'Client', 'Shipper → Consignee', 'Route', 'Mode', 'Weight (kg)', 'Value (₹)', 'Status'].map(c => <Table.Head key={c}>{c}</Table.Head>)}</Table.Row>
          </Table.Header>
          <Table.Body>
            {rows.length === 0 ? (
              <Table.Row><Table.Cell colSpan={9} className="py-10 text-center text-paragraph-sm text-text-sub-600">No orders match the filter</Table.Cell></Table.Row>
            ) : rows.map(r => (
              <Table.Row key={r.id}>
                <Table.Cell className="h-auto py-3"><span className="text-paragraph-sm font-medium text-primary-base">{r.docket_no}</span></Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{r.booking_date}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{r.client_name ?? '—'}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{r.shipper_name} → {r.consignee_name}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{r.origin} → {r.destination}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600 capitalize">{r.mode}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{r.actual_weight_kg ?? '—'}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{r.invoice_value ? Number(r.invoice_value).toLocaleString('en-IN') : '—'}</Table.Cell>
                <Table.Cell className="h-auto py-3">
                  <Badge.Root size="small" variant="lighter" color={r.status === 'delivered' ? 'green' : r.status === 'cancelled' ? 'red' : 'blue'}>
                    {orderStatusLabel(r.status)}
                  </Badge.Root>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
        <div className="flex items-center justify-between border-t border-stroke-soft-200 px-4 py-3">
          <span className="text-paragraph-xs text-text-sub-600">Showing {total === 0 ? 0 : (page-1)*PAGE_SIZE+1}-{Math.min(page*PAGE_SIZE, total)} of {total}</span>
          <PaginationLinks page={page} totalPages={totalPages} basePath="/analytics/reports" query={{ from, to, client: client ?? undefined, mode: mode ?? undefined }} />
        </div>
      </div>
    </div>
  );
}
