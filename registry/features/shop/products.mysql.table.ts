import { mysqlTable, varchar, text, int, json, timestamp } from "drizzle-orm/mysql-core";
import { user } from "../../auth/schemas/user.table";

export const product = mysqlTable("product", {
	id: varchar("id", { length: 36 })
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: varchar("name", { length: 255 }).notNull(),
	slug: varchar("slug", { length: 255 }).notNull().unique(),
	description: text("description").notNull(),
	priceCents: int("price_cents").notNull(),
	images: json("images").$type<string[]>().notNull(),
	createdBy: varchar("created_by", { length: 36 })
		.notNull()
		.references(() => user.id, { onDelete: "restrict" }),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
