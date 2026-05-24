---
title: Database
description: Drizzle ORM over Bun's built-in drivers — one DATABASE_URL, four supported engines (postgres, mysql, sqlite file, sqlite in-memory).
---

## Overview

Bosia uses [Drizzle ORM](https://orm.drizzle.team/) on top of Bun's built-in drivers — `Bun.SQL` for postgres and mysql, `bun:sqlite` for SQLite. One `DATABASE_URL` environment variable picks both the engine and the connection target; the URL scheme decides which adapter loads.

No per-engine npm package — Drizzle ships `drizzle-orm/bun-sql` and `drizzle-orm/bun-sqlite` wrappers around the built-ins.

## Supported engines

| Engine        | URL form                            | Bun driver   | Drizzle dialect               | Persists?        |
| ------------- | ----------------------------------- | ------------ | ----------------------------- | ---------------- |
| postgres      | `postgres://user:pass@host:port/db` | `Bun.SQL`    | `drizzle-orm/bun-sql` (pg)    | yes              |
| mysql         | `mysql://user:pass@host:port/db`    | `Bun.SQL`    | `drizzle-orm/bun-sql` (mysql) | yes              |
| sqlite (file) | `sqlite://./data/app.db`            | `bun:sqlite` | `drizzle-orm/bun-sqlite`      | yes              |
| sqlite (mem)  | `sqlite://:memory:`                 | `bun:sqlite` | `drizzle-orm/bun-sqlite`      | **no** — flushes |

## Setup

```bash
bunx bosia feat drizzle
```

This drops `src/features/drizzle/index.ts` (multi-engine adapter), `schemas.ts`, `seeds/runner.ts`, and `drizzle.config.ts` into your app and adds `db:generate`, `db:migrate`, `db:seed` to `package.json`.

Then set `DATABASE_URL` in `.env.local`:

```bash
# pick one
DATABASE_URL=postgres://user:pass@localhost:5432/myapp
# DATABASE_URL=mysql://user:pass@localhost:3306/myapp
# DATABASE_URL=sqlite://./data/app.db
# DATABASE_URL=sqlite://:memory:
```

Generate + apply + seed:

```bash
bun run db:generate   # produces migrations/ from your *.table.ts files
bun run db:migrate    # applies them
bun run db:seed       # runs *.ts in src/features/drizzle/seeds/ in order
```

## Adding a table

See the `bosia-drizzle-feature` skill for the canonical pattern: one `*.table.ts` per table, a colocated service, and a numbered seed (`001_*.ts`, `002_*.ts`) when initial data is needed. Re-export tables from `schemas.ts` so Drizzle Kit picks them up.

## SQLite in-memory

`sqlite://:memory:` is dev/test only. Every server restart starts with an empty schema and zero rows. Don't run `bun run db:migrate` against it from the chat agent — the migration is wasted (the schema disappears on the next boot). If you need an in-memory schema for tests, rebuild it per run inside your test harness instead.

## Switching engines

Don't reuse `src/features/drizzle/migrations/` across engines — migrations are dialect-specific (postgres `SERIAL`, mysql `AUTO_INCREMENT`, sqlite `AUTOINCREMENT` are all different). To switch:

1. Update `DATABASE_URL` in `.env.local` to the new scheme.
2. Delete `src/features/drizzle/migrations/*.sql` (keep the `.gitkeep`).
3. Run `bun run db:generate` then `bun run db:migrate`.

## From the editor (chat tools)

When working in the bosapi editor, the AI agent has a `db_*` tool family that mirrors the lifecycle:

| Tool                                     | What it does                                                                       |
| ---------------------------------------- | ---------------------------------------------------------------------------------- |
| `db_test_connection`                     | Opens + closes a connection, reports engine, version, latency                      |
| `db_create` / `db_user`                  | Provisions DB + role (postgres + mysql; sqlite is a no-op)                         |
| `db_generate` / `db_migrate` / `db_seed` | Drizzle Kit lifecycle (`bun run db:*`)                                             |
| `db_query({ sql, params? })`             | SELECT-only, parametrized                                                          |
| `db_raw({ sql })`                        | **DANGEROUS** — arbitrary SQL bypassing the SELECT guard; for one-off escapes only |
| `db_schema`                              | Lists tables and columns                                                           |
| `db_status`                              | One-call health summary                                                            |

All tools default to the **app** target (your app's `.env.local`). Targeting the editor's own DB requires setting `BOSAPI_ALLOW_EDITOR_DB_TOOLS=true` in the editor environment.
