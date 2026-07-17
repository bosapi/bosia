import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const posts = pgTable("posts", {
	id: uuid("id").defaultRandom().primaryKey(),
	slug: text("slug").notNull().unique(),
	title: text("title").notNull(),
	excerpt: text("excerpt").notNull(),
	body: text("body").notNull(),
	cover: text("cover"),
	tag: text("tag"),
	publishedAt: timestamp("published_at", { withTimezone: true }),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
