'use client';

import React, { useState, useTransition, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import * as Button from '@/components/ui/button';
import * as Modal from '@/components/ui/modal';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import * as Textarea from '@/components/ui/textarea';
import { RiCheckboxCircleLine } from '@remixicon/react';
import { markDeliveredAction } from './status-actions';

/**
 * Reusable "Mark Delivered" modal. Renders its own trigger button.
 * Captures recipient name/phone + optional POD image, calls markDeliveredAction.
 */
export default function DeliverModal({
  orderId,
  docketNo,
  defaultConsignee,
  triggerLabel = 'Mark Delivered',
  triggerSize = 'small',
  triggerVariant = 'primary',
}: {
  orderId: string;
  docketNo: string;
  defaultConsignee?: string;
  triggerLabel?: string;
  triggerSize?: 'small' | 'xsmall';
  triggerVariant?: 'primary' | 'neutral';
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [recipientName, setRecipientName] = useState(defaultConsignee ?? '');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [note, setNote] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData();
    fd.set('orderId', orderId);
    fd.set('recipientName', recipientName);
    fd.set('recipientPhone', recipientPhone);
    fd.set('note', note);
    const f = fileRef.current?.files?.[0];
    if (f) fd.set('pod', f);
    startTransition(async () => {
      const r = await markDeliveredAction(fd);
      if (r.ok) {
        toast.success(`${docketNo} marked delivered`);
        setOpen(false);
        router.refresh();
      } else {
        toast.error(r.error);
      }
    });
  }

  return (
    <>
      <Button.Root size={triggerSize} variant={triggerVariant} mode={triggerVariant === 'neutral' ? 'stroke' : 'filled'} type="button" onClick={() => setOpen(true)}>
        <Button.Icon as={RiCheckboxCircleLine} />
        {triggerLabel}
      </Button.Root>
      <Modal.Root open={open} onOpenChange={setOpen}>
        <Modal.Content className="max-w-md">
          <Modal.Header title={`Mark ${docketNo} Delivered`} description="Capture proof of delivery" />
          <form onSubmit={onSubmit}>
            <Modal.Body className="space-y-3 p-5">
              <div className="flex flex-col gap-1.5">
                <Label.Root>Recipient Name <Label.Asterisk /></Label.Root>
                <Input.Root size="small">
                  <Input.Wrapper>
                    <Input.Input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Who received it" required autoFocus />
                  </Input.Wrapper>
                </Input.Root>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label.Root>Recipient Phone</Label.Root>
                <Input.Root size="small">
                  <Input.Wrapper>
                    <Input.Input value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)} placeholder="98xxxxxxxx" />
                  </Input.Wrapper>
                </Input.Root>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label.Root>POD Image / Signature</Label.Root>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,application/pdf"
                  className="block w-full text-paragraph-sm text-text-sub-600 file:mr-3 file:rounded-md file:border-0 file:bg-primary-base file:px-3 file:py-1.5 file:text-paragraph-sm file:font-medium file:text-static-white hover:file:bg-primary-darker"
                />
                <p className="text-paragraph-xs text-text-disabled-300">Optional — max 8 MB. You can also add it later from the gallery.</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label.Root>Note</Label.Root>
                <Textarea.Root simple value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Any delivery remarks" />
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button.Root variant="neutral" mode="stroke" size="small" type="button" onClick={() => setOpen(false)}>Cancel</Button.Root>
              <Button.Root size="small" type="submit" disabled={pending || !recipientName.trim()}>
                {pending ? 'Saving...' : 'Confirm Delivery'}
              </Button.Root>
            </Modal.Footer>
          </form>
        </Modal.Content>
      </Modal.Root>
    </>
  );
}
