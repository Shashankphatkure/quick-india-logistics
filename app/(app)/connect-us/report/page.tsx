'use client';

import React, { useState, useTransition } from 'react';
import { toast } from 'sonner';
import * as Button from '@/components/ui/button';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import * as Select from '@/components/ui/select';
import * as Textarea from '@/components/ui/textarea';
import PageHeader from '@/components/page-header';
import { RiFlagLine, RiSendPlaneLine, RiCheckboxCircleFill } from '@remixicon/react';

const TYPES = [
  { value: 'bug', label: 'Bug — something is broken' },
  { value: 'data', label: 'Data discrepancy' },
  { value: 'ux', label: 'Confusing or hard to use' },
  { value: 'performance', label: 'Slow / freezes' },
  { value: 'other', label: 'Other issue' },
];

export default function ConnectUsReportPage() {
  const [type, setType] = useState('bug');
  const [page, setPage] = useState('');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!details.trim()) {
      toast.error('Please describe the issue');
      return;
    }
    startTransition(async () => {
      try {
        const res = await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            kind: 'bug',
            title: `[Issue Report] ${page.trim() || 'Unknown page'}`,
            description: `**Type:** ${type}\n**Affected page:** ${page.trim() || 'not specified'}\n\n${details.trim()}`,
            path: '/connect-us/report',
            url: typeof window !== 'undefined' ? window.location.href : '',
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
            viewport: typeof window !== 'undefined' ? { w: window.innerWidth, h: window.innerHeight } : null,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error || 'Submit failed');
        }
        setSubmitted(true);
        toast.success('Report submitted');
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Submit failed');
      }
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={RiFlagLine}
        iconColor="bg-error-lighter text-error-base"
        title="Report an Issue"
        subtitle="Tell us about a bug, broken page, or anything that's not working as expected"
        breadcrumbs={[{ label: 'Connect Us' }, { label: 'Report' }]}
      />

      <div className="rounded-xl border border-information-light bg-information-lighter p-4 text-paragraph-sm text-information-dark">
        Tip: for fastest response, use the floating <strong>Feedback</strong> tab on the right side of any page — it can capture a screenshot automatically.
      </div>

      {submitted ? (
        <div className="rounded-2xl border border-success-light bg-success-lighter p-8 text-center">
          <RiCheckboxCircleFill size={48} className="mx-auto text-success-base" />
          <h3 className="text-label-md font-semibold text-success-dark mt-3">Report received</h3>
          <p className="text-paragraph-sm text-success-base mt-1">
            Your report is on its way to the dev team. Thanks for helping us improve.
          </p>
          <Button.Root variant="neutral" mode="stroke" size="small" type="button" className="mt-4" onClick={() => {
            setSubmitted(false); setPage(''); setDetails(''); setType('bug');
          }}>
            Report another
          </Button.Root>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-regular-xs space-y-4">
          <div className="flex flex-col gap-1.5">
            <Label.Root>Issue Type <Label.Asterisk /></Label.Root>
            <Select.Root size="small" value={type} onValueChange={setType}>
              <Select.Trigger><Select.Value /></Select.Trigger>
              <Select.Content>
                {TYPES.map(t => <Select.Item key={t.value} value={t.value}>{t.label}</Select.Item>)}
              </Select.Content>
            </Select.Root>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label.Root>Affected Page</Label.Root>
            <Input.Root size="small">
              <Input.Wrapper>
                <Input.Input value={page} onChange={(e) => setPage(e.target.value)} placeholder="e.g. /booking/orders or 'Add Order' wizard" maxLength={200} />
              </Input.Wrapper>
            </Input.Root>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label.Root>What happened? <Label.Asterisk /></Label.Root>
            <Textarea.Root simple value={details} onChange={(e) => setDetails(e.target.value)}
              placeholder="Steps to reproduce, what you expected, what actually happened"
              rows={6} required />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button.Root variant="neutral" mode="stroke" size="small" type="button" onClick={() => { setPage(''); setDetails(''); }}>Reset</Button.Root>
            <Button.Root size="small" type="submit" disabled={pending}>
              <Button.Icon as={RiSendPlaneLine} />{pending ? 'Sending...' : 'Submit Report'}
            </Button.Root>
          </div>
        </form>
      )}
    </div>
  );
}
