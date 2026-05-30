'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import * as Button from '@/components/ui/button';
import * as Table from '@/components/ui/table';
import * as Badge from '@/components/ui/badge';
import * as Modal from '@/components/ui/modal';
import * as Input from '@/components/ui/input';
import * as Select from '@/components/ui/select';
import * as Label from '@/components/ui/label';
import { Root as Checkbox } from '@/components/ui/checkbox';
import { RiAddLine } from '@remixicon/react';
import { createManifestAction } from './actions';

type Order = {
  id: string;
  docket_no: string;
  booking_date: string;
  origin: string;
  destination: string;
  client_name: string | null;
  ewaybill_no: string | null;
  chargeable_weight_kg: string | null;
  no_of_pieces: number;
  delivery_type: string;
  damaged_count: number;
  not_received_count: number;
  is_cold_chain: boolean;
};

const DELIVERY_TYPE_LABEL: Record<string, string> = {
  local: 'Local', domestic: 'Domestic', international: 'International',
};

type SelectItem = { id: string; name: string };

export default function PendingDispatchTable({
  rows,
  branches,
  vendors,
}: {
  rows: Order[];
  branches: SelectItem[];
  vendors: SelectItem[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    fromBranchId: '',
    toBranchId: '',
    mode: 'surface',
    vendorId: '',
    vehicleNo: '',
    airwayBillNo: '',
  });

  const allSelected = rows.length > 0 && selected.length === rows.length;
  const toggleAll = () => setSelected(allSelected ? [] : rows.map((r) => r.id));
  const toggleOne = (id: string) =>
    setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    // orderIds tracked separately (checkboxes don't carry to FormData)
    fd.set('orderIds', selected.join(','));
    // Other fields are carried by hidden inputs that mirror state
    startTransition(async () => {
      const r = await createManifestAction(fd);
      if (r.ok) {
        toast.success(`Manifest ${r.manifestNo} created`);
        setOpen(false);
        setSelected([]);
        router.push('/manifest/all');
      } else {
        toast.error(r.error);
      }
    });
  }

  return (
    <>
      {selected.length > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-information-light bg-information-lighter px-4 py-3">
          <span className="text-paragraph-sm text-information-dark">
            <strong>{selected.length}</strong> order{selected.length === 1 ? '' : 's'} selected
          </span>
          <Button.Root size="small" onClick={() => setOpen(true)}>
            <Button.Icon as={RiAddLine} />Create Manifest
          </Button.Root>
        </div>
      )}

      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.Head className="w-10"><Checkbox checked={allSelected} onCheckedChange={toggleAll} /></Table.Head>
            {['Docket No', 'Date', 'Origin', 'Destination', 'Client', 'Delivery Type', 'EwayBill', 'Weight (kg)', 'Pcs', 'Damaged', 'Not Received', 'Cold'].map(c => <Table.Head key={c}>{c}</Table.Head>)}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.length === 0 ? (
            <Table.Row><Table.Cell colSpan={13} className="py-10 text-center text-paragraph-sm text-text-sub-600">No orders pending dispatch</Table.Cell></Table.Row>
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
              <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{DELIVERY_TYPE_LABEL[o.delivery_type] ?? o.delivery_type}</Table.Cell>
              <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600">{o.ewaybill_no ?? 'No EwayBill'}</Table.Cell>
              <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{o.chargeable_weight_kg ?? '—'}</Table.Cell>
              <Table.Cell className="h-auto py-3 text-paragraph-sm text-text-sub-600">{o.no_of_pieces}</Table.Cell>
              <Table.Cell className="h-auto py-3 text-paragraph-sm">
                {o.damaged_count > 0 ? <Badge.Root size="small" variant="lighter" color="red">{o.damaged_count}</Badge.Root> : <span className="text-text-disabled-300">0</span>}
              </Table.Cell>
              <Table.Cell className="h-auto py-3 text-paragraph-sm">
                {o.not_received_count > 0 ? <Badge.Root size="small" variant="lighter" color="orange">{o.not_received_count}</Badge.Root> : <span className="text-text-disabled-300">0</span>}
              </Table.Cell>
              <Table.Cell className="h-auto py-3">{o.is_cold_chain ? <Badge.Root size="small" variant="lighter" color="sky">Cold</Badge.Root> : '—'}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      <Modal.Root open={open} onOpenChange={setOpen}>
        <Modal.Content className="max-w-xl">
          <Modal.Header title="Create Manifest" description={`Add ${selected.length} order${selected.length === 1 ? '' : 's'} to a new manifest`} />
          <form onSubmit={onSubmit}>
            <Modal.Body className="space-y-4 p-5">
              <input type="hidden" name="mode" value={form.mode} />
              <input type="hidden" name="fromBranchId" value={form.fromBranchId} />
              <input type="hidden" name="toBranchId" value={form.toBranchId} />
              <input type="hidden" name="vendorId" value={form.vendorId} />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="From Branch" required>
                  <Select.Root size="small" value={form.fromBranchId} onValueChange={(v) => setForm((s) => ({ ...s, fromBranchId: v }))}>
                    <Select.Trigger><Select.Value placeholder="Select source" /></Select.Trigger>
                    <Select.Content>
                      {branches.map(b => <Select.Item key={b.id} value={b.id}>{b.name}</Select.Item>)}
                    </Select.Content>
                  </Select.Root>
                </Field>
                <Field label="To Branch" required>
                  <Select.Root size="small" value={form.toBranchId} onValueChange={(v) => setForm((s) => ({ ...s, toBranchId: v }))}>
                    <Select.Trigger><Select.Value placeholder="Select destination" /></Select.Trigger>
                    <Select.Content>
                      {branches.map(b => <Select.Item key={b.id} value={b.id}>{b.name}</Select.Item>)}
                    </Select.Content>
                  </Select.Root>
                </Field>
                <Field label="Mode" required>
                  <Select.Root size="small" value={form.mode} onValueChange={(v) => setForm((s) => ({ ...s, mode: v }))}>
                    <Select.Trigger><Select.Value /></Select.Trigger>
                    <Select.Content>
                      <Select.Item value="surface">Surface</Select.Item>
                      <Select.Item value="air">Air</Select.Item>
                      <Select.Item value="cargo">Cargo</Select.Item>
                      <Select.Item value="train">Train</Select.Item>
                      <Select.Item value="local">Local</Select.Item>
                      <Select.Item value="courier">Courier</Select.Item>
                      <Select.Item value="hub_transfer">Hub Transfer</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </Field>
                {form.mode === 'air' ? (
                  <>
                    <Field label="Vendor / Airline" required>
                      <Select.Root size="small" value={form.vendorId} onValueChange={(v) => setForm((s) => ({ ...s, vendorId: v }))}>
                        <Select.Trigger><Select.Value placeholder="Select vendor" /></Select.Trigger>
                        <Select.Content>
                          {vendors.map(v => <Select.Item key={v.id} value={v.id}>{v.name}</Select.Item>)}
                        </Select.Content>
                      </Select.Root>
                    </Field>
                    <Field label="Airway Bill No" required>
                      <Input.Root size="small">
                        <Input.Wrapper>
                          <Input.Input name="airwayBillNo" placeholder="AWB12345678" required />
                        </Input.Wrapper>
                      </Input.Root>
                    </Field>
                  </>
                ) : (
                  <Field label="Vehicle No" required={form.mode !== 'hub_transfer'}>
                    <Input.Root size="small">
                      <Input.Wrapper>
                        <Input.Input name="vehicleNo" placeholder="MH##AB####" />
                      </Input.Wrapper>
                    </Input.Root>
                  </Field>
                )}
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button.Root variant="neutral" mode="stroke" size="small" type="button" onClick={() => setOpen(false)}>Cancel</Button.Root>
              <Button.Root size="small" type="submit" disabled={pending}>
                {pending ? 'Creating...' : `Create Manifest (${selected.length})`}
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
