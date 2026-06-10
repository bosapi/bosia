import * as v from "valibot";

export const ProductCreateSchema = v.object({
	name: v.pipe(v.string(), v.minLength(1, "Name is required"), v.maxLength(255)),
	slug: v.pipe(
		v.string(),
		v.minLength(1, "Slug is required"),
		v.regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, digits and dashes"),
	),
	description: v.optional(v.string(), ""),
	priceCents: v.pipe(v.number(), v.integer(), v.minValue(0)),
	images: v.optional(v.array(v.string()), []),
});

export const ProductUpdateSchema = v.partial(ProductCreateSchema);

export type ProductCreateInput = v.InferOutput<typeof ProductCreateSchema>;
export type ProductUpdateInput = v.InferOutput<typeof ProductUpdateSchema>;
