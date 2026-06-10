import { pgTable, uuid, text, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { user } from "../../auth/schemas/user.table";

export const product = pgTable("product", {
	id: uuid("id").defaultRandom().primaryKey(),
	name: text("name").notNull(),
	slug: text("slug").notNull().unique(),
	description: text("description").notNull().default(""),
	priceCents: integer("price_cents").notNull(),
	images: jsonb("images").$type<string[]>().notNull().default([]),
	createdBy: uuid("created_by")
		.notNull()
		.references(() => user.id, { onDelete: "restrict" }),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
