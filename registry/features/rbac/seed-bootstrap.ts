import { sql } from "drizzle-orm";
import type { Database } from "../index";
import { users } from "../../auth/schemas/users.table";
import { permissions } from "../../rbac/schemas/permissions.table";

/**
 * First-user bootstrap: when exactly one user exists and they have no
 * permissions yet, grant them `(*, *, '')` — full access. Idempotent.
 */
export async function seed(db: Database) {
	const rows = await db.select({ id: users.id }).from(users).limit(2);
	if (rows.length !== 1) return;

	const firstUser = rows[0];

	const existing = await db
		.select({ one: sql<number>`1` })
		.from(permissions)
		.where(sql`${permissions.userId} = ${firstUser.id}`)
		.limit(1);
	if (existing.length > 0) return;

	await db.insert(permissions).values({
		userId: firstUser.id,
		resource: "*",
		action: "*",
		scope: "",
	});

	console.log(`  granted full access to first user ${firstUser.id}`);
}
