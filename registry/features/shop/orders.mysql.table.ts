import { mysqlTable, varchar, int, timestamp } from "drizzle-orm/mysql-core";
import { users } from "../../auth/schemas/users.table";

export const orders = mysqlTable("orders", {
	id: varchar("id", { length: 36 })
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: varchar("user_id", { length: 36 })
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	status: varchar("status", { length: 32 }).notNull().default("pending"),
	totalCents: int("total_cents").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
