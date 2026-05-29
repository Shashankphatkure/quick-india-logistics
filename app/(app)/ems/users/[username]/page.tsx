import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import * as Button from '@/components/ui/button';
import * as Badge from '@/components/ui/badge';
import * as Table from '@/components/ui/table';
import * as Avatar from '@/components/ui/avatar';
import PageHeader from '@/components/page-header';
import { RiArrowLeftLine, RiTeamLine } from '@remixicon/react';
import { getUserByUsername, listUserLoginEvents } from '@/lib/db/users';
import { currentOrgId } from '@/lib/tenant';

const USER_TYPE_LABEL: Record<string, { label: string; color: 'gray' | 'blue' | 'purple' | 'green' }> = {
  employee: { label: 'Employee', color: 'gray' },
  manager: { label: 'Manager', color: 'blue' },
  admin: { label: 'Admin', color: 'purple' },
  super_admin: { label: 'Super Admin', color: 'green' },
};

const CHANNEL_LABEL: Record<string, string> = {
  web: 'Web only', mobile: 'Mobile only', web_and_mobile: 'Web + Mobile',
};

const EVENT_META: Record<string, { label: string; color: 'green' | 'red' | 'gray' | 'orange' }> = {
  login_success: { label: 'Login', color: 'green' },
  login_failure: { label: 'Failed Login', color: 'red' },
  logout: { label: 'Logout', color: 'gray' },
  password_change: { label: 'Password Change', color: 'orange' },
};

function initials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

export default async function UserDetailPage({ params }: { params: { username: string } }) {
  const orgId = await currentOrgId();
  const username = decodeURIComponent(params.username);
  const user = await getUserByUsername(orgId, username);
  if (!user) notFound();

  const events = await listUserLoginEvents(user.id);
  const typeMeta = USER_TYPE_LABEL[user.user_type ?? 'employee'] ?? { label: user.user_type ?? '—', color: 'gray' as const };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={RiTeamLine}
        iconColor="bg-primary-alpha-10 text-primary-base"
        title={user.full_name}
        subtitle={`@${user.username}`}
        breadcrumbs={[{ label: 'EMS', href: '/ems/users' }, { label: 'Users', href: '/ems/users' }, { label: user.username }]}
      >
        <Button.Root variant="neutral" mode="stroke" size="small" asChild>
          <Link href="/ems/users" className="no-underline"><Button.Icon as={RiArrowLeftLine} />All Users</Link>
        </Button.Root>
        <Badge.Root size="medium" variant="light" color={user.is_active ? 'green' : 'red'}>
          <Badge.Dot />{user.is_active ? 'Active' : 'Inactive'}
        </Badge.Root>
      </PageHeader>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5">
          <div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-regular-xs">
            <div className="flex items-center gap-3">
              <Avatar.Root size="48" className="bg-primary-alpha-16 text-primary-base text-label-md font-bold">
                {initials(user.full_name)}
              </Avatar.Root>
              <div>
                <p className="text-label-md text-text-strong-950">{user.full_name}</p>
                <p className="text-paragraph-sm text-primary-base">@{user.username}</p>
                <Badge.Root size="small" variant="lighter" color={typeMeta.color} className="mt-1">{typeMeta.label}</Badge.Root>
              </div>
            </div>
          </div>

          <Card title="Contact">
            <Row label="Email" value={user.email ?? '—'} />
            <Row label="Phone" value={user.phone ?? '—'} />
          </Card>

          <Card title="Assignment">
            <Row label="User Type" value={typeMeta.label} />
            <Row label="Department" value={user.department_name ?? '—'} />
            <Row label="Designation" value={user.designation_name ?? '—'} />
            <Row label="Home Branch" value={user.home_branch_name ?? '—'} />
            <Row label="Channel Access" value={CHANNEL_LABEL[user.channel_access ?? 'web'] ?? user.channel_access} />
          </Card>

          <Card title="Account">
            <Row label="Status" value={user.is_active ? 'Active' : 'Inactive'} />
            <Row label="Must Change Password" value={user.must_change_pw ? 'Yes' : 'No'} />
            <Row label="Created" value={user.created_at} />
            <Row label="Last Login" value={user.last_login_at ?? 'Never'} />
          </Card>
        </div>

        <div className="lg:col-span-2 overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
          <div className="border-b border-stroke-soft-200 px-4 py-3">
            <h3 className="text-label-sm text-text-strong-950">Recent Activity ({events.length})</h3>
          </div>
          <Table.Root>
            <Table.Header>
              <Table.Row>{['Event', 'IP Address', 'When'].map(c => <Table.Head key={c}>{c}</Table.Head>)}</Table.Row>
            </Table.Header>
            <Table.Body>
              {events.length === 0 ? (
                <Table.Row><Table.Cell colSpan={3} className="py-10 text-center text-paragraph-sm text-text-sub-600">No activity recorded yet</Table.Cell></Table.Row>
              ) : events.map(e => {
                const m = EVENT_META[e.event_type] ?? { label: e.event_type, color: 'gray' as const };
                return (
                  <Table.Row key={e.id}>
                    <Table.Cell className="h-auto py-3">
                      <Badge.Root size="small" variant="lighter" color={m.color}>{m.label}</Badge.Root>
                    </Table.Cell>
                    <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{e.ip_address ?? '—'}</Table.Cell>
                    <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{e.occurred_at}</Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table.Root>
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 sm:p-5 shadow-regular-xs">
      <h3 className="text-subheading-2xs uppercase tracking-wider text-text-sub-600 mb-3">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-paragraph-sm text-text-sub-600 shrink-0">{label}</span>
      <span className="text-paragraph-sm font-medium text-text-strong-950 text-right">{value}</span>
    </div>
  );
}
