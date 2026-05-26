'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import * as Button from '@/components/ui/button';
import * as Input from '@/components/ui/input';
import * as Select from '@/components/ui/select';
import * as Label from '@/components/ui/label';
import * as Table from '@/components/ui/table';
import * as Modal from '@/components/ui/modal';
import * as Divider from '@/components/ui/divider';
import * as CompactButton from '@/components/ui/compact-button';
import * as Tooltip from '@/components/ui/tooltip';
import PageHeader from '@/components/page-header';
import StatsStrip from '@/components/stats-strip';
import { RiFilePaperLine, RiPrinterLine } from '@remixicon/react';
import { cn } from '@/utils/cn';

const TABS = [
  { label: 'Pending For Dispatch', href: '/manifest/pending-dispatch' },
  { label: 'Hub Dispatch', href: '/manifest/hub-dispatch' },
  { label: 'Forwarding Details', href: '/manifest/forwarding' },
  { label: 'Pending To Depart', href: '/manifest/pending-depart' },
  { label: 'Incoming Manifest', href: '/manifest/incoming' },
  { label: 'All Manifest', href: '/manifest/all' },
];

const ROWS = [
  { manifest: 'QLIM096280', from: 'QIL-goalpara(j)', to: 'QIL-mumbai', destination: 'Mumbai', orders: '875832', bags: '"-', boxes: 1, date: '2026-05-12 18:00' },
];

const PACKAGE_FIELDS = ['No of Bags', 'No of Box', 'Docket Weight *', 'Coloader Actual Weight *', 'Coloader Chargeable Weight *', 'Rate'];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-subheading-xs uppercase tracking-wide text-text-soft-400">{children}</p>
  );
}

export default function ForwardingPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-4">
      <PageHeader
        icon={RiFilePaperLine}
        iconColor="bg-feature-lighter text-feature-base"
        title="Forwarding Details"
        subtitle="Manifests forwarded to other branches"
        breadcrumbs={[{ label: 'Manifest', href: '/manifest/forwarding' }, { label: 'Forwarding Details' }]}
      />

      <StatsStrip stats={[
        { label: 'Forwarded', value: 1 },
        { label: 'Total Orders', value: 1 },
        { label: 'Total Boxes', value: 1 },
        { label: 'Total Bags', value: 0 },
      ]} />

      <div className="flex gap-1 overflow-x-auto rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-1 shadow-regular-xs">
        {TABS.map(t => (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              'shrink-0 rounded-lg px-3 py-1.5 text-paragraph-xs font-medium transition',
              t.href === '/manifest/forwarding'
                ? 'bg-primary-base text-static-white'
                : 'text-text-sub-600 hover:bg-bg-weak-50',
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <Table.Root>
          <Table.Header>
            <Table.Row>
              {['Manifest', 'From Branch', 'To Branch', 'Destination', 'Total Orders', 'Total Bags', 'Total Boxes', 'Manifest Date', 'Print', 'Forward'].map(c => (
                <Table.Head key={c}>{c}</Table.Head>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {ROWS.map(r => (
              <Table.Row key={r.manifest}>
                <Table.Cell className="h-auto py-2.5 font-medium text-primary-base text-paragraph-sm whitespace-nowrap">{r.manifest}</Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-xs text-text-sub-600 whitespace-nowrap">{r.from}</Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-xs text-text-sub-600 whitespace-nowrap">{r.to}</Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-xs text-text-sub-600">{r.destination}</Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-xs text-text-sub-600">{r.orders}</Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-xs text-text-sub-600">{r.bags}</Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-xs text-text-sub-600">{r.boxes}</Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-xs text-text-sub-600 whitespace-nowrap">{r.date}</Table.Cell>
                <Table.Cell className="h-auto py-2.5">
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <CompactButton.Root variant="ghost" size="large">
                        <CompactButton.Icon as={RiPrinterLine} />
                      </CompactButton.Root>
                    </Tooltip.Trigger>
                    <Tooltip.Content>Print manifest</Tooltip.Content>
                  </Tooltip.Root>
                </Table.Cell>
                <Table.Cell className="h-auto py-2.5">
                  <Button.Root size="small" onClick={() => setModalOpen(true)}>Forward</Button.Root>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </div>

      {/* Forward Manifest Modal */}
      <Modal.Root open={modalOpen} onOpenChange={setModalOpen}>
        <Modal.Content className="max-w-2xl">
          <Modal.Header title="Forward Manifest" description="Fill in the forwarding details for this manifest" />
          <Divider.Root />

          <Modal.Body className="space-y-5 overflow-y-auto max-h-[60vh]">
            {/* Manifest Info */}
            <div className="space-y-3">
              <SectionLabel>Manifest Info</SectionLabel>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <Label.Root>Manifest No <Label.Asterisk /></Label.Root>
                  <Input.Root size="small">
                    <Input.Wrapper><Input.Input defaultValue="QLIM096280" /></Input.Wrapper>
                  </Input.Root>
                </div>
                <div className="flex flex-col gap-1">
                  <Label.Root>Forward Branch <Label.Asterisk /></Label.Root>
                  <Input.Root size="small">
                    <Input.Wrapper><Input.Input placeholder="Select branch" /></Input.Wrapper>
                  </Input.Root>
                </div>
                <div className="flex flex-col gap-1">
                  <Label.Root>Origin</Label.Root>
                  <Input.Root size="small">
                    <Input.Wrapper><Input.Input defaultValue="QIL-goalpara(j)" readOnly /></Input.Wrapper>
                  </Input.Root>
                </div>
                <div className="flex flex-col gap-1">
                  <Label.Root>To Branch <Label.Asterisk /></Label.Root>
                  <Input.Root size="small">
                    <Input.Wrapper><Input.Input placeholder="Select to branch" /></Input.Wrapper>
                  </Input.Root>
                </div>
              </div>
            </div>

            <Divider.Root />

            {/* Coloader Info */}
            <div className="space-y-3">
              <SectionLabel>Coloader Info</SectionLabel>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <Label.Root>Select Coloader <Label.Asterisk /></Label.Root>
                  <Select.Root size="small">
                    <Select.Trigger><Select.Value placeholder="Select coloader" /></Select.Trigger>
                    <Select.Content>
                      <Select.Item value="patel">Patel Integrated Logistics Ltd</Select.Item>
                      <Select.Item value="dhl">DHL Express</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </div>
                <div className="flex flex-col gap-1">
                  <Label.Root>Coloader Mode <Label.Asterisk /></Label.Root>
                  <Select.Root size="small">
                    <Select.Trigger><Select.Value placeholder="Select mode" /></Select.Trigger>
                    <Select.Content>
                      <Select.Item value="air">Air</Select.Item>
                      <Select.Item value="road">Road</Select.Item>
                      <Select.Item value="rail">Rail</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </div>
                <div className="flex flex-col gap-1">
                  <Label.Root>Co-loader / Airway Bill No <Label.Asterisk /></Label.Root>
                  <Input.Root size="small">
                    <Input.Wrapper><Input.Input placeholder="Enter bill no" /></Input.Wrapper>
                  </Input.Root>
                </div>
                <div className="flex flex-col gap-1">
                  <Label.Root>Forwarding Date <Label.Asterisk /></Label.Root>
                  <Input.Root size="small">
                    <Input.Wrapper><Input.Input type="datetime-local" /></Input.Wrapper>
                  </Input.Root>
                </div>
              </div>
            </div>

            <Divider.Root />

            {/* Package Info */}
            <div className="space-y-3">
              <SectionLabel>Package Info</SectionLabel>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {PACKAGE_FIELDS.map(f => (
                  <div key={f} className="flex flex-col gap-1">
                    <Label.Root>{f.replace(' *', '')} {f.endsWith(' *') && <Label.Asterisk />}</Label.Root>
                    <Input.Root size="small">
                      <Input.Wrapper><Input.Input type="number" placeholder="0" /></Input.Wrapper>
                    </Input.Root>
                  </div>
                ))}
              </div>
            </div>
          </Modal.Body>

          <Modal.Footer>
            <Modal.Close asChild>
              <Button.Root variant="neutral" mode="stroke" size="small">Cancel</Button.Root>
            </Modal.Close>
            <Button.Root size="small" onClick={() => setModalOpen(false)}>Forward</Button.Root>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Root>
    </div>
  );
}
