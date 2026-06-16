import { readFileSync, statSync, existsSync } from "fs";
import { join } from "path";
import { parseMarkdown, getHighlighter, type DocPage } from "./markdown";

// Resolve relative to the docs project root (where `bun run dev|build` is invoked).
// `import.meta.dir` sits at different depths in dev (`.bosia/dev/server/`) vs prod
// (`dist/server/`), so going up two levels misses the content dir in dev.
const contentDir = join(process.cwd(), "content", "docs");

interface CacheEntry {
	mtime: number;
	page: DocPage;
}

const cache = new Map<string, CacheEntry>();

/**
 * Check whether a doc page exists for a slug, without parsing it.
 * Mirrors loadDoc's resolution: `<slug>.md` or `<slug>/index.md`.
 */
export function docExists(slug: string): boolean {
	const s = slug || "index";
	if (s.includes("..")) return false;
	return existsSync(join(contentDir, `${s}.md`)) || existsSync(join(contentDir, `${s}/index.md`));
}

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
		const demoFile = join(
			process.cwd(),
			"src",
			"lib",
			"components",
			"demos",
			`${page.frontmatter.demo}.svelte`,
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
