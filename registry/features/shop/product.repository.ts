import { eq } from "drizzle-orm";
import { db } from "../drizzle";
import { products } from "./schemas/products.table";
import type { InferInsertModel } from "drizzle-orm";

export type NewProduct = InferInsertModel<typeof products>;

export class ProductRepository {
	static getAll() {
		return db.query.products.findMany({
			orderBy: (p, { desc }) => [desc(p.createdAt)],
		});
	}

	static getById(id: string) {
		return db.query.products.findFirst({ where: eq(products.id, id) });
	}

	static getBySlug(slug: string) {
		return db.query.products.findFirst({ where: eq(products.slug, slug) });
	}

	static async create(data: NewProduct) {
		const [row] = await db.insert(products).values(data).returning();
		return row;
	}

	static async update(id: string, data: Partial<NewProduct>) {
		const [row] = await db
			.update(products)
			.set({ ...data, updatedAt: new Date() })
			.where(eq(products.id, id))
			.returning();
		return row;
	}

	static async remove(id: string) {
		await db.delete(products).where(eq(products.id, id));
	}
}
