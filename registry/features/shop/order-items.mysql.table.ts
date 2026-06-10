import { mysqlTable, varchar, int } from "drizzle-orm/mysql-core";
import { orders } from "./orders.table";
import { products } from "./products.table";

export const orderItems = mysqlTable("order_items", {
	id: varchar("id", { length: 36 })
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	orderId: varchar("order_id", { length: 36 })
		.notNull()
		.references(() => orders.id, { onDelete: "cascade" }),
	productId: varchar("product_id", { length: 36 })
		.notNull()
		.references(() => products.id, { onDelete: "restrict" }),
	quantity: int("quantity").notNull(),
	unitPriceCents: int("unit_price_cents").notNull(),
});
