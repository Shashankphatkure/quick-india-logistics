import React from 'react';
import * as Input from '@/components/ui/input';
import PageHeader from '@/components/page-header';
import StatsStrip from '@/components/stats-strip';
import { RiSearchLine, RiCarLine } from '@remixicon/react';
import FilterPopover from '@/components/filter-popover';
import { listVehicles, countVehicles, getVehicleCounts, VEHICLE_PAGE_SIZE } from '@/lib/db/vehicles';
import { currentOrgId } from '@/lib/tenant';
import PaginationLinks from '@/components/pagination-links';
import AddVehicleForm from './add-vehicle-form';
import VehiclesTable from './vehicles-table';

export default async function VehiclesPage({ searchParams }: { searchParams?: { search?: string; page?: string } }) {
  const orgId = await currentOrgId();
  const search = searchParams?.search?.trim() || undefined;
  const page = Math.max(1, Number(searchParams?.page) || 1);

  const [rows, total, counts] = await Promise.all([
    listVehicles({ orgId, search, page }),
    countVehicles({ orgId, search }),
    getVehicleCounts(orgId),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / VEHICLE_PAGE_SIZE));

  return (
    <div className="space-y-6">
      <PageHeader
        icon={RiCarLine}
        iconColor="bg-information-lighter text-information-base"
        title="Vehicles"
        subtitle="Manage owned, partner and market vehicles"
        breadcrumbs={[{ label: 'Master', href: '/master/vehicles' }, { label: 'Vehicles' }]}
      >
        <FilterPopover fields={[
          { name: 'search', label: 'Vehicle No / Model', type: 'text', placeholder: 'MH...' },
        ]} />
        <AddVehicleForm />
      </PageHeader>

      <StatsStrip stats={[
        { label: 'Total Vehicles', value: counts.total, trend: 0, trendLabel: 'all time' },
        { label: 'Owned', value: counts.owned, trend: 0, trendLabel: 'all time' },
        { label: 'Partner', value: counts.partner, trend: 0, trendLabel: 'all time' },
        { label: 'Market', value: counts.market, trend: 0, trendLabel: 'all time' },
      ]} />

      <div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <div className="border-b border-stroke-soft-200 px-4 py-3">
          <form method="GET">
            <Input.Root size="small" className="w-full max-w-xs">
              <Input.Wrapper>
                <Input.Icon as={RiSearchLine} />
                <Input.Input name="search" defaultValue={search ?? ''} placeholder="Search vehicles..." />
              </Input.Wrapper>
            </Input.Root>
          </form>
        </div>
        <div className="p-3">
          <VehiclesTable rows={rows} />
        </div>
        <div className="flex items-center justify-between border-t border-stroke-soft-200 px-4 py-3">
          <span className="text-paragraph-xs text-text-sub-600">Showing {total === 0 ? 0 : (page-1)*VEHICLE_PAGE_SIZE+1}-{Math.min(page*VEHICLE_PAGE_SIZE, total)} of {total}</span>
          <PaginationLinks page={page} totalPages={totalPages} basePath="/master/vehicles" query={{ search }} />
        </div>
      </div>
    </div>
  );
}
