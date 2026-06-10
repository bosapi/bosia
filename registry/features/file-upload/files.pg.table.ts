import { pgTable, uuid, text, integer, timestamp } from "drizzle-orm/pg-core";

export const files = pgTable("files", {
	id: uuid("id").defaultRandom().primaryKey(),
	userId: text("user_id").notNull(),
	key: text("key").notNull().unique(),
	url: text("url").notNull(),
	mime: text("mime").notNull(),
	size: integer("size").notNull(),
	width: integer("width"),
	height: integer("height"),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
