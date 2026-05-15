'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import * as Button from '@/components/ui/button';
import * as Badge from '@/components/ui/badge';
import * as Drawer from '@/components/ui/drawer';
import * as Select from '@/components/ui/select';
import * as Tooltip from '@/components/ui/tooltip';
import PageHeader from '@/components/page-header';
import {
  RiCalendarCheckLine,
  RiCheckLine,
  RiTimeLine,
  RiMapPinLine,
  RiUserLine,
  RiBoxLine,
  RiTruckLine,
  RiPrinterLine,
  RiDownloadLine,
  RiEditLine,
  RiMoreLine,
  RiSnowflakeLine,
  RiFileTextLine,
  RiImageLine,
  RiArrowRightLine,
  RiBarcodeLine,
  RiInformationLine,
} from '@remixicon/react';
import { cn } from '@/utils/cn';
import { STATUS_TO_BADGE_COLOR, type BadgeColor } from '@/lib/ui-types';

const ORDER = {
  docket: '738396',
  date: '09-05-2026',
  time: '18:12',
  status: 'In Transit',
  type: 'Domestic',
  cold: true,
  bookingType: 'Priority',
  deliveryMode: 'Door To Door',
  entryType: 'Auto Generate',

  client: 'Mylan Pharmaceuticals',
  billTo: 'Mylan Pharmaceuticals Pvt Ltd',

  shipper: {
    name: 'Mylan Pharma Pvt Ltd',
    address: 'Plot No. 564, Phase-III',
    city: 'Amritsar',
    state: 'Punjab',
    pincode: '142857',
    origin: 'Amritsar',
  },

  consignee: {
    name: 'C&F Delhi Mylan',
    address: '12B, Okhla Industrial Area',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110020',
    destination: 'New Delhi',
  },

  tariff: {
    commodity: 'Perishable Food',
    deliveryType: 'Sales',
    cod: 'No',
    quantity: 2,
    actualWeight: 4.5,
    chargeableWeight: 4.5,
  },

  dimensions: [
    { length: 30, breadth: 20, height: 15, pieces: 1 },
    { length: 25, breadth: 18, height: 12, pieces: 1 },
  ],

  coldChain: {
    assetType: 'With Box + With Logger',
    temperature: '2-8 deg C',
    loggerNo: 'TN3226010700-MULTI USE-QILMUU5991389',
    boxNo: 'SSCL-110L-VAQ-4003-VAQ-TEC-QILVAQ-TEC001817',
  },

  invoices: [
    { ewbNo: 'Z12200252213', date: '09-05-2026', invoiceNo: 'INV-2026-1124', amount: 12500, status: 'Valid' },
  ],

  barcodes: ['QILDEL7383960001'],

  timeline: [
    { status: 'Shipment Order Received', time: '09-05-2026 18:12', by: 'Sunilkumar', done: true },
    { status: 'Shipment Picked Up', time: '09-05-2026 22:24', by: 'Amarnath', done: true },
    { status: 'Shipment Arrived At Hub', time: '09-05-2026 22:24', by: 'Amarnath', done: true },
    { status: 'Shipment In Transit', time: '11-05-2026 10:25', by: 'Adarshin', done: true },
    { status: 'Out For Delivery', time: null, by: null, done: false },
    { status: 'Delivered', time: null, by: null, done: false },
  ],
};

interface InfoRowProps { label: string; value: React.ReactNode; }
function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-stroke-soft-200 last:border-0">
      <span className="text-paragraph-sm text-text-sub-600 shrink-0 min-w-[120px]">{label}</span>
      <span className="text-paragraph-sm font-medium text-text-strong-950 text-right">{value}</span>
    </div>
  );
}

interface SectionCardProps { title: string; icon: React.ElementType; iconColor?: string; children: React.ReactNode; }
function SectionCard({ title, icon: Icon, iconColor = 'bg-bg-soft-200 text-text-sub-600', children }: SectionCardProps) {
  return (
    <div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs overflow-hidden">
      <div className="flex items-center gap-2.5 border-b border-stroke-soft-200 px-5 py-3.5">
        <div className={cn('flex size-7 items-center justify-center rounded-lg', iconColor)}>
          <Icon size={14} />
        </div>
        <h3 className="text-label-sm text-text-strong-950">{title}</h3>
      </div>
      <div className="px-5 py-1">{children}</div>
    </div>
  );
}

export default function OrderDetailPage() {
  const params = useParams();
  const docket = params.docket as string;
  const [updateDrawerOpen, setUpdateDrawerOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  const statusColor = (STATUS_TO_BADGE_COLOR[ORDER.status] ?? 'gray') as BadgeColor;

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        icon={RiCalendarCheckLine}
        title={`Order #${docket}`}
        subtitle={`Booked ${ORDER.date} at ${ORDER.time} · ${ORDER.type}`}
        breadcrumbs={[
          { label: 'Booking', href: '/booking/orders' },
          { label: 'Orders', href: '/booking/orders' },
          { label: `#${docket}` },
        ]}
      >
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <Button.Root variant="neutral" mode="stroke" size="small">
              <Button.Icon as={RiBarcodeLine} />
            </Button.Root>
          </Tooltip.Trigger>
          <Tooltip.Content>Print barcode</Tooltip.Content>
        </Tooltip.Root>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <Button.Root variant="neutral" mode="stroke" size="small">
              <Button.Icon as={RiPrinterLine} />
            </Button.Root>
          </Tooltip.Trigger>
          <Tooltip.Content>Print docket</Tooltip.Content>
        </Tooltip.Root>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <Button.Root variant="neutral" mode="stroke" size="small">
              <Button.Icon as={RiDownloadLine} />
            </Button.Root>
          </Tooltip.Trigger>
          <Tooltip.Content>Export PDF</Tooltip.Content>
        </Tooltip.Root>
        <Button.Root size="small" onClick={() => setUpdateDrawerOpen(true)}>
          <Button.Icon as={RiEditLine} />
          Update Status
        </Button.Root>
      </PageHeader>

      {/* Status bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 px-5 py-4 shadow-regular-xs">
        <Badge.Root size="medium" variant="light" color={statusColor}>
          <Badge.Dot />{ORDER.status}
        </Badge.Root>
        {ORDER.cold && (
          <Badge.Root size="medium" variant="lighter" color="sky">
            <Badge.Icon as={RiSnowflakeLine} />Cold Chain
          </Badge.Root>
        )}
        <Badge.Root size="medium" variant="lighter" color="gray">
          {ORDER.bookingType}
        </Badge.Root>
        <Badge.Root size="medium" variant="lighter" color="gray">
          {ORDER.deliveryMode}
        </Badge.Root>
        <div className="ml-auto flex items-center gap-1.5 text-paragraph-sm text-text-sub-600">
          <RiMapPinLine size={14} className="text-text-disabled-300" />
          <span className="font-medium text-text-strong-950">{ORDER.shipper.origin}</span>
          <RiArrowRightLine size={13} className="text-text-disabled-300" />
          <span className="font-medium text-text-strong-950">{ORDER.consignee.destination}</span>
        </div>
      </div>

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Left column — timeline + quick info */}
        <div className="flex flex-col gap-5">
          {/* Status timeline */}
          <div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs overflow-hidden">
            <div className="flex items-center justify-between border-b border-stroke-soft-200 px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex size-7 items-center justify-center rounded-lg bg-primary-alpha-10">
                  <RiTimeLine size={14} className="text-primary-base" />
                </div>
                <h3 className="text-label-sm text-text-strong-950">Status Timeline</h3>
              </div>
              <button className="text-text-sub-600 hover:text-text-strong-950 transition">
                <RiMoreLine size={16} />
              </button>
            </div>
            <div className="px-5 py-4 space-y-0.5">
              {ORDER.timeline.map((event, i) => (
                <div key={i} className="flex gap-3">
                  {/* Dot + line */}
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      'flex size-6 shrink-0 items-center justify-center rounded-full transition',
                      event.done && i === ORDER.timeline.filter(e => e.done).length - 1
                        ? 'bg-primary-base shadow-lg ring-2 ring-primary-alpha-24'
                        : event.done
                        ? 'bg-success-base'
                        : 'bg-bg-soft-200 border border-stroke-soft-200',
                    )}>
                      {event.done ? (
                        <RiCheckLine size={12} className="text-white" />
                      ) : (
                        <div className="size-1.5 rounded-full bg-text-disabled-300" />
                      )}
                    </div>
                    {i < ORDER.timeline.length - 1 && (
                      <div className={cn(
                        'mt-0.5 w-px flex-1 min-h-[28px]',
                        event.done ? 'bg-success-light' : 'bg-stroke-soft-200',
                      )} />
                    )}
                  </div>
                  {/* Content */}
                  <div className="pb-4 min-w-0 flex-1">
                    <p className={cn(
                      'text-paragraph-sm font-medium leading-tight',
                      event.done ? 'text-text-strong-950' : 'text-text-disabled-300',
                    )}>
                      {event.status}
                    </p>
                    {event.time && (
                      <p className="text-paragraph-xs text-text-sub-600 mt-0.5">
                        {event.time} &bull; {event.by}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Barcode */}
          <SectionCard title="Barcode" icon={RiBarcodeLine} iconColor="bg-bg-soft-200 text-text-sub-600">
            <div className="py-3 space-y-2">
              {ORDER.barcodes.map(bc => (
                <div key={bc} className="flex items-center justify-between gap-2 rounded-xl bg-bg-weak-50 px-3 py-2.5">
                  <span className="text-paragraph-xs font-mono text-text-strong-950 truncate">{bc}</span>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <button className="text-text-sub-600 hover:text-primary-base shrink-0 transition">
                        <RiPrinterLine size={14} />
                      </button>
                    </Tooltip.Trigger>
                    <Tooltip.Content>Print this barcode</Tooltip.Content>
                  </Tooltip.Root>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Invoice */}
          <SectionCard title="Invoices" icon={RiFileTextLine} iconColor="bg-away-lighter text-away-base">
            <div className="py-3 space-y-3">
              {ORDER.invoices.map((inv, i) => (
                <div key={i} className="space-y-1.5 rounded-xl bg-bg-weak-50 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-label-xs text-text-strong-950">#{inv.invoiceNo}</span>
                    <Badge.Root size="small" variant="lighter" color="green">{inv.status}</Badge.Root>
                  </div>
                  <InfoRow label="EWB No" value={inv.ewbNo} />
                  <InfoRow label="Date" value={inv.date} />
                  <InfoRow label="Amount" value={`₹${inv.amount.toLocaleString()}`} />
                </div>
              ))}
              <button className="text-paragraph-sm font-medium text-primary-base hover:underline">
                + Add Invoice
              </button>
            </div>
          </SectionCard>
        </div>

        {/* Right column — details */}
        <div className="flex flex-col gap-5 lg:col-span-2">
          {/* Booking info */}
          <SectionCard title="Booking Info" icon={RiInformationLine} iconColor="bg-information-lighter text-information-base">
            <div className="py-1">
              <InfoRow label="Client" value={ORDER.client} />
              <InfoRow label="Bill To" value={ORDER.billTo} />
              <InfoRow label="Booking Type" value={ORDER.bookingType} />
              <InfoRow label="Delivery Mode" value={ORDER.deliveryMode} />
              <InfoRow label="Entry Type" value={ORDER.entryType} />
              <InfoRow label="Cold Chain" value={ORDER.cold ? 'Yes' : 'No'} />
            </div>
          </SectionCard>

          {/* Shipper + Consignee side by side */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <SectionCard title="Shipper Info" icon={RiUserLine} iconColor="bg-primary-alpha-10 text-primary-base">
              <div className="py-1">
                <InfoRow label="Name" value={ORDER.shipper.name} />
                <InfoRow label="Address" value={ORDER.shipper.address} />
                <InfoRow label="City" value={ORDER.shipper.city} />
                <InfoRow label="State" value={ORDER.shipper.state} />
                <InfoRow label="Pin Code" value={ORDER.shipper.pincode} />
                <InfoRow label="Origin" value={
                  <span className="flex items-center gap-1">
                    <RiMapPinLine size={12} className="text-primary-base" />
                    {ORDER.shipper.origin}
                  </span>
                } />
              </div>
            </SectionCard>

            <SectionCard title="Consignee Info" icon={RiUserLine} iconColor="bg-success-lighter text-success-base">
              <div className="py-1">
                <InfoRow label="Name" value={ORDER.consignee.name} />
                <InfoRow label="Address" value={ORDER.consignee.address} />
                <InfoRow label="City" value={ORDER.consignee.city} />
                <InfoRow label="State" value={ORDER.consignee.state} />
                <InfoRow label="Pin Code" value={ORDER.consignee.pincode} />
                <InfoRow label="Destination" value={
                  <span className="flex items-center gap-1">
                    <RiMapPinLine size={12} className="text-success-base" />
                    {ORDER.consignee.destination}
                  </span>
                } />
              </div>
            </SectionCard>
          </div>

          {/* Tariff info */}
          <SectionCard title="Tariff Info" icon={RiBoxLine} iconColor="bg-feature-lighter text-feature-base">
            <div className="py-1">
              <div className="grid grid-cols-2 gap-x-8">
                <InfoRow label="Commodity" value={ORDER.tariff.commodity} />
                <InfoRow label="Delivery Type" value={ORDER.tariff.deliveryType} />
                <InfoRow label="COD" value={ORDER.tariff.cod} />
                <InfoRow label="Total Quantity" value={ORDER.tariff.quantity} />
                <InfoRow label="Actual Weight" value={`${ORDER.tariff.actualWeight} kg`} />
                <InfoRow label="Chargeable Wt" value={`${ORDER.tariff.chargeableWeight} kg`} />
              </div>
            </div>
          </SectionCard>

          {/* Dimensions */}
          <SectionCard title="Dimensions" icon={RiBoxLine} iconColor="bg-verified-lighter text-verified-base">
            <div className="py-3 overflow-x-auto">
              <table className="w-full text-paragraph-sm">
                <thead>
                  <tr className="border-b border-stroke-soft-200">
                    {['#', 'Length (Cm)', 'Breadth (Cm)', 'Height (Cm)', 'Pieces'].map(h => (
                      <th key={h} className="pb-2 text-left text-paragraph-xs font-semibold text-text-sub-600 pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stroke-soft-200">
                  {ORDER.dimensions.map((d, i) => (
                    <tr key={i}>
                      <td className="py-2.5 pr-4 text-text-sub-600">{i + 1}</td>
                      <td className="py-2.5 pr-4 font-medium text-text-strong-950">{d.length}</td>
                      <td className="py-2.5 pr-4 font-medium text-text-strong-950">{d.breadth}</td>
                      <td className="py-2.5 pr-4 font-medium text-text-strong-950">{d.height}</td>
                      <td className="py-2.5 pr-4 font-medium text-text-strong-950">{d.pieces}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          {/* Cold chain details */}
          {ORDER.cold && (
            <SectionCard title="Cold Chain Details" icon={RiSnowflakeLine} iconColor="bg-verified-lighter text-verified-base">
              <div className="py-1">
                <InfoRow label="Asset Type" value={ORDER.coldChain.assetType} />
                <InfoRow label="Temperature" value={ORDER.coldChain.temperature} />
                <InfoRow label="Logger No" value={
                  <span className="max-w-[240px] truncate text-right font-mono text-paragraph-xs" title={ORDER.coldChain.loggerNo}>
                    {ORDER.coldChain.loggerNo}
                  </span>
                } />
                <InfoRow label="Box No" value={
                  <span className="max-w-[240px] truncate text-right font-mono text-paragraph-xs" title={ORDER.coldChain.boxNo}>
                    {ORDER.coldChain.boxNo}
                  </span>
                } />
              </div>
            </SectionCard>
          )}

          {/* Order images */}
          <SectionCard title="Order Images" icon={RiImageLine} iconColor="bg-highlighted-lighter text-highlighted-base">
            <div className="py-4">
              <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-stroke-soft-200 py-8 text-center">
                <div className="space-y-1.5">
                  <RiImageLine size={28} className="mx-auto text-text-disabled-300" />
                  <p className="text-paragraph-sm text-text-sub-600">No images uploaded yet</p>
                  <button className="text-paragraph-sm font-medium text-primary-base hover:underline">Upload Image</button>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Update Status Drawer */}
      <Drawer.Root open={updateDrawerOpen} onOpenChange={open => !open && setUpdateDrawerOpen(false)}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Update Order Status</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body className="overflow-y-auto">
            <div className="px-5 py-6 space-y-6">
              {/* Current status */}
              <div className="space-y-1.5">
                <p className="text-subheading-2xs uppercase tracking-wider text-text-sub-600">Current Status</p>
                <Badge.Root size="medium" variant="light" color={statusColor}>
                  <Badge.Dot />{ORDER.status}
                </Badge.Root>
              </div>

              {/* Select new status */}
              <div className="space-y-1.5">
                <p className="text-label-sm text-text-strong-950">Select New Status</p>
                <Select.Root size="small" onValueChange={setNewStatus}>
                  <Select.Trigger><Select.Value placeholder="Choose status..." /></Select.Trigger>
                  <Select.Content>
                    <Select.Item value="Shipment Order Received">Shipment Order Received</Select.Item>
                    <Select.Item value="Shipment Picked Up">Shipment Picked Up</Select.Item>
                    <Select.Item value="Shipment Arrived At Hub">Shipment Arrived At Hub</Select.Item>
                    <Select.Item value="Shipment In Transit">Shipment In Transit</Select.Item>
                    <Select.Item value="Out For Delivery">Out For Delivery</Select.Item>
                    <Select.Item value="Delivered">Delivered</Select.Item>
                  </Select.Content>
                </Select.Root>
              </div>

              {/* Timeline preview */}
              <div className="space-y-2">
                <p className="text-subheading-2xs uppercase tracking-wider text-text-sub-600">History</p>
                <div className="space-y-3">
                  {ORDER.timeline.filter(t => t.done).map((t, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-success-lighter">
                        <RiCheckLine size={11} className="text-success-base" />
                      </div>
                      <div>
                        <p className="text-paragraph-sm font-medium text-text-strong-950">{t.status}</p>
                        <p className="text-paragraph-xs text-text-sub-600">{t.time} &bull; {t.by}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Drawer.Body>
          <Drawer.Footer>
            <Button.Root
              variant="neutral"
              mode="stroke"
              className="flex-1"
              onClick={() => setUpdateDrawerOpen(false)}
            >
              Cancel
            </Button.Root>
            <Button.Root
              className="flex-1"
              onClick={() => setUpdateDrawerOpen(false)}
              disabled={!newStatus}
            >
              Save Status
            </Button.Root>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer.Root>
    </div>
  );
}
