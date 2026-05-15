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

const BRANCHES = [
  {
    id: 'VR54', name: 'QIL-TRIPURA', org: 'Quick India Logistics Pvt Ltd',
    type: 'Vendor', vendor: 'By Vehicle', location: 'North Tripura, Tripura, 799264',
    email: 'info@quickindialogistics.com', phone: '9876750555',
    head: 'Swati', verifiedBy: 'Admin Manager', status: 'Active',
  },
];

export default function BranchesPage() {
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-label-lg text-text-strong-950">Branches</h1>
          <p className="text-paragraph-xs text-text-sub-600">Masters / Branches</p>
        </div>
        <div className="flex gap-2">
          <Button.Root variant="neutral" mode="stroke" size="small">
            <Button.Icon as={RiFilterLine} />Filter
          </Button.Root>
          <Button.Root size="small" onClick={() => setShowAdd(true)}>
            <Button.Icon as={RiAddLine} />Add Branch
          </Button.Root>
        </div>
      </div>

      {showAdd && (
        <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-regular-xs space-y-5">
          <div className="flex items-center justify-between border-b border-stroke-soft-200 pb-3">
            <h3 className="text-label-sm text-text-strong-950">Add Branch</h3>
            <button onClick={() => setShowAdd(false)} className="text-text-sub-600 hover:text-text-strong-950 text-title-h5 leading-none">&times;</button>
          </div>

          <section className="space-y-3">
            <h4 className="text-subheading-xs uppercase text-text-sub-600">Branch Info</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label.Root>Branch Type <Label.Asterisk /></Label.Root>
                <Select.Root size="small">
                  <Select.Trigger><Select.Value placeholder="Select type" /></Select.Trigger>
                  <Select.Content>
                    <Select.Item value="hub">Hub</Select.Item>
                    <Select.Item value="branch">Branch</Select.Item>
                    <Select.Item value="franchise">Franchise</Select.Item>
                  </Select.Content>
                </Select.Root>
              </div>
              {[
                { label: 'Alias Name', ph: 'Enter alias' },
                { label: 'Branch Name', ph: 'QIL-' },
                { label: 'Branch Email', ph: 'Enter email' },
                { label: 'Branch Phone', ph: 'Enter phone' },
              ].map(f => (
                <div key={f.label} className="flex flex-col gap-1.5">
                  <Label.Root>{f.label} <Label.Asterisk /></Label.Root>
                  <Input.Root size="small"><Input.Wrapper><Input.Input placeholder={f.ph} /></Input.Wrapper></Input.Root>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h4 className="text-subheading-xs uppercase text-text-sub-600">Location Info</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label.Root>Address Line <Label.Asterisk /></Label.Root>
                <Input.Root size="small"><Input.Wrapper><Input.Input placeholder="Enter address" /></Input.Wrapper></Input.Root>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label.Root>State <Label.Asterisk /></Label.Root>
                <Select.Root size="small">
                  <Select.Trigger><Select.Value placeholder="Select state" /></Select.Trigger>
                  <Select.Content><Select.Item value="placeholder">Select state</Select.Item></Select.Content>
                </Select.Root>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label.Root>City <Label.Asterisk /></Label.Root>
                <Select.Root size="small">
                  <Select.Trigger><Select.Value placeholder="Select city" /></Select.Trigger>
                  <Select.Content><Select.Item value="placeholder">Select city</Select.Item></Select.Content>
                </Select.Root>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label.Root>Pin Code <Label.Asterisk /></Label.Root>
                <Input.Root size="small"><Input.Wrapper><Input.Input placeholder="Enter pin code" /></Input.Wrapper></Input.Root>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h4 className="text-subheading-xs uppercase text-text-sub-600">Employee Info</h4>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Branch Head', ph: 'Enter name' },
                { label: 'Branch Head Email', ph: 'Enter email' },
                { label: 'Branch Head Phone', ph: 'Enter phone' },
              ].map(f => (
                <div key={f.label} className="flex flex-col gap-1.5">
                  <Label.Root>{f.label} <Label.Asterisk /></Label.Root>
                  <Input.Root size="small"><Input.Wrapper><Input.Input placeholder={f.ph} /></Input.Wrapper></Input.Root>
                </div>
              ))}
            </div>
          </section>

          <div className="flex justify-end gap-2">
            <Button.Root variant="neutral" mode="stroke" size="small" onClick={() => setShowAdd(false)}>Cancel</Button.Root>
            <Button.Root variant="neutral" mode="stroke" size="small">Save &amp; Add Another</Button.Root>
            <Button.Root size="small">Save</Button.Root>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <div className="border-b border-stroke-soft-200 p-3">
          <Input.Root size="small" className="w-56">
            <Input.Wrapper><Input.Icon as={RiSearchLine} /><Input.Input placeholder="Search branches..." /></Input.Wrapper>
          </Input.Root>
        </div>
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.Head className="w-10"><Checkbox /></Table.Head>
              {['Branch Id', 'Branch Name', 'Organization', 'Type', 'Vendor', 'Location', 'Email', 'Phone', 'Head', 'Verified By', 'Status'].map(col => (
                <Table.Head key={col}>{col}</Table.Head>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {BRANCHES.map(b => (
              <Table.Row key={b.id}>
                <Table.Cell className="h-auto py-3 w-10"><Checkbox /></Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{b.id}</Table.Cell>
                <Table.Cell className="h-auto py-3">
                  <span className="text-paragraph-sm font-medium text-primary-base cursor-pointer hover:underline">{b.name}</span>
                </Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{b.org}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{b.type}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{b.vendor}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{b.location}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{b.email}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{b.phone}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{b.head}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{b.verifiedBy}</Table.Cell>
                <Table.Cell className="h-auto py-3">
                  <Badge.Root size="medium" variant="light" color={(STATUS_TO_BADGE_COLOR[b.status] ?? 'gray') as BadgeColor}>
                    <Badge.Dot />{b.status}
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
