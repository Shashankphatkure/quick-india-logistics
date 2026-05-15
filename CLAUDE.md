# CLAUDE.md — New Logistics Web App

## Project Overview

We are rebuilding a logistics management platform (reference: "Logistics Cube" by Quick India Logistics Pvt Ltd) as a modern Next.js 14 web app using the AlignUI design system. Full feature spec is in `PRD.md`.

**Current phase: UI only — static/mock data, no backend.**

---

## Stack

| Layer | Tool |
|-------|------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS + AlignUI tokens |
| UI Components | AlignUI (`/components/ui/`) |
| Icons | `@remixicon/react` |
| Notifications | `sonner` |
| Date | `react-day-picker` + `date-fns` |
| Dev server | `pnpm dev` → http://localhost:3000 |

---

## Project Structure

```
/app                  Next.js App Router pages
/components/ui        AlignUI components (DO NOT modify these)
/components           Shared layout/app-level components
/hooks                Custom hooks
/utils                cn.ts, tv.ts, polymorphic helpers
/public               Static assets
PRD.md                Full product requirements (read before building any feature)
CLAUDE.md             This file
```

---

## Key Conventions

### Always use AlignUI components
- All UI must use components from `/components/ui/` — buttons, inputs, selects, modals, tables, badges, dropdowns, tabs, etc.
- Never write raw `<button>` or `<input>` — always use the AlignUI wrapper
- Import pattern: `import { Button } from "@/components/ui/button"`

### Icons
- Use `@remixicon/react` exclusively
- Pattern: `import { RiAddLine } from "@remixicon/react"`
- Icon size in buttons: `size={16}` or `size={20}`

### Styling
- Use TailwindCSS utility classes only
- Use `cn()` from `@/utils/cn` for conditional classes
- Use `tv()` from `@/utils/tv` for variant-based styles
- AlignUI tokens are configured in `tailwind.config.ts` — use them (e.g. `bg-bg-white-0`, `text-text-primary-900`, `border-stroke-soft-200`)

### TypeScript
- All components must be typed — no `any`
- Props interfaces above each component
- Use `React.FC<Props>` or explicit return types

### File naming
- Pages: `app/(module)/page.tsx`
- Components: `components/feature-name.tsx` (kebab-case)
- No barrel index files unless the folder has 3+ exports

### Mock data
- Since we are UI-only, all data is hardcoded/mocked inline in the page or in a `/lib/mock/` file
- Use realistic sample data matching what the existing system shows (see PRD.md for examples)

---

## App Layout

The app shell consists of:
- **Sidebar** — collapsible left nav with all module links (see PRD.md §2)
- **Header** — global docket search, branch selector, user dropdown
- **Main content area** — each page renders here

Layout file: `app/layout.tsx` (to be built)  
Sidebar component: `components/sidebar.tsx` (to be built)  
Header component: `components/header.tsx` (to be built)

---

## Page Building Rules

1. **Read PRD.md first** for the module you are building — every field, column, and action is documented there
2. Every list page needs: search bar, data table with sortable columns, pagination, filter button, action button (top-right)
3. Every form page needs: collapsible sections (⊖/⊕), required field (`*`) indicators, Save + Cancel buttons
4. Tables use checkboxes on rows for bulk selection
5. Status badges: `Active` (green), `Inactive` (grey), `Pending` (yellow), `Approved` (green)
6. All pages use the shared layout shell (sidebar + header)

---

## Dev Server

```bash
pnpm dev          # start on http://localhost:3000
pnpm build        # production build check
pnpm lint         # ESLint
```

---

## Browser Testing with agent-browser

We use `agent-browser` (native Rust CLI) to visually verify pages after building them. It is already installed globally.

### Basic workflow after building a page

```bash
# 1. Make sure dev server is running (pnpm dev)
# 2. Open the page and take a screenshot
agent-browser open http://localhost:3000/<page-path>
agent-browser screenshot --full screenshot.png
agent-browser close
```

### Snapshot the interactive elements

```bash
agent-browser open http://localhost:3000/booking/orders
agent-browser snapshot -i          # compact accessibility tree
agent-browser close
```

### Full page screenshot for review

```bash
agent-browser open http://localhost:3000
agent-browser screenshot --full "C:/Users/krishna/Desktop/review.png"
agent-browser close
```

### React component tree inspection

```bash
agent-browser open --enable react-devtools http://localhost:3000
agent-browser react tree
agent-browser close
```

### Check available skills

```bash
agent-browser skills list
agent-browser skills get core         # full workflow guide
agent-browser skills get dogfood      # exploratory QA / bug hunt
```

---

## Module Build Order

Build in this sequence (each depends on the previous shell):

1. **App shell** — sidebar + header layout (all pages use this)
2. **Dashboard** — stat cards, order counts
3. **Master / Commodities** — simple list + add form (good pattern reference)
4. **EMS / Users** — complex form with permissions matrix
5. **Booking / Orders** — multi-step form, rich table
6. **Manifest** — tabbed views, forward modal
7. **Runsheet** — pending delivery + create runsheet flow
8. **Analytics / Reports** — filter forms + empty result tables
9. **Organization** — multi-org form

---

## Reference Files

| File | Purpose |
|------|---------|
| `PRD.md` | Complete product requirements — every field, column, form, route |
| `Existing Software Screenshot.pdf` | Screenshots of the current system for visual reference |
| `tailwind.config.ts` | AlignUI design tokens |
| `components/ui/` | All available AlignUI components |

---

## Do Not

- Do not modify files in `components/ui/` — these are AlignUI library components
- Do not add a backend or API calls — UI only for now
- Do not use raw HTML form elements — always use AlignUI components
- Do not invent new routes not in PRD.md §16 without discussing first
- Do not use `any` type in TypeScript
- Do not add dependencies without checking if AlignUI already covers the use case
