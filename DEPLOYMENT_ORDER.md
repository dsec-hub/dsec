# DSEC — Migration / Deployment Order

Canonical run order for schema changes across the monorepo. **Read this before any
schema change.**

## ⚠️ Migration doctrine (DO NOT VIOLATE)

- **NEVER run `alembic --autogenerate` against the live Neon database.** Neon also
  holds app-owned objects (the RBAC tables `app_role`/`app_user`/`app_invite`,
  `committee`, `app_setting`, `task_view`, and assorted app-added columns) that
  Alembic does not know about. Autogenerate will emit `DROP` statements for them.
  **Hand-write every Alembic migration** (CREATE/ADD only; see
  `dsec-api/alembic/versions/d4b8e1a6f29c_workspace_tables.py` for the pattern).
- **Backend-owned tables** (created by Alembic: `events`, `project`, `task`,
  `task_board`, `meeting`, `document`, sponsors, etc.) change via hand-written
  Alembic migrations in `dsec-api`.
- **App-owned objects** (`app_role` columns, `task_view`, `committee`, etc.)
  change via idempotent `dsec-hub/scripts/*.ts` (pg.Pool + `IF NOT EXISTS`).
  Safe to re-run.

## Run order — Tasks-Views + Roles initiative (2026-06-17)

Run from `dsec-hub/` with `.env.local` pointing at the target Neon database.
Prefer a Neon **dev branch** first, verify, then prod.

```
# 1. Backend schema (only Phase 6 adds anything here — task.parent_task_id)
(cd dsec-api && alembic upgrade head)

# 2. Phase 0 — app-owned foundation (idempotent, additive)
(cd dsec-hub && npx tsx scripts/add-task-view-table.ts)
(cd dsec-hub && npx tsx scripts/add-app-role-view-config-column.ts)

# 3. Phase 1 — committee rename + role/viewConfig seed (idempotent, transactional)
(cd dsec-hub && npx tsx scripts/update-committees-v2.ts)
(cd dsec-hub && npx tsx scripts/setup-roles-v2.ts)
```

Each script is idempotent — re-running is a no-op. After running, confirm the
Drizzle schema (`dsec-hub/src/db/schema.ts`, `workspace-schema.ts`) matches Neon
(the historical schema double-def divergence hazard).

## Verification

- dsec-hub: `npx tsc --noEmit` · `npm run lint` · `npm run build`; re-run each
  script twice to prove idempotence (second run = no-op).
- dsec-api: on a dev branch `alembic upgrade head` → `alembic downgrade -1` →
  `alembic upgrade head`; `ruff check .` · `mypy app` · `pytest`.
