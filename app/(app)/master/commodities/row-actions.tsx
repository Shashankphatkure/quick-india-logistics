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
import { editCommodityAction, toggleCommodityActiveAction } from './actions';

type CommodityType = { id: string; name: string; perishable: boolean };

export default function RowActions({
  row,
  types,
}: {
  row: { id: string; name: string; type_id: string; is_active: boolean; expiry_days: number | null };
  types: CommodityType[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({ name: row.name, typeId: row.type_id, expiryDays: row.expiry_days != null ? String(row.expiry_days) : '' });

  const isPerishable = types.find((t) => t.id === form.typeId)?.perishable ?? false;

  function onEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set('id', row.id);
    fd.set('typeId', form.typeId);
    fd.set('name', form.name);
    fd.set('expiryDays', isPerishable ? form.expiryDays : '');
    startTransition(async () => {
      const r = await editCommodityAction(fd);
      if (r.ok) { toast.success('Updated'); setOpen(false); router.refresh(); }
      else toast.error(r.error);
    });
  }

  function onToggle() {
    startTransition(async () => {
      await toggleCommodityActiveAction(row.id, !row.is_active);
      toast.success(row.is_active ? 'Deactivated' : 'Activated');
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-1">
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <CompactButton.Root variant="ghost" size="large" onClick={() => setOpen(true)}>
            <CompactButton.Icon as={RiEditLine} />
          </CompactButton.Root>
        </Tooltip.Trigger>
        <Tooltip.Content>Edit commodity</Tooltip.Content>
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
        <Modal.Content className="max-w-md">
          <Modal.Header title="Edit Commodity" description="Update name or type" />
          <form onSubmit={onEdit}>
            <Modal.Body className="space-y-3 p-5">
              <input type="hidden" name="typeId" value={form.typeId} />
              <div className="flex flex-col gap-1.5">
                <Label.Root>Name <Label.Asterisk /></Label.Root>
                <Input.Root size="small"><Input.Wrapper>
                  <Input.Input name="name" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} required />
                </Input.Wrapper></Input.Root>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label.Root>Type <Label.Asterisk /></Label.Root>
                <Select.Root size="small" value={form.typeId} onValueChange={(v) => setForm((s) => ({ ...s, typeId: v }))}>
                  <Select.Trigger><Select.Value /></Select.Trigger>
                  <Select.Content>
                    {types.map((t) => <Select.Item key={t.id} value={t.id}>{t.name}</Select.Item>)}
                  </Select.Content>
                </Select.Root>
              </div>
              {isPerishable && (
                <div className="flex flex-col gap-1.5">
                  <Label.Root>Expiry / Shelf Life (days)</Label.Root>
                  <Input.Root size="small"><Input.Wrapper>
                    <Input.Input type="number" min={0} value={form.expiryDays} onChange={(e) => setForm((s) => ({ ...s, expiryDays: e.target.value }))} placeholder="e.g. 7" />
                  </Input.Wrapper></Input.Root>
                </div>
              )}
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
