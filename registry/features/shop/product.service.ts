import * as v from "valibot";
import { ProductRepository } from "./product.repository";
import {
	ProductCreateSchema,
	ProductUpdateSchema,
	type ProductCreateInput,
	type ProductUpdateInput,
} from "./product.validator";

export class ProductService {
	static list() {
		return ProductRepository.getAll();
	}

	static get(id: string) {
		return ProductRepository.getById(id);
	}

	static getBySlug(slug: string) {
		return ProductRepository.getBySlug(slug);
	}

	static async create(input: ProductCreateInput, createdBy: string) {
		const data = v.parse(ProductCreateSchema, input);
		const existing = await ProductRepository.getBySlug(data.slug);
		if (existing) throw new Error(`Slug "${data.slug}" already in use`);
		return ProductRepository.create({ ...data, createdBy });
	}

	static async update(id: string, input: ProductUpdateInput) {
		const data = v.parse(ProductUpdateSchema, input);
		const existing = await ProductRepository.getById(id);
		if (!existing) throw new Error("Product not found");
		return ProductRepository.update(id, data);
	}

	static async remove(id: string) {
		const existing = await ProductRepository.getById(id);
		if (!existing) throw new Error("Product not found");
		await ProductRepository.remove(id);
	}
}
