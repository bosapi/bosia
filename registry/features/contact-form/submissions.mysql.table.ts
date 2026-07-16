import { mysqlTable, varchar, text, timestamp } from "drizzle-orm/mysql-core";

export const contactSubmissions = mysqlTable("contact_submissions", {
	id: varchar("id", { length: 36 })
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: varchar("name", { length: 200 }).notNull(),
	email: varchar("email", { length: 254 }).notNull(),
	message: text("message").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});
