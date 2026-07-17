import { db } from "../drizzle";
import { posts } from "./schemas/posts.table";

export type Post = typeof posts.$inferSelect;

export class PostRepository {
	static listPublished() {
		return db.query.posts.findMany({
			where: (p, { isNotNull }) => isNotNull(p.publishedAt),
			orderBy: (p, { desc }) => [desc(p.publishedAt)],
		});
	}

	static bySlug(slug: string) {
		return db.query.posts.findFirst({
			where: (p, { eq }) => eq(p.slug, slug),
		});
	}

	// related = most recent other published posts; swap for tag matching if you need smarter picks
	static related(slug: string, limit = 3) {
		return db.query.posts.findMany({
			where: (p, { and, ne, isNotNull }) => and(ne(p.slug, slug), isNotNull(p.publishedAt)),
			orderBy: (p, { desc }) => [desc(p.publishedAt)],
			limit,
		});
	}
}
