# DSEC — Full Hosting Runbook

End-to-end guide to host the whole project on **Vercel** (web) + **Neon** (database)
+ **Hostinger** (domain & email), with the Gmail Apps Scripts and mailbox wiring.

This is the comprehensive version; the older `DEPLOY.md` only covered the dashboard.

## Architecture & domains

| Domain | App | Folder | Host | Talks to |
|---|---|---|---|---|
| `dsec.club` | Public website | `dsec-website` | Vercel | → `api.dsec.club` (public feed), Resend, Telegram, Notion |
| `app.dsec.club` | Exec dashboard | `dsec-app` | Vercel | → Neon (direct), → `api.dsec.club` (AI notes + image upload) |
| `api.dsec.club` | Backend API + MCP | `dsec-api` | Vercel | → Neon, Anthropic, Supabase, Tally |

**Single database:** `dsec-app` and `dsec-api` share one Neon Postgres DB. `dsec-api`
**owns the core schema** (Alembic migrations); `dsec-app` adds a few app-owned tables
(roles/settings/committee) via its own scripts. `dsec-website` has **no** DB access —
it reads everything through the API's public `/website` feed.

### Deploy order (each stage depends on the previous)
1. **Neon** — provision the database.
2. **dsec-api** — migrate the schema, mint API keys, deploy, point `api.dsec.club`.
3. **dsec-app** — run the app-owned setup scripts, create a login, deploy, point `app.dsec.club`.
4. **dsec-website** — verify the email domain, deploy, point `dsec.club`.
5. **Gmail Apps Scripts** + **mailboxes** — turn on ingestion and inbound email.
6. **Verify** everything end to end.

### Accounts/services you'll need
- **Vercel** (3 projects), **Neon** (1 Postgres DB), **Hostinger** (already have `dsec.club` + email).
- **Anthropic** API key — *only if you use AI features* (email drafting, meeting notes).
- **Supabase** — *only if you want event/project images* (free; a public Storage bucket).
- **Resend** — for the website's sponsor/contact emails and dashboard member invites.
- Optional: **Tally** (event review forms), **Telegram** (lead pings), **Notion** (sponsor CRM), **Cloudflare Turnstile** (form captcha), a **Google account** for the Apps Scripts (`deakinsec@gmail.com`).

> Prereq: everything is currently **uncommitted**. Vercel builds from Git, so
> **commit & push** the repo before importing the projects.

---

## Stage 1 — Neon (database)

1. Create a Neon project (region **ap-southeast-2 / Sydney** is closest).
2. **Reset the password** (Settings → Reset password) — the dev password was shared, treat it as compromised.
3. Copy the **Pooled** connection string (Connection Details → toggle *Pooled connection*). It has `-pooler` in the host:
   ```
   postgresql://neondb_owner:<PASSWORD>@ep-xxxx-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require
   ```
   - For `dsec-api` (Python/psycopg) you can use either `postgresql://` or `postgresql+psycopg://`.
   - Use this **same pooled string** for both `dsec-api` and `dsec-app`.

---

## Stage 2 — dsec-api (`api.dsec.club`)

### 2.1 Make it deployable on Vercel (one-time code shim)
FastAPI isn't auto-served by Vercel out of the box. Add these two files in `dsec-api/`:

**`dsec-api/api/index.py`**
```python
from app.main import app  # Vercel's Python runtime serves this ASGI app
```

**`dsec-api/vercel.json`** (replace the near-empty current one)
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/api/index" }]
}
```

> ⚠️ **The API is the one tricky deploy.** Its dependencies (Pillow, pikepdf,
> psycopg, supabase, mcp, anthropic) are heavy and can exceed Vercel's Python
> function size limit. If the build fails on size, deploy `dsec-api` to
> **Railway or Render** instead — it's a standard long-running server
> (`uvicorn app.main:app --host 0.0.0.0 --port $PORT`), point `api.dsec.club`
> at it, and **every other step in this stage is identical**. (Ask me and I'll wire either.)

### 2.2 Migrate the schema & mint API keys (run locally, against Neon)
Put the pooled Neon string in `dsec-api/.env` (or `export DATABASE_URL=...`), then from `dsec-api/`:
```bash
.venv/bin/python scripts/check_neon.py     # inspect live schema vs migrations
.venv/bin/python scripts/migrate.py        # alembic upgrade head — creates app_user, event_log, api_key, people, events, …

# Keys (copy each RAW key once):
.venv/bin/python -m scripts.create_api_key --scopes ingest        --label "gmail-forwarders"   # for both Apps Scripts
.venv/bin/python -m scripts.create_api_key --scopes trigger,write --label "dsec-app"           # for the dashboard
```
> ⚠️ Run only the **committed** migrations (`migrate.py`). Never
> `alembic --autogenerate` against live Neon — it can emit destructive DROPs.

### 2.3 Vercel project
- Add New → Project → import the repo → **Root Directory: `dsec-api`**.
- Set env vars (Production **and** Preview):

| Var | Needed | Value |
|---|---|---|
| `DATABASE_URL` | ✅ | pooled Neon string |
| `RUN_MIGRATIONS_ON_STARTUP` | ✅ | `false` (you migrate as a step) |
| `DASHBOARD_USER` | ✅ | basic-auth user for `/dashboard`, `/docs`, `/admin` |
| `DASHBOARD_PASS` | ✅ | a strong password |
| `AGENT_SECRET` | ✅ rec. | `openssl rand -base64 32` (guards the dormant `/email/process`) |
| `ANTHROPIC_API_KEY` | ⚠️ AI only | `sk-ant-…` — email drafting + meeting notes; **not** needed for capture-only |
| `ANTHROPIC_MODEL` | default | `claude-haiku-4-5-20251001` |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | ⚠️ images | server-side only (see Stage 2.4) |
| `SUPABASE_STORAGE_BUCKET` | default | `media` |
| `TALLY_API_KEY` | optional | event review forms |
| `CALCOM_LINK`, `SIGNATURE`, `TONE` | optional | email-drafting context |
| `CRON_SECRET` | optional | only if you add the daily reconciliation cron |
| `API_KEY_PREFIX` | default | `dsec_live_` |
| `RATE_LIMIT_*`, `GLOBAL_DAILY_LLM_CAP`, `MAX_REQUEST_BYTES` | defaults | tune later |

- **Deploy.** Verify: `curl https://<deployment>.vercel.app/health` → `{"status":"ok"}`.

### 2.4 (Optional) Supabase image storage
Create a Supabase project → Storage → **new PUBLIC bucket** named `media` (matches
`SUPABASE_STORAGE_BUCKET`). Copy the project URL + **service-role** key into the two
Supabase env vars above. Without this, image uploads return a clean `503` (everything else works).

### 2.5 Domain
Vercel → the `dsec-api` project → **Domains → add `api.dsec.club`**. It shows a CNAME
target — add it in Hostinger DNS (Stage 5).

---

## Stage 3 — dsec-app (`app.dsec.club`)

### 3.1 Initialise the app-owned schema (run locally, against Neon)
Create `dsec-app/.env.local` with the pooled Neon string, then from `dsec-app/`:
```bash
npm install
# Order matters; all are idempotent (IF NOT EXISTS) and safe to re-run:
npx tsx scripts/setup-roles.ts             # app_role, app_invite, app_user.role_id; seeds roles; backfills Admin
npx tsx scripts/setup-settings.ts          # app_setting (site settings)
npx tsx scripts/create-committee-table.ts  # committee table + seed
npx tsx scripts/add-role-write-modules.ts  # app_role.write_modules
npx tsx scripts/add-invite-committee-column.ts
npx tsx scripts/add-user-theme-columns.ts  # app_user theme cols (otherwise gated pages 500)
npx tsx scripts/add-event-time-columns.ts  # events.start_time/end_time

# Create your first exec login:
npx tsx scripts/create-user.ts exec@dsec.club 'a-strong-password' 'Your Name'
```
> These add **app-owned** pieces on top of the Alembic core schema from Stage 2.2.
> If one errors that a base table is missing, you skipped `migrate.py`.

### 3.2 Vercel project
- Add New → Project → import the repo → **Root Directory: `dsec-app`** → Framework **Next.js**.
- Env vars (Production **and** Preview):

| Var | Needed | Value |
|---|---|---|
| `DATABASE_URL` | ✅ | the **same** pooled Neon string |
| `AUTH_SECRET` | ✅ | `openssl rand -base64 32` |
| `AUTH_TRUST_HOST` | ✅ | `true` |
| `AUTH_URL` | rec. | `https://app.dsec.club` |
| `APP_URL` | ✅ | `https://app.dsec.club` (used in invite links) |
| `DSEC_API_URL` | ⚠️ AI/media | `https://api.dsec.club` |
| `DSEC_API_KEY` | ⚠️ AI/media | the **`trigger,write`** key from Stage 2.2 |
| `RESEND_API_KEY` | optional | member-invite emails (logs the link if unset) |

- **Deploy**, then add **Domains → `app.dsec.club`** (CNAME in Stage 5). Sign in with the login from 3.1.

---

## Stage 4 — dsec-website (`dsec.club`)

### 4.1 Verify the email domain in Resend
The site sends from `noreply@dsec.club`, so the domain must be verified:
1. Resend → API Keys → create a key (→ `RESEND_API_KEY`).
2. Resend → Domains → add `dsec.club` → it lists **SPF/DKIM (and DMARC)** records → add them in Hostinger DNS (Stage 5). `noreply@dsec.club` needs **no mailbox** — Resend sends as it once verified.

### 4.2 Vercel project
- Add New → Project → import the repo → **Root Directory: `dsec-website`** → **Next.js**.
- Env vars:

| Var | Needed | Value |
|---|---|---|
| `DSEC_API_URL` | rec. | `https://api.dsec.club` (live projects/events; blank → "coming soon" placeholders) |
| `RESEND_API_KEY` | ✅ forms | from 4.1 |
| `EMAIL_FROM` | ✅ forms | `"DSEC <noreply@dsec.club>"` |
| `SPONSOR_INBOX` | ✅ forms | e.g. `admin@dsec.club` (a real mailbox/forwarder) |
| `CONTACT_INBOX` | ✅ forms | e.g. `admin@dsec.club` |
| `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` | optional | ping on new lead |
| `NOTION_TOKEN` / `NOTION_SPONSOR_DB_ID` | optional | sponsor CRM sync |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | optional | form captcha |
| `NEXT_PUBLIC_GSC_VERIFICATION` | optional | Google Search Console |
| `OPENAI_API_KEY` | dev-only | build-time content/image scripts; **not** needed at runtime |

- **Deploy**, then add **Domains → `dsec.club`** (apex — Stage 5).

---

## Stage 5 — DNS (Hostinger) — keep email intact

Manage DNS **at Hostinger** (hPanel → Domains → DNS Zone). **Do NOT switch to Vercel
nameservers** — that would move DNS off Hostinger and you'd have to recreate the email
records. Just add the web records below; **leave the existing `MX` and email `TXT`
(SPF/DKIM/DMARC) records untouched** — web (A/CNAME) and email (MX) coexist fine.

| Type | Name | Value | For |
|---|---|---|---|
| `A` | `@` | `76.76.21.21` *(or the exact value Vercel shows)* | `dsec.club` → website |
| `CNAME` | `www` | `cname.vercel-dns.com` | optional www → website |
| `CNAME` | `app` | `cname.vercel-dns.com` | dashboard |
| `CNAME` | `api` | `cname.vercel-dns.com` *(or your Railway/Render target)* | API |
| `TXT`/`CNAME` | *(Resend's records)* | from Stage 4.1 | email sending |

Add each domain in its Vercel project's **Domains** tab; Vercel shows the exact record
and verifies once DNS propagates (minutes to ~1h).

---

## Stage 6 — Gmail Apps Scripts (ingestion + email capture)

Both scripts run inside **`deakinsec@gmail.com`** and POST to the API. They're separate
Apps Script projects sharing the **`ingest`** key from Stage 2.2.

For **each** script ([script.google.com](https://script.google.com), signed in as `deakinsec@gmail.com` → New project):

| Script (paste from repo) | Endpoint | Trigger | Purpose |
|---|---|---|---|
| `dsec-api/integrations/dusa-gmail-forwarder/Code.gs` | `/ingest/dusa` | daily | forwards the weekly DUSA xlsx reports |
| `dsec-api/integrations/email-capture-forwarder/Code.gs` | `/ingest/email` | every 15 min | logs every inbound email (no LLM, no action) |

For each: Project Settings → **Script properties**:
- `DSEC_API_KEY` = the `ingest` raw key
- `DSEC_API_BASE` = `https://api.dsec.club`

Then run **`setup()`** once (approves OAuth + installs the trigger), and optionally run
the main function once to test (`ingestWeeklyReports()` / `captureInbox()`).

---

## Stage 7 — Mailboxes: receive in both inboxes, reply from the right address

**Principle:** Gmail is the engine (Apps Scripts only run there). `dsec.club` is the
public face + a mirror.

1. **Hostinger** (hPanel → Emails): create mailboxes you publish, e.g. `committee@dsec.club`, `admin@dsec.club`.
2. **Forward `dsec.club` → Gmail, keeping a copy:** set each mailbox to forward to
   `deakinsec@gmail.com` **and** keep a copy locally. → public mail is stored at
   dsec.club **and** lands in Gmail, where the capture script logs it.
3. **Gmail → Settings → Accounts and Import → "Send mail as" →** add each dsec.club
   address: uncheck "Treat as an alias"; SMTP `smtp.hostinger.com` (or `smtp.titan.email`),
   **port 465 / SSL**, mailbox creds. Verify with the code (it forwards into Gmail).
4. **Gmail → same screen → "When replying to a message:" → "Reply from the same address
   the message was sent to."**
   → mail to `deakinsec@gmail.com` replies **from** it; mail to `@dsec.club` replies **from** dsec.club.

> ⚠️ **One direction only.** Don't also forward Gmail → Hostinger — that's an infinite
> loop. Funnel *into* Gmail; use narrow Gmail filters if you ever need the reverse.

---

## Stage 8 — Verify

- **API:** `curl https://api.dsec.club/health` → `{"status":"ok"}`. Open `https://api.dsec.club/dashboard/` (basic-auth) — shows the audit log.
- **Dashboard:** sign in at `https://app.dsec.club` with your exec login. Create an event; try an image upload (needs Supabase) and "AI meeting notes" (needs `ANTHROPIC_API_KEY` + the `trigger,write` key).
- **Website:** `https://dsec.club` loads live projects/events (from the feed); submit the contact form → check `CONTACT_INBOX` + Resend logs.
- **Ingestion:** run `captureInbox()`; send a test email to each address; confirm `source=email, action=captured` rows in the API dashboard and that replies go out from the correct address.

---

## Appendix — API key scopes

| Key | Scopes | Lives in | Used for |
|---|---|---|---|
| gmail-forwarders | `ingest` | Google Apps Script properties | `/ingest/dusa`, `/ingest/email` |
| dsec-app | `trigger`, `write` | Vercel `dsec-app` env (`DSEC_API_KEY`) | AI meeting notes (`trigger`), image upload (`write`) |
| (optional) read key | `read` | wherever you query logs/feeds | `/public/logs`, MCP read tools |

Mint more anytime with `python -m scripts.create_api_key --scopes <s> --label <name>`
(or `POST /admin/keys` with basic auth). Raw key shown once; revoke via `/admin/keys/{id}/revoke`.

## Appendix — common gotchas
- **Dashboard pages 500** → you skipped a `dsec-app` setup script (e.g. theme columns). Re-run them (idempotent).
- **API uploads 503** → Supabase bucket missing/misnamed (must be public, name = `SUPABASE_STORAGE_BUCKET`).
- **Email in spam** → finish Resend SPF/DKIM verification; send dsec.club replies via Hostinger SMTP (not Gmail's servers).
- **API build too big on Vercel** → move `dsec-api` to Railway/Render (Stage 2.1 callout).
- **Lost DUSA/website data after DNS change** → you switched to Vercel nameservers; revert to Hostinger DNS and keep the MX/TXT records.
