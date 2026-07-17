import { mysqlTable, varchar, text, timestamp } from "drizzle-orm/mysql-core";

export const posts = mysqlTable("posts", {
	id: varchar("id", { length: 36 })
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	slug: varchar("slug", { length: 200 }).notNull().unique(),
	title: varchar("title", { length: 300 }).notNull(),
	excerpt: text("excerpt").notNull(),
	body: text("body").notNull(),
	cover: varchar("cover", { length: 500 }),
	tag: varchar("tag", { length: 100 }),
	publishedAt: timestamp("published_at"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});
