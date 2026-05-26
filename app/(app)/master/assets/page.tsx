'use client';
import React, { useState } from 'react';
import * as Button from '@/components/ui/button';
import * as CompactButton from '@/components/ui/compact-button';
import * as Divider from '@/components/ui/divider';
import * as Input from '@/components/ui/input';
import * as Select from '@/components/ui/select';
import * as Label from '@/components/ui/label';
import * as FileUpload from '@/components/ui/file-upload';
import { Root as Checkbox } from '@/components/ui/checkbox';
import PageHeader from '@/components/page-header';
import StatsStrip from '@/components/stats-strip';
import {
  RiAddLine, RiSearchLine, RiFilterLine, RiDownloadLine,
  RiCloseLine, RiSuitcaseLine, RiUploadCloud2Line,
} from '@remixicon/react';

type AssetType = 'Logger' | 'Temperature Control Box';

export default function AssetsPage() {
  const [showAdd, setShowAdd] = useState(false);
  const [assetType, setAssetType] = useState<AssetType>('Logger');

  return (
    <div className="space-y-6">
      <PageHeader
        icon={RiSuitcaseLine}
        iconColor="bg-feature-lighter text-feature-base"
        title="Assets"
        subtitle="Manage loggers, temperature control boxes and calibration data"
        breadcrumbs={[{ label: 'Master', href: '/master/assets' }, { label: 'Assets' }]}
      >
        <Button.Root variant="neutral" mode="stroke" size="small">
          <Button.Icon as={RiDownloadLine} />Download Report
        </Button.Root>
        <Button.Root variant="neutral" mode="stroke" size="small">
          Update Assets Calibration
        </Button.Root>
        <Button.Root variant="neutral" mode="stroke" size="small">
          Update Assign Branch
        </Button.Root>
        <Button.Root variant="neutral" mode="stroke" size="small">
          <Button.Icon as={RiFilterLine} />Filter
        </Button.Root>
        <Button.Root size="small" onClick={() => setShowAdd(true)}>
          <Button.Icon as={RiAddLine} />Add Asset
        </Button.Root>
      </PageHeader>

      <StatsStrip stats={[
        { label: 'Total Assets', value: 0, trend: 0, trendLabel: 'no change' },
        { label: 'Loggers', value: 0, trend: 0, trendLabel: 'no change' },
        { label: 'Temp Control Boxes', value: 0, trend: 0, trendLabel: 'no change' },
        { label: 'Calibrated', value: 0, trend: 0, trendLabel: 'no change' },
      ]} />

      {showAdd && (
        <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 sm:p-5 shadow-regular-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-label-sm text-text-strong-950">Add Asset</h3>
            <CompactButton.Root variant="ghost" size="large" onClick={() => setShowAdd(false)}>
              <CompactButton.Icon as={RiCloseLine} />
            </CompactButton.Root>
          </div>

          <Divider.Root />

          <div className="space-y-4">
            <p className="text-subheading-xs uppercase text-text-sub-600">Asset Info</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label.Root>Asset Type <Label.Asterisk /></Label.Root>
                <Select.Root
                  size="small"
                  value={assetType}
                  onValueChange={(v) => setAssetType(v as AssetType)}
                >
                  <Select.Trigger><Select.Value placeholder="Select asset type" /></Select.Trigger>
                  <Select.Content>
                    <Select.Item value="Logger">Logger</Select.Item>
                    <Select.Item value="Temperature Control Box">Temperature Control Box</Select.Item>
                  </Select.Content>
                </Select.Root>
              </div>

              {assetType === 'Logger' ? (
                <>
                  <div className="flex flex-col gap-1.5">
                    <Label.Root>Logger Type <Label.Asterisk /></Label.Root>
                    <Select.Root size="small">
                      <Select.Trigger><Select.Value placeholder="Select logger type" /></Select.Trigger>
                      <Select.Content>
                        <Select.Item value="single-use">Single Use</Select.Item>
                        <Select.Item value="multi-use">Multi Use</Select.Item>
                        <Select.Item value="dry-ice-single">Dry Ice Single Use</Select.Item>
                        <Select.Item value="dry-ice-multi">Dry Ice Multi Use</Select.Item>
                        <Select.Item value="liquid-nitrogen">Liquid Nitrogen</Select.Item>
                      </Select.Content>
                    </Select.Root>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label.Root>Manufacture Name <Label.Asterisk /></Label.Root>
                    <Select.Root size="small">
                      <Select.Trigger><Select.Value placeholder="Select manufacturer" /></Select.Trigger>
                      <Select.Content>
                        <Select.Item value="placeholder">Select manufacturer</Select.Item>
                      </Select.Content>
                    </Select.Root>
                  </div>
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <Label.Root>Logger Number <Label.Asterisk /></Label.Root>
                    <Input.Root size="small"><Input.Wrapper><Input.Input placeholder="Enter logger number" /></Input.Wrapper></Input.Root>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-1.5">
                    <Label.Root>Box Type <Label.Asterisk /></Label.Root>
                    <Select.Root size="small">
                      <Select.Trigger><Select.Value placeholder="Select box type" /></Select.Trigger>
                      <Select.Content>
                        <Select.Item value="credo">Credo</Select.Item>
                        <Select.Item value="vype">Vype</Select.Item>
                        <Select.Item value="cool-guard">Cool Guard</Select.Item>
                        <Select.Item value="iqo">Iqo</Select.Item>
                        <Select.Item value="sytle">Sytle</Select.Item>
                        <Select.Item value="vaq-tec">VAQ-TEC</Select.Item>
                      </Select.Content>
                    </Select.Root>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label.Root>Box Capacities <Label.Asterisk /></Label.Root>
                    <Select.Root size="small">
                      <Select.Trigger><Select.Value placeholder="Select capacity" /></Select.Trigger>
                      <Select.Content>
                        <Select.Item value="02l">02L</Select.Item>
                        <Select.Item value="04l">04L</Select.Item>
                        <Select.Item value="07l">07L</Select.Item>
                        <Select.Item value="12l">12L</Select.Item>
                        <Select.Item value="14l">14L</Select.Item>
                        <Select.Item value="18l">18L</Select.Item>
                        <Select.Item value="28l">28L</Select.Item>
                      </Select.Content>
                    </Select.Root>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label.Root>Manufacture Product ID <Label.Asterisk /></Label.Root>
                    <Input.Root size="small"><Input.Wrapper><Input.Input placeholder="Enter product ID" /></Input.Wrapper></Input.Root>
                  </div>
                </>
              )}

              <div className="flex flex-col gap-1.5">
                <Label.Root>Initial Assign Branch <Label.Asterisk /></Label.Root>
                <Input.Root size="small"><Input.Wrapper><Input.Input placeholder="Select branch" /></Input.Wrapper></Input.Root>
              </div>

              <Label.Root className="flex items-center gap-2 cursor-pointer pt-5">
                <Checkbox />
                <span className="text-paragraph-sm text-text-strong-950">Is Checked</span>
              </Label.Root>
            </div>

            {assetType === 'Logger' && (
              <div className="space-y-3 pt-2">
                <p className="text-subheading-xs uppercase text-text-sub-600">Asset Calibration Info</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label.Root>Calibration From <Label.Asterisk /></Label.Root>
                    <Input.Root size="small"><Input.Wrapper><Input.Input type="date" /></Input.Wrapper></Input.Root>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label.Root>Calibration To <Label.Asterisk /></Label.Root>
                    <Input.Root size="small"><Input.Wrapper><Input.Input type="date" /></Input.Wrapper></Input.Root>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label.Root>Certificate Issued By <Label.Asterisk /></Label.Root>
                    <Input.Root size="small"><Input.Wrapper><Input.Input placeholder="Enter name" /></Input.Wrapper></Input.Root>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label.Root>Issued Date <Label.Asterisk /></Label.Root>
                    <Input.Root size="small"><Input.Wrapper><Input.Input type="date" /></Input.Wrapper></Input.Root>
                  </div>
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <Label.Root>Document <Label.Asterisk /></Label.Root>
                    <FileUpload.Root>
                      <input type="file" tabIndex={-1} className="hidden" />
                      <FileUpload.Icon as={RiUploadCloud2Line} />
                      <div className="space-y-1">
                        <div className="text-label-sm text-text-strong-950">Choose a file or drag &amp; drop it here.</div>
                        <div className="text-paragraph-xs text-text-sub-600">PDF, PNG or JPG, up to 10 MB.</div>
                      </div>
                      <FileUpload.Button>Browse File</FileUpload.Button>
                    </FileUpload.Root>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <Button.Root variant="neutral" mode="stroke" size="small" onClick={() => setShowAdd(false)}>Cancel</Button.Root>
            <Button.Root variant="neutral" mode="stroke" size="small">Import</Button.Root>
            <Button.Root size="small">Save</Button.Root>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <div className="border-b border-stroke-soft-200 p-3">
          <Input.Root size="small" className="w-full max-w-xs">
            <Input.Wrapper><Input.Icon as={RiSearchLine} /><Input.Input placeholder="Search assets..." /></Input.Wrapper>
          </Input.Root>
        </div>
        <div className="px-4 py-8 text-center text-paragraph-sm text-text-sub-600">No data found</div>
        <div className="border-t border-stroke-soft-200 px-4 py-3">
          <span className="text-paragraph-xs text-text-sub-600">1-0 of 0</span>
        </div>
      </div>
    </div>
  );
}
