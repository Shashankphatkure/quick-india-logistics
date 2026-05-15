'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import * as Button from '@/components/ui/button';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import * as Select from '@/components/ui/select';
import * as HorizontalStepper from '@/components/ui/horizontal-stepper';
import * as Tooltip from '@/components/ui/tooltip';
import { Root as Checkbox } from '@/components/ui/checkbox';
import PageHeader from '@/components/page-header';
import {
  RiArrowLeftLine, RiArrowRightLine, RiCheckLine,
  RiCalendarCheckLine, RiSaveLine,
} from '@remixicon/react';
import { cn } from '@/utils/cn';

const STEPS = [
  { label: 'Booking Info', key: 'booking' },
  { label: 'Shipper', key: 'shipper' },
  { label: 'Consignee', key: 'consignee' },
  { label: 'Tariff', key: 'tariff' },
  { label: 'Dimensions', key: 'dimensions' },
  { label: 'Images', key: 'images' },
  { label: 'Invoices', key: 'invoices' },
];

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
    <div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-6 shadow-regular-xs space-y-5">
      <div className="border-b border-stroke-soft-200 pb-4">
        <h3 className="text-label-sm text-text-strong-950">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Step1() {
  const [coldChain, setColdChain] = useState(false);
  return (
    <div className="space-y-4">
      <Section title="Booking Info">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Booking For" required>
            <Select.Root size="small" defaultValue="new">
              <Select.Trigger><Select.Value /></Select.Trigger>
              <Select.Content>
                <Select.Item value="new">New</Select.Item>
                <Select.Item value="existing">Existing</Select.Item>
              </Select.Content>
            </Select.Root>
          </Field>
          <Field label="Bill To" required>
            <Input.Root size="small"><Input.Wrapper><Input.Input placeholder="Search Bill To..." /></Input.Wrapper></Input.Root>
          </Field>
          <Field label="Delivery Type" required>
            <div className="flex gap-4 pt-1">
              {['Local', 'Domestic', 'International'].map((t, i) => (
                <label key={t} className="flex items-center gap-1.5 text-paragraph-sm cursor-pointer">
                  <input type="radio" name="delivery" defaultChecked={i === 0} className="accent-primary-base" />{t}
                </label>
              ))}
            </div>
          </Field>
          <Field label="Type Of Booking" required>
            <Select.Root size="small" defaultValue="economy">
              <Select.Trigger><Select.Value /></Select.Trigger>
              <Select.Content>
                <Select.Item value="economy">Economy</Select.Item>
                <Select.Item value="priority">Priority</Select.Item>
              </Select.Content>
            </Select.Root>
          </Field>
          <Field label="Entry Type" required>
            <div className="flex gap-4 pt-1">
              {['Manually', 'Auto Generate'].map((t, i) => (
                <label key={t} className="flex items-center gap-1.5 text-paragraph-sm cursor-pointer">
                  <input type="radio" name="entry" defaultChecked={i === 1} className="accent-primary-base" />{t}
                </label>
              ))}
            </div>
          </Field>
          <Field label="Booking Date & Time" required>
            <Input.Root size="small"><Input.Wrapper><Input.Input type="datetime-local" /></Input.Wrapper></Input.Root>
          </Field>
          <Field label="Delivery Mode" required>
            <Select.Root size="small" defaultValue="door">
              <Select.Trigger><Select.Value /></Select.Trigger>
              <Select.Content>
                <Select.Item value="door">Door To Door</Select.Item>
              </Select.Content>
            </Select.Root>
          </Field>
          <Field label="Barcode Type" required>
            <div className="flex gap-4 pt-1">
              <label className="flex items-center gap-1.5 text-paragraph-sm cursor-pointer">
                <input type="radio" name="barcode" className="accent-primary-base" />Manually
              </label>
              <label className="flex items-center gap-1.5 text-paragraph-sm cursor-pointer">
                <input type="radio" name="barcode" defaultChecked className="accent-primary-base" />Auto Generate
              </label>
            </div>
          </Field>
          <div className="flex flex-col gap-2.5 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-paragraph-sm">
              <Checkbox checked={coldChain} onCheckedChange={v => setColdChain(!!v)} />
              Cold Chain
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-paragraph-sm">
              <Checkbox />Booking Through Eway Bill No
            </label>
          </div>
        </div>
      </Section>

      {coldChain && (
        <Section title="Cold Chain Info">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Asset Type" required>
              <Select.Root size="small" defaultValue="box-logger">
                <Select.Trigger><Select.Value /></Select.Trigger>
                <Select.Content>
                  <Select.Item value="box">With Box</Select.Item>
                  <Select.Item value="box-logger">With Box + With Logger</Select.Item>
                </Select.Content>
              </Select.Root>
            </Field>
            <Field label="Temperature Type" required>
              <Select.Root size="small">
                <Select.Trigger><Select.Value placeholder="Select temperature" /></Select.Trigger>
                <Select.Content>
                  <Select.Item value="2-8">2-8 deg C</Select.Item>
                  <Select.Item value="15-25">15-25 deg C</Select.Item>
                  <Select.Item value="-20">-20 deg C</Select.Item>
                </Select.Content>
              </Select.Root>
            </Field>
            <Field label="Logger No" required>
              <Input.Root size="small"><Input.Wrapper><Input.Input placeholder="Search logger..." /></Input.Wrapper></Input.Root>
            </Field>
            <Field label="Box No" required>
              <Input.Root size="small"><Input.Wrapper><Input.Input placeholder="Search box..." /></Input.Wrapper></Input.Root>
            </Field>
          </div>
        </Section>
      )}
    </div>
  );
}

function Step2() {
  return (
    <Section title="Shipper Info">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Shipper" required>
          <Input.Root size="small"><Input.Wrapper><Input.Input placeholder="Enter shipper name" /></Input.Wrapper></Input.Root>
        </Field>
        <Field label="State" required>
          <Select.Root size="small">
            <Select.Trigger><Select.Value placeholder="Select state" /></Select.Trigger>
            <Select.Content>
              <Select.Item value="punjab">Punjab</Select.Item>
              <Select.Item value="delhi">Delhi</Select.Item>
              <Select.Item value="maharashtra">Maharashtra</Select.Item>
            </Select.Content>
          </Select.Root>
        </Field>
        <Field label="City" required>
          <Select.Root size="small">
            <Select.Trigger><Select.Value placeholder="Select city" /></Select.Trigger>
            <Select.Content>
              <Select.Item value="amritsar">Amritsar</Select.Item>
              <Select.Item value="delhi">New Delhi</Select.Item>
              <Select.Item value="mumbai">Mumbai</Select.Item>
            </Select.Content>
          </Select.Root>
        </Field>
        <Field label="Pin Code" required>
          <Input.Root size="small"><Input.Wrapper><Input.Input placeholder="Enter pin code" /></Input.Wrapper></Input.Root>
        </Field>
        <Field label="Origin">
          <Input.Root size="small"><Input.Wrapper><Input.Input placeholder="Auto-filled from city" /></Input.Wrapper></Input.Root>
        </Field>
        <Field label="Address">
          <Input.Root size="small"><Input.Wrapper><Input.Input placeholder="Enter address" /></Input.Wrapper></Input.Root>
        </Field>
        <label className="flex items-center gap-2 cursor-pointer text-paragraph-sm">
          <Checkbox />Is Invalid Shipper Location
        </label>
      </div>
    </Section>
  );
}

function Step3() {
  return (
    <Section title="Consignee Info">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Consignee" required>
          <Input.Root size="small"><Input.Wrapper><Input.Input placeholder="Enter consignee name" /></Input.Wrapper></Input.Root>
        </Field>
        <Field label="State" required>
          <Select.Root size="small">
            <Select.Trigger><Select.Value placeholder="Select state" /></Select.Trigger>
            <Select.Content><Select.Item value="placeholder">Select state</Select.Item></Select.Content>
          </Select.Root>
        </Field>
        <Field label="City" required>
          <Select.Root size="small">
            <Select.Trigger><Select.Value placeholder="Select city" /></Select.Trigger>
            <Select.Content><Select.Item value="placeholder">Select city</Select.Item></Select.Content>
          </Select.Root>
        </Field>
        <Field label="Pin Code" required>
          <Input.Root size="small"><Input.Wrapper><Input.Input placeholder="Enter pin code" /></Input.Wrapper></Input.Root>
        </Field>
        <Field label="Destination" required>
          <Input.Root size="small"><Input.Wrapper><Input.Input placeholder="Auto-filled from city" /></Input.Wrapper></Input.Root>
        </Field>
        <Field label="Address">
          <Input.Root size="small"><Input.Wrapper><Input.Input placeholder="Enter address" /></Input.Wrapper></Input.Root>
        </Field>
      </div>
    </Section>
  );
}

function Step4() {
  return (
    <Section title="Tariff Info">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Commodity" required>
          <Select.Root size="small">
            <Select.Trigger><Select.Value placeholder="Select commodity" /></Select.Trigger>
            <Select.Content>
              <Select.Item value="general">General</Select.Item>
              <Select.Item value="perishable">Perishable Food</Select.Item>
              <Select.Item value="expiry">Expiry Goods</Select.Item>
            </Select.Content>
          </Select.Root>
        </Field>
        <Field label="Local Delivery Type" required>
          <Select.Root size="small">
            <Select.Trigger><Select.Value placeholder="Select type" /></Select.Trigger>
            <Select.Content>
              <Select.Item value="sales">Sales</Select.Item>
              <Select.Item value="sample">Sample</Select.Item>
              <Select.Item value="expiry">Expiry Goods</Select.Item>
            </Select.Content>
          </Select.Root>
        </Field>
        <Field label="COD" required>
          <Select.Root size="small" defaultValue="no">
            <Select.Trigger><Select.Value /></Select.Trigger>
            <Select.Content>
              <Select.Item value="no">No</Select.Item>
              <Select.Item value="yes">Yes</Select.Item>
            </Select.Content>
          </Select.Root>
        </Field>
        <Field label="Total Quantity" required>
          <Input.Root size="small"><Input.Wrapper><Input.Input type="number" placeholder="0" /></Input.Wrapper></Input.Root>
        </Field>
        <Field label="Actual Weight (kg)" required>
          <Input.Root size="small"><Input.Wrapper><Input.Input type="number" placeholder="0.00" /></Input.Wrapper></Input.Root>
        </Field>
        <Field label="Chargeable Weight">
          <Input.Root size="small"><Input.Wrapper><Input.Input value="0" readOnly className="bg-bg-weak-50 cursor-not-allowed" /></Input.Wrapper></Input.Root>
        </Field>
        <div className="sm:col-span-2 lg:col-span-3">
          <Field label="Remarks">
            <textarea className="w-full rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 text-paragraph-sm text-text-strong-950 outline-none transition hover:bg-bg-weak-50 focus:border-stroke-strong-950 focus:ring-1 focus:ring-stroke-strong-950" rows={2} placeholder="Enter remarks" />
          </Field>
        </div>
      </div>
    </Section>
  );
}

function Step5() {
  return (
    <Section title="Dimensions">
      <div className="space-y-3">
        <div className="grid grid-cols-4 gap-3">
          {['Length (Cm)', 'Breadth (Cm)', 'Height (Cm)', 'No of Pieces'].map(f => (
            <Field key={f} label={f}>
              <Input.Root size="small"><Input.Wrapper><Input.Input type="number" placeholder="0" /></Input.Wrapper></Input.Root>
            </Field>
          ))}
        </div>
        <button className="text-paragraph-sm font-medium text-primary-base hover:underline">
          + Add Another Dimension
        </button>
      </div>
    </Section>
  );
}

function Step6() {
  return (
    <Section title="Order Images">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Caption">
            <Select.Root size="small">
              <Select.Trigger><Select.Value placeholder="Select caption type" /></Select.Trigger>
              <Select.Content>
                <Select.Item value="pickup">Pickup Image</Select.Item>
                <Select.Item value="delivery">Delivery Image</Select.Item>
                <Select.Item value="damage">Damage Image</Select.Item>
              </Select.Content>
            </Select.Root>
          </Field>
          <Field label="Image">
            <div className="flex h-9 items-center rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-3 text-paragraph-sm text-text-sub-600 transition hover:bg-bg-weak-50">
              <input type="file" accept="image/*" className="sr-only" id="order-image" />
              <label htmlFor="order-image" className="cursor-pointer">Choose file...</label>
            </div>
          </Field>
        </div>
        <button className="text-paragraph-sm font-medium text-primary-base hover:underline">
          + Add Another Image
        </button>
      </div>
    </Section>
  );
}

function Step7() {
  return (
    <Section title="Invoices">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field label="EwayBill No">
            <Input.Root size="small"><Input.Wrapper><Input.Input placeholder="Enter EwayBill No" /></Input.Wrapper></Input.Root>
          </Field>
          <Field label="Invoice Date" required>
            <Input.Root size="small"><Input.Wrapper><Input.Input type="date" /></Input.Wrapper></Input.Root>
          </Field>
          <Field label="Invoice Number" required>
            <Input.Root size="small"><Input.Wrapper><Input.Input placeholder="Enter invoice no" /></Input.Wrapper></Input.Root>
          </Field>
          <Field label="Amount" required>
            <Input.Root size="small"><Input.Wrapper><Input.Input type="number" placeholder="0.00" /></Input.Wrapper></Input.Root>
          </Field>
          <Field label="EwayBill Image">
            <div className="flex h-9 items-center rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-3 text-paragraph-sm text-text-sub-600 hover:bg-bg-weak-50 transition cursor-pointer">
              <input type="file" className="sr-only" id="ewb-image" />
              <label htmlFor="ewb-image" className="cursor-pointer">Choose file...</label>
            </div>
          </Field>
          <Field label="Invoice Image">
            <div className="flex h-9 items-center rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-3 text-paragraph-sm text-text-sub-600 hover:bg-bg-weak-50 transition cursor-pointer">
              <input type="file" className="sr-only" id="inv-image" />
              <label htmlFor="inv-image" className="cursor-pointer">Choose file...</label>
            </div>
          </Field>
        </div>
        <button className="text-paragraph-sm font-medium text-primary-base hover:underline">
          + Add Another Invoice
        </button>
      </div>
    </Section>
  );
}

const STEP_COMPONENTS = [Step1, Step2, Step3, Step4, Step5, Step6, Step7];

type StepState = 'completed' | 'active' | 'default';

export default function AddOrderPage() {
  const [step, setStep] = useState(0);
  const StepContent = STEP_COMPONENTS[step];

  return (
    <div className="space-y-6">
      <PageHeader
        icon={RiCalendarCheckLine}
        title="Add Order"
        subtitle="Create a new shipment booking"
        breadcrumbs={[
          { label: 'Booking', href: '/booking/orders' },
          { label: 'Orders', href: '/booking/orders' },
          { label: 'Add Order' },
        ]}
      >
        <Button.Root variant="neutral" mode="stroke" size="small" asChild>
          <Link href="/booking/orders" className="no-underline">Cancel</Link>
        </Button.Root>
      </PageHeader>

      {/* HorizontalStepper */}
      <div className="overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 px-6 py-4 shadow-regular-xs overflow-x-auto">
        <HorizontalStepper.Root>
          {STEPS.map((s, i) => {
            const state: StepState = i < step ? 'completed' : i === step ? 'active' : 'default';
            return (
              <React.Fragment key={s.key}>
                {i > 0 && <HorizontalStepper.SeparatorIcon />}
                <div
                  role={i < step ? 'button' : undefined}
                  tabIndex={i < step ? 0 : undefined}
                  onClick={() => i < step && setStep(i)}
                  onKeyDown={e => e.key === 'Enter' && i < step && setStep(i)}
                  className={cn(i < step && 'cursor-pointer')}
                >
                  <HorizontalStepper.Item state={state}>
                    <HorizontalStepper.ItemIndicator>
                      {i < step ? <RiCheckLine size={11} /> : i + 1}
                    </HorizontalStepper.ItemIndicator>
                    {s.label}
                  </HorizontalStepper.Item>
                </div>
              </React.Fragment>
            );
          })}
        </HorizontalStepper.Root>
      </div>

      {/* Step content */}
      <StepContent />

      {/* Navigation */}
      <div className="flex items-center justify-between rounded-2xl border border-stroke-soft-200 bg-bg-white-0 px-5 py-4 shadow-regular-xs">
        <div className="flex gap-2">
          {step > 0 && (
            <Button.Root variant="neutral" mode="stroke" size="small" onClick={() => setStep(p => p - 1)}>
              <Button.Icon as={RiArrowLeftLine} />Previous
            </Button.Root>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-paragraph-sm text-text-sub-600">
            Step {step + 1} of {STEPS.length}
          </span>
          {step < STEPS.length - 1 ? (
            <Button.Root size="small" onClick={() => setStep(p => p + 1)}>
              Next<Button.Icon as={RiArrowRightLine} />
            </Button.Root>
          ) : (
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <Button.Root size="small">
                  <Button.Icon as={RiSaveLine} />Save Order
                </Button.Root>
              </Tooltip.Trigger>
              <Tooltip.Content>Save and create this order</Tooltip.Content>
            </Tooltip.Root>
          )}
        </div>
      </div>
    </div>
  );
}
