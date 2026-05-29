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
import { editVehicleAction, toggleVehicleActiveAction } from './actions';

type Row = {
  id: string;
  number: string;
  vehicle_type: string | null;
  owner_type: string | null;
  model: string | null;
  capacity_kg: string | null;
  is_active: boolean;
};

export default function RowActions({ row }: { row: Row }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    number: row.number,
    vehicleType: row.vehicle_type ?? 'truck',
    ownerType: row.owner_type ?? 'owned',
    model: row.model ?? '',
    capacityKg: row.capacity_kg ?? '',
  });

  function onEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData();
    fd.set('id', row.id);
    fd.set('number', form.number);
    fd.set('vehicleType', form.vehicleType);
    fd.set('ownerType', form.ownerType);
    fd.set('model', form.model);
    fd.set('capacityKg', form.capacityKg);
    startTransition(async () => {
      const r = await editVehicleAction(fd);
      if (r.ok) { toast.success('Vehicle updated'); setOpen(false); router.refresh(); }
      else toast.error(r.error);
    });
  }

  function onToggle() {
    startTransition(async () => {
      await toggleVehicleActiveAction(row.id, !row.is_active);
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
        <Tooltip.Content>Edit vehicle</Tooltip.Content>
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
          <Modal.Header title="Edit Vehicle" description="Update vehicle details" />
          <form onSubmit={onEdit}>
            <Modal.Body className="space-y-3 p-5">
              <div className="flex flex-col gap-1.5">
                <Label.Root>Vehicle No <Label.Asterisk /></Label.Root>
                <Input.Root size="small"><Input.Wrapper>
                  <Input.Input value={form.number} onChange={(e) => setForm((s) => ({ ...s, number: e.target.value }))} required />
                </Input.Wrapper></Input.Root>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label.Root>Type <Label.Asterisk /></Label.Root>
                  <Select.Root size="small" value={form.vehicleType} onValueChange={(v) => setForm((s) => ({ ...s, vehicleType: v }))}>
                    <Select.Trigger><Select.Value /></Select.Trigger>
                    <Select.Content>
                      <Select.Item value="truck">Truck</Select.Item>
                      <Select.Item value="van">Van</Select.Item>
                      <Select.Item value="bike">Bike</Select.Item>
                      <Select.Item value="tempo">Tempo</Select.Item>
                      <Select.Item value="mini_truck">Mini Truck</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label.Root>Owner <Label.Asterisk /></Label.Root>
                  <Select.Root size="small" value={form.ownerType} onValueChange={(v) => setForm((s) => ({ ...s, ownerType: v }))}>
                    <Select.Trigger><Select.Value /></Select.Trigger>
                    <Select.Content>
                      <Select.Item value="owned">Owned</Select.Item>
                      <Select.Item value="partner">Partner</Select.Item>
                      <Select.Item value="market">Market</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label.Root>Model</Label.Root>
                  <Input.Root size="small"><Input.Wrapper>
                    <Input.Input value={form.model} onChange={(e) => setForm((s) => ({ ...s, model: e.target.value }))} />
                  </Input.Wrapper></Input.Root>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label.Root>Capacity (kg)</Label.Root>
                  <Input.Root size="small"><Input.Wrapper>
                    <Input.Input type="number" value={form.capacityKg} onChange={(e) => setForm((s) => ({ ...s, capacityKg: e.target.value }))} />
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
