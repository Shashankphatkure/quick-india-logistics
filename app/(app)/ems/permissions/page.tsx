'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import * as Button from '@/components/ui/button';
import * as Input from '@/components/ui/input';
import * as Table from '@/components/ui/table';
import * as Badge from '@/components/ui/badge';
import * as Pagination from '@/components/ui/pagination';
import * as Drawer from '@/components/ui/drawer';
import * as Label from '@/components/ui/label';
import * as Select from '@/components/ui/select';
import * as Divider from '@/components/ui/divider';
import { Root as Checkbox } from '@/components/ui/checkbox';
import PageHeader from '@/components/page-header';
import {
  RiAddLine, RiSearchLine, RiFilterLine, RiArrowUpDownLine,
  RiArrowLeftSLine, RiArrowRightSLine, RiShieldCheckLine,
} from '@remixicon/react';
import { cn } from '@/utils/cn';

const EMS_TABS = [
  { label: 'Login Details', href: '/ems/login-details' },
  { label: 'Permission', href: '/ems/permissions' },
  { label: 'Users', href: '/ems/users' },
  { label: 'Departments', href: '/ems/departments' },
  { label: 'Designations', href: '/ems/designations' },
  { label: 'Change Password', href: '/ems/change-password' },
];

const PERMISSIONS = [
  { model: 'Booking', category: 'Dashboard', subModel: 'Booking Date & Time', createdBy: 'Elebcube', createdAt: '11-10-2024' },
  { model: 'Dashboard', category: 'Dashboard', subModel: 'Home +5', createdBy: 'Elebcube', createdAt: '11-10-2024' },
  { model: 'Ems', category: 'Dashboard', subModel: 'Change Password', createdBy: 'Elebcube', createdAt: '11-10-2024' },
  { model: 'Ems', category: 'Pages', subModel: 'Login Details +4', createdBy: 'Elebcube', createdAt: '11-10-2024' },
  { model: 'Ewaybill', category: 'Pages', subModel: 'Eway Dashboard', createdBy: 'Elebcube', createdAt: '11-10-2024' },
  { model: 'Master', category: 'Pages', subModel: 'Assets +12', createdBy: 'Elebcube', createdAt: '11-10-2024' },
  { model: 'Booking', category: 'Pages', subModel: 'Orders +8', createdBy: 'Elebcube', createdAt: '11-10-2024' },
  { model: 'Runsheet', category: 'Pages', subModel: 'Pending Delivery +4', createdBy: 'Elebcube', createdAt: '11-10-2024' },
  { model: 'Manifest', category: 'Pages', subModel: 'Pending For Dispatch +6', createdBy: 'Elebcube', createdAt: '11-10-2024' },
  { model: 'Analytics', category: 'Pages', subModel: 'Reports', createdBy: 'Elebcube', createdAt: '11-10-2024' },
];

const CATEGORY_COLOR: Record<string, 'blue' | 'purple'> = {
  Dashboard: 'blue',
  Pages: 'purple',
};

interface PermissionFormField {
  label: string;
  required?: boolean;
  isSelect?: boolean;
  ph?: string;
}

const PERMISSION_FIELDS: PermissionFormField[] = [
  { label: 'Model Name', required: true, isSelect: true },
  { label: 'Category', required: true, isSelect: true },
  { label: 'Sub Model Name', required: true, ph: 'Enter sub model name' },
];

function FormField({ field }: { field: PermissionFormField }) {
  return (
    <div className="flex flex-col gap-1">
      <Label.Root>
        {field.label}
        {field.required && <Label.Asterisk />}
      </Label.Root>
      {field.isSelect ? (
        <Select.Root size="small">
          <Select.Trigger>
            <Select.Value placeholder={`Select ${field.label.toLowerCase()}`} />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="placeholder">—</Select.Item>
          </Select.Content>
        </Select.Root>
      ) : (
        <Input.Root size="small">
          <Input.Wrapper>
            <Input.Input placeholder={field.ph} />
          </Input.Wrapper>
        </Input.Root>
      )}
    </div>
  );
}

export default function PermissionsPage() {
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const allSelected = selected.length === PERMISSIONS.length;

  const toggleAll = () => setSelected(allSelected ? [] : PERMISSIONS.map((_, i) => i));
  const toggle = (i: number) => setSelected(p => p.includes(i) ? p.filter(x => x !== i) : [...p, i]);

  return (
    <div className="space-y-4">
      <PageHeader
        icon={RiShieldCheckLine}
        iconColor="bg-feature-lighter text-feature-base"
        title="Permissions"
        subtitle="Manage module access control"
        breadcrumbs={[{ label: 'EMS', href: '/ems/users' }, { label: 'Permission' }]}
      >
        <Button.Root variant="neutral" mode="stroke" size="small">
          <Button.Icon as={RiFilterLine} />Filter
        </Button.Root>
        <Button.Root size="small" onClick={() => setShowAdd(true)}>
          <Button.Icon as={RiAddLine} />Add Permission
        </Button.Root>
      </PageHeader>

      {/* EMS sub-tabs */}
      <div className="flex gap-0.5 overflow-x-auto rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-1 shadow-regular-xs">
        {EMS_TABS.map(t => (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              'shrink-0 rounded-lg px-3 py-1.5 text-paragraph-xs font-medium no-underline transition',
              t.href === '/ems/permissions'
                ? 'bg-primary-base text-static-white shadow-regular-xs'
                : 'text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950',
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <div className="border-b border-stroke-soft-200 p-3">
          <Input.Root size="small" className="w-full max-w-xs">
            <Input.Wrapper>
              <Input.Icon as={RiSearchLine} />
              <Input.Input placeholder="Search permissions..." />
            </Input.Wrapper>
          </Input.Root>
        </div>

        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.Head className="w-10">
                <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
              </Table.Head>
              {['Model Name', 'Category', 'Sub Model Name', 'Created By', 'Created At'].map(col => (
                <Table.Head key={col}>
                  <span className="flex items-center gap-1 whitespace-nowrap">
                    {col}<RiArrowUpDownLine size={11} className="text-text-disabled-300" />
                  </span>
                </Table.Head>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {PERMISSIONS.map((p, i) => (
              <Table.Row key={i}>
                <Table.Cell className="h-auto py-2.5 w-10">
                  <Checkbox checked={selected.includes(i)} onCheckedChange={() => toggle(i)} />
                </Table.Cell>
                <Table.Cell className="h-auto py-2.5">
                  <span className="text-paragraph-sm font-medium text-primary-base cursor-pointer hover:underline">
                    {p.model}
                  </span>
                </Table.Cell>
                <Table.Cell className="h-auto py-2.5">
                  <Badge.Root size="small" variant="lighter" color={CATEGORY_COLOR[p.category] ?? 'gray'}>
                    {p.category}
                  </Badge.Root>
                </Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-sm text-text-sub-600">{p.subModel}</Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-sm text-text-sub-600">{p.createdBy}</Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-sm text-text-sub-600">{p.createdAt}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-stroke-soft-200 px-4 py-3">
          <span className="text-paragraph-xs text-text-sub-600">1-10 of 15</span>
          <Pagination.Root variant="rounded">
            <Pagination.NavButton><Pagination.NavIcon as={RiArrowLeftSLine} /></Pagination.NavButton>
            <Pagination.Item current>1</Pagination.Item>
            <Pagination.Item>2</Pagination.Item>
            <Pagination.NavButton><Pagination.NavIcon as={RiArrowRightSLine} /></Pagination.NavButton>
          </Pagination.Root>
        </div>
      </div>

      {/* Add Permission Drawer */}
      <Drawer.Root open={showAdd} onOpenChange={setShowAdd}>
        <Drawer.Content>
          <Drawer.Header>
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-feature-lighter text-feature-base">
              <RiShieldCheckLine size={20} />
            </div>
            <div className="flex-1">
              <Drawer.Title>Add Permission</Drawer.Title>
              <p className="text-paragraph-sm text-text-sub-600">Define a new module access rule</p>
            </div>
          </Drawer.Header>
          <Divider.Root />

          <Drawer.Body className="space-y-4 overflow-y-auto p-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {PERMISSION_FIELDS.map(f => (
                <FormField key={f.label} field={f} />
              ))}
            </div>
          </Drawer.Body>

          <Divider.Root />
          <Drawer.Footer>
            <Drawer.Close asChild>
              <Button.Root variant="neutral" mode="stroke" size="small" className="w-full">
                Cancel
              </Button.Root>
            </Drawer.Close>
            <Button.Root size="small" className="w-full" onClick={() => setShowAdd(false)}>
              Save Permission
            </Button.Root>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer.Root>
    </div>
  );
}
