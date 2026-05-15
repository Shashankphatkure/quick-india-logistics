'use client';
import React, { useState } from 'react';
import * as Input from '@/components/ui/input';
import * as Button from '@/components/ui/button';
import { RiSearchLine, RiFilterLine, RiZoomInLine, RiRefreshLine, RiExternalLinkLine } from '@remixicon/react';
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-label-lg font-bold text-text-strong-950">Delivery Info</h1>
          <p className="text-paragraph-xs text-text-sub-600">Booking / Delivery Info</p>
        </div>
        <Button.Root variant="neutral" mode="stroke" size="small">
          <Button.Icon as={RiFilterLine} />
          Filter
        </Button.Root>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-1 shadow-regular-xs w-fit">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={cn(
              'rounded-lg px-4 py-1.5 text-paragraph-xs font-medium transition',
              i === tab ? 'bg-primary-base text-white shadow-regular-xs' : 'text-text-sub-600 hover:bg-bg-weak-50',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <div className="border-b border-stroke-soft-200 p-3">
          <Input.Root size="small" className="w-56">
            <Input.Wrapper>
              <Input.Icon as={RiSearchLine} />
              <Input.Input placeholder="Search docket..." />
            </Input.Wrapper>
          </Input.Root>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-paragraph-sm">
            <thead>
              <tr className="border-b border-stroke-soft-200 bg-bg-weak-50">
                {['Docket Number', 'Delivery Branch', 'Person Name', 'Phone', 'Delivered Date & Time', 'Signature', 'POD', 'Verified By', 'Status'].map((col) => (
                  <th key={col} className="whitespace-nowrap px-4 py-2.5 text-left text-paragraph-xs font-semibold text-text-sub-600">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke-soft-200">
              {DELIVERIES.map((d) => (
                <tr key={d.docket} className="hover:bg-bg-weak-50">
                  <td className="px-4 py-3 font-medium text-primary-base hover:underline cursor-pointer">{d.docket}</td>
                  <td className="px-4 py-3 text-paragraph-xs text-text-sub-600">{d.branch}</td>
                  <td className="px-4 py-3 text-paragraph-xs text-text-strong-950">{d.person}</td>
                  <td className="px-4 py-3 text-paragraph-xs text-text-sub-600">{d.phone}</td>
                  <td className="px-4 py-3 text-paragraph-xs text-text-sub-600">{d.dateTime}</td>
                  <td className="px-4 py-3">
                    <div className="size-8 rounded border border-stroke-soft-200 bg-bg-weak-50 flex items-center justify-center text-[10px] text-text-disabled-300">Sig</div>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setPodOpen(true)} className="size-12 overflow-hidden rounded border border-stroke-soft-200 bg-bg-soft-200 flex items-center justify-center hover:opacity-80 transition">
                      <RiZoomInLine size={14} className="text-text-sub-600" />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-paragraph-xs text-text-sub-600">Data Entry Executive</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-success-lighter px-2 py-0.5 text-[11px] font-medium text-success-dark border border-success-light">{d.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-stroke-soft-200 px-4 py-3">
          <span className="text-paragraph-xs text-text-sub-600">Showing 1-3 of 3</span>
        </div>
      </div>

      {/* POD Modal */}
      {podOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-bg-white-0 shadow-regular-xl">
            <div className="flex items-center justify-between border-b border-stroke-soft-200 p-4">
              <h3 className="text-paragraph-sm font-semibold text-text-strong-950">POD Image</h3>
              <button onClick={() => setPodOpen(false)} className="text-text-sub-600 hover:text-text-strong-950 text-title-h5 leading-none">x</button>
            </div>
            <div className="p-6 flex flex-col items-center gap-4">
              <div className="w-full aspect-[4/3] rounded-xl bg-bg-soft-200 flex items-center justify-center">
                <span className="text-paragraph-sm text-text-sub-600">POD Image Preview</span>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-stroke-soft-200 p-4">
              <Button.Root variant="neutral" mode="stroke" size="small">
                <Button.Icon as={RiExternalLinkLine} />
                Open
              </Button.Root>
              <Button.Root variant="neutral" mode="stroke" size="small">
                <Button.Icon as={RiRefreshLine} />
                Rotate
              </Button.Root>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
