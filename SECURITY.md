# DSEC — Rate Limiting & DDoS / Abuse Protection

Defence in layers. No single layer stops everything, so each domain
(`dsec.club`, `app.dsec.club`, `api.dsec.club`) sits behind all of them.

```
            ┌─────────────────────────────────────────────────────┐
 Internet → │ 1. Cloudflare (edge WAF + rate rules + bot mgmt)     │  ← blocks volumetric DDoS
            ├─────────────────────────────────────────────────────┤
            │ 2. Vercel Firewall (platform DDoS + custom rules)    │  ← defence-in-depth at origin
            ├─────────────────────────────────────────────────────┤
            │ 3. App code (Upstash per-IP + login throttle)        │  ← scripting / brute-force
            │    dsec-api: per-key + per-IP + daily LLM caps (Neon) │
            └─────────────────────────────────────────────────────┘
```

> **Why layers:** a true volumetric DDoS *cannot* be stopped in application
> code — by the time your function runs, you've already paid for the request
> (and, for `dsec-api`, touched Neon). Floods must die at the **edge** (layers
> 1–2). App code (layer 3) is for what the edge is bad at: credential stuffing
> on the login form and scripted hammering of an authenticated session.

---

## Layer 3 — Application code (DONE, in this repo)

### dsec-app (Next.js)

Implemented and live as soon as the Upstash env vars are set:

| What | Where | Limit |
|---|---|---|
| Per-IP throttle on every page/route | `src/proxy.ts` → `src/lib/rate-limit.ts` | 120 req / 60 s / IP |
| Login brute-force / credential stuffing | `src/auth.ts` `authorize()` | 8 attempts / 60 s / (IP + email) |

- State lives in **Upstash Redis** — the only store that counts accurately
  across Vercel's many short-lived function instances.
- **Fails open:** if `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` are
  unset, nothing is throttled (so local dev and the current prod keep working
  until you wire Upstash up). Set them in production.
- Login excludes the proxy matcher (`/api/auth/*`), which is why the throttle
  lives inside `authorize()` instead.

### dsec-api (FastAPI) — already had this

`app/core/ratelimit.py` (`NeonRateLimiter`) enforces, per authed route:
per-key/min, per-IP/min, per-key daily `trigger` cap, and a global daily LLM
cap. Tunables in `app/config.py` (`RATE_LIMIT_*`, `GLOBAL_DAILY_LLM_CAP`,
`MAX_REQUEST_BYTES`). No change needed; the edge layers below cover the gaps
(e.g. `/health`) without adding a per-request Neon write.

---

## Layer 1 — Cloudflare (you set this up)

Proxies DNS for all three domains and blocks floods/bots before they reach
Vercel. Free plan is enough to start.

1. Add the zone `dsec.club` to Cloudflare → it gives you two **nameservers**.
2. At **Hostinger** (where DNS currently lives), change the domain's
   nameservers to Cloudflare's. *(This is the one disruptive step — propagation
   can take a few hours; the site stays up throughout.)*
3. In Cloudflare DNS, recreate the records that point `@`, `app`, and `api` to
   Vercel, and **enable the orange cloud (proxied)** on each.
   - Keep MX / email records (Hostinger) **DNS-only / grey cloud**.
4. **SSL/TLS** → set to **Full (strict)** (Vercel serves valid certs).
5. **Security → WAF → Rate limiting rules** (free tier allows one; put it on the
   most sensitive path):
   - Rule: if URI path contains `/api/auth` (app) **or** matches `api.dsec.club/*`,
     more than **20 requests / 10 s / IP** → **Block** for 1 min.
6. **Security → Bots** → enable **Bot Fight Mode**.
7. (Optional, recommended for the public site) **Turnstile** captcha on the
   sponsor/contact forms — HOSTING.md already lists Turnstile as an option.

## Layer 2 — Vercel Firewall (you set this up — no keys)

Native to your hosting, no account/keys needed. For **each** of the 3 Vercel
projects:

1. Project → **Firewall**. Vercel's **Attack Challenge Mode** + automatic DDoS
   mitigation are on by default — confirm they're enabled.
2. Add **Custom Rules** as a backstop in case traffic bypasses Cloudflare
   (e.g. someone hits the `*.vercel.app` origin directly):
   - **Rate limit** rule: `100 requests / 60 s` per IP → **Challenge**.
   - Stricter rule on `app.dsec.club` path `/api/auth/*`: `20 / 60 s` → **Deny**.
3. (Hardening) Optionally **deny** direct traffic to the `*.vercel.app` domain
   so the public can only reach you *through* Cloudflare.

---

## What I need from you to finish

Provide these and I'll plug them in / verify (or add them yourself in the
Vercel dashboard env settings for each project):

1. **Upstash** (required for layer 3 to actually throttle):
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
   - Get them free at <https://console.upstash.com> → Create Database (Redis) →
     REST API section. Add both to the **dsec-app** Vercel project env (Production
     + Preview) and your local `.env.local`.

2. **Cloudflare** (layers 1): you mainly do this in the dashboard, but if you
   want me to script DNS/WAF via Terraform or the API, I'll need:
   - A **Cloudflare API token** scoped to Zone → *DNS:Edit*, *Firewall
     Services:Edit*, *Zone WAF:Edit* for the `dsec.club` zone.
   - The **Zone ID** (Cloudflare dashboard → Overview, right sidebar).
   - Otherwise just follow Layer 1 above in the dashboard — no token needed.

3. **Vercel Firewall** (layer 2): dashboard-only, nothing for me to receive.

---

## Tuning the limits

- App per-IP / login limits: edit the `Ratelimit.slidingWindow(...)` calls in
  `dsec-app/src/lib/rate-limit.ts`.
- API limits: `dsec-api/app/config.py`.
- Start conservative (the numbers above suit committee scale) and loosen if you
  see false-positive 429s for legitimate users.
