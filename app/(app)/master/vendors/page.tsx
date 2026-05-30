import React from 'react';
import * as Input from '@/components/ui/input';
import PageHeader from '@/components/page-header';
import StatsStrip from '@/components/stats-strip';
import { RiSearchLine, RiTruckLine } from '@remixicon/react';
import FilterPopover from '@/components/filter-popover';
import { listVendors, countVendors, getVendorCounts } from '@/lib/db/vendors';
import { currentOrgId } from '@/lib/tenant';
import PaginationLinks from '@/components/pagination-links';
import AddVendorForm from './add-vendor-form';
import VendorsTable from './vendors-table';

const PAGE_SIZE = 25;

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
        <div className="p-3">
          <VendorsTable rows={rows} />
        </div>
        <div className="flex items-center justify-between border-t border-stroke-soft-200 px-4 py-3">
          <span className="text-paragraph-xs text-text-sub-600">Showing {total === 0 ? 0 : (page-1)*PAGE_SIZE+1}-{Math.min(page*PAGE_SIZE, total)} of {total}</span>
          <PaginationLinks page={page} totalPages={totalPages} basePath="/master/vendors" query={{ search }} />
        </div>
      </div>
    </div>
  );
}
