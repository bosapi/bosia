import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { order } from "./order.table";
import { product } from "./product.table";

export const orderItem = sqliteTable("order_item", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	orderId: text("order_id")
		.notNull()
		.references(() => order.id, { onDelete: "cascade" }),
	productId: text("product_id")
		.notNull()
		.references(() => product.id, { onDelete: "restrict" }),
	quantity: integer("quantity").notNull(),
	unitPriceCents: integer("unit_price_cents").notNull(),
});
