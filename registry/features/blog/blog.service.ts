import { PostRepository, type Post } from "./post.repository";

// "12 May 2026" — matches the human format the blog blocks render
const human = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" });

function toCard(post: Post) {
	const published = post.publishedAt ?? post.createdAt;
	return {
		slug: post.slug,
		title: post.title,
		excerpt: post.excerpt,
		tag: post.tag ?? "Blog",
		date: human.format(published),
		datetime: published.toISOString().slice(0, 10),
	};
}

export class BlogService {
	static async list() {
		return (await PostRepository.listPublished()).map(toCard);
	}

	static async bySlug(slug: string) {
		const post = await PostRepository.bySlug(slug);
		if (!post || !post.publishedAt) return null;
		return { ...toCard(post), body: post.body, cover: post.cover };
	}

	static async related(slug: string) {
		return (await PostRepository.related(slug)).map(toCard);
	}
}
