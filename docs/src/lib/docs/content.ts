import { readFileSync, statSync, existsSync } from "fs";
import { join, resolve } from "path";
import { parseMarkdown, type DocPage } from "./markdown";

// Resolve content directory relative to the docs project root (cwd at runtime)
const contentDir = resolve(process.cwd(), "content", "docs");

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

    const filePath = join(contentDir, `${slug}.md`);

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

    cache.set(key, { mtime, page });
    return page;
}
