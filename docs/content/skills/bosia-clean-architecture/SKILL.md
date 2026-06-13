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

Strict 3-layer separation per feature:

```
controller (+page.server.ts / +server.ts)  → imports only *.service.ts
  → service (<name>.service.ts)             → valibot-parse input, business logic, call repository (NEVER db)
    → repository (<name>.repository.ts)      → pure DB layer, drizzle only, no business logic
      → table (<name>.table.ts) + validator (<name>.validator.ts) + dto (<name>.dto.ts)
```

Validators are DERIVED from drizzle tables via `drizzle-valibot` — never hand-rolled. Routes import nothing from `features/drizzle` and never call `db.*`.

## When to use

Adding a feature (scaffold the full folder up-front), adding a table (pick its feature folder first — never `features/drizzle/tables/`), or refactoring a route handler that imports `db`/a `*.table`. Mandatory on every new feature in generated apps; the reference Bosia codebase is grandfathered (apply to new features only).

## Feature folder shape

```
src/features/<name>/
├── <name>.table.ts        # Drizzle table + $inferSelect/$inferInsert
├── <name>.validator.ts    # createInsertSchema/createSelectSchema via drizzle-valibot
├── <name>.dto.ts          # Input/Output types inferred from validators
├── <name>.repository.ts   # Pure DB. Imports singleton `db`. Domain args only — never db/tx params. Transactions wrapped here.
├── <name>.service.ts      # Business logic + valibot validation. Calls repository. NEVER imports db.
└── index.ts               # Barrel: re-exports Service + Repository (namespaced), DTOs, validators, table
```

Cross-feature lives in `src/features/shared/` (types `Paginated<T>`/`Result`, `errors.ts`, reusable valibot primitives, a `paginate` helper, cross-cutting services like mailer/audit/cache). See `references/feature-template.md` and `references/shared-folder.md`.

## Rules

R1 — No `db` import in `src/routes/`. Handlers (`+page.server.ts`, `+server.ts`, `+layout.server.ts`) import SERVICES only — never `db`, `*.table`, or `features/drizzle/*`.

```ts
// ❌ load() { return { menu: await db.select().from(menuItems) }; }  // imports db/table
// ✅ import { MenuService } from "../../features/menu";
//    load() { return { menu: await MenuService.list() }; }
```

Lint: `rg "from .*features/drizzle" src/routes` → zero matches.

R2 — Repositories own `db` (singleton, not injected). Only `*.repository.ts` and `features/drizzle/**` import `db`/tables. The repo imports the `db` singleton directly — NEVER as a parameter. Signature `(…domainArgs) => Promise<Row|Row[]>`; no `locals`/`cookies`/`fetch`/HTTP/business decisions. Multi-statement transactions live INSIDE one repo function via `db.transaction(...)` — never expose `tx` to the service.

```ts
// menu.repository.ts
import { db } from "../drizzle";
import { menuItems } from "./menu.table";
export const listAll = () => db.select().from(menuItems).orderBy(menuItems.id);
export async function createWithAudit(input: MenuInsertDto, actorId: string) {
	return db.transaction(async (tx) => {
		const [row] = await tx.insert(menuItems).values(input).returning();
		await tx.insert(auditLog).values({ actorId, action: "menu.create", refId: row.id });
		return row;
	});
}
```

R3 — Services own logic + validation, never touch `db`. Parse input with valibot, THEN call repository functions; auth checks, business rules, error mapping live here. Never import/pass/call `db`.

```ts
// menu.service.ts
import * as v from "valibot";
import { NotFoundError } from "../shared";
import * as MenuRepository from "./menu.repository";
import { MenuIdSchema } from "./menu.validator";
export const list = () => MenuRepository.listAll();
export async function getById(rawId: unknown) {
	const id = v.parse(MenuIdSchema, rawId);
	const row = await MenuRepository.findById(id);
	if (!row) throw new NotFoundError(`menu:${id}`);
	return row;
}
```

R4 — Validators derived, not hand-written. `createInsertSchema(table)`/`createSelectSchema(table)` from `drizzle-valibot`, refine with `v.pipe/partial/omit`. Never mirror a drizzle table by hand (they drift). Forbidden: `zod` — generated apps standardize on valibot.

```ts
export const MenuRow = createSelectSchema(menuItems);
export const MenuInsert = createInsertSchema(menuItems, {
	name: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
});
export const MenuUpdate = v.partial(MenuInsert);
```

R5 — One entity per feature; cross-feature via service namespace. Cross-feature FKs reference sibling tables directly (drizzle needs the column object). Cross-feature SERVICE calls go through the barrel (`import { OrderService } from "../order"`). A service NEVER calls another feature's repository — repositories are private; service → service so the owner's rules still run. If `UserService` lacks what `AuthService` needs, ADD a method to `UserService` — don't reach into `UserRepository`. A service imports ONLY its own `*.repository.ts`.

R6 — `shared/` = no business entity. Pagination types, error classes, valibot primitives, mailer → `features/shared/`. A domain entity belongs in its own feature folder, never `shared/`.

R7 — New tables declare a home feature. "add a `xyz` table" → first pick/propose the feature folder; the `*.table.ts` colocates with its service/repository. Never write to `features/drizzle/tables/`.

R8 — Barrel exports are the public API. Each `index.ts` re-exports the service (namespace), repository (namespace), DTOs, validators, table. Consumers import from the barrel only.

```ts
// src/features/menu/index.ts
export * as MenuService from "./menu.service";
export * as MenuRepository from "./menu.repository";
export { menuItems } from "./menu.table";
export * from "./menu.validator";
export * from "./menu.dto";
```

R9 — Promote each file type into a folder when it grows past one. Start flat (one of each kind at the feature root). The moment a feature owns 2+ of a kind, promote THAT kind into its subfolder — threshold is per-type and independent (a feature can have flat `auth.table.ts` while services already live under `services/`): Table→`tables/`, Validator→`validators/`, DTO→`dtos/`, Repository→`repositories/`, Service→`services/`. Carries through promotion: the barrel is an unchanged contract (subfolder paths never leak across feature boundaries — cross-feature FKs import the table from the barrel, not `../auth/tables/sessions.table`); service↔repository scoping unchanged; no empty placeholder folders (promote on the second file); demotion allowed.

R10 — Sub-feature folders ONLY when the sub-domain owns its own tables. Don't group by sub-domain (`auth/login/`, `auth/register/`) when they share tables — that duplicates repositories (violates R2). A sub-feature is justified only when it owns its own table(s) (and thus repositories/validators) — then it's a full feature nested one level (e.g. `auth/oauth/` owning `oauth_accounts`), with its own sub-barrel re-exported by the parent barrel. Guardrails: no sub-feature without its own table(s) (`login`/`register`/`forgot-password` are SERVICES under `services/`, R9); sub-features still obey R5 (service→service); one level deep max; parent barrel hides depth (consumers import `../auth`, never `../auth/oauth`); demotion allowed. Decision when a feature grows: 2+ of an existing type → R9 promote; new cluster with its OWN table(s) → R10 sub-feature; new cluster sharing parent tables → still R9 (another service under `services/`).

## Workflows

A. Scaffold a feature ("add menu feature"/"scaffold X"): (1) confirm name (kebab folder, Pascal namespace); (2) ensure `valibot` + `drizzle-valibot` installed, else `shell({ cmd:"add", packages:["valibot","drizzle-valibot"] })`; (3) create the six files from `references/feature-template.md` (stub `id` uuid PK, `createdAt`, `updatedAt`); (4) `db_generate` → `db_migrate` (pre-flight `db_test_connection` if first DB touch — see bosia-drizzle-usage); (5) re-export the table from `src/features/drizzle/schemas.ts`; (6) `shell({ cmd:"check" })` then `format`.

B. Refactor a route violation (`db` import in `src/routes/**`): (1) grep `rg "from .*features/drizzle|db\.(select|insert|update|delete)" src/routes`; (2) identify the entity, pick/create `features/<name>/`; (3) move the query verbatim into `<name>.repository.ts` as a typed function (domain args only; wrap any multi-statement tx in one repo fn); (4) add `<name>.service.ts` calling it (pass-through is fine); (5) replace route code with `await <Name>Service.<fn>(...)`, importing from `../../features/<name>` only; (6) `check` → `format` → `build`. See `references/refactor-recipe.md`.

C. New table ("add a `xyz` table"): infer/ask which feature owns it; no feature → propose `features/<name>/` + run A; existing feature → add `<name2>.table.ts` (or extend) inside it. Never `features/drizzle/tables/`.

## Checklist gate

P0:

- [ ] `rg "from .*features/drizzle" src/routes` → zero; `rg "db\.(select|insert|update|delete)" src/routes` → zero.
- [ ] Every new table in `features/<name>/<name>.table.ts`, not `features/drizzle/tables/`.
- [ ] Every new feature folder has all six files.
- [ ] Validators use `createInsertSchema`/`createSelectSchema`, not hand-written; no `zod`.
- [ ] Services contain no raw `db.*` and don't import `db` at all.
- [ ] Repository signatures never start with `db`/`tx` params (singleton import).
- [ ] Untrusted service input is `v.parse`d before reaching the repository.

P1:

- [ ] Cross-feature calls go through the barrel namespace; services import only their own repository (service → service, never service → other feature's repository).
- [ ] `shared/` has no domain entities.
- [ ] Any file type with 2+ files is promoted to its subfolder (barrel still hides deep paths; cross-feature/FK imports come from the barrel).
- [ ] Sub-feature folders exist only when they own their own tables.
- [ ] Multi-statement flows wrapped in `db.transaction(...)` inside one repository function.
- [ ] `bun run check && bun run format && bun run build` pass.

## References

`references/feature-template.md` (per-file templates), `references/refactor-recipe.md` (grep → extract → swap-import, `warung-nasi` before/after), `references/shared-folder.md`. Pairs with [[bosia-drizzle-feature]] (table authoring, seeds) and [[bosia-drizzle-usage]] (`db` consumer rules at the repository layer). Upstream: drizzle-valibot, valibot.
