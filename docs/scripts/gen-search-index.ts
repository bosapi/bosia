/**
 * Generates public/search-index.json — page titles + H2 headings for the
 * ⌘K docs search. public/ is copied into dist/static at build time, so the
 * file is served at /search-index.json in dev and prod.
 */

import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import matter from "gray-matter";
import { slugifyHeading } from "../src/lib/docs/markdown";
import { getLocale, stripLocale, localizeUrl } from "../src/lib/docs/i18n";
import type { Locale } from "../src/lib/docs/i18n";

const contentDir = join(process.cwd(), "content", "docs");
const outDir = join(process.cwd(), "public");

type SearchEntry = {
	title: string;
	url: string;
	locale: Locale;
	headings: { text: string; id: string }[];
};

function scanFiles(dir: string, prefix: string): { slug: string; path: string }[] {
	const files: { slug: string; path: string }[] = [];
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const full = join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...scanFiles(full, prefix ? `${prefix}/${entry.name}` : entry.name));
		} else if (entry.name.endsWith(".md")) {
			const base = entry.name.replace(/\.md$/, "");
			const slug = base === "index" ? prefix : prefix ? `${prefix}/${base}` : base;
			if (!slug) continue; // root index is the landing page, not a doc
			files.push({ slug, path: full });
		}
	}
	return files;
}

// H2s only, skipping fenced code blocks (``` / ~~~) so `## comments` in code don't leak in.
function extractH2s(body: string): { text: string; id: string }[] {
	const headings: { text: string; id: string }[] = [];
	let inFence = false;
	for (const line of body.split("\n")) {
		if (/^(```|~~~)/.test(line.trim())) {
			inFence = !inFence;
			continue;
		}
		if (inFence) continue;
		const m = line.match(/^##\s+(.+?)\s*$/);
		if (!m) continue;
		const text = m[1].replace(/<[^>]*>/g, "");
		const id = slugifyHeading(m[1]);
		if (headings.some((h) => h.id === id)) continue; // dupes anchor to the first anyway
		headings.push({ text, id });
	}
	return headings;
}

const entries: SearchEntry[] = [];
for (const { slug, path } of scanFiles(contentDir, "")) {
	const { data: frontmatter, content } = matter(readFileSync(path, "utf-8"));
	if (!frontmatter.title) continue;
	const locale = getLocale(slug);
	entries.push({
		title: frontmatter.title,
		url: localizeUrl(stripLocale(slug), locale),
		locale,
		headings: extractH2s(content),
	});
}

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "search-index.json"), JSON.stringify(entries));
console.log(`✓ search-index.json written (${entries.length} pages)`);
