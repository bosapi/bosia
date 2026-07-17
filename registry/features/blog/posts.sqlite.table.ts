import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const posts = sqliteTable("posts", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	slug: text("slug").notNull().unique(),
	title: text("title").notNull(),
	excerpt: text("excerpt").notNull(),
	body: text("body").notNull(),
	cover: text("cover"),
	tag: text("tag"),
	publishedAt: integer("published_at", { mode: "timestamp" }),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
});
