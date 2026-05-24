---
name: bosia-brief-database
description: Capture database choice during brief intake — engine (postgres / mysql / sqlite-file / sqlite-memory / none), connection target, provisioning needs, initial tables. Writes `## Database` block to BRIEF.md. Runs after Aesthetic, before review.
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

Which DB engine the app uses, how it connects, and what tables to scaffold first. Without this block in BRIEF.md, the agent will improvise (usually postgres) and edit `.env.local` by hand mid-build.

| Field            | Purpose                                                                                                                       |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `engine`         | `postgres` / `mysql` / `sqlite-file` / `sqlite-memory` / `none` — picks driver + dialect                                      |
| `DATABASE_URL`   | Single runtime contract (per `bosia-env` R1). Shape stored in BRIEF.md with password masked; real value lives in `.env.local` |
| `host`           | postgres/mysql only                                                                                                           |
| `database_name`  | postgres/mysql only                                                                                                           |
| `persistence`    | `yes` (file/server-backed) or `no` (sqlite-memory). Used by checklists + `db_migrate` guard                                   |
| `initial_tables` | Free-text list — handed off to `bosia-drizzle-feature` for `*.table.ts` files                                                 |

## Supported engines

| Engine        | URL form                            | Bun driver   | Drizzle dialect               | Persists? |
| ------------- | ----------------------------------- | ------------ | ----------------------------- | --------- |
| postgres      | `postgres://user:pass@host:port/db` | `Bun.SQL`    | `drizzle-orm/bun-sql` (pg)    | yes       |
| mysql         | `mysql://user:pass@host:port/db`    | `Bun.SQL`    | `drizzle-orm/bun-sql` (mysql) | yes       |
| sqlite-file   | `sqlite://./data/app.db`            | `bun:sqlite` | `drizzle-orm/bun-sqlite`      | yes       |
| sqlite-memory | `sqlite://:memory:`                 | `bun:sqlite` | `drizzle-orm/bun-sqlite`      | **no**    |

`DATABASE_URL` is the single contract. URL scheme picks the engine — no `DB_KIND` flag.

## When to run

Run after `bosia-brief-platform` and `bosia-frontend-design` (aesthetic stance), before `bosia-brief-review`. The intake orchestrator chains this in automatically — see `bosia-brief-intake` Workflow step 5.

## Questions to ask

1. **Does this app need a database?** `yes` / `no`. If `no` → write `## Database\n- Engine: none` and exit. Most apps will say yes; pure marketing landing pages may say no.
2. **Which engine?** `postgres` / `mysql` / `sqlite-file` / `sqlite-memory`. Suggest a default based on app intent:
    - data-heavy multi-user product → `postgres`
    - embedded/demo/single-user → `sqlite-file`
    - tests/throwaway → `sqlite-memory` (with the persistence warning)
    - existing MySQL infra → `mysql`
3. **Connection target.** Engine-specific:
    - `postgres` / `mysql`: host, port, database name, username, password — OR a pre-built `DATABASE_URL` the user pastes.
    - `sqlite-file`: relative path (default `./data/app.db`).
    - `sqlite-memory`: none — fixed `:memory:`. Warn the user out loud: "loses all data on server restart; for tests/demos only".
4. **Should we create the database now?** (postgres/mysql only.) If the user has superuser creds, the agent can run `db_create` + `db_user` from chat. Otherwise the user provides ready-made creds and we skip provisioning.
5. **Initial tables to scaffold?** Free-text list (e.g. `users, sessions, projects`). Defers to `bosia-drizzle-feature` to actually emit `*.table.ts` + service files in a later turn.

## Rules

### R1 — One engine per app

Locked at intake. Switching engines mid-project requires explicit user confirmation, a fresh BRIEF.md write of the `## Database` section, and a clean migrations directory (Drizzle migrations are dialect-specific). Don't silently flip engines because a tool failed.

### R2 — `DATABASE_URL` shape in BRIEF.md, secret in `.env.local`

BRIEF.md stores the **shape** of `DATABASE_URL` with the password masked (`postgres://user:***@host:5432/db`). The real value lives in `.env.local` (gitignored). Per `bosia-env` R1, `DATABASE_URL` has no prefix — runtime secret, server-only.

### R3 — `sqlite-memory` is dev/test only

Data flushes on every server restart. `db_migrate` refuses to run for `sqlite-memory` apps unless `force: true` is passed (migrations are pointless if data flushes). Tests that need a fresh schema per run should rebuild it programmatically, not via `bun run db:migrate`.

### R4 — Drizzle adapter follows the URL scheme

After the engine is locked, the scaffolded `src/features/drizzle/index.ts` (from `bunx bosia feat drizzle`) imports the matching adapter:

- `postgres://` / `postgresql://` → `drizzle-orm/bun-sql` (pg dialect) over `Bun.SQL`
- `mysql://` → `drizzle-orm/bun-sql` (mysql dialect) over `Bun.SQL`
- `sqlite://...` → `drizzle-orm/bun-sqlite` over `bun:sqlite`

No per-engine npm package — Bun's built-in drivers cover all four.

### R5 — All app-code DB access via Drizzle

App code imports `db` from `src/features/drizzle` and uses Drizzle's typed query builders. The `db_raw` chat tool exists only for inspection or one-off escapes; never call it for routine queries and never import its style into app code. See `bosia-drizzle-feature` for the table + service pattern.

## Output to BRIEF.md

Append under `## Aesthetic` (between Aesthetic and Platform):

```markdown
## Database

- Engine: postgres | mysql | sqlite-file | sqlite-memory | none
- DATABASE_URL: postgres://user:\*\*\*@host:5432/db # secret value lives in .env.local, never committed
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
    - Remind the user to set the real `DATABASE_URL` in `.env.local` before the first `db_migrate`.
3. If `engine` is `postgres` or `mysql` and the user said "create the database now":
    - Run `db_create({ name, adminUrl })` then `db_user({ username, password, database, adminUrl })`. Admin URL stays in memory for the tool call — never written to disk.
4. Hand the `initial_tables` list off to `bosia-drizzle-feature` in a follow-up turn (each table → one `*.table.ts` + service + numbered seed).

Confirm everything in a single summary to the user before executing tool calls.

## Anti-patterns

- Asking the user for a `DATABASE_URL` before asking which engine they want. The scheme drives the question shape.
- Picking `sqlite-memory` without the persistence warning. The user must say "yes, throwaway" out loud.
- Writing the real `DATABASE_URL` (with password) into BRIEF.md. Mask the password.
- Running `db_migrate` against `sqlite-memory` without the `force: true` opt-in.
- Calling `db_raw` from app code or proposing it as a routine pattern. It's a chat-only escape hatch.
- Switching engines mid-project without rewriting `## Database` and clearing the migrations directory.

## Checklist gate

P0:

- [ ] `engine` is one of the five accepted values (no `TBD`, no "we'll decide later").
- [ ] If `engine != none`: `DATABASE_URL` shape captured (password masked).
- [ ] For `sqlite-memory`: persistence warning acknowledged in conversation.
- [ ] `bosia_feat({ name: "drizzle" })` queued or already installed.
- [ ] `DATABASE_URL` set in `.env.local` (verify with `fs_read(".env.local")` — should contain a line matching the engine's scheme).

P1:

- [ ] `initial_tables` non-empty (or explicitly "none yet").
- [ ] For `postgres` / `mysql`: provisioning decision made (agent runs `db_create`/`db_user`, OR user confirms creds already exist).

## References

- `bosia-brief-intake` — orchestrator. Chains this skill after Aesthetic.
- `bosia-drizzle-feature` — emits `*.table.ts` + service + numbered seeds for `initial_tables`.
- `bosia-env` — `DATABASE_URL` is a no-prefix runtime secret (R1).
- `bosia-brief-platform` — runs immediately before this skill.
- `bosia-brief-review` — runs immediately after; B-row covers the Database section.
