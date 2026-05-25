# Refactor recipe — route handler with raw `db`

Use this when a route file imports `db` or a `*.table` file directly. The worked example is the real `warung-nasi` violation that motivated this skill.

## Before — the violation

```ts
// data/users/<userId>/<projectSlug>/warung-nasi/src/routes/(public)/+page.server.ts
import { db } from "../../features/drizzle";
import { menuItems } from "../../features/drizzle/tables/menu.table";

export async function load() {
	const menu = await db.select().from(menuItems).orderBy(menuItems.id);
	return { menu };
}
```

What's wrong:

- Route imports `db` (violates [R1](../SKILL.md#r1--no-db-import-in-srcroutes)).
- Route deep-imports the table file (violates [R1](../SKILL.md#r1--no-db-import-in-srcroutes) + [R7](../SKILL.md#r7--new-tables-must-declare-a-home-feature)).
- Table lives in `features/drizzle/tables/` rather than its owning feature (violates [R7](../SKILL.md#r7--new-tables-must-declare-a-home-feature)).
- No service layer means any future validation/auth has nowhere to live.

## Step 1 — Grep for all violations

```bash
rg "from .*features/drizzle" src/routes
rg "db\.(select|insert|update|delete)" src/routes
rg "features/drizzle/tables" src/routes src/features
```

Collect every hit. Refactor in passes — one entity at a time. Don't try to fix five features in one diff.

## Step 2 — Pick or create the feature folder

For the `warung-nasi` example the entity is "menu". Plan: `src/features/menu/`. If a folder already exists, extend it. If not, scaffold from [`feature-template.md`](./feature-template.md).

If the table currently lives at `src/features/drizzle/tables/menu.table.ts`:

```bash
mv src/features/drizzle/tables/menu.table.ts src/features/menu/menu.table.ts
```

Update any `features/drizzle/schemas.ts` re-export so the table is still discovered by the seed runner and migration generator:

```ts
// src/features/drizzle/schemas.ts
export { menuItems } from "../menu/menu.table";
```

## Step 3 — Extract the query into the repository

```ts
// src/features/menu/menu.repository.ts
import type { Database } from "../shared";
import { menuItems } from "./menu.table";

export async function listAll(db: Database) {
	return db.select().from(menuItems).orderBy(menuItems.id);
}
```

Copy the exact query body. No optimization, no renames, no behavior changes in this pass. Verify against the original.

## Step 4 — Wrap with a service

Pass-through is fine for the first pass. The layer is there so future validation/auth has a home.

```ts
// src/features/menu/menu.service.ts
import { db } from "../drizzle";
import * as MenuRepository from "./menu.repository";

export async function list() {
	return MenuRepository.listAll(db);
}
```

## Step 5 — Add validator, DTO, and barrel (deferred validators OK)

If the route is read-only and there's no input to validate, you can ship the refactor without `menu.validator.ts` / `menu.dto.ts` for the very first pass — but add them before merging any write endpoint for this feature. Always add `index.ts`:

```ts
// src/features/menu/index.ts
export * as MenuService from "./menu.service";
export * as MenuRepository from "./menu.repository";
export { menuItems } from "./menu.table";
```

Full templates: [`feature-template.md`](./feature-template.md).

## Step 6 — Swap the route handler

```ts
// src/routes/(public)/+page.server.ts  — after
import { MenuService } from "../../features/menu";

export async function load() {
	const menu = await MenuService.list();
	return { menu };
}
```

Diff against the original — the returned shape (`{ menu }`) must be identical. The svelte page consuming `data.menu` should not need to change.

## Step 7 — Verify

```bash
rg "from .*features/drizzle" src/routes      # → no matches
rg "db\.(select|insert|update|delete)" src/routes  # → no matches
bun run check
bun run format
bun run build
```

If `bun run build` errors on a path import (e.g. `../../features/drizzle/tables/menu.table` from elsewhere), update the offending file to import from the new feature barrel (`features/menu`) instead.

## Step 8 — Spot-check the running app

If a dev server is running, restart it after the move (`runtime_restart`) so cached imports of the moved file are dropped. Visit the route, confirm the page renders, confirm the network response matches the pre-refactor shape.

## Multi-route variants

### Form action with input

```ts
// before
export const actions = {
	create: async ({ request }) => {
		const data = await request.formData();
		await db.insert(menuItems).values({ name: String(data.get("name")) });
	},
};

// after
import { MenuService } from "../../features/menu";

export const actions = {
	create: async ({ request }) => {
		const data = await request.formData();
		await MenuService.create({ name: data.get("name") });
	},
};
```

`MenuService.create` runs `v.parse(MenuInsert, ...)` so the raw `FormDataEntryValue` is checked before the repository sees it. `name: null` (no field submitted) becomes a `ValidationError`.

### Endpoint with JSON body

```ts
// src/routes/api/menu/+server.ts  — after
import { MenuService } from "../../../features/menu";
import { NotFoundError } from "../../../features/shared";

export async function PATCH({ params, request }: { params: { id: string }; request: Request }) {
	const body = await request.json();
	try {
		const row = await MenuService.update(params.id, body);
		return new Response(JSON.stringify(row));
	} catch (err) {
		if (err instanceof NotFoundError) return new Response(err.message, { status: 404 });
		throw err;
	}
}
```

The route handler catches service errors and maps them to HTTP status. Do not bubble raw `valibot` `ValiError` to the client — let the service throw a typed `ValidationError` (or have the route catch `ValiError` and map to 400).

## Common pitfalls during refactor

- **Behavior change in the extraction step.** Resist the urge to "fix" a related bug while you move the code. Extract verbatim. Open a follow-up for the bug.
- **Re-exporting the table from multiple locations.** Pick one home — the new feature folder. Delete the old re-export.
- **Skipping the service layer "because it's pass-through".** That defeats the layering — the next write endpoint will be tempted to put `db.insert` back in the route. Always add the service file, even if its body is one line.
- **Importing `db` inside the service implementation more than once.** Service file imports `db` at the top once and passes it into every repository call. Don't reach into `features/drizzle` from many places.
- **Forgetting `runtime_restart` after moving the table file.** The dev server caches `bun:sqlite`/`postgres` connection objects and may also cache module exports. Restart once after the move.
