import { and, eq } from "drizzle-orm";
import { db } from "../drizzle";
import { cartItems } from "./schemas/cart-items.table";

export class CartRepository {
	static listForUser(userId: string) {
		return db.query.cartItems.findMany({
			where: eq(cartItems.userId, userId),
			orderBy: (c, { desc }) => [desc(c.createdAt)],
		});
	}

	static find(userId: string, productId: string) {
		return db.query.cartItems.findFirst({
			where: and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)),
		});
	}

	static async add(userId: string, productId: string, quantity: number) {
		const existing = await CartRepository.find(userId, productId);
		if (existing) {
			const [row] = await db
				.update(cartItems)
				.set({ quantity: existing.quantity + quantity })
				.where(eq(cartItems.id, existing.id))
				.returning();
			return row;
		}
		const [row] = await db.insert(cartItems).values({ userId, productId, quantity }).returning();
		return row;
	}

	static async setQuantity(userId: string, productId: string, quantity: number) {
		const [row] = await db
			.update(cartItems)
			.set({ quantity })
			.where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)))
			.returning();
		return row;
	}

	static async remove(userId: string, productId: string) {
		await db
			.delete(cartItems)
			.where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)));
	}

	static async clear(userId: string) {
		await db.delete(cartItems).where(eq(cartItems.userId, userId));
	}
}
