'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import * as Button from '@/components/ui/button';
import * as Modal from '@/components/ui/modal';
import * as Select from '@/components/ui/select';
import * as Label from '@/components/ui/label';
import * as Badge from '@/components/ui/badge';
import { RiAddLine, RiCloseLine } from '@remixicon/react';
import { attachOrderAssetAction, detachOrderAssetAction } from './asset-actions';

export type AssetOption = { id: string; asset_id: string; asset_kind: string; box_type: string | null; logger_type: string | null };
export type AttachedAsset = { id: string; asset_id: string | null; asset_kind: string; asset_label: string; attached_at: string };

export default function AssetAttach({
  orderId,
  attached,
  available,
}: {
  orderId: string;
  attached: AttachedAsset[];
  available: AssetOption[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [assetId, setAssetId] = useState('');
  const [pending, startTransition] = useTransition();

  const loggers = available.filter((a) => a.asset_kind === 'logger');
  const boxes = available.filter((a) => a.asset_kind === 'box');

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!assetId) { toast.error('Select an asset'); return; }
    const fd = new FormData();
    fd.set('orderId', orderId);
    fd.set('assetId', assetId);
    startTransition(async () => {
      const r = await attachOrderAssetAction(fd);
      if (r.ok) { toast.success('Asset attached'); setOpen(false); setAssetId(''); router.refresh(); }
      else toast.error(r.error);
    });
  }

  function onDetach(rowId: string) {
    if (!confirm('Detach this asset?')) return;
    startTransition(async () => {
      const r = await detachOrderAssetAction(rowId);
      if (r.ok) { toast.success('Asset detached'); router.refresh(); }
      else toast.error(r.error);
    });
  }

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-subheading-2xs uppercase tracking-wider text-text-sub-600">Cold-Chain Assets ({attached.length})</h3>
        <Button.Root size="xsmall" type="button" onClick={() => setOpen(true)}>
          <Button.Icon as={RiAddLine} />Attach
        </Button.Root>
      </div>

      {attached.length === 0 ? (
        <p className="text-paragraph-sm text-text-sub-600">No assets attached</p>
      ) : (
        <div className="space-y-2">
          {attached.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-lg border border-stroke-soft-200 px-3 py-2">
              <div className="flex items-center gap-2.5">
                <Badge.Root size="small" variant="lighter" color={a.asset_kind === 'logger' ? 'purple' : 'sky'}>
                  {a.asset_kind === 'logger' ? 'Logger' : 'Box'}
                </Badge.Root>
                <span className="text-paragraph-sm font-medium text-text-strong-950">{a.asset_label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-paragraph-xs text-text-disabled-300">{a.attached_at}</span>
                <button type="button" onClick={() => onDetach(a.id)} disabled={pending} className="rounded p-1 text-text-sub-600 hover:bg-error-lighter hover:text-error-base disabled:opacity-40" aria-label="Detach">
                  <RiCloseLine size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal.Root open={open} onOpenChange={setOpen}>
        <Modal.Content className="max-w-md">
          <Modal.Header title="Attach Asset" description="Select an available logger or box for this order" />
          <form onSubmit={onSubmit}>
            <Modal.Body className="space-y-3 p-5">
              <div className="flex flex-col gap-1.5">
                <Label.Root>Asset <Label.Asterisk /></Label.Root>
                <Select.Root size="small" value={assetId} onValueChange={setAssetId}>
                  <Select.Trigger><Select.Value placeholder="Select asset" /></Select.Trigger>
                  <Select.Content>
                    {loggers.length > 0 && (
                      <>
                        <div className="px-2 py-1 text-subheading-2xs uppercase tracking-wider text-text-disabled-300">Loggers</div>
                        {loggers.map((a) => (
                          <Select.Item key={a.id} value={a.id}>{a.asset_id} ({a.logger_type ?? 'logger'})</Select.Item>
                        ))}
                      </>
                    )}
                    {boxes.length > 0 && (
                      <>
                        <div className="px-2 py-1 text-subheading-2xs uppercase tracking-wider text-text-disabled-300">Boxes</div>
                        {boxes.map((a) => (
                          <Select.Item key={a.id} value={a.id}>{a.asset_id} ({a.box_type ?? 'box'})</Select.Item>
                        ))}
                      </>
                    )}
                  </Select.Content>
                </Select.Root>
                <p className="text-paragraph-xs text-text-disabled-300">Only assets not currently in-use are shown</p>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button.Root variant="neutral" mode="stroke" size="small" type="button" onClick={() => setOpen(false)}>Cancel</Button.Root>
              <Button.Root size="small" type="submit" disabled={pending}>{pending ? 'Attaching...' : 'Attach'}</Button.Root>
            </Modal.Footer>
          </form>
        </Modal.Content>
      </Modal.Root>
    </>
  );
}
