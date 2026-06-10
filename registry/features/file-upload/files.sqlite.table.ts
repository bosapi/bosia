import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const files = sqliteTable("files", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text("user_id").notNull(),
	key: text("key").notNull().unique(),
	url: text("url").notNull(),
	mime: text("mime").notNull(),
	size: integer("size").notNull(),
	width: integer("width"),
	height: integer("height"),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
});
