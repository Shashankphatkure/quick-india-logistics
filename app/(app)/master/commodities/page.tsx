'use client';
import React, { useState } from 'react';
import * as Button from '@/components/ui/button';
import * as CompactButton from '@/components/ui/compact-button';
import * as Divider from '@/components/ui/divider';
import * as Input from '@/components/ui/input';
import * as Table from '@/components/ui/table';
import * as Badge from '@/components/ui/badge';
import * as Pagination from '@/components/ui/pagination';
import * as Select from '@/components/ui/select';
import * as Label from '@/components/ui/label';
import { Root as Checkbox } from '@/components/ui/checkbox';
import PageHeader from '@/components/page-header';
import StatsStrip from '@/components/stats-strip';
import {
  RiAddLine, RiSearchLine, RiFilterLine, RiCloseLine,
  RiArrowUpDownLine, RiArrowLeftSLine, RiArrowRightSLine, RiBox3Line,
} from '@remixicon/react';
import { STATUS_TO_BADGE_COLOR, type BadgeColor } from '@/lib/ui-types';

const COMMODITIES = [
  { name: 'Cement Pipe', type: 'General', org: 'Quick India Logistics Pvt Ltd', verifiedBy: 'Admin Manager', status: 'Active' },
  { name: 'Cricket Balls', type: 'General', org: 'Quick India Logistics Pvt Ltd', verifiedBy: 'Admin Executive', status: 'Active' },
  { name: 'Sweet', type: 'Perishable Food', org: 'Quick India Logistics Pvt Ltd', verifiedBy: 'Admin Manager', status: 'Active' },
  { name: 'Expiry Goods', type: 'Expiry Goods', org: 'Quick India Logistics Pvt Ltd', verifiedBy: 'Admin Manager', status: 'Active' },
  { name: 'Sample', type: 'Sample', org: 'Quick India Logistics Pvt Ltd', verifiedBy: 'Admin Manager', status: 'Active' },
  { name: 'Boundary Matters', type: 'General', org: 'Quick India Logistics Pvt Ltd', verifiedBy: 'Admin Manager', status: 'Active' },
  { name: 'Paints', type: 'General', org: 'Quick India Logistics Pvt Ltd', verifiedBy: 'Admin Manager', status: 'Active' },
  { name: 'Sales', type: 'General', org: 'Quick India Logistics Pvt Ltd', verifiedBy: 'Admin Manager', status: 'Active' },
  { name: 'Shooting Material', type: 'General', org: 'Quick India Logistics Pvt Ltd', verifiedBy: 'Admin Manager', status: 'Active' },
  { name: 'Spare Parts', type: 'General', org: 'Quick India Logistics Pvt Ltd', verifiedBy: 'Admin Manager', status: 'Active' },
];

export default function CommoditiesPage() {
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={RiBox3Line}
        iconColor="bg-feature-lighter text-feature-base"
        title="Commodities"
        subtitle="Manage commodity types for shipments"
        breadcrumbs={[{ label: 'Master', href: '/master/commodities' }, { label: 'Commodities' }]}
      >
        <Button.Root variant="neutral" mode="stroke" size="small">
          <Button.Icon as={RiFilterLine} />Filter
        </Button.Root>
        <Button.Root size="small" onClick={() => setShowAdd(true)}>
          <Button.Icon as={RiAddLine} />Add Commodity
        </Button.Root>
      </PageHeader>

      <StatsStrip stats={[
        { label: 'Total Commodities', value: 33, trend: 3.2, trendLabel: 'this month' },
        { label: 'Active', value: 30, trend: 2.1, trendLabel: 'this month' },
        { label: 'Perishable', value: 4, trend: 0, trendLabel: 'no change' },
        { label: 'Expiry Goods', value: 2, trend: -1, trendLabel: 'this month' },
      ]} />

      {showAdd && (
        <div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 sm:p-6 shadow-regular-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-label-sm text-text-strong-950">Add Commodity</h3>
              <p className="text-paragraph-xs text-text-sub-600 mt-0.5">Define a new commodity type</p>
            </div>
            <CompactButton.Root variant="ghost" size="large" onClick={() => setShowAdd(false)}>
              <CompactButton.Icon as={RiCloseLine} />
            </CompactButton.Root>
          </div>
          <Divider.Root />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label.Root>Commodity Type <Label.Asterisk /></Label.Root>
              <Select.Root size="small">
                <Select.Trigger><Select.Value placeholder="Select type" /></Select.Trigger>
                <Select.Content>
                  <Select.Item value="general">General</Select.Item>
                  <Select.Item value="perishable">Perishable Food</Select.Item>
                  <Select.Item value="expiry">Expiry Goods</Select.Item>
                  <Select.Item value="sample">Sample</Select.Item>
                </Select.Content>
              </Select.Root>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label.Root>Commodity Name <Label.Asterisk /></Label.Root>
              <Input.Root size="small"><Input.Wrapper><Input.Input placeholder="Enter commodity name" /></Input.Wrapper></Input.Root>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button.Root variant="neutral" mode="stroke" size="small" onClick={() => setShowAdd(false)}>Cancel</Button.Root>
            <Button.Root size="small">Save Commodity</Button.Root>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <div className="flex items-center justify-between border-b border-stroke-soft-200 px-4 py-3">
          <Input.Root size="small" className="w-64">
            <Input.Wrapper>
              <Input.Icon as={RiSearchLine} />
              <Input.Input placeholder="Search commodities..." />
            </Input.Wrapper>
          </Input.Root>
          <span className="text-paragraph-sm text-text-sub-600">33 commodities</span>
        </div>
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.Head className="w-10"><Checkbox /></Table.Head>
              {['Commodity Name', 'Type', 'Organization', 'Verified By', 'Status'].map(col => (
                <Table.Head key={col}>
                  <span className="flex items-center gap-1">{col}<RiArrowUpDownLine size={11} className="text-text-disabled-300" /></span>
                </Table.Head>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {COMMODITIES.map(c => (
              <Table.Row key={c.name}>
                <Table.Cell className="h-auto py-3 w-10"><Checkbox /></Table.Cell>
                <Table.Cell className="h-auto py-3">
                  <span className="text-paragraph-sm font-semibold text-text-strong-950 cursor-pointer hover:text-primary-base transition-colors">{c.name}</span>
                </Table.Cell>
                <Table.Cell className="h-auto py-3">
                  <Badge.Root size="small" variant="lighter" color="gray">{c.type}</Badge.Root>
                </Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{c.org}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{c.verifiedBy}</Table.Cell>
                <Table.Cell className="h-auto py-3">
                  <Badge.Root size="medium" variant="light" color={(STATUS_TO_BADGE_COLOR[c.status] ?? 'gray') as BadgeColor}>
                    <Badge.Dot />{c.status}
                  </Badge.Root>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
        <div className="flex items-center justify-between border-t border-stroke-soft-200 px-5 py-3">
          <span className="text-paragraph-sm text-text-sub-600">Showing 1-10 of 33</span>
          <Pagination.Root variant="rounded">
            <Pagination.NavButton><Pagination.NavIcon as={RiArrowLeftSLine} /></Pagination.NavButton>
            <Pagination.Item current>1</Pagination.Item>
            <Pagination.Item>2</Pagination.Item>
            <Pagination.Item>3</Pagination.Item>
            <Pagination.Item>4</Pagination.Item>
            <Pagination.NavButton><Pagination.NavIcon as={RiArrowRightSLine} /></Pagination.NavButton>
          </Pagination.Root>
        </div>
      </div>
    </div>
  );
}
