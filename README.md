# DSEC Monorepo

Software for the **DSEC** student committee — a public website, an internal exec
dashboard, and an email-automation API. One database, three apps, clear
boundaries.

```
                         ┌─────────────────────────────┐
        exec edits  ───► │  dsec-app  (Next.js 16)      │
                         │  NextAuth-gated CRUD dashboard│
                         └──────────────┬──────────────┘
                                        │ reads + writes (Drizzle)
                                        ▼
                            ┌───────────────────────┐
                            │   Neon Postgres        │  ◄── single source of truth
                            │  events · people ·     │
                            │  sponsors · finance    │
                            └───────────┬───────────┘
                                        │ owns schema (SQLAlchemy + Alembic)
                         ┌──────────────┴──────────────┐
                         │  dsec-api  (FastAPI)         │
                         │  email agent + public API    │
                         └─────────────────────────────┘

   dsec-website (Next.js) — public marketing site (separate concern)
```

There is **no Notion** in the loop: the committee edits everything directly in
`dsec-app`, and Neon is authoritative. (An earlier scaffold synced from Notion;
that was removed in favour of a single source of truth.)

## The three apps

| App | Stack | Responsibility |
|---|---|---|
| **`dsec-app/`** | Next.js 16 (App Router, Turbopack), Tailwind v4, Auth.js v5, Drizzle | Internal exec dashboard. Per-person login. Full CRUD over events, people, sponsors, finance. The team's day-to-day tool. |
| **`dsec-api/`** | FastAPI, SQLAlchemy, Alembic, OpenAI | Email agent (`/email/process`: spam-gate → classify → draft, never auto-sends) + scoped, rate-limited, cost-capped public API. **Owns the Neon schema** (models + migrations). |
| **`dsec-website/`** | Next.js 16 | Public marketing site. Independent of the data layer. |

### Why `dsec-api` owns the schema

`dsec-api` defines the database tables (SQLAlchemy models + Alembic migrations),
even though `dsec-app` is the primary read/writer. This keeps one authoritative
schema definition; `dsec-app` introspects the live tables with `drizzle-kit pull`
rather than redefining them. DB-level defaults let both writers (Python and
Node) insert safely.

## Data model (Neon)

- **Domain** (the dashboard): `events`, `people`, `sponsors`, `finance` — related
  by nullable FKs (`events.event_lead_id → people`, `sponsors.contact_person_id →
  people`, `finance.related_event_id → events`). Every row has
  `created_at`/`updated_at` and an `archived` soft-delete flag (nothing is ever
  hard-deleted).
- **Auth**: `app_user` (dashboard logins; bcrypt password hashes).
- **Operational** (`dsec-api`): `event_log` (audit), `api_key`, `rate_limit`.

## Running locally

Each app is self-contained. Secrets live in gitignored `.env` / `.env.local`
files — copy the `.env.example` where present and fill in real values.

**`dsec-api`** (Python 3.12+):
```bash
cd dsec-api
python -m venv .venv && .venv/bin/pip install -r requirements-dev.txt
.venv/bin/python -m pytest                 # 21 tests, SQLite, no external services
.venv/bin/python scripts/migrate.py        # apply migrations (needs DATABASE_URL)
.venv/bin/python scripts/seed.py           # sample domain data
.venv/bin/uvicorn app.main:app --reload    # http://localhost:8000
```

**`dsec-app`** (Node 20+):
```bash
cd dsec-app
npm install
# .env.local needs: DATABASE_URL (Neon), AUTH_SECRET (openssl rand -base64 32)
npx tsx scripts/create-user.ts you@dsec.club 'a-strong-password' 'Your Name'
npm run dev                                # http://localhost:3000
```

## Environment variables

| Var | App | Purpose |
|---|---|---|
| `DATABASE_URL` | both | Neon Postgres. `dsec-api` uses the `postgresql+psycopg://…` form; `dsec-app` uses `postgresql://…`. Use the **pooled** (`-pooler`) host in production. |
| `AUTH_SECRET` | dsec-app | NextAuth session signing key. |
| `AGENT_SECRET`, `OPENAI_API_KEY`, `DASHBOARD_USER/PASS` | dsec-api | Email-agent auth, OpenAI, audit-dashboard basic auth. See `dsec-api/.env.example`. |

Real secrets are **never** committed. `dsec-api/.env` and `dsec-app/.env.local`
are gitignored.

## Schema changes

`dsec-api` owns migrations. To change the domain schema:
1. Edit `dsec-api/app/models.py`.
2. `cd dsec-api && .venv/bin/python -m alembic revision --autogenerate -m "..."` (review the file).
3. `.venv/bin/python scripts/migrate.py` to apply to Neon.
4. `cd dsec-app && npx drizzle-kit pull` to refresh the Drizzle schema.

## Deployment

Both Next.js apps and the FastAPI app target **Vercel**. `dsec-app` needs
`DATABASE_URL` (pooled) + `AUTH_SECRET`; run migrations as a deploy step (or set
`RUN_MIGRATIONS_ON_STARTUP=true` on `dsec-api`). See `HANDOVER.md` for the
non-technical runbook.
