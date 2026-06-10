import { CartRepository } from "./cart.repository";
import { ProductRepository } from "./product.repository";

export class CartService {
	static list(userId: string) {
		return CartRepository.listForUser(userId);
	}

	static async add(userId: string, productId: string, quantity = 1) {
		if (quantity < 1) throw new Error("Quantity must be at least 1");
		const product = await ProductRepository.getById(productId);
		if (!product) throw new Error("Product not found");
		return CartRepository.add(userId, productId, quantity);
	}

	static async setQuantity(userId: string, productId: string, quantity: number) {
		if (quantity < 1) {
			await CartRepository.remove(userId, productId);
			return null;
		}
		return CartRepository.setQuantity(userId, productId, quantity);
	}

	static remove(userId: string, productId: string) {
		return CartRepository.remove(userId, productId);
	}

	static clear(userId: string) {
		return CartRepository.clear(userId);
	}
}
