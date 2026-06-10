import { pgTable, uuid, integer } from "drizzle-orm/pg-core";
import { orders } from "./orders.table";
import { products } from "./products.table";

export const orderItems = pgTable("order_items", {
	id: uuid("id").defaultRandom().primaryKey(),
	orderId: uuid("order_id")
		.notNull()
		.references(() => orders.id, { onDelete: "cascade" }),
	productId: uuid("product_id")
		.notNull()
		.references(() => products.id, { onDelete: "restrict" }),
	quantity: integer("quantity").notNull(),
	unitPriceCents: integer("unit_price_cents").notNull(),
});
