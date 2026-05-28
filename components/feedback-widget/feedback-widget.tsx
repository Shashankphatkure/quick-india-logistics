'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import * as Button from '@/components/ui/button';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import * as Textarea from '@/components/ui/textarea';
import {
  RiBug2Line,
  RiCloseLine,
  RiLightbulbLine,
  RiCheckboxCircleFill,
  RiCameraLine,
  RiCrop2Line,
  RiDeleteBinLine,
  RiQuestionLine,
  RiSparklingLine,
  RiArrowLeftLine,
  RiLoader4Line,
  RiMessage3Line,
} from '@remixicon/react';
import { cn } from '@/utils/cn';

type FeedbackKind = 'bug' | 'feature' | 'improvement' | 'question';

const KINDS: {
  value: FeedbackKind;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
}[] = [
  { value: 'bug', label: 'Bug', description: 'Something is broken', icon: RiBug2Line, accent: 'bg-error-lighter text-error-base ring-error-light' },
  { value: 'feature', label: 'Feature', description: 'I want a new thing', icon: RiSparklingLine, accent: 'bg-feature-lighter text-feature-base ring-feature-light' },
  { value: 'improvement', label: 'Improvement', description: 'Make this better', icon: RiLightbulbLine, accent: 'bg-warning-lighter text-warning-base ring-warning-light' },
  { value: 'question', label: 'Question', description: 'I need help', icon: RiQuestionLine, accent: 'bg-information-lighter text-information-base ring-information-light' },
];

export interface FeedbackUser {
  id: string;
  fullName: string;
  email: string | null;
  userType: string | null;
}

type Step = 'chooser' | 'form' | 'capturing' | 'cropping' | 'success' | 'error';

export default function FeedbackWidget({ user }: { user: FeedbackUser }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('chooser');
  const [kind, setKind] = useState<FeedbackKind>('bug');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [screenshotData, setScreenshotData] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [issueUrl, setIssueUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cropSource, setCropSource] = useState<string | null>(null);
  const [cropRect, setCropRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  useEffect(() => {
    if (!open || step === 'cropping') return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, step]);

  const reset = useCallback(() => {
    setStep('chooser'); setKind('bug'); setTitle(''); setDescription('');
    setScreenshotData(null); setIssueUrl(null); setErrorMessage(null); setSubmitting(false);
  }, []);

  const handleClose = () => { setOpen(false); setTimeout(reset, 250); };
  const handleKindSelect = (k: FeedbackKind) => { setKind(k); setStep('form'); };

  const captureFullPage = async () => {
    setStep('capturing');
    const root = document.getElementById('feedback-widget-root');
    if (root) root.style.visibility = 'hidden';
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(document.body, {
        useCORS: true, logging: false,
        windowWidth: document.documentElement.clientWidth,
        windowHeight: document.documentElement.clientHeight,
        x: window.scrollX, y: window.scrollY,
        width: window.innerWidth, height: window.innerHeight,
        backgroundColor: '#ffffff',
      });
      setScreenshotData(canvas.toDataURL('image/png'));
      setStep('form');
    } catch (e) {
      setErrorMessage('Could not capture screenshot.');
      setStep('form');
    } finally {
      if (root) root.style.visibility = '';
    }
  };

  const captureArea = async () => {
    setStep('capturing');
    const root = document.getElementById('feedback-widget-root');
    if (root) root.style.visibility = 'hidden';
    try {
      const html2canvas = (await import('html2canvas')).default;
      const fullCanvas = await html2canvas(document.body, {
        useCORS: true, logging: false,
        x: window.scrollX, y: window.scrollY,
        width: window.innerWidth, height: window.innerHeight,
        backgroundColor: '#ffffff',
      });
      setCropSource(fullCanvas.toDataURL('image/png'));
      setCropRect(null);
      setStep('cropping');
    } catch (e) {
      setErrorMessage('Could not capture screenshot.');
      setStep('form');
    } finally {
      if (root) root.style.visibility = '';
    }
  };

  const finishCrop = useCallback((rect: { x: number; y: number; w: number; h: number }, source: string) => {
    if (rect.w < 8 || rect.h < 8) { setCropSource(null); setCropRect(null); setStep('form'); return; }
    const img = new Image();
    img.onload = () => {
      const overlay = document.getElementById('feedback-crop-overlay');
      const overlayW = overlay?.clientWidth || window.innerWidth;
      const overlayH = overlay?.clientHeight || window.innerHeight;
      const scaleX = img.naturalWidth / overlayW;
      const scaleY = img.naturalHeight / overlayH;
      const cw = Math.max(1, Math.round(rect.w * scaleX));
      const ch = Math.max(1, Math.round(rect.h * scaleY));
      const cropCanvas = document.createElement('canvas');
      cropCanvas.width = cw; cropCanvas.height = ch;
      const ctx = cropCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, Math.round(rect.x * scaleX), Math.round(rect.y * scaleY), cw, ch, 0, 0, cw, ch);
        setScreenshotData(cropCanvas.toDataURL('image/png'));
      }
      setCropSource(null); setCropRect(null); setStep('form');
    };
    img.src = source;
  }, []);

  const cancelCrop = useCallback(() => { setCropSource(null); setCropRect(null); setStep('form'); }, []);

  useEffect(() => {
    if (step !== 'cropping') return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); cancelCrop(); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step, cancelCrop]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    setSubmitting(true); setErrorMessage(null);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind,
          title: title.trim() || undefined,
          description: description.trim(),
          screenshotDataUrl: screenshotData,
          path: pathname,
          url: typeof window !== 'undefined' ? window.location.href : '',
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
          viewport: typeof window !== 'undefined' ? { w: window.innerWidth, h: window.innerHeight } : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Could not submit feedback.');
      setIssueUrl(data.issueUrl || null);
      setStep('success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not submit feedback.';
      setErrorMessage(msg);
      setStep('error');
    } finally {
      setSubmitting(false);
    }
  };

  const activeKind = KINDS.find((k) => k.value === kind)!;

  return (
    <div id="feedback-widget-root">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Send feedback"
        className={cn(
          'fixed right-3 top-1/2 z-[60] -translate-y-1/2 -rotate-90 origin-right',
          'rounded-t-lg bg-primary-base px-3 py-1.5 text-static-white shadow-regular-md',
          'flex items-center gap-1.5 text-label-sm',
          'transition hover:bg-primary-darker hover:shadow-regular-lg',
          open && 'pointer-events-none opacity-0',
        )}
      >
        <RiMessage3Line className="h-4 w-4" />
        Feedback
      </button>

      {step === 'cropping' && cropSource && (
        <div
          id="feedback-crop-overlay"
          className="fixed inset-0 z-[100] cursor-crosshair select-none"
          onMouseDown={(e) => {
            if (!cropSource) return;
            const target = e.currentTarget;
            const rect = target.getBoundingClientRect();
            const startX = e.clientX - rect.left;
            const startY = e.clientY - rect.top;
            const source = cropSource;
            let lastRect = { x: startX, y: startY, w: 0, h: 0 };
            setCropRect(lastRect);
            const onMove = (ev: MouseEvent) => {
              const r2 = target.getBoundingClientRect();
              const cx = Math.max(0, Math.min(r2.width, ev.clientX - r2.left));
              const cy = Math.max(0, Math.min(r2.height, ev.clientY - r2.top));
              lastRect = { x: Math.min(startX, cx), y: Math.min(startY, cy), w: Math.abs(cx - startX), h: Math.abs(cy - startY) };
              setCropRect(lastRect);
            };
            const onUp = () => {
              window.removeEventListener('mousemove', onMove);
              window.removeEventListener('mouseup', onUp);
              finishCrop(lastRect, source);
            };
            window.addEventListener('mousemove', onMove);
            window.addEventListener('mouseup', onUp);
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cropSource} alt="" draggable={false} className="pointer-events-none absolute inset-0 h-full w-full object-fill" />
          {cropRect && cropRect.w > 0 && cropRect.h > 0 ? (
            <>
              <div className="pointer-events-none absolute left-0 right-0 top-0 bg-black/40" style={{ height: cropRect.y }} />
              <div className="pointer-events-none absolute left-0 right-0 bg-black/40" style={{ top: cropRect.y + cropRect.h, bottom: 0 }} />
              <div className="pointer-events-none absolute left-0 bg-black/40" style={{ top: cropRect.y, height: cropRect.h, width: cropRect.x }} />
              <div className="pointer-events-none absolute bg-black/40" style={{ top: cropRect.y, height: cropRect.h, left: cropRect.x + cropRect.w, right: 0 }} />
              <div className="pointer-events-none absolute border-2 border-primary-base" style={{ left: cropRect.x, top: cropRect.y, width: cropRect.w, height: cropRect.h }} />
            </>
          ) : (
            <div className="pointer-events-none absolute inset-0 bg-black/30" />
          )}
          <div className="pointer-events-none absolute left-1/2 top-6 -translate-x-1/2 rounded-full bg-bg-white-0 px-4 py-2 text-paragraph-sm text-text-strong-950 shadow-regular-lg">
            Drag to select the area · ESC to cancel
          </div>
        </div>
      )}

      {open && step !== 'cropping' && (
        <div className="fixed inset-0 z-[80] flex justify-end">
          <div className="absolute inset-0 bg-overlay backdrop-blur-[2px]" onClick={handleClose} />
          <div className="relative my-4 mr-4 flex h-[calc(100vh-2rem)] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-bg-white-0 shadow-regular-md">
            <div className="flex items-center justify-between border-b border-stroke-soft-200 px-5 py-4">
              <div className="flex items-center gap-3">
                {step === 'form' && (
                  <button type="button" onClick={() => setStep('chooser')} className="rounded-lg p-1 text-text-soft-400 hover:bg-bg-weak-50 hover:text-text-strong-950">
                    <RiArrowLeftLine className="h-4 w-4" />
                  </button>
                )}
                <div className={cn('flex h-9 w-9 items-center justify-center rounded-full ring-1 ring-inset',
                  step === 'form' ? activeKind.accent : 'bg-primary-alpha-10 text-primary-base ring-primary-alpha-24')}>
                  {step === 'form' ? <activeKind.icon className="h-4 w-4" /> : <RiMessage3Line className="h-4 w-4" />}
                </div>
                <div>
                  <h3 className="text-label-md text-text-strong-950">
                    {step === 'success' ? 'Thanks for the feedback!'
                      : step === 'error' ? 'Something went wrong'
                      : step === 'form' ? `Report a ${activeKind.label.toLowerCase()}`
                      : 'Send feedback'}
                  </h3>
                  <p className="text-paragraph-xs text-text-soft-400 truncate">
                    {pathname}{user.userType ? ` · ${user.userType}` : ''}
                  </p>
                </div>
              </div>
              <button type="button" onClick={handleClose} className="rounded-lg p-1 text-text-soft-400 hover:bg-bg-weak-50 hover:text-text-strong-950" aria-label="Close">
                <RiCloseLine className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {step === 'chooser' && (
                <div className="space-y-2 p-5">
                  <p className="mb-3 text-paragraph-sm text-text-sub-600">
                    Each report is sent as a GitHub issue with the page, your role, and an optional screenshot attached.
                  </p>
                  {KINDS.map((k) => (
                    <button key={k.value} type="button" onClick={() => handleKindSelect(k.value)}
                      className="flex w-full items-center gap-3 rounded-xl border border-stroke-soft-200 p-3 text-left transition hover:border-primary-base hover:bg-bg-weak-50">
                      <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-1 ring-inset', k.accent)}>
                        <k.icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-label-sm text-text-strong-950">{k.label}</p>
                        <p className="text-paragraph-xs text-text-soft-400">{k.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {step === 'capturing' && (
                <div className="flex h-full items-center justify-center p-10">
                  <div className="flex flex-col items-center gap-3 text-text-sub-600">
                    <RiLoader4Line className="h-6 w-6 animate-spin" />
                    <p className="text-paragraph-sm">Capturing screen…</p>
                  </div>
                </div>
              )}

              {step === 'form' && (
                <form onSubmit={handleSubmit} className="space-y-4 p-5">
                  <div>
                    <Label.Root htmlFor="fb_title">Title (optional)</Label.Root>
                    <Input.Root className="mt-1">
                      <Input.Wrapper>
                        <Input.Input id="fb_title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Short summary" maxLength={120} />
                      </Input.Wrapper>
                    </Input.Root>
                  </div>

                  <div>
                    <Label.Root htmlFor="fb_description">What happened? <span className="text-error-base">*</span></Label.Root>
                    <Textarea.Root simple id="fb_description" value={description} onChange={(e) => setDescription(e.target.value)}
                      placeholder={kind === 'bug' ? 'Steps to reproduce, what you expected, what happened…'
                        : kind === 'feature' ? 'Describe the feature and the problem it solves.' : 'Tell us more…'}
                      rows={5} className="mt-1" required />
                  </div>

                  <div>
                    <Label.Root>Screenshot</Label.Root>
                    {screenshotData ? (
                      <div className="relative mt-1 overflow-hidden rounded-xl border border-stroke-soft-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={screenshotData} alt="screenshot" className="h-40 w-full object-contain bg-bg-weak-50" />
                        <button type="button" onClick={() => setScreenshotData(null)}
                          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-bg-white-0 text-text-sub-600 shadow-regular-sm ring-1 ring-stroke-soft-200 hover:text-error-base" aria-label="Remove screenshot">
                          <RiDeleteBinLine className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="mt-1 grid grid-cols-2 gap-2">
                        <button type="button" onClick={captureFullPage}
                          className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-stroke-soft-200 p-3 text-text-sub-600 transition hover:border-primary-base hover:bg-primary-alpha-10 hover:text-primary-base">
                          <RiCameraLine className="h-5 w-5" />
                          <span className="text-paragraph-xs">Capture page</span>
                        </button>
                        <button type="button" onClick={captureArea}
                          className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-stroke-soft-200 p-3 text-text-sub-600 transition hover:border-primary-base hover:bg-primary-alpha-10 hover:text-primary-base">
                          <RiCrop2Line className="h-5 w-5" />
                          <span className="text-paragraph-xs">Select area</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {errorMessage && <p className="text-paragraph-xs text-error-base">{errorMessage}</p>}
                </form>
              )}

              {step === 'success' && (
                <div className="flex flex-col items-center gap-3 p-8 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success-lighter text-success-base">
                    <RiCheckboxCircleFill className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-label-md text-text-strong-950">Thank you!</p>
                    <p className="mt-1 text-paragraph-sm text-text-sub-600">
                      Your feedback has been filed. {issueUrl && (
                        <>See it on <a href={issueUrl} target="_blank" rel="noopener noreferrer" className="text-primary-base hover:underline">GitHub →</a></>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {step === 'error' && (
                <div className="flex flex-col items-center gap-3 p-8 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-error-lighter text-error-base">
                    <RiCloseLine className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-label-md text-text-strong-950">Submission failed</p>
                    <p className="mt-1 text-paragraph-sm text-text-sub-600">{errorMessage || 'An unexpected error occurred.'}</p>
                  </div>
                  <Button.Root type="button" variant="neutral" mode="stroke" onClick={() => setStep('form')}>Try again</Button.Root>
                </div>
              )}
            </div>

            {step === 'form' && (
              <div className="flex items-center justify-between border-t border-stroke-soft-200 px-5 py-3">
                <p className="text-paragraph-xs text-text-soft-400 truncate">
                  Logged in as <span className="text-text-sub-600">{user.fullName}</span>
                </p>
                <div className="flex items-center gap-2">
                  <Button.Root type="button" variant="neutral" mode="stroke" size="small" onClick={handleClose}>Cancel</Button.Root>
                  <Button.Root type="button" size="small" disabled={submitting || !description.trim()} onClick={handleSubmit}>
                    {submitting ? (<><RiLoader4Line className="h-4 w-4 animate-spin" />Sending…</>) : 'Send feedback'}
                  </Button.Root>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
