# Performance

Query shape, indexing, pagination, and monitoring for the Bosia-scaffolded `db`.

## Bun driver behavior

Bosia owns the drizzle factory in `registry/features/drizzle/drizzle-index.ts`. You import `db`; you do not configure pools.

- **postgres / mysql** — wrapped by `Bun.SQL(url)`. Connection pooling is automatic per URL (handled by Bun). One process = one effective pool; you do not new up `Pool` from `pg` or `mysql2`.
- **sqlite-file / sqlite-memory** — wrapped by `bun:sqlite`'s `Database`. Single-threaded, synchronous at the driver level, no pool. WAL pragma is not currently set by the scaffold — out of scope for the agent today.
- **Edge / HTTP drivers** (Neon HTTP, Cloudflare D1, Vercel Edge, Supabase Edge) are **not** part of bosia. Don't wire `drizzle-orm/neon-http` or `drizzle-orm/d1` — the scaffold expects Bun runtime.

Anything else (`node-postgres`, `mysql2`, `better-sqlite3`) belongs to a different stack. Don't bring those into a bosia project.

## Query optimization

### Select only needed columns

```ts
import { db } from "../../features/drizzle";
import { users } from "../../features/drizzle/schemas";

// ❌ Fetch every column
const all = await db.select().from(users);

// ✅ Project explicitly
const compact = await db.select({ id: users.id, email: users.email, name: users.name }).from(users);
```

Bare `db.select()` is fine in services that return a row to internal callers. In loaders that hand data to the browser, project explicitly — saves bandwidth and avoids accidentally shipping `passwordHash` to the client.

### Use indexes effectively

Index declarations live in the table file (`*.table.ts`) — see `bosia-drizzle-feature`. Postgres example:

```ts
// src/features/users/users.table.ts
import { index, pgTable, serial, text, varchar } from "drizzle-orm/pg-core";

export const users = pgTable(
	"users",
	{
		id: serial("id").primaryKey(),
		email: varchar("email", { length: 255 }).notNull(),
		city: text("city"),
		status: text("status"),
	},
	(table) => ({
		emailIdx: index("email_idx").on(table.email),
		cityStatusIdx: index("city_status_idx").on(table.city, table.status),
	}),
);
```

Then a query like this uses the composite index:

```ts
import { and, eq } from "drizzle-orm";
import { db } from "../../features/drizzle";
import { users } from "../../features/drizzle/schemas";

await db
	.select()
	.from(users)
	.where(and(eq(users.city, "NYC"), eq(users.status, "active")));
```

### Analyze query plans (postgres)

```ts
import { sql } from "drizzle-orm";
import { db } from "../../features/drizzle";
import { users } from "../../features/drizzle/schemas";

const plan = await db.execute(
	sql`EXPLAIN ANALYZE SELECT * FROM ${users} WHERE ${users.email} = 'user@example.com'`,
);
console.log(plan);
```

Look for `Seq Scan` (bad) vs `Index Scan` (good), actual vs estimated time, and rows removed by filter. For sqlite use `EXPLAIN QUERY PLAN`.

### Pagination performance

```ts
import { asc, desc, gt, lt } from "drizzle-orm";
import { db } from "../../features/drizzle";
import { posts, users } from "../../features/drizzle/schemas";

// ❌ OFFSET grows slower as the offset grows
await db.select().from(users).limit(20).offset(10_000); // scans 10,020 rows

// ✅ Cursor by id — constant time
await db.select().from(users).where(gt(users.id, lastSeenId)).orderBy(asc(users.id)).limit(20);

// ✅ Cursor by timestamp
await db
	.select()
	.from(posts)
	.where(lt(posts.createdAt, lastSeenTimestamp))
	.orderBy(desc(posts.createdAt))
	.limit(20);
```

In a loader, the cursor comes from the URL — `url.searchParams.get("after")` — not from in-process state.

## Caching strategies

Most bosia apps don't need application-level caching — the `bosia-response-cache` middleware handles HTML/SSR caching with compression. Reach for these only when you have a measured hot read that response cache can't cover (e.g. data shared across many response shapes).

### In-memory cache

```ts
import { LRUCache } from "lru-cache";
import { eq } from "drizzle-orm";
import { db } from "../../features/drizzle";
import { users } from "../../features/drizzle/schemas";

const cache = new LRUCache<string, unknown>({
	max: 500,
	ttl: 1000 * 60 * 5, // 5 min
});

export async function getCachedUser(id: number) {
	const key = `user:${id}`;
	const hit = cache.get(key);
	if (hit) return hit;

	const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
	cache.set(key, user);
	return user;
}
```

### Redis cache layer

```ts
import { Redis } from "ioredis";
import { db } from "../../features/drizzle";
import { users } from "../../features/drizzle/schemas";

const redis = new Redis(process.env.REDIS_URL!);

export async function getCachedData<T>(
	key: string,
	fetcher: () => Promise<T>,
	ttl = 300,
): Promise<T> {
	const cached = await redis.get(key);
	if (cached) return JSON.parse(cached) as T;

	const data = await fetcher();
	await redis.setex(key, ttl, JSON.stringify(data));
	return data;
}

const allUsers = await getCachedData("users:all", () => db.select().from(users), 600);
```

### Materialized views (postgres only)

```ts
// engine: postgres
// Migration SQL:
// CREATE MATERIALIZED VIEW user_stats AS
//   SELECT u.id, u.name,
//          COUNT(p.id) AS post_count,
//          COUNT(c.id) AS comment_count
//   FROM users u
//   LEFT JOIN posts p ON p.author_id = u.id
//   LEFT JOIN comments c ON c.user_id = u.id
//   GROUP BY u.id;
// CREATE UNIQUE INDEX ON user_stats (id);

import { eq, sql } from "drizzle-orm";
import { pgMaterializedView } from "drizzle-orm/pg-core";
import { db } from "../../features/drizzle";
import { comments, posts, users } from "../../features/drizzle/schemas";

export const userStats = pgMaterializedView("user_stats").as((qb) =>
	qb
		.select({
			id: users.id,
			name: users.name,
			postCount: sql<number>`COUNT(${posts.id})`,
			commentCount: sql<number>`COUNT(${comments.id})`,
		})
		.from(users)
		.leftJoin(posts, eq(posts.authorId, users.id))
		.leftJoin(comments, eq(comments.userId, users.id))
		.groupBy(users.id),
);

// Refresh in a job
await db.execute(sql`REFRESH MATERIALIZED VIEW CONCURRENTLY user_stats`);

// Read fast
const stats = await db.select().from(userStats);
```

## Batch operations

### Chunk processing

```ts
import { eq } from "drizzle-orm";
import { db } from "../../features/drizzle";
import { users } from "../../features/drizzle/schemas";

async function* chunked<T>(array: T[], size: number) {
	for (let i = 0; i < array.length; i += size) {
		yield array.slice(i, i + size);
	}
}

export async function bulkUpdate(updates: { id: number; name: string }[]) {
	for await (const chunk of chunked(updates, 100)) {
		await db.transaction(async (tx) => {
			for (const u of chunk) {
				await tx.update(users).set({ name: u.name }).where(eq(users.id, u.id));
			}
		});
	}
}
```

### COPY FROM at scale (postgres only)

```ts
// engine: postgres
import { copyFrom } from "pg-copy-streams";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";

// 10x faster than batch INSERT for very large datasets.
// Requires a low-level postgres client — this is the rare case where you go
// below the `db` abstraction. Document why in a one-line comment.
async function bulkInsert(rows: { email: string; name: string }[]) {
	// ... acquire a pg client, run COPY, release ...
}
```

For typical bosia apps (< 100k rows in a single load), the chunked transaction above is enough.

## Monitoring & profiling

### Query logging via drizzle logger

`db` is built inside the scaffold, so query logging is opt-in via your own wrapper if you need it. Easiest pattern: wrap individual hot-path queries.

```ts
import { performance } from "node:perf_hooks";

export async function measureQuery<T>(name: string, query: Promise<T>): Promise<T> {
	const start = performance.now();
	try {
		const result = await query;
		const duration = performance.now() - start;
		if (duration > 250) console.warn(`[db.${name}] ${duration.toFixed(1)}ms`);
		return result;
	} catch (err) {
		const duration = performance.now() - start;
		console.error(`[db.${name}] failed after ${duration.toFixed(1)}ms`, err);
		throw err;
	}
}
```

A heavier metrics logger:

```ts
class MetricsLogger {
	private queries = new Map<string, { count: number; totalTime: number }>();

	logQuery(query: string, start: number) {
		const duration = Date.now() - start;
		const stats = this.queries.get(query) ?? { count: 0, totalTime: 0 };
		this.queries.set(query, {
			count: stats.count + 1,
			totalTime: stats.totalTime + duration,
		});
		if (duration > 1000) console.warn(`Slow query (${duration}ms):`, query);
	}

	stats() {
		return Array.from(this.queries.entries()).map(([query, s]) => ({
			query,
			count: s.count,
			avgTime: s.totalTime / s.count,
		}));
	}
}
```

## Best practices

1. Always project explicit columns in user-facing loaders.
2. Index foreign keys + columns that appear in `WHERE` / `ORDER BY` hot paths.
3. Use cursor pagination for any list longer than one page.
4. Batch writes inside `db.transaction(async (tx) => ...)`.
5. Cache (LRU, Redis, materialized view) only after measuring — most pages are fine cold.
6. Use `EXPLAIN` to verify index use; never trust intuition on planner choice.
7. Reserve raw `db.execute(sql\`...\`)` for cases the builder can't express, and leave a one-line comment explaining why.
8. Leave bun-only drivers to the scaffold — never `import { Pool } from "pg"` or `import Database from "better-sqlite3"`.
