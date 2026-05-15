'use client';
import React from 'react';
import Link from 'next/link';
import * as Button from '@/components/ui/button';
import * as Input from '@/components/ui/input';
import { Root as Checkbox } from '@/components/ui/checkbox';
import { RiAddLine, RiSearchLine, RiFilterLine } from '@remixicon/react';
import { cn } from '@/utils/cn';

const EMS_TABS = [
  { label: 'Login Details', href: '/ems/login-details' },
  { label: 'Permission', href: '/ems/permissions' },
  { label: 'Users', href: '/ems/users' },
  { label: 'Departments', href: '/ems/departments' },
  { label: 'Designations', href: '/ems/designations' },
  { label: 'Change Password', href: '/ems/change-password' },
];

const PERMISSIONS = [
  { model: 'Booking', category: 'Dashboard', subModel: 'Booking Date & Time', createdBy: 'Elebcube', createdAt: '11-10-2024' },
  { model: 'Dashboard', category: 'Dashboard', subModel: 'Home +5', createdBy: 'Elebcube', createdAt: '11-10-2024' },
  { model: 'Ems', category: 'Dashboard', subModel: 'Change Password', createdBy: 'Elebcube', createdAt: '11-10-2024' },
  { model: 'Ems', category: 'Pages', subModel: 'Login Details +4', createdBy: 'Elebcube', createdAt: '11-10-2024' },
  { model: 'Ewaybill', category: 'Pages', subModel: 'Eway Dashboard', createdBy: 'Elebcube', createdAt: '11-10-2024' },
  { model: 'Master', category: 'Pages', subModel: 'Assets +12', createdBy: 'Elebcube', createdAt: '11-10-2024' },
  { model: 'Booking', category: 'Pages', subModel: 'Orders +8', createdBy: 'Elebcube', createdAt: '11-10-2024' },
  { model: 'Runsheet', category: 'Pages', subModel: 'Pending Delivery +4', createdBy: 'Elebcube', createdAt: '11-10-2024' },
  { model: 'Manifest', category: 'Pages', subModel: 'Pending For Dispatch +6', createdBy: 'Elebcube', createdAt: '11-10-2024' },
  { model: 'Analytics', category: 'Pages', subModel: 'Reports', createdBy: 'Elebcube', createdAt: '11-10-2024' },
];

export default function PermissionsPage() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-label-lg font-bold text-text-strong-950">EMS "- Permission</h1><p className="text-paragraph-xs text-text-sub-600">EMS / Permission</p></div>
        <div className="flex gap-2">
          <Button.Root variant="neutral" mode="stroke" size="small"><Button.Icon as={RiFilterLine} />Filter</Button.Root>
          <Button.Root size="small"><Button.Icon as={RiAddLine} />Add Permission</Button.Root>
        </div>
      </div>
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-1 shadow-regular-xs">
        {EMS_TABS.map(t => <Link key={t.href} href={t.href} className={cn('shrink-0 rounded-lg px-3 py-1.5 text-paragraph-xs font-medium transition', t.href === '/ems/permissions' ? 'bg-primary-base text-white' : 'text-text-sub-600 hover:bg-bg-weak-50')}>{t.label}</Link>)}
      </div>
      <div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <div className="border-b border-stroke-soft-200 p-3">
          <Input.Root size="small" className="w-56"><Input.Wrapper><Input.Icon as={RiSearchLine} /><Input.Input placeholder="Search permissions..." /></Input.Wrapper></Input.Root>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-paragraph-sm">
            <thead><tr className="border-b border-stroke-soft-200 bg-bg-weak-50">
              <th className="p-3"><Checkbox /></th>
              {['Model Name', 'Category', 'Sub Model Name', 'Created By', 'Created At'].map(c => <th key={c} className="whitespace-nowrap px-4 py-2.5 text-left text-paragraph-xs font-semibold text-text-sub-600">{c}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-stroke-soft-200">
              {PERMISSIONS.map((p, i) => (
                <tr key={i} className="hover:bg-bg-weak-50">
                  <td className="p-3"><Checkbox /></td>
                  <td className="px-4 py-2.5 font-medium text-primary-base cursor-pointer hover:underline">{p.model}</td>
                  <td className="px-4 py-2.5 text-paragraph-xs">{p.category}</td>
                  <td className="px-4 py-2.5 text-paragraph-xs">{p.subModel}</td>
                  <td className="px-4 py-2.5 text-paragraph-xs">{p.createdBy}</td>
                  <td className="px-4 py-2.5 text-paragraph-xs">{p.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-stroke-soft-200 px-4 py-3"><span className="text-paragraph-xs text-text-sub-600">1-10 of 15</span></div>
      </div>
    </div>
  );
}
