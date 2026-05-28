# INFRA.md — AWS Infrastructure

Source-of-truth doc for all AWS resources backing this app. Update whenever resources change.

## Account

| Field | Value |
|-------|-------|
| Account ID | `523231703540` |
| Region | `ap-south-1` (Mumbai) |
| IAM user (dev) | `claude-builder` (AdministratorAccess) |
| Local CLI profile | `qil-builder` |
| Monthly budget alarm | `qil-monthly-cap` → $50 → `nash@peermetals.com` |

## Provisioned resources

### RDS Postgres
| Field | Value |
|-------|-------|
| Identifier | `qil-postgres` |
| Engine | PostgreSQL 17.10 |
| Class | `db.t4g.micro` (single AZ) |
| Storage | 20 GB gp3, encrypted |
| Endpoint | `qil-postgres.c7ug2c8i06zq.ap-south-1.rds.amazonaws.com:5432` |
| Database | `qildb` |
| Master user | `qiladmin` |
| Backup retention | 1 day |
| Publicly accessible | yes (locked down via SG to dev IP) |
| Est. cost | ~$13–15/month |

### S3
| Field | Value |
|-------|-------|
| Bucket | `qil-documents-523231703540` |
| Region | `ap-south-1` |
| Versioning | enabled |
| Public access | blocked (all 4 settings on) |
| Purpose | POD images, signed docs, exports |

### Networking
| Field | Value |
|-------|-------|
| VPC | `vpc-0b0b531ecd50cc34b` (default) |
| Subnets | `subnet-06d34aa140840add3` (1a), `subnet-0f24a9ebefd7157c7` (1b), `subnet-0cee2d4d1558898b0` (1c) |
| DB subnet group | `qil-db-subnets` |
| Security group | `sg-0dc3c482739df8572` (allows :5432 from dev IP only) |

### Secrets Manager
| Field | Value |
|-------|-------|
| Secret name | `qil/rds/master` |
| ARN | `arn:aws:secretsmanager:ap-south-1:523231703540:secret:qil/rds/master-rwgwju` |
| Payload | `{ username, password, engine, port, dbname }` |

## Local environment

`.env.local` (gitignored) contains:
```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION=ap-south-1
AWS_PROFILE=qil-builder
DATABASE_URL=postgres://qiladmin:<password>@<endpoint>:5432/qildb
```

## Common ops

### Connect to DB
```powershell
$env:Path = "C:\Program Files\Amazon\AWSCLIV2;" + $env:Path
$env:AWS_PROFILE = "qil-builder"
# Get password from Secrets Manager
aws secretsmanager get-secret-value --secret-id qil/rds/master --query SecretString --output text
```

### Run migrations
```powershell
npm run db:migrate              # apply pending
npm run db:migrate:down         # rollback last
npm run db:migrate:create -- some_change_name   # scaffold new file
```

### Update SG when dev IP changes
```powershell
$ip = (Invoke-RestMethod "https://api.ipify.org?format=json").ip
# Revoke old rule first (replace OLD_RULE_ID):
# aws ec2 revoke-security-group-ingress --group-id sg-0dc3c482739df8572 --security-group-rule-ids OLD_RULE_ID
aws ec2 authorize-security-group-ingress --group-id sg-0dc3c482739df8572 --protocol tcp --port 5432 --cidr "$ip/32"
```

### Rotate keys (at project end)
1. AWS Console → IAM → Users → `claude-builder` → Security credentials → Deactivate access key → Delete
2. Delete `claude-builder` user entirely if no longer needed
3. Clear `.env.local` access keys

## Cost estimate (monthly)

| Resource | Cost |
|----------|------|
| RDS db.t4g.micro single-AZ | ~$12 |
| RDS storage 20 GB gp3 + backups | ~$3 |
| S3 (low usage) | <$1 |
| Secrets Manager (1 secret) | $0.40 |
| Data transfer | <$1 |
| **Total** | **~$15–17/month** |

## What's NOT provisioned yet

- [ ] Amplify Hosting (deployment) — pending: domain + dev/prod split
- [ ] SES (transactional email for MIS reports) — Phase 2
- [ ] CloudWatch dashboard
- [ ] dev/staging/prod environment separation

## Schema state

Migrations applied (in order):
1. `init_core` — organizations, users, commodity_types, commodities
2. `seed_init` — Quick India Logistics org, admin/exec users, 5 commodity types, 10 commodities
3. `masters` — departments, designations, branches, bill_to (+ gst), clients (+ dimension formulas), vendors (+ gst + dimension formulas), vehicles, tat_routes
4. `orders` — orders (dockets), order_status_events, order_assets
5. `auth` — user auth extensions (department_id, designation_id, home_branch_id, user_type, channel_access, last_login_at), user_branches junction, sessions, login_events
6. `seed_masters` — 7 departments, 6 designations, 5 sample branches, 3 bill-tos with 4 clients (CFA pattern), 1 vendor, 7 sample orders

Decisions baked in (per transcripts):
- Bill-To → Clients CFA pattern (one Bill-To, many Clients underneath)
- Per-client `client_dimension_formulas` for L×B×H÷X×Y per mode
- TAT master per (client × mode × origin_branch × destination_branch)
- Order `lock_state` matches maker-checker hierarchy: data_entry → customer_care → operation → accounts → admin_locked
- Order `status` enum covers full pickup→delivery flow including damaged/not_received/cancelled

## Auth

- In-DB credentials auth, not Cognito.
- bcrypt (cost 12) for password hashing.
- Session: random 32-byte ID, sha256-hashed in DB, raw value in httpOnly cookie `qil_sid`.
- Middleware (`middleware.ts`) gates all non-public routes.
- `lib/auth.ts` exports `loginWithPassword`, `logout`, `getSession`, `requireSession`.
- Set/reset a user's password: `npx tsx scripts/set-password.ts <username> <password>`
- Dev login: `admin / admin12345` (CHANGE FOR PROD).

## Pages wired to DB

**Master:** commodities, branches, vendors, vehicles, assets
**EMS:** users, departments, designations, login-details, change-password
**Booking:** orders (list + drawer), delivery-info
**Manifest:** all, pending-dispatch, incoming, hub-dispatch, forwarding, pending-depart
**Runsheet:** all, pending-delivery, hub-dispatch, incoming
**Other:** ewaybill, dashboard (real branch-scoped metrics)

Forms with real server actions: commodities (add), branches (add), users (add), change-password.
Vendors/Vehicles/Assets/Departments/Designations list-only (Add button decorative).

**Still on mock:** organization (form), booking/orders/add (7-step wizard), analytics/reports (filter forms), ems/permissions (role-permission matrix).

Pattern for converting more pages:
1. Add typed query functions in `lib/db/<entity>.ts` (use `many<T>`, `one<T>` from `lib/db.ts`)
2. Make `page.tsx` a server component (no `'use client'`), `await currentOrgId()`, fetch in parallel with `Promise.all`
3. Extract interactive form/table into a `'use client'` component, pass DB rows as props
4. Server action in `actions.ts` calls DB, then `revalidatePath(...)`
5. **NEVER** import from `lib/db/*` in a client component — types only. Put shared functions in `lib/<feature>.ts` without `import 'server-only'`.
