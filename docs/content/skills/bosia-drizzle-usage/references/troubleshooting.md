# Troubleshooting

The failure modes the agent has historically looped on, with the recovery flow for each. Drawn from real Bosapi chat transcripts where the agent jumped from drizzle → raw `bun:sqlite` → path-resolution hacks and never recovered.

## Symptoms → causes → fixes

| Symptom                                                                                                                                                                                                                                                                                                       | Cause                                                                                                                                                                                                            | Fix                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TypeError: db.all is not a function`                                                                                                                                                                                                                                                                         | Called the sqlite-only sync API (`.all(sql\`...\`)`) on the top-level `db`. Bosia's `db`is the engine-aware drizzle instance, not the raw`bun:sqlite` `Database`.                                                | Rewrite to `await db.select(...)...` or `await db.execute(sql\`...\`)`.                                                                                                                                                                                                                                                                                               |
| `TypeError: db.select(...).from(...)...all is not a function`                                                                                                                                                                                                                                                 | Chained the sync `.all()` terminal on the builder. Drizzle exposes it on some shapes and not others; don't rely on it in bosia.                                                                                  | Drop `.all()`. `await` the builder directly — `await db.select(...).from(...)` returns the rows.                                                                                                                                                                                                                                                                      |
| `Error: SQLite not initialized`                                                                                                                                                                                                                                                                               | A helper module (e.g. `sqlAll`, `sqlGet`, `ensureSqlite`) opened a parallel `bun:sqlite` connection lazily, and was called before its `ensureSqlite()` ran.                                                      | Delete the parallel helper. There is exactly one `db` per app — the one exported from `src/features/drizzle`. Everything else is the symptom.                                                                                                                                                                                                                         |
| `Error: unable to open database file` (sqlite-file)                                                                                                                                                                                                                                                           | `DATABASE_URL=sqlite://./data/app.db` resolves relative to the bun process's cwd. `bun run dev` was started from a subdirectory, or a previous "fix attempt" deleted `data/app.db`.                              | (1) Restart `bun run dev` from the project root. (2) If the file is genuinely missing, run `db_migrate` to recreate it via migrations. Do **not** loop through `import.meta.dir` / `process.cwd()` candidates.                                                                                                                                                        |
| Engine appears to change between turns                                                                                                                                                                                                                                                                        | `.env` `DATABASE_URL` was hand-edited mid-session (e.g. swapped from sqlite to postgres without restart).                                                                                                        | Confirm with the user. One engine per app — `bosia-database-setup` R1 / R2. After any `.env` change, restart dev server and re-run `db_test_connection`.                                                                                                                                                                                                              |
| Migrations regenerated unexpectedly                                                                                                                                                                                                                                                                           | The agent deleted `data/` (or `drizzle/migrations/`) to "force a fresh start".                                                                                                                                   | Don't. Migrations + the DB file are **user state**. Reset only with explicit user approval. Recover from git if possible.                                                                                                                                                                                                                                             |
| `Cannot read properties of undefined (reading 'id')` in a loader                                                                                                                                                                                                                                              | Bare `db.select().from(t)` was treated as a single row instead of an array.                                                                                                                                      | Drizzle returns an array. Either index `.then(r => r[0])` or `const [row] = await db.select().from(t).where(...).limit(1)`.                                                                                                                                                                                                                                           |
| TypeScript: `Property 'select' does not exist on type 'BaseSQLiteDatabase<...>'`                                                                                                                                                                                                                              | Old import path or stale type cache.                                                                                                                                                                             | Re-import from `src/features/drizzle` (the aggregator), then run `bun run check`. Restart the TS server in your editor if it persists.                                                                                                                                                                                                                                |
| `Please install either 'better-sqlite3' or '@libsql/client'` (sqlite) — or `To connect to Postgres database - please install either of 'pg' / 'postgres' / '@neondatabase/serverless' / '@vercel/postgres'` — or `To connect to MySQL database - please install either of 'mysql2' / '@planetscale/database'` | All three are the same bug: the app's `package.json` `db:migrate` script is the legacy `drizzle-kit migrate`. drizzle-kit's CLI demands a Node driver per dialect; none are bun-native and none ship with Bosia. | Update the app's `package.json` `db:migrate` script to `bun run src/features/drizzle/migrate.ts`. The runner ships in the Bosia 0.6.3+ scaffold (`registry/features/drizzle/drizzle-migrate.ts`) and dispatches on engine via `drizzle-orm/bun-sqlite/migrator` or `drizzle-orm/bun-sql/migrator`. Do **not** install the Node drivers — defeats the bun-only stance. |
| `no such table` at runtime even though `db_query` returns rows for that table                                                                                                                                                                                                                                 | Stale `db` singleton. The dev server cached its sqlite handle from before the migration ran; new tables aren't visible to the running process.                                                                   | `runtime_restart` to drop the cached singleton. Do **not** add `CREATE TABLE IF NOT EXISTS` to a `load()` to work around it. Do **not** reach for `bun:sqlite`.                                                                                                                                                                                                       |

## Where the SQLite file actually lives (Bosapi-hosted apps)

> If you are an AI agent editing inside Bosapi, **read this twice** — this is the single most common path-resolution loop.

Bosapi (the host) lives at `/Users/jekibus/products/bosapi/code/bosapi`. Each generated user app runs in its **own** directory under Bosapi's `data/users/` tree:

```
/Users/jekibus/products/bosapi/code/bosapi/                            ← Bosapi host (the editor itself)
└── data/
    └── users/
        └── <userId>/                                                  ← e.g. 14e04fd8-d925-469b-9fe3-194716ae43fa
            └── <projectSlug>/                                         ← e.g. proyek-satu
                └── <appSlug>/                                         ← e.g. toko-preloved   ← THIS is the app's cwd
                    ├── .env                                           ← contains DATABASE_URL
                    ├── data/
                    │   └── app.db                                     ← sqlite file lives HERE
                    ├── drizzle/
                    └── src/
```

When the app's `.env` says `DATABASE_URL=sqlite://./data/app.db`, the path resolves relative to **the app's own directory**, not Bosapi's:

- ✅ Correct: `…/data/users/14e04fd8-…/proyek-satu/toko-preloved/data/app.db`
- ❌ Wrong (real observed mistake): `…/code/bosapi/data/toko-preloved.db` — that's the host's data dir, not the app's. The app will never find it.

The path `./data/app.db` in the `.env` is **already correct**. Don't "fix" it. Don't put the DB file at Bosapi's root data dir. Don't try absolute paths. Don't append the app slug to the filename to "namespace" it across apps — each app has its own folder and its own `data/`.

If the connection fails:

1. `db_status` reports the resolved cwd + url. Compare against the structure above.
2. If `db_test_connection` is red, the fix is almost never an `.env` edit. It's that `bun run dev` was started from the wrong directory or the `data/` subfolder was deleted by an earlier "fix attempt".
3. To recreate the DB file: `db_migrate` from inside the app dir. Migrations rebuild the schema; seeds repopulate.

Inside the app, code should still import the singleton — never re-derive the path:

```ts
// ✅ Inside any +page.server.ts / service in the app
import { db } from "../../features/drizzle";

// ❌ Never inside a user-app file
import { Database } from "bun:sqlite";
const db = new Database("/Users/jekibus/products/bosapi/code/bosapi/data/toko-preloved.db");
```

The Bosapi-side `db_*` tools (`db_status`, `db_test_connection`, `db_schema`, `db_migrate`) already know to run against the active app's cwd. Use them — don't replicate path logic in the app.

## Recovery flow

When a DB-touching change throws at runtime:

1. **Stop editing.** Don't add a new helper. Don't import `bun:sqlite`.
2. Run `db_status`. Confirm engine matches what the user picked.
3. Run `db_test_connection`. Green = connection fine, problem is in your loader. Red = connection issue; see the table above.
4. Re-read the loader file you just wrote. Look for `.all()`, `.get()`, raw `bun:sqlite` imports, ad-hoc path resolution — that's almost always the cause.
5. Rewrite using the pattern in `SKILL.md` Quick Start. Pure `await` on the builder.
6. `shell({ cmd: "build" })` to surface type errors before reloading.

## Anti-patterns observed in real sessions

These are the loops to **not** repeat:

- **The `bun:sqlite` reach.** When drizzle "doesn't work", the agent reaches for `new Database(path)` directly. This always makes things worse: it opens a second handle to the same file (sqlite-file), it bypasses the schema metadata that `db.query.*` relies on, and it requires manual path resolution that gets wrong every time.
- **The `process.cwd()` shell game.** Trying `data/app.db`, then `./data/app.db`, then `../data/app.db`, then `import.meta.dir + "/data/app.db"`, then writing a helper that tries all of them. The file is fine. The cwd is wrong. The fix is to restart the dev server from the project root, not to make the code more clever.
- **The `.env` rewrite.** When `db_test_connection` fails, the agent edits `DATABASE_URL`. Don't. Confirm with the user before touching `.env` — engine choice is a brief decision, not a debugging knob.
- **The `data/` purge.** When sqlite says "unable to open database file", the agent deletes `data/` and recreates it. The user just lost their seed data. Never delete user state to make an error go away.
- **The `.all()` retry.** First call fails with "not a function" → agent tries `.all({})`, then `.all([])`, then `(db as any).all(...)`. The terminal does not exist on this builder shape. Drop it; `await` is the terminal.
- **The double drizzle factory.** Importing `drizzle` from `drizzle-orm/bun-sqlite` and constructing a second instance "to be sure". You now have two query loggers, two schema registrations, two prepared-statement caches, and identical bugs in two places. There is one `db`. Import it.
- **The `load()`-DDL workaround.** When `db:migrate` fails, the agent shoves `CREATE TABLE IF NOT EXISTS` + inline seed inserts into `+page.server.ts`. This races between concurrent requests, runs on every navigation, and means the real migration never gets stored — the next `db_generate` won't see the schema as authored. Fix the migration script first (see the symptom table — almost always the legacy `drizzle-kit migrate` line). DDL lives in `src/features/drizzle/migrations/`, never in a request handler.
- **The `raw` export.** When drizzle "feels limited", the agent edits `src/features/drizzle/index.ts` to also export the underlying `bun:sqlite` `Database` (often named `raw` or `sqlite`). Once exported, every consumer file starts reaching past drizzle: schema awareness lost, query logger lost, prepared-statement cache split between the two handles. The fix is never "expose the inner handle" — it's to use the right drizzle API (`db.execute(sql\`...\`)`, `db.transaction(async (tx) => { ... })`, `db.run(sql\`...\`)` for sqlite DDL, etc.).

## When to ask the user instead of guessing

- Engine change suspected (`.env` edits, fresh repo clone) → confirm intended engine.
- DB file missing → confirm whether to restore from migrations/seeds or treat as data loss.
- Migration appears to be diverged from schema → confirm before regenerating; never delete applied migrations.
- Query returns unexpected shape → ask which projection the user wanted, don't reshape silently.

Asking once is cheaper than three turns of `import.meta.dir` candidates.
