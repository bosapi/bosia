import { OrderRepository, type NewOrderItem } from "./order.repository";
import { ProductRepository } from "./product.repository";

export interface CheckoutLine {
	productId: string;
	quantity: number;
}

export class OrderService {
	static list(userId: string) {
		return OrderRepository.getAllForUser(userId);
	}

	static get(id: string) {
		return OrderRepository.getById(id);
	}

	static items(orderId: string) {
		return OrderRepository.getItems(orderId);
	}

	static async checkout(userId: string, lines: CheckoutLine[]) {
		if (lines.length === 0) throw new Error("Cart is empty");

		const items: Omit<NewOrderItem, "orderId">[] = [];
		let totalCents = 0;

		for (const line of lines) {
			if (line.quantity < 1) throw new Error("Invalid quantity");
			const p = await ProductRepository.getById(line.productId);
			if (!p) throw new Error(`Product ${line.productId} not found`);
			totalCents += p.priceCents * line.quantity;
			items.push({
				productId: p.id,
				quantity: line.quantity,
				unitPriceCents: p.priceCents,
			});
		}

		return OrderRepository.create({ userId, status: "pending", totalCents }, items);
	}

	static updateStatus(id: string, status: string) {
		return OrderRepository.updateStatus(id, status);
	}
}
