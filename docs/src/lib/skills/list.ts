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

export const SKILLS_ROOT = resolve(process.cwd(), "content", "skills");

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
