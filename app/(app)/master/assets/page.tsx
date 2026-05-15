'use client';
import React, { useState } from 'react';
import * as Button from '@/components/ui/button';
import * as Input from '@/components/ui/input';
import { Root as Checkbox } from '@/components/ui/checkbox';
import { RiAddLine, RiSearchLine, RiFilterLine, RiDownloadLine } from '@remixicon/react';

export default function AssetsPage() {
  const [showAdd, setShowAdd] = useState(false);
  const [assetType, setAssetType] = useState('Logger');

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-label-lg font-bold text-text-strong-950">Assets</h1><p className="text-paragraph-xs text-text-sub-600">Masters / Assets</p></div>
        <div className="flex flex-wrap gap-2">
          <Button.Root variant="neutral" mode="stroke" size="small"><Button.Icon as={RiDownloadLine} />Download Report</Button.Root>
          <Button.Root variant="neutral" mode="stroke" size="small">Update Assets Calibration</Button.Root>
          <Button.Root variant="neutral" mode="stroke" size="small">Update Assign Branch</Button.Root>
          <Button.Root variant="neutral" mode="stroke" size="small"><Button.Icon as={RiFilterLine} />Filter</Button.Root>
          <Button.Root size="small" onClick={() => setShowAdd(true)}><Button.Icon as={RiAddLine} />Add Asset</Button.Root>
        </div>
      </div>

      {showAdd && (
        <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-regular-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stroke-soft-200 pb-3">
            <h3 className="text-paragraph-sm font-semibold">Add Asset</h3>
            <button onClick={() => setShowAdd(false)} className="text-title-h5 text-text-sub-600">x</button>
          </div>
          <div className="space-y-4">
            <div className="text-paragraph-xs font-semibold uppercase text-text-sub-600">Asset Info</div>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-paragraph-xs font-medium text-text-sub-600">Asset Type *</label>
                <select className="rounded-lg border border-stroke-soft-200 px-3 py-2 text-paragraph-sm outline-none" value={assetType} onChange={e => setAssetType(e.target.value)}>
                  <option>Logger</option><option>Temperature Control Box</option>
                </select>
              </div>
              {assetType === 'Logger' ? (
                <>
                  <div className="flex flex-col gap-1.5"><label className="text-paragraph-xs font-medium text-text-sub-600">Logger Type *</label><select className="rounded-lg border border-stroke-soft-200 px-3 py-2 text-paragraph-sm outline-none"><option>Single Use</option><option>Multi Use</option><option>Dry Ice Single Use</option><option>Dry Ice Multi Use</option><option>Liquid Nitrogen</option></select></div>
                  <div className="flex flex-col gap-1.5"><label className="text-paragraph-xs font-medium text-text-sub-600">Manufacture Name *</label><select className="rounded-lg border border-stroke-soft-200 px-3 py-2 text-paragraph-sm outline-none"><option>Select manufacturer</option></select></div>
                  <div className="flex flex-col gap-1.5 col-span-2"><label className="text-paragraph-xs font-medium text-text-sub-600">Logger Number *</label><Input.Root size="small"><Input.Wrapper><Input.Input placeholder="Enter logger number" /></Input.Wrapper></Input.Root></div>
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-1.5"><label className="text-paragraph-xs font-medium text-text-sub-600">Box Type *</label><select className="rounded-lg border border-stroke-soft-200 px-3 py-2 text-paragraph-sm outline-none"><option>Credo</option><option>Vype</option><option>Cool Guard</option><option>Iqo</option><option>Sytle</option><option>VAQ-TEC</option></select></div>
                  <div className="flex flex-col gap-1.5"><label className="text-paragraph-xs font-medium text-text-sub-600">Box Capacities *</label><select className="rounded-lg border border-stroke-soft-200 px-3 py-2 text-paragraph-sm outline-none"><option>02L</option><option>04L</option><option>07L</option><option>12L</option><option>14L</option><option>18L</option><option>28L</option></select></div>
                  <div className="flex flex-col gap-1.5"><label className="text-paragraph-xs font-medium text-text-sub-600">Manufacture Product ID *</label><Input.Root size="small"><Input.Wrapper><Input.Input placeholder="Enter product ID" /></Input.Wrapper></Input.Root></div>
                </>
              )}
              <div className="flex flex-col gap-1.5"><label className="text-paragraph-xs font-medium text-text-sub-600">Initial Assign Branch *</label><Input.Root size="small"><Input.Wrapper><Input.Input placeholder="Select branch" /></Input.Wrapper></Input.Root></div>
              <label className="flex items-center gap-2 text-paragraph-sm cursor-pointer pt-5"><Checkbox />Is Checked</label>
            </div>
            {assetType === 'Logger' && (
              <div className="space-y-3 pt-2">
                <div className="text-paragraph-xs font-semibold uppercase text-text-sub-600">Asset Calibration Info</div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1.5"><label className="text-paragraph-xs font-medium text-text-sub-600">Calibration From *</label><Input.Root size="small"><Input.Wrapper><Input.Input type="date" /></Input.Wrapper></Input.Root></div>
                  <div className="flex flex-col gap-1.5"><label className="text-paragraph-xs font-medium text-text-sub-600">Calibration To *</label><Input.Root size="small"><Input.Wrapper><Input.Input type="date" /></Input.Wrapper></Input.Root></div>
                  <div className="flex flex-col gap-1.5"><label className="text-paragraph-xs font-medium text-text-sub-600">Certificate Issued By *</label><Input.Root size="small"><Input.Wrapper><Input.Input placeholder="Enter name" /></Input.Wrapper></Input.Root></div>
                  <div className="flex flex-col gap-1.5"><label className="text-paragraph-xs font-medium text-text-sub-600">Issued Date *</label><Input.Root size="small"><Input.Wrapper><Input.Input type="date" /></Input.Wrapper></Input.Root></div>
                  <div className="flex flex-col gap-1.5"><label className="text-paragraph-xs font-medium text-text-sub-600">Document *</label><input type="file" className="rounded-lg border border-stroke-soft-200 px-3 py-2 text-paragraph-sm text-text-sub-600" /></div>
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button.Root variant="neutral" mode="stroke" size="small" onClick={() => setShowAdd(false)}>Cancel</Button.Root>
            <Button.Root variant="neutral" mode="stroke" size="small">Import</Button.Root>
            <Button.Root size="small">Save</Button.Root>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <div className="border-b border-stroke-soft-200 p-3">
          <Input.Root size="small" className="w-56"><Input.Wrapper><Input.Icon as={RiSearchLine} /><Input.Input placeholder="Search assets..." /></Input.Wrapper></Input.Root>
        </div>
        <div className="px-4 py-8 text-center text-paragraph-sm text-text-sub-600">No data found</div>
        <div className="border-t border-stroke-soft-200 px-4 py-3"><span className="text-paragraph-xs text-text-sub-600">1-0 of 0</span></div>
      </div>
    </div>
  );
}
