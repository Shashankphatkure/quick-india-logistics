'use client';
import React, { useState } from 'react';
import * as Button from '@/components/ui/button';
import * as Input from '@/components/ui/input';
import * as Avatar from '@/components/ui/avatar';
import * as Select from '@/components/ui/select';
import * as Label from '@/components/ui/label';
import * as FileUpload from '@/components/ui/file-upload';
import * as LinkButton from '@/components/ui/link-button';
import * as Table from '@/components/ui/table';
import * as Drawer from '@/components/ui/drawer';
import * as Divider from '@/components/ui/divider';
import { Root as Checkbox } from '@/components/ui/checkbox';
import PageHeader from '@/components/page-header';
import StatsStrip from '@/components/stats-strip';
import {
  RiAddLine,
  RiSearchLine,
  RiBuilding2Line,
  RiUploadCloud2Line,
} from '@remixicon/react';

const ORGS = [
  {
    name: 'Quick India Logistics Pvt Ltd',
    pan: 'AAACQ2341G',
    gst: '27AAACQ2341G1ZN',
    regNo: 'U74120MH0014PTC251851',
    website: 'https://tracking.quickindialogistics.com/',
    email: 'ganesh@quickindialogistics.com',
    mobile: '9821800165',
    image: '',
  },
];

const COLUMNS = [
  'Organization Name',
  'PAN Number',
  'GST Number',
  'Registration No',
  'Website Address',
  'Email',
  'Mobile No',
  'Image',
];

interface FieldDef {
  label: string;
  type?: string;
  ph?: string;
  required?: boolean;
}

const ORG_FIELDS: FieldDef[] = [
  { label: 'PAN Number', required: true, type: 'text', ph: 'Please Enter PAN' },
  { label: 'Name', required: true, type: 'text', ph: 'Enter Organization Name' },
  { label: 'Alias Name', required: true, type: 'text', ph: 'Enter Alias Name' },
  { label: 'Company Type', required: true, type: 'select' },
  { label: 'Email', type: 'email', ph: 'Enter Email' },
  { label: 'Toll Free Number', type: 'text', ph: 'Enter Toll Free Number' },
  { label: 'Registration No', required: true, type: 'text', ph: 'Enter Registration Number' },
  { label: 'TAN Number', required: true, type: 'text', ph: 'Enter Tax Number' },
  { label: 'Primary Mobile No', required: true, type: 'text', ph: 'Enter Phone Number' },
  { label: 'Secondary Mobile No', type: 'text', ph: 'Enter Phone Number' },
  { label: 'Website Address', required: true, type: 'url', ph: 'Enter Website URL' },
];

const GST_FIELDS: FieldDef[] = [
  { label: 'GST No', required: true, ph: 'Enter GST No' },
  { label: 'City', required: true, ph: 'City' },
  { label: 'Pincode', required: true, ph: 'Pincode' },
  { label: 'Address', required: true, ph: 'Enter Address' },
];

const CONTACT_FIELDS: FieldDef[] = [
  { label: 'Contact Person', required: true, type: 'text', ph: 'Enter Name' },
  { label: 'Contact Person Email', required: true, type: 'email', ph: 'Email' },
  { label: 'Contact Person Phone', required: true, type: 'text', ph: 'Phone' },
];

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

function Field({ field }: { field: FieldDef }) {
  return (
    <div className="flex flex-col gap-1">
      <Label.Root>
        {field.label}
        {field.required && <Label.Asterisk />}
      </Label.Root>
      {field.type === 'select' ? (
        <Select.Root size="small">
          <Select.Trigger>
            <Select.Value placeholder="Select type" />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="pvt">Private Limited</Select.Item>
            <Select.Item value="public">Public Limited</Select.Item>
            <Select.Item value="llp">LLP</Select.Item>
            <Select.Item value="proprietor">Proprietorship</Select.Item>
          </Select.Content>
        </Select.Root>
      ) : (
        <Input.Root size="small">
          <Input.Wrapper>
            <Input.Input type={field.type ?? 'text'} placeholder={field.ph} />
          </Input.Wrapper>
        </Input.Root>
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-subheading-xs uppercase tracking-wide text-text-soft-400">{children}</p>
  );
}

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
          <Button.Icon as={RiAddLine} />
          Add Organization
        </Button.Root>
      </PageHeader>

      <StatsStrip
        stats={[
          { label: 'Organizations', value: 1, trend: 0 },
          { label: 'Active Branches', value: 12, trend: 2, trendLabel: 'this month' },
          { label: 'Total Users', value: 48, trend: 4, trendLabel: 'this month' },
          { label: 'GST Registered', value: 1, trend: 0 },
        ]}
      />

      {/* Table card */}
      <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
        <div className="border-b border-stroke-soft-200 p-3">
          <Input.Root size="small" className="w-full max-w-xs">
            <Input.Wrapper>
              <Input.Icon as={RiSearchLine} />
              <Input.Input placeholder="Search organizations..." />
            </Input.Wrapper>
          </Input.Root>
        </div>

        <div className="p-2">
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.Head className="w-0">
                  <Checkbox />
                </Table.Head>
                {COLUMNS.map((c) => (
                  <Table.Head key={c} className="whitespace-nowrap text-paragraph-xs font-semibold">
                    {c}
                  </Table.Head>
                ))}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {ORGS.map((o) => (
                <Table.Row key={o.pan}>
                  <Table.Cell>
                    <Checkbox />
                  </Table.Cell>
                  <Table.Cell className="cursor-pointer whitespace-nowrap font-medium text-primary-base hover:underline">
                    {o.name}
                  </Table.Cell>
                  <Table.Cell className="whitespace-nowrap text-paragraph-xs text-text-sub-600">{o.pan}</Table.Cell>
                  <Table.Cell className="whitespace-nowrap text-paragraph-xs text-text-sub-600">{o.gst}</Table.Cell>
                  <Table.Cell className="whitespace-nowrap text-paragraph-xs text-text-sub-600">{o.regNo}</Table.Cell>
                  <Table.Cell className="whitespace-nowrap text-paragraph-xs text-primary-base">{o.website}</Table.Cell>
                  <Table.Cell className="whitespace-nowrap text-paragraph-xs text-text-sub-600">{o.email}</Table.Cell>
                  <Table.Cell className="whitespace-nowrap text-paragraph-xs text-text-sub-600">{o.mobile}</Table.Cell>
                  <Table.Cell>
                    {o.image ? (
                      <Avatar.Root size="32" className="rounded-lg">
                        <Avatar.Image src={o.image} alt={o.name} className="rounded-lg" />
                      </Avatar.Root>
                    ) : (
                      <Avatar.Root size="32" color="blue" className="rounded-lg">
                        {initials(o.name)}
                      </Avatar.Root>
                    )}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </div>

        <div className="border-t border-stroke-soft-200 px-4 py-3">
          <span className="text-paragraph-xs text-text-sub-600">1-1 of 1</span>
        </div>
      </div>

      {/* Add Organization drawer */}
      <Drawer.Root open={showAdd} onOpenChange={setShowAdd}>
        <Drawer.Content className="max-w-[720px]">
          <Drawer.Header>
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-verified-lighter text-verified-base">
              <RiBuilding2Line size={20} />
            </div>
            <div className="flex-1">
              <Drawer.Title>Add Organization</Drawer.Title>
              <p className="text-paragraph-sm text-text-sub-600">
                Create a new company / tenant configuration
              </p>
            </div>
          </Drawer.Header>
          <Divider.Root />

          <Drawer.Body className="space-y-6 overflow-y-auto p-5">
            {/* Organization Info */}
            <div className="space-y-3">
              <SectionTitle>Organization Info</SectionTitle>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {ORG_FIELDS.map((f) => (
                  <Field key={f.label} field={f} />
                ))}
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <Label.Root>
                    Upload Logo
                    <Label.Asterisk />
                  </Label.Root>
                  <FileUpload.Root>
                    <input type="file" accept="image/*" tabIndex={-1} className="hidden" />
                    <FileUpload.Icon as={RiUploadCloud2Line} />
                    <div className="space-y-1">
                      <div className="text-label-sm text-text-strong-950">
                        Choose a file or drag &amp; drop it here.
                      </div>
                      <div className="text-paragraph-xs text-text-sub-600">
                        PNG, JPG or SVG, up to 2 MB.
                      </div>
                    </div>
                    <FileUpload.Button>Browse File</FileUpload.Button>
                  </FileUpload.Root>
                </div>
              </div>
            </div>

            {/* GST Address */}
            <div className="space-y-3">
              <SectionTitle>GST Address</SectionTitle>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {GST_FIELDS.map((f) => (
                  <Field key={f.label} field={f} />
                ))}
                <Label.Root className="items-center gap-2 pt-6 sm:col-span-2">
                  <Checkbox />
                  H.O
                </Label.Root>
              </div>
              <LinkButton.Root variant="primary" size="medium">
                <LinkButton.Icon as={RiAddLine} />
                Add Another GST
              </LinkButton.Root>
            </div>

            {/* Contact Person Info */}
            <div className="space-y-3">
              <SectionTitle>Contact Person Info</SectionTitle>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {CONTACT_FIELDS.map((f) => (
                  <Field key={f.label} field={f} />
                ))}
              </div>
            </div>
          </Drawer.Body>

          <Divider.Root />
          <Drawer.Footer>
            <Drawer.Close asChild>
              <Button.Root variant="neutral" mode="stroke" size="small" className="w-full">
                Cancel
              </Button.Root>
            </Drawer.Close>
            <Button.Root size="small" className="w-full" onClick={() => setShowAdd(false)}>
              Save Organization
            </Button.Root>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer.Root>
    </div>
  );
}
