import React from 'react';
import Link from 'next/link';
import * as Button from '@/components/ui/button';
import * as Table from '@/components/ui/table';
import * as Badge from '@/components/ui/badge';
import PageHeader from '@/components/page-header';
import { RiAwardLine } from '@remixicon/react';
import { cn } from '@/utils/cn';
import { listDesignations } from '@/lib/db/departments';
import { currentOrgId } from '@/lib/tenant';
import QuickAddDesignation from './quick-add';

const EMS_TABS = [
  { label: 'Login Details', href: '/ems/login-details' },
  { label: 'Permission', href: '/ems/permissions' },
  { label: 'Users', href: '/ems/users' },
  { label: 'Departments', href: '/ems/departments' },
  { label: 'Designations', href: '/ems/designations' },
  { label: 'Change Password', href: '/ems/change-password' },
];

export default async function DesignationsPage() {
  const orgId = await currentOrgId();
  const rows = await listDesignations(orgId);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={RiAwardLine}
        iconColor="bg-primary-alpha-10 text-primary-base"
        title="Designations"
        subtitle="Job titles available within the organization"
        breadcrumbs={[{ label: 'EMS', href: '/ems/designations' }, { label: 'Designations' }]}
      >
        <QuickAddDesignation />
      </PageHeader>

      <div className="flex gap-0.5 overflow-x-auto rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-1 shadow-regular-xs">
        {EMS_TABS.map(t => (
          <Link key={t.href} href={t.href}
            className={cn(
              'shrink-0 rounded-lg px-3 py-1.5 text-paragraph-sm font-medium no-underline transition',
              t.href === '/ems/designations'
                ? 'bg-primary-base text-static-white shadow-regular-xs'
                : 'text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950',
            )}
          >{t.label}</Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <div className="border-b border-stroke-soft-200 px-4 py-3">
          <span className="text-paragraph-sm text-text-sub-600">{rows.length} designations</span>
        </div>
        <Table.Root>
          <Table.Header>
            <Table.Row>{['Designation', 'Users', 'Status'].map(c => <Table.Head key={c}>{c}</Table.Head>)}</Table.Row>
          </Table.Header>
          <Table.Body>
            {rows.length === 0 ? (
              <Table.Row><Table.Cell colSpan={3} className="py-10 text-center text-paragraph-sm text-text-sub-600">No designations</Table.Cell></Table.Row>
            ) : rows.map(d => (
              <Table.Row key={d.id}>
                <Table.Cell className="h-auto py-3"><span className="text-paragraph-sm font-medium text-text-strong-950">{d.name}</span></Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{d.user_count}</Table.Cell>
                <Table.Cell className="h-auto py-3">
                  <Badge.Root size="medium" variant="light" color={d.is_active ? 'green' : 'gray'}>
                    <Badge.Dot />{d.is_active ? 'Active' : 'Inactive'}
                  </Badge.Root>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </div>
    </div>
  );
}
