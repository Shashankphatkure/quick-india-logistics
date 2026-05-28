'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import * as Button from '@/components/ui/button';
import * as Table from '@/components/ui/table';
import * as Modal from '@/components/ui/modal';
import * as Input from '@/components/ui/input';
import * as Select from '@/components/ui/select';
import * as Label from '@/components/ui/label';
import { Root as Checkbox } from '@/components/ui/checkbox';
import { RiAddLine } from '@remixicon/react';
import { createRunsheetAction } from './actions';

type Order = {
  id: string;
  docket_no: string;
  booking_date: string;
  origin: string;
  destination: string;
  client_name: string | null;
  ewaybill_no: string | null;
  actual_weight_kg: string | null;
  no_of_pieces: number;
};
type SelectItem = { id: string; name: string };

export default function PendingDeliveryTable({
  rows,
  branches,
}: {
  rows: Order[];
  branches: SelectItem[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({ branchId: '', route: '', vehicleNo: '', driverName: '', driverPhone: '' });

  const allSelected = rows.length > 0 && selected.length === rows.length;
  const toggleAll = () => setSelected(allSelected ? [] : rows.map((r) => r.id));
  const toggleOne = (id: string) =>
    setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set('orderIds', selected.join(','));
    fd.set('branchId', form.branchId);
    startTransition(async () => {
      const r = await createRunsheetAction(fd);
      if (r.ok) {
        toast.success(`Runsheet ${r.runsheetNo} created`);
        setOpen(false);
        setSelected([]);
        router.push('/runsheet/all');
      } else {
        toast.error(r.error);
      }
    });
  }

  return (
    <>
      {selected.length > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-information-light bg-information-lighter px-4 py-3 mb-3">
          <span className="text-paragraph-sm text-information-dark">
            <strong>{selected.length}</strong> order{selected.length === 1 ? '' : 's'} selected
          </span>
          <Button.Root size="small" onClick={() => setOpen(true)}>
            <Button.Icon as={RiAddLine} />Create Runsheet
          </Button.Root>
        </div>
      )}

      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.Head className="w-10"><Checkbox checked={allSelected} onCheckedChange={toggleAll} /></Table.Head>
            {['Docket No', 'Booking Date', 'Origin', 'Destination', 'Client', 'EwayBill No', 'Actual Weight', 'Pcs'].map(c => <Table.Head key={c}>{c}</Table.Head>)}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.length === 0 ? (
            <Table.Row><Table.Cell colSpan={9} className="py-10 text-center text-paragraph-sm text-text-sub-600">No orders pending delivery</Table.Cell></Table.Row>
          ) : rows.map(o => (
            <Table.Row key={o.id}>
              <Table.Cell className="h-auto py-3 w-10" onClick={(e) => e.stopPropagation()}>
                <Checkbox checked={selected.includes(o.id)} onCheckedChange={() => toggleOne(o.id)} />
              </Table.Cell>
              <Table.Cell className="h-auto py-3"><span className="text-paragraph-sm font-medium text-primary-base">{o.docket_no}</span></Table.Cell>
              <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{o.booking_date}</Table.Cell>
              <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{o.origin}</Table.Cell>
              <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{o.destination}</Table.Cell>
              <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{o.client_name ?? '—'}</Table.Cell>
              <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{o.ewaybill_no ?? 'No EwayBill'}</Table.Cell>
              <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{o.actual_weight_kg ?? '—'}</Table.Cell>
              <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{o.no_of_pieces}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      <Modal.Root open={open} onOpenChange={setOpen}>
        <Modal.Content className="max-w-xl">
          <Modal.Header title="Create Runsheet" description={`Add ${selected.length} order${selected.length === 1 ? '' : 's'} to a new local delivery runsheet`} />
          <form onSubmit={onSubmit}>
            <Modal.Body className="space-y-4 p-5">
              <input type="hidden" name="branchId" value={form.branchId} />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Delivery Branch" required>
                  <Select.Root size="small" value={form.branchId} onValueChange={(v) => setForm((s) => ({ ...s, branchId: v }))}>
                    <Select.Trigger><Select.Value placeholder="Select branch" /></Select.Trigger>
                    <Select.Content>{branches.map(b => <Select.Item key={b.id} value={b.id}>{b.name}</Select.Item>)}</Select.Content>
                  </Select.Root>
                </Field>
                <Field label="Route">
                  <Input.Root size="small"><Input.Wrapper><Input.Input name="route" value={form.route} onChange={(e) => setForm((s) => ({ ...s, route: e.target.value }))} placeholder="e.g. South Loop 2" /></Input.Wrapper></Input.Root>
                </Field>
                <Field label="Vehicle No">
                  <Input.Root size="small"><Input.Wrapper><Input.Input name="vehicleNo" value={form.vehicleNo} onChange={(e) => setForm((s) => ({ ...s, vehicleNo: e.target.value }))} placeholder="MH##AB####" /></Input.Wrapper></Input.Root>
                </Field>
                <Field label="Driver Name">
                  <Input.Root size="small"><Input.Wrapper><Input.Input name="driverName" value={form.driverName} onChange={(e) => setForm((s) => ({ ...s, driverName: e.target.value }))} placeholder="Full name" /></Input.Wrapper></Input.Root>
                </Field>
                <Field label="Driver Phone">
                  <Input.Root size="small"><Input.Wrapper><Input.Input name="driverPhone" value={form.driverPhone} onChange={(e) => setForm((s) => ({ ...s, driverPhone: e.target.value }))} placeholder="98xxxxxxxx" /></Input.Wrapper></Input.Root>
                </Field>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button.Root variant="neutral" mode="stroke" size="small" type="button" onClick={() => setOpen(false)}>Cancel</Button.Root>
              <Button.Root size="small" type="submit" disabled={pending}>
                {pending ? 'Creating...' : `Create Runsheet (${selected.length})`}
              </Button.Root>
            </Modal.Footer>
          </form>
        </Modal.Content>
      </Modal.Root>
    </>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label.Root>{label}{required && <Label.Asterisk />}</Label.Root>
      {children}
    </div>
  );
}
