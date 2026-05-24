---
name: bosia-brief-database
description: Capture database choice during brief intake — engine (sqlite-memory / sqlite-file / postgres / mysql / none), connection target, provisioning needs, initial tables. Writes `## Database` block to BRIEF.md. Runs after Aesthetic, before review.
triggers:
    - database
    - db
    - postgres
    - mysql
    - sqlite
    - DATABASE_URL
    - drizzle
od:
    mode: intake
    category: discovery
bosia:
    design: false
    requires:
        blocks: []
        themes: []
        components: []
        feats: [drizzle]
    targets:
        files:
            - "BRIEF.md"
    stack: [bun-sql, bun-sqlite, drizzle]
---

# bosia-brief-database

## What it captures

Which DB engine the app uses, how it connects, and what tables to scaffold first. Without this block in BRIEF.md, the agent will improvise (usually postgres) and edit `.env` by hand mid-build.

| Field            | Purpose                                                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `engine`         | `sqlite-memory` / `sqlite-file` / `postgres` / `mysql` / `none` — picks driver + dialect                                             |
| `DATABASE_URL`   | Single runtime contract (per `bosia-env` R1). Shape stored in BRIEF.md with password masked; real value lives in `.env` (gitignored) |
| `host`           | postgres/mysql only                                                                                                                  |
| `database_name`  | postgres/mysql only                                                                                                                  |
| `persistence`    | `yes` (file/server-backed) or `no` (sqlite-memory). Used by checklists + `db_migrate` guard                                          |
| `initial_tables` | Free-text list — handed off to `bosia-drizzle-feature` for `*.table.ts` files                                                        |

## Supported engines

| Engine        | URL form                            | Bun driver   | Drizzle dialect               | Persists? |
| ------------- | ----------------------------------- | ------------ | ----------------------------- | --------- |
| sqlite-memory | `sqlite://:memory:`                 | `bun:sqlite` | `drizzle-orm/bun-sqlite`      | **no**    |
| sqlite-file   | `sqlite://./data/app.db`            | `bun:sqlite` | `drizzle-orm/bun-sqlite`      | yes       |
| postgres      | `postgres://user:pass@host:port/db` | `Bun.SQL`    | `drizzle-orm/bun-sql` (pg)    | yes       |
| mysql         | `mysql://user:pass@host:port/db`    | `Bun.SQL`    | `drizzle-orm/bun-sql` (mysql) | yes       |

`DATABASE_URL` is the single contract. URL scheme picks the engine — no `DB_KIND` flag.

## When to run

Run after `bosia-brief-platform` and `bosia-frontend-design` (aesthetic stance), before `bosia-brief-review`. The intake orchestrator chains this in automatically — see `bosia-brief-intake` Workflow step 5.

## Questions to ask

1. **Does this app need a database?** `yes` / `no`. If `no` → write `## Database\n- Engine: none` and exit. Most apps will say yes; pure marketing landing pages may say no.
2. **Which engine?** Present in this order: `sqlite-memory` / `sqlite-file` / `postgres` / `mysql`. Suggest a default based on app intent:
    - tests/throwaway → `sqlite-memory` (with the persistence warning)
    - embedded/demo/single-user → `sqlite-file`
    - data-heavy multi-user product → `postgres`
    - existing MySQL infra → `mysql`
3. **Connection target.** Engine-specific:
    - `sqlite-memory`: none — fixed `:memory:`. Warn the user out loud: "loses all data on server restart; for tests/demos only".
    - `sqlite-file`: relative path (default `./data/app.db`).
    - `postgres` / `mysql`: host, port, database name, username, password — OR a pre-built `DATABASE_URL` the user pastes.
4. **Should we create the database now?** (postgres only.) If bosapi has `BOSAPI_MASTER_DATABASE_URL` set, the agent can run a single `db_provision` call from chat — it mints the DB + role and writes `DATABASE_URL` into `.env` itself (overwriting the placeholder `bosia create` wrote). Otherwise the user provides ready-made creds and we skip provisioning.
5. **Initial tables to scaffold?** Free-text list (e.g. `users, sessions, projects`). Defers to `bosia-drizzle-feature` to actually emit `*.table.ts` + service files in a later turn.

## Rules

### R1 — One engine per app

Locked at intake. Switching engines mid-project requires explicit user confirmation, a fresh BRIEF.md write of the `## Database` section, and a clean migrations directory (Drizzle migrations are dialect-specific). Don't silently flip engines because a tool failed.

### R2 — `DATABASE_URL` shape in BRIEF.md, secret in `.env`

BRIEF.md stores the **shape** of `DATABASE_URL` with the password masked (`postgres://user:***@host:5432/db`). The real value lives in `.env` (gitignored — `bosia create` copies `.env.example` → `.env` on scaffold). Per `bosia-env` R1, `DATABASE_URL` has no prefix — runtime secret, server-only.

### R3 — `sqlite-memory` is dev/test only

Data flushes on every server restart. `db_migrate` refuses to run for `sqlite-memory` apps unless `force: true` is passed (migrations are pointless if data flushes). Tests that need a fresh schema per run should rebuild it programmatically, not via `bun run db:migrate`.

### R4 — Drizzle adapter follows the URL scheme

After the engine is locked, the scaffolded `src/features/drizzle/index.ts` (from `bunx bosia feat drizzle`) imports the matching adapter:

- `sqlite://...` → `drizzle-orm/bun-sqlite` over `bun:sqlite`
- `postgres://` / `postgresql://` → `drizzle-orm/bun-sql` (pg dialect) over `Bun.SQL`
- `mysql://` → `drizzle-orm/bun-sql` (mysql dialect) over `Bun.SQL`

No per-engine npm package — Bun's built-in drivers cover all four.

### R5 — All app-code DB access via Drizzle

App code imports `db` from `src/features/drizzle` and uses Drizzle's typed query builders. The `db_raw` chat tool exists only for inspection or one-off escapes; never call it for routine queries and never import its style into app code. See `bosia-drizzle-feature` for the table + service pattern.

## Output to BRIEF.md

Append under `## Aesthetic` (between Aesthetic and Platform):

```markdown
## Database

- Engine: sqlite-memory | sqlite-file | postgres | mysql | none
- DATABASE_URL: postgres://user:\*\*\*@host:5432/db # secret value lives in .env, never committed
- Host: db.example.com (postgres/mysql only)
- Database name: myapp (postgres/mysql only)
- ORM: drizzle (schema + queries) + Bun built-in driver (Bun.SQL / bun:sqlite)
- Persistence: yes | no (in-memory, dev/test only)
- Initial tables: users, sessions, projects
```

For `engine: none`, the block collapses to:

```markdown
## Database

- Engine: none
```

## Workflow side effects

After answers locked:

1. Write the `## Database` block to BRIEF.md.
2. If `engine != none`:
    - Queue `bosia_feat({ name: "drizzle" })` for the next confirmation batch (installs the multi-engine adapter into `src/features/drizzle`).
    - Remind the user to set the real `DATABASE_URL` in `.env` before the first `db_migrate` (skip this reminder when `db_provision` runs — the tool writes it for you, overwriting the placeholder from `.env.example`).
3. If `engine` is `postgres` and the user said "create the database now":
    - Run a single `db_provision({ name, username, password })` call. It uses bosapi's `BOSAPI_MASTER_DATABASE_URL` admin connection (never exposed to the AI) to CREATE DATABASE, CREATE ROLE, GRANT, then writes the resulting `DATABASE_URL` into `<appDir>/.env` (overwriting the placeholder line). If the master URL is unset, fall back to asking the user to provide ready-made creds. For teardown, `db_deprovision({ name, username })` drops the role + database; it does NOT clear `.env`. (mysql is not supported by these tools — for mysql the user supplies creds manually.)
4. Hand the `initial_tables` list off to `bosia-drizzle-feature` in a follow-up turn (each table → one `*.table.ts` + service + numbered seed).

Confirm everything in a single summary to the user before executing tool calls.

## Anti-patterns

- Asking the user for a `DATABASE_URL` before asking which engine they want. The scheme drives the question shape.
- Picking `sqlite-memory` without the persistence warning. The user must say "yes, throwaway" out loud.
- Writing the real `DATABASE_URL` (with password) into BRIEF.md. Mask the password — secret lives in `.env`.
- Running `db_migrate` against `sqlite-memory` without the `force: true` opt-in.
- Calling `db_raw` from app code or proposing it as a routine pattern. It's a chat-only escape hatch.
- Switching engines mid-project without rewriting `## Database` and clearing the migrations directory.
- Hand-editing `.env` to add `DATABASE_URL` when `db_provision` could have done it for you. The tool is the source of truth for provisioned creds; mixing manual edits with provisioning leaves the role on the server and the URL out of sync.
- Calling `db_provision` for a non-postgres app. The tool is postgres-only; for mysql or sqlite, set `DATABASE_URL` in `.env` manually.

## Checklist gate

P0:

- [ ] `engine` is one of the five accepted values (no `TBD`, no "we'll decide later").
- [ ] If `engine != none`: `DATABASE_URL` shape captured (password masked).
- [ ] For `sqlite-memory`: persistence warning acknowledged in conversation.
- [ ] `bosia_feat({ name: "drizzle" })` queued or already installed.
- [ ] `DATABASE_URL` set in `.env` (verify with `fs_read(".env")` — should contain a line matching the engine's scheme; the `bosia create` placeholder must be replaced).

P1:

- [ ] `initial_tables` non-empty (or explicitly "none yet").
- [ ] For `postgres`: provisioning decision made (agent runs `db_provision`, OR user confirms creds already exist). For `mysql`: user supplies creds manually (no provisioning tool).

## References

- `bosia-brief-intake` — orchestrator. Chains this skill after Aesthetic.
- `bosia-drizzle-feature` — emits `*.table.ts` + service + numbered seeds for `initial_tables`.
- `bosia-env` — `DATABASE_URL` is a no-prefix runtime secret (R1).
- `bosia-brief-platform` — runs immediately before this skill.
- `bosia-brief-review` — runs immediately after; B-row covers the Database section.
