import { mysqlTable, varchar, text, timestamp } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
	id: varchar("id", { length: 36 })
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	email: varchar("email", { length: 320 }).notNull().unique(),
	passwordHash: text("password_hash").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});
