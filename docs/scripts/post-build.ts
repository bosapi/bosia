/**
 * Post-build script: generates sitemap.xml from content/docs/ markdown files.
 * Run after the main build to write dist/static/sitemap.xml.
 */

import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import matter from "gray-matter";
import { listRegistryWithContent, type RegistryKind } from "../src/lib/registry/list.ts";

const BASE_URL = "https://bosia.bosapi.com";
const contentDir = join(process.cwd(), "content", "docs");
const outDir = join(process.cwd(), "dist", "static");
const skillsDir = join(process.cwd(), "content", "skills");

type PageEntry = { slug: string; locale: "en" | "id" };

function scanPages(dir: string, prefix: string): PageEntry[] {
	const entries: PageEntry[] = [];
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		if (entry.isDirectory()) {
			entries.push(
				...scanPages(
					join(dir, entry.name),
					prefix ? `${prefix}/${entry.name}` : entry.name,
				),
			);
		} else if (entry.name.endsWith(".md")) {
			const base = entry.name.replace(/\.md$/, "");
			const slug = base === "index" ? prefix : prefix ? `${prefix}/${base}` : base;
			if (!slug) continue; // skip root index (landing page added separately)
			const locale = slug.startsWith("id/") || slug === "id" ? "id" : "en";
			entries.push({ slug, locale });
		}
	}
	return entries;
}

function slugToUrl(slug: string, locale: "en" | "id"): string {
	if (locale === "id") return `${BASE_URL}/${slug}`;
	return slug === "" ? BASE_URL + "/" : `${BASE_URL}/${slug}`;
}

function stripLocale(slug: string): string {
	if (slug.startsWith("id/")) return slug.slice(3);
	if (slug === "id") return "";
	return slug;
}

// Collect all pages
const pages = scanPages(contentDir, "");

// Group EN and ID pages by their bare slug
const enPages = new Map<string, string>(); // bareSlug → full URL
const idPages = new Map<string, string>();

// Add landing pages
enPages.set("", `${BASE_URL}/`);
idPages.set("", `${BASE_URL}/id`);

for (const page of pages) {
	const bare = stripLocale(page.slug);
	const url = slugToUrl(page.slug, page.locale);
	if (page.locale === "id") {
		idPages.set(bare, url);
	} else {
		enPages.set(bare, url);
	}
}

// Build sitemap XML
const today = new Date().toISOString().split("T")[0];
let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
xml += `        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;

// Emit all EN pages (with alternates if ID version exists)
for (const [bare, enUrl] of enPages) {
	xml += `  <url>\n`;
	xml += `    <loc>${enUrl}</loc>\n`;
	xml += `    <lastmod>${today}</lastmod>\n`;
	xml += `    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}" />\n`;
	const idUrl = idPages.get(bare);
	if (idUrl) {
		xml += `    <xhtml:link rel="alternate" hreflang="id" href="${idUrl}" />\n`;
	}
	xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${enUrl}" />\n`;
	xml += `  </url>\n`;
}

// Emit ID-only pages (those without EN counterpart)
for (const [bare, idUrl] of idPages) {
	if (enPages.has(bare)) continue; // already emitted with EN
	xml += `  <url>\n`;
	xml += `    <loc>${idUrl}</loc>\n`;
	xml += `    <lastmod>${today}</lastmod>\n`;
	xml += `    <xhtml:link rel="alternate" hreflang="id" href="${idUrl}" />\n`;
	xml += `  </url>\n`;
}

xml += `</urlset>\n`;

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "sitemap.xml"), xml);
console.log(`✓ sitemap.xml written (${enPages.size + idPages.size} URLs)`);

// ─── Static Skills API ────────────────────────────────────────────────
// Precompute /api/skills and /api/skills/[name] as static JSON files
// so they work on GitHub Pages (which has no running server).

type SkillSummary = {
	name: string;
	description: string;
	triggers?: string[];
	kind?: string;
	category?: string;
};

function generateSkillsApi(): void {
	let entries: { name: string; isDirectory: () => boolean }[];
	try {
		entries = readdirSync(skillsDir, { withFileTypes: true });
	} catch {
		console.log("⏭️  No content/skills directory — skipping skills API");
		return;
	}

	const summaries: SkillSummary[] = [];
	const skillsApiDir = join(outDir, "api", "skills");
	mkdirSync(skillsApiDir, { recursive: true });

	for (const entry of entries) {
		if (!entry.isDirectory()) continue;
		const skillName = entry.name;
		const file = join(skillsDir, skillName, "SKILL.md");
		let raw: string;
		try {
			raw = readFileSync(file, "utf8");
		} catch {
			continue;
		}

		// Parse frontmatter for the list summary
		const { data, content } = matter(raw);
		const name = typeof data.name === "string" && data.name.length > 0 ? data.name : skillName;
		const description = typeof data.description === "string" ? data.description : "";
		const summary: SkillSummary = { name, description };
		if (Array.isArray(data.triggers)) {
			summary.triggers = data.triggers.filter((t): t is string => typeof t === "string");
		}
		if (data.od && typeof data.od === "object") {
			const od = data.od as Record<string, unknown>;
			if (typeof od.mode === "string") summary.kind = od.mode;
			if (typeof od.category === "string") summary.category = od.category;
		}
		summaries.push(summary);

		// Write individual skill: /api/skills/{name}.json
		const skillFile = join(skillsApiDir, `${skillName}.json`);
		writeFileSync(skillFile, JSON.stringify({ name, content }));
	}

	summaries.sort((a, b) => a.name.localeCompare(b.name));

	// Write list: /api/skills.json
	const listFile = join(outDir, "api", "skills.json");
	writeFileSync(listFile, JSON.stringify({ skills: summaries }));
	console.log(`✓ skills API: ${summaries.length} skills → api/skills.json`);
}

generateSkillsApi();

// ─── Static Components & Blocks API ───────────────────────────────────
// Reuses the same listing logic the runtime routes use (src/lib/registry/list.ts)
// so list/detail JSON served by GitHub Pages stays in sync with the dev server.

async function generateRegistryApi(kind: RegistryKind): Promise<void> {
	const details = await listRegistryWithContent(kind);
	if (details.length === 0) {
		console.log(`⏭️  No content/docs/${kind} entries — skipping ${kind} API`);
		return;
	}

	const apiDir = join(outDir, "api", kind);
	mkdirSync(apiDir, { recursive: true });

	const summaries = details.map(({ mdFile: _mdFile, ...summary }) => summary);
	for (const detail of details) {
		const detailFile = join(apiDir, `${detail.path}.json`);
		mkdirSync(dirname(detailFile), { recursive: true });
		writeFileSync(detailFile, JSON.stringify(detail));
	}

	const listFile = join(outDir, "api", `${kind}.json`);
	writeFileSync(listFile, JSON.stringify({ [kind]: summaries }));
	console.log(`✓ ${kind} API: ${summaries.length} entries → api/${kind}.json`);
}

await generateRegistryApi("components");
await generateRegistryApi("blocks");
