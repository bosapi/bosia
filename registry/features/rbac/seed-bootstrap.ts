import { sql } from "drizzle-orm";
import type { Database } from "../index";
import { user } from "../../auth/schemas/user.table";
import { permission } from "../../rbac/schemas/permission.table";

/**
 * First-user bootstrap: when exactly one user exists and they have no
 * permissions yet, grant them `(*, *, '')` — full access. Idempotent.
 */
export async function seed(db: Database) {
	const users = await db.select({ id: user.id }).from(user).limit(2);
	if (users.length !== 1) return;

	const firstUser = users[0];

	const existing = await db
		.select({ one: sql<number>`1` })
		.from(permission)
		.where(sql`${permission.userId} = ${firstUser.id}`)
		.limit(1);
	if (existing.length > 0) return;

	await db.insert(permission).values({
		userId: firstUser.id,
		resource: "*",
		action: "*",
		scope: "",
	});

	console.log(`  granted full access to first user ${firstUser.id}`);
}
