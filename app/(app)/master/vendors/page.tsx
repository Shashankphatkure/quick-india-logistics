'use client';
import React, { useState } from 'react';
import * as Button from '@/components/ui/button';
import * as Input from '@/components/ui/input';
import * as Table from '@/components/ui/table';
import * as Badge from '@/components/ui/badge';
import * as Pagination from '@/components/ui/pagination';
import * as Select from '@/components/ui/select';
import * as Label from '@/components/ui/label';
import { Root as Checkbox } from '@/components/ui/checkbox';
import { RiAddLine, RiSearchLine, RiFilterLine, RiArrowLeftSLine, RiArrowRightSLine } from '@remixicon/react';
import { STATUS_TO_BADGE_COLOR, type BadgeColor } from '@/lib/ui-types';

const VENDORS = [
  {
    name: 'Omnilinkar Cargo Private Limited', pan: 'AAPCO1181N', gst: '-',
    email: 'info@quickindialogistics.com', phone: '8335683424',
    companyType: 'Pvt Ltd', region: 'Pan India', business: 'Coloader',
    verifiedBy: 'Super User', status: 'Approved',
  },
];

export default function VendorsPage() {
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-label-lg text-text-strong-950">Vendors</h1>
          <p className="text-paragraph-xs text-text-sub-600">Masters / Vendors</p>
        </div>
        <div className="flex gap-2">
          <Button.Root variant="neutral" mode="stroke" size="small"><Button.Icon as={RiFilterLine} />Filter</Button.Root>
          <Button.Root size="small" onClick={() => setShowAdd(true)}><Button.Icon as={RiAddLine} />Add Vendor</Button.Root>
        </div>
      </div>

      {showAdd && (
        <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-regular-xs space-y-5">
          <div className="flex items-center justify-between border-b border-stroke-soft-200 pb-3">
            <h3 className="text-label-sm text-text-strong-950">Add Vendor</h3>
            <button onClick={() => setShowAdd(false)} className="text-text-sub-600 hover:text-text-strong-950 text-title-h5 leading-none">&times;</button>
          </div>

          <section className="space-y-3">
            <h4 className="text-subheading-xs uppercase text-text-sub-600">Vendor Info</h4>
            <div className="grid grid-cols-3 gap-3">
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
            <div className="grid grid-cols-2 gap-3">
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
              {['Local', 'Air', 'Surface', 'Cargo', 'Train', 'Courier', 'Warehouse'].map(s => (
                <label key={s} className="flex items-center gap-2 text-paragraph-sm text-text-strong-950 cursor-pointer">
                  <input type="checkbox" className="accent-primary-base" />{s}
                </label>
              ))}
            </div>
          </section>

          <div className="flex justify-end gap-2">
            <Button.Root variant="neutral" mode="stroke" size="small" onClick={() => setShowAdd(false)}>Cancel</Button.Root>
            <Button.Root size="small">Save</Button.Root>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <div className="border-b border-stroke-soft-200 p-3">
          <Input.Root size="small" className="w-56">
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
