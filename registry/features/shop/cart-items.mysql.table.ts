import { mysqlTable, varchar, int, timestamp, unique } from "drizzle-orm/mysql-core";
import { user } from "../../auth/schemas/user.table";
import { product } from "./product.table";

export const cartItem = mysqlTable(
	"cart_item",
	{
		id: varchar("id", { length: 36 })
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		userId: varchar("user_id", { length: 36 })
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		productId: varchar("product_id", { length: 36 })
			.notNull()
			.references(() => product.id, { onDelete: "cascade" }),
		quantity: int("quantity").notNull().default(1),
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(t) => ({
		uniqUserProduct: unique().on(t.userId, t.productId),
	}),
);
