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
  RiArrowLeftSLine, RiArrowRightSLine, RiTruckLine,
} from '@remixicon/react';
import { STATUS_TO_BADGE_COLOR, type BadgeColor } from '@/lib/ui-types';

const VENDORS = [
  {
    name: 'Omnilinkar Cargo Private Limited', pan: 'AAPCO1181N', gst: '-',
    email: 'info@quickindialogistics.com', phone: '8335683424',
    companyType: 'Pvt Ltd', region: 'Pan India', business: 'Coloader',
    verifiedBy: 'Super User', status: 'Approved',
  },
];

const DIMENSION_SERVICES = ['Local', 'Air', 'Surface', 'Cargo', 'Train', 'Courier', 'Warehouse'] as const;

export default function VendorsPage() {
  const [showAdd, setShowAdd] = useState(false);
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());

  function toggleService(s: string) {
    setSelectedServices(prev => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s); else next.add(s);
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={RiTruckLine}
        iconColor="bg-faded-lighter text-faded-base"
        title="Vendors"
        subtitle="Manage third-party logistics vendors"
        breadcrumbs={[{ label: 'Master', href: '/master/vendors' }, { label: 'Vendors' }]}
      >
        <Button.Root variant="neutral" mode="stroke" size="small">
          <Button.Icon as={RiFilterLine} />Filter
        </Button.Root>
        <Button.Root size="small" onClick={() => setShowAdd(true)}>
          <Button.Icon as={RiAddLine} />Add Vendor
        </Button.Root>
      </PageHeader>

      <StatsStrip stats={[
        { label: 'Total Vendors', value: 1, trend: 0, trendLabel: 'no change' },
        { label: 'Approved', value: 1, trend: 0, trendLabel: 'no change' },
        { label: 'Pending', value: 0, trend: 0, trendLabel: 'no change' },
        { label: 'Pan India', value: 1, trend: 0, trendLabel: 'no change' },
      ]} />

      {showAdd && (
        <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 sm:p-5 shadow-regular-xs space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-label-sm text-text-strong-950">Add Vendor</h3>
            <CompactButton.Root variant="ghost" size="large" onClick={() => setShowAdd(false)}>
              <CompactButton.Icon as={RiCloseLine} />
            </CompactButton.Root>
          </div>

          <Divider.Root />

          <section className="space-y-3">
            <h4 className="text-subheading-xs uppercase text-text-sub-600">Vendor Info</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label.Root>PAN Number <Label.Asterisk /></Label.Root>
                <Input.Root size="small"><Input.Wrapper><Input.Input placeholder="Please Enter PAN" /></Input.Wrapper></Input.Root>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label.Root>Vendor Name <Label.Asterisk /></Label.Root>
                <Input.Root size="small"><Input.Wrapper><Input.Input placeholder="Enter Vendor Name" /></Input.Wrapper></Input.Root>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label.Root>Company Type <Label.Asterisk /></Label.Root>
                <Select.Root size="small">
                  <Select.Trigger><Select.Value placeholder="Select type" /></Select.Trigger>
                  <Select.Content>
                    <Select.Item value="pvt">Pvt Ltd</Select.Item>
                    <Select.Item value="llp">LLP</Select.Item>
                    <Select.Item value="proprietorship">Proprietorship</Select.Item>
                  </Select.Content>
                </Select.Root>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h4 className="text-subheading-xs uppercase text-text-sub-600">Contact Info</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'Vendor Email', ph: 'Enter email' },
                { label: 'Vendor Ph No', ph: 'Enter phone' },
                { label: 'Vendor Email 2', ph: 'Optional' },
                { label: 'Vendor Ph No 2', ph: 'Optional' },
              ].map(f => (
                <div key={f.label} className="flex flex-col gap-1.5">
                  <Label.Root>{f.label}</Label.Root>
                  <Input.Root size="small"><Input.Wrapper><Input.Input placeholder={f.ph} /></Input.Wrapper></Input.Root>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h4 className="text-subheading-xs uppercase text-text-sub-600">Dimension Calculation</h4>
            <div className="flex flex-wrap gap-4">
              {DIMENSION_SERVICES.map(s => (
                <Label.Root key={s} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={selectedServices.has(s)}
                    onCheckedChange={() => toggleService(s)}
                  />
                  <span className="text-paragraph-sm text-text-strong-950">{s}</span>
                </Label.Root>
              ))}
            </div>
          </section>

          <div className="flex flex-wrap justify-end gap-2">
            <Button.Root variant="neutral" mode="stroke" size="small" onClick={() => setShowAdd(false)}>Cancel</Button.Root>
            <Button.Root size="small">Save</Button.Root>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <div className="border-b border-stroke-soft-200 p-3">
          <Input.Root size="small" className="w-full max-w-xs">
            <Input.Wrapper><Input.Icon as={RiSearchLine} /><Input.Input placeholder="Search vendors..." /></Input.Wrapper>
          </Input.Root>
        </div>
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.Head className="w-10"><Checkbox /></Table.Head>
              {['Vendor Name', 'PAN', 'GST', 'Email', 'Phone', 'Company Type', 'Service Region', 'Line Of Business', 'Verified By', 'Status'].map(col => (
                <Table.Head key={col}>{col}</Table.Head>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {VENDORS.map(v => (
              <Table.Row key={v.pan}>
                <Table.Cell className="h-auto py-3 w-10"><Checkbox /></Table.Cell>
                <Table.Cell className="h-auto py-3">
                  <span className="text-paragraph-sm font-medium text-primary-base cursor-pointer hover:underline">{v.name}</span>
                </Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{v.pan}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{v.gst}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{v.email}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{v.phone}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{v.companyType}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{v.region}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{v.business}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{v.verifiedBy}</Table.Cell>
                <Table.Cell className="h-auto py-3">
                  <Badge.Root size="medium" variant="light" color={(STATUS_TO_BADGE_COLOR[v.status] ?? 'gray') as BadgeColor}>
                    <Badge.Dot />{v.status}
                  </Badge.Root>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
        <div className="flex items-center justify-between border-t border-stroke-soft-200 px-4 py-3">
          <span className="text-paragraph-xs text-text-sub-600">Showing 1-1 of 1</span>
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
