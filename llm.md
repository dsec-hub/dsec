# DSEC workspace — MCP guide for AI assistants

_For: full read + write + AI access (reference copy)._
_Generated for a key with scope(s): `read`, `write`, `trigger`. This file contains no secret —
the key is shown only as `dsec_live_YOUR_KEY` — so it's safe to commit or paste into a chat._

You are connected (or about to connect) to the **DSEC committee workspace** over
**MCP (Model Context Protocol)**. Through it you can read and update the club's members,
finances, events, community projects, task boards, meetings, documents, sponsors
and partner orgs — the same data the human sees in the dashboard. Everything you
change writes to the club's single source of truth and shows up in the dashboard
(and, for published events/projects, on the public website).

## What this key can do

- `read` — **yes**. View workspace data — members, events, projects, tasks, meetings, documents, partners and people (a legacy read key also covers the isolated Sponsors and Finance modules).
- `write` — **yes**. Create and update workspace data — events (plus speaker, sponsor and partner line-ups), projects, task boards, meetings, documents, partners and people (a legacy write key also covers the isolated Sponsors and Finance modules).
- `trigger` — **yes**. Run AI features that spend tokens — currently generating meeting notes and action items from a transcript.
- `ingest` — no. Import the weekly DUSA membership / P&L spreadsheets. Admin-only and used by the ingestion pipeline over REST — there are no MCP tools for it.
- `read:sponsors` — no. View only the sponsorship pipeline — sponsors, contacts, packages and inbound leads (the isolated Sponsors module).
- `write:sponsors` — no. Create and update the sponsorship pipeline — sponsors, contacts, packages and leads. Implies read:sponsors.
- `read:finance` — no. View only the club finances — the term P&L summary and ledger lines (the isolated Finance module).
- `write:finance` — no. Set event budgets and auto-applied grants. Implies read:finance.

Most scopes are **coarse and global**: a legacy `write` key can write *every* module and a legacy `read` key can read everything. The **Sponsors** and **Finance** modules are **isolated** — their tools require the matching `read:sponsors` / `write:sponsors` / `read:finance` / `write:finance` scope (a legacy `read`/`write` key still covers them for backwards compatibility). What a key holds is bounded by the dashboard role of whoever minted it.

## Connect (the human does this once)

- **Server URL:** `https://api.dsec.club/mcp`
- **Transport:** Streamable HTTP
- **Auth:** either sign in with a DSEC account (OAuth) or send a key as a header —
  `Authorization: Bearer dsec_live_YOUR_KEY`

There are two ways to connect:

1. **Sign in (OAuth, no token).** Paste just the server URL into a client that
   supports OAuth (e.g. Claude.ai's *Add custom connector*). The client opens a
   DSEC sign-in page; log in and approve. Access is bounded by your dashboard
   role. Nothing to paste here — skip the key steps below.
2. **API key.** Replace `dsec_live_YOUR_KEY` with a real `dsec_live_…` key (shown once
   when minted at **Settings → API & MCP** in the dashboard) using one of:

**Claude Code (CLI)**
```bash
claude mcp add --transport http dsec https://api.dsec.club/mcp \
  --header "Authorization: Bearer dsec_live_YOUR_KEY"
```

**Claude Desktop** — `claude_desktop_config.json`
```json
{
  "mcpServers": {
    "dsec": {
      "type": "http",
      "url": "https://api.dsec.club/mcp",
      "headers": { "Authorization": "Bearer dsec_live_YOUR_KEY" }
    }
  }
}
```

**Claude.ai (Add custom connector)** — best path: paste just `https://api.dsec.club/mcp` and
sign in when prompted (OAuth, option 1 above — no key needed). If you'd rather
use a key, the dialog has no header field, so put the key in the URL:
```
https://api.dsec.club/mcp?key=dsec_live_YOUR_KEY
```
Treat that whole URL as a secret. ChatGPT / Codex custom connectors that *do*
expose a header field can instead use `https://api.dsec.club/mcp` with
`Authorization: Bearer dsec_live_YOUR_KEY`.

## House rules (follow these)

- **Call `whoami` first** to confirm which scopes this key holds before planning any work.
- **Never invent IDs.** Use the matching `list_*` tool to find the id you need; resolve people (assignees, leads, speakers) with `list_people`.
- **Dates are ISO `YYYY-MM-DD`.**
- **Events and projects are private drafts** until you set `is_public=true` — they only reach the public website once published.
- **Updates are partial:** pass only the fields you want to change; anything you omit is left untouched.
- **Uploads aren't here.** Images and files are added in the dashboard; the `list_media` / `list_attachments` tools are read-only.
- **Confirm irreversible actions with the human first** — `archive_event`, `delete_sponsor_package`, `remove_*` and `unlink_*` change shared club data.
- **AI tools spend real tokens** and are cost-capped server-side — use `generate_meeting_notes` deliberately, not speculatively.
- Writes and AI calls are **rate-limited**; if a call is throttled, back off and tell the human rather than hammering it.

## Tools available to this key

### Getting started
- `whoami` — Show which DSEC API key you're using and exactly what it can do. Call this first.

### Members
- `list_members` — List club members (the paid roster from the weekly DUSA import).
- `get_member` — Get one club member by id.
- `member_stats` — Member counts and the week-by-week membership trend.

### Finance
- `finance_summary` — Opening balance, income, expenses and closing balance for the term.
- `list_transactions` — Profit-and-loss ledger lines.
- `list_finance_reports` — List the imported P&L reports (one per weekly finance import), newest first.
- `set_event_budget` _(write)_ — Set an event's budget (auto-applies the standard grant).

### Events
- `list_events` — List club events (drafts and published).
- `get_event` — Get one event by id (full detail).
- `create_event` _(write)_ — Create an event. It stays a private draft until is_public=true.
- `update_event` _(write)_ — Update fields on an existing event.
- `archive_event` _(write)_ — Soft-delete (archive) an event. Confirm with the human first.
- `create_event_review_form` _(write)_ — Create the Tally post-event review form for an event.
- `get_event_review_responses` — Read the submitted responses to an event's review form.

### Event line-up
- `list_event_speakers` — List the speakers billed on an event.
- `add_event_speaker` _(write)_ — Add a speaker to an event's line-up.
- `update_event_speaker` _(write)_ — Update a speaker's details on an event.
- `remove_event_speaker` _(write)_ — Remove (soft-archive) a speaker from an event.
- `list_event_sponsors` — List the sponsors on an event's sponsor wall.
- `link_event_sponsor` _(write)_ — Link a sponsor to an event (idempotent).
- `unlink_event_sponsor` _(write)_ — Remove a sponsor from an event's wall.
- `list_event_partners` — List the partner orgs co-hosting an event.
- `link_event_partner` _(write)_ — Link a partner org to an event (idempotent).
- `unlink_event_partner` _(write)_ — Remove a partner org from an event.
- `list_event_connections` — List events visibly connected to this one (related-events links).
- `link_event_connection` _(write)_ — Connect two events so each shows the other as related (visual-only).
- `unlink_event_connection` _(write)_ — Remove the connection between two events.

### Partners
- `list_partners` — List collaborator clubs / partner organisations.
- `get_partner` — Get one partner org / club by id.
- `create_partner` _(write)_ — Add a partner org / club.
- `update_partner` _(write)_ — Update a partner's details.
- `archive_partner` _(write)_ — Soft-delete (archive) a partner org. Confirm with the human first.

### Projects
- `list_projects` — List community projects.
- `get_project` — Get one community project by id (full detail).
- `create_project` _(write)_ — Create a project. It stays a draft until is_public=true.
- `update_project` _(write)_ — Update fields on a project.
- `archive_project` _(write)_ — Soft-delete (archive) a project. Confirm with the human first.

### Tasks
- `list_boards` — List task boards and their columns.
- `create_board` _(write)_ — Create a task board.
- `update_board` _(write)_ — Update a task board's name, description, committee or columns.
- `archive_board` _(write)_ — Soft-delete (archive) a task board. Confirm with the human first.
- `list_tasks` — List task cards (filterable by board, column, assignee, …).
- `get_task` — Get one task card by id (full detail).
- `create_task` _(write)_ — Create a task card.
- `update_task` _(write)_ — Update a task's fields and cross-entity links.
- `move_task` _(write)_ — Move a task to a column and position.
- `archive_task` _(write)_ — Soft-delete (archive) a task card. Confirm with the human first.

### Meetings
- `list_meetings` — List meetings.
- `get_meeting` — Get one meeting by id (transcript, notes, action items).
- `create_meeting` _(write)_ — Create a meeting record.
- `update_meeting` _(write)_ — Update a meeting (edit transcript, or hand-write notes/action items).
- `archive_meeting` _(write)_ — Soft-delete (archive) a meeting. Confirm with the human first.
- `generate_meeting_notes` _(AI — spends tokens)_ — AI-summarise a transcript into notes and action items (spends tokens).

### Documents
- `list_documents` — List documents (notes, meeting notes, deliverables, policies).
- `get_document` — Get one document with its full Markdown content.
- `create_document` _(write)_ — Create a document.
- `update_document` _(write)_ — Update a document's title, content, status or assignee.
- `archive_document` _(write)_ — Soft-delete (archive) a document. Confirm with the human first.

### Sponsors
- `list_sponsors` — List sponsorship leads / relationships in the pipeline.
- `get_sponsor` — Get one sponsor / pipeline relationship by id.
- `create_sponsor` _(write)_ — Add a sponsorship lead.
- `update_sponsor` _(write)_ — Advance a sponsor through the pipeline / edit its details.
- `archive_sponsor` _(write)_ — Soft-delete (archive) a sponsor. Confirm with the human first.

### Sponsor contacts
- `list_sponsor_contacts` — List the people attached to a sponsor.
- `add_sponsor_contact` _(write)_ — Attach a contact to a sponsor.
- `update_sponsor_contact` _(write)_ — Update a sponsor contact's details.
- `remove_sponsor_contact` _(write)_ — Remove (soft-archive) a sponsor contact.

### Sponsor packages
- `list_sponsor_packages` — List the sponsorship tiers shown on the website.
- `get_sponsor_package` — Get one sponsorship package / tier by id.
- `create_sponsor_package` _(write)_ — Add a sponsorship package / tier.
- `update_sponsor_package` _(write)_ — Update a sponsorship package.
- `delete_sponsor_package` _(write)_ — Permanently delete a sponsorship package. Confirm with the human first.

### Sponsor leads
- `list_sponsor_leads` — List inbound sponsorship enquiries from the website.
- `update_sponsor_lead` _(write)_ — Move an inbound lead through the pipeline and add notes.

### People
- `list_people` — List people (exec, committee, external contacts) — use this to resolve assignees.
- `get_person` — Get one person by id (committee member or external contact).
- `create_person` _(write)_ — Add a person (committee member or external contact).
- `update_person` _(write)_ — Update a person's details.
- `archive_person` _(write)_ — Soft-delete (archive) a person. Confirm with the human first.

### Media & attachments
- `list_media` — List images attached to an entity (read-only; uploads happen in the dashboard).
- `list_attachments` — List files (PDFs, images) attached to an entity (read-only).

## Recipes

- **Status check:** “How many current members do we have, what's our closing balance this term, and what events are coming up?” → `member_stats`, `finance_summary`, `list_events`.
- **Run a new event end-to-end:** `create_event` (leave it a draft) → `set_event_budget` → `add_event_speaker` → `link_event_sponsor`; publish later with `update_event(is_public=true)`.
- **Plan work:** `create_board` → `create_task` (resolve the assignee with `list_people` first) → `move_task` as it progresses.
- **Minutes from a transcript:** `create_meeting` → paste the transcript into `generate_meeting_notes` → it writes notes and action items back to the meeting.

## When a tool is refused

If a call fails with a message like `scope 'write' required`, this key simply lacks that scope — it's not a bug. Tell the human to mint a key with the scope they need at **Settings → API & MCP** (the scopes anyone can grant are capped by their dashboard role, so they may need a broader role first).
