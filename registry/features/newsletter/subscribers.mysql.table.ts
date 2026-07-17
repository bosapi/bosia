import { mysqlTable, varchar, timestamp } from "drizzle-orm/mysql-core";

export const newsletterSubscribers = mysqlTable("newsletter_subscribers", {
	id: varchar("id", { length: 36 })
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	email: varchar("email", { length: 254 }).notNull().unique(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});
