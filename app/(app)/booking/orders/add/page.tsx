'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import * as Button from '@/components/ui/button';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import * as Select from '@/components/ui/select';
import * as HorizontalStepper from '@/components/ui/horizontal-stepper';
import * as Tooltip from '@/components/ui/tooltip';
import * as FileUpload from '@/components/ui/file-upload';
import * as LinkButton from '@/components/ui/link-button';
import * as Textarea from '@/components/ui/textarea';
import { Root as Checkbox } from '@/components/ui/checkbox';
import PageHeader from '@/components/page-header';
import {
  RiArrowLeftLine, RiArrowRightLine, RiCheckLine,
  RiCalendarCheckLine, RiSaveLine, RiAddLine, RiUploadCloud2Line,
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
    <div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 sm:p-6 shadow-regular-xs space-y-5">
      <div className="border-b border-stroke-soft-200 pb-4">
        <h3 className="text-label-sm text-text-strong-950">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function RadioGroup({ name, options, defaultIndex = 0 }: { name: string; options: string[]; defaultIndex?: number }) {
  const [selected, setSelected] = useState(defaultIndex);
  return (
    <div className="flex flex-wrap gap-4 pt-1">
      {options.map((opt, i) => (
        <label key={opt} className="flex items-center gap-1.5 text-paragraph-sm cursor-pointer">
          <input
            type="radio"
            name={name}
            checked={selected === i}
            onChange={() => setSelected(i)}
            className="accent-primary-base"
          />
          {opt}
        </label>
      ))}
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
            <RadioGroup name="delivery" options={['Local', 'Domestic', 'International']} defaultIndex={0} />
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
            <RadioGroup name="entry" options={['Manually', 'Auto Generate']} defaultIndex={1} />
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
            <RadioGroup name="barcode" options={['Manually', 'Auto Generate']} defaultIndex={1} />
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
            <Textarea.Root simple placeholder="Enter remarks" rows={2} />
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
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {['Length (Cm)', 'Breadth (Cm)', 'Height (Cm)', 'No of Pieces'].map(f => (
            <Field key={f} label={f}>
              <Input.Root size="small"><Input.Wrapper><Input.Input type="number" placeholder="0" /></Input.Wrapper></Input.Root>
            </Field>
          ))}
        </div>
        <LinkButton.Root variant="primary" size="medium">
          <LinkButton.Icon as={RiAddLine} />
          Add Another Dimension
        </LinkButton.Root>
      </div>
    </Section>
  );
}

function Step6() {
  return (
    <Section title="Order Images">
      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            <FileUpload.Root className="p-4 gap-3">
              <input type="file" accept="image/*" tabIndex={-1} className="hidden" />
              <FileUpload.Icon as={RiUploadCloud2Line} />
              <FileUpload.Button>Choose file...</FileUpload.Button>
            </FileUpload.Root>
          </Field>
        </div>
        <LinkButton.Root variant="primary" size="medium">
          <LinkButton.Icon as={RiAddLine} />
          Add Another Image
        </LinkButton.Root>
      </div>
    </Section>
  );
}

function Step7() {
  return (
    <Section title="Invoices">
      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            <FileUpload.Root className="p-4 gap-3">
              <input type="file" tabIndex={-1} className="hidden" />
              <FileUpload.Icon as={RiUploadCloud2Line} />
              <FileUpload.Button>Choose file...</FileUpload.Button>
            </FileUpload.Root>
          </Field>
          <Field label="Invoice Image">
            <FileUpload.Root className="p-4 gap-3">
              <input type="file" tabIndex={-1} className="hidden" />
              <FileUpload.Icon as={RiUploadCloud2Line} />
              <FileUpload.Button>Choose file...</FileUpload.Button>
            </FileUpload.Root>
          </Field>
        </div>
        <LinkButton.Root variant="primary" size="medium">
          <LinkButton.Icon as={RiAddLine} />
          Add Another Invoice
        </LinkButton.Root>
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
      <div className="overflow-x-auto rounded-2xl border border-stroke-soft-200 bg-bg-white-0 px-4 py-4 sm:px-6 shadow-regular-xs">
        <HorizontalStepper.Root className="min-w-max">
          {STEPS.map((s, i) => {
            const state: StepState = i < step ? 'completed' : i === step ? 'active' : 'default';
            return (
              <React.Fragment key={s.key}>
                {i > 0 && <HorizontalStepper.SeparatorIcon />}
                <HorizontalStepper.Item
                  state={state}
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

      {/* Step content */}
      <StepContent />

      {/* Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 px-4 py-4 sm:px-5 shadow-regular-xs">
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
