'use client';
import React from 'react';
import Link from 'next/link';
import * as Button from '@/components/ui/button';
import * as Table from '@/components/ui/table';
import PageHeader from '@/components/page-header';
import StatsStrip from '@/components/stats-strip';
import * as Badge from '@/components/ui/badge';
import * as Pagination from '@/components/ui/pagination';
import { RiFilePaperLine, RiFilterLine, RiDownloadLine, RiArrowLeftSLine, RiArrowRightSLine } from '@remixicon/react';
import { cn } from '@/utils/cn';

const MANIFEST_TABS = [
  { label: 'Pending For Dispatch', href: '/manifest/pending-dispatch' },
  { label: 'Hub Dispatch', href: '/manifest/hub-dispatch' },
  { label: 'Forwarding Details', href: '/manifest/forwarding' },
  { label: 'Pending To Depart', href: '/manifest/pending-depart' },
  { label: 'Incoming Manifest', href: '/manifest/incoming' },
  { label: 'All Manifest', href: '/manifest/all' },
];

const MANIFESTS = [
  { no: 'QLIM096271', date: '12-05-2026 19:59', verifiedBy: 'Customer Support Executive', status: 'Active', origin: 'Lucknow', destination: 'Gorakhpur', coloader: 'Patel Integrated Logistics Ltd', coloaderNo: '111803-08', bags: 0, boxes: 1, weight: 2, orders: 787477 },
];

export default function AllManifestPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        icon={RiFilePaperLine}
        iconColor="bg-feature-lighter text-feature-base"
        title="All Manifest"
        subtitle="View and manage all manifests"
        breadcrumbs={[{ label: 'Manifest', href: '/manifest/all' }, { label: 'All Manifest' }]}
      >
        <Button.Root variant="neutral" mode="stroke" size="small">
          <Button.Icon as={RiFilterLine} />Filter
        </Button.Root>
      </PageHeader>

      <StatsStrip stats={[
        { label: 'Total Manifests', value: 1, trend: 5.2, trendLabel: 'this week' },
        { label: 'Active', value: 1, trend: 0 },
        { label: 'Total Bags', value: 0 },
        { label: 'Total Boxes', value: 1 },
      ]} />

      <div className="flex gap-1 overflow-x-auto rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-1 shadow-regular-xs">
        {MANIFEST_TABS.map(t => (
          <Link key={t.href} href={t.href} className={cn('shrink-0 rounded-lg px-3 py-1.5 text-paragraph-xs font-medium transition', t.href === '/manifest/all' ? 'bg-primary-base text-white' : 'text-text-sub-600 hover:bg-bg-weak-50')}>
            {t.label}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <Table.Root>
          <Table.Header>
            <Table.Row>
              {['Manifest No', 'Date', 'Verified By', 'Status', 'Origin', 'Destination', 'Coloader', 'Coloader No', 'PDF', 'Bags', 'Boxes', 'Weight', 'Orders', 'Images'].map(col => (
                <Table.Head key={col}>{col}</Table.Head>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {MANIFESTS.map(m => (
              <Table.Row key={m.no}>
                <Table.Cell className="h-auto py-2.5 font-medium text-primary-base cursor-pointer hover:underline text-paragraph-sm">{m.no}</Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-xs text-text-sub-600 whitespace-nowrap">{m.date}</Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-xs">{m.verifiedBy}</Table.Cell>
                <Table.Cell className="h-auto py-2.5">
                  <Badge.Root size="medium" variant="light" color="green"><Badge.Dot />{m.status}</Badge.Root>
                </Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-xs">{m.origin}</Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-xs">{m.destination}</Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-xs">{m.coloader}</Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-xs">{m.coloaderNo}</Table.Cell>
                <Table.Cell className="h-auto py-2.5">
                  <button className="text-text-sub-600 hover:text-primary-base"><RiDownloadLine size={14} /></button>
                </Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-xs">{m.bags}</Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-xs">{m.boxes}</Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-xs">{m.weight}</Table.Cell>
                <Table.Cell className="h-auto py-2.5 text-paragraph-xs">{m.orders}</Table.Cell>
                <Table.Cell className="h-auto py-2.5">
                  <button className="rounded p-1 text-text-sub-600 hover:bg-bg-soft-200"><RiDownloadLine size={13} /></button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
        <div className="flex items-center justify-between border-t border-stroke-soft-200 px-4 py-3">
          <span className="text-paragraph-xs text-text-sub-600">Showing 1-1 of 1</span>
          <Pagination.Root variant="rounded">
            <Pagination.NavButton><Pagination.NavIcon as={RiArrowLeftSLine} /></Pagination.NavButton>
            <Pagination.Item current>1</Pagination.Item>
            <Pagination.NavButton><Pagination.NavIcon as={RiArrowRightSLine} /></Pagination.NavButton>
          </Pagination.Root>
        </div>
      </div>
    </div>
  );
}
