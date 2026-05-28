'use client';

import React, { useState, useTransition } from 'react';
import { toast } from 'sonner';
import * as Button from '@/components/ui/button';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import * as Select from '@/components/ui/select';
import * as Textarea from '@/components/ui/textarea';
import PageHeader from '@/components/page-header';
import { RiCustomerService2Line, RiSendPlaneLine, RiCheckboxCircleFill } from '@remixicon/react';

const CATEGORIES = [
  { value: 'access', label: 'Access / Permissions' },
  { value: 'data', label: 'Data correction request' },
  { value: 'feature', label: 'New feature request' },
  { value: 'training', label: 'Training session' },
  { value: 'other', label: 'Other' },
];

const PRIORITIES = [
  { value: 'low', label: 'Low — within a week' },
  { value: 'medium', label: 'Medium — within 2 days' },
  { value: 'high', label: 'High — same day' },
  { value: 'critical', label: 'Critical — blocking work' },
];

export default function ServiceRequestPage() {
  const [category, setCategory] = useState('access');
  const [priority, setPriority] = useState('medium');
  const [subject, setSubject] = useState('');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!subject.trim() || !details.trim()) {
      toast.error('Subject and details are required');
      return;
    }
    startTransition(async () => {
      // Reuse the feedback API — request maps to "question" kind with extra context in description.
      const body = JSON.stringify({
        kind: 'question',
        title: `[Service Request: ${category}] ${subject.trim()}`,
        description: `**Priority:** ${priority}\n**Category:** ${category}\n\n${details.trim()}`,
        path: '/connect-us/service-request',
        url: typeof window !== 'undefined' ? window.location.href : '',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        viewport: typeof window !== 'undefined' ? { w: window.innerWidth, h: window.innerHeight } : null,
      });
      try {
        const res = await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
        });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error || 'Submit failed');
        }
        setSubmitted(true);
        toast.success('Request submitted');
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Submit failed');
      }
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={RiCustomerService2Line}
        iconColor="bg-information-lighter text-information-base"
        title="Service Request"
        subtitle="Submit an internal request to the software / admin team"
        breadcrumbs={[{ label: 'Connect Us' }, { label: 'Service Request' }]}
      />

      {submitted ? (
        <div className="rounded-2xl border border-success-light bg-success-lighter p-8 text-center">
          <RiCheckboxCircleFill size={48} className="mx-auto text-success-base" />
          <h3 className="text-label-md font-semibold text-success-dark mt-3">Request submitted</h3>
          <p className="text-paragraph-sm text-success-base mt-1">
            Your request has been filed as a GitHub issue. The team will follow up shortly.
          </p>
          <Button.Root variant="neutral" mode="stroke" size="small" type="button" className="mt-4" onClick={() => {
            setSubmitted(false); setSubject(''); setDetails(''); setCategory('access'); setPriority('medium');
          }}>
            Submit another
          </Button.Root>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-regular-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label.Root>Category <Label.Asterisk /></Label.Root>
              <Select.Root size="small" value={category} onValueChange={setCategory}>
                <Select.Trigger><Select.Value /></Select.Trigger>
                <Select.Content>
                  {CATEGORIES.map(c => <Select.Item key={c.value} value={c.value}>{c.label}</Select.Item>)}
                </Select.Content>
              </Select.Root>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label.Root>Priority <Label.Asterisk /></Label.Root>
              <Select.Root size="small" value={priority} onValueChange={setPriority}>
                <Select.Trigger><Select.Value /></Select.Trigger>
                <Select.Content>
                  {PRIORITIES.map(p => <Select.Item key={p.value} value={p.value}>{p.label}</Select.Item>)}
                </Select.Content>
              </Select.Root>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label.Root>Subject <Label.Asterisk /></Label.Root>
            <Input.Root size="small">
              <Input.Wrapper>
                <Input.Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="One-line summary" maxLength={120} required />
              </Input.Wrapper>
            </Input.Root>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label.Root>Details <Label.Asterisk /></Label.Root>
            <Textarea.Root simple value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Describe what you need, why, and any context that helps" rows={6} required />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button.Root variant="neutral" mode="stroke" size="small" type="button" onClick={() => { setSubject(''); setDetails(''); }}>Reset</Button.Root>
            <Button.Root size="small" type="submit" disabled={pending}>
              <Button.Icon as={RiSendPlaneLine} />{pending ? 'Submitting...' : 'Submit Request'}
            </Button.Root>
          </div>
        </form>
      )}
    </div>
  );
}
