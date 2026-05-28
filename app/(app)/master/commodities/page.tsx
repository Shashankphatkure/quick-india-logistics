import React from 'react';
import * as Button from '@/components/ui/button';
import * as Input from '@/components/ui/input';
import * as Table from '@/components/ui/table';
import * as Badge from '@/components/ui/badge';
import PageHeader from '@/components/page-header';
import StatsStrip from '@/components/stats-strip';
import { RiFilterLine, RiSearchLine, RiArrowUpDownLine, RiBox3Line } from '@remixicon/react';
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
import RowActions from './row-actions';

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
        <Button.Root variant="neutral" mode="stroke" size="small">
          <Button.Icon as={RiFilterLine} />
          Filter
        </Button.Root>
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
        <Table.Root>
          <Table.Header>
            <Table.Row>
              {['Commodity Name', 'Type', 'Organization', 'Verified By', 'Status', ''].map((col) => (
                <Table.Head key={col}>
                  <span className="flex items-center gap-1">
                    {col}
                    <RiArrowUpDownLine size={11} className="text-text-disabled-300" />
                  </span>
                </Table.Head>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {rows.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={5} className="py-10 text-center text-paragraph-sm text-text-sub-600">
                  No commodities found
                </Table.Cell>
              </Table.Row>
            ) : (
              rows.map((c) => {
                const statusLabel = c.is_active ? 'Active' : 'Inactive';
                return (
                  <Table.Row key={c.id}>
                    <Table.Cell className="h-auto py-3">
                      <span className="text-paragraph-sm font-semibold text-text-strong-950 cursor-pointer hover:text-primary-base transition-colors">
                        {c.name}
                      </span>
                    </Table.Cell>
                    <Table.Cell className="h-auto py-3">
                      <Badge.Root size="small" variant="lighter" color="gray">
                        {c.type_name}
                      </Badge.Root>
                    </Table.Cell>
                    <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">
                      {c.org_name}
                    </Table.Cell>
                    <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">
                      {c.verified_by_name ?? '—'}
                    </Table.Cell>
                    <Table.Cell className="h-auto py-3">
                      <Badge.Root
                        size="medium"
                        variant="light"
                        color={(STATUS_TO_BADGE_COLOR[statusLabel] ?? 'gray') as BadgeColor}
                      >
                        <Badge.Dot />
                        {statusLabel}
                      </Badge.Root>
                    </Table.Cell>
                    <Table.Cell className="h-auto py-3 text-right">
                      <RowActions row={{ id: c.id, name: c.name, type_id: c.type_id, is_active: c.is_active }} types={types} />
                    </Table.Cell>
                  </Table.Row>
                );
              })
            )}
          </Table.Body>
        </Table.Root>
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
