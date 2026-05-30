import { mysqlTable, varchar, text, int, timestamp } from "drizzle-orm/mysql-core";

export const file = mysqlTable("file", {
	id: varchar("id", { length: 36 })
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: varchar("user_id", { length: 36 }).notNull(),
	key: varchar("key", { length: 255 }).notNull().unique(),
	url: text("url").notNull(),
	mime: varchar("mime", { length: 127 }).notNull(),
	size: int("size").notNull(),
	width: int("width"),
	height: int("height"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});
