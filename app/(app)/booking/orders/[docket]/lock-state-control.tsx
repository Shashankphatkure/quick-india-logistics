'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import * as Button from '@/components/ui/button';
import * as Modal from '@/components/ui/modal';
import * as Label from '@/components/ui/label';
import * as Textarea from '@/components/ui/textarea';
import * as Badge from '@/components/ui/badge';
import { RiLockUnlockLine } from '@remixicon/react';
import { nextLockState, canAdvanceLockState, lockStateLabel } from '@/lib/order-status';
import { advanceLockStateAction } from './status-actions';

export default function LockStateControl({
  orderId,
  currentLockState,
  userType,
}: {
  orderId: string;
  currentLockState: string;
  userType: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const [pending, startTransition] = useTransition();

  const next = nextLockState(currentLockState);
  const canAdvance = canAdvanceLockState(userType, currentLockState);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData();
    fd.set('orderId', orderId);
    fd.set('note', note);
    startTransition(async () => {
      const r = await advanceLockStateAction(fd);
      if (r.ok) {
        toast.success(`Lock advanced to ${next ? lockStateLabel(next) : ''}`);
        setOpen(false);
        setNote('');
        router.refresh();
      } else {
        toast.error(r.error);
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-paragraph-sm text-text-sub-600">Current Stage</span>
        <Badge.Root size="small" variant="lighter" color={currentLockState === 'admin_locked' ? 'green' : 'gray'}>
          {lockStateLabel(currentLockState)}
        </Badge.Root>
      </div>

      {!next ? (
        <p className="text-paragraph-xs text-text-sub-600">Fully locked — no further advancement.</p>
      ) : canAdvance ? (
        <>
          <Button.Root size="xsmall" variant="neutral" mode="stroke" type="button" className="w-full" onClick={() => setOpen(true)}>
            <Button.Icon as={RiLockUnlockLine} />
            Advance to {lockStateLabel(next)}
          </Button.Root>
          <Modal.Root open={open} onOpenChange={setOpen}>
            <Modal.Content className="max-w-md">
              <Modal.Header
                title="Advance Lock Stage"
                description={`${lockStateLabel(currentLockState)} → ${lockStateLabel(next)}`}
              />
              <form onSubmit={onSubmit}>
                <Modal.Body className="space-y-3 p-5">
                  <div className="flex flex-col gap-1.5">
                    <Label.Root>Note</Label.Root>
                    <Textarea.Root simple value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Optional remark for the audit trail" />
                  </div>
                </Modal.Body>
                <Modal.Footer>
                  <Button.Root variant="neutral" mode="stroke" size="small" type="button" onClick={() => setOpen(false)}>Cancel</Button.Root>
                  <Button.Root size="small" type="submit" disabled={pending}>
                    {pending ? 'Advancing...' : `Advance to ${lockStateLabel(next)}`}
                  </Button.Root>
                </Modal.Footer>
              </form>
            </Modal.Content>
          </Modal.Root>
        </>
      ) : (
        <p className="text-paragraph-xs text-text-disabled-300">
          Advancing to {lockStateLabel(next)} is restricted to {next === 'admin_locked' ? 'admins' : 'authorized roles'}.
        </p>
      )}
    </div>
  );
}
