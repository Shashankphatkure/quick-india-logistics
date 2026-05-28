import React from 'react';
import Link from 'next/link';
import * as Table from '@/components/ui/table';
import * as Badge from '@/components/ui/badge';
import PageHeader from '@/components/page-header';
import StatsStrip from '@/components/stats-strip';
import { RiShieldKeyholeLine, RiCheckLine, RiCloseLine } from '@remixicon/react';
import { cn } from '@/utils/cn';
import { canAccessPath, type UserType } from '@/lib/permissions';
import { one } from '@/lib/db';
import { currentOrgId } from '@/lib/tenant';

const EMS_TABS = [
  { label: 'Login Details', href: '/ems/login-details' },
  { label: 'Permission', href: '/ems/permissions' },
  { label: 'Users', href: '/ems/users' },
  { label: 'Departments', href: '/ems/departments' },
  { label: 'Designations', href: '/ems/designations' },
  { label: 'Change Password', href: '/ems/change-password' },
];

// Modules grouped by area for the matrix
const MODULES: { area: string; routes: { label: string; path: string }[] }[] = [
  {
    area: 'Operations',
    routes: [
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'EwayBill', path: '/ewaybill' },
      { label: 'Booking · Orders', path: '/booking/orders' },
      { label: 'Booking · Delivery Info', path: '/booking/delivery-info' },
      { label: 'Manifest · All', path: '/manifest/all' },
      { label: 'Manifest · Pending Dispatch', path: '/manifest/pending-dispatch' },
      { label: 'Manifest · Forwarding', path: '/manifest/forwarding' },
      { label: 'Manifest · Pending Depart', path: '/manifest/pending-depart' },
      { label: 'Manifest · Incoming', path: '/manifest/incoming' },
      { label: 'Runsheet · All', path: '/runsheet/all' },
      { label: 'Runsheet · Pending Delivery', path: '/runsheet/pending-delivery' },
    ],
  },
  {
    area: 'Master',
    routes: [
      { label: 'Commodities', path: '/master/commodities' },
      { label: 'Branches', path: '/master/branches' },
      { label: 'Vendors', path: '/master/vendors' },
      { label: 'Vehicles', path: '/master/vehicles' },
      { label: 'Assets', path: '/master/assets' },
    ],
  },
  {
    area: 'Analytics',
    routes: [
      { label: 'Reports', path: '/analytics/reports' },
    ],
  },
  {
    area: 'EMS (Admin)',
    routes: [
      { label: 'Users', path: '/ems/users' },
      { label: 'Departments', path: '/ems/departments' },
      { label: 'Designations', path: '/ems/designations' },
      { label: 'Login Details', path: '/ems/login-details' },
      { label: 'Permissions', path: '/ems/permissions' },
      { label: 'Change Password', path: '/ems/change-password' },
    ],
  },
  {
    area: 'Organization',
    routes: [
      { label: 'Organization', path: '/organization' },
    ],
  },
];

const ROLES: { type: UserType; label: string; color: 'gray' | 'blue' | 'purple' | 'green' }[] = [
  { type: 'employee',    label: 'Employee',    color: 'gray' },
  { type: 'manager',     label: 'Manager',     color: 'blue' },
  { type: 'admin',       label: 'Admin',       color: 'purple' },
  { type: 'super_admin', label: 'Super Admin', color: 'green' },
];

export default async function PermissionsPage() {
  const orgId = await currentOrgId();
  const counts = await one<Record<UserType, string>>(
    `select
       count(*) filter (where user_type='employee')::text as employee,
       count(*) filter (where user_type='manager')::text as manager,
       count(*) filter (where user_type='admin')::text as admin,
       count(*) filter (where user_type='super_admin')::text as super_admin
     from users where org_id=$1`,
    [orgId],
  );

  const allowedCount: Record<UserType, number> = { employee: 0, manager: 0, admin: 0, super_admin: 0 };
  const totalPaths = MODULES.reduce((s, m) => s + m.routes.length, 0);
  for (const m of MODULES) {
    for (const r of m.routes) {
      for (const role of ROLES) {
        if (canAccessPath(role.type, r.path)) allowedCount[role.type]++;
      }
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={RiShieldKeyholeLine}
        iconColor="bg-feature-lighter text-feature-base"
        title="Permissions"
        subtitle="Role-based access — which routes each user role can reach"
        breadcrumbs={[{ label: 'EMS' }, { label: 'Permissions' }]}
      />

      <StatsStrip stats={ROLES.map((r) => ({
        label: r.label,
        value: `${allowedCount[r.type]} / ${totalPaths}`,
        trend: 0,
        trendLabel: `${counts?.[r.type] ?? 0} users`,
      }))} />

      <div className="flex gap-0.5 overflow-x-auto rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-1 shadow-regular-xs">
        {EMS_TABS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              'shrink-0 rounded-lg px-3 py-1.5 text-paragraph-sm font-medium no-underline transition',
              t.href === '/ems/permissions'
                ? 'bg-primary-base text-static-white shadow-regular-xs'
                : 'text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950',
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="rounded-xl border border-information-light bg-information-lighter p-4 text-paragraph-sm text-information-dark">
        <p className="font-medium">Path-prefix rules — defined in <code className="font-mono text-paragraph-xs">lib/permissions.ts</code></p>
        <p className="text-paragraph-xs text-information-base mt-1">
          Most-specific path match wins. <strong>Super Admin</strong> always passes.
          Granular per-action permissions (transcripts: &ldquo;Excel-importable matrix per department&rdquo;) are deferred — this current view shows route-level access only.
        </p>
      </div>

      {MODULES.map((m) => (
        <div key={m.area} className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
          <div className="border-b border-stroke-soft-200 px-4 py-2.5">
            <h3 className="text-subheading-xs uppercase tracking-wider text-text-sub-600">{m.area}</h3>
          </div>
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.Head>Module / Route</Table.Head>
                {ROLES.map((r) => <Table.Head key={r.type} className="text-center">{r.label}</Table.Head>)}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {m.routes.map((r) => (
                <Table.Row key={r.path}>
                  <Table.Cell className="h-auto py-3">
                    <div>
                      <p className="text-paragraph-sm font-medium text-text-strong-950">{r.label}</p>
                      <p className="text-paragraph-xs text-text-disabled-300 font-mono">{r.path}</p>
                    </div>
                  </Table.Cell>
                  {ROLES.map((role) => {
                    const allowed = canAccessPath(role.type, r.path);
                    return (
                      <Table.Cell key={role.type} className="h-auto py-3 text-center">
                        {allowed ? (
                          <span className="inline-flex size-6 items-center justify-center rounded-full bg-success-lighter text-success-base"><RiCheckLine size={13} /></span>
                        ) : (
                          <span className="inline-flex size-6 items-center justify-center rounded-full bg-bg-weak-50 text-text-disabled-300"><RiCloseLine size={13} /></span>
                        )}
                      </Table.Cell>
                    );
                  })}
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </div>
      ))}
    </div>
  );
}
