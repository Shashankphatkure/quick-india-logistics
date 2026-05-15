/**
 * AlignUI Component Type Definitions
 * Centralized prop types extracted from /components/ui/ — use these for type-safe usage.
 * Color tokens sourced from: https://www.alignui.com/docs/v1.2/foundation/color
 * Typography tokens sourced from: https://www.alignui.com/docs/v1.2/foundation/typography
 */

// ─── BUTTON ──────────────────────────────────────────────────────────────────
export type ButtonVariant = 'primary' | 'neutral' | 'error';
export type ButtonMode = 'filled' | 'stroke' | 'lighter' | 'ghost';
export type ButtonSize = 'medium' | 'small' | 'xsmall' | 'xxsmall';

// ─── INPUT ────────────────────────────────────────────────────────────────────
export type InputSize = 'medium' | 'small' | 'xsmall';

// ─── SELECT ───────────────────────────────────────────────────────────────────
export type SelectVariant = 'default' | 'compact' | 'compactForInput' | 'inline';
export type SelectSize = 'medium' | 'small' | 'xsmall';

// ─── TEXTAREA ─────────────────────────────────────────────────────────────────
// No size/variant — uses simple?: boolean, hasError?: boolean

// ─── BADGE ────────────────────────────────────────────────────────────────────
export type BadgeVariant = 'filled' | 'light' | 'lighter' | 'stroke';
export type BadgeSize = 'small' | 'medium';
export type BadgeColor =
  | 'gray'
  | 'blue'
  | 'orange'
  | 'red'
  | 'green'
  | 'yellow'
  | 'purple'
  | 'sky'
  | 'pink'
  | 'teal';

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
export type StatusBadgeVariant = 'stroke' | 'light';
export type StatusBadgeStatus = 'completed' | 'pending' | 'failed' | 'disabled';

// ─── PAGINATION ───────────────────────────────────────────────────────────────
export type PaginationVariant = 'basic' | 'rounded' | 'group';

// ─── AVATAR ───────────────────────────────────────────────────────────────────
export type AvatarSize = '20' | '24' | '32' | '40' | '48' | '56' | '64' | '72' | '80';
export type AvatarColor = 'gray' | 'yellow' | 'blue' | 'sky' | 'purple' | 'red';

// ─── TAG ──────────────────────────────────────────────────────────────────────
export type TagVariant = 'stroke' | 'gray';

// ─── COMPACT BUTTON ───────────────────────────────────────────────────────────
export type CompactButtonVariant = 'stroke' | 'ghost' | 'white' | 'modifiable';
export type CompactButtonSize = 'medium' | 'large';

// ─── DIVIDER ──────────────────────────────────────────────────────────────────
export type DividerVariant =
  | 'line'
  | 'line-spacing'
  | 'line-text'
  | 'content'
  | 'text'
  | 'solid-text';

// ─── TYPOGRAPHY CLASSES ────────────────────────────────────────────────────────
// Use these Tailwind class names for consistent typography.
// Source: https://www.alignui.com/docs/v1.2/foundation/typography
export const TYPOGRAPHY = {
  // Titles (Medium/500)
  h1: 'text-title-h1',    // 56px / 64px / -1%
  h2: 'text-title-h2',    // 48px / 56px / -1%
  h3: 'text-title-h3',    // 40px / 48px / -1%
  h4: 'text-title-h4',    // 32px / 40px / -0.5%
  h5: 'text-title-h5',    // 24px / 32px
  h6: 'text-title-h6',    // 20px / 28px

  // Labels (Medium/500)
  labelXl: 'text-label-xl',   // 24px / 32px / -1.5%
  labelLg: 'text-label-lg',   // 18px / 24px / -1.5%
  labelMd: 'text-label-md',   // 16px / 24px / -1.1%
  labelSm: 'text-label-sm',   // 14px / 20px / -0.6%
  labelXs: 'text-label-xs',   // 12px / 16px

  // Paragraphs (Regular/400)
  paragraphXl: 'text-paragraph-xl',  // 24px / 32px / -1.5%
  paragraphLg: 'text-paragraph-lg',  // 18px / 24px / -1.5%
  paragraphMd: 'text-paragraph-md',  // 16px / 24px / -1.1%
  paragraphSm: 'text-paragraph-sm',  // 14px / 20px / -0.6%
  paragraphXs: 'text-paragraph-xs',  // 12px / 16px

  // Subheadings (Medium/500, spaced)
  subheadingMd: 'text-subheading-md',    // 16px / 6% tracking
  subheadingSm: 'text-subheading-sm',    // 14px / 6% tracking
  subheadingXs: 'text-subheading-xs',    // 12px / 4% tracking
  subheading2xs: 'text-subheading-2xs',  // 11px / 2% tracking
} as const;

// ─── SEMANTIC COLOR TOKENS ─────────────────────────────────────────────────────
// Source: https://www.alignui.com/docs/v1.2/foundation/color
// Always prefer these over raw Tailwind colors (e.g., bg-blue-50)

export const COLOR = {
  // Text
  text: {
    strong: 'text-text-strong-950',    // Primary text
    sub: 'text-text-sub-600',          // Secondary text
    soft: 'text-text-soft-400',        // Muted text
    disabled: 'text-text-disabled-300', // Disabled text
    white: 'text-text-white-0',        // White text (on dark bg)
  },

  // Background
  bg: {
    strong: 'bg-bg-strong-950',
    surface: 'bg-bg-surface-800',
    sub: 'bg-bg-sub-300',
    soft: 'bg-bg-soft-200',
    weak: 'bg-bg-weak-50',            // Light gray (hover, table header)
    weakLight: 'bg-bg-weak-25',
    white: 'bg-bg-white-0',           // Card/panel background
  },

  // Borders/strokes
  stroke: {
    strong: 'border-stroke-strong-950',
    sub: 'border-stroke-sub-300',
    soft: 'border-stroke-soft-200',   // Standard border
    white: 'border-stroke-white-0',
  },

  // Primary brand
  primary: {
    base: 'text-primary-base',
    bgBase: 'bg-primary-base',
    dark: 'text-primary-dark',
    alpha10: 'bg-primary-alpha-10',
    alpha16: 'bg-primary-alpha-16',
    alpha24: 'bg-primary-alpha-24',
  },

  // Semantic states — pair bg+text for inline styled elements
  // Prefer Badge.Root color prop when possible
  success: {
    text: 'text-success-base',
    bg: 'bg-success-lighter',
    border: 'border-success-light',
    dark: 'text-success-dark',
  },
  warning: {
    text: 'text-warning-base',
    bg: 'bg-warning-lighter',
    border: 'border-warning-light',
    dark: 'text-warning-dark',
  },
  error: {
    text: 'text-error-base',
    bg: 'bg-error-lighter',
    border: 'border-error-light',
    dark: 'text-error-dark',
  },
  information: {
    text: 'text-information-base',
    bg: 'bg-information-lighter',
    border: 'border-information-light',
    dark: 'text-information-dark',
  },
  away: {
    text: 'text-away-base',
    bg: 'bg-away-lighter',
    border: 'border-away-light',
  },
  feature: {
    text: 'text-feature-base',
    bg: 'bg-feature-lighter',
    border: 'border-feature-light',
  },
  verified: {
    text: 'text-verified-base',
    bg: 'bg-verified-lighter',
    border: 'border-verified-light',
  },
  faded: {
    text: 'text-faded-base',
    bg: 'bg-faded-lighter',
    border: 'border-faded-light',
  },
} as const;

// ─── STATUS → BADGE COLOR MAPPING ─────────────────────────────────────────────
// Maps app status strings to Badge component color props.
// Usage: <Badge.Root color={STATUS_TO_BADGE_COLOR['Active']} variant="light">
export const STATUS_TO_BADGE_COLOR: Record<string, BadgeColor> = {
  // Positive
  Active: 'green',
  Approved: 'green',
  Delivered: 'green',
  Completed: 'green',

  // Informational / In progress
  New: 'blue',
  'In Transit': 'blue',
  Processing: 'blue',

  // Warning / Pending
  Pending: 'orange',
  'Not Delivered': 'orange',
  'Pending Part B': 'orange',

  // Negative
  Inactive: 'red',
  Cancelled: 'red',
  Failed: 'red',
  Rejected: 'red',
  Expired: 'red',

  // Neutral / Other
  Draft: 'gray',
  Disabled: 'gray',
  Sample: 'purple',
  Cold: 'sky',
};

// ─── FORM FIELD HELPER ────────────────────────────────────────────────────────
// Standard className for raw select elements when Select.Root isn't suitable.
// Prefer Select.Root from '@/components/ui/select' whenever possible.
export const RAW_SELECT_CLASS =
  'w-full rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 text-paragraph-sm text-text-strong-950 outline-none transition hover:bg-bg-weak-50 focus:border-stroke-strong-950 focus:ring-1 focus:ring-stroke-strong-950 disabled:cursor-not-allowed disabled:bg-bg-weak-50 disabled:text-text-disabled-300';
