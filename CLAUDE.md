# CLAUDE.md — Quick India Logistics

## Project Overview

Logistics management platform for Quick India Logistics Pvt Ltd. Replaces an existing system called "Logistics Cube". Production-deployed Next.js 14 + AlignUI app with Postgres backend on AWS RDS, file storage on S3, hosting on AWS Amplify.

**Current phase:** Backend live. ~41 routes wired to RDS. Deployed and running. Iterating on features.

---

## Live URLs

- **Production:** https://master.d3hlhjyx8h5n7r.amplifyapp.com
- **Local dev:** http://localhost:3000

**Dev credentials:** `admin` / `admin12345` (super_admin). Other test users: `emp1` / `mgr1` / `adm1` all with password `test12345`.

---

## Stack

| Layer | Tool |
|-------|------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS + AlignUI tokens |
| UI Components | AlignUI (`/components/ui/`) — **do not modify** |
| Icons | `@remixicon/react` |
| Notifications | `sonner` |
| Date | `react-day-picker` + `date-fns` |
| **Database** | Postgres on **AWS RDS** (`qil-postgres.c7ug2c8i06zq.ap-south-1.rds.amazonaws.com`) |
| **DB driver** | Raw `pg` (no ORM) + `node-pg-migrate` for migrations |
| **Auth** | Custom: bcrypt + cookie sessions stored in DB (`sessions` table) |
| **Object storage** | AWS S3 (`qil-documents-523231703540`) for POD/invoice/EwayBill images |
| **Hosting** | AWS Amplify Hosting (SSR Compute) — app id `d3hlhjyx8h5n7r` |
| **Region** | `ap-south-1` (Mumbai) |
| Dev server | `npm run dev` → http://localhost:3000 |

---

## Project Structure

```
/app                       Next.js App Router pages (route groups: (app), (auth))
  /(app)/                  Authenticated routes — see "Wired Routes" below
  /(auth)/login            Server-action login
  /api/                    Route handlers (none currently — debug-env was removed)
/components                Shared layout + feature components
  /ui                      AlignUI library — DO NOT MODIFY
  app-shell, sidebar, app-header   Layout shell
  page-header, stats-strip         Shared on every page
  pagination-links                 Server-rendered pagination, URL-param-driven
  manifest-tabs, runsheet-tabs     Sub-nav for those modules
  coming-soon              Placeholder for unbuilt modules
/lib                       Backend code (all are `import 'server-only'`)
  db.ts                    pg Pool singleton + query/one/many helpers
  auth.ts                  bcrypt + session helpers (loginWithPassword, logout, getSession, requireSession)
  tenant.ts                currentOrgId, currentBranchIds (session-derived)
  permissions.ts           4-role RBAC rules + canAccessPath
  order-status.ts          status labels + DELIVERY_TYPE_LABEL (shared with client)
  s3.ts                    S3 client + upload + presigned-GET helpers
  ui-types.ts              shared Badge/typography types (client-safe)
  /db/<entity>.ts          per-entity typed queries (commodities, branches, users, orders, manifests, runsheets, dashboard, assets, vehicles, vendors, departments, ewaybill, login-events, order-images, bill-to)
/migrations                .sql files run by node-pg-migrate
/scripts                   tsx helper scripts (migrate, seed-bulk, seed-ops, set-password, etc.)
/transcription             Call transcripts + screenshot test artifacts
/middleware.ts             Auth gate + injects x-pathname header for role check
amplify.yml                Amplify build config (bakes env vars into .env.production)
INFRA.md                   Live AWS infra inventory
DEPLOY.md                  Amplify deployment guide
PRD.md                     Original product requirements (still useful for field details)
```

---

## Database

### Schema state (20 tables)
- `organizations`, `users`, `sessions`, `login_events`, `user_branches`
- `departments`, `designations`, `branches`
- `commodity_types`, `commodities`
- `bill_to`, `bill_to_gst`, `clients`, `client_dimension_formulas`
- `vendors`, `vendor_gst`, `vendor_dimension_formulas`
- `vehicles`
- `tat_routes`
- `orders`, `order_status_events`, `order_assets`, `order_images`
- `assets`, `asset_movements`
- `manifests`, `manifest_orders`
- `runsheets`, `runsheet_orders`

### Enums (text + check constraints)
- `orders.status`: `received | pickup_done | arrived_at_hub | connected | departed | arrived_at_destination | out_for_delivery | delivered | damaged | not_received | cancelled`
- `orders.lock_state`: `data_entry → customer_care → operation → accounts → admin_locked` (maker-checker)
- `orders.mode` / dimension formulas / tat: `local | air | surface | cargo | train | courier | warehouse`
- `manifests.state`: `rough | final | departed | arrived | received`
- `runsheets.state`: `rough | final | out_for_delivery | completed`
- `users.user_type`: `employee | manager | admin | super_admin`
- `order_images.kind`: `pod | pod_signature | pickup | delivery | damage | ewaybill | invoice | other`

### Critical schema notes (per transcripts)
- **CFA pattern**: `bill_to` has many `clients` underneath. Billing/invoicing happens at bill-to level; orders attach to a specific client.
- **Per-client dimension formulas**: `L*B*H / X * Y` per mode, stored in `client_dimension_formulas`.
- **TAT master**: per `(client × mode × origin_branch × destination_branch)` in `tat_routes`.
- **Asset stock movement**: `assets.in_use` flips when attached to an order; `asset_movements` logs cross-branch movement.

### Migrations
Run via `npm run db:migrate`. Files are SQL, naming `YYYYMMDDHHMMSS_name.sql` with `-- Up Migration` / `-- Down Migration` sections.

---

## Routes wired to DB (do not rebuild — extend)

### Authenticated (`/(app)/`)
- **/dashboard** — branch-scoped KPIs + recent activity, all real
- **/organization** — org profile (editable)
- **/ewaybill** — orders with ewaybill_no, Part B filter
- **/booking/orders** — list + drawer + search + pagination
- **/booking/orders/[docket]** — full detail + status timeline + linked manifests/runsheets + cold-chain asset attach + image gallery (S3)
- **/booking/orders/add** — 6-step wizard (creates real order + status event)
- **/booking/delivery-info** — POD listing with tabs (delivered/undelivered/pending_mark)
- **/booking/docket-issues** — Coming Soon stub
- **/manifest/all** — full manifest list with state filter
- **/manifest/pending-dispatch** — orders awaiting manifest + **Create Manifest workflow** (select + modal form)
- **/manifest/hub-dispatch** — rough manifests
- **/manifest/forwarding** — final manifests ready to forward
- **/manifest/pending-depart** — vehicle/AWB assigned + **Mark Departed** action
- **/manifest/incoming** — branch-scoped inbound
- **/runsheet/all** — runsheet list
- **/runsheet/pending-delivery** — orders ready for runsheet + **Create Runsheet workflow**
- **/runsheet/hub-dispatch** — vehicle manifests
- **/runsheet/incoming** — branch-scoped incoming runsheets
- **/master/commodities** — list + add + **edit + deactivate**
- **/master/branches** — list + add (full form)
- **/master/vendors** — list + add
- **/master/vehicles** — list + add
- **/master/assets** — list + add (kind-conditional fields)
- **/master/bill-to** — CFA view (bill-tos with nested clients)
- **/master/locations** — auto-derived from branches
- **/master/charges, /master/routes** — Coming Soon stubs (TAT data is in DB though)
- **/ems/users** — list + add (full drawer form)
- **/ems/departments, /ems/designations** — list + quick-add modal
- **/ems/login-details** — audit log with event-type filter
- **/ems/permissions** — role × route matrix derived from `lib/permissions.ts`
- **/ems/change-password** — self-service form
- **/analytics/reports** — date/client/mode filtered report
- **/misc/notice-category, /enquiry/docket-movement, /connect-us/{service-request,report}** — Coming Soon stubs

### Auth (`/(auth)/`)
- **/login, /signup** (signup is UI-only)

### Public
- **/api/health** (placeholder, not implemented yet)

---

## Patterns to follow

### Adding a list page
1. Add typed query in `lib/db/<entity>.ts` using `many<T>`, `one<T>` from `lib/db`. Always parameterize SQL ($1, $2…).
2. Make `page.tsx` a **server component** (no `'use client'`). Call `await currentOrgId()` for tenant scoping.
3. Use `<PageHeader>` + `<StatsStrip>` + a table from `components/ui/table` + `<PaginationLinks>`.
4. Read filter/page from `searchParams`. Use `<form method="GET">` for search.
5. Add the new route to `lib/permissions.ts` if it should be role-gated.

### Adding an Add/Edit form
1. Server action in `actions.ts` calling `requireSession()` + DB write + `revalidatePath(...)`.
2. Client component (`'use client'`) with `useState` form state + `useTransition` for pending UI.
3. **Radix Select inside a `<form>` REQUIRES a sibling hidden input** mirroring its value, or FormData won't carry it. Example:
   ```tsx
   <input type="hidden" name="branchType" value={branchType} />
   <Select.Root value={branchType} onValueChange={setBranchType}>...</Select.Root>
   ```
4. `onSubmit`: `new FormData(e.currentTarget)` → server action → `toast` result → `router.refresh()` or `setOpen(false)`.

### Adding a multi-step wizard
Pattern in `app/(app)/booking/orders/add/add-order-form.tsx`:
- Lift all state to parent client component (single `useState` object)
- Render ALL step `<div>`s with `className={step === N ? '' : 'hidden'}` (so fields stay mounted, FormData includes everything)
- Last step has `type="submit"` button; previous steps have `type="button"` with `onClick={() => setStep(p => p + 1)}`

### Adding a select-and-act workflow (Create Manifest / Create Runsheet)
- Row checkboxes drive a `selected: string[]` state in parent
- Top banner appears when `selected.length > 0` with action button
- Modal form opens; on submit, server action receives the joined IDs + form fields in one transaction (use `pool.connect()` + `begin/commit/rollback`)

### Image upload to S3
- `lib/s3.ts` exports `uploadToS3`, `presignGet`, `deleteFromS3`, `makeOrderImageKey`
- Server action accepts FormData with a `File` (Next.js handles multipart)
- Insert metadata in `order_images` table; S3 key stored, presign for display
- Page renders images via presigned GET URLs (1-hour TTL, regenerated each page load)

### Role-based access
- `lib/permissions.ts` defines path-prefix rules per role (most specific wins; `super_admin` bypasses)
- `app/(app)/layout.tsx` calls `canAccessPath(session.userType, pathname)` and redirects to `/dashboard?denied=1` on forbidden
- Sidebar filters nav items via `filterNavGroups(NAV_GROUPS, userType)`

---

## Gotchas / saved memory

1. **`lib/*` files with `import 'server-only'` cannot be imported into client components.** If you need a function on both sides, put it in a non-server-only module (e.g. `lib/order-status.ts`).
2. **Amplify forbids env vars starting with `AWS_`.** Use `S3_ACCESS_KEY_ID` etc.; `lib/s3.ts` has fallback to `AWS_*` for local dev.
3. **Amplify SSR doesn't expose console env vars to runtime by default.** `amplify.yml` writes them to `.env.production` during build so Next.js bakes them in.
4. **Radix Checkbox is `button[role="checkbox"]`**, not an HTML input. To click via JS: find by selector and `.click()`.
5. **Radix Select**: see "Adding an Add/Edit form" — always pair with a hidden input inside the form.
6. **Test driver: React-rerender race in modals.** When eval-driving a modal form, ANY agent-browser `fill` between setting a hidden input and submitting triggers a React render that resets the hidden input. Set hidden inputs LAST, immediately before submit, in the same eval block.
7. **Date columns from Postgres come back as `Date` objects** — render via `to_char(..., 'DD-MM-YYYY')` in SQL or convert to string in TS before JSX.
8. **`agent-browser find text "..." click` is unreliable for nested buttons.** Prefer `agent-browser snapshot -i | grep` for a `ref=eNN` then `agent-browser click @eNN`. Even better for buttons: `eval` with `Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === '...')`.
9. **RDS security group** allows `0.0.0.0/0` on 5432 (open for Amplify reach). Tighten to a VPC when moving to prod-grade.
10. **Default RDS connection** uses `ssl: { rejectUnauthorized: false }` because RDS uses AWS-managed certs; pg won't validate the chain by default.

---

## How to test changes

```bash
# Local
npm run dev                          # start dev server
npm run db:migrate                   # apply new migrations
npm run db:migrate:create -- name    # scaffold new migration
npx tsx scripts/set-password.ts admin newpass

# Production build check
npm run build

# Browser test via agent-browser
agent-browser open http://localhost:3000/login
agent-browser fill 'input[name="username"]' 'admin'
agent-browser fill 'input[name="password"]' 'admin12345'
agent-browser click 'button[type="submit"]'
sleep 3
agent-browser open "http://localhost:3000/master/commodities"
agent-browser screenshot --full /tmp/check.png
```

---

## Deployment

Every `git push origin master` auto-triggers an Amplify build (~5 min).

To watch a build:
```powershell
$env:Path = "C:\Program Files\Amazon\AWSCLIV2;" + $env:Path
$env:AWS_PROFILE = "qil-builder"
aws amplify list-jobs --app-id d3hlhjyx8h5n7r --branch-name master --region ap-south-1 --max-items 3
```

For env var changes: edit `lib/s3.ts` and similar to read the new name, set on app+branch via:
```powershell
aws amplify update-app --app-id d3hlhjyx8h5n7r --environment-variables KEY=val,...
aws amplify update-branch --app-id d3hlhjyx8h5n7r --branch-name master --environment-variables KEY=val,...
```
Then trigger a redeploy (or wait for next push).

CloudWatch log group: `/aws/amplify/d3hlhjyx8h5n7r`

---

## Reference Files

| File | Purpose |
|------|---------|
| `PRD.md` | Original product requirements — field-level details for every entity |
| `INFRA.md` | Live AWS resource inventory (RDS endpoint, S3 bucket, IAM, Secrets Manager, costs) |
| `DEPLOY.md` | Amplify deployment guide |
| `transcription/*.txt` | 14 client call transcripts (mammoth-extracted from .docx) — read when designing schema or workflows |
| `migrations/*.sql` | Database schema history |
| `lib/permissions.ts` | RBAC rules — update when adding role-gated routes |
| `lib/db/<entity>.ts` | Typed DB queries per entity |
| `scripts/seed-bulk.ts` | Bulk seed of ~200 orders, 60 commodities, 25 branches, 30 users |
| `scripts/seed-ops.ts` | Seed of vehicles, assets, manifests, runsheets, login events |
| `scripts/seed-test-users.ts` | Fixed test users emp1/mgr1/adm1 |
| `scripts/set-password.ts` | Reset any user's password |
| `tailwind.config.ts` | AlignUI design tokens |
| `components/ui/` | All AlignUI components (do not modify) |

---

## AlignUI conventions (still apply)

### Colors — never use raw Tailwind colors
- Text: `text-text-strong-950` / `text-text-sub-600` / `text-text-soft-400` / `text-text-disabled-300`
- Background: `bg-bg-white-0` / `bg-bg-weak-50` / `bg-bg-soft-200`
- Borders: `border-stroke-soft-200` / `border-stroke-sub-300`
- Status badges: `Badge.Root color="green" | "orange" | "red" | "blue" | "purple" | "sky" | "gray"`
- Semantic bg: `bg-success-lighter` / `bg-warning-lighter` / `bg-error-lighter` / `bg-information-lighter` / `bg-feature-lighter`

### Typography — never use raw font sizes
- Titles: `text-title-h4/h5/h6` (large numbers, section titles)
- Labels: `text-label-lg/md/sm/xs` (medium-weight headings)
- Paragraphs: `text-paragraph-md/sm/xs` (body, table cells)
- Subheadings: `text-subheading-xs/2xs` (uppercase tracked labels)

### Component priorities
| Situation | Use |
|-----------|-----|
| Inline detail panel | `Drawer.*` |
| Confirmation dialog | `Modal.*` |
| Multi-step flows | `HorizontalStepper.*` |
| Page trail | `Breadcrumb.*` (built into `PageHeader`) |
| Icon-only buttons | wrap with `Tooltip.*` |

---

## Do not

- Modify files in `components/ui/` (AlignUI library)
- Use raw Tailwind colors (`text-blue-700`, `bg-green-50`) — use AlignUI semantic tokens
- Use raw font sizes (`text-xs`, `text-sm`) — use AlignUI typography tokens
- Use raw HTML form elements when an AlignUI wrapper exists
- Use manual modal/slide-over divs — use `Drawer.*` or `Modal.*`
- Import server-only modules into client components (will fail at build)
- Add env vars starting with `AWS_` to Amplify (forbidden — use `S3_*`)
- Commit `.env.local` (gitignored — contains real RDS password and AWS keys)
- Re-create `app/(app)/master/commodities/page.tsx` patterns from scratch — copy the existing pattern
- Use `any` in TypeScript
- Hardcode entity data on a page that exists in the DB — query it
