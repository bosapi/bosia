import { eq } from "drizzle-orm";
import { db } from "../drizzle";
import { order } from "./schemas/order.table";
import { orderItem } from "./schemas/order-item.table";
import type { InferInsertModel } from "drizzle-orm";

export type NewOrder = InferInsertModel<typeof order>;
export type NewOrderItem = InferInsertModel<typeof orderItem>;

export class OrderRepository {
	static getAllForUser(userId: string) {
		return db.query.order.findMany({
			where: eq(order.userId, userId),
			orderBy: (o, { desc }) => [desc(o.createdAt)],
		});
	}

	static getById(id: string) {
		return db.query.order.findFirst({ where: eq(order.id, id) });
	}

	static getItems(orderId: string) {
		return db.query.orderItem.findMany({ where: eq(orderItem.orderId, orderId) });
	}

	static async create(data: NewOrder, items: Omit<NewOrderItem, "orderId">[]) {
		const [row] = await db.insert(order).values(data).returning();
		if (items.length > 0) {
			await db.insert(orderItem).values(items.map((i) => ({ ...i, orderId: row.id })));
		}
		return row;
	}

	static async updateStatus(id: string, status: string) {
		const [row] = await db
			.update(order)
			.set({ status, updatedAt: new Date() })
			.where(eq(order.id, id))
			.returning();
		return row;
	}
}
