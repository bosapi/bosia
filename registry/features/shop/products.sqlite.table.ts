import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { user } from "../../auth/schemas/user.table";

export const product = sqliteTable("product", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: text("name").notNull(),
	slug: text("slug").notNull().unique(),
	description: text("description").notNull().default(""),
	priceCents: integer("price_cents").notNull(),
	images: text("images", { mode: "json" }).$type<string[]>().notNull().default([]),
	createdBy: text("created_by")
		.notNull()
		.references(() => user.id, { onDelete: "restrict" }),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
});
