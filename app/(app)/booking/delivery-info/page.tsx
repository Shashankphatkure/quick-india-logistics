'use client';
import React, { useState } from 'react';
import * as Input from '@/components/ui/input';
import * as Button from '@/components/ui/button';
import * as Table from '@/components/ui/table';
import * as Badge from '@/components/ui/badge';
import * as Modal from '@/components/ui/modal';
import * as CompactButton from '@/components/ui/compact-button';
import * as Tooltip from '@/components/ui/tooltip';
import PageHeader from '@/components/page-header';
import StatsStrip from '@/components/stats-strip';
import {
  RiSearchLine, RiFilterLine, RiZoomInLine, RiRefreshLine,
  RiExternalLinkLine, RiTruckLine, RiArrowUpDownLine,
} from '@remixicon/react';
import { STATUS_TO_BADGE_COLOR, type BadgeColor } from '@/lib/ui-types';
import { cn } from '@/utils/cn';

const TABS = ['Delivery Info', 'Undelivered Info', 'Mark Delivered'];

const DELIVERIES = [
  { docket: '4107204', branch: 'QIL-amritsar', person: 'CGHS WALLNESS', phone: 'null', dateTime: '07-05-2026 14:11', status: 'Active' },
  { docket: '4107058', branch: 'QIL-amritsar', person: 'AMRITSAR EYE HOSPITAL', phone: 'null', dateTime: '07-05-2026 14:59', status: 'Active' },
  { docket: '4106922', branch: 'QIL-amritsar', person: 'SINGH MEDICOS', phone: '9876543210', dateTime: '06-05-2026 11:30', status: 'Active' },
];

export default function DeliveryInfoPage() {
  const [tab, setTab] = useState(0);
  const [podOpen, setPodOpen] = useState(false);

  return (
    <div className="space-y-4">
      <PageHeader
        icon={RiTruckLine}
        title="Delivery Info"
        subtitle="View and manage delivery confirmations"
        breadcrumbs={[
          { label: 'Booking', href: '/booking/orders' },
          { label: 'Delivery Info' },
        ]}
      >
        <Button.Root variant="neutral" mode="stroke" size="small">
          <Button.Icon as={RiFilterLine} />
          Filter
        </Button.Root>
      </PageHeader>

      <StatsStrip stats={[
        { label: 'Total Deliveries', value: 3, trend: 0 },
        { label: 'Active', value: 3, trend: 0 },
        { label: 'Undelivered', value: 0, trend: 0 },
        { label: 'Pending Mark', value: 0, trend: 0 },
      ]} />

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-1 shadow-regular-xs w-fit max-w-full">
        {TABS.map((t, i) => (
          <Button.Root
            key={t}
            variant={i === tab ? 'primary' : 'neutral'}
            mode={i === tab ? 'filled' : 'ghost'}
            size="xsmall"
            onClick={() => setTab(i)}
            className="shrink-0"
          >
            {t}
          </Button.Root>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <div className="border-b border-stroke-soft-200 p-3">
          <Input.Root size="small" className="w-full max-w-xs">
            <Input.Wrapper>
              <Input.Icon as={RiSearchLine} />
              <Input.Input placeholder="Search docket..." />
            </Input.Wrapper>
          </Input.Root>
        </div>

        <Table.Root>
          <Table.Header>
            <Table.Row>
              {['Docket Number', 'Delivery Branch', 'Person Name', 'Phone', 'Delivered Date & Time', 'Signature', 'POD', 'Verified By', 'Status'].map((col) => (
                <Table.Head key={col} className="whitespace-nowrap">
                  <span className="flex items-center gap-1">
                    {col}
                    <RiArrowUpDownLine size={11} className="text-text-disabled-300" />
                  </span>
                </Table.Head>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {DELIVERIES.map((d) => (
              <Table.Row key={d.docket}>
                <Table.Cell className="h-auto py-3 font-medium text-primary-base hover:underline cursor-pointer whitespace-nowrap">
                  {d.docket}
                </Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600 whitespace-nowrap">{d.branch}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-strong-950 whitespace-nowrap">{d.person}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600 whitespace-nowrap">{d.phone}</Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600 whitespace-nowrap">{d.dateTime}</Table.Cell>
                <Table.Cell className="h-auto py-3">
                  <div className="size-8 rounded border border-stroke-soft-200 bg-bg-weak-50 flex items-center justify-center text-paragraph-xs text-text-disabled-300">
                    Sig
                  </div>
                </Table.Cell>
                <Table.Cell className="h-auto py-3">
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <CompactButton.Root
                        variant="ghost"
                        size="large"
                        onClick={() => setPodOpen(true)}
                      >
                        <CompactButton.Icon as={RiZoomInLine} />
                      </CompactButton.Root>
                    </Tooltip.Trigger>
                    <Tooltip.Content>View POD image</Tooltip.Content>
                  </Tooltip.Root>
                </Table.Cell>
                <Table.Cell className="h-auto py-3 text-paragraph-xs text-text-sub-600 whitespace-nowrap">
                  Data Entry Executive
                </Table.Cell>
                <Table.Cell className="h-auto py-3">
                  <Badge.Root
                    size="medium"
                    variant="light"
                    color={(STATUS_TO_BADGE_COLOR[d.status] ?? 'gray') as BadgeColor}
                  >
                    <Badge.Dot />{d.status}
                  </Badge.Root>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>

        <div className="flex items-center justify-between border-t border-stroke-soft-200 px-4 py-3">
          <span className="text-paragraph-xs text-text-sub-600">Showing 1-3 of 3</span>
        </div>
      </div>

      {/* POD Modal */}
      <Modal.Root open={podOpen} onOpenChange={setPodOpen}>
        <Modal.Content className="max-w-lg">
          <Modal.Header
            title="POD Image"
            description="Proof of delivery image for this shipment"
          />
          <Modal.Body className="flex flex-col items-center gap-4 p-4 sm:p-6">
            <div className="w-full aspect-[4/3] rounded-xl bg-bg-soft-200 flex items-center justify-center">
              <span className="text-paragraph-sm text-text-sub-600">POD Image Preview</span>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button.Root variant="neutral" mode="stroke" size="small">
              <Button.Icon as={RiExternalLinkLine} />
              Open
            </Button.Root>
            <Button.Root variant="neutral" mode="stroke" size="small">
              <Button.Icon as={RiRefreshLine} />
              Rotate
            </Button.Root>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Root>
    </div>
  );
}
