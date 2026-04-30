import { readFileSync, statSync, existsSync } from "fs";
import { join, resolve } from "path";
import { parseMarkdown, getHighlighter, type DocPage } from "./markdown";

// Resolve content directory relative to the compiled bundle location.
// In the compiled output (docs/dist/server/*.js), import.meta.dir = docs/dist/server/
// so ../../content/docs reliably points to docs/content/docs regardless of cwd.
const contentDir = resolve(import.meta.dir, "../../content/docs");

interface CacheEntry {
	mtime: number;
	page: DocPage;
}

const cache = new Map<string, CacheEntry>();

/**
 * Load a doc page by slug.
 * - "getting-started" → content/docs/getting-started.md
 * - "id/getting-started" → content/docs/id/getting-started.md
 * - "" → content/docs/index.md (landing page fallback)
 */
export async function loadDoc(slug: string): Promise<DocPage | null> {
	if (!slug) slug = "index";

	// Prevent path traversal
	if (slug.includes("..")) return null;

	let filePath = join(contentDir, `${slug}.md`);

	// Fallback: treat slug as a directory and look for its index
	if (!existsSync(filePath)) {
		filePath = join(contentDir, `${slug}/index.md`);
	}

	if (!existsSync(filePath)) return null;

	const stat = statSync(filePath);
	const mtime = stat.mtimeMs;
	const key = filePath;

	const cached = cache.get(key);
	if (cached && cached.mtime === mtime) {
		return cached.page;
	}

	const raw = readFileSync(filePath, "utf-8");
	const page = await parseMarkdown(raw);

	// If the page has a demo, load and highlight its source
	if (page.frontmatter.demo) {
		const demoFile = resolve(
			import.meta.dir,
			`../../src/lib/components/demos/${page.frontmatter.demo}.svelte`,
		);
		if (existsSync(demoFile)) {
			try {
				const demoSrc = readFileSync(demoFile, "utf-8");
				const hl = await getHighlighter();
				page.demoCode = hl.codeToHtml(demoSrc, {
					lang: "svelte",
					themes: { light: "github-light", dark: "github-dark" },
					defaultColor: false,
				});
			} catch {}
		}
	}

	cache.set(key, { mtime, page });
	return page;
}
