'use client';

import React, { useState, useTransition } from 'react';
import { toast } from 'sonner';
import * as Button from '@/components/ui/button';
import * as Modal from '@/components/ui/modal';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import * as Select from '@/components/ui/select';
import { RiAddLine } from '@remixicon/react';
import { addVehicleAction } from './actions';

export default function AddVehicleForm() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({ number: '', vehicleType: 'truck', ownerType: 'owned', model: '', capacityKg: '' });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const r = await addVehicleAction(fd);
      if (r.ok) {
        toast.success('Vehicle added');
        setForm({ number: '', vehicleType: 'truck', ownerType: 'owned', model: '', capacityKg: '' });
        setOpen(false);
      } else toast.error(r.error);
    });
  }

  return (
    <>
      <Button.Root size="small" onClick={() => setOpen(true)}>
        <Button.Icon as={RiAddLine} />Add Vehicle
      </Button.Root>
      <Modal.Root open={open} onOpenChange={setOpen}>
        <Modal.Content className="max-w-md">
          <Modal.Header title="Add Vehicle" description="Register a new vehicle to the fleet" />
          <form onSubmit={onSubmit}>
            <Modal.Body className="space-y-3 p-5">
              <input type="hidden" name="vehicleType" value={form.vehicleType} />
              <input type="hidden" name="ownerType" value={form.ownerType} />
              <F label="Vehicle Number" required>
                <Input.Root size="small"><Input.Wrapper><Input.Input name="number" value={form.number} onChange={(e) => setForm((s) => ({ ...s, number: e.target.value.toUpperCase() }))} placeholder="MH##AB####" required /></Input.Wrapper></Input.Root>
              </F>
              <div className="grid grid-cols-2 gap-3">
                <F label="Type" required>
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
                </F>
                <F label="Owner" required>
                  <Select.Root size="small" value={form.ownerType} onValueChange={(v) => setForm((s) => ({ ...s, ownerType: v }))}>
                    <Select.Trigger><Select.Value /></Select.Trigger>
                    <Select.Content>
                      <Select.Item value="owned">Owned</Select.Item>
                      <Select.Item value="partner">Partner</Select.Item>
                      <Select.Item value="market">Market</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </F>
              </div>
              <F label="Model">
                <Input.Root size="small"><Input.Wrapper><Input.Input name="model" value={form.model} onChange={(e) => setForm((s) => ({ ...s, model: e.target.value }))} placeholder="Tata Ace" /></Input.Wrapper></Input.Root>
              </F>
              <F label="Capacity (kg)">
                <Input.Root size="small"><Input.Wrapper><Input.Input name="capacityKg" type="number" value={form.capacityKg} onChange={(e) => setForm((s) => ({ ...s, capacityKg: e.target.value }))} placeholder="2000" /></Input.Wrapper></Input.Root>
              </F>
            </Modal.Body>
            <Modal.Footer>
              <Button.Root variant="neutral" mode="stroke" size="small" type="button" onClick={() => setOpen(false)}>Cancel</Button.Root>
              <Button.Root size="small" type="submit" disabled={pending}>{pending ? 'Saving...' : 'Add Vehicle'}</Button.Root>
            </Modal.Footer>
          </form>
        </Modal.Content>
      </Modal.Root>
    </>
  );
}

function F({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label.Root>{label}{required && <Label.Asterisk />}</Label.Root>
      {children}
    </div>
  );
}
