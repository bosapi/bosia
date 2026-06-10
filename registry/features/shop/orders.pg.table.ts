import { pgTable, uuid, text, integer, timestamp } from "drizzle-orm/pg-core";
import { users } from "../../auth/schemas/users.table";

export const orders = pgTable("orders", {
	id: uuid("id").defaultRandom().primaryKey(),
	userId: uuid("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	status: text("status").notNull().default("pending"),
	totalCents: integer("total_cents").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
