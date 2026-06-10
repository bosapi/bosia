import { pgTable, uuid, text, integer, timestamp } from "drizzle-orm/pg-core";
import { user } from "../../auth/schemas/user.table";

export const order = pgTable("order", {
	id: uuid("id").defaultRandom().primaryKey(),
	userId: uuid("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	status: text("status").notNull().default("pending"),
	totalCents: integer("total_cents").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
