import { error } from "bosia";
import type { LoadEvent } from "bosia";
import { loadDoc } from "$lib/docs/content";
import { getLocale, stripLocale } from "$lib/docs/i18n";
import { buildSeoMeta } from "$lib/docs/seo";
import { readdirSync } from "fs";
import { join } from "path";

export const prerender = true;

export function entries(): Record<string, string>[] {
	const contentDir = join(process.cwd(), "content", "docs");
	const slugs: Record<string, string>[] = [];

	function scan(dir: string, prefix: string) {
		for (const entry of readdirSync(dir, { withFileTypes: true })) {
			if (entry.isDirectory()) {
				scan(join(dir, entry.name), prefix ? `${prefix}/${entry.name}` : entry.name);
			} else if (entry.name.endsWith(".md")) {
				const base = entry.name.replace(/\.md$/, "");
				const slug =
					base === "index"
						? prefix // e.g. id/index.md → "id"
						: prefix
							? `${prefix}/${base}` // e.g. guides/routing.md → "guides/routing"
							: base; // e.g. getting-started.md → "getting-started"
				if (slug) {
					// Filter out root empty slug (landing page handled separately)
					slugs.push({ slug });
				}
			}
		}
	}

	scan(contentDir, "");
	return slugs;
}

export async function load({ params, url, metadata }: LoadEvent) {
	const slug = params.slug || "";
	const locale = getLocale(slug);
	const bareSlug = stripLocale(slug);

	const page = metadata?.page ?? (await loadDoc(slug));

	if (!page) {
		error(404, "Not found");
	}

	return {
		html: page.html,
		headings: page.headings,
		frontmatter: page.frontmatter,
		demoCode: page.demoCode ?? null,
		currentSlug: bareSlug,
		locale,
	};
}

export async function metadata({ params }: { params: Record<string, string> }) {
	const slug = params.slug || "";
	const page = await loadDoc(slug);
	const title = page?.frontmatter?.title;
	const description = page?.frontmatter?.description;
	const locale = getLocale(slug);
	const bareSlug = stripLocale(slug);

	const fullTitle = title ? `${title} - Bosia Docs` : "Bosia Docs";
	const seo = buildSeoMeta({
		title: fullTitle,
		description:
			description || "Documentation for Bosia — the fullstack framework for Bun + Svelte.",
		slug: bareSlug,
		locale,
	});

	return {
		title: fullTitle,
		description: description || undefined,
		...seo,
		data: { page },
	};
}
