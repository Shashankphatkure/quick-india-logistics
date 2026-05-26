'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import * as Button from '@/components/ui/button';
import * as Input from '@/components/ui/input';
import * as Table from '@/components/ui/table';
import * as Drawer from '@/components/ui/drawer';
import * as Label from '@/components/ui/label';
import * as Divider from '@/components/ui/divider';
import { Root as Checkbox } from '@/components/ui/checkbox';
import PageHeader from '@/components/page-header';
import { RiAddLine, RiMedalLine, RiArrowUpDownLine } from '@remixicon/react';
import { cn } from '@/utils/cn';

const EMS_TABS = [
  { label: 'Login Details', href: '/ems/login-details' },
  { label: 'Permission', href: '/ems/permissions' },
  { label: 'Users', href: '/ems/users' },
  { label: 'Departments', href: '/ems/departments' },
  { label: 'Designations', href: '/ems/designations' },
  { label: 'Change Password', href: '/ems/change-password' },
];

const DESIGNATIONS = [
  { name: 'Manager', org: 'Quick India Logistics Pvt Ltd', createdDate: '14-10-2024' },
  { name: 'Executive', org: 'Quick India Logistics Pvt Ltd', createdDate: '14-10-2024' },
];

export default function DesignationsPage() {
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const allSelected = selected.length === DESIGNATIONS.length;

  const toggleAll = () => setSelected(allSelected ? [] : DESIGNATIONS.map(d => d.name));
  const toggle = (name: string) => setSelected(p => p.includes(name) ? p.filter(x => x !== name) : [...p, name]);

  return (
    <div className="space-y-4">
      <PageHeader
        icon={RiMedalLine}
        iconColor="bg-away-lighter text-away-base"
        title="Designations"
        subtitle="Define employee designation levels"
        breadcrumbs={[{ label: 'EMS', href: '/ems/users' }, { label: 'Designations' }]}
      >
        <Button.Root size="small" onClick={() => setShowAdd(true)}>
          <Button.Icon as={RiAddLine} />Add Designation
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
              t.href === '/ems/designations'
                ? 'bg-primary-base text-static-white shadow-regular-xs'
                : 'text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950',
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.Head className="w-10">
                <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
              </Table.Head>
              {['Designation Name', 'Organization', 'Created Date'].map(col => (
                <Table.Head key={col}>
                  <span className="flex items-center gap-1 whitespace-nowrap">
                    {col}<RiArrowUpDownLine size={11} className="text-text-disabled-300" />
                  </span>
                </Table.Head>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {DESIGNATIONS.map(d => (
              <Table.Row key={d.name}>
                <Table.Cell className="h-auto py-2.5 w-10">
                  <Checkbox checked={selected.includes(d.name)} onCheckedChange={() => toggle(d.name)} />
                </Table.Cell>
                <Table.Cell className="h-auto py-2.5">
                  <span className="text-paragraph-sm font-medium text-primary-base cursor-pointer hover:underline">
                    {d.name}
                  </span>
                </Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-sm text-text-sub-600">{d.org}</Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-sm text-text-sub-600">{d.createdDate}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </div>

      {/* Add Designation Drawer */}
      <Drawer.Root open={showAdd} onOpenChange={setShowAdd}>
        <Drawer.Content>
          <Drawer.Header>
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-away-lighter text-away-base">
              <RiMedalLine size={20} />
            </div>
            <div className="flex-1">
              <Drawer.Title>Add Designation</Drawer.Title>
              <p className="text-paragraph-sm text-text-sub-600">Create a new designation level</p>
            </div>
          </Drawer.Header>
          <Divider.Root />

          <Drawer.Body className="space-y-4 overflow-y-auto p-5">
            <div className="flex flex-col gap-1">
              <Label.Root>
                Designation Name
                <Label.Asterisk />
              </Label.Root>
              <Input.Root size="small">
                <Input.Wrapper>
                  <Input.Input placeholder="Enter Designation name" />
                </Input.Wrapper>
              </Input.Root>
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
              Save
            </Button.Root>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer.Root>
    </div>
  );
}
