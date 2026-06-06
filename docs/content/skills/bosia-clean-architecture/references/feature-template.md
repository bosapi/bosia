# Feature template

Copy-adapt this template when scaffolding `src/features/<name>/`. Examples use `menu` as the feature name. Replace consistently: folder = `menu`, namespace = `Menu`, table = `menuItems` (plural). Adjust to match drizzle naming for your project.

## File 1 — `menu.table.ts`

```ts
import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const menuItems = pgTable("menu_items", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: varchar("name", { length: 200 }).notNull(),
	price: varchar("price", { length: 32 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type MenuItemRow = typeof menuItems.$inferSelect;
export type MenuItemInsertRow = typeof menuItems.$inferInsert;
```

Notes:

- `id` defaults to `uuid().defaultRandom()`. Switch to `serial()` only when an external system requires integer IDs.
- `createdAt` / `updatedAt` are convention. Set `updatedAt` in the repository on writes (drizzle doesn't auto-update it).
- Foreign keys belong in this file: `.references(() => otherTable.id, { onDelete: "cascade" })`. Never in seeds (see `bosia-drizzle-feature` R6).

## File 2 — `menu.validator.ts`

```ts
import { createInsertSchema, createSelectSchema } from "drizzle-valibot";
import * as v from "valibot";

import { uuidSchema } from "../shared";
import { menuItems } from "./menu.table";

// Derived from the drizzle table — keeps types in sync automatically.
export const MenuRow = createSelectSchema(menuItems);

export const MenuInsert = createInsertSchema(menuItems, {
	name: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
	price: v.pipe(v.string(), v.regex(/^\d+(\.\d{1,2})?$/, "price must be decimal")),
});

export const MenuUpdate = v.partial(v.omit(MenuInsert, ["id", "createdAt", "updatedAt"]));

export const MenuIdSchema = uuidSchema;
```

Notes:

- Always derive from `createInsertSchema` / `createSelectSchema`. Refine via the second-argument record (per-column refinements) or chain with `v.partial` / `v.omit` / `v.pick`.
- Reuse primitives from `features/shared/validators.ts` (`uuidSchema`, `slugSchema`, `paginationSchema`) — don't redefine.
- Forbidden: hand-rolling `v.object({ id: v.string(), name: v.string(), ... })` that mirrors the table.

## File 3 — `menu.dto.ts`

```ts
import type * as v from "valibot";

import type { MenuInsert, MenuRow, MenuUpdate } from "./menu.validator";

export type MenuRowDto = v.InferOutput<typeof MenuRow>;
export type MenuInsertDto = v.InferInput<typeof MenuInsert>;
export type MenuUpdateDto = v.InferInput<typeof MenuUpdate>;
```

Notes:

- DTO types are public-API shape names. Consumers (route handlers, components, other services) import these — not the raw `MenuItemRow` from the table file.
- Use `v.InferInput` for write-side types (what the caller passes in), `v.InferOutput` for read-side (what the validator returns).

## File 4 — `menu.repository.ts`

```ts
import { eq } from "drizzle-orm";

import { db } from "../drizzle";
import { menuItems } from "./menu.table";
import type { MenuInsertDto, MenuUpdateDto } from "./menu.dto";

export async function listAll() {
	return db.select().from(menuItems).orderBy(menuItems.id);
}

export async function findById(id: string) {
	const [row] = await db.select().from(menuItems).where(eq(menuItems.id, id)).limit(1);
	return row ?? null;
}

export async function create(input: MenuInsertDto) {
	const [row] = await db.insert(menuItems).values(input).returning();
	return row;
}

export async function update(id: string, patch: MenuUpdateDto) {
	const [row] = await db
		.update(menuItems)
		.set({ ...patch, updatedAt: new Date() })
		.where(eq(menuItems.id, id))
		.returning();
	return row ?? null;
}

export async function remove(id: string) {
	const [row] = await db
		.delete(menuItems)
		.where(eq(menuItems.id, id))
		.returning({ id: menuItems.id });
	return row ?? null;
}
```

Notes:

- The repository **imports the `db` singleton directly**. Function signatures take **only domain args** — never `db: Database` or `tx`.
- Multi-statement writes are wrapped **inside the repo function** with `db.transaction(async (tx) => { ... })`. The `tx` stays internal to that one function — never bubbles up to the service.
- No business logic, no validation, no auth, no error mapping. The repository tells the truth about the DB and nothing more.
- Return raw rows. Service decides what to expose.
- Single-row reads use `const [row] = await … .limit(1)` (see `bosia-drizzle-usage` P1).

## File 5 — `menu.service.ts`

```ts
import * as v from "valibot";

import { NotFoundError } from "../shared";

import type { MenuInsertDto, MenuUpdateDto } from "./menu.dto";
import * as MenuRepository from "./menu.repository";
import { MenuIdSchema, MenuInsert, MenuUpdate } from "./menu.validator";

export async function list() {
	return MenuRepository.listAll();
}

export async function getById(rawId: unknown) {
	const id = v.parse(MenuIdSchema, rawId);
	const row = await MenuRepository.findById(id);
	if (!row) throw new NotFoundError(`menu:${id}`);
	return row;
}

export async function create(rawInput: unknown) {
	const input = v.parse(MenuInsert, rawInput) satisfies MenuInsertDto;
	return MenuRepository.create(input);
}

export async function update(rawId: unknown, rawPatch: unknown) {
	const id = v.parse(MenuIdSchema, rawId);
	const patch = v.parse(MenuUpdate, rawPatch) satisfies MenuUpdateDto;
	const row = await MenuRepository.update(id, patch);
	if (!row) throw new NotFoundError(`menu:${id}`);
	return row;
}

export async function remove(rawId: unknown) {
	const id = v.parse(MenuIdSchema, rawId);
	const row = await MenuRepository.remove(id);
	if (!row) throw new NotFoundError(`menu:${id}`);
}
```

Notes:

- **Services never import `db`.** Every database touch goes through a repository function whose signature takes only domain args.
- Input from untrusted sources (route handlers, RPC calls, form actions) is `unknown`. `v.parse` is the boundary — once past it, types are guaranteed.
- Service is the **only** layer allowed to throw `NotFoundError` / `ValidationError`. Route handlers catch these and map to HTTP status.
- Multi-statement flows are **one repository function** that wraps everything in `db.transaction(...)`. The service calls that one function — it does not orchestrate a transaction. Example: instead of a service that calls `create` + `audit`, expose `MenuRepository.createWithAudit(input, actorId)` and let the repo do the transaction. Cross-feature transactions are an edge case — colocate them in the feature that owns the root entity.

## File 6 — `index.ts` (barrel)

```ts
export * as MenuService from "./menu.service";
export * as MenuRepository from "./menu.repository";
export { menuItems } from "./menu.table";
export type { MenuItemRow, MenuItemInsertRow } from "./menu.table";
export * from "./menu.validator";
export * from "./menu.dto";
```

Notes:

- Service and repository exported as namespaces (`export * as`) so callers write `MenuService.list()` — searchable, refactor-safe, prevents accidental star-imports.
- Table object exported so other features can declare FKs against it.
- Validators + DTOs flow through unchanged.

## Caller (route handler)

```ts
// src/routes/(public)/+page.server.ts
import { MenuService } from "../../features/menu";

export async function load() {
	const menu = await MenuService.list();
	return { menu };
}
```

```ts
// src/routes/api/menu/+server.ts
import { MenuService } from "../../../features/menu";
import { NotFoundError } from "../../../features/shared";

export async function POST({ request }: { request: Request }) {
	const body = await request.json();
	try {
		const created = await MenuService.create(body);
		return new Response(JSON.stringify(created), { status: 201 });
	} catch (err) {
		if (err instanceof NotFoundError) return new Response(err.message, { status: 404 });
		throw err;
	}
}
```

The route handler never imports `db`, never imports `menuItems`, never imports `MenuRepository`. Only `MenuService`.
