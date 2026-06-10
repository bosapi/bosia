import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { users } from "../../auth/schemas/users.table";

export const orders = sqliteTable("orders", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	status: text("status").notNull().default("pending"),
	totalCents: integer("total_cents").notNull(),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
});
