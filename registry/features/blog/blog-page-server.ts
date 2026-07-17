import { BlogService } from "../../features/blog";

export async function load() {
	return { posts: await BlogService.list() };
}
