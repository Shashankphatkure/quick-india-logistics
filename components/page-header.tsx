import React from 'react';
import Link from 'next/link';
import { cn } from '@/utils/cn';
import * as Breadcrumb from '@/components/ui/breadcrumb';
import { RiArrowRightSLine } from '@remixicon/react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  icon?: React.ElementType;
  iconColor?: string;
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  children?: React.ReactNode; // right-side actions
  className?: string;
}

export default function PageHeader({
  icon: Icon,
  iconColor = 'bg-primary-alpha-10 text-primary-base',
  title,
  subtitle,
  breadcrumbs,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {/* Breadcrumb trail */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb.Root>
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={crumb.label}>
              {i > 0 && (
                <Breadcrumb.ArrowIcon as={RiArrowRightSLine} />
              )}
              <Breadcrumb.Item active={i === breadcrumbs.length - 1} asChild={!!crumb.href && i < breadcrumbs.length - 1}>
                {crumb.href && i < breadcrumbs.length - 1 ? (
                  <Link href={crumb.href} className="no-underline">{crumb.label}</Link>
                ) : (
                  <span>{crumb.label}</span>
                )}
              </Breadcrumb.Item>
            </React.Fragment>
          ))}
        </Breadcrumb.Root>
      )}

      {/* Main header row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl', iconColor)}>
              <Icon size={20} />
            </div>
          )}
          <div>
            <h1 className="text-label-lg text-text-strong-950">{title}</h1>
            {subtitle && (
              <p className="mt-0.5 text-paragraph-sm text-text-sub-600">{subtitle}</p>
            )}
          </div>
        </div>
        {children && (
          <div className="flex flex-wrap items-center gap-2">{children}</div>
        )}
      </div>
    </div>
  );
}
