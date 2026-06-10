import { pgTable, uuid, text, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { user } from "../../auth/schemas/user.table";

export const permission = pgTable(
	"permission",
	{
		userId: uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		resource: text("resource").notNull(),
		action: text("action").notNull(),
		scope: text("scope"),
		createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.userId, t.resource, t.action, t.scope] }),
	}),
);
