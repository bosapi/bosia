# Query Patterns

Advanced querying techniques, subqueries, CTEs, and raw SQL using the Bosia-scaffolded `db`.

## Bosia adaptation notes

- All examples import the singleton: `import { db } from "../../features/drizzle"` (or the relative path from a `+server.ts` / service file). The scaffold owns the drizzle factory — don't construct your own.
- Tables come from `../../features/drizzle/schemas` (the bosia aggregator) or directly from a feature folder (`features/<feature>/<feature>.table.ts`). See `bosia-drizzle-feature`.
- Every snippet is wrapped in either a `+page.server.ts` `load()` or a service function. Bosia code does not run as top-level scripts.
- `db` is engine-aware: postgres + mysql go through `Bun.SQL`, sqlite goes through `bun:sqlite`. Skip postgres-only constructs (LATERAL, `FOR UPDATE`, `DISTINCT ON`, materialized views) on sqlite — they're called out per section.
- **Service functions stay flat** (`bosia-drizzle-feature` R2). Don't introduce class-based query-builder layers.
- **Prepared statements** are worthwhile in hot-path `+server.ts` actions; not worth the bookkeeping in once-per-page loaders.

## Subqueries

### SELECT subqueries

```ts
// src/routes/products/+page.server.ts
import { avg, gt } from "drizzle-orm";
import { db } from "../../features/drizzle";
import { products } from "../../features/drizzle/schemas";

export async function load() {
	const avgPriceSubq = db.select({ value: avg(products.price) }).from(products);

	const expensive = await db.select().from(products).where(gt(products.price, avgPriceSubq));

	return { expensive };
}
```

### Correlated subquery

```ts
// src/features/authors/authors.service.ts
import { sql } from "drizzle-orm";
import { db } from "../drizzle";
import { authors, posts } from "../drizzle/schemas";

export async function listWithPostCount() {
	return db
		.select({
			author: authors,
			postCount: sql<number>`(
                SELECT COUNT(*)
                FROM ${posts}
                WHERE ${posts.authorId} = ${authors.id}
            )`,
		})
		.from(authors);
}
```

### EXISTS subqueries

```ts
import { sql } from "drizzle-orm";
import { db } from "../../features/drizzle";
import { authors, posts } from "../../features/drizzle/schemas";

export async function load() {
	const withPosts = await db
		.select()
		.from(authors)
		.where(
			sql`EXISTS (
                SELECT 1 FROM ${posts}
                WHERE ${posts.authorId} = ${authors.id}
            )`,
		);

	const withoutPosts = await db
		.select()
		.from(authors)
		.where(
			sql`NOT EXISTS (
                SELECT 1 FROM ${posts}
                WHERE ${posts.authorId} = ${authors.id}
            )`,
		);

	return { withPosts, withoutPosts };
}
```

### IN subqueries

```ts
import { sql } from "drizzle-orm";
import { db } from "../../features/drizzle";
import { comments, users } from "../../features/drizzle/schemas";

const commenters = await db
	.select()
	.from(users)
	.where(
		sql`${users.id} IN (
            SELECT DISTINCT ${comments.userId} FROM ${comments}
        )`,
	);
```

## Common Table Expressions (CTEs)

### Basic CTE

```ts
import { eq, sql } from "drizzle-orm";
import { db } from "../../features/drizzle";
import { authors, posts } from "../../features/drizzle/schemas";

export async function load() {
	const topAuthors = db.$with("top_authors").as(
		db
			.select({
				id: authors.id,
				name: authors.name,
				postCount: sql<number>`COUNT(${posts.id})`.as("post_count"),
			})
			.from(authors)
			.leftJoin(posts, eq(authors.id, posts.authorId))
			.groupBy(authors.id)
			.having(sql`COUNT(${posts.id}) > 10`),
	);

	return { rows: await db.with(topAuthors).select().from(topAuthors) };
}
```

### Recursive CTE (postgres only)

> Bosia's sqlite path doesn't reliably surface recursive CTEs through the drizzle builder. Use raw `db.execute(sql\`...\`)` on sqlite, or use the structured form below on postgres.

```ts
// engine: postgres
import { type AnyPgColumn, integer, pgTable, serial, text } from "drizzle-orm/pg-core";
import { isNull, sql } from "drizzle-orm";
import { db } from "../../features/drizzle";

// (in src/features/<feature>/<feature>.table.ts)
export const employees = pgTable("employees", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	managerId: integer("manager_id").references((): AnyPgColumn => employees.id),
});

// loader / service
const employeeHierarchy = db.$with("employee_hierarchy").as(
	db
		.select({
			id: employees.id,
			name: employees.name,
			managerId: employees.managerId,
			level: sql<number>`1`.as("level"),
		})
		.from(employees)
		.where(isNull(employees.managerId))
		.unionAll(
			db
				.select({
					id: employees.id,
					name: employees.name,
					managerId: employees.managerId,
					level: sql<number>`employee_hierarchy.level + 1`,
				})
				.from(employees)
				.innerJoin(sql`employee_hierarchy`, sql`${employees.managerId} = employee_hierarchy.id`),
		),
);

const hierarchy = await db.with(employeeHierarchy).select().from(employeeHierarchy);
```

### Multiple CTEs

```ts
import { eq, gt, sql } from "drizzle-orm";
import { db } from "../../features/drizzle";
import { posts, users } from "../../features/drizzle/schemas";

const activeUsers = db
	.$with("active_users")
	.as(db.select().from(users).where(eq(users.isActive, true)));

const recentPosts = db.$with("recent_posts").as(
	db
		.select()
		.from(posts)
		.where(gt(posts.createdAt, sql`NOW() - INTERVAL '30 days'`)), // postgres
);

const rows = await db
	.with(activeUsers, recentPosts)
	.select({ user: activeUsers, post: recentPosts })
	.from(activeUsers)
	.leftJoin(recentPosts, eq(activeUsers.id, recentPosts.authorId));
```

## Raw SQL

### Safe raw queries

```ts
import { sql } from "drizzle-orm";
import { db } from "../../features/drizzle";
import { users } from "../../features/drizzle/schemas";

const userId = 123;
// Parameterized — safe from SQL injection
const rows = await db.execute(sql`SELECT * FROM ${users} WHERE ${users.id} = ${userId}`);

const counted = await db.execute<{ count: number }>(sql`SELECT COUNT(*) AS count FROM ${users}`);
```

### SQL template composition

```ts
import { sql } from "drizzle-orm";
import { db } from "../../features/drizzle";
import { users } from "../../features/drizzle/schemas";

const whereActive = () => sql`${users.isActive} = true`;
const whereRole = (role: string) => sql`${users.role} = ${role}`;

const admins = await db
	.select()
	.from(users)
	.where(sql`${whereActive()} AND ${whereRole("admin")}`);
```

### Dynamic WHERE clauses

```ts
import { and, eq, like, type SQL } from "drizzle-orm";
import { db } from "../../features/drizzle";
import { users } from "../../features/drizzle/schemas";

interface Filters {
	name?: string;
	role?: string;
	isActive?: boolean;
}

function buildFilters(f: Filters): SQL | undefined {
	const conditions: SQL[] = [];
	if (f.name) conditions.push(like(users.name, `%${f.name}%`));
	if (f.role) conditions.push(eq(users.role, f.role));
	if (f.isActive !== undefined) conditions.push(eq(users.isActive, f.isActive));
	return conditions.length > 0 ? and(...conditions) : undefined;
}

export async function search(f: Filters) {
	return db.select().from(users).where(buildFilters(f));
}
```

## Aggregations

### Basic aggregates

```ts
import { avg, count, max, min, sum } from "drizzle-orm";
import { db } from "../../features/drizzle";
import { orders, products, users } from "../../features/drizzle/schemas";

const [userCount] = await db.select({ count: count() }).from(users);
const [totalRevenue] = await db.select({ total: sum(orders.amount) }).from(orders);
const [avgPrice] = await db.select({ avg: avg(products.price) }).from(products);

const [stats] = await db
	.select({
		count: count(),
		total: sum(orders.amount),
		avg: avg(orders.amount),
		min: min(orders.amount),
		max: max(orders.amount),
	})
	.from(orders);
```

### GROUP BY with HAVING

```ts
import { count, eq, sql } from "drizzle-orm";
import { db } from "../../features/drizzle";
import { authors, posts } from "../../features/drizzle/schemas";

const prolific = await db
	.select({ author: authors.name, postCount: count(posts.id) })
	.from(authors)
	.leftJoin(posts, eq(authors.id, posts.authorId))
	.groupBy(authors.id)
	.having(sql`COUNT(${posts.id}) > 5`);
```

### Window functions

```ts
import { sql } from "drizzle-orm";
import { db } from "../../features/drizzle";
import { orders, products, users } from "../../features/drizzle/schemas";

const ranked = await db
	.select({
		product: products,
		priceRank: sql<number>`RANK() OVER (PARTITION BY ${products.categoryId} ORDER BY ${products.price} DESC)`,
	})
	.from(products);

const withRunning = await db
	.select({
		order: orders,
		runningTotal: sql<number>`SUM(${orders.amount}) OVER (ORDER BY ${orders.createdAt})`,
	})
	.from(orders);

const numbered = await db
	.select({
		user: users,
		rowNum: sql<number>`ROW_NUMBER() OVER (ORDER BY ${users.createdAt})`,
	})
	.from(users);
```

## Prepared statements

Worth it in hot-path `+server.ts` actions; not worth it in once-per-page loaders.

```ts
// src/features/users/users.service.ts
import { and, eq, like, sql } from "drizzle-orm";
import { db } from "../drizzle";
import { users } from "../drizzle/schemas";

export const getUserById = db
	.select()
	.from(users)
	.where(eq(users.id, sql.placeholder("id")))
	.prepare("get_user_by_id");

// in a +server.ts route handler
const [user] = await getUserById.execute({ id: 1 });

export const searchUsers = db
	.select()
	.from(users)
	.where(and(like(users.name, sql.placeholder("name")), eq(users.role, sql.placeholder("role"))))
	.prepare("search_users");
```

## Batch operations

### Batch insert

```ts
import { sql } from "drizzle-orm";
import { db } from "../../features/drizzle";
import { users } from "../../features/drizzle/schemas";

const created = await db
	.insert(users)
	.values([
		{ email: "user1@example.com", name: "User 1" },
		{ email: "user2@example.com", name: "User 2" },
		{ email: "user3@example.com", name: "User 3" },
	])
	.returning();

// Skip dupes
await db.insert(users).values(bulkUsers).onConflictDoNothing();

// Upsert (postgres / sqlite)
await db
	.insert(users)
	.values(bulkUsers)
	.onConflictDoUpdate({
		target: users.email,
		set: { name: sql`EXCLUDED.name` },
	});
```

### Batch update

```ts
import { eq, sql } from "drizzle-orm";
import { db } from "../../features/drizzle";
import { users } from "../../features/drizzle/schemas";

// Per-row transactional update
await db.transaction(async (tx) => {
	for (const u of updates) {
		await tx.update(users).set({ name: u.name }).where(eq(users.id, u.id));
	}
});

// Bulk update with CASE (postgres / mysql; sqlite supports CASE too)
await db.execute(sql`
    UPDATE ${users}
    SET ${users.role} = CASE ${users.id}
        ${sql.join(
					updates.map((u) => sql`WHEN ${u.id} THEN ${u.role}`),
					sql.raw(" "),
				)}
    END
    WHERE ${users.id} IN (${sql.join(
			updates.map((u) => u.id),
			sql.raw(", "),
		)})
`);
```

### Batch delete

```ts
import { and, eq, inArray, lt } from "drizzle-orm";
import { db } from "../../features/drizzle";
import { posts, users } from "../../features/drizzle/schemas";

await db.delete(users).where(inArray(users.id, [1, 2, 3, 4, 5]));

await db
	.delete(posts)
	.where(and(lt(posts.createdAt, new Date("2023-01-01")), eq(posts.isDraft, true)));
```

## LATERAL joins (postgres only)

```ts
// engine: postgres
import { sql } from "drizzle-orm";
import { db } from "../../features/drizzle";
import { authors, posts } from "../../features/drizzle/schemas";

const topPostsPerAuthor = await db
	.select({ author: authors, post: posts })
	.from(authors)
	.leftJoin(
		sql`LATERAL (
            SELECT * FROM ${posts}
            WHERE ${posts.authorId} = ${authors.id}
            ORDER BY ${posts.views} DESC
            LIMIT 3
        ) AS ${posts}`,
		sql`true`,
	);
```

## UNION queries

```ts
import { sql } from "drizzle-orm";
import { db } from "../../features/drizzle";
import { articles, posts, products, services } from "../../features/drizzle/schemas";

const allContent = await db
	.select({ id: posts.id, title: posts.title, type: sql<string>`'post'` })
	.from(posts)
	.union(
		db
			.select({
				id: articles.id,
				title: articles.title,
				type: sql<string>`'article'`,
			})
			.from(articles),
	);

const allItems = await db
	.select({ id: products.id, name: products.name })
	.from(products)
	.unionAll(db.select({ id: services.id, name: services.name }).from(services));
```

## Distinct

```ts
import { desc } from "drizzle-orm";
import { db } from "../../features/drizzle";
import { posts, users } from "../../features/drizzle/schemas";

// DISTINCT — all engines
const uniqueRoles = await db.selectDistinct({ role: users.role }).from(users);

// DISTINCT ON — postgres only
const latestPerAuthor = await db
	.selectDistinctOn([posts.authorId], { post: posts })
	.from(posts)
	.orderBy(posts.authorId, desc(posts.createdAt));
```

## Locking strategies (postgres + mysql only)

Not supported on sqlite — `bun:sqlite` serializes writes already.

```ts
// engine: postgres | mysql
import { eq } from "drizzle-orm";
import { db } from "../../features/drizzle";
import { tasks, users } from "../../features/drizzle/schemas";

await db.transaction(async (tx) => {
	const [user] = await tx.select().from(users).where(eq(users.id, userId)).for("update");

	await tx
		.update(users)
		.set({ balance: user.balance - amount })
		.where(eq(users.id, userId));
});

// FOR SHARE
const [shared] = await db.select().from(users).where(eq(users.id, userId)).for("share");

// SKIP LOCKED — work-queue pull
const [next] = await db
	.select()
	.from(tasks)
	.where(eq(tasks.status, "pending"))
	.limit(1)
	.for("update", { skipLocked: true });
```

## Avoid N+1

```ts
// ❌ N+1
const list = await db.select().from(authors);
for (const a of list) {
	a.posts = await db.select().from(posts).where(eq(posts.authorId, a.id));
}

// ✅ Single query — relation API
const authorsWithPosts = await db.query.authors.findMany({ with: { posts: true } });

// ✅ Single query — join + groupBy
const rows = await db
	.select({ author: authors, post: posts })
	.from(authors)
	.leftJoin(posts, eq(authors.id, posts.authorId));
```

DataLoader works too but is an extra dep — for typical bosia apps a single join is enough. Reach for DataLoader only when you have a real GraphQL-style resolver fanout.

## Query timeouts

```ts
import { sql } from "drizzle-orm";
import { db } from "../../features/drizzle";

// PostgreSQL session-wide
await db.execute(sql`SET statement_timeout = '5s'`);

// Per-query wrapper
async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
	const t = new Promise<never>((_, reject) =>
		setTimeout(() => reject(new Error("Query timeout")), ms),
	);
	return Promise.race([p, t]);
}
```
