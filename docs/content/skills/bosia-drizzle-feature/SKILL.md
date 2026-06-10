---
name: bosia-drizzle-feature
description: Feature-folder layout for Drizzle — `*.table.ts` + `*.repository.ts` + `*.service.ts` + `*.validator.ts` + `*.dto.ts` + idempotent numbered seeds. Layered split is mandatory (see `bosia-clean-architecture`). Seeds are immutable once applied; add a new numbered file for changes.
triggers:
  - new feature
  - db schema
  - add table
  - seed data
  - migration
  - schema
  - drizzle
  - table.ts
  - uuid
  - primary key
  - timestamp
  - created_at
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
  stack: [drizzle, elysia-routes]
---

# bosia-drizzle-feature

## What it builds

A feature folder containing tables, derived validators, DTOs, a pure repository, a service layer, and seed data wired into the Drizzle runtime.

```
src/features/<feature>/
├── <feature>.table.ts        # Drizzle schema
├── <feature>.validator.ts    # createInsertSchema / createSelectSchema via drizzle-valibot
├── <feature>.dto.ts          # Public Input/Output types inferred from validators
├── <feature>.repository.ts   # Pure DB layer — drizzle calls only
├── <feature>.service.ts      # Business logic + valibot parse, calls repository
├── schemas/                  # additional related tables (when an aggregate has many tables)
└── index.ts                  # re-exports Service, Repository, table, validators, DTOs
```

Seeds live in `src/features/drizzle/seeds/NNN_*.ts`.

The repository/service split is mandatory. See [`bosia-clean-architecture`](../bosia-clean-architecture/SKILL.md) for layering rules, the full template, and refactor recipes.

## When to use

- Adding a new resource (table + service + seed).
- Extending an existing feature with new tables or seed data.

## Rules

### R1 — Table files end in `.table.ts`

The seed runner / migration generator picks tables up by filename suffix.

```ts
// src/features/students/students.table.ts
import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";
export const students = pgTable("students", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: varchar("name", { length: 200 }).notNull(),
	schoolId: uuid("school_id").notNull(),
});
```

### R2 — Repository owns DB calls; service owns logic

Two files, two responsibilities. The repository is the **only** place that imports `db` and the **only** place that calls `db.select/insert/update/delete` for a feature. The service parses input with valibot, then calls repository functions with **domain args only** (no `db`, no `tx`). Auth checks and error mapping live in the service; transactions are wrapped inside one repository function via `db.transaction(...)`. Auth contextual data (user id, scope) is passed in from the caller — the service does not read `locals`.

```ts
// students.repository.ts — pure DB layer, owns the db singleton
import { eq } from "drizzle-orm";
import { db } from "../drizzle";
import { students } from "./students.table";

export async function listBySchool(schoolId: string) {
	return db.select().from(students).where(eq(students.schoolId, schoolId));
}
```

```ts
// students.service.ts — business logic + validation, NEVER imports db
import * as v from "valibot";
import { uuidSchema } from "../shared";
import * as StudentsRepository from "./students.repository";

export async function listBySchool(rawSchoolId: unknown) {
	const schoolId = v.parse(uuidSchema, rawSchoolId);
	return StudentsRepository.listBySchool(schoolId);
}
```

Auth lives in the caller (`+server.ts` / loader) and is passed into the service as arguments — never read from `locals` inside service code.

Full template: [`bosia-clean-architecture` → feature-template](../bosia-clean-architecture/references/feature-template.md).

### R3 — Seeds: immutable & numbered

- Filename: `NNN_short_name.ts` — `001_rbac_bootstrap.ts`, `002_admin_password.ts`, `003_demo_foundations.ts`.
- Each seed exports `async function seed(db: Db): Promise<void>`.
- **Never** edit an applied seed. The runner records applied filenames in `drizzle.__bosia_seeds`; edits silently drift.
- Change/extend data? → **new** numbered file (`004_*.ts`).

### R4 — Idempotency

Every seed must be re-runnable safely. Pattern:

```ts
const existing = await db.select({ id: foo.id }).from(foo).where(eq(foo.key, KEY)).limit(1);
if (existing[0]) return existing[0].id;
// else insert
```

Use `onConflictDoNothing()` for many-to-many link tables.

### R5 — Seed discovery

`src/features/drizzle/seeds/runner.ts` discovers seeds via `Bun.Glob` against `NNN_*.ts`. New file → automatic pickup. No registry to update.

### R6 — Foreign keys live in the table file

Don't add FKs in seeds. Declare in `*.table.ts` via `.references(() => other.id, { onDelete: 'cascade' })`.

### R7 — Primary keys are UUID (pg AND sqlite)

Inner apps have shipped `int autoincrement` PKs; that's wrong. Primary keys are always UUID, regardless of engine:

```ts
// Postgres
import { pgTable, uuid } from "drizzle-orm/pg-core";
id: uuid("id").primaryKey().defaultRandom(),

// SQLite — there is no native uuid type, store as TEXT
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
```

Never `integer().primaryKey({ autoIncrement: true })` — IDs leak row counts and break cross-environment sync.

### R8 — `created_at` / `updated_at` use the `sql` template, not a string literal

**Wrong** — Drizzle inserts the literal string `'CURRENT_TIMESTAMP'` and the column type becomes text:

```ts
createdAt: timestamp("created_at").default("CURRENT_TIMESTAMP"),
```

**Right** — import `sql` from `drizzle-orm` and use a tagged template:

```ts
import { sql } from "drizzle-orm";

// Postgres
createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),

// SQLite
createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
```

For app-side updates of `updatedAt`, use `.$onUpdate(() => new Date())`.

### R9 — Migrations are generated, not hand-edited

`bun run db:generate` produces `drizzle/migrations/NNNN_*.sql`. Once committed, treat as historical record — same rule as seeds.

## Workflow

1. Add `*.table.ts` with schema.
2. Run `bun run db:generate`.
3. Apply: `bun run db:migrate`.
4. Add `*.validator.ts` (derived via `drizzle-valibot`) and `*.dto.ts`.
5. Add `*.repository.ts`. Import the `db` singleton (`import { db } from "../drizzle"`). Functions take **domain args only** — never `db` / `tx` as a parameter. Wrap any multi-statement write inside one function with `db.transaction(...)`.
6. Add `*.service.ts` that parses inputs with valibot and calls the repository. **Service must not import `db`.**
7. If demo / bootstrap data needed → new numbered seed.
8. Run `bun run db:seed` to apply.
9. Re-export Service, Repository, table, validators, and DTOs from `index.ts`.

## Anti-patterns

- Editing `001_rbac_bootstrap.ts` to change the admin email (add `004_change_admin.ts` instead).
- Renumbering seed files to "reorder".
- Combining DB calls and business logic in one `*.service.ts` file (no separate repository). The split is mandatory; see [`bosia-clean-architecture`](../bosia-clean-architecture/SKILL.md).
- Importing `db` inside a `*.service.ts` file (even to pass into a repo call). Repositories own the singleton; services pass domain args only.
- Repository function with a `db: Database` / `tx` parameter. Repos import the singleton; transactions live inside one repo function via `db.transaction(...)`.
- Hand-writing a valibot schema that mirrors a drizzle table instead of using `createInsertSchema` / `createSelectSchema` from `drizzle-valibot`.
- Putting auth checks (`if (locals.user.role !== 'admin')`) in service functions. Pass authorization decisions in from the caller.
- Defining FKs in seeds rather than tables.
- Skipping idempotency — "it'll only run once anyway".

## Checklist gate

P0:

- [ ] All tables in `*.table.ts` files.
- [ ] No applied seed file edited.
- [ ] Every seed is idempotent (re-runnable).
- [ ] Migration generated for schema change.

P1:

- [ ] Repository functions are pure DB calls (no `locals`, no HTTP, no business logic). Signature takes domain args only — never `db: Database` / `tx`.
- [ ] Repository imports `db` from `../drizzle`; service does **not** import `db` from anywhere.
- [ ] Service functions parse untrusted input via `v.parse(...)` before calling the repository.
- [ ] Validators are derived from drizzle tables, not hand-written.
- [ ] Many-to-many seeds use `onConflictDoNothing()`.
- [ ] Feature folder re-exports through `index.ts`.

## See also

- [`bosia-clean-architecture`](../bosia-clean-architecture/SKILL.md) — the layering rules this skill conforms to, plus refactor recipes for legacy features that combined repo + service.
- [`bosia-drizzle-usage`](../bosia-drizzle-usage/SKILL.md) — the `db` consumer rules that apply inside repository functions.
