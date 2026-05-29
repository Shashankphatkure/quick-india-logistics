'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import * as Button from '@/components/ui/button';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import * as Select from '@/components/ui/select';
import * as HorizontalStepper from '@/components/ui/horizontal-stepper';
import * as Textarea from '@/components/ui/textarea';
import { Root as Checkbox } from '@/components/ui/checkbox';
import {
  RiArrowLeftLine, RiArrowRightLine, RiCheckLine, RiSaveLine,
} from '@remixicon/react';
import { cn } from '@/utils/cn';
import { createOrderAction } from './actions';
import { volumetricWeight, chargeableWeight, round3 } from '@/lib/utils/dimension-calc';
import type { ClientDimensionFormula } from '@/lib/db/bill-to';

const STEPS = [
  { label: 'Booking Info', key: 'booking' },
  { label: 'Shipper', key: 'shipper' },
  { label: 'Consignee', key: 'consignee' },
  { label: 'Tariff', key: 'tariff' },
  { label: 'Dimensions', key: 'dimensions' },
  { label: 'Invoices', key: 'invoices' },
];

type SelectItem = { id: string; name: string };
type ClientItem = SelectItem & { bill_to_id: string; use_dimension: string };

export type AddOrderSelects = {
  billTos: SelectItem[];
  clients: ClientItem[];
  branches: SelectItem[];
  formulas: ClientDimensionFormula[];
};

type FormState = {
  // Step 1
  billToId: string;
  clientId: string;
  deliveryType: 'local' | 'domestic' | 'international';
  mode: string;
  isColdChain: boolean;
  priority: 'normal' | 'priority' | 'urgent';
  bookingDate: string;
  // Step 2
  shipperName: string;
  shipperPhone: string;
  shipperAddress: string;
  origin: string;
  originBranchId: string;
  // Step 3
  consigneeName: string;
  consigneePhone: string;
  consigneeAddress: string;
  destination: string;
  destinationBranchId: string;
  // Step 4
  actualWeightKg: string;
  noOfPieces: string;
  noOfBoxes: string;
  // Step 5
  length: string;
  breadth: string;
  height: string;
  // Step 6
  ewaybillNo: string;
  invoiceNumber: string;
  invoiceDate: string;
  invoiceValue: string;
};

const INITIAL: FormState = {
  billToId: '', clientId: '',
  deliveryType: 'domestic', mode: 'surface',
  isColdChain: false, priority: 'normal',
  bookingDate: new Date().toISOString().slice(0, 10),
  shipperName: '', shipperPhone: '', shipperAddress: '',
  origin: '', originBranchId: '',
  consigneeName: '', consigneePhone: '', consigneeAddress: '',
  destination: '', destinationBranchId: '',
  actualWeightKg: '', noOfPieces: '1', noOfBoxes: '0',
  length: '', breadth: '', height: '',
  ewaybillNo: '', invoiceNumber: '', invoiceDate: '', invoiceValue: '',
};

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label.Root>{label}{required && <Label.Asterisk />}</Label.Root>
      {children}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 sm:p-6 shadow-regular-xs space-y-5">
      <div className="border-b border-stroke-soft-200 pb-4">
        <h3 className="text-label-sm text-text-strong-950">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function AddOrderForm({ selects }: { selects: AddOrderSelects }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [state, setState] = useState<FormState>(INITIAL);
  const [pending, startTransition] = useTransition();

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  // Filter clients by selected bill-to
  const clientsForBillTo = state.billToId
    ? selects.clients.filter((c) => c.bill_to_id === state.billToId)
    : selects.clients;

  // Live chargeable-weight calculation (mirrors the authoritative server computation).
  const selectedClient = selects.clients.find((c) => c.id === state.clientId);
  const formula = selects.formulas.find((f) => f.client_id === state.clientId && f.mode === state.mode);
  const L = Number(state.length) || 0;
  const B = Number(state.breadth) || 0;
  const H = Number(state.height) || 0;
  const actual = Number(state.actualWeightKg) || 0;
  const usesDimension = selectedClient?.use_dimension === 'use_kg';
  const volumetric = usesDimension && formula && L && B && H
    ? round3(volumetricWeight(L, B, H, formula.divisor_x, formula.multiplier_y))
    : 0;
  const chargeable = round3(chargeableWeight(actual, volumetric));

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    // Inject all state values
    for (const [k, v] of Object.entries(state)) {
      fd.set(k, typeof v === 'boolean' ? String(v) : String(v ?? ''));
    }
    startTransition(async () => {
      const r = await createOrderAction(fd);
      if (r.ok) {
        toast.success(`Order ${r.docketNo} created`);
        router.push('/booking/orders');
      } else {
        toast.error(r.error);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Stepper */}
      <div className="overflow-x-auto rounded-2xl border border-stroke-soft-200 bg-bg-white-0 px-4 py-4 sm:px-6 shadow-regular-xs">
        <HorizontalStepper.Root className="min-w-max">
          {STEPS.map((s, i) => {
            const stateVal = i < step ? 'completed' : i === step ? 'active' : 'default';
            return (
              <React.Fragment key={s.key}>
                {i > 0 && <HorizontalStepper.SeparatorIcon />}
                <HorizontalStepper.Item
                  state={stateVal}
                  onClick={() => i < step && setStep(i)}
                  className={cn(i < step ? 'cursor-pointer' : 'cursor-default')}
                  type="button"
                >
                  <HorizontalStepper.ItemIndicator>
                    {i < step ? <RiCheckLine size={11} /> : i + 1}
                  </HorizontalStepper.ItemIndicator>
                  <span className="whitespace-nowrap">{s.label}</span>
                </HorizontalStepper.Item>
              </React.Fragment>
            );
          })}
        </HorizontalStepper.Root>
      </div>

      {/* Step 1: Booking Info */}
      <div className={step === 0 ? 'space-y-4' : 'hidden'}>
        <Section title="Booking Info">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Bill To" required>
              <Select.Root size="small" value={state.billToId} onValueChange={(v) => { update('billToId', v); update('clientId', ''); }}>
                <Select.Trigger><Select.Value placeholder="Select Bill To" /></Select.Trigger>
                <Select.Content>
                  {selects.billTos.map((b) => <Select.Item key={b.id} value={b.id}>{b.name}</Select.Item>)}
                </Select.Content>
              </Select.Root>
            </Field>
            <Field label="Client">
              <Select.Root size="small" value={state.clientId} onValueChange={(v) => update('clientId', v)}>
                <Select.Trigger><Select.Value placeholder="Select Client" /></Select.Trigger>
                <Select.Content>
                  {clientsForBillTo.map((c) => <Select.Item key={c.id} value={c.id}>{c.name}</Select.Item>)}
                </Select.Content>
              </Select.Root>
            </Field>
            <Field label="Delivery Type" required>
              <Select.Root size="small" value={state.deliveryType} onValueChange={(v) => update('deliveryType', v as 'local' | 'domestic' | 'international')}>
                <Select.Trigger><Select.Value /></Select.Trigger>
                <Select.Content>
                  <Select.Item value="local">Local</Select.Item>
                  <Select.Item value="domestic">Domestic</Select.Item>
                  <Select.Item value="international">International</Select.Item>
                </Select.Content>
              </Select.Root>
            </Field>
            <Field label="Mode" required>
              <Select.Root size="small" value={state.mode} onValueChange={(v) => update('mode', v)}>
                <Select.Trigger><Select.Value /></Select.Trigger>
                <Select.Content>
                  <Select.Item value="local">Local</Select.Item>
                  <Select.Item value="air">Air</Select.Item>
                  <Select.Item value="surface">Surface</Select.Item>
                  <Select.Item value="cargo">Cargo</Select.Item>
                  <Select.Item value="train">Train</Select.Item>
                  <Select.Item value="courier">Courier</Select.Item>
                  <Select.Item value="warehouse">Warehouse</Select.Item>
                </Select.Content>
              </Select.Root>
            </Field>
            <Field label="Priority">
              <Select.Root size="small" value={state.priority} onValueChange={(v) => update('priority', v as 'normal' | 'priority' | 'urgent')}>
                <Select.Trigger><Select.Value /></Select.Trigger>
                <Select.Content>
                  <Select.Item value="normal">Normal</Select.Item>
                  <Select.Item value="priority">Priority</Select.Item>
                  <Select.Item value="urgent">Urgent</Select.Item>
                </Select.Content>
              </Select.Root>
            </Field>
            <Field label="Booking Date" required>
              <Input.Root size="small">
                <Input.Wrapper>
                  <Input.Input type="date" value={state.bookingDate} onChange={(e) => update('bookingDate', e.target.value)} required />
                </Input.Wrapper>
              </Input.Root>
            </Field>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer text-paragraph-sm">
                <Checkbox checked={state.isColdChain} onCheckedChange={(v) => update('isColdChain', !!v)} />
                Cold Chain Shipment
              </label>
            </div>
          </div>
        </Section>
      </div>

      {/* Step 2: Shipper */}
      <div className={step === 1 ? 'space-y-4' : 'hidden'}>
        <Section title="Shipper Info">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Shipper Name" required>
              <Input.Root size="small">
                <Input.Wrapper>
                  <Input.Input value={state.shipperName} onChange={(e) => update('shipperName', e.target.value)} placeholder="Enter shipper name" />
                </Input.Wrapper>
              </Input.Root>
            </Field>
            <Field label="Shipper Phone">
              <Input.Root size="small">
                <Input.Wrapper>
                  <Input.Input value={state.shipperPhone} onChange={(e) => update('shipperPhone', e.target.value)} placeholder="98xxxxxxxx" />
                </Input.Wrapper>
              </Input.Root>
            </Field>
            <Field label="Origin (City)" required>
              <Input.Root size="small">
                <Input.Wrapper>
                  <Input.Input value={state.origin} onChange={(e) => update('origin', e.target.value)} placeholder="e.g. New Delhi" />
                </Input.Wrapper>
              </Input.Root>
            </Field>
            <Field label="Origin Branch">
              <Select.Root size="small" value={state.originBranchId} onValueChange={(v) => update('originBranchId', v)}>
                <Select.Trigger><Select.Value placeholder="Select origin branch" /></Select.Trigger>
                <Select.Content>
                  {selects.branches.map((b) => <Select.Item key={b.id} value={b.id}>{b.name}</Select.Item>)}
                </Select.Content>
              </Select.Root>
            </Field>
            <div className="sm:col-span-2 lg:col-span-3">
              <Field label="Shipper Address">
                <Textarea.Root simple rows={2} value={state.shipperAddress} onChange={(e) => update('shipperAddress', e.target.value)} placeholder="Full pickup address" />
              </Field>
            </div>
          </div>
        </Section>
      </div>

      {/* Step 3: Consignee */}
      <div className={step === 2 ? 'space-y-4' : 'hidden'}>
        <Section title="Consignee Info">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Consignee Name" required>
              <Input.Root size="small">
                <Input.Wrapper>
                  <Input.Input value={state.consigneeName} onChange={(e) => update('consigneeName', e.target.value)} placeholder="Enter consignee name" />
                </Input.Wrapper>
              </Input.Root>
            </Field>
            <Field label="Consignee Phone">
              <Input.Root size="small">
                <Input.Wrapper>
                  <Input.Input value={state.consigneePhone} onChange={(e) => update('consigneePhone', e.target.value)} placeholder="98xxxxxxxx" />
                </Input.Wrapper>
              </Input.Root>
            </Field>
            <Field label="Destination (City)" required>
              <Input.Root size="small">
                <Input.Wrapper>
                  <Input.Input value={state.destination} onChange={(e) => update('destination', e.target.value)} placeholder="e.g. Amritsar" />
                </Input.Wrapper>
              </Input.Root>
            </Field>
            <Field label="Destination Branch">
              <Select.Root size="small" value={state.destinationBranchId} onValueChange={(v) => update('destinationBranchId', v)}>
                <Select.Trigger><Select.Value placeholder="Select destination branch" /></Select.Trigger>
                <Select.Content>
                  {selects.branches.map((b) => <Select.Item key={b.id} value={b.id}>{b.name}</Select.Item>)}
                </Select.Content>
              </Select.Root>
            </Field>
            <div className="sm:col-span-2 lg:col-span-3">
              <Field label="Consignee Address">
                <Textarea.Root simple rows={2} value={state.consigneeAddress} onChange={(e) => update('consigneeAddress', e.target.value)} placeholder="Full delivery address" />
              </Field>
            </div>
          </div>
        </Section>
      </div>

      {/* Step 4: Tariff */}
      <div className={step === 3 ? 'space-y-4' : 'hidden'}>
        <Section title="Tariff Info">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Actual Weight (kg)" required>
              <Input.Root size="small">
                <Input.Wrapper>
                  <Input.Input type="number" step="0.01" value={state.actualWeightKg} onChange={(e) => update('actualWeightKg', e.target.value)} placeholder="0.00" />
                </Input.Wrapper>
              </Input.Root>
            </Field>
            <Field label="No of Pieces" required>
              <Input.Root size="small">
                <Input.Wrapper>
                  <Input.Input type="number" value={state.noOfPieces} onChange={(e) => update('noOfPieces', e.target.value)} placeholder="1" />
                </Input.Wrapper>
              </Input.Root>
            </Field>
            <Field label="No of Boxes">
              <Input.Root size="small">
                <Input.Wrapper>
                  <Input.Input type="number" value={state.noOfBoxes} onChange={(e) => update('noOfBoxes', e.target.value)} placeholder="0" />
                </Input.Wrapper>
              </Input.Root>
            </Field>
          </div>
        </Section>
      </div>

      {/* Step 5: Dimensions */}
      <div className={step === 4 ? 'space-y-4' : 'hidden'}>
        <Section title="Dimensions">
          <p className="text-paragraph-xs text-text-sub-600">Optional — for dimension-weight calculation</p>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            <Field label="Length (cm)">
              <Input.Root size="small">
                <Input.Wrapper>
                  <Input.Input type="number" value={state.length} onChange={(e) => update('length', e.target.value)} placeholder="0" />
                </Input.Wrapper>
              </Input.Root>
            </Field>
            <Field label="Breadth (cm)">
              <Input.Root size="small">
                <Input.Wrapper>
                  <Input.Input type="number" value={state.breadth} onChange={(e) => update('breadth', e.target.value)} placeholder="0" />
                </Input.Wrapper>
              </Input.Root>
            </Field>
            <Field label="Height (cm)">
              <Input.Root size="small">
                <Input.Wrapper>
                  <Input.Input type="number" value={state.height} onChange={(e) => update('height', e.target.value)} placeholder="0" />
                </Input.Wrapper>
              </Input.Root>
            </Field>
          </div>

          <div className="rounded-xl bg-bg-weak-50 p-4">
            {!state.clientId ? (
              <p className="text-paragraph-sm text-text-sub-600">Select a client in Step 1 to apply its dimension formula.</p>
            ) : !usesDimension ? (
              <p className="text-paragraph-sm text-text-sub-600">
                This client bills by {selectedClient?.use_dimension === 'use_box' ? 'box count' : 'actual weight'} — chargeable weight = actual ({actual || 0} kg).
              </p>
            ) : !formula ? (
              <p className="text-paragraph-sm text-text-sub-600">
                No dimension formula configured for this client on <span className="font-medium">{state.mode}</span> mode — chargeable weight = actual ({actual || 0} kg).
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-paragraph-xs text-text-sub-600">Volumetric</p>
                  <p className="text-title-h6 font-bold text-text-strong-950">{volumetric || 0}<span className="text-paragraph-xs font-normal text-text-sub-600"> kg</span></p>
                  <p className="text-paragraph-xs text-text-disabled-300">L×B×H / {formula.divisor_x}{formula.multiplier_y !== 1 ? ` × ${formula.multiplier_y}` : ''}</p>
                </div>
                <div>
                  <p className="text-paragraph-xs text-text-sub-600">Actual</p>
                  <p className="text-title-h6 font-bold text-text-strong-950">{actual || 0}<span className="text-paragraph-xs font-normal text-text-sub-600"> kg</span></p>
                </div>
                <div>
                  <p className="text-paragraph-xs text-text-sub-600">Chargeable</p>
                  <p className="text-title-h6 font-bold text-primary-base">{chargeable || 0}<span className="text-paragraph-xs font-normal text-text-sub-600"> kg</span></p>
                  <p className="text-paragraph-xs text-text-disabled-300">max(actual, volumetric)</p>
                </div>
              </div>
            )}
          </div>
        </Section>
      </div>

      {/* Step 6: Invoices */}
      <div className={step === 5 ? 'space-y-4' : 'hidden'}>
        <Section title="Invoice & EwayBill">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="EwayBill No">
              <Input.Root size="small">
                <Input.Wrapper>
                  <Input.Input value={state.ewaybillNo} onChange={(e) => update('ewaybillNo', e.target.value)} placeholder="12-digit number" />
                </Input.Wrapper>
              </Input.Root>
            </Field>
            <Field label="Invoice Number">
              <Input.Root size="small">
                <Input.Wrapper>
                  <Input.Input value={state.invoiceNumber} onChange={(e) => update('invoiceNumber', e.target.value)} placeholder="INV-..." />
                </Input.Wrapper>
              </Input.Root>
            </Field>
            <Field label="Invoice Date">
              <Input.Root size="small">
                <Input.Wrapper>
                  <Input.Input type="date" value={state.invoiceDate} onChange={(e) => update('invoiceDate', e.target.value)} />
                </Input.Wrapper>
              </Input.Root>
            </Field>
            <Field label="Invoice Value (₹)">
              <Input.Root size="small">
                <Input.Wrapper>
                  <Input.Input type="number" step="0.01" value={state.invoiceValue} onChange={(e) => update('invoiceValue', e.target.value)} placeholder="0.00" />
                </Input.Wrapper>
              </Input.Root>
            </Field>
          </div>
        </Section>

        <Section title="Review">
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-paragraph-sm">
            <div><dt className="text-text-sub-600">Bill To</dt><dd className="font-medium text-text-strong-950">{selects.billTos.find(b => b.id === state.billToId)?.name ?? '—'}</dd></div>
            <div><dt className="text-text-sub-600">Client</dt><dd className="font-medium text-text-strong-950">{selects.clients.find(c => c.id === state.clientId)?.name ?? '—'}</dd></div>
            <div><dt className="text-text-sub-600">Shipper</dt><dd className="font-medium text-text-strong-950">{state.shipperName || '—'}</dd></div>
            <div><dt className="text-text-sub-600">Consignee</dt><dd className="font-medium text-text-strong-950">{state.consigneeName || '—'}</dd></div>
            <div><dt className="text-text-sub-600">Route</dt><dd className="font-medium text-text-strong-950">{state.origin || '—'} → {state.destination || '—'}</dd></div>
            <div><dt className="text-text-sub-600">Mode / Type</dt><dd className="font-medium text-text-strong-950">{state.mode} / {state.deliveryType}</dd></div>
            <div><dt className="text-text-sub-600">Weight / Pcs</dt><dd className="font-medium text-text-strong-950">{state.actualWeightKg || '—'} kg / {state.noOfPieces || '—'} pcs</dd></div>
            <div><dt className="text-text-sub-600">Cold Chain</dt><dd className="font-medium text-text-strong-950">{state.isColdChain ? 'Yes' : 'No'}</dd></div>
          </dl>
        </Section>
      </div>

      {/* Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 px-4 py-4 sm:px-5 shadow-regular-xs">
        <div className="flex gap-2">
          {step > 0 && (
            <Button.Root variant="neutral" mode="stroke" size="small" type="button" onClick={() => setStep((p) => p - 1)}>
              <Button.Icon as={RiArrowLeftLine} />Previous
            </Button.Root>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-paragraph-sm text-text-sub-600">Step {step + 1} of {STEPS.length}</span>
          {step < STEPS.length - 1 ? (
            <Button.Root size="small" type="button" onClick={() => setStep((p) => p + 1)}>
              Next<Button.Icon as={RiArrowRightLine} />
            </Button.Root>
          ) : (
            <Button.Root size="small" type="submit" disabled={pending}>
              <Button.Icon as={RiSaveLine} />
              {pending ? 'Saving...' : 'Save Order'}
            </Button.Root>
          )}
        </div>
      </div>
    </form>
  );
}
