import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	email: text("email").notNull().unique(),
	passwordHash: text("password_hash").notNull(),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
});
