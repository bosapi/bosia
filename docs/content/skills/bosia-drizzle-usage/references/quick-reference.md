# Quick Reference

Cheatsheet for drizzle operators + recipes, all using the Bosia `db` import. Open this when you remember the rule but blanked on an operator name.

## Imports

```ts
import {
	and,
	asc,
	between,
	count,
	desc,
	eq,
	gt,
	gte,
	ilike,
	inArray,
	isNotNull,
	isNull,
	like,
	lt,
	lte,
	ne,
	or,
	sql,
	sum,
} from "drizzle-orm";

import { db } from "../../features/drizzle";
import { posts, users } from "../../features/drizzle/schemas";
```

## Filtering operators

| Operator                         | Use                         |
| -------------------------------- | --------------------------- |
| `eq(col, v)`                     | `col = v`                   |
| `ne(col, v)`                     | `col <> v`                  |
| `gt(col, v)` / `gte`             | `col > v` / `>=`            |
| `lt(col, v)` / `lte`             | `col < v` / `<=`            |
| `like(col, "%pat%")`             | case-sensitive pattern      |
| `ilike(col, "%pat%")`            | case-insensitive (postgres) |
| `inArray(col, [...])`            | `col IN (...)`              |
| `isNull(col)` / `isNotNull(col)` | NULL checks                 |
| `between(col, a, b)`             | inclusive range             |
| `and(c1, c2, ...)`               | combine with AND            |
| `or(c1, c2, ...)`                | combine with OR             |

```ts
await db
	.select()
	.from(users)
	.where(and(eq(users.role, "admin"), gt(users.createdAt, new Date("2024-01-01"))));

await db
	.select()
	.from(users)
	.where(inArray(users.id, [1, 2, 3]));
await db.select().from(users).where(isNull(users.deletedAt));
```

## Joins

```ts
// Inner
await db
	.select({ user: users, post: posts })
	.from(users)
	.innerJoin(posts, eq(users.id, posts.authorId));

// Left
await db
	.select({ user: users, post: posts })
	.from(users)
	.leftJoin(posts, eq(users.id, posts.authorId));

// With aggregation
await db
	.select({ name: users.name, postCount: count(posts.id) })
	.from(users)
	.leftJoin(posts, eq(users.id, posts.authorId))
	.groupBy(users.id);
```

## Pagination & sorting

```ts
// Order
await db.select().from(users).orderBy(desc(users.createdAt));

// Offset (small offsets only)
await db.select().from(users).limit(10).offset(20);

// Cursor (preferred for long lists)
await db.select().from(users).where(gt(users.id, lastSeenId)).orderBy(asc(users.id)).limit(20);
```

## Single row

```ts
// ✅ Array destructure with limit(1)
const [row] = await db.select().from(users).where(eq(users.id, id)).limit(1);

// Then guard
if (!row) error(404, "not found");
```

Don't use `.get()` — not reliably exposed on the bosia `db` builder shape.

## Insert / update / delete

```ts
// Insert + return
const [created] = await db.insert(users).values({ email: "u@example.com", name: "U" }).returning();

// Bulk
await db.insert(users).values(many);
await db.insert(users).values(many).onConflictDoNothing();
await db
	.insert(users)
	.values(many)
	.onConflictDoUpdate({ target: users.email, set: { name: sql`EXCLUDED.name` } });

// Update
await db.update(users).set({ name: "Renamed" }).where(eq(users.id, id));

// Delete
await db.delete(users).where(eq(users.id, id));
```

## Transactions

```ts
await db.transaction(async (tx) => {
	const [user] = await tx.insert(users).values({ email, name }).returning();
	await tx.insert(posts).values({ title: "First", authorId: user.id });
});
```

The whole block rolls back if any statement throws. Use `tx`, not `db`, inside the callback.

## Aggregates

```ts
const [{ c }] = await db.select({ c: count() }).from(users);
const [{ total }] = await db.select({ total: sum(orders.amount) }).from(orders);
```

## Relations API

```ts
const withPosts = await db.query.users.findMany({
	with: { posts: true },
	where: (u, { eq }) => eq(u.isActive, true),
	orderBy: (u, { desc }) => desc(u.createdAt),
	limit: 20,
});
```

Use when you'd otherwise N+1; for one join, plain `leftJoin` is fine.

## Raw SQL

```ts
const rows = await db.execute<{ id: number; name: string }>(
	sql`SELECT id, name FROM ${users} WHERE ${users.role} = ${role}`,
);
```

Leave a one-line comment when you reach for raw SQL — explain why the builder didn't fit.

## In a `+page.server.ts` loader

```ts
import { count, eq } from "drizzle-orm";
import { db } from "../../features/drizzle";
import { posts, users } from "../../features/drizzle/schemas";

export async function load() {
	const [activeUsers, totalPosts] = await Promise.all([
		db
			.select({ id: users.id, name: users.name })
			.from(users)
			.where(eq(users.isActive, true))
			.orderBy(users.name),
		db
			.select({ c: count() })
			.from(posts)
			.then((r) => r[0]?.c ?? 0),
	]);

	return { activeUsers, totalPosts };
}
```

## In a `+server.ts` handler

```ts
import { eq } from "drizzle-orm";
import { error } from "bosia/client";
import { db } from "../../features/drizzle";
import { users } from "../../features/drizzle/schemas";

export async function GET({ params }: { params: { id: string } }) {
	const [user] = await db
		.select()
		.from(users)
		.where(eq(users.id, Number(params.id)))
		.limit(1);

	if (!user) error(404, "user not found");
	return user;
}
```

## In a service function

```ts
// src/features/users/users.service.ts
import { eq } from "drizzle-orm";
import { db } from "../drizzle";
import { users } from "../drizzle/schemas";

export async function getByEmail(email: string) {
	const [row] = await db.select().from(users).where(eq(users.email, email)).limit(1);
	return row;
}
```

Services are pure — no `locals`, no HTTP. See `bosia-drizzle-feature` R2.
