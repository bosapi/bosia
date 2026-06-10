import { mysqlTable, varchar, timestamp } from "drizzle-orm/mysql-core";
import { users } from "./users.table";

export const sessions = mysqlTable("sessions", {
	id: varchar("id", { length: 64 }).primaryKey(),
	userId: varchar("user_id", { length: 36 })
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});
