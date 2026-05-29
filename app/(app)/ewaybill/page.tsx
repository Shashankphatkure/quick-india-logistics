import React from 'react';
import * as Button from '@/components/ui/button';
import * as Input from '@/components/ui/input';
import * as Table from '@/components/ui/table';
import * as Badge from '@/components/ui/badge';
import PageHeader from '@/components/page-header';
import StatsStrip from '@/components/stats-strip';
import { RiReceiptLine, RiSearchLine, RiAlertLine } from '@remixicon/react';
import { listEwaybillOrders, countEwaybillOrders, getEwaybillCounts, EWAYBILL_PAGE_SIZE } from '@/lib/db/ewaybill';
import { tenantScope } from '@/lib/tenant';
import PaginationLinks from '@/components/pagination-links';
import { orderStatusLabel } from '@/lib/order-status';
import EwaybillRowActions from './ewaybill-row-actions';

export default async function EwayBillPage({ searchParams }: { searchParams?: { search?: string; missing?: string; page?: string } }) {
  const { orgId, branchIds } = await tenantScope();
  const search = searchParams?.search?.trim() || undefined;
  const onlyMissingPartB = searchParams?.missing === '1';
  const page = Math.max(1, Number(searchParams?.page) || 1);

  const [rows, total, counts] = await Promise.all([
    listEwaybillOrders({ orgId, branchIds, search, page, onlyMissingPartB }),
    countEwaybillOrders({ orgId, branchIds, search, onlyMissingPartB }),
    getEwaybillCounts(orgId, branchIds),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / EWAYBILL_PAGE_SIZE));
  const missingPartB = counts.with_eway - counts.part_b_done;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={RiReceiptLine}
        iconColor="bg-away-lighter text-away-base"
        title="EwayBill"
        subtitle="Orders with e-way bills generated"
        breadcrumbs={[{ label: 'EwayBill' }]}
      />

      <StatsStrip stats={[
        { label: 'Total Orders', value: counts.total, trend: 0, trendLabel: 'all time' },
        { label: 'With EwayBill', value: counts.with_eway, trend: 0, trendLabel: 'all time' },
        { label: 'Missing EwayBill', value: counts.missing, trend: 0, trendLabel: 'needs filing' },
        { label: 'Part B Done', value: counts.part_b_done, trend: 0, trendLabel: 'transport ready' },
      ]} />

      {missingPartB > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-warning-light bg-warning-lighter px-4 py-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-warning-light">
            <RiAlertLine size={16} className="text-warning-dark" />
          </div>
          <div className="flex-1">
            <p className="text-label-sm text-warning-dark">{missingPartB} EwayBills are missing Part B</p>
            <p className="text-paragraph-xs text-warning-base">Part B includes vehicle and transporter details — required before dispatch.</p>
          </div>
          <a href={onlyMissingPartB ? '/ewaybill' : '/ewaybill?missing=1'}
             className="text-paragraph-sm font-medium text-warning-dark no-underline hover:underline">
            {onlyMissingPartB ? 'Show all' : 'Show only missing'}
          </a>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <div className="border-b border-stroke-soft-200 px-4 py-3">
          <form method="GET">
            <input type="hidden" name="missing" value={onlyMissingPartB ? '1' : ''} />
            <Input.Root size="small" className="w-full max-w-xs">
              <Input.Wrapper>
                <Input.Icon as={RiSearchLine} />
                <Input.Input name="search" defaultValue={search ?? ''} placeholder="Search docket or EwayBill no..." />
              </Input.Wrapper>
            </Input.Root>
          </form>
        </div>
        <Table.Root>
          <Table.Header>
            <Table.Row>
              {['Docket No', 'EwayBill No', 'Booking Date', 'Shipper → Consignee', 'Route', 'Mode', 'Order Status', 'Part B'].map(c => <Table.Head key={c}>{c}</Table.Head>)}
              <Table.Head className="text-right">Actions</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {rows.length === 0 ? (
              <Table.Row><Table.Cell colSpan={9} className="py-10 text-center text-paragraph-sm text-text-sub-600">No EwayBill orders found</Table.Cell></Table.Row>
            ) : rows.map(o => (
              <Table.Row key={o.id}>
                <Table.Cell className="h-auto py-3"><span className="text-paragraph-sm font-medium text-primary-base">{o.docket_no}</span></Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-strong-950 font-mono">{o.ewaybill_no}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{o.booking_date}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{o.shipper_name} → {o.consignee_name}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{o.origin} → {o.destination}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{o.mode}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{orderStatusLabel(o.status)}</Table.Cell>
                <Table.Cell className="h-auto py-3">
                  <Badge.Root size="small" variant="lighter" color={o.part_b_done ? 'green' : 'orange'}>
                    {o.part_b_done ? 'Done' : 'Pending'}
                  </Badge.Root>
                  {o.part_b_done && o.part_b_vehicle_no && (
                    <p className="text-paragraph-xs text-text-sub-600 mt-0.5">{o.part_b_vehicle_no}</p>
                  )}
                </Table.Cell>
                <Table.Cell className="h-auto py-3 text-right"><EwaybillRowActions row={o} /></Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
        <div className="flex items-center justify-between border-t border-stroke-soft-200 px-4 py-3">
          <span className="text-paragraph-xs text-text-sub-600">Showing {total === 0 ? 0 : (page-1)*EWAYBILL_PAGE_SIZE+1}-{Math.min(page*EWAYBILL_PAGE_SIZE, total)} of {total}</span>
          <PaginationLinks page={page} totalPages={totalPages} basePath="/ewaybill" query={{ search, missing: onlyMissingPartB ? '1' : undefined }} />
        </div>
      </div>
    </div>
  );
}
