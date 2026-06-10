import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { users } from "../../auth/schemas/users.table";

export const permissions = sqliteTable(
	"permissions",
	{
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		resource: text("resource").notNull(),
		action: text("action").notNull(),
		scope: text("scope").notNull().default(""),
		createdAt: integer("created_at", { mode: "timestamp" })
			.notNull()
			.default(sql`(unixepoch())`),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.userId, t.resource, t.action, t.scope] }),
	}),
);
