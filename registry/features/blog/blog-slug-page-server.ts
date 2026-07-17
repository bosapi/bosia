import { error } from "bosia";
import type { LoadEvent } from "bosia";
import { BlogService } from "../../../features/blog";

export async function load({ params }: LoadEvent) {
	const post = await BlogService.bySlug(params.slug);
	if (!post) error(404, "Post not found");
	return { post, related: await BlogService.related(params.slug) };
}
