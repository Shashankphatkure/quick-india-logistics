'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import * as Button from '@/components/ui/button';
import * as Input from '@/components/ui/input';
import { RiPrinterLine, RiCloseLine } from '@remixicon/react';
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

export default function ForwardingPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div><h1 className="text-label-lg font-bold text-text-strong-950">Manifest</h1><p className="text-paragraph-xs text-text-sub-600">Manifests / Forwarding Details</p></div>
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-1 shadow-regular-xs">
        {TABS.map(t => <Link key={t.href} href={t.href} className={cn('shrink-0 rounded-lg px-3 py-1.5 text-paragraph-xs font-medium transition', t.href === '/manifest/forwarding' ? 'bg-primary-base text-white' : 'text-text-sub-600 hover:bg-bg-weak-50')}>{t.label}</Link>)}
      </div>
      <div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <table className="w-full text-paragraph-sm">
          <thead><tr className="border-b border-stroke-soft-200 bg-bg-weak-50">
            {['Manifest', 'From Branch', 'To Branch', 'Destination', 'Total Orders', 'Total Bags', 'Total Boxes', 'Manifest Date', 'Print', 'Forward'].map(c => <th key={c} className="whitespace-nowrap px-3 py-2.5 text-left text-paragraph-xs font-semibold text-text-sub-600">{c}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-stroke-soft-200">
            {ROWS.map(r => (
              <tr key={r.manifest} className="hover:bg-bg-weak-50">
                <td className="px-3 py-2.5 font-medium text-primary-base">{r.manifest}</td>
                <td className="px-3 py-2.5 text-paragraph-xs">{r.from}</td>
                <td className="px-3 py-2.5 text-paragraph-xs">{r.to}</td>
                <td className="px-3 py-2.5 text-paragraph-xs">{r.destination}</td>
                <td className="px-3 py-2.5 text-paragraph-xs">{r.orders}</td>
                <td className="px-3 py-2.5 text-paragraph-xs">{r.bags}</td>
                <td className="px-3 py-2.5 text-paragraph-xs">{r.boxes}</td>
                <td className="px-3 py-2.5 text-paragraph-xs">{r.date}</td>
                <td className="px-3 py-2.5"><button className="text-text-sub-600 hover:text-primary-base"><RiPrinterLine size={14} /></button></td>
                <td className="px-3 py-2.5"><Button.Root size="small" onClick={() => setModalOpen(true)}>Forward</Button.Root></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Forward Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-16">
          <div className="w-full max-w-2xl rounded-2xl bg-bg-white-0 shadow-regular-xl">
            <div className="flex items-center justify-between border-b border-stroke-soft-200 p-4">
              <h3 className="text-paragraph-sm font-semibold">Forward Manifest</h3>
              <button onClick={() => setModalOpen(false)}><RiCloseLine size={18} className="text-text-sub-600" /></button>
            </div>
            <div className="space-y-5 p-5">
              {/* Manifest Info */}
              <div className="space-y-3">
                <h4 className="text-paragraph-xs font-semibold text-text-sub-600 uppercase">Manifest Info</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-paragraph-xs text-text-sub-600">Manifest No *</label><Input.Root size="small" className="mt-1"><Input.Wrapper><Input.Input defaultValue="QLIM096280" /></Input.Wrapper></Input.Root></div>
                  <div><label className="text-paragraph-xs text-text-sub-600">Forward Branch *</label><Input.Root size="small" className="mt-1"><Input.Wrapper><Input.Input placeholder="Select branch" /></Input.Wrapper></Input.Root></div>
                  <div><label className="text-paragraph-xs text-text-sub-600">Origin</label><Input.Root size="small" className="mt-1"><Input.Wrapper><Input.Input defaultValue="QIL-goalpara(j)" readOnly /></Input.Wrapper></Input.Root></div>
                  <div><label className="text-paragraph-xs text-text-sub-600">To Branch *</label><Input.Root size="small" className="mt-1"><Input.Wrapper><Input.Input placeholder="Select to branch" /></Input.Wrapper></Input.Root></div>
                </div>
              </div>
              {/* Coloader Info */}
              <div className="space-y-3">
                <h4 className="text-paragraph-xs font-semibold text-text-sub-600 uppercase">Coloader Info</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-paragraph-xs text-text-sub-600">Select Coloader *</label><select className="mt-1 w-full rounded-lg border border-stroke-soft-200 px-3 py-2 text-paragraph-sm outline-none"><option>Select coloader</option></select></div>
                  <div><label className="text-paragraph-xs text-text-sub-600">Coloader Mode *</label><select className="mt-1 w-full rounded-lg border border-stroke-soft-200 px-3 py-2 text-paragraph-sm outline-none"><option>Select mode</option></select></div>
                  <div><label className="text-paragraph-xs text-text-sub-600">Co-loader / Airway Bill No *</label><Input.Root size="small" className="mt-1"><Input.Wrapper><Input.Input placeholder="Enter bill no" /></Input.Wrapper></Input.Root></div>
                  <div><label className="text-paragraph-xs text-text-sub-600">Forwarding Date *</label><Input.Root size="small" className="mt-1"><Input.Wrapper><Input.Input type="datetime-local" /></Input.Wrapper></Input.Root></div>
                </div>
              </div>
              {/* Package Info */}
              <div className="space-y-3">
                <h4 className="text-paragraph-xs font-semibold text-text-sub-600 uppercase">Package Info</h4>
                <div className="grid grid-cols-3 gap-3">
                  {['No of Bags', 'No of Box', 'Docket Weight *', 'Coloader Actual Weight *', 'Coloader Chargeable Weight *', 'Rate'].map(f => (
                    <div key={f}><label className="text-paragraph-xs text-text-sub-600">{f}</label><Input.Root size="small" className="mt-1"><Input.Wrapper><Input.Input type="number" placeholder="0" /></Input.Wrapper></Input.Root></div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-stroke-soft-200 p-4">
              <Button.Root variant="neutral" mode="stroke" size="small" onClick={() => setModalOpen(false)}>Cancel</Button.Root>
              <Button.Root size="small">Forward</Button.Root>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
