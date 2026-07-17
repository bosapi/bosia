import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
	id: uuid("id").defaultRandom().primaryKey(),
	email: text("email").notNull().unique(),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
