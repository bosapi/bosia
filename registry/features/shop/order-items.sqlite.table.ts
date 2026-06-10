import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { orders } from "./orders.table";
import { products } from "./products.table";

export const orderItems = sqliteTable("order_items", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	orderId: text("order_id")
		.notNull()
		.references(() => orders.id, { onDelete: "cascade" }),
	productId: text("product_id")
		.notNull()
		.references(() => products.id, { onDelete: "restrict" }),
	quantity: integer("quantity").notNull(),
	unitPriceCents: integer("unit_price_cents").notNull(),
});
