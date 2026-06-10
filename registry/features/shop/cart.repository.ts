import { and, eq } from "drizzle-orm";
import { db } from "../drizzle";
import { cartItem } from "./schemas/cart-item.table";

export class CartRepository {
	static listForUser(userId: string) {
		return db.query.cartItem.findMany({
			where: eq(cartItem.userId, userId),
			orderBy: (c, { desc }) => [desc(c.createdAt)],
		});
	}

	static find(userId: string, productId: string) {
		return db.query.cartItem.findFirst({
			where: and(eq(cartItem.userId, userId), eq(cartItem.productId, productId)),
		});
	}

	static async add(userId: string, productId: string, quantity: number) {
		const existing = await CartRepository.find(userId, productId);
		if (existing) {
			const [row] = await db
				.update(cartItem)
				.set({ quantity: existing.quantity + quantity })
				.where(eq(cartItem.id, existing.id))
				.returning();
			return row;
		}
		const [row] = await db.insert(cartItem).values({ userId, productId, quantity }).returning();
		return row;
	}

	static async setQuantity(userId: string, productId: string, quantity: number) {
		const [row] = await db
			.update(cartItem)
			.set({ quantity })
			.where(and(eq(cartItem.userId, userId), eq(cartItem.productId, productId)))
			.returning();
		return row;
	}

	static async remove(userId: string, productId: string) {
		await db
			.delete(cartItem)
			.where(and(eq(cartItem.userId, userId), eq(cartItem.productId, productId)));
	}

	static async clear(userId: string) {
		await db.delete(cartItem).where(eq(cartItem.userId, userId));
	}
}
