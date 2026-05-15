'use client';
import React from 'react';
import Link from 'next/link';
import * as Button from '@/components/ui/button';
import * as Input from '@/components/ui/input';
import * as Table from '@/components/ui/table';
import * as Badge from '@/components/ui/badge';
import * as Pagination from '@/components/ui/pagination';
import { Root as Checkbox } from '@/components/ui/checkbox';
import PageHeader from '@/components/page-header';
import StatsStrip from '@/components/stats-strip';
import {
  RiAddLine, RiSearchLine, RiFilterLine,
  RiArrowLeftSLine, RiArrowRightSLine, RiTeamLine, RiArrowUpDownLine,
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

const USERS = [
  { username: 'roshan', email: 'info@quickindialogistics.com', firstName: 'Roshan', phone: '3663232323', type: 'Employee', branch: 'QIL-nagpur', channel: 'Web + Mobile', dept: 'Data Entry', designation: 'Executive', active: true, org: 'Quick India Logistics' },
  { username: 'priya.sharma', email: 'priya@quickindialogistics.com', firstName: 'Priya', phone: '9876543210', type: 'Manager', branch: 'QIL-amritsar', channel: 'Web', dept: 'Admin', designation: 'Manager', active: true, org: 'Quick India Logistics' },
  { username: 'amar.singh', email: 'amar@quickindialogistics.com', firstName: 'Amar', phone: '8765432109', type: 'Employee', branch: 'QIL-delhi', channel: 'Mobile', dept: 'Operation', designation: 'Executive', active: false, org: 'Quick India Logistics' },
];

function UserAvatar({ name }: { name: string }) {
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const colors = ['bg-primary-alpha-16 text-primary-base', 'bg-success-lighter text-success-dark', 'bg-feature-lighter text-feature-base'];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={cn('flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold', color)}>
      {initials}
    </div>
  );
}

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={RiTeamLine}
        iconColor="bg-primary-alpha-10 text-primary-base"
        title="Users"
        subtitle="Manage employees, roles and access"
        breadcrumbs={[{ label: 'EMS', href: '/ems/users' }, { label: 'Users' }]}
      >
        <Button.Root variant="neutral" mode="stroke" size="small"><Button.Icon as={RiFilterLine} />Filter</Button.Root>
        <Button.Root size="small" asChild>
          <Link href="/ems/users/add" className="no-underline"><Button.Icon as={RiAddLine} />Add User</Link>
        </Button.Root>
      </PageHeader>

      <StatsStrip stats={[
        { label: 'Total Users', value: 48, trend: 4, trendLabel: 'this month' },
        { label: 'Active', value: 45, trend: 2.1, trendLabel: 'this month' },
        { label: 'Managers', value: 8, trend: 0 },
        { label: 'Departments', value: 7, trend: 1, trendLabel: 'this month' },
      ]} />

      {/* EMS sub-tabs */}
      <div className="flex gap-0.5 rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-1 shadow-regular-xs w-fit">
        {EMS_TABS.map(t => (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              'rounded-lg px-3 py-1.5 text-paragraph-sm font-medium no-underline transition',
              t.href === '/ems/users'
                ? 'bg-primary-base text-text-white-0 shadow-regular-xs'
                : 'text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950',
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <div className="flex items-center justify-between border-b border-stroke-soft-200 px-4 py-3">
          <Input.Root size="small" className="w-64">
            <Input.Wrapper><Input.Icon as={RiSearchLine} /><Input.Input placeholder="Search users..." /></Input.Wrapper>
          </Input.Root>
          <span className="text-paragraph-sm text-text-sub-600">{USERS.length} users</span>
        </div>
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.Head className="w-10"><Checkbox /></Table.Head>
              {['User', 'Contact', 'Type', 'Home Branch', 'Channel', 'Department', 'Status'].map(col => (
                <Table.Head key={col}>
                  <span className="flex items-center gap-1">{col}<RiArrowUpDownLine size={11} className="text-text-disabled-300" /></span>
                </Table.Head>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {USERS.map(u => (
              <Table.Row key={u.username}>
                <Table.Cell className="h-auto py-3 w-10"><Checkbox /></Table.Cell>
                <Table.Cell className="h-auto py-3">
                  <div className="flex items-center gap-2.5">
                    <UserAvatar name={u.firstName} />
                    <div>
                      <p className="text-paragraph-sm font-semibold text-text-strong-950">{u.firstName}</p>
                      <p className="text-paragraph-xs text-primary-base cursor-pointer">{u.username}</p>
                    </div>
                  </div>
                </Table.Cell>
                <Table.Cell className="h-auto py-3">
                  <div>
                    <p className="text-paragraph-sm text-text-strong-950">{u.email}</p>
                    <p className="text-paragraph-xs text-text-sub-600">{u.phone}</p>
                  </div>
                </Table.Cell>
                <Table.Cell className="h-auto py-3">
                  <Badge.Root size="small" variant="lighter" color={u.type === 'Manager' ? 'blue' : 'gray'}>{u.type}</Badge.Root>
                </Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{u.branch}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{u.channel}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{u.dept}</Table.Cell>
                <Table.Cell className="h-auto py-3">
                  <Badge.Root size="medium" variant="light" color={u.active ? 'green' : 'red'}>
                    <Badge.Dot />{u.active ? 'Active' : 'Inactive'}
                  </Badge.Root>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
        <div className="flex items-center justify-between border-t border-stroke-soft-200 px-5 py-3">
          <span className="text-paragraph-sm text-text-sub-600">Showing 1-3 of 48</span>
          <Pagination.Root variant="rounded">
            <Pagination.NavButton><Pagination.NavIcon as={RiArrowLeftSLine} /></Pagination.NavButton>
            <Pagination.Item current>1</Pagination.Item>
            <Pagination.Item>2</Pagination.Item>
            <Pagination.Item>3</Pagination.Item>
            <Pagination.NavButton><Pagination.NavIcon as={RiArrowRightSLine} /></Pagination.NavButton>
          </Pagination.Root>
        </div>
      </div>
    </div>
  );
}
