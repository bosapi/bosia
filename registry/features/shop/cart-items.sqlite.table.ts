import { sqliteTable, text, integer, unique } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { users } from "../../auth/schemas/users.table";
import { products } from "./products.table";

export const cartItems = sqliteTable(
	"cart_items",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		productId: text("product_id")
			.notNull()
			.references(() => products.id, { onDelete: "cascade" }),
		quantity: integer("quantity").notNull().default(1),
		createdAt: integer("created_at", { mode: "timestamp" })
			.notNull()
			.default(sql`(unixepoch())`),
	},
	(t) => ({
		uniqUserProduct: unique().on(t.userId, t.productId),
	}),
);
