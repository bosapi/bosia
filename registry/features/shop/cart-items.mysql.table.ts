import { mysqlTable, varchar, int, timestamp, unique } from "drizzle-orm/mysql-core";
import { users } from "../../auth/schemas/users.table";
import { products } from "./products.table";

export const cartItems = mysqlTable(
	"cart_items",
	{
		id: varchar("id", { length: 36 })
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		userId: varchar("user_id", { length: 36 })
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		productId: varchar("product_id", { length: 36 })
			.notNull()
			.references(() => products.id, { onDelete: "cascade" }),
		quantity: int("quantity").notNull().default(1),
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(t) => ({
		uniqUserProduct: unique().on(t.userId, t.productId),
	}),
);
