import React from 'react';
import * as Button from '@/components/ui/button';
import * as Input from '@/components/ui/input';
import * as Table from '@/components/ui/table';
import * as Badge from '@/components/ui/badge';
import PageHeader from '@/components/page-header';
import StatsStrip from '@/components/stats-strip';
import { RiSearchLine, RiFilterLine, RiSuitcaseLine } from '@remixicon/react';
import { listAssets, countAssets, getAssetCounts, ASSET_PAGE_SIZE } from '@/lib/db/assets';
import { currentOrgId } from '@/lib/tenant';
import { listBranchesForSelect } from '@/lib/db/branches';
import PaginationLinks from '@/components/pagination-links';
import AddAssetForm from './add-asset-form';

const LOGGER_LABEL: Record<string, string> = {
  single_use: 'Single Use', multi_use: 'Multi Use',
  dry_ice_single: 'Dry Ice (Single)', dry_ice_multi: 'Dry Ice (Multi)',
  liquid_nitrogen: 'Liquid Nitrogen',
};

const BOX_LABEL: Record<string, string> = {
  credo: 'Credo', vype: 'Vype', cool_guard: 'Cool Guard',
  iqo: 'IQO', sytle: 'Sytle', vaq_tec: 'VAQ-TEC',
};

export default async function AssetsPage({ searchParams }: { searchParams?: { search?: string; page?: string; kind?: string } }) {
  const orgId = await currentOrgId();
  const search = searchParams?.search?.trim() || undefined;
  const page = Math.max(1, Number(searchParams?.page) || 1);
  const kind = (searchParams?.kind === 'logger' || searchParams?.kind === 'box') ? searchParams.kind : undefined;

  const [rows, total, counts, branches] = await Promise.all([
    listAssets({ orgId, search, page, kind }),
    countAssets({ orgId, search, kind }),
    getAssetCounts(orgId),
    listBranchesForSelect(orgId),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / ASSET_PAGE_SIZE));

  return (
    <div className="space-y-6">
      <PageHeader
        icon={RiSuitcaseLine}
        iconColor="bg-feature-lighter text-feature-base"
        title="Assets"
        subtitle="Loggers and temperature-control boxes for cold-chain shipments"
        breadcrumbs={[{ label: 'Master', href: '/master/assets' }, { label: 'Assets' }]}
      >
        <Button.Root variant="neutral" mode="stroke" size="small">
          <Button.Icon as={RiFilterLine} />Filter
        </Button.Root>
        <AddAssetForm branches={branches} />
      </PageHeader>

      <StatsStrip stats={[
        { label: 'Total Assets', value: counts.total, trend: 0, trendLabel: 'all time' },
        { label: 'Loggers', value: counts.loggers, trend: 0, trendLabel: 'all time' },
        { label: 'Boxes', value: counts.boxes, trend: 0, trendLabel: 'all time' },
        { label: 'In Use', value: counts.in_use, trend: 0, trendLabel: 'now' },
      ]} />

      <div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <div className="border-b border-stroke-soft-200 px-4 py-3 flex items-center gap-3">
          <form method="GET" className="flex-1">
            <input type="hidden" name="kind" value={kind ?? ''} />
            <Input.Root size="small" className="w-full max-w-xs">
              <Input.Wrapper>
                <Input.Icon as={RiSearchLine} />
                <Input.Input name="search" defaultValue={search ?? ''} placeholder="Search by asset ID / barcode..." />
              </Input.Wrapper>
            </Input.Root>
          </form>
          <div className="flex gap-1.5">
            <a href="/master/assets" className={`rounded-md px-2 py-1 text-paragraph-sm no-underline transition ${!kind ? 'bg-primary-base text-static-white' : 'text-text-sub-600 hover:bg-bg-weak-50'}`}>All</a>
            <a href="/master/assets?kind=logger" className={`rounded-md px-2 py-1 text-paragraph-sm no-underline transition ${kind === 'logger' ? 'bg-primary-base text-static-white' : 'text-text-sub-600 hover:bg-bg-weak-50'}`}>Loggers</a>
            <a href="/master/assets?kind=box" className={`rounded-md px-2 py-1 text-paragraph-sm no-underline transition ${kind === 'box' ? 'bg-primary-base text-static-white' : 'text-text-sub-600 hover:bg-bg-weak-50'}`}>Boxes</a>
          </div>
        </div>
        <Table.Root>
          <Table.Header>
            <Table.Row>
              {['Asset ID', 'Barcode', 'Kind', 'Type', 'Manufacturer', 'Current Branch', 'Usage', 'Cal. Expiry', 'Status'].map(c => (
                <Table.Head key={c}>{c}</Table.Head>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {rows.length === 0 ? (
              <Table.Row><Table.Cell colSpan={9} className="py-10 text-center text-paragraph-sm text-text-sub-600">No assets found</Table.Cell></Table.Row>
            ) : rows.map(a => {
              const typeText = a.asset_kind === 'logger'
                ? (LOGGER_LABEL[a.logger_type ?? ''] ?? '—')
                : (BOX_LABEL[a.box_type ?? ''] ?? '—');
              return (
                <Table.Row key={a.id}>
                  <Table.Cell className="h-auto py-3"><span className="text-paragraph-sm font-medium text-primary-base">{a.asset_id}</span></Table.Cell>
                  <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{a.barcode ?? '—'}</Table.Cell>
                  <Table.Cell className="h-auto py-3">
                    <Badge.Root size="small" variant="lighter" color={a.asset_kind === 'logger' ? 'purple' : 'sky'}>
                      {a.asset_kind === 'logger' ? 'Logger' : 'Box'}
                    </Badge.Root>
                  </Table.Cell>
                  <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{typeText}{a.asset_kind === 'box' && a.capacity_liters ? ` (${a.capacity_liters}L)` : ''}</Table.Cell>
                  <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{a.manufacturer ?? '—'}</Table.Cell>
                  <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{a.current_branch_name ?? '—'}</Table.Cell>
                  <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{a.usage_count}×</Table.Cell>
                  <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{a.cal_to ?? '—'}</Table.Cell>
                  <Table.Cell className="h-auto py-3">
                    {a.is_defective ? (
                      <Badge.Root size="medium" variant="light" color="red"><Badge.Dot />Defective</Badge.Root>
                    ) : a.in_use ? (
                      <Badge.Root size="medium" variant="light" color="orange"><Badge.Dot />In Use</Badge.Root>
                    ) : (
                      <Badge.Root size="medium" variant="light" color="green"><Badge.Dot />Available</Badge.Root>
                    )}
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table.Root>
        <div className="flex items-center justify-between border-t border-stroke-soft-200 px-4 py-3">
          <span className="text-paragraph-xs text-text-sub-600">Showing {total === 0 ? 0 : (page-1)*ASSET_PAGE_SIZE+1}-{Math.min(page*ASSET_PAGE_SIZE, total)} of {total}</span>
          <PaginationLinks page={page} totalPages={totalPages} basePath="/master/assets" query={{ search, kind }} />
        </div>
      </div>
    </div>
  );
}
