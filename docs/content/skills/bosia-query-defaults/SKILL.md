---
name: bosia-query-defaults
description: Every list query is paginated and ordered. Repository `list*` functions accept `{ limit = 10, offset = 0, orderBy }` and always return `{ rows, total }`. Default sort is `created_at desc`. No unbounded `db.select().from(...)` reaching production code.
triggers:
  - list query
  - pagination
  - limit offset
  - default order
  - created_at desc
  - data-table loader
  - repository list
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
  stack: [drizzle, svelte-5-runes]
---

# bosia-query-defaults

## What it does

Locks one shape for every list-style repository call so loaders, services, and `ui/data-table` agree without per-feature drift. Forces pagination at the lowest layer (the repository) instead of trusting the route to slice client-side.

## When to use

- Writing any `list*` / `findAll*` / `getAll*` repository function.
- Wiring a `data-table` (`bosia-page-shell` R5) to a server loader.
- Reviewing a repository that returns the entire table.

Anti-trigger: single-row reads (`getById`, `findByEmail`) — those don't paginate. Aggregates / counts also exempt.

## Rules

### R1 — `list*` signature is `(db, opts?)` returning `{ rows, total }`

Repository contract:

```ts
// src/features/<feature>/<feature>.repository.ts
import { and, desc, eq, count, type SQL } from "drizzle-orm";
import type { Database } from "../shared";
import { items } from "./items.table";

export type ListOptions = {
	limit?: number;
	offset?: number;
	orderBy?: SQL;
	where?: SQL;
};

export type ListResult<T> = {
	rows: T[];
	total: number;
};

export async function list(db: Database, opts: ListOptions = {}) {
	const limit = opts.limit ?? 10;
	const offset = opts.offset ?? 0;
	const orderBy = opts.orderBy ?? desc(items.createdAt);
	const where = opts.where;

	const [rows, totalRows] = await Promise.all([
		db.select().from(items).where(where).orderBy(orderBy).limit(limit).offset(offset),
		db.select({ c: count() }).from(items).where(where),
	]);

	return { rows, total: totalRows[0]?.c ?? 0 };
}
```

Three things this guarantees:

1. Caller can always paginate. No "later we'll add a limit" debt.
2. `data-table` `totalRows` prop has a real value.
3. Default order is stable — pagination doesn't shuffle rows between page loads.

### R2 — Defaults: `limit = 10`, `offset = 0`, `orderBy = desc(created_at)`

`limit = 10` matches `ui/data-table` `pageSize` default. `offset = 0` is page 1. Default sort is `desc(table.createdAt)` — newest first, the user-visible reading order for nearly every list.

If the table has no `createdAt`, **add one** (`createdAt: timestamp('created_at').notNull().defaultNow()`) before shipping the list. Don't fall back to `id` order — UUIDs sort lexicographically, which is meaningless to a human.

### R3 — Clamp `limit` at the service boundary

The service parses untrusted input. Clamp `limit` to a sane upper bound so a client passing `?limit=1000000` doesn't dump the table.

```ts
// items.service.ts
import * as v from "valibot";
import { db } from "../drizzle";
import * as ItemsRepository from "./items.repository";

const ListInput = v.object({
	limit: v.optional(v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(100)), 10),
	offset: v.optional(v.pipe(v.number(), v.integer(), v.minValue(0)), 0),
});

export async function list(raw: unknown) {
	const input = v.parse(ListInput, raw);
	return ItemsRepository.list(db, input);
}
```

Hard cap: **100**. If the UI legitimately needs more, page through.

### R4 — Loader reads `limit` / `offset` from the URL

Drives `data-table` state from the URL so refresh + share work:

```ts
// src/routes/(private)/items/+page.server.ts
import { ItemsService } from "../../../features/items";

export async function load({ url, locals }: LoadEvent) {
	if (!locals.can("items.read")) throw new Response(null, { status: 403 });

	const limit = Number(url.searchParams.get("limit") ?? "10");
	const offset = Number(url.searchParams.get("offset") ?? "0");

	const { rows, total } = await ItemsService.list({ limit, offset });
	return { rows, total, limit, offset };
}
```

### R5 — Custom order is opt-in, default stays `created_at desc`

Allow per-list overrides via an `orderBy` argument from the service (e.g. `?sort=name`), but **the default branch must always be `desc(createdAt)`**. Don't omit the `.orderBy(...)` call hoping the DB will pick a sensible order — it won't.

```ts
const orderBy = (() => {
	switch (raw.sort) {
		case "name":
			return raw.desc ? desc(items.name) : asc(items.name);
		case "updated":
			return desc(items.updatedAt);
		default:
			return desc(items.createdAt);
	}
})();
```

### R6 — Filtering composes with pagination, not instead of it

When a list also filters (search, status, owner), build the `where` SQL once and reuse it in **both** the `rows` query and the `count()` query. Don't filter the rows but count the unfiltered table — `data-table` page count will lie.

```ts
const where = and(
	q ? ilike(items.name, `%${q}%`) : undefined,
	statusFilter ? eq(items.status, statusFilter) : undefined,
);

const [rows, totalRows] = await Promise.all([
	db.select().from(items).where(where).orderBy(desc(items.createdAt)).limit(limit).offset(offset),
	db.select({ c: count() }).from(items).where(where),
]);
```

### R7 — No unbounded `db.select().from(table)` in shipping code

Repository code that returns "every row" is a bug waiting to happen as the table grows. Only acceptable cases:

- Lookup tables (`roles`, `permissions`) with a known small upper bound (<100 rows) — even then, prefer caching.
- Internal cron / batch jobs running with explicit awareness — annotate with a one-line comment explaining why no limit.

## Workflow

1. Adding a list view? Start in the repository: define `list(db, opts)` returning `{ rows, total }`.
2. Wire the service to validate + clamp `limit` (max 100), pass through `offset` / `orderBy`.
3. Loader reads `limit` / `offset` from `url.searchParams`, calls the service, returns `{ rows, total, limit, offset }`.
4. Page passes those to `<DataTable totalRows={data.total} pageSize={data.limit} … />` per `bosia-page-shell` R5.
5. Confirm the table has `createdAt` — add it if missing before merging.

## Bosia conventions

- `bosia-drizzle-feature` — repository file layout, `*.table.ts` shape.
- `bosia-drizzle-usage` — `db` is repository-only; never imported in routes.
- `bosia-clean-architecture` — controller (loader) → service → repository layering.
- `bosia-crud-flow` — list view inside a full CRUD surface.
- `bosia-page-shell` — `data-table` consumes `{ rows, total, limit, offset }`.

## Checklist gate

P0:

- [ ] Every `list*` repository function takes `{ limit, offset, orderBy?, where? }` and returns `{ rows, total }`.
- [ ] Defaults: `limit = 10`, `offset = 0`, `orderBy = desc(table.createdAt)`.
- [ ] Service clamps `limit` to ≤ 100.
- [ ] `count()` query uses the same `where` as the rows query.
- [ ] Table has `createdAt` (or equivalent ordering column) — no UUID order fallback.
- [ ] Loader reads pagination state from `url.searchParams`, not from a `$state` only the client sees.

P1:

- [ ] `Promise.all` runs the rows + count queries concurrently.
- [ ] Custom sort whitelisted in the service (no raw column name from the URL).
- [ ] `data-table` `onStateChange` writes `limit` / `offset` (and any filter) back to the URL.
- [ ] Big-list scans (admin exports, etc.) use cursor pagination instead of `offset` — see `bosia-drizzle-usage` performance refs.

## References

- `docs/content/docs/components/ui/data-table.md` — server-side wiring example consumes `totalRows` + `pageSize`.
- `bosia-drizzle-usage/references/query-patterns.md` — count + select composition, cursor pagination for large lists.
- `bosia-drizzle-usage/references/performance.md` — when to graduate from `offset` to cursor.
