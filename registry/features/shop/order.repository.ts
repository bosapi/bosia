import { eq } from "drizzle-orm";
import { db } from "../drizzle";
import { orders } from "./schemas/orders.table";
import { orderItems } from "./schemas/order-items.table";
import type { InferInsertModel } from "drizzle-orm";

export type NewOrder = InferInsertModel<typeof orders>;
export type NewOrderItem = InferInsertModel<typeof orderItems>;

export class OrderRepository {
	static getAllForUser(userId: string) {
		return db.query.orders.findMany({
			where: eq(orders.userId, userId),
			orderBy: (o, { desc }) => [desc(o.createdAt)],
		});
	}

	static getById(id: string) {
		return db.query.orders.findFirst({ where: eq(orders.id, id) });
	}

	static getItems(orderId: string) {
		return db.query.orderItems.findMany({ where: eq(orderItems.orderId, orderId) });
	}

	static async create(data: NewOrder, items: Omit<NewOrderItem, "orderId">[]) {
		const [row] = await db.insert(orders).values(data).returning();
		if (items.length > 0) {
			await db.insert(orderItems).values(items.map((i) => ({ ...i, orderId: row.id })));
		}
		return row;
	}

	static async updateStatus(id: string, status: string) {
		const [row] = await db
			.update(orders)
			.set({ status, updatedAt: new Date() })
			.where(eq(orders.id, id))
			.returning();
		return row;
	}
}
