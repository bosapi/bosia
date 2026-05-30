---
name: bosia-database-setup
description: On-demand database engine setup and schema work. Default scaffold ships sqlite-file (bun:sqlite); load this skill ONLY when the user explicitly asks to swap engines or create tables. Guides the AI through drizzle.config.ts, .env.local, driver install, and bun-native migrate.
triggers:
    - pakai postgres
    - pakai mysql
    - ganti database
    - ganti db
    - swap database
    - swap engine
    - set up database
    - setup database
    - sqlite ke postgres
    - postgres ke sqlite
    - drizzle migration
    - drizzle migrate
    - buat tabel
    - tambah tabel
    - create table
    - new table
    - add column
    - tambah kolom
    - DATABASE_URL
od:
    mode: setup
    category: database
bosia:
    design: false
    requires:
        blocks: []
        themes: []
        components: []
        feats: [drizzle]
    targets:
        files:
            - "drizzle.config.ts"
            - ".env.local"
            - ".env.example"
            - "src/features/drizzle/**"
    stack: [bun, drizzle]
---

# bosia-database-setup

## When to run

Load **only** when the user explicitly asks for:

- An engine swap (`pakai postgres`, `ganti ke mysql`, `back to sqlite`)
- A schema change (new table, new column, migration)
- Touching `DATABASE_URL` / `drizzle.config.ts`

Do **NOT** load this skill during brief intake. The default scaffold already ships **sqlite-file** via Bun's `bun:sqlite`, which is correct for solo / demo / dev use. Brief intake never asks the user about DB engine.

If the user is in brief intake (`BRIEF.md` missing or `## Status: pending`), keep going with `bosia-brief-intake`; this skill stays dormant until the brief is `complete` AND the user mentions DB work.

## Default state (no action needed)

Fresh Bosia apps include:

- `drizzle.config.ts` → sqlite driver, `dialect: "sqlite"`.
- `.env` → `DATABASE_URL=sqlite://./data/app.db`.
- `src/features/drizzle/{index.ts,schemas.ts,migrate.ts}` → Bun-native `drizzle-orm/bun-sqlite`.
- `bun run db:generate` + `bun run db:migrate` already wired in `package.json`.

If the user only asks "is the database working?", confirm sqlite-file is the default and stop. No edits.

## Workflow A — Engine swap

When the user says "pakai postgres" / "ganti ke mysql" / etc.:

1. **Confirm engine + reason.** One short question: "Pindah ke `postgres` — alasan: multi-user / cloud deploy / butuh JSONB / lain?" Skip if the reason is obvious from context (e.g. they just mentioned Supabase / Neon).
2. **Read current state.** `fs_read("drizzle.config.ts")`, `fs_read(".env.local")`. Capture existing tables count to estimate migration risk.
3. **Update `drizzle.config.ts`.** Set `dialect: "postgresql" | "mysql" | "sqlite"`. Keep `schema` + `out` paths.
4. **Update `.env`** with the new `DATABASE_URL`:
    - postgres: `postgres://user:pass@host:5432/dbname`
    - mysql: `mysql://user:pass@host:3306/dbname`
    - sqlite file: `sqlite://./data/app.db`
    - sqlite memory: `sqlite://:memory:` (warn: flushes on restart)
5. **Update `.env.example`** with the same key, mask the password.
6. **Install the driver** if the engine changed from sqlite:
    - postgres: `bun add postgres` (Bun's built-in `Bun.SQL` already handles it; only add `postgres` if the scaffold uses node-postgres adapter — check first)
    - mysql: `bun add mysql2`
    - sqlite: no install needed.
      Use the `bash` / `shell` tool.
7. **Update `src/features/drizzle/index.ts`** to import the matching drizzle adapter (`drizzle-orm/bun-sql`, `drizzle-orm/mysql2`, `drizzle-orm/bun-sqlite`). Re-use existing patterns; see `bosia-drizzle-feature`.
8. **Re-generate + migrate.** `bun run db:generate` then `bun run db:migrate`. If existing tables are present and the engine changed, surface the truth: cross-engine migration is data export + re-import, NOT just `migrate`. Stop and ask the user before running anything that could lose data.
9. **Verify.** `bun run check` to confirm types resolve.

## Workflow B — New table / column

When the user says "buat tabel produk" / "add column `price` to `orders`":

1. **Read schema.** `fs_read("src/features/drizzle/schemas.ts")` + `fs_list("src/features/<feature>/")`.
2. **Write new schema file** under the matching feature folder (e.g. `src/features/products/products.table.ts`) using the engine's drizzle helper (`sqliteTable` / `pgTable` / `mysqlTable`). UUID primary key + `sql\`CURRENT_TIMESTAMP\``defaults per`bosia-drizzle-feature` R-rules.
3. **Re-export** from the schema aggregator (`schemas.ts`) — usually a single `export * from "./products.table"` line.
4. **Generate + migrate.** `bun run db:generate` (writes a new `drizzle/000X_*.sql`) then `bun run db:migrate`.
5. **Sanity check.** `bun run check` and, if there's a service layer, surface the new table to the relevant `*.service.ts`. Don't write CRUD wholesale — that's `bosia-crud-flow`.

## Tools to call

- `fs_read`, `fs_write`, `fs_edit` — config + schema files
- `bash` (or `shell`) — `bun add <driver>`, `bun run db:generate`, `bun run db:migrate`, `bun run check`
- Do NOT use `db_provision` from inside this skill unless the user explicitly wants the bosapi-managed postgres flow.

## Rules

### R1 — sqlite-file is the silent default

If the user hasn't asked for an engine change, leave sqlite-file alone. Don't proactively suggest postgres "for production" mid-feature — that's a separate decision.

### R2 — Cross-engine migrations are data work, not `drizzle-kit migrate`

Switching from sqlite → postgres on a populated DB requires export + re-import. Surface this honestly; never silently drop tables.

### R3 — Mask secrets in `.env.example`

Real password goes in `.env.local`; `.env.example` gets `:***@` or `:CHANGE_ME@`.

### R4 — One feature, one table file

Don't dump everything into `schemas.ts`. Each table lives next to its feature (`src/features/<x>/<x>.table.ts`); `schemas.ts` only re-exports.

### R5 — `db.ts` import path tracks the engine

`drizzle-orm/bun-sqlite` for sqlite, `drizzle-orm/bun-sql` for postgres (Bun.SQL), `drizzle-orm/mysql2` for mysql. Don't mix.

## Anti-patterns

- Loading this skill during brief intake. The brief gate is design-only.
- Defaulting to postgres for a single-user demo app. sqlite-file is faster and zero-config.
- Running `drizzle-kit migrate` after an engine swap as if it would carry data over. It won't.
- Editing `schemas.ts` to inline a new table instead of writing a `<feature>.table.ts` file.
- Forgetting to update `.env.example` after touching `.env.local` — the next dev clone breaks.

## Checklist gate

P0:

- [ ] `drizzle.config.ts` `dialect` matches the engine in `DATABASE_URL`.
- [ ] `.env.local` has a valid `DATABASE_URL` for the chosen engine.
- [ ] `.env.example` mirrors `.env.local` with secrets masked.
- [ ] `src/features/drizzle/index.ts` imports the matching drizzle adapter.
- [ ] `bun run check` passes after the change.

P1:

- [ ] If tables existed before the swap, a data-migration plan is written down (in chat or `BRIEF.md` notes), not assumed.
- [ ] New tables live in `src/features/<feature>/<feature>.table.ts`, not inline.

## References

- `bosia-drizzle-feature` — full scaffold pattern, UUID + `CURRENT_TIMESTAMP` rules, multi-engine adapter selection.
- `bosia-drizzle-usage` — query patterns, transaction shape, common AI failure modes.
- `bosia-query-defaults` — `list(db, { limit, offset, orderBy })` signature; every table this skill creates will be queried through it.
