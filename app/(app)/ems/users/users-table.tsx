'use client';

import React, { useState, useTransition } from 'react';
import { toast } from 'sonner';
import * as Button from '@/components/ui/button';
import * as Table from '@/components/ui/table';
import * as Badge from '@/components/ui/badge';
import * as Drawer from '@/components/ui/drawer';
import * as Label from '@/components/ui/label';
import * as Select from '@/components/ui/select';
import * as Input from '@/components/ui/input';
import * as Divider from '@/components/ui/divider';
import * as Avatar from '@/components/ui/avatar';
import { Root as Checkbox } from '@/components/ui/checkbox';
import { RiAddLine, RiTeamLine, RiArrowUpDownLine, RiToggleLine } from '@remixicon/react';
import { cn } from '@/utils/cn';
import { addUserAction, bulkActivateUsersAction, bulkDeactivateUsersAction } from './actions';
import type { UserRow } from '@/lib/db/users';
import BulkActionBar from '@/components/bulk-action-bar';
import UserRowActions from './user-row-actions';

const AVATAR_TONES = [
  'bg-primary-alpha-16 text-primary-base',
  'bg-success-lighter text-success-dark',
  'bg-feature-lighter text-feature-base',
];

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

function UserAvatar({ name }: { name: string }) {
  const tone = AVATAR_TONES[name.charCodeAt(0) % AVATAR_TONES.length];
  return (
    <Avatar.Root size="32" className={cn(tone, 'text-label-xs font-bold')}>
      {initials(name)}
    </Avatar.Root>
  );
}

const USER_TYPE_LABEL: Record<string, { label: string; color: 'gray' | 'blue' | 'purple' | 'green' }> = {
  employee: { label: 'Employee', color: 'gray' },
  manager: { label: 'Manager', color: 'blue' },
  admin: { label: 'Admin', color: 'purple' },
  super_admin: { label: 'Super Admin', color: 'green' },
};

const CHANNEL_LABEL: Record<string, string> = {
  web: 'Web',
  mobile: 'Mobile',
  web_and_mobile: 'Web + Mobile',
};

export default function UsersTable({
  users,
  totalCount,
  selects,
}: {
  users: UserRow[];
  totalCount: number;
  selects: {
    departments: { id: string; name: string }[];
    designations: { id: string; name: string }[];
    branches: { id: string; name: string }[];
  };
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [departmentId, setDepartmentId] = useState<string>('');
  const [designationId, setDesignationId] = useState<string>('');
  const [homeBranchId, setHomeBranchId] = useState<string>('');
  const [userType, setUserType] = useState<string>('employee');
  const [channelAccess, setChannelAccess] = useState<string>('web');
  const [pending, startTransition] = useTransition();

  const allSelected = users.length > 0 && selected.length === users.length;
  const toggleAll = () => setSelected(allSelected ? [] : users.map((u) => u.id));
  const toggleOne = (id: string) =>
    setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const r = await addUserAction(fd);
      if (r.ok) {
        toast.success('User created');
        (e.target as HTMLFormElement).reset();
        setDepartmentId('');
        setDesignationId('');
        setHomeBranchId('');
        setUserType('employee');
        setChannelAccess('web');
        setShowAdd(false);
      } else {
        toast.error(r.error);
      }
    });
  }

  return (
    <>
      <BulkActionBar
        selected={selected}
        onClear={() => setSelected([])}
        actions={[
          { label: 'Deactivate', icon: RiToggleLine, action: bulkDeactivateUsersAction, successMsg: 'Deactivated {n} users', confirmMsg: 'Deactivate {n} users?' },
          { label: 'Activate', icon: RiToggleLine, action: bulkActivateUsersAction, successMsg: 'Activated {n} users' },
        ]}
      />
      <div className="flex justify-end">
        <Button.Root size="small" onClick={() => setShowAdd(true)}>
          <Button.Icon as={RiAddLine} />
          Add User
        </Button.Root>
      </div>

      <div className="overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stroke-soft-200 px-4 py-3">
          <form method="GET" className="w-full max-w-xs">
            <Input.Root size="small" className="w-full">
              <Input.Wrapper>
                <Input.Input name="search" placeholder="Search users..." />
              </Input.Wrapper>
            </Input.Root>
          </form>
          <span className="text-paragraph-sm text-text-sub-600">{totalCount} users</span>
        </div>
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.Head className="w-10">
                <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
              </Table.Head>
              {['User', 'Contact', 'Type', 'Home Branch', 'Channel', 'Department', 'Status', ''].map(
                (col) => (
                  <Table.Head key={col}>
                    {col && (
                      <span className="flex items-center gap-1">
                        {col}
                        <RiArrowUpDownLine size={11} className="text-text-disabled-300" />
                      </span>
                    )}
                  </Table.Head>
                ),
              )}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {users.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={9} className="py-10 text-center text-paragraph-sm text-text-sub-600">
                  No users found
                </Table.Cell>
              </Table.Row>
            ) : (
              users.map((u) => {
                const typeMeta = USER_TYPE_LABEL[u.user_type ?? 'employee'];
                return (
                  <Table.Row key={u.id}>
                    <Table.Cell className="h-auto py-3 w-10" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selected.includes(u.id)}
                        onCheckedChange={() => toggleOne(u.id)}
                      />
                    </Table.Cell>
                    <Table.Cell className="h-auto py-3">
                      <div className="flex items-center gap-2.5">
                        <UserAvatar name={u.full_name} />
                        <div>
                          <p className="text-paragraph-sm font-semibold text-text-strong-950">
                            {u.full_name}
                          </p>
                          <p className="text-paragraph-xs text-primary-base">{u.username}</p>
                        </div>
                      </div>
                    </Table.Cell>
                    <Table.Cell className="h-auto py-3">
                      <div>
                        <p className="text-paragraph-sm text-text-strong-950">{u.email ?? '—'}</p>
                        <p className="text-paragraph-xs text-text-sub-600">{u.phone ?? ''}</p>
                      </div>
                    </Table.Cell>
                    <Table.Cell className="h-auto py-3">
                      <Badge.Root size="small" variant="lighter" color={typeMeta.color}>
                        {typeMeta.label}
                      </Badge.Root>
                    </Table.Cell>
                    <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">
                      {u.home_branch_name ?? '—'}
                    </Table.Cell>
                    <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">
                      {CHANNEL_LABEL[u.channel_access ?? 'web'] ?? u.channel_access}
                    </Table.Cell>
                    <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">
                      {u.department_name ?? '—'}
                    </Table.Cell>
                    <Table.Cell className="h-auto py-3">
                      <Badge.Root size="medium" variant="light" color={u.is_active ? 'green' : 'red'}>
                        <Badge.Dot />
                        {u.is_active ? 'Active' : 'Inactive'}
                      </Badge.Root>
                    </Table.Cell>
                    <Table.Cell className="h-auto py-3">
                      <UserRowActions user={u} selects={selects} />
                    </Table.Cell>
                  </Table.Row>
                );
              })
            )}
          </Table.Body>
        </Table.Root>
      </div>

      <Drawer.Root open={showAdd} onOpenChange={setShowAdd}>
        <Drawer.Content className="max-w-[720px]">
          <Drawer.Header>
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-alpha-10 text-primary-base">
              <RiTeamLine size={20} />
            </div>
            <div className="flex-1">
              <Drawer.Title>Add User</Drawer.Title>
              <p className="text-paragraph-sm text-text-sub-600">Create a new employee account</p>
            </div>
          </Drawer.Header>
          <Divider.Root />

          <form onSubmit={onSubmit} className="contents">
            <Drawer.Body className="space-y-6 overflow-y-auto p-5">
              {/* Hidden inputs mirror Radix Select state so FormData carries them */}
              <input type="hidden" name="userType" value={userType} />
              <input type="hidden" name="channelAccess" value={channelAccess} />
              <input type="hidden" name="departmentId" value={departmentId} />
              <input type="hidden" name="designationId" value={designationId} />
              <input type="hidden" name="homeBranchId" value={homeBranchId} />
              <div className="space-y-3">
                <p className="text-subheading-xs uppercase tracking-wide text-text-soft-400">User Info</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Full Name" required>
                    <Input.Root size="small">
                      <Input.Wrapper>
                        <Input.Input name="fullName" placeholder="Enter full name" required />
                      </Input.Wrapper>
                    </Input.Root>
                  </Field>
                  <Field label="Username" required>
                    <Input.Root size="small">
                      <Input.Wrapper>
                        <Input.Input name="username" placeholder="Enter username" required />
                      </Input.Wrapper>
                    </Input.Root>
                  </Field>
                  <Field label="Email">
                    <Input.Root size="small">
                      <Input.Wrapper>
                        <Input.Input name="email" type="email" placeholder="Enter email" />
                      </Input.Wrapper>
                    </Input.Root>
                  </Field>
                  <Field label="Phone">
                    <Input.Root size="small">
                      <Input.Wrapper>
                        <Input.Input name="phone" placeholder="Enter phone" />
                      </Input.Wrapper>
                    </Input.Root>
                  </Field>
                  <Field label="Initial Password" required>
                    <Input.Root size="small">
                      <Input.Wrapper>
                        <Input.Input
                          name="password"
                          type="password"
                          placeholder="Min 8 characters"
                          required
                          minLength={8}
                        />
                      </Input.Wrapper>
                    </Input.Root>
                  </Field>
                  <Field label="User Type" required>
                    <Select.Root size="small" value={userType} onValueChange={setUserType}>
                      <Select.Trigger>
                        <Select.Value />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="employee">Employee</Select.Item>
                        <Select.Item value="manager">Manager</Select.Item>
                        <Select.Item value="admin">Admin</Select.Item>
                        <Select.Item value="super_admin">Super Admin</Select.Item>
                      </Select.Content>
                    </Select.Root>
                  </Field>
                  <Field label="Department">
                    <Select.Root size="small" value={departmentId} onValueChange={setDepartmentId}>
                      <Select.Trigger>
                        <Select.Value placeholder="Select department" />
                      </Select.Trigger>
                      <Select.Content>
                        {selects.departments.map((d) => (
                          <Select.Item key={d.id} value={d.id}>
                            {d.name}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                  </Field>
                  <Field label="Designation">
                    <Select.Root size="small" value={designationId} onValueChange={setDesignationId}>
                      <Select.Trigger>
                        <Select.Value placeholder="Select designation" />
                      </Select.Trigger>
                      <Select.Content>
                        {selects.designations.map((d) => (
                          <Select.Item key={d.id} value={d.id}>
                            {d.name}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                  </Field>
                  <Field label="Home Branch">
                    <Select.Root size="small" value={homeBranchId} onValueChange={setHomeBranchId}>
                      <Select.Trigger>
                        <Select.Value placeholder="Select branch" />
                      </Select.Trigger>
                      <Select.Content>
                        {selects.branches.map((b) => (
                          <Select.Item key={b.id} value={b.id}>
                            {b.name}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                  </Field>
                  <Field label="Channel Access">
                    <Select.Root size="small" value={channelAccess} onValueChange={setChannelAccess}>
                      <Select.Trigger>
                        <Select.Value />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="web">Web only</Select.Item>
                        <Select.Item value="mobile">Mobile only</Select.Item>
                        <Select.Item value="web_and_mobile">Web + Mobile</Select.Item>
                      </Select.Content>
                    </Select.Root>
                  </Field>
                </div>
              </div>
            </Drawer.Body>

            <Divider.Root />
            <Drawer.Footer>
              <Drawer.Close asChild>
                <Button.Root
                  variant="neutral"
                  mode="stroke"
                  size="small"
                  type="button"
                  className="w-full"
                >
                  Cancel
                </Button.Root>
              </Drawer.Close>
              <Button.Root size="small" className="w-full" type="submit" disabled={pending}>
                {pending ? 'Saving...' : 'Save User'}
              </Button.Root>
            </Drawer.Footer>
          </form>
        </Drawer.Content>
      </Drawer.Root>
    </>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label.Root>
        {label}
        {required ? <Label.Asterisk /> : null}
      </Label.Root>
      {children}
    </div>
  );
}
