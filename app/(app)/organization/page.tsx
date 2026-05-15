'use client';
import React, { useState } from 'react';
import * as Button from '@/components/ui/button';
import * as Input from '@/components/ui/input';
import { Root as Checkbox } from '@/components/ui/checkbox';
import PageHeader from '@/components/page-header';
import StatsStrip from '@/components/stats-strip';
import { RiAddLine, RiSearchLine, RiBuilding2Line } from '@remixicon/react';

const ORGS = [
  { name: 'Quick India Logistics Pvt Ltd', pan: 'AAACQ2341G', gst: '27AAACQ2341G1ZN', regNo: 'U74120MH0014PTC251851', website: 'https://tracking.quickindialogistics.com/', email: 'ganesh@quickindialogistics.com', mobile: '9821800165' },
];

export default function OrganizationPage() {
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="space-y-5">
      <PageHeader
        icon={RiBuilding2Line}
        iconColor="bg-verified-lighter text-verified-base"
        title="Organization"
        subtitle="Manage companies and multi-tenant configuration"
        breadcrumbs={[{ label: 'Organization' }]}
      >
        <Button.Root size="small" onClick={() => setShowAdd(true)}>
          <Button.Icon as={RiAddLine} />Add Organization
        </Button.Root>
      </PageHeader>

      <StatsStrip stats={[
        { label: 'Organizations', value: 1, trend: 0 },
        { label: 'Active Branches', value: 12, trend: 2, trendLabel: 'this month' },
        { label: 'Total Users', value: 48, trend: 4, trendLabel: 'this month' },
        { label: 'GST Registered', value: 1, trend: 0 },
      ]} />

      {showAdd && (
        <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
          <div className="flex items-center justify-between border-b border-stroke-soft-200 p-4">
            <h3 className="text-paragraph-sm font-semibold">Add Organization</h3>
            <button onClick={() => setShowAdd(false)} className="text-title-h5 text-text-sub-600 hover:text-text-strong-950">&times;</button>
          </div>
          <div className="space-y-6 p-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-stroke-soft-200 pb-2">
                <h4 className="text-paragraph-xs font-semibold uppercase text-text-sub-600">Organization Info</h4>
                <span className="text-paragraph-md text-text-sub-600">(-)</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[['PAN Number *','text','Please Enter PAN'],['Name *','text','Enter Organization Name'],['Alias Name *','text','Enter Alias Name'],['Company Type *','select',''],['Email','email','Enter Email'],['Toll Free Number','text','Enter Toll Free Number'],['Registration No *','text','Enter Registration Number'],['TAN Number *','text','Enter Tax Number'],['Primary Mobile No *','text','Enter Phone Number'],['Secondary Mobile No','text','Enter Phone Number'],['Website Address *','url','Enter Website URL']].map(([label, type, ph]) => (
                  <div key={label} className="flex flex-col gap-1.5">
                    <label className="text-paragraph-xs font-medium text-text-sub-600">{label}</label>
                    {type === 'select' ? (
                      <select className="rounded-lg border border-stroke-soft-200 px-3 py-2 text-paragraph-sm outline-none focus:border-primary-base"><option>Select type</option></select>
                    ) : (
                      <Input.Root size="small"><Input.Wrapper><Input.Input type={type} placeholder={ph} /></Input.Wrapper></Input.Root>
                    )}
                  </div>
                ))}
                <div className="flex flex-col gap-1.5">
                  <label className="text-paragraph-xs font-medium text-text-sub-600">Upload Logo *</label>
                  <input type="file" accept="image/*" className="rounded-lg border border-stroke-soft-200 px-3 py-2 text-paragraph-sm text-text-sub-600" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-stroke-soft-200 pb-2">
                <h4 className="text-paragraph-xs font-semibold uppercase text-text-sub-600">GST Address</h4>
                <span className="text-paragraph-md text-text-sub-600">(-)</span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[['GST No *','text','Enter GST No'],['City *','text','City'],['Pincode *','text','Pincode'],['Address *','text','Enter Address']].map(([l,t,p]) => (
                  <div key={l} className="flex flex-col gap-1.5"><label className="text-paragraph-xs font-medium text-text-sub-600">{l}</label><Input.Root size="small"><Input.Wrapper><Input.Input type={t} placeholder={p} /></Input.Wrapper></Input.Root></div>
                ))}
                <label className="flex items-center gap-2 text-paragraph-sm cursor-pointer pt-5"><Checkbox />H.O</label>
              </div>
              <button className="text-paragraph-xs font-medium text-primary-base hover:underline">+ Add Another GST</button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-stroke-soft-200 pb-2">
                <h4 className="text-paragraph-xs font-semibold uppercase text-text-sub-600">Contact Person Info</h4>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[['Contact Person *','text','Enter Name'],['Contact Person Email *','email','Email'],['Contact Person Phone *','text','Phone']].map(([l,t,p]) => (
                  <div key={l} className="flex flex-col gap-1.5"><label className="text-paragraph-xs font-medium text-text-sub-600">{l}</label><Input.Root size="small"><Input.Wrapper><Input.Input type={t} placeholder={p} /></Input.Wrapper></Input.Root></div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-stroke-soft-200 p-4">
            <Button.Root variant="neutral" mode="stroke" size="small" onClick={() => setShowAdd(false)}>Cancel</Button.Root>
            <Button.Root size="small">Save</Button.Root>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <div className="border-b border-stroke-soft-200 p-3">
          <Input.Root size="small" className="w-56"><Input.Wrapper><Input.Icon as={RiSearchLine} /><Input.Input placeholder="Search organizations..." /></Input.Wrapper></Input.Root>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-paragraph-sm">
            <thead><tr className="border-b border-stroke-soft-200 bg-bg-weak-50">
              <th className="p-3"><Checkbox /></th>
              {['Organization Name', 'PAN Number', 'GST Number', 'Registration No', 'Website Address', 'Email', 'Mobile No'].map(c => <th key={c} className="whitespace-nowrap px-3 py-2.5 text-left text-paragraph-xs font-semibold text-text-sub-600">{c}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-stroke-soft-200">
              {ORGS.map(o => (
                <tr key={o.pan} className="hover:bg-bg-weak-50">
                  <td className="p-3"><Checkbox /></td>
                  <td className="px-3 py-2.5 font-medium text-primary-base cursor-pointer hover:underline">{o.name}</td>
                  <td className="px-3 py-2.5 text-paragraph-xs">{o.pan}</td>
                  <td className="px-3 py-2.5 text-paragraph-xs">{o.gst}</td>
                  <td className="px-3 py-2.5 text-paragraph-xs">{o.regNo}</td>
                  <td className="px-3 py-2.5 text-paragraph-xs text-primary-base">{o.website}</td>
                  <td className="px-3 py-2.5 text-paragraph-xs">{o.email}</td>
                  <td className="px-3 py-2.5 text-paragraph-xs">{o.mobile}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-stroke-soft-200 px-4 py-3"><span className="text-paragraph-xs text-text-sub-600">1-1 of 1</span></div>
      </div>
    </div>
  );
}
