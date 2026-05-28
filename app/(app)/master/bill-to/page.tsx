import React from 'react';
import * as Button from '@/components/ui/button';
import * as Input from '@/components/ui/input';
import * as Table from '@/components/ui/table';
import * as Badge from '@/components/ui/badge';
import PageHeader from '@/components/page-header';
import StatsStrip from '@/components/stats-strip';
import { RiAddLine, RiSearchLine, RiFilterLine, RiUserStarLine } from '@remixicon/react';
import {
  listBillTos, countBillTos, getBillToCounts, listClientsByBillTo,
  BILL_TO_PAGE_SIZE,
} from '@/lib/db/bill-to';
import { currentOrgId } from '@/lib/tenant';
import PaginationLinks from '@/components/pagination-links';

const USE_DIM_LABEL: Record<string, string> = {
  use_kg: 'Use kg', dont_use: "Don't use", use_box: 'Use box',
};

export default async function BillToPage({ searchParams }: { searchParams?: { search?: string; page?: string } }) {
  const orgId = await currentOrgId();
  const search = searchParams?.search?.trim() || undefined;
  const page = Math.max(1, Number(searchParams?.page) || 1);

  const [billTos, total, counts] = await Promise.all([
    listBillTos({ orgId, search, page }),
    countBillTos({ orgId, search }),
    getBillToCounts(orgId),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / BILL_TO_PAGE_SIZE));

  // Get clients for each bill-to in parallel
  const clientsByBillTo = await Promise.all(
    billTos.map(async (b) => ({ id: b.id, clients: await listClientsByBillTo(b.id) })),
  );
  const clientsMap = Object.fromEntries(clientsByBillTo.map((x) => [x.id, x.clients]));

  return (
    <div className="space-y-6">
      <PageHeader
        icon={RiUserStarLine}
        iconColor="bg-feature-lighter text-feature-base"
        title="Bill-To"
        subtitle="Entities QIL invoices — each can have many Clients underneath (CFA pattern)"
        breadcrumbs={[{ label: 'Master', href: '/master/bill-to' }, { label: 'Bill-To' }]}
      >
        <Button.Root variant="neutral" mode="stroke" size="small">
          <Button.Icon as={RiFilterLine} />Filter
        </Button.Root>
        <Button.Root size="small">
          <Button.Icon as={RiAddLine} />Add Bill-To
        </Button.Root>
      </PageHeader>

      <StatsStrip stats={[
        { label: 'Total Bill-To', value: counts.total, trend: 0, trendLabel: 'all time' },
        { label: 'Active', value: counts.active, trend: 0, trendLabel: 'all time' },
        { label: 'ETA Applicable', value: counts.eta, trend: 0, trendLabel: 'all time' },
        { label: 'Monthly Billing', value: counts.monthly, trend: 0, trendLabel: 'all time' },
      ]} />

      <div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <div className="border-b border-stroke-soft-200 px-4 py-3">
          <form method="GET">
            <Input.Root size="small" className="w-full max-w-xs">
              <Input.Wrapper>
                <Input.Icon as={RiSearchLine} />
                <Input.Input name="search" defaultValue={search ?? ''} placeholder="Search bill-to..." />
              </Input.Wrapper>
            </Input.Root>
          </form>
        </div>
        <Table.Root>
          <Table.Header>
            <Table.Row>{['Name', 'Legal Name', 'PAN', 'Contact', 'Clients', 'GSTs', 'Cycle', 'Status'].map(c => <Table.Head key={c}>{c}</Table.Head>)}</Table.Row>
          </Table.Header>
          <Table.Body>
            {billTos.length === 0 ? (
              <Table.Row><Table.Cell colSpan={8} className="py-10 text-center text-paragraph-sm text-text-sub-600">No bill-to found</Table.Cell></Table.Row>
            ) : billTos.map(b => (
              <React.Fragment key={b.id}>
                <Table.Row>
                  <Table.Cell className="h-auto py-3"><span className="text-paragraph-sm font-medium text-primary-base">{b.name}</span></Table.Cell>
                  <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{b.legal_name ?? '—'}</Table.Cell>
                  <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-strong-950 font-mono">{b.pan ?? '—'}</Table.Cell>
                  <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">
                    {b.contact_person ?? '—'}
                    {b.contact_email && <div className="text-text-disabled-300">{b.contact_email}</div>}
                  </Table.Cell>
                  <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">
                    <Badge.Root size="small" variant="lighter" color={b.client_count > 0 ? 'blue' : 'gray'}>{b.client_count}</Badge.Root>
                  </Table.Cell>
                  <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{b.gst_count}</Table.Cell>
                  <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600 capitalize">{b.billing_cycle ?? '—'}</Table.Cell>
                  <Table.Cell className="h-auto py-3">
                    <Badge.Root size="medium" variant="light" color={b.is_active ? 'green' : 'gray'}>
                      <Badge.Dot />{b.is_active ? 'Active' : 'Inactive'}
                    </Badge.Root>
                  </Table.Cell>
                </Table.Row>
                {(clientsMap[b.id] ?? []).length > 0 && (
                  <Table.Row>
                    <Table.Cell colSpan={8} className="h-auto py-2 px-4 bg-bg-weak-50">
                      <div className="ml-6 border-l-2 border-stroke-sub-300 pl-3 py-1">
                        <p className="text-subheading-2xs uppercase tracking-wider text-text-sub-600 mb-1.5">Clients under this Bill-To</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-1.5">
                          {(clientsMap[b.id] ?? []).map(c => (
                            <div key={c.id} className="flex items-center justify-between gap-2 text-paragraph-sm">
                              <span className="text-text-strong-950 font-medium">{c.name}</span>
                              <span className="text-paragraph-xs text-text-disabled-300">{USE_DIM_LABEL[c.use_dimension] ?? c.use_dimension}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                )}
              </React.Fragment>
            ))}
          </Table.Body>
        </Table.Root>
        <div className="flex items-center justify-between border-t border-stroke-soft-200 px-4 py-3">
          <span className="text-paragraph-xs text-text-sub-600">Showing {total === 0 ? 0 : (page-1)*BILL_TO_PAGE_SIZE+1}-{Math.min(page*BILL_TO_PAGE_SIZE, total)} of {total}</span>
          <PaginationLinks page={page} totalPages={totalPages} basePath="/master/bill-to" query={{ search }} />
        </div>
      </div>
    </div>
  );
}
