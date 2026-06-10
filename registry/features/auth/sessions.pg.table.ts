import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users.table";

export const sessions = pgTable("sessions", {
	id: text("id").primaryKey(),
	userId: uuid("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
