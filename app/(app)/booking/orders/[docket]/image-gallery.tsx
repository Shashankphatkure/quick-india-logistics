'use client';

import React, { useState, useTransition, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import * as Button from '@/components/ui/button';
import * as Modal from '@/components/ui/modal';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import * as Select from '@/components/ui/select';
import * as Badge from '@/components/ui/badge';
import { RiAddLine, RiImageLine, RiDeleteBinLine } from '@remixicon/react';
import { uploadOrderImageAction, deleteOrderImageAction } from './actions';

export type ImageItem = {
  id: string;
  kind: string;
  caption: string | null;
  uploaded_by_name: string | null;
  uploaded_at: string;
  presigned_url: string;
};

const KIND_LABEL: Record<string, string> = {
  pod: 'POD',
  pod_signature: 'POD Signature',
  pickup: 'Pickup',
  delivery: 'Delivery',
  damage: 'Damage',
  ewaybill: 'EwayBill',
  invoice: 'Invoice',
  other: 'Other',
};

const KIND_COLOR: Record<string, 'green' | 'blue' | 'orange' | 'red' | 'gray' | 'purple'> = {
  pod: 'green',
  pod_signature: 'green',
  pickup: 'blue',
  delivery: 'green',
  damage: 'red',
  ewaybill: 'orange',
  invoice: 'purple',
  other: 'gray',
};

export default function ImageGallery({ orderId, images }: { orderId: string; images: ImageItem[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<string>('pod');
  const [caption, setCaption] = useState('');
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = fileRef.current?.files?.[0];
    if (!f) { toast.error('Select a file first'); return; }
    const fd = new FormData();
    fd.set('orderId', orderId);
    fd.set('kind', kind);
    fd.set('caption', caption);
    fd.set('file', f);
    startTransition(async () => {
      const r = await uploadOrderImageAction(fd);
      if (r.ok) {
        toast.success('Image uploaded');
        setOpen(false);
        setCaption('');
        if (fileRef.current) fileRef.current.value = '';
        router.refresh();
      } else {
        toast.error(r.error);
      }
    });
  }

  function onDelete(id: string) {
    if (!confirm('Delete this image?')) return;
    startTransition(async () => {
      const r = await deleteOrderImageAction(id);
      if (r.ok) { toast.success('Image deleted'); router.refresh(); }
      else toast.error(r.error);
    });
  }

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-subheading-2xs uppercase tracking-wider text-text-sub-600">Images & Documents ({images.length})</h3>
        <Button.Root size="xsmall" type="button" onClick={() => setOpen(true)}>
          <Button.Icon as={RiAddLine} />Add
        </Button.Root>
      </div>

      {images.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stroke-soft-200 bg-bg-weak-50 px-4 py-6 text-center">
          <RiImageLine size={24} className="mx-auto text-text-disabled-300" />
          <p className="text-paragraph-sm text-text-sub-600 mt-2">No images uploaded yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((img) => (
            <div key={img.id} className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.presigned_url}
                alt={img.caption ?? img.kind}
                className="aspect-square w-full object-cover cursor-pointer hover:opacity-90"
                onClick={() => setPreviewUrl(img.presigned_url)}
                loading="lazy"
              />
              <div className="p-2 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <Badge.Root size="small" variant="lighter" color={KIND_COLOR[img.kind] ?? 'gray'}>
                    {KIND_LABEL[img.kind] ?? img.kind}
                  </Badge.Root>
                  <button
                    type="button"
                    onClick={() => onDelete(img.id)}
                    disabled={pending}
                    className="rounded p-1 text-text-sub-600 hover:bg-error-lighter hover:text-error-base disabled:opacity-40"
                    aria-label="Delete image"
                  >
                    <RiDeleteBinLine size={13} />
                  </button>
                </div>
                {img.caption && <p className="text-paragraph-xs text-text-strong-950 truncate">{img.caption}</p>}
                <p className="text-paragraph-xs text-text-disabled-300">{img.uploaded_at}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload modal */}
      <Modal.Root open={open} onOpenChange={setOpen}>
        <Modal.Content className="max-w-md">
          <Modal.Header title="Upload Image" description="Attach a photo or document to this order" />
          <form onSubmit={onSubmit}>
            <Modal.Body className="space-y-3 p-5">
              <input type="hidden" name="kind" value={kind} />
              <div className="flex flex-col gap-1.5">
                <Label.Root>Kind <Label.Asterisk /></Label.Root>
                <Select.Root size="small" value={kind} onValueChange={setKind}>
                  <Select.Trigger><Select.Value /></Select.Trigger>
                  <Select.Content>
                    {Object.entries(KIND_LABEL).map(([v, l]) => (
                      <Select.Item key={v} value={v}>{l}</Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label.Root>Caption</Label.Root>
                <Input.Root size="small">
                  <Input.Wrapper>
                    <Input.Input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Optional description" />
                  </Input.Wrapper>
                </Input.Root>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label.Root>File <Label.Asterisk /></Label.Root>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,application/pdf"
                  required
                  className="block w-full text-paragraph-sm text-text-sub-600 file:mr-3 file:rounded-md file:border-0 file:bg-primary-base file:px-3 file:py-1.5 file:text-paragraph-sm file:font-medium file:text-static-white hover:file:bg-primary-darker"
                />
                <p className="text-paragraph-xs text-text-disabled-300">Max 8 MB · JPG/PNG/PDF</p>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button.Root variant="neutral" mode="stroke" size="small" type="button" onClick={() => setOpen(false)}>Cancel</Button.Root>
              <Button.Root size="small" type="submit" disabled={pending}>
                {pending ? 'Uploading...' : 'Upload'}
              </Button.Root>
            </Modal.Footer>
          </form>
        </Modal.Content>
      </Modal.Root>

      {/* Image preview modal */}
      <Modal.Root open={!!previewUrl} onOpenChange={(v) => !v && setPreviewUrl(null)}>
        <Modal.Content className="max-w-3xl">
          <Modal.Header title="Image Preview" />
          <Modal.Body className="p-4 flex items-center justify-center">
            {previewUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="Preview" className="max-h-[70vh] w-auto rounded-lg" />
            )}
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>
    </>
  );
}
