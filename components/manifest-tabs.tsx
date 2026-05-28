import Link from 'next/link';
import { cn } from '@/utils/cn';

const TABS = [
  { label: 'Pending For Dispatch', href: '/manifest/pending-dispatch' },
  { label: 'Hub Dispatch', href: '/manifest/hub-dispatch' },
  { label: 'Forwarding Details', href: '/manifest/forwarding' },
  { label: 'Pending To Depart', href: '/manifest/pending-depart' },
  { label: 'Incoming Manifest', href: '/manifest/incoming' },
  { label: 'All Manifest', href: '/manifest/all' },
];

export default function ManifestTabs({ active }: { active: string }) {
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
