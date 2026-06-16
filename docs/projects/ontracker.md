# OnTrack(er)

**Website:** https://on-tracker.com
**Repo:** https://github.com/Aarav261/Ontracker
**Author:** Aarav
**Status:** Live
**Trimester:** T1 2026
**Category:** Productivity / Student Tool
**Summary:** Weekday morning email digest that ranks your OnTrack tasks by urgency and grade target — delivered before you wake up.
**Tags:** `Flask` `React` `PostgreSQL` `Clerk` `Resend` `Chrome Extension` `Railway` `Docker`

## What it does

A weekday morning email brief for Deakin's OnTrack system. Every weekday morning it fetches your active OnTrack tasks, ranks them by urgency and grade target (HD → P), and emails the digest to you — links and inline tutor feedback included — even with your laptop closed.

Tasks are grouped into:

| Section | Tasks included |
|---|---|
| **Needs Attention** | Overdue, redo, fix & resubmit, need help |
| **Upcoming** | Not started, in progress |
| **Discuss with Tutor** | Discuss, demonstrate |
| **Submitted** | Waiting on tutor feedback |
| **Recently Completed** | Finished within the last 7 days |

A companion Chrome extension shows the same tasks live in a popup and keeps the OnTrack session token fresh in the background (OnTrack rotates its auth token on every API response, so the extension captures and pushes the freshest token continuously).

## Tech stack

- **Backend** — Flask, APScheduler, PostgreSQL, PyJWT
- **Auth** — Clerk (session JWT via JWKS; extension picks up the same session)
- **Email** — Resend
- **Frontend** — React + Vite (web app + MV3 Chrome extension)
- **Hosting** — Railway (backend), Vercel (web app)

## Key design decisions

- OnTrack's rotating auth token can't be stored server-side for reuse — the Chrome extension captures and pushes the fresh token automatically so scheduled briefs keep running while the user's laptop is closed.
- OnTrack tokens are encrypted at rest (`core/crypto.py`).
- Identity is fully separated from OnTrack access — Clerk handles sign-in; the OnTrack token is a separate encrypted credential linked to the Clerk account.

## Notes

Source published for reference/portfolio — not open source (all rights reserved).
