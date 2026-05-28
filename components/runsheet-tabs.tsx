import Link from 'next/link';
import { cn } from '@/utils/cn';

const TABS = [
  { label: 'Pending Delivery', href: '/runsheet/pending-delivery' },
  { label: 'Hub Dispatch', href: '/runsheet/hub-dispatch' },
  { label: 'Incoming Runsheet', href: '/runsheet/incoming' },
  { label: 'All Runsheet', href: '/runsheet/all' },
];

export default function RunsheetTabs({ active }: { active: string }) {
  return (
    <div className="flex gap-0.5 overflow-x-auto rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-1 shadow-regular-xs">
      {TABS.map(t => (
        <Link key={t.href} href={t.href}
          className={cn(
            'shrink-0 rounded-lg px-3 py-1.5 text-paragraph-sm font-medium no-underline transition',
            t.href === active
              ? 'bg-primary-base text-static-white shadow-regular-xs'
              : 'text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950',
          )}
        >{t.label}</Link>
      ))}
    </div>
  );
}
