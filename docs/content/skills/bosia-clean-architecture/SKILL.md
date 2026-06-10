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
├── <name>.repository.ts   # Pure DB layer. Imports singleton `db` directly. Functions take domain args only — never `db`/`tx` params. Wrap transactions inside the repo with `db.transaction(...)`.
├── <name>.service.ts      # Business logic. Validates with valibot. Calls repository. NEVER imports `db`. No raw db.select.
└── index.ts               # Barrel: re-exports Service, Repository (namespaced), DTOs, validators, table
```

When any file type reaches **2+ files** (tables, validators, dtos, repositories, or services), promote that kind into its own subfolder (`tables/`, `validators/`, `dtos/`, `repositories/`, `services/`). The threshold is per-type and independent — see [R9](#r9--promote-each-file-type-into-a-folder-when-it-grows-past-one).

Cross-feature:

```
src/features/shared/
├── types.ts          # Paginated<T>, Result<T,E>, common ID brand
├── errors.ts         # AppError / NotFoundError / ValidationError
├── validators.ts     # Reusable valibot primitives (uuidSchema, slugSchema, paginationSchema)
├── repository.ts     # Database type re-export, paginate helper. (No `withTx` — transactions live inside repository functions via `db.transaction(...)`.)
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

### R2 — Repositories own `db` (singleton, not injected)

Only `*.repository.ts` files and `src/features/drizzle/**` may import `db` or table objects. The repository imports the `db` singleton directly — **never** as a function parameter. Repository signature is `(…args) => Promise<Row | Row[]>`. No `locals`, no `cookies`, no `fetch`, no HTTP, no business decisions.

```ts
// menu.repository.ts
import { eq } from "drizzle-orm";
import { db } from "../drizzle";
import { menuItems } from "./menu.table";

export async function listAll() {
	return db.select().from(menuItems).orderBy(menuItems.id);
}

export async function findById(id: string) {
	const [row] = await db.select().from(menuItems).where(eq(menuItems.id, id)).limit(1);
	return row ?? null;
}
```

Multi-statement transactions live **inside** the repository — wrap with `db.transaction(...)` in a single repo function. Never expose `tx` to the service layer.

```ts
// menu.repository.ts
export async function createWithAudit(input: MenuInsertDto, actorId: string) {
	return db.transaction(async (tx) => {
		const [row] = await tx.insert(menuItems).values(input).returning();
		await tx.insert(auditLog).values({ actorId, action: "menu.create", refId: row.id });
		return row;
	});
}
```

### R3 — Services own logic + validation, never touch `db`

Service entry points parse input with valibot, **then** call repository functions. Auth checks, business rules, error mapping all live here. Services **never import `db`**, never pass `db`, never call `db.*` directly — every database touch goes through a repository function whose signature takes only domain args.

```ts
// menu.service.ts
import * as v from "valibot";
import { NotFoundError } from "../shared";
import * as MenuRepository from "./menu.repository";
import { MenuIdSchema } from "./menu.validator";

export async function list() {
	return MenuRepository.listAll();
}

export async function getById(rawId: unknown) {
	const id = v.parse(MenuIdSchema, rawId);
	const row = await MenuRepository.findById(id);
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

**A service NEVER calls another feature's repository.** Repositories are private to their own feature. Cross-feature data access goes service → service, so the owning feature's business rules (auth checks, validation, side effects) still run. Skipping the sibling service bypasses that contract and turns the caller into a second source of truth for the callee's data.

```ts
// ❌ auth.service.ts — VIOLATION: reaches into user's repository
import * as UserRepository from "../user/user.repository";

export async function login(email: string, password: string) {
	const user = await UserRepository.findByEmail(email); // skips UserService rules
	// ...
}

// ✅ auth.service.ts — call the sibling service
import { UserService } from "../user";

export async function login(email: string, password: string) {
	const user = await UserService.getByEmail(email);
	// ...
}
```

If `UserService` doesn't expose what `AuthService` needs, **add a method to `UserService`** (or surface a narrow DTO from it). Do not reach past it into `UserRepository`. A service may only import its own `*.repository.ts`.

### R6 — `shared/` = no business entity

If something has no clear owner feature, it goes in `features/shared/`. Examples: pagination types, error classes, valibot primitives, mailer service. If you find yourself adding a domain entity to `shared/`, stop — give it a feature folder. Full guidance: [`references/shared-folder.md`](./references/shared-folder.md).

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

### R9 — Promote each file type into a folder when it grows past one

Start flat: one `*.table.ts`, one `*.validator.ts`, one `*.dto.ts`, one `*.repository.ts`, one `*.service.ts` at the feature root. Promote a file type into its own subfolder the moment that feature owns **two or more** of that kind. The threshold is **per file type, independent**: a feature can have one flat `auth.table.ts` while its services already live under `services/`.

| File type  | Flat (1 file)        | Promoted (2+ files)            |
| ---------- | -------------------- | ------------------------------ |
| Table      | `auth.table.ts`      | `tables/*.table.ts`            |
| Validator  | `auth.validator.ts`  | `validators/*.validator.ts`    |
| DTO        | `auth.dto.ts`        | `dtos/*.dto.ts`                |
| Repository | `auth.repository.ts` | `repositories/*.repository.ts` |
| Service    | `auth.service.ts`    | `services/*.service.ts`        |

Fully-promoted feature:

```
src/features/auth/
├── tables/
│   ├── session.table.ts
│   ├── token.table.ts
│   └── credential.table.ts
├── validators/
│   ├── login.validator.ts
│   └── signup.validator.ts
├── dtos/
│   ├── login.dto.ts
│   └── signup.dto.ts
├── repositories/
│   ├── session.repository.ts
│   ├── token.repository.ts
│   └── credential.repository.ts
├── services/
│   ├── login.service.ts
│   ├── signup.service.ts
│   └── password-reset.service.ts
└── index.ts                 # barrel — still the only public entry point
```

Mixed example (services promoted, everything else still flat — totally fine):

```
src/features/billing/
├── billing.table.ts
├── billing.validator.ts
├── billing.dto.ts
├── billing.repository.ts
├── services/
│   ├── checkout.service.ts
│   └── refund.service.ts
└── index.ts
```

Rules that carry through promotion:

- **Barrel is unchanged contract.** Consumers still write `import { LoginService, sessions } from "../auth"`. The subfolder path never leaks across feature boundaries.
- **Cross-feature FKs** import the table object **from the barrel**, not the deep path: `import { sessions } from "../auth"` — not `"../auth/tables/session.table"`. The barrel must re-export every table so sibling features (and `features/drizzle/schemas.ts`) keep working.
- **Service ↔ repository scoping is unchanged.** A service in `services/` may import any repository in its own `repositories/`. Cross-feature is still service → service (R5).
- **No empty placeholder folders.** Promote on the second file, not "for future use."
- **Demotion is allowed.** If a feature shrinks back to one file of a kind, collapse the folder again. The barrel absorbs the move.

```ts
// src/features/auth/index.ts — fully promoted barrel
export * as LoginService from "./services/login.service";
export * as SignupService from "./services/signup.service";
export * as PasswordResetService from "./services/password-reset.service";

export * as SessionRepository from "./repositories/session.repository";
export * as TokenRepository from "./repositories/token.repository";
export * as CredentialRepository from "./repositories/credential.repository";

export { sessions } from "./tables/session.table";
export { tokens } from "./tables/token.table";
export { credentials } from "./tables/credential.table";

export * from "./validators/login.validator";
export * from "./validators/signup.validator";
export * from "./dtos/login.dto";
export * from "./dtos/signup.dto";
```

### R10 — Sub-feature folders only when they own their own tables

When a feature keeps growing, the tempting move is to group by **sub-domain** (`auth/login/`, `auth/register/`, `auth/forgot-password/`) instead of by file type. **Do not do this** when the sub-domains share tables — you'll either duplicate repositories for the same table (violates R2) or create awkward cross-sub-domain imports.

Rule: a sub-feature folder is justified **only when the sub-domain owns its own tables** (and therefore its own repositories and validators). At that point it's effectively a full feature in the same shape as the 5-file root, nested one level.

```
src/features/auth/
├── auth.table.ts                  # shared: users, sessions, credentials
├── auth.validator.ts
├── auth.dto.ts
├── repositories/                  # share these across login/register/forgot-password
│   ├── user.repository.ts
│   └── session.repository.ts
├── services/                      # login/register/forgot-password live here (R9)
│   ├── login.service.ts
│   ├── register.service.ts
│   └── forgot-password.service.ts
│
├── oauth/                         # ✅ sub-feature — owns oauth_accounts table
│   ├── oauth.table.ts
│   ├── oauth.validator.ts
│   ├── oauth.dto.ts
│   ├── oauth.repository.ts
│   ├── oauth.service.ts
│   └── index.ts                   # sub-barrel
│
└── index.ts                       # parent barrel re-exports oauth sub-barrel
```

```ts
// src/features/auth/index.ts
export * as LoginService from "./services/login.service";
export * as RegisterService from "./services/register.service";
// …
export * from "./oauth"; // re-export sub-feature so consumers stay flat: `import { OAuthService } from "../auth"`
```

Guardrails:

- **No sub-feature without its own table(s).** `login/`, `register/`, `forgot-password/` are _services_, not sub-features — they share `users`/`sessions` and belong in `services/` per R9.
- **Sub-features still obey R5.** Cross-call between `auth.OAuthService` and the root `auth.LoginService` goes through services, not repositories.
- **One level deep, max.** If a sub-feature wants its own sub-feature, that's a signal to promote it to a top-level `features/<name>/` instead.
- **Parent barrel still hides depth.** Consumers import from `../auth`, never `../auth/oauth`.
- **Demotion allowed.** If the sub-feature's tables get absorbed into the parent, collapse the folder.

Decision flow when a feature is getting big:

1. New files of an existing type (2+ services, 2+ repos, …)? → R9, promote to `services/` / `repositories/` / etc.
2. New cluster of behavior that introduces **its own table(s)**? → R10, create a sub-feature folder.
3. New cluster of behavior that shares the parent's tables? → still R9 — add another service file under `services/`. Resist the sub-domain folder.

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
3. Move the drizzle query verbatim into `<name>.repository.ts` as a typed function. The repo imports the `db` singleton; the function signature takes **domain args only** — never `db: Database` / `tx`. If the original code had a multi-statement transaction, wrap it inside one repo function with `db.transaction(...)`.
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
- Importing `db` inside a `*.service.ts` file (even just to pass into a repository). Repos own `db`; services pass domain args only.
- Repository function signatures that accept `db: Database` / `tx` as a parameter. Repos read the singleton; transactions are wrapped inside one repo function via `db.transaction(...)`.
- Hand-writing a valibot schema that mirrors a drizzle table instead of using `createInsertSchema` / `createSelectSchema`.
- Deep-importing another feature's repository (`import { create } from "../order/order.repository"`). Use `OrderService.create(...)` via the barrel.
- A service calling another feature's repository at all — even via the barrel (`OrderRepository.create(...)` from inside `auth.service.ts`). Services may only import their **own** repository. Cross-feature is always service → service. Wrong: `AuthService → UserRepository`. Correct: `AuthService → UserService`.
- Stashing tables in `features/drizzle/tables/` (the bosapi-internal location). Generated-app tables live in their owning feature folder.
- Putting a domain entity in `features/shared/` ("UserService is used everywhere"). It still has an owner — `features/user/`.
- Using `zod` instead of `valibot`.
- Combining repository + service into a single file "because it's only one query" — the layer separation is the rule, even when trivial.
- Creating sub-domain folders (`auth/login/`, `auth/register/`, `auth/forgot-password/`) that share the parent's tables. That collapses into duplicate repositories for one table (violates R2). Use `services/` (R9). Sub-feature folders are only valid when the sub-domain owns its own tables (R10).

## Checklist gate

P0 — must pass before finishing:

- [ ] `rg "from .*features/drizzle" src/routes` → zero matches.
- [ ] `rg "db\.(select|insert|update|delete)" src/routes` → zero matches.
- [ ] Every new table sits in a `features/<name>/<name>.table.ts`, not `features/drizzle/tables/`.
- [ ] Every new feature folder contains all six files (`*.table`, `*.validator`, `*.dto`, `*.repository`, `*.service`, `index.ts`).
- [ ] Validators use `createInsertSchema` / `createSelectSchema` from `drizzle-valibot`, not hand-written.
- [ ] Services do not contain raw `db.select(...)` / `db.insert(...)` / `db.update(...)` / `db.delete(...)`.
- [ ] Services do not import `db` at all (`rg "from .*drizzle\"|from .*\"./drizzle\"" src/features/**/*.service.ts` → zero matches outside the drizzle feature itself).
- [ ] Repository function signatures never start with `db: Database` / `tx: Database` — repos import the singleton.
- [ ] Service input from untrusted sources is `v.parse(...)`d before reaching the repository.

P1 — should pass:

- [ ] Cross-feature calls go through the barrel namespace (`OtherService.fn(...)`), no deep imports.
- [ ] Services import **only their own** `*.repository.ts`. Cross-feature data access is service → service, never service → other feature's repository (e.g. `AuthService` calls `UserService`, not `UserRepository`).
- [ ] `shared/` contains no domain entities.
- [ ] Any file type with 2+ files in a feature is promoted into its matching subfolder (`tables/`, `validators/`, `dtos/`, `repositories/`, `services/`). The barrel still hides the deep paths, and cross-feature imports (incl. FKs to sibling tables) come from the barrel — never the deep subfolder path.
- [ ] Sub-feature folders (`auth/oauth/`, `billing/invoices/`) exist **only** when the sub-domain owns its own tables. `login/`, `register/`, `forgot-password/`-style folders that share parent tables are forbidden — those services live in `services/` under R9.
- [ ] Multi-statement flows are wrapped with `db.transaction(...)` inside a single repository function (services do not orchestrate transactions).
- [ ] `bun run check && bun run format && bun run build` pass.

## References

- [`references/feature-template.md`](./references/feature-template.md) — copy-adapt template for every file in a feature folder.
- [`references/refactor-recipe.md`](./references/refactor-recipe.md) — step-by-step grep → extract → swap-import recipe with `warung-nasi` before/after.
- [`references/shared-folder.md`](./references/shared-folder.md) — what belongs in `features/shared/` and what does not.
- **External skills** — pair with [`bosia-drizzle-feature`](../bosia-drizzle-feature/SKILL.md) (table authoring, seeds) and [`bosia-drizzle-usage`](../bosia-drizzle-usage/SKILL.md) (the `db` consumer rules that apply inside the repository layer).
- **Upstream docs** — [`drizzle-valibot`](https://orm.drizzle.team/docs/zod) (same API surface as drizzle-zod), [`valibot`](https://valibot.dev/guides/introduction/).
