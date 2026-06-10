import { eq } from "drizzle-orm";
import { db } from "../drizzle";
import { product } from "./schemas/product.table";
import type { InferInsertModel } from "drizzle-orm";

export type NewProduct = InferInsertModel<typeof product>;

export class ProductRepository {
	static getAll() {
		return db.query.product.findMany({
			orderBy: (p, { desc }) => [desc(p.createdAt)],
		});
	}

	static getById(id: string) {
		return db.query.product.findFirst({ where: eq(product.id, id) });
	}

	static getBySlug(slug: string) {
		return db.query.product.findFirst({ where: eq(product.slug, slug) });
	}

	static async create(data: NewProduct) {
		const [row] = await db.insert(product).values(data).returning();
		return row;
	}

	static async update(id: string, data: Partial<NewProduct>) {
		const [row] = await db
			.update(product)
			.set({ ...data, updatedAt: new Date() })
			.where(eq(product.id, id))
			.returning();
		return row;
	}

	static async remove(id: string) {
		await db.delete(product).where(eq(product.id, id));
	}
}
