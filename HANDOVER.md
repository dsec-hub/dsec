# Handover

Plain-language guide to keeping the DSEC software running. You don't need to be a
programmer to read this — but a few tasks need someone comfortable with a
terminal (flagged 🛠️).

## What this is

- **The dashboard** (`dsec-app`) — where the exec logs in to manage events,
  people, sponsors, and finances. This is the main tool.
- **The email agent** (`dsec-api`) — drafts replies to committee emails. It never
  sends on its own; it only prepares drafts.
- **The website** (`dsec-website`) — the public-facing site.

All three are separate. The dashboard and the email agent share one **database**.

## Where everything lives

| Thing | Service | What it holds |
|---|---|---|
| Database | **Neon** (neon.tech) | All the real data: events, people, sponsors, finance, logins. |
| Hosting | **Vercel** (vercel.com) | Runs the dashboard, website, and email agent. |
| AI | **OpenAI** | Powers the email drafting only. |
| Code | This repository | Everything, version-controlled. |

Keep the logins for Neon, Vercel, and OpenAI somewhere safe and pass them to next
year's exec. **That is the single most important part of this handover.**

## Day to day

Open the dashboard, sign in with your committee email and password, and edit
events / people / sponsors / finance directly. Changes save immediately to the
database — there is nothing to "sync." The Overview page highlights anything that
**needs attention** (DUSA deadlines coming up, events with no lead assigned).

## Common tasks

### Add a new exec login 🛠️
Someone with the code checked out runs, in the `dsec-app` folder:
```
npx tsx scripts/create-user.ts new.exec@dsec.club 'a-strong-password' 'Their Name'
```
Re-running it with a new password for an existing email **resets** that password.
(A "manage users" screen could be added to the dashboard later to avoid this.)

### Someone can't log in
- Double-check the email and password (passwords are case-sensitive).
- If forgotten, reset it with the command above.

### Nothing loads / data looks empty
The database may be **paused**. Neon's free tier sleeps after inactivity and wakes
on the next request — reload after a few seconds. If it persists, check the Neon
dashboard that the project is active and the billing/free-tier limits are fine.

## What breaks if…

- **The Neon database is down / over its free limit** → the dashboard can't show
  or save data. Fix: check Neon; upgrade the plan if you've outgrown the free tier.
- **The database password is rotated** → update `DATABASE_URL` in Vercel (for each
  app) and in any local `.env`. Everything else keeps working.
- **The `AUTH_SECRET` is changed** → everyone is logged out and must sign in again.
  No data is lost.
- **The OpenAI key expires / runs out of credit** → the email agent stops drafting
  (it logs the error and ignores the email). The dashboard is **unaffected**.
- **You lose the service logins (Neon/Vercel/OpenAI)** → the hardest to recover.
  Protect them.

## Costs

Designed to run on **free tiers**: Neon (free Postgres), Vercel (free hosting).
The only usage cost is **OpenAI** for email drafting — a few dollars a month at
committee scale, and capped in the email agent's settings
(`GLOBAL_DAILY_LLM_CAP`). If you don't use the email agent, there's no AI cost.

## For the technical helper

- Full architecture and local-setup instructions: `README.md`.
- Database schema is owned by `dsec-api` (Alembic migrations). To change it, see
  the "Schema changes" section of the README.
- Secrets live in gitignored `.env` (dsec-api) / `.env.local` (dsec-app) locally,
  and in each Vercel project's environment variables in production.
