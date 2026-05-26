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
import { cn } from '@/utils/cn';
import {
  RiAddLine, RiSearchLine, RiFilterLine, RiCloseLine,
  RiArrowLeftSLine, RiArrowRightSLine, RiCheckLine, RiCarLine,
} from '@remixicon/react';
import { STATUS_TO_BADGE_COLOR, type BadgeColor } from '@/lib/ui-types';

const VEHICLE_TABS = ['Vehicle', 'Market Vehicle'] as const;

const VEHICLES = [
  { no: 'MH08EV0046', org: 'Quick India Logistics Pvt Ltd', owner: 'Owned Vehicle', type: '-', model: '-', verifiedBy: 'Software Executive', status: 'Active', active: true },
  { no: 'MH04FC0046', org: 'Quick India Logistics Pvt Ltd', owner: 'Owned Vehicle', type: '-', model: '-', verifiedBy: 'Customer Support Executive', status: 'Active', active: true },
  { no: 'MH03FC3573', org: 'Quick India Logistics Pvt Ltd', owner: 'Owned Vehicle', type: 'Truck', model: 'Tata', verifiedBy: 'Admin Manager', status: 'Active', active: true },
];

export default function VehiclesPage() {
  const [activeTab, setActiveTab] = useState<typeof VEHICLE_TABS[number]>('Vehicle');
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={RiCarLine}
        iconColor="bg-information-lighter text-information-base"
        title="Vehicle"
        subtitle="Manage owned and market vehicles"
        breadcrumbs={[{ label: 'Master', href: '/master/vehicles' }, { label: 'Vehicle' }]}
      >
        <Button.Root variant="neutral" mode="stroke" size="small">
          <Button.Icon as={RiFilterLine} />Filter
        </Button.Root>
        <Button.Root size="small" onClick={() => setShowAdd(true)}>
          <Button.Icon as={RiAddLine} />Add Vehicle
        </Button.Root>
      </PageHeader>

      <StatsStrip stats={[
        { label: 'Total Vehicles', value: 3, trend: 0, trendLabel: 'no change' },
        { label: 'Active', value: 3, trend: 0, trendLabel: 'no change' },
        { label: 'Market Vehicles', value: 0, trend: 0, trendLabel: 'no change' },
        { label: 'Owned', value: 3, trend: 0, trendLabel: 'no change' },
      ]} />

      <div className="overflow-x-auto">
        <div className="flex gap-1 rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-1 shadow-regular-xs w-fit">
          {VEHICLE_TABS.map(tab => (
            <Button.Root
              key={tab}
              variant={activeTab === tab ? 'primary' : 'neutral'}
              mode={activeTab === tab ? 'filled' : 'ghost'}
              size="small"
              onClick={() => setActiveTab(tab)}
              className="shrink-0"
            >
              {tab}
            </Button.Root>
          ))}
        </div>
      </div>

      {showAdd && (
        <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 sm:p-5 shadow-regular-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-label-sm text-text-strong-950">Add Vehicle</h3>
            <CompactButton.Root variant="ghost" size="large" onClick={() => setShowAdd(false)}>
              <CompactButton.Icon as={RiCloseLine} />
            </CompactButton.Root>
          </div>
          <Divider.Root />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label.Root>Vehicle Number <Label.Asterisk /></Label.Root>
              <Input.Root size="small"><Input.Wrapper><Input.Input placeholder="Enter vehicle number" /></Input.Wrapper></Input.Root>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label.Root>Vehicle Type <Label.Asterisk /></Label.Root>
              <Select.Root size="small">
                <Select.Trigger><Select.Value placeholder="Select type" /></Select.Trigger>
                <Select.Content>
                  <Select.Item value="truck">Truck</Select.Item>
                  <Select.Item value="van">Van</Select.Item>
                  <Select.Item value="bike">Bike</Select.Item>
                </Select.Content>
              </Select.Root>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label.Root>Vehicle Owner Info <Label.Asterisk /></Label.Root>
              <Select.Root size="small">
                <Select.Trigger><Select.Value placeholder="Select owner type" /></Select.Trigger>
                <Select.Content>
                  <Select.Item value="owned">Owned Vehicle</Select.Item>
                  <Select.Item value="partner">Partner Vehicle</Select.Item>
                  <Select.Item value="market">Market Vehicle</Select.Item>
                </Select.Content>
              </Select.Root>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label.Root>Vehicle Model</Label.Root>
              <Input.Root size="small"><Input.Wrapper><Input.Input placeholder="Enter model" /></Input.Wrapper></Input.Root>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label.Root>Container Capacity</Label.Root>
              <Input.Root size="small"><Input.Wrapper><Input.Input placeholder="Enter capacity" /></Input.Wrapper></Input.Root>
            </div>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Button.Root variant="neutral" mode="stroke" size="small" onClick={() => setShowAdd(false)}>Cancel</Button.Root>
            <Button.Root size="small">Save</Button.Root>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <div className="border-b border-stroke-soft-200 p-3">
          <Input.Root size="small" className="w-full max-w-xs">
            <Input.Wrapper><Input.Icon as={RiSearchLine} /><Input.Input placeholder="Search vehicles..." /></Input.Wrapper>
          </Input.Root>
        </div>
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.Head className="w-10"><Checkbox /></Table.Head>
              {['Vehicle No', 'Organization', 'Vehicle Owner', 'Type', 'Model', 'Verified By', 'Status', 'Active'].map(col => (
                <Table.Head key={col}>{col}</Table.Head>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {VEHICLES.map(v => (
              <Table.Row key={v.no}>
                <Table.Cell className="h-auto py-3 w-10"><Checkbox /></Table.Cell>
                <Table.Cell className="h-auto py-3">
                  <span className="text-paragraph-sm font-medium text-primary-base cursor-pointer hover:underline">{v.no}</span>
                </Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{v.org}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{v.owner}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{v.type}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{v.model}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{v.verifiedBy}</Table.Cell>
                <Table.Cell className="h-auto py-3">
                  <Badge.Root size="medium" variant="light" color={(STATUS_TO_BADGE_COLOR[v.status] ?? 'gray') as BadgeColor}>
                    <Badge.Dot />{v.status}
                  </Badge.Root>
                </Table.Cell>
                <Table.Cell className="h-auto py-3">
                  {v.active && <RiCheckLine size={16} className="text-success-base" />}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
        <div className="flex items-center justify-between border-t border-stroke-soft-200 px-4 py-3">
          <span className="text-paragraph-xs text-text-sub-600">Showing 1-3 of 3</span>
          <Pagination.Root variant="rounded">
            <Pagination.NavButton><Pagination.NavIcon as={RiArrowLeftSLine} /></Pagination.NavButton>
            <Pagination.Item current>1</Pagination.Item>
            <Pagination.NavButton><Pagination.NavIcon as={RiArrowRightSLine} /></Pagination.NavButton>
          </Pagination.Root>
        </div>
      </div>
    </div>
  );
}
