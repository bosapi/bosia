import { and, eq, or, isNull, sql } from "drizzle-orm";
import { db } from "../drizzle";
import { permissions } from "./schemas/permissions.table";

/**
 * Check whether `userId` is granted `resource.action` (optionally on `scope`).
 *
 * Matches if any row satisfies all of:
 *   - row.userId = userId
 *   - row.resource = resource OR row.resource = '*'
 *   - row.action = action     OR row.action = '*'
 *   - row.scope = scope       OR row.scope IS NULL/empty (= "any scope")
 */
export async function can(
	userId: string | undefined,
	resource: string,
	action: string,
	scope?: string,
): Promise<boolean> {
	if (!userId) return false;

	const scopeMatches = scope
		? or(isNull(permissions.scope), eq(permissions.scope, ""), eq(permissions.scope, scope))
		: or(isNull(permissions.scope), eq(permissions.scope, ""));

	const rows = await db
		.select({ one: sql<number>`1` })
		.from(permissions)
		.where(
			and(
				eq(permissions.userId, userId),
				or(eq(permissions.resource, resource), eq(permissions.resource, "*")),
				or(eq(permissions.action, action), eq(permissions.action, "*")),
				scopeMatches,
			),
		)
		.limit(1);

	return rows.length > 0;
}

export async function grant(
	userId: string,
	resource: string,
	action: string,
	scope: string | null = null,
) {
	await db
		.insert(permissions)
		.values({ userId, resource, action, scope: scope ?? "" })
		.onConflictDoNothing?.();
}
