import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import matter from "gray-matter";

export type SkillSummary = {
	name: string;
	description: string;
	triggers?: string[];
	kind?: string;
	category?: string;
};

export type SkillReference = { file: string; path: string };

export const SKILLS_ROOT = resolve(process.cwd(), "content", "skills");

const SLUG_RE = /^[a-z0-9-]+$/;

export async function listSkillReferences(name: string): Promise<SkillReference[]> {
	if (!SLUG_RE.test(name)) return [];
	const dir = join(SKILLS_ROOT, name, "references");
	let entries: { name: string; isFile: () => boolean }[];
	try {
		entries = await readdir(dir, { withFileTypes: true });
	} catch {
		return [];
	}
	const refs: SkillReference[] = [];
	for (const entry of entries) {
		if (!entry.isFile()) continue;
		if (!entry.name.endsWith(".md")) continue;
		const slug = entry.name.slice(0, -3);
		if (!SLUG_RE.test(slug)) continue;
		refs.push({ file: entry.name, path: `/api/skills/${name}/references/${slug}.json` });
	}
	refs.sort((a, b) => a.file.localeCompare(b.file));
	return refs;
}

export async function listSkills(): Promise<SkillSummary[]> {
	let entries: { name: string; isDirectory: () => boolean }[];
	try {
		entries = await readdir(SKILLS_ROOT, { withFileTypes: true });
	} catch {
		return [];
	}
	const summaries: SkillSummary[] = [];
	for (const entry of entries) {
		if (!entry.isDirectory()) continue;
		const file = join(SKILLS_ROOT, entry.name, "SKILL.md");
		let raw: string;
		try {
			raw = await readFile(file, "utf8");
		} catch {
			continue;
		}
		const { data } = matter(raw);
		const name = typeof data.name === "string" && data.name.length > 0 ? data.name : entry.name;
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
	}
	summaries.sort((a, b) => a.name.localeCompare(b.name));
	return summaries;
}
