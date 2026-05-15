'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import * as Button from '@/components/ui/button';
import * as Input from '@/components/ui/input';
import { Root as Checkbox } from '@/components/ui/checkbox';
import { RiAddLine } from '@remixicon/react';
import { cn } from '@/utils/cn';

const EMS_TABS = [
  { label: 'Login Details', href: '/ems/login-details' },
  { label: 'Permission', href: '/ems/permissions' },
  { label: 'Users', href: '/ems/users' },
  { label: 'Departments', href: '/ems/departments' },
  { label: 'Designations', href: '/ems/designations' },
  { label: 'Change Password', href: '/ems/change-password' },
];

const DESIGNATIONS = [
  { name: 'Manager', org: 'Quick India Logistics Pvt Ltd', createdDate: '14-10-2024' },
  { name: 'Executive', org: 'Quick India Logistics Pvt Ltd', createdDate: '14-10-2024' },
];

export default function DesignationsPage() {
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-label-lg font-bold text-text-strong-950">EMS "- Designations</h1><p className="text-paragraph-xs text-text-sub-600">EMS / Designations</p></div>
        <Button.Root size="small" onClick={() => setShowAdd(true)}><Button.Icon as={RiAddLine} />Add Designation</Button.Root>
      </div>
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-1 shadow-regular-xs">
        {EMS_TABS.map(t => <Link key={t.href} href={t.href} className={cn('shrink-0 rounded-lg px-3 py-1.5 text-paragraph-xs font-medium transition', t.href === '/ems/designations' ? 'bg-primary-base text-white' : 'text-text-sub-600 hover:bg-bg-weak-50')}>{t.label}</Link>)}
      </div>
      {showAdd && (
        <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-regular-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stroke-soft-200 pb-3">
            <h3 className="text-paragraph-sm font-semibold">Add Designation</h3>
            <button onClick={() => setShowAdd(false)} className="text-title-h5 text-text-sub-600">x</button>
          </div>
          <div className="flex flex-col gap-1.5 max-w-sm">
            <label className="text-paragraph-xs font-medium text-text-sub-600">Designation Name *</label>
            <Input.Root size="small"><Input.Wrapper><Input.Input placeholder="Enter Designation name" /></Input.Wrapper></Input.Root>
          </div>
          <div className="flex justify-end gap-2">
            <Button.Root variant="neutral" mode="stroke" size="small" onClick={() => setShowAdd(false)}>Cancel</Button.Root>
            <Button.Root size="small">Save</Button.Root>
          </div>
        </div>
      )}
      <div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <table className="w-full text-paragraph-sm">
          <thead><tr className="border-b border-stroke-soft-200 bg-bg-weak-50">
            <th className="p-3"><Checkbox /></th>
            {['Designation Name', 'Organization', 'Created Date'].map(c => <th key={c} className="px-4 py-2.5 text-left text-paragraph-xs font-semibold text-text-sub-600">{c}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-stroke-soft-200">
            {DESIGNATIONS.map(d => (
              <tr key={d.name} className="hover:bg-bg-weak-50">
                <td className="p-3"><Checkbox /></td>
                <td className="px-4 py-2.5 font-medium text-primary-base cursor-pointer hover:underline">{d.name}</td>
                <td className="px-4 py-2.5 text-paragraph-xs">{d.org}</td>
                <td className="px-4 py-2.5 text-paragraph-xs">{d.createdDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
