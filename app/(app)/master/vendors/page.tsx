import React from 'react';
import * as Button from '@/components/ui/button';
import * as Input from '@/components/ui/input';
import * as Table from '@/components/ui/table';
import * as Badge from '@/components/ui/badge';
import PageHeader from '@/components/page-header';
import StatsStrip from '@/components/stats-strip';
import { RiSearchLine, RiTruckLine } from '@remixicon/react';
import FilterPopover from '@/components/filter-popover';
import { STATUS_TO_BADGE_COLOR, type BadgeColor } from '@/lib/ui-types';
import { listVendors, countVendors, getVendorCounts } from '@/lib/db/vendors';
import { currentOrgId } from '@/lib/tenant';
import PaginationLinks from '@/components/pagination-links';
import AddVendorForm from './add-vendor-form';
import RowActions from './row-actions';

const PAGE_SIZE = 25;

const STATUS_LABEL: Record<string, string> = {
  approved: 'Approved',
  pending: 'Pending',
  rejected: 'Rejected',
};

const REGION_LABEL: Record<string, string> = {
  pan_india: 'Pan India',
  state: 'State',
  city: 'City',
};

export default async function VendorsPage({ searchParams }: { searchParams?: { search?: string; page?: string } }) {
  const orgId = await currentOrgId();
  const search = searchParams?.search?.trim() || undefined;
  const page = Math.max(1, Number(searchParams?.page) || 1);

  const [rows, total, counts] = await Promise.all([
    listVendors({ orgId, search, page, pageSize: PAGE_SIZE }),
    countVendors({ orgId, search }),
    getVendorCounts(orgId),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <PageHeader
        icon={RiTruckLine}
        iconColor="bg-faded-lighter text-faded-base"
        title="Vendors"
        subtitle="Manage third-party logistics vendors"
        breadcrumbs={[{ label: 'Master', href: '/master/vendors' }, { label: 'Vendors' }]}
      >
        <FilterPopover fields={[
          { name: 'search', label: 'Vendor Name', type: 'text', placeholder: 'Search...' },
        ]} />
        <AddVendorForm />
      </PageHeader>

      <StatsStrip stats={[
        { label: 'Total Vendors', value: counts.total, trend: 0, trendLabel: 'all time' },
        { label: 'Approved', value: counts.approved, trend: 0, trendLabel: 'all time' },
        { label: 'Pending', value: counts.pending, trend: 0, trendLabel: 'all time' },
        { label: 'Pan India', value: counts.pan_india, trend: 0, trendLabel: 'all time' },
      ]} />

      <div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <div className="border-b border-stroke-soft-200 px-4 py-3">
          <form method="GET">
            <Input.Root size="small" className="w-full max-w-xs">
              <Input.Wrapper>
                <Input.Icon as={RiSearchLine} />
                <Input.Input name="search" defaultValue={search ?? ''} placeholder="Search vendors..." />
              </Input.Wrapper>
            </Input.Root>
          </form>
        </div>
        <Table.Root>
          <Table.Header>
            <Table.Row>
              {['Vendor Name', 'PAN', 'Email', 'Phone', 'Company Type', 'Service Region', 'Line of Business', 'Verified By', 'Status'].map(c => (
                <Table.Head key={c}>{c}</Table.Head>
              ))}
              <Table.Head className="text-right">Actions</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {rows.length === 0 ? (
              <Table.Row><Table.Cell colSpan={10} className="py-10 text-center text-paragraph-sm text-text-sub-600">No vendors found</Table.Cell></Table.Row>
            ) : rows.map(v => (
              <Table.Row key={v.id} className={v.is_active ? '' : 'opacity-60'}>
                <Table.Cell className="h-auto py-3"><span className="text-paragraph-sm font-medium text-primary-base">{v.name}{!v.is_active && <span className="ml-1.5 text-paragraph-xs text-text-soft-400">(inactive)</span>}</span></Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{v.pan ?? '—'}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{v.primary_email ?? '—'}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{v.primary_phone ?? '—'}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{v.company_type ?? '—'}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{REGION_LABEL[v.service_region ?? ''] ?? '—'}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{v.line_of_business ?? '—'}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{v.verified_by_name ?? '—'}</Table.Cell>
                <Table.Cell className="h-auto py-3">
                  <Badge.Root size="medium" variant="light" color={(STATUS_TO_BADGE_COLOR[STATUS_LABEL[v.status] ?? v.status] ?? 'gray') as BadgeColor}>
                    <Badge.Dot />{STATUS_LABEL[v.status] ?? v.status}
                  </Badge.Root>
                </Table.Cell>
                <Table.Cell className="h-auto py-3 text-right"><RowActions row={v} /></Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
        <div className="flex items-center justify-between border-t border-stroke-soft-200 px-4 py-3">
          <span className="text-paragraph-xs text-text-sub-600">Showing {total === 0 ? 0 : (page-1)*PAGE_SIZE+1}-{Math.min(page*PAGE_SIZE, total)} of {total}</span>
          <PaginationLinks page={page} totalPages={totalPages} basePath="/master/vendors" query={{ search }} />
        </div>
      </div>
    </div>
  );
}
