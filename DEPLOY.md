# Deploying

> **For the full project** (all three apps, every env var, domains/DNS, API keys,
> Gmail Apps Scripts, and mailbox wiring) see **[`HOSTING.md`](./HOSTING.md)**. This
> file is the quick dashboard-only path.

How to put the apps on **Vercel**. `dsec-app` (the dashboard) is the priority —
it's fully built and, because Neon already holds the schema, sample data, and
your exec login, it works the moment it's deployed.

> **Do this first:** rotate the Neon database password in the Neon console
> (Project → **Settings → Reset password**). The development password was shared
> in plaintext, so treat it as compromised. Then use the new pooled string below.

## dsec-app (the dashboard)

### 1. Get the *pooled* Neon connection string
Neon console → your project → **Connection Details** → toggle **Pooled
connection** ON → copy. It has `-pooler` in the host:

```
postgresql://neondb_owner:<PASSWORD>@ep-xxx-pooler.<region>.aws.neon.tech/neondb?sslmode=require
```

The `-pooler` host is what keeps serverless functions from exhausting Neon's
connection limit. (The app's DB client reads `sslmode` from the string and
applies TLS itself.)

### 2. Generate an auth secret
```bash
openssl rand -base64 32
```

### 3. Create the Vercel project
- Vercel → **Add New → Project** → import this Git repo.
- **Root Directory: `dsec-app`** ← essential (it's a subfolder of the monorepo).
- Framework Preset: **Next.js** (auto-detected). Keep build/output defaults.

### 4. Environment variables (set for Production **and** Preview)
| Name | Value |
|---|---|
| `DATABASE_URL` | the pooled string from step 1 |
| `AUTH_SECRET` | the value from step 2 |
| `AUTH_TRUST_HOST` | `true` |

### 5. Deploy
Click **Deploy**. When it's live, open the URL and sign in with `exec@dsec.club`
and the password you set during setup. That's it.

### After deploying
- **Add / reset exec logins:** from a local `dsec-app` checkout pointed at the
  same database, run
  `npx tsx scripts/create-user.ts email@dsec.club 'a-strong-password' 'Name'`.
- **Custom domain:** add it in Vercel → Domains. Auth.js follows the request host,
  so no URL variable is needed; if you want to pin one, set
  `AUTH_URL=https://your-domain`.
- **If data won't load in production:** the pooled connection is normally fine; if
  you hit connection errors, use the **direct** (non-pooled) Neon string instead,
  or switch the driver to `@neondatabase/serverless`. At committee scale the
  pooled `pg` setup is more than enough.

## dsec-website (public site)
Same flow — a **separate** Vercel project with **Root Directory `dsec-website`**.
No database env vars.

## dsec-api (email agent) — separate & optional
Not needed for the dashboard. To deploy it, follow `dsec-api/TODO.md` → "Before
first production deploy": set `AGENT_SECRET`, `OPENAI_API_KEY`, pooled
`DATABASE_URL`, and dashboard basic-auth creds; the schema is already migrated if
you deployed `dsec-app` against the same Neon database; then point the Gmail Apps
Script at `POST /email/process`.
