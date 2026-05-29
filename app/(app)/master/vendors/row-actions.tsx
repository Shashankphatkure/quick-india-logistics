'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import * as Button from '@/components/ui/button';
import * as CompactButton from '@/components/ui/compact-button';
import * as Tooltip from '@/components/ui/tooltip';
import * as Modal from '@/components/ui/modal';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import * as Select from '@/components/ui/select';
import { RiEditLine, RiToggleLine } from '@remixicon/react';
import { editVendorAction, toggleVendorActiveAction } from './actions';
import type { VendorRow } from '@/lib/db/vendors';

export default function RowActions({ row }: { row: VendorRow }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    name: row.name,
    pan: row.pan ?? '',
    companyType: row.company_type ?? '',
    serviceRegion: row.service_region ?? '',
    lineOfBusiness: row.line_of_business ?? '',
    primaryEmail: row.primary_email ?? '',
    primaryPhone: row.primary_phone ?? '',
    status: row.status ?? 'pending',
  });

  function onEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData();
    fd.set('id', row.id);
    fd.set('name', form.name);
    fd.set('pan', form.pan);
    fd.set('companyType', form.companyType);
    fd.set('serviceRegion', form.serviceRegion);
    fd.set('lineOfBusiness', form.lineOfBusiness);
    fd.set('primaryEmail', form.primaryEmail);
    fd.set('primaryPhone', form.primaryPhone);
    fd.set('status', form.status);
    startTransition(async () => {
      const r = await editVendorAction(fd);
      if (r.ok) { toast.success('Vendor updated'); setOpen(false); router.refresh(); }
      else toast.error(r.error);
    });
  }

  function onToggle() {
    startTransition(async () => {
      await toggleVendorActiveAction(row.id, !row.is_active);
      toast.success(row.is_active ? 'Deactivated' : 'Activated');
      router.refresh();
    });
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <CompactButton.Root variant="ghost" size="large" onClick={() => setOpen(true)}>
            <CompactButton.Icon as={RiEditLine} />
          </CompactButton.Root>
        </Tooltip.Trigger>
        <Tooltip.Content>Edit vendor</Tooltip.Content>
      </Tooltip.Root>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <CompactButton.Root variant="ghost" size="large" onClick={onToggle} disabled={pending}>
            <CompactButton.Icon as={RiToggleLine} />
          </CompactButton.Root>
        </Tooltip.Trigger>
        <Tooltip.Content>{row.is_active ? 'Deactivate' : 'Activate'}</Tooltip.Content>
      </Tooltip.Root>

      <Modal.Root open={open} onOpenChange={setOpen}>
        <Modal.Content className="max-w-lg">
          <Modal.Header title="Edit Vendor" description="Update vendor details and status" />
          <form onSubmit={onEdit}>
            <Modal.Body className="space-y-3 p-5">
              <div className="flex flex-col gap-1.5">
                <Label.Root>Vendor Name <Label.Asterisk /></Label.Root>
                <Input.Root size="small"><Input.Wrapper>
                  <Input.Input value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} required />
                </Input.Wrapper></Input.Root>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label.Root>PAN</Label.Root>
                  <Input.Root size="small"><Input.Wrapper>
                    <Input.Input value={form.pan} onChange={(e) => setForm((s) => ({ ...s, pan: e.target.value }))} />
                  </Input.Wrapper></Input.Root>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label.Root>Company Type</Label.Root>
                  <Input.Root size="small"><Input.Wrapper>
                    <Input.Input value={form.companyType} onChange={(e) => setForm((s) => ({ ...s, companyType: e.target.value }))} />
                  </Input.Wrapper></Input.Root>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label.Root>Service Region</Label.Root>
                  <Select.Root size="small" value={form.serviceRegion} onValueChange={(v) => setForm((s) => ({ ...s, serviceRegion: v }))}>
                    <Select.Trigger><Select.Value placeholder="Select region" /></Select.Trigger>
                    <Select.Content>
                      <Select.Item value="pan_india">Pan India</Select.Item>
                      <Select.Item value="state">State</Select.Item>
                      <Select.Item value="city">City</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label.Root>Status <Label.Asterisk /></Label.Root>
                  <Select.Root size="small" value={form.status} onValueChange={(v) => setForm((s) => ({ ...s, status: v }))}>
                    <Select.Trigger><Select.Value /></Select.Trigger>
                    <Select.Content>
                      <Select.Item value="approved">Approved</Select.Item>
                      <Select.Item value="pending">Pending</Select.Item>
                      <Select.Item value="rejected">Rejected</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label.Root>Line of Business</Label.Root>
                <Input.Root size="small"><Input.Wrapper>
                  <Input.Input value={form.lineOfBusiness} onChange={(e) => setForm((s) => ({ ...s, lineOfBusiness: e.target.value }))} />
                </Input.Wrapper></Input.Root>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label.Root>Email</Label.Root>
                  <Input.Root size="small"><Input.Wrapper>
                    <Input.Input type="email" value={form.primaryEmail} onChange={(e) => setForm((s) => ({ ...s, primaryEmail: e.target.value }))} />
                  </Input.Wrapper></Input.Root>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label.Root>Phone</Label.Root>
                  <Input.Root size="small"><Input.Wrapper>
                    <Input.Input value={form.primaryPhone} onChange={(e) => setForm((s) => ({ ...s, primaryPhone: e.target.value }))} />
                  </Input.Wrapper></Input.Root>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button.Root variant="neutral" mode="stroke" size="small" type="button" onClick={() => setOpen(false)}>Cancel</Button.Root>
              <Button.Root size="small" type="submit" disabled={pending}>{pending ? 'Saving...' : 'Save'}</Button.Root>
            </Modal.Footer>
          </form>
        </Modal.Content>
      </Modal.Root>
    </div>
  );
}
