'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import * as Button from '@/components/ui/button';
import * as Modal from '@/components/ui/modal';
import * as Select from '@/components/ui/select';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import * as Textarea from '@/components/ui/textarea';
import { RiArrowRightCircleLine } from '@remixicon/react';
import { nextStatuses, orderStatusLabel } from '@/lib/order-status';
import { advanceOrderStatusAction } from './status-actions';
import DeliverModal from './deliver-modal';

export default function StatusControl({
  orderId,
  docketNo,
  currentStatus,
  consignee,
}: {
  orderId: string;
  docketNo: string;
  currentStatus: string;
  consignee?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const allNext = nextStatuses(currentStatus);
  const canDeliver = allNext.includes('delivered' as never);
  const advanceOptions = allNext.filter((s) => s !== 'delivered');
  const [target, setTarget] = useState<string>(advanceOptions[0] ?? '');
  const [note, setNote] = useState('');
  const [vehicleNo, setVehicleNo] = useState('');

  if (allNext.length === 0) {
    return <span className="text-paragraph-xs text-text-disabled-300">No further status changes</span>;
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData();
    fd.set('orderId', orderId);
    fd.set('status', target);
    fd.set('note', note);
    fd.set('vehicleNo', vehicleNo);
    startTransition(async () => {
      const r = await advanceOrderStatusAction(fd);
      if (r.ok) {
        toast.success(`Status updated to ${orderStatusLabel(target)}`);
        setOpen(false);
        setNote('');
        setVehicleNo('');
        router.refresh();
      } else {
        toast.error(r.error);
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      {canDeliver && (
        <DeliverModal orderId={orderId} docketNo={docketNo} defaultConsignee={consignee} />
      )}
      {advanceOptions.length > 0 && (
        <>
          <Button.Root size="small" variant="neutral" mode="stroke" type="button" onClick={() => setOpen(true)}>
            <Button.Icon as={RiArrowRightCircleLine} />
            Update Status
          </Button.Root>
          <Modal.Root open={open} onOpenChange={setOpen}>
            <Modal.Content className="max-w-md">
              <Modal.Header title={`Update ${docketNo}`} description={`Current: ${orderStatusLabel(currentStatus)}`} />
              <form onSubmit={onSubmit}>
                <Modal.Body className="space-y-3 p-5">
                  <div className="flex flex-col gap-1.5">
                    <Label.Root>New Status <Label.Asterisk /></Label.Root>
                    <Select.Root size="small" value={target} onValueChange={setTarget}>
                      <Select.Trigger><Select.Value /></Select.Trigger>
                      <Select.Content>
                        {advanceOptions.map((s) => (
                          <Select.Item key={s} value={s}>{orderStatusLabel(s)}</Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                  </div>
                  {(target === 'departed' || target === 'pickup_done') && (
                    <div className="flex flex-col gap-1.5">
                      <Label.Root>Vehicle No</Label.Root>
                      <Input.Root size="small">
                        <Input.Wrapper>
                          <Input.Input value={vehicleNo} onChange={(e) => setVehicleNo(e.target.value)} placeholder="MH##AB####" />
                        </Input.Wrapper>
                      </Input.Root>
                    </div>
                  )}
                  <div className="flex flex-col gap-1.5">
                    <Label.Root>Note</Label.Root>
                    <Textarea.Root simple value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Optional remarks (e.g. reason for damage)" />
                  </div>
                </Modal.Body>
                <Modal.Footer>
                  <Button.Root variant="neutral" mode="stroke" size="small" type="button" onClick={() => setOpen(false)}>Cancel</Button.Root>
                  <Button.Root size="small" type="submit" disabled={pending || !target}>
                    {pending ? 'Updating...' : `Set ${orderStatusLabel(target)}`}
                  </Button.Root>
                </Modal.Footer>
              </form>
            </Modal.Content>
          </Modal.Root>
        </>
      )}
    </div>
  );
}
