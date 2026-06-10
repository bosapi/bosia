import { pgTable, uuid, integer, timestamp, unique } from "drizzle-orm/pg-core";
import { user } from "../../auth/schemas/user.table";
import { product } from "./product.table";

export const cartItem = pgTable(
	"cart_item",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		userId: uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		productId: uuid("product_id")
			.notNull()
			.references(() => product.id, { onDelete: "cascade" }),
		quantity: integer("quantity").notNull().default(1),
		createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => ({
		uniqUserProduct: unique().on(t.userId, t.productId),
	}),
);
