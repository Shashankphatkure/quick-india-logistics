# Deployment Guide — AWS Amplify Hosting

This app is ready to deploy to AWS Amplify Hosting (Next.js SSR Compute).

## What's already done

- `amplify.yml` build spec is committed
- `next build` succeeds locally (verified)
- RDS Postgres + S3 bucket are live (see `INFRA.md`)
- Schema migrations are all applied

## What you need to do (one-time, ~10 minutes)

### Step 1: Push the latest code to GitHub
```powershell
cd D:\work\quickindialogistics\quick-india-logistics
git add -A
git commit -m "Add backend, S3 image upload, all wired pages"
git push origin master
```

### Step 2: Create Amplify app + connect GitHub
1. Open https://ap-south-1.console.aws.amazon.com/amplify/home?region=ap-south-1
2. Click **Create new app** → **Host web app**
3. Select **GitHub** → **Continue**
4. Authorize **AWS Amplify** GitHub OAuth (one-time)
5. Pick repo `Shashankphatkure/quick-india-logistics` → branch `master`
6. Amplify auto-detects Next.js. Leave defaults.
7. Click **Next** to env-var page (see below)

### Step 3: Add environment variables
Click **Advanced settings** → **Environment variables** and add:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `postgres://qiladmin:DPqlNg7eWc5LbOUKJGJnY6h6qXPGDx9H@qil-postgres.c7ug2c8i06zq.ap-south-1.rds.amazonaws.com:5432/qildb` |
| `AWS_REGION` | `ap-south-1` |
| `S3_BUCKET` | `qil-documents-523231703540` |
| `AWS_ACCESS_KEY_ID` | (your `claude-builder` access key) |
| `AWS_SECRET_ACCESS_KEY` | (your `claude-builder` secret) |
| `NODE_ENV` | `production` |

Better long-term: replace the IAM-user keys with an **Amplify Compute service role** that has `s3:PutObject` / `s3:GetObject` on the bucket. For now the user keys are fine.

### Step 4: Open RDS Security Group to Amplify
By default RDS only allows your local IP. Amplify Lambda calls will be from AWS NAT IPs (variable).

Two options:
- **Easy**: temporarily set the RDS SG to allow `0.0.0.0/0` on 5432 (DB is still password-protected; risk: brute-force surface). Use only for testing.
- **Proper**: create a VPC, move Amplify Compute to that VPC, allow only the VPC CIDR. ~30 min setup.

Quick command for the easy path:
```powershell
$env:Path = "C:\Program Files\Amazon\AWSCLIV2;" + $env:Path
$env:AWS_PROFILE = "qil-builder"
aws ec2 authorize-security-group-ingress --group-id sg-0dc3c482739df8572 --protocol tcp --port 5432 --cidr 0.0.0.0/0
```

### Step 5: Deploy
Click **Save and deploy**. Build takes ~5 min. You'll get a URL like:
```
https://master.dXXXXXX.amplifyapp.com
```

### Step 6: First login
Visit the Amplify URL → login as `admin / admin12345` → change the password immediately via `/ems/change-password`.

## Cost impact
- Amplify Hosting Compute: pay-per-request, ~$0.01 per 100 requests + $0.30/GB build time. Realistic: $5–15/month for a small team.
- Total stack now: ~$20–30/month.

## Adding a custom domain
After deploy, in Amplify Console → **Domain management** → **Add domain**. Amplify will create the ACM cert and Route 53 records automatically.

## CI/CD
Every `git push origin master` will trigger a rebuild + redeploy.

## Where to look if something breaks
- Build logs: Amplify Console → app → branch → latest build
- Runtime logs: Amplify Console → branch → **Hosting compute logs** (CloudWatch)
- DB errors: connect via `psql` using the values from Secrets Manager
