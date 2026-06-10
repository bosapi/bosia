import { pgTable, uuid, integer, timestamp, unique } from "drizzle-orm/pg-core";
import { users } from "../../auth/schemas/users.table";
import { products } from "./products.table";

export const cartItems = pgTable(
	"cart_items",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		userId: uuid("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		productId: uuid("product_id")
			.notNull()
			.references(() => products.id, { onDelete: "cascade" }),
		quantity: integer("quantity").notNull().default(1),
		createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => ({
		uniqUserProduct: unique().on(t.userId, t.productId),
	}),
);
