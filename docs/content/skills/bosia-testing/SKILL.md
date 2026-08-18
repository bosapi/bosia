---
name: bosia-testing
description: Automated tests for a Bosia app, using Bun's built-in runner and nothing else — `bun test`, `bunfig.toml` preload, `.env.test` layered over `.env` by Bun itself. Never install vitest, jest, playwright or supertest. Test services and repositories against a real throwaway Postgres/SQLite (never a mocked `db`), guard the truncate behind a database name ending in `_test`, and leave every security boundary — auth guards, redirect allow-lists, replay and single-use rules — with a test that fails if it regresses.
triggers:
  - test
  - bun test
  - unit test
  - integration test
  - write a test
  - test coverage
  - .test.ts
  - is this tested
  - regression
od:
  mode: convention
  category: framework
bosia:
  design: false
  requires:
    blocks: []
    themes: []
    components: []
    feats: []
  targets:
    routes: []
  stack: [bun, drizzle, postgres, sqlite]
---

# bosia-testing

## What it does

Gives a Bosia app a test suite without adding a dependency. Bun ships a runner,
an assertion library, mocking, snapshots and lifecycle hooks — the whole reason
this skill exists is that agents reach for `vitest` out of habit and add a
toolchain the runtime already has.

Pairs with:

- [`bosia-clean-architecture`](../bosia-clean-architecture/SKILL.md) — the layering
  is what makes this testable. Services and repositories are plain classes, so
  they are called directly; routes need no HTTP harness to cover their logic.
- [`bosia-security-review`](../bosia-security-review/SKILL.md) — that skill finds
  the boundaries, this one pins them down so they cannot silently regress.
- [`bosia-env`](../bosia-env/SKILL.md) — `.env.test` layering is Bun behaviour,
  not framework behaviour, and is what keeps test config out of dev and prod.

## When to use

Whenever code is added or changed that has a branch worth defending: an auth
guard, a validator, a redirect allow-list, a token lifecycle, money, or anything
whose failure is silent. Also when the user asks "is this tested", or a bug is
fixed — a fix without a failing-then-passing test is a fix that comes back.

## R1 — Bun's runner, never a dependency

`bun test` is the whole toolchain. **Never** add `vitest`, `jest`, `mocha`,
`playwright`, `supertest`, `chai`, `sinon` or `@faker-js/faker`.

| Need       | Use                                                  |
| ---------- | ---------------------------------------------------- |
| assertions | `expect` from `bun:test`                             |
| lifecycle  | `beforeAll` / `beforeEach` / `afterEach`             |
| grouping   | `describe`                                           |
| mocking    | `mock()` / `spyOn()` from `bun:test`                 |
| snapshots  | `expect(x).toMatchSnapshot()`                        |
| HTTP       | `fetch` against a booted server, or call the handler |
| fixtures   | a plain exported function in `test/db.ts`            |

Add one script and stop: `"test": "bun test"`.

## R2 — `.env.test`, and let Bun layer it

`bun test` sets `NODE_ENV=test` on its own, and Bun then loads `.env` followed
by `.env.test`, so the test file only has to carry what **differs**. Do not write
a config loader, do not pass `--env-file`, do not `dotenv`.

Commit `.env.test.example`; gitignore `.env.test` alongside every other real env
file.

## R3 — A real database, never a mocked `db`

Repositories exist to hold queries. A mocked `db` asserts that the mock was
called and proves nothing about the SQL, the constraints, the cascades or the
conditional `UPDATE` that makes something single-use. Point the suite at a
throwaway database and let it run the real statements.

Migrate once, in a preload — module-scope `process.env` reads (`db`, signing
keys) happen at import, which is earlier than any `beforeAll`:

```toml
# bunfig.toml
[test]
preload = ["./test/setup.ts"]
```

```ts
// test/setup.ts
import { migrate } from "drizzle-orm/bun-sql/migrator";

const dbName = new URL(process.env.DATABASE_URL!).pathname.slice(1);
if (!dbName.endsWith("_test")) {
	throw new Error(`Refusing to run against "${dbName}" — the suite truncates every table.`);
}

const { db } = await import("../src/features/drizzle");
await migrate(db as never, { migrationsFolder: "./src/features/drizzle/migrations" });
```

## R4 — Guard the truncate on the database name

`resetDb()` empties every table. A stale shell export, a missing `.env.test`, a
typo — any of them silently points that at the development database. The name
check in R3 is not optional, and it belongs in preload so it runs before a single
statement does.

Read the table list from the catalog rather than writing it down, so a new table
is covered the day it is migrated:

```ts
export async function resetDb(): Promise<void> {
	const rows = await db.execute<{ tables: string | null }>(sql`
		SELECT string_agg(format('%I.%I', schemaname, tablename), ', ') AS tables
		FROM pg_tables WHERE schemaname = 'public'
	`);
	if (rows[0]?.tables)
		await db.execute(sql.raw(`TRUNCATE ${rows[0].tables} RESTART IDENTITY CASCADE`));
}
```

Call it from `beforeEach`, not `afterEach` — a failed test then leaves its rows
on the table for inspection.

## R5 — Secrets are minted per run, never committed

A signing key in a committed fixture is a key someone eventually pastes into a
real `.env`. Generate it in preload when the variable is absent, and leave the
override in place so a test can pin a specific key when it needs to:

```ts
if (!process.env.OIDC_PRIVATE_JWK) {
	const { privateKey } = await crypto.subtle.generateKey(/* … */, true, ["sign", "verify"]);
	process.env.OIDC_PRIVATE_JWK = JSON.stringify(await crypto.subtle.exportKey("jwk", privateKey));
}
```

Fixtures that stand in for credentials must be **real** — hash fixture passwords
with `Bun.password.hash`, because a placeholder makes every login test fail for
the wrong reason.

## R6 — Test the boundary, not the function

For each of these, the test states the attack it prevents:

- **Auth guards** — anonymous, wrong-role, half-authenticated, expired, and
  disabled-mid-session all refused; the legitimate case still passes. Include a
  control assertion, or "everything is refused" passes as a green suite.
- **Enumeration** — a wrong password and an unknown handle must be
  `toEqual`-identical, not merely both falsy.
- **Redirect allow-lists** — assert the near-misses: trailing slash, added query,
  case change, `..` segment, backslash, protocol-relative.
- **Single-use and replay** — spend it twice. If a replay is meant to revoke a
  wider family, assert the _sibling_ token died too, not just that the replay failed.
- **Cascades** — delete the parent, assert the child stopped working through the
  public API rather than by counting rows.

Never assert only the happy path of a security function. The happy path is the
one that already works.

## R7 — Existing `import.meta.main` self-checks are tests; run them

A codebase following the lazy-check convention already carries assertions inside
`if (import.meta.main)` blocks. They do not run on import, so wrap them rather
than rewriting them — one file, and the originals stay next to the code they guard:

```ts
for (const file of SELF_CHECKS) {
	test(`self-check: ${file}`, async () => {
		const proc = Bun.spawn(["bun", "run", file], {
			env: {
				/* explicit */
			},
			stderr: "pipe",
		});
		expect(`${await proc.exited} ${await new Response(proc.stderr).text()}`.trim()).toBe("0");
	});
}
```

Pass an **explicit** env to the subprocess. It re-reads `.env` from scratch and
`NODE_ENV` is not `test` down there, so an inherited environment points anything
that opens a pool at the development database.

## Workflow

1. `bunfig.toml` preload + `test/setup.ts` (migrate, guard, mint keys) + `test/db.ts` (`resetDb`, fixtures).
2. `.env.test` and `.env.test.example`; gitignore the former.
3. Wrap any existing `import.meta.main` self-checks (R7).
4. Write boundary tests for auth, tokens and validators (R6) before breadth.
5. `bun test` → all green. Then run the app's own `check` / `format:check`.

## Anti-patterns

| Do not                                    | Do instead                                     |
| ----------------------------------------- | ---------------------------------------------- |
| `bun add -d vitest`                       | `bun test` — it is already there               |
| mock `db` in a repository test            | run against a `_test` database                 |
| truncate without a name guard             | refuse anything not ending `_test`             |
| commit a signing key fixture              | mint it in preload                             |
| assert only that a failure failed         | assert the sibling/family/cascade died too     |
| a `try/catch` that swallows the assertion | let it throw; the runner reports it            |
| `expect(a).toBeTruthy()` on two failures  | `toEqual` them, so they are provably identical |
