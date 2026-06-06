# `src/features/shared/` — what belongs and what doesn't

`features/shared/` is the home for code that has **no owning entity** and is used across multiple features. The bar is high: if you can name a domain concept it belongs to, give it a feature folder instead.

## The test

Ask: "If this app only had one feature, would this code still exist?"

- **Yes** → it's infrastructure → `shared/`.
- **No, it's about <Entity>** → goes in `features/<entity>/`.

## Folder layout

```
src/features/shared/
├── types.ts          # Cross-feature type definitions
├── errors.ts         # Typed error classes services throw
├── validators.ts     # Reusable valibot primitives
├── repository.ts     # Database type re-export + tx + paginate helpers
├── services/         # Cross-cutting services (mailer, audit, cache)
│   ├── mailer.service.ts
│   ├── audit.service.ts
│   └── ...
└── index.ts          # Barrel
```

## `types.ts` — cross-feature type definitions

```ts
export type Paginated<T> = {
	rows: T[];
	nextCursor: string | null;
	hasMore: boolean;
};

export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

export type Id = string & { readonly __brand: unique symbol };
```

Belongs here: shape-only types that multiple features consume (`Paginated<T>`, generic `Result`, branded `Id`).

Does **not** belong here: types that describe a domain entity. `type Order = {...}` lives in `features/order/order.dto.ts`.

## `errors.ts` — typed error classes

```ts
export class AppError extends Error {
	constructor(
		message: string,
		readonly code: string,
	) {
		super(message);
		this.name = "AppError";
	}
}

export class NotFoundError extends AppError {
	constructor(resource: string) {
		super(`not found: ${resource}`, "NOT_FOUND");
		this.name = "NotFoundError";
	}
}

export class ValidationError extends AppError {
	constructor(
		message: string,
		readonly issues: unknown,
	) {
		super(message, "VALIDATION");
		this.name = "ValidationError";
	}
}

export class ConflictError extends AppError {
	constructor(message: string) {
		super(message, "CONFLICT");
		this.name = "ConflictError";
	}
}
```

Services throw these. Route handlers catch them and map to HTTP status. Keep the set small (4–6 classes). If you need a domain-specific error like `PaymentDeclinedError`, that goes in `features/payment/payment.errors.ts` — not `shared/`.

## `validators.ts` — reusable valibot primitives

```ts
import * as v from "valibot";

export const uuidSchema = v.pipe(v.string(), v.uuid());

export const slugSchema = v.pipe(
	v.string(),
	v.minLength(1),
	v.maxLength(80),
	v.regex(/^[a-z0-9-]+$/, "slug must be kebab-case"),
);

export const timestampSchema = v.pipe(v.string(), v.isoTimestamp());

export const paginationSchema = v.object({
	cursor: v.optional(v.string()),
	limit: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(100)), 20),
});
```

Belongs here: primitive validators that any feature might compose into its own schemas (UUIDs, slugs, timestamps, pagination). Plus generic refinements.

Does **not** belong here: composite schemas that describe a domain entity (`OrderSchema`, `UserUpdateSchema`). Those live next to their table.

## `repository.ts` — database type + paginate

```ts
import type { Database as Db } from "../drizzle/types";

export type Database = Db;

export async function paginate<T extends { id: string }>(
	fetchPage: (cursor: string | null, limit: number) => Promise<T[]>,
	cursor: string | null,
	limit: number,
) {
	const rows = await fetchPage(cursor, limit + 1);
	const hasMore = rows.length > limit;
	const page = hasMore ? rows.slice(0, limit) : rows;
	return {
		rows: page,
		nextCursor: hasMore ? (page[page.length - 1]?.id ?? null) : null,
		hasMore,
	};
}
```

`Database` is the type alias used internally for the `tx` parameter of `db.transaction(...)` callbacks (and for typing repository helpers that operate on a tx handle). It is **not** a parameter on public repository functions — repos import the `db` singleton directly. `paginate` is the cursor-pagination helper that pairs with `Paginated<T>` from `types.ts`.

**No `withTx` helper.** Transactions live inside a single repository function: the repo writes `db.transaction(async (tx) => { … })` and the `tx` never leaves that function. Services never orchestrate transactions and never see a `tx`. If two writes must be atomic, expose them as one repo function (e.g. `MenuRepository.createWithAudit(input, actorId)`).

## `services/` — cross-cutting services

Cross-cutting means: no single feature owns it; many features call it.

Belongs here:

- `mailer.service.ts` — every feature might send mail.
- `audit.service.ts` — every feature might emit audit events.
- `cache.service.ts` — read-through cache wrapper.
- `feature-flags.service.ts` — runtime flag lookup.

Does **not** belong here:

- `user.service.ts` — clearly entity-owned (`features/user/`), even though many other features call it.
- `order.service.ts` — same.
- `notification.service.ts` — if notifications are a domain entity (DB-backed, with their own table), give them a feature folder.

Rule of thumb: cross-cutting services don't own DB tables. The moment a service needs its own `*.table.ts`, it has graduated to a feature.

## `index.ts` — barrel

```ts
export * from "./types";
export * from "./errors";
export * from "./validators";
export * from "./repository";
export * as Mailer from "./services/mailer.service";
export * as Audit from "./services/audit.service";
```

Consumers import from `../shared` only, never deep into `../shared/services/mailer.service`.

## Anti-patterns

- A `shared/utils.ts` grab-bag. If the helper is generic (date formatting, string utilities), put it in `src/lib/` — that's the existing home for project-wide utilities. `shared/` is reserved for cross-feature **application code** (errors, types, services), not generic utilities.
- A `shared/constants.ts` that drifts into domain values (`MAX_ORDER_QUANTITY = 50`). Domain constants live with the feature.
- Importing `db` from `shared/`. `shared/` only exports the `Database` _type_; the runtime `db` instance comes from `features/drizzle` and is imported **only** by repository files.
- Re-introducing a `withTx` helper in `shared/`. Transactions belong inside a single repository function via `db.transaction(...)` — services never orchestrate transactions.
- A `shared/services/<entity>.service.ts` that has its own table. Promote it to a feature.
- A `shared/repositories/` folder. Repositories are always per-entity; there's no such thing as a "shared repository". The shared file is `repository.ts` (singular) and it only contains the `Database` type + helpers.
