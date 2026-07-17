import type { Database } from "../index";
import { posts } from "../../blog/schemas/posts.table";

const sample = [
	{
		slug: "shipping-beats-polishing",
		title: "Shipping beats polishing",
		excerpt: "Why a released rough edge teaches you more than an unreleased perfect one.",
		body: "<p>The fastest way to learn what a feature is worth is to put it in front of people who didn't build it. Polish delays that lesson; shipping collects it.</p><h2>Rough edges are feedback magnets</h2><p>Users forgive an honest rough edge far more readily than a missing capability. What they won't do is imagine the feature you kept on a branch.</p>",
		cover: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1600&q=80",
		tag: "Product",
		publishedAt: new Date("2026-05-12"),
	},
	{
		slug: "boring-stack-fast-team",
		title: "A boring stack makes a fast team",
		excerpt: "We replaced four services with one database table and nobody noticed but us.",
		body: "<p>Every technology you add is a technology someone has to page through at 3am. We picked boring on purpose, and shipping got faster.</p>",
		cover: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=1600&q=80",
		tag: "Engineering",
		publishedAt: new Date("2026-04-28"),
	},
	{
		slug: "support-is-research",
		title: "Support tickets are user research",
		excerpt: "Every reply we send doubles as an interview we didn't have to schedule.",
		body: "<p>Nobody writes a support ticket about a feature they don't use. The inbox is a ranked list of what matters, updated daily, free.</p>",
		cover: "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1600&q=80",
		tag: "Product",
		publishedAt: new Date("2026-03-21"),
	},
];

export async function seed(db: Database) {
	// idempotent without dialect-specific onConflict: skip when any post exists
	const existing = await db.query.posts.findFirst();
	if (existing) return;
	await db.insert(posts).values(sample);
}
