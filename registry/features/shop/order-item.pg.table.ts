import { pgTable, uuid, integer } from "drizzle-orm/pg-core";
import { order } from "./order.table";
import { product } from "./product.table";

export const orderItem = pgTable("order_item", {
	id: uuid("id").defaultRandom().primaryKey(),
	orderId: uuid("order_id")
		.notNull()
		.references(() => order.id, { onDelete: "cascade" }),
	productId: uuid("product_id")
		.notNull()
		.references(() => product.id, { onDelete: "restrict" }),
	quantity: integer("quantity").notNull(),
	unitPriceCents: integer("unit_price_cents").notNull(),
});
