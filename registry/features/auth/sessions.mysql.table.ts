import { mysqlTable, varchar, timestamp } from "drizzle-orm/mysql-core";
import { user } from "./user.table";

export const session = mysqlTable("session", {
	id: varchar("id", { length: 64 }).primaryKey(),
	userId: varchar("user_id", { length: 36 })
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});
