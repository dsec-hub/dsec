# dsec-website TODOs

## Features

- [ ] **Project submission via Tally form with AI auto-approval** — Embed a Tally form on the website for members to submit projects (name, description, repo/demo URL, tags, team members). On submission, Tally's webhook POSTs to a new `dsec-api` endpoint (e.g. `POST /ingest/projects`) which feeds the payload to Claude (claude-sonnet-4-6) with a rubric prompt (relevance to security, completeness of description, appropriate content). Claude returns `approved | pending | rejected` + a short reason. Auto-approved projects are written directly to the `projects` table and surfaced on the website; flagged ones land in a `projects_pending` queue visible in the exec dashboard (`dsec-app`) for manual review. The AI decision + reason should be stored alongside the submission for audit purposes.

- [ ] **Event image upload for review** — Allow visitors to submit photos from events via a form on the event detail page. Uploaded images should be held in a "pending" state (e.g. Supabase Storage bucket with restricted read) and surfaced in the exec dashboard (`dsec-app`) for an admin to approve or reject before they appear publicly on the website. Approved images should go through the existing `/media` pipeline in `dsec-api` (Pillow → WebP + PNG → Supabase) so they match the standard media format.
