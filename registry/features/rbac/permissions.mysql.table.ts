import { mysqlTable, varchar, timestamp, primaryKey } from "drizzle-orm/mysql-core";
import { users } from "../../auth/schemas/users.table";

export const permissions = mysqlTable(
	"permissions",
	{
		userId: varchar("user_id", { length: 36 })
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		resource: varchar("resource", { length: 64 }).notNull(),
		action: varchar("action", { length: 64 }).notNull(),
		scope: varchar("scope", { length: 128 }).notNull().default(""),
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.userId, t.resource, t.action, t.scope] }),
	}),
);
