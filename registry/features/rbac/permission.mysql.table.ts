import { mysqlTable, varchar, timestamp, primaryKey } from "drizzle-orm/mysql-core";
import { user } from "../../auth/schemas/user.table";

export const permission = mysqlTable(
	"permission",
	{
		userId: varchar("user_id", { length: 36 })
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		resource: varchar("resource", { length: 64 }).notNull(),
		action: varchar("action", { length: 64 }).notNull(),
		scope: varchar("scope", { length: 128 }).notNull().default(""),
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.userId, t.resource, t.action, t.scope] }),
	}),
);
