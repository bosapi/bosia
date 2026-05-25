---
name: bosia-clean-architecture
description: Strict controller → service → repository layering per feature. Routes never import `db` or tables. Validators derived from drizzle tables via valibot. Scaffolds new features and refactors violations.
triggers:
    - new feature
    - clean architecture
    - layered architecture
    - service layer
    - repository layer
    - controller service repository
    - db in route
    - db in loader
    - +page.server.ts db
    - valibot validator
    - drizzle-valibot
    - refactor route handler
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
    stack: [drizzle, valibot, drizzle-valibot, elysia-routes]
---

# bosia-clean-architecture

## What it builds

A feature folder enforcing **strict 3-layer separation**:

```
controller (+page.server.ts / +server.ts)
    │  imports only `*.service.ts`
    ▼
service  (<name>.service.ts)
    │  parses input with valibot, runs business logic, calls repository
    ▼
repository  (<name>.repository.ts)
    │  pure DB layer — drizzle calls only, no business logic
    ▼
table  (<name>.table.ts)  +  validator  (<name>.validator.ts)  +  dto  (<name>.dto.ts)
```

Validators are **derived** from drizzle tables via `drizzle-valibot` — never hand-rolled. Routes import nothing from `features/drizzle` and never call `db.*` directly.

Pairs with:

- [`bosia-drizzle-feature`](../bosia-drizzle-feature/SKILL.md) — table authoring, seeds, migrations.
- [`bosia-drizzle-usage`](../bosia-drizzle-usage/SKILL.md) — `db` consumer rules at the repository layer.

## When to use

- **Adding a new feature** (table + service + route surface). Scaffold the full folder up-front.
- **Adding a new table.** Pick or propose the feature folder first — never drop a table into `features/drizzle/tables/`.
- **Refactoring a route handler** that imports `db` or a `*.table` file. Extract into repository + service.

For generated apps (Bosapi-built apps under `data/users/.../<appSlug>/`) this skill is mandatory on every new feature. The reference Bosapi codebase (`bosapi/src/features/`) is grandfathered — apply the rule to **new** features there going forward.

## Feature folder shape

```
src/features/<name>/
├── <name>.table.ts        # Drizzle pgTable + $inferSelect / $inferInsert
├── <name>.validator.ts    # createInsertSchema / createSelectSchema via drizzle-valibot
├── <name>.dto.ts          # Public Input/Output types inferred from validators
├── <name>.repository.ts   # Pure DB layer: (db: Database, …) => Promise<Row>. No business logic.
├── <name>.service.ts      # Business logic. Validates with valibot. Calls repository. No raw db.select.
└── index.ts               # Barrel: re-exports Service, Repository (namespaced), DTOs, validators, table
```

Cross-feature:

```
src/features/shared/
├── types.ts          # Paginated<T>, Result<T,E>, common ID brand
├── errors.ts         # AppError / NotFoundError / ValidationError
├── validators.ts     # Reusable valibot primitives (uuidSchema, slugSchema, paginationSchema)
├── repository.ts     # Database type re-export, withTx, paginate helper
├── services/         # Cross-cutting services (mailer, audit, cache) — no entity owner
└── index.ts
```

See [`references/feature-template.md`](./references/feature-template.md) for full copy-adapt templates of every file, and [`references/shared-folder.md`](./references/shared-folder.md) for what does (and does not) belong in `shared/`.

## Rules

### R1 — No `db` import in `src/routes/`

Route handlers (`+page.server.ts`, `+server.ts`, `+layout.server.ts`) import **services only**. Never `db`, never `*.table` files, never `features/drizzle/*`.

```ts
// ❌ src/routes/(public)/+page.server.ts  — VIOLATION
import { db } from "../../features/drizzle";
import { menuItems } from "../../features/drizzle/tables/menu.table";
export async function load() {
	return { menu: await db.select().from(menuItems).orderBy(menuItems.id) };
}

// ✅ src/routes/(public)/+page.server.ts
import { MenuService } from "../../features/menu";
export async function load() {
	return { menu: await MenuService.list() };
}
```

Lint hint: `rg "from .*features/drizzle" src/routes` should return zero matches.

### R2 — Repositories own `db`

Only `*.repository.ts` files and `src/features/drizzle/**` may import `db` or table objects. Repository signature is `(db: Database, …args) => Promise<Row | Row[]>`. No `locals`, no `cookies`, no `fetch`, no HTTP, no business decisions.

```ts
// menu.repository.ts
import { eq } from "drizzle-orm";
import type { Database } from "../shared";
import { menuItems } from "./menu.table";

export async function listAll(db: Database) {
	return db.select().from(menuItems).orderBy(menuItems.id);
}

export async function findById(db: Database, id: string) {
	const [row] = await db.select().from(menuItems).where(eq(menuItems.id, id)).limit(1);
	return row ?? null;
}
```

### R3 — Services own logic + validation

Service entry points parse input with valibot, **then** call repository functions. Auth checks, business rules, error mapping, transaction orchestration all live here. Never call `db.select(...)` directly in a service — go through the repository.

```ts
// menu.service.ts
import * as v from "valibot";
import { db } from "../drizzle";
import { NotFoundError } from "../shared";
import * as MenuRepository from "./menu.repository";
import { MenuIdSchema } from "./menu.validator";

export async function list() {
	return MenuRepository.listAll(db);
}

export async function getById(rawId: unknown) {
	const id = v.parse(MenuIdSchema, rawId);
	const row = await MenuRepository.findById(db, id);
	if (!row) throw new NotFoundError(`menu:${id}`);
	return row;
}
```

### R4 — Validators derived, not hand-written

Use `createInsertSchema(table)` / `createSelectSchema(table)` from `drizzle-valibot`. Refine with `v.pipe(...)` / `v.partial(...)` / `v.omit(...)`. Never hand-roll a schema that mirrors a drizzle table — the two will drift.

```ts
// menu.validator.ts
import { createInsertSchema, createSelectSchema } from "drizzle-valibot";
import * as v from "valibot";
import { uuidSchema } from "../shared";
import { menuItems } from "./menu.table";

export const MenuRow = createSelectSchema(menuItems);
export const MenuInsert = createInsertSchema(menuItems, {
	name: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
});
export const MenuUpdate = v.partial(MenuInsert);
export const MenuIdSchema = uuidSchema;
```

Forbidden: `zod`. Bosia generated apps standardize on valibot for bundle size and tree-shake.

### R5 — One entity per feature; cross-feature via service namespace

Tables belonging to one aggregate live in one feature folder. Cross-feature **FKs** reference sibling tables directly (drizzle needs the column object). Cross-feature **service** calls go through the barrel: `import { OrderService } from "../order"` then `OrderService.create(...)`. Never deep-import another feature's repository or table file.

### R6 — `shared/` = no business entity

If something has no clear owner feature, it goes in `features/shared/`. Examples: pagination types, error classes, valibot primitives, `withTx` transaction helper, mailer service. If you find yourself adding a domain entity to `shared/`, stop — give it a feature folder. Full guidance: [`references/shared-folder.md`](./references/shared-folder.md).

### R7 — New tables must declare a home feature

When the user asks "add a `xyz` table", the skill's first move is to pick (or propose) the feature folder. Never write to `features/drizzle/tables/`. The `*.table.ts` file is colocated with its service and repository.

### R8 — Barrel exports are the public API

Each feature's `index.ts` re-exports the service (as a namespace), the repository (as a namespace, for tests/composition), DTOs, validators, and the table. Consumers import from the barrel only.

```ts
// src/features/menu/index.ts
export * as MenuService from "./menu.service";
export * as MenuRepository from "./menu.repository";
export { menuItems } from "./menu.table";
export * from "./menu.validator";
export * from "./menu.dto";
```

## Workflows

### A. Scaffold a new feature

Trigger phrases: "add menu feature", "new resource", "scaffold X".

1. Confirm feature name. Kebab-case → folder. PascalCase → namespace.
2. Ensure `valibot` + `drizzle-valibot` installed. If not, run `shell({ cmd: "add", packages: ["valibot", "drizzle-valibot"] })` (the existing tool at `bosapi/src/features/ai/tools/shell.ts`).
3. Create the six files from [`references/feature-template.md`](./references/feature-template.md). Stub `id` (uuid PK), `createdAt`, `updatedAt`.
4. `db_generate` → `db_migrate` → `runtime_restart` (pre-flight `db_test_connection` if first DB touch this session — see `bosia-drizzle-usage`).
5. Re-export the new table from `src/features/drizzle/schemas.ts`.
6. `shell({ cmd: "check" })` then `shell({ cmd: "format" })`.

### B. Refactor a route-handler violation

Trigger: `db` import found in `src/routes/**/*.server.ts` or `+server.ts`.

1. Grep: `rg "from .*features/drizzle|db\.(select|insert|update|delete)" src/routes`.
2. For each hit, identify the entity. Pick (or create) `features/<name>/`.
3. Move the drizzle query verbatim into `<name>.repository.ts` as a typed function. Repository signature is `(db: Database, …) => Promise<…>`.
4. Add `<name>.service.ts` that calls the repository. Pass-through is fine for now — the layer exists so future validation/auth has a home.
5. Replace the route code with `await <Name>Service.<fn>(...)`. Imports come from `../../features/<name>` only.
6. `shell({ cmd: "check" })` → `shell({ cmd: "format" })` → `shell({ cmd: "build" })`.

Full before/after walkthrough with the `warung-nasi` example: [`references/refactor-recipe.md`](./references/refactor-recipe.md).

### C. New table / new schema decision

When the user says "add a `xyz` table":

1. Ask (or infer): which feature owns this?
2. If no feature exists → propose creating `features/<name>/` and run workflow A.
3. If a feature exists → add `<name2>.table.ts` (or extend the existing table file) inside that feature. Never write to `features/drizzle/tables/`.

## Anti-patterns

- Loader importing `db` directly: `import { db } from "../../features/drizzle"` inside `+page.server.ts`.
- Loader importing a `*.table` file: `import { menuItems } from "../../features/drizzle/tables/menu.table"`.
- Combining DB calls + business logic in one `*.service.ts` (no separate repository).
- Hand-writing a valibot schema that mirrors a drizzle table instead of using `createInsertSchema` / `createSelectSchema`.
- Deep-importing another feature's repository (`import { create } from "../order/order.repository"`). Use `OrderService.create(...)` via the barrel.
- Stashing tables in `features/drizzle/tables/` (the bosapi-internal location). Generated-app tables live in their owning feature folder.
- Putting a domain entity in `features/shared/` ("UserService is used everywhere"). It still has an owner — `features/user/`.
- Using `zod` instead of `valibot`.
- Combining repository + service into a single file "because it's only one query" — the layer separation is the rule, even when trivial.

## Checklist gate

P0 — must pass before finishing:

- [ ] `rg "from .*features/drizzle" src/routes` → zero matches.
- [ ] `rg "db\.(select|insert|update|delete)" src/routes` → zero matches.
- [ ] Every new table sits in a `features/<name>/<name>.table.ts`, not `features/drizzle/tables/`.
- [ ] Every new feature folder contains all six files (`*.table`, `*.validator`, `*.dto`, `*.repository`, `*.service`, `index.ts`).
- [ ] Validators use `createInsertSchema` / `createSelectSchema` from `drizzle-valibot`, not hand-written.
- [ ] Services do not contain raw `db.select(...)` / `db.insert(...)` / `db.update(...)` / `db.delete(...)`.
- [ ] Service input from untrusted sources is `v.parse(...)`d before reaching the repository.

P1 — should pass:

- [ ] Cross-feature calls go through the barrel namespace (`OtherService.fn(...)`), no deep imports.
- [ ] `shared/` contains no domain entities.
- [ ] Multi-statement service flows use `withTx` from `features/shared/repository.ts`.
- [ ] `bun run check && bun run format && bun run build` pass.

## References

- [`references/feature-template.md`](./references/feature-template.md) — copy-adapt template for every file in a feature folder.
- [`references/refactor-recipe.md`](./references/refactor-recipe.md) — step-by-step grep → extract → swap-import recipe with `warung-nasi` before/after.
- [`references/shared-folder.md`](./references/shared-folder.md) — what belongs in `features/shared/` and what does not.
- **External skills** — pair with [`bosia-drizzle-feature`](../bosia-drizzle-feature/SKILL.md) (table authoring, seeds) and [`bosia-drizzle-usage`](../bosia-drizzle-usage/SKILL.md) (the `db` consumer rules that apply inside the repository layer).
- **Upstream docs** — [`drizzle-valibot`](https://orm.drizzle.team/docs/zod) (same API surface as drizzle-zod), [`valibot`](https://valibot.dev/guides/introduction/).
