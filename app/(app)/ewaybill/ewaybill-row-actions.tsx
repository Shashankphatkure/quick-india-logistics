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
import { RiTruckLine } from '@remixicon/react';
import { updatePartBAction } from './actions';
import type { EwaybillRow } from '@/lib/db/ewaybill';

export default function EwaybillRowActions({ row }: { row: EwaybillRow }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    vehicleNo: row.part_b_vehicle_no ?? '',
    transporterName: row.part_b_transporter_name ?? '',
  });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData();
    fd.set('orderId', row.id);
    fd.set('vehicleNo', form.vehicleNo);
    fd.set('transporterName', form.transporterName);
    startTransition(async () => {
      const r = await updatePartBAction(fd);
      if (r.ok) { toast.success('Part B updated'); setOpen(false); router.refresh(); }
      else toast.error(r.error);
    });
  }

  return (
    <>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          {row.part_b_done ? (
            <CompactButton.Root variant="ghost" size="large" onClick={() => setOpen(true)}>
              <CompactButton.Icon as={RiTruckLine} />
            </CompactButton.Root>
          ) : (
            <Button.Root variant="neutral" mode="stroke" size="xsmall" onClick={() => setOpen(true)}>
              <Button.Icon as={RiTruckLine} />Add Part B
            </Button.Root>
          )}
        </Tooltip.Trigger>
        <Tooltip.Content>{row.part_b_done ? 'Edit Part B' : 'Add transporter / vehicle (Part B)'}</Tooltip.Content>
      </Tooltip.Root>

      <Modal.Root open={open} onOpenChange={setOpen}>
        <Modal.Content className="max-w-md">
          <Modal.Header title="E-way Bill — Part B" description={`Docket ${row.docket_no} · ${row.ewaybill_no ?? ''}`} />
          <form onSubmit={onSubmit}>
            <Modal.Body className="space-y-3 p-5">
              <div className="flex flex-col gap-1.5">
                <Label.Root>Vehicle Number <Label.Asterisk /></Label.Root>
                <Input.Root size="small"><Input.Wrapper>
                  <Input.Input
                    value={form.vehicleNo}
                    onChange={(e) => setForm((s) => ({ ...s, vehicleNo: e.target.value.toUpperCase() }))}
                    placeholder="MH01AB1234"
                    required
                  />
                </Input.Wrapper></Input.Root>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label.Root>Transporter Name</Label.Root>
                <Input.Root size="small"><Input.Wrapper>
                  <Input.Input
                    value={form.transporterName}
                    onChange={(e) => setForm((s) => ({ ...s, transporterName: e.target.value }))}
                    placeholder="e.g. Blue Dart Surface"
                  />
                </Input.Wrapper></Input.Root>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button.Root variant="neutral" mode="stroke" size="small" type="button" onClick={() => setOpen(false)}>Cancel</Button.Root>
              <Button.Root size="small" type="submit" disabled={pending}>{pending ? 'Saving...' : 'Save Part B'}</Button.Root>
            </Modal.Footer>
          </form>
        </Modal.Content>
      </Modal.Root>
    </>
  );
}
