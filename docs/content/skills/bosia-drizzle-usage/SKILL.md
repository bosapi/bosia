---
name: bosia-drizzle-usage
description: How to consume `db` from `src/features/drizzle` in loaders/services — always `await db.select()...`, never reach past the export, pre-flight `db_test_connection` + `db_status` before the first read.
triggers:
    - +page.server.ts
    - load
    - query database
    - db.select
    - drizzle query
    - db.all
od:
    mode: convention
    category: framework
bosia:
    design: false
    requires:
        blocks: []
        themes: []
        components: []
        feats: [drizzle]
    targets:
        routes: []
    stack: [drizzle, bun-sql, bun-sqlite]
---

# bosia-drizzle-usage

## What it does

Governs the **consumer** side of `db` — `+page.server.ts` loaders, `+server.ts` actions, service functions. The scaffolded `db` (built by `registry/features/drizzle/drizzle-index.ts`) is an engine-aware drizzle instance. This skill keeps the agent from reaching past that export into raw `bun:sqlite` or sqlite-only sync APIs.

Pairs with:

- `bosia-drizzle-feature` — schema authoring, `*.table.ts`, seeds.
- `bosia-brief-database` — engine choice (postgres vs mysql vs sqlite) during intake.

## When to use

Every time a route or service reads/writes the database. The P0 pre-flight runs **once per session** before the first DB-touching `fs_write`.

## Workflow

1. Run `db_status`. Then `db_test_connection`. Stop on failure — do NOT improvise paths or rewrite `.env`. See `references/troubleshooting.md`.
2. Optional: `db_schema` to confirm tables/columns exist before referencing them.
3. Write the loader / service using `await db.select({...}).from(...)`.
4. `shell({ cmd: "build" })` to surface type errors.
5. On Inspector runtime error: re-read the loader, re-run `db_test_connection`. Never jump to `bun:sqlite`.

## Quick Start — homepage loader, written correctly

```ts
// src/routes/(public)/+page.server.ts
import { and, count, eq } from "drizzle-orm";
import { db } from "../../features/drizzle";
import { barang, kategori } from "../../features/drizzle/schemas";

export async function load() {
	const [categories, totalBarang] = await Promise.all([
		db
			.select({
				id: kategori.id,
				nama: kategori.nama,
				slug: kategori.slug,
				jumlah: count(barang.id),
			})
			.from(kategori)
			.leftJoin(barang, and(eq(barang.kategoriId, kategori.id), eq(barang.tersedia, true)))
			.groupBy(kategori.id)
			.orderBy(kategori.nama),
		db
			.select({ c: count() })
			.from(barang)
			.then((r) => r[0]?.c ?? 0),
	]);

	return { categories, totalBarang };
}
```

Pure `await` on the builder. No `.all()`. No `db.all(sql\`...\`)`. No `bun:sqlite` import.

## Migrations & dev-server lifecycle

- Flow is always `db_generate` (writes SQL into `src/features/drizzle/migrations/`) → `db_migrate` (applies via the bun-native runner at `src/features/drizzle/migrate.ts`) → `runtime_restart` (drops the stale `db` singleton in the dev server). Never skip the restart — the running app cached its sqlite handle from before the migration ran.
- All DDL lives in migration files. Never inline `CREATE TABLE IF NOT EXISTS` (or any `ALTER`/`CREATE INDEX`) inside `+page.server.ts` `load()`, a `+server.ts` handler, or a service function. It runs on every request, races between concurrent requests, and means the real migration never gets stored.
- Seeds are one-shot via `db_seed` (the runner in `src/features/drizzle/seeds/runner.ts` records applied seeds in `__bosia_seeds`). Never seed inside a loader.
- If `bun run db:migrate` errors with `Please install either 'better-sqlite3' or '@libsql/client'` (sqlite), `please install either of 'pg' / 'postgres' / …` (postgres), or the equivalent for mysql: the app's `package.json` `db:migrate` script is the legacy `drizzle-kit migrate` line. Bosia 0.6.3+ ships a bun-native runner. Update the script to `bun run src/features/drizzle/migrate.ts`. Do **not** install the Node drivers — that defeats the bun-only stance. See `references/troubleshooting.md`.

## Where the SQLite file lives (Bosapi-hosted apps)

Read this **before** writing path code. Single biggest source of looped failures.

Each generated app has its own cwd under Bosapi's host tree:

```
<bosapi-host>/data/users/<userId>/<projectSlug>/<appSlug>/
├── .env                          ← DATABASE_URL=sqlite://./data/app.db
└── data/
    └── app.db                    ← the sqlite file
```

- ✅ Correct (relative to the app's own dir): `…/data/users/<userId>/<projectSlug>/<appSlug>/data/app.db`
- ❌ Wrong (real observed loop): `<bosapi-host>/data/<appSlug>.db` — that's Bosapi's host data dir, not the app's.

The `./data/app.db` path in `.env` is **already correct**. Don't rewrite it. Don't use absolute paths. Don't `import.meta.dir`. The `db_*` tools resolve against the active app's cwd — let them.

Full path-resolution recipe + the host-vs-app diagram: `references/troubleshooting.md` § "Where the SQLite file actually lives".

## P0 — must pass

- [ ] `db_test_connection` ran green this session before the first loader/service read.
- [ ] `db` imported only from `src/features/drizzle`. No `import { Database } from "bun:sqlite"` outside `src/features/drizzle/index.ts`.
- [ ] All consumer queries use `await db.select(...)...` or `await db.execute(sql\`...\`)`. No top-level `db.all(...)`/`db.get(...)` in consumer code.
- [ ] No `process.cwd()` / `import.meta.dir` path-resolution helpers added to "find" the DB file.
- [ ] No absolute or hand-rolled SQLite path. The DB file lives at `./data/app.db` relative to the **app's own** cwd (see § "Where the SQLite file lives").
- [ ] After `db_migrate` succeeds, call `runtime_restart` before reading from the new schema.
- [ ] No DDL or seed logic inside `load()` / `+server.ts` / service functions.

## P1 — should pass

- [ ] Independent queries inside a loader use `Promise.all`.
- [ ] Single-row reads use `const [row] = await db.select()...limit(1)`, not `.get()`.
- [ ] Selects project columns explicitly (`db.select({ id, name })…`), not bare `db.select()`.
- [ ] Multi-statement writes wrapped in `db.transaction(async (tx) => { ... })`.
- [ ] Pagination uses cursor (`gt(t.id, lastSeenId).limit(n)`) for lists > one page.
- [ ] No N+1: a `for (const x of xs) await db.select(...)` inside a loader is rewritten as a join or `db.query.X.findMany({ with })`.
- [ ] Raw SQL paths annotated with a one-line comment explaining why the builder didn't fit.

## Red Flags

Stop and reconsider if you see any of these:

- `db.all(sql\`SELECT ...\`)`on top-level`db`. The bosia `db` export is not the sqlite sync object.
- Building `sqlAll` / `sqlGet` / `ensureSqlite` helpers that open `bun:sqlite` directly.
- `import.meta.dir` / `process.cwd()` fallback loops trying to "find" the DB file.
- Moving the DB file to project root because the path "won't resolve" — the path is fine; the cwd was wrong (you ran `bun run dev` from the wrong directory).
- Putting the sqlite file under Bosapi's host `data/` dir (e.g. `<bosapi-host>/data/<appSlug>.db`) instead of the app's own `data/app.db`. See § "Where the SQLite file lives".
- Writing loader code before any `db_test_connection` this session.
- Mixing chained `.all()` terminals with `await` on the same builder in one file.
- Improvising `.env` rewrites when the connection test fails — confirm with the user first.
- `raw` (or any `bun:sqlite` instance) re-exported from `src/features/drizzle/index.ts` to bypass drizzle.
- `CREATE TABLE IF NOT EXISTS` / seed inserts inside a request handler.
- Calling `db_query` to "verify data exists" while the running app throws `no such table` — that's a missing `runtime_restart`, not a data problem.

## References

- `references/query-patterns.md` — subqueries, CTEs, raw SQL composition, aggregations, prepared statements, batch insert/update/delete, LATERAL/UNION/DISTINCT, locking. All examples use the Bosia `db` import.
- `references/performance.md` — Bun-driver behavior (pooling is mostly automatic), explicit column projection, index strategy, cursor pagination, drizzle `logger:` query logging, materialized views for postgres.
- `references/troubleshooting.md` — failure modes catalog: `db.all is not a function`, `SQLite not initialized`, `unable to open database file`, engine mismatch after `.env` edits, recovery flow for each.
- `references/quick-reference.md` — Bosia-flavored cheatsheet of drizzle operators (`eq`, `and`, `like`, `inArray`, `count`, joins, pagination/sorting).
- **External skills** — pair with `bosia-brief-database` (engine choice) and `bosia-drizzle-feature` (schema/seed authoring).
- **Bosia internals** — `registry/features/drizzle/drizzle-index.ts` (engine-aware `db` build), `src/features/ai/tools/db.ts` (`db_test_connection`, `db_status`, etc.).
- **Upstream docs** — verified against `https://orm.drizzle.team/docs/connect-bun-sqlite` + `…/connect-bun-sql` for drizzle-orm 0.44/0.45.
- **Acknowledgement** — `references/query-patterns.md`, `references/performance.md`, and `references/quick-reference.md` adapt content from `bobmatnyc/claude-mpm-skills` (MIT, updated 2025-11-30). The original SKILL.md, query-patterns.md, performance.md, and advanced-schemas.md were rewritten for Bun-only drivers and Bosia loader contexts.
