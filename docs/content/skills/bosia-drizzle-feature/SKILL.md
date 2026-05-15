---
name: bosia-drizzle-feature
description: Feature-folder layout for Drizzle — `*.table.ts` + service + idempotent numbered seeds. Seeds are immutable once applied; add a new numbered file for changes.
triggers:
    - new feature
    - db schema
    - add table
    - seed data
    - migration
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

A feature folder containing tables, service functions, and seed data wired into the Drizzle runtime.

```
src/features/<feature>/
├── <feature>.table.ts        # Drizzle schema
├── <feature>.service.ts      # query functions
├── repository.ts (optional)  # multi-table queries
├── schemas/                  # additional related tables
└── index.ts                  # re-exports for consumers
```

Seeds live in `src/features/drizzle/seeds/NNN_*.ts`.

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

### R2 — Service exports pure async functions

Service functions accept `db` (or use the singleton import) and a typed argument record. No HTTP, no `locals`, no auth.

```ts
// students.service.ts
export async function listBySchool(db: Db, schoolId: string) {
	return db.select().from(students).where(eq(students.schoolId, schoolId));
}
```

Auth lives in the caller (`+server.ts` / loader).

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

### R7 — Migrations are generated, not hand-edited

`bun run db:generate` produces `drizzle/migrations/NNNN_*.sql`. Once committed, treat as historical record — same rule as seeds.

## Workflow

1. Add `*.table.ts` with schema.
2. Run `bun run db:generate`.
3. Apply: `bun run db:migrate`.
4. Add service functions in `*.service.ts`.
5. If demo / bootstrap data needed → new numbered seed.
6. Run `bun run db:seed` to apply.
7. Re-export from `index.ts` for consumers.

## Anti-patterns

- Editing `001_rbac_bootstrap.ts` to change the admin email (add `004_change_admin.ts` instead).
- Renumbering seed files to "reorder".
- Putting auth checks in service functions.
- Defining FKs in seeds rather than tables.
- Skipping idempotency — "it'll only run once anyway".

## Checklist gate

P0:

- [ ] All tables in `*.table.ts` files.
- [ ] No applied seed file edited.
- [ ] Every seed is idempotent (re-runnable).
- [ ] Migration generated for schema change.

P1:

- [ ] Service functions are pure (no `locals`, no HTTP).
- [ ] Many-to-many seeds use `onConflictDoNothing()`.
- [ ] Feature folder re-exports through `index.ts`.
