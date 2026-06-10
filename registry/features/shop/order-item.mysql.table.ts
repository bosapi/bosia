import { mysqlTable, varchar, int } from "drizzle-orm/mysql-core";
import { order } from "./order.table";
import { product } from "./product.table";

export const orderItem = mysqlTable("order_item", {
	id: varchar("id", { length: 36 })
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	orderId: varchar("order_id", { length: 36 })
		.notNull()
		.references(() => order.id, { onDelete: "cascade" }),
	productId: varchar("product_id", { length: 36 })
		.notNull()
		.references(() => product.id, { onDelete: "restrict" }),
	quantity: int("quantity").notNull(),
	unitPriceCents: int("unit_price_cents").notNull(),
});
