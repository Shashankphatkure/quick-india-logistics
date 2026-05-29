'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import * as Button from '@/components/ui/button';
import * as CompactButton from '@/components/ui/compact-button';
import * as Tooltip from '@/components/ui/tooltip';
import * as Drawer from '@/components/ui/drawer';
import * as Divider from '@/components/ui/divider';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import * as Select from '@/components/ui/select';
import { RiEyeLine, RiEditLine, RiToggleLine, RiTeamLine } from '@remixicon/react';
import { editUserAction, toggleUserActiveAction } from './actions';
import type { UserRow } from '@/lib/db/users';

type Selects = {
  departments: { id: string; name: string }[];
  designations: { id: string; name: string }[];
  branches: { id: string; name: string }[];
};

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <Label.Root>{label}{required ? <Label.Asterisk /> : null}</Label.Root>
      {children}
    </div>
  );
}

export default function UserRowActions({ user, selects }: { user: UserRow; selects: Selects }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    fullName: user.full_name,
    email: user.email ?? '',
    phone: user.phone ?? '',
    userType: user.user_type ?? 'employee',
    channelAccess: user.channel_access ?? 'web',
    departmentId: user.department_id ?? '',
    designationId: user.designation_id ?? '',
    homeBranchId: user.home_branch_id ?? '',
  });

  function onEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData();
    fd.set('id', user.id);
    Object.entries(form).forEach(([k, v]) => fd.set(k, v));
    startTransition(async () => {
      const r = await editUserAction(fd);
      if (r.ok) { toast.success('User updated'); setOpen(false); router.refresh(); }
      else toast.error(r.error);
    });
  }

  function onToggle() {
    startTransition(async () => {
      const r = await toggleUserActiveAction(user.id, !user.is_active);
      if (r.ok) { toast.success(user.is_active ? 'Deactivated' : 'Activated'); router.refresh(); }
      else toast.error(r.error);
    });
  }

  return (
    <div className="flex items-center gap-1">
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <CompactButton.Root variant="ghost" size="large" asChild>
            <Link href={`/ems/users/${user.username}`}>
              <CompactButton.Icon as={RiEyeLine} />
            </Link>
          </CompactButton.Root>
        </Tooltip.Trigger>
        <Tooltip.Content>View user</Tooltip.Content>
      </Tooltip.Root>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <CompactButton.Root variant="ghost" size="large" onClick={() => setOpen(true)}>
            <CompactButton.Icon as={RiEditLine} />
          </CompactButton.Root>
        </Tooltip.Trigger>
        <Tooltip.Content>Edit user</Tooltip.Content>
      </Tooltip.Root>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <CompactButton.Root variant="ghost" size="large" onClick={onToggle} disabled={pending}>
            <CompactButton.Icon as={RiToggleLine} />
          </CompactButton.Root>
        </Tooltip.Trigger>
        <Tooltip.Content>{user.is_active ? 'Deactivate' : 'Activate'}</Tooltip.Content>
      </Tooltip.Root>

      <Drawer.Root open={open} onOpenChange={setOpen}>
        <Drawer.Content className="max-w-[640px]">
          <Drawer.Header>
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-alpha-10 text-primary-base">
              <RiTeamLine size={20} />
            </div>
            <div className="flex-1">
              <Drawer.Title>Edit User</Drawer.Title>
              <p className="text-paragraph-sm text-text-sub-600">{user.username}</p>
            </div>
          </Drawer.Header>
          <Divider.Root />

          <form onSubmit={onEdit} className="contents">
            <Drawer.Body className="space-y-3 overflow-y-auto p-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Full Name" required>
                  <Input.Root size="small"><Input.Wrapper>
                    <Input.Input value={form.fullName} onChange={(e) => setForm((s) => ({ ...s, fullName: e.target.value }))} required />
                  </Input.Wrapper></Input.Root>
                </Field>
                <Field label="Username">
                  <Input.Root size="small"><Input.Wrapper>
                    <Input.Input value={user.username} readOnly disabled />
                  </Input.Wrapper></Input.Root>
                </Field>
                <Field label="Email">
                  <Input.Root size="small"><Input.Wrapper>
                    <Input.Input type="email" value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} />
                  </Input.Wrapper></Input.Root>
                </Field>
                <Field label="Phone">
                  <Input.Root size="small"><Input.Wrapper>
                    <Input.Input value={form.phone} onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))} />
                  </Input.Wrapper></Input.Root>
                </Field>
                <Field label="User Type" required>
                  <Select.Root size="small" value={form.userType} onValueChange={(v) => setForm((s) => ({ ...s, userType: v }))}>
                    <Select.Trigger><Select.Value /></Select.Trigger>
                    <Select.Content>
                      <Select.Item value="employee">Employee</Select.Item>
                      <Select.Item value="manager">Manager</Select.Item>
                      <Select.Item value="admin">Admin</Select.Item>
                      <Select.Item value="super_admin">Super Admin</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </Field>
                <Field label="Channel Access">
                  <Select.Root size="small" value={form.channelAccess} onValueChange={(v) => setForm((s) => ({ ...s, channelAccess: v }))}>
                    <Select.Trigger><Select.Value /></Select.Trigger>
                    <Select.Content>
                      <Select.Item value="web">Web only</Select.Item>
                      <Select.Item value="mobile">Mobile only</Select.Item>
                      <Select.Item value="web_and_mobile">Web + Mobile</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </Field>
                <Field label="Department">
                  <Select.Root size="small" value={form.departmentId} onValueChange={(v) => setForm((s) => ({ ...s, departmentId: v }))}>
                    <Select.Trigger><Select.Value placeholder="Select department" /></Select.Trigger>
                    <Select.Content>
                      {selects.departments.map((d) => <Select.Item key={d.id} value={d.id}>{d.name}</Select.Item>)}
                    </Select.Content>
                  </Select.Root>
                </Field>
                <Field label="Designation">
                  <Select.Root size="small" value={form.designationId} onValueChange={(v) => setForm((s) => ({ ...s, designationId: v }))}>
                    <Select.Trigger><Select.Value placeholder="Select designation" /></Select.Trigger>
                    <Select.Content>
                      {selects.designations.map((d) => <Select.Item key={d.id} value={d.id}>{d.name}</Select.Item>)}
                    </Select.Content>
                  </Select.Root>
                </Field>
                <Field label="Home Branch">
                  <Select.Root size="small" value={form.homeBranchId} onValueChange={(v) => setForm((s) => ({ ...s, homeBranchId: v }))}>
                    <Select.Trigger><Select.Value placeholder="Select branch" /></Select.Trigger>
                    <Select.Content>
                      {selects.branches.map((b) => <Select.Item key={b.id} value={b.id}>{b.name}</Select.Item>)}
                    </Select.Content>
                  </Select.Root>
                </Field>
              </div>
            </Drawer.Body>
            <Divider.Root />
            <Drawer.Footer>
              <Button.Root variant="neutral" mode="stroke" size="small" type="button" className="w-full" onClick={() => setOpen(false)}>Cancel</Button.Root>
              <Button.Root size="small" className="w-full" type="submit" disabled={pending}>{pending ? 'Saving...' : 'Save User'}</Button.Root>
            </Drawer.Footer>
          </form>
        </Drawer.Content>
      </Drawer.Root>
    </div>
  );
}
