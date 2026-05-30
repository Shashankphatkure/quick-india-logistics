import React from 'react';
import * as Button from '@/components/ui/button';
import * as Input from '@/components/ui/input';
import * as Table from '@/components/ui/table';
import * as Badge from '@/components/ui/badge';
import PageHeader from '@/components/page-header';
import StatsStrip from '@/components/stats-strip';
import { RiSearchLine, RiArrowUpDownLine, RiBox3Line } from '@remixicon/react';
import FilterPopover from '@/components/filter-popover';
import PaginationLinks from '@/components/pagination-links';
import { STATUS_TO_BADGE_COLOR, type BadgeColor } from '@/lib/ui-types';
import {
  listCommodities,
  countCommodities,
  listCommodityTypes,
  getCommodityCounts,
} from '@/lib/db/commodities';
import { currentOrgId } from '@/lib/tenant';
import AddCommodityForm from './add-commodity-form';
import CommoditiesTable from './commodities-table';

const PAGE_SIZE = 10;

export default async function CommoditiesPage({
  searchParams,
}: {
  searchParams?: { search?: string; page?: string };
}) {
  const orgId = await currentOrgId();
  const search = searchParams?.search?.trim() || undefined;
  const page = Math.max(1, Number(searchParams?.page) || 1);

  const [rows, total, counts, types] = await Promise.all([
    listCommodities({ orgId, search, page, pageSize: PAGE_SIZE }),
    countCommodities({ orgId, search }),
    getCommodityCounts(orgId),
    listCommodityTypes(orgId),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const fromRow = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const toRow = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={RiBox3Line}
        iconColor="bg-feature-lighter text-feature-base"
        title="Commodities"
        subtitle="Manage commodity types for shipments"
        breadcrumbs={[
          { label: 'Master', href: '/master/commodities' },
          { label: 'Commodities' },
        ]}
      >
        <FilterPopover fields={[
          { name: 'search', label: 'Commodity Name', type: 'text', placeholder: 'Search...' },
        ]} />
        <AddCommodityForm types={types} />
      </PageHeader>

      <StatsStrip
        stats={[
          { label: 'Total Commodities', value: counts.total, trend: 0, trendLabel: 'all time' },
          { label: 'Active', value: counts.active, trend: 0, trendLabel: 'all time' },
          { label: 'Perishable', value: counts.perishable, trend: 0, trendLabel: 'all time' },
          { label: 'Expiry Goods', value: counts.expiry, trend: 0, trendLabel: 'all time' },
        ]}
      />

      <div className="overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <div className="flex items-center justify-between border-b border-stroke-soft-200 px-4 py-3">
          <form method="GET" className="flex items-center gap-2">
            <Input.Root size="small" className="w-64">
              <Input.Wrapper>
                <Input.Icon as={RiSearchLine} />
                <Input.Input
                  name="search"
                  defaultValue={search ?? ''}
                  placeholder="Search commodities..."
                />
              </Input.Wrapper>
            </Input.Root>
          </form>
          <span className="text-paragraph-sm text-text-sub-600">
            {total} {total === 1 ? 'commodity' : 'commodities'}
          </span>
        </div>
        <div className="p-3">
          <CommoditiesTable
            rows={rows.map((c) => ({
              id: c.id, name: c.name, type_id: c.type_id, type_name: c.type_name,
              org_name: c.org_name, verified_by_name: c.verified_by_name, is_active: c.is_active,
              expiry_days: c.expiry_days,
            }))}
            types={types}
          />
        </div>
        <div className="flex items-center justify-between border-t border-stroke-soft-200 px-5 py-3">
          <span className="text-paragraph-sm text-text-sub-600">
            Showing {fromRow}-{toRow} of {total}
          </span>
          <PaginationLinks
            page={page}
            totalPages={totalPages}
            basePath="/master/commodities"
            query={{ search }}
          />
        </div>
      </div>
    </div>
  );
}
