/**
 * Generates public/llms.txt — an AI-agent index of Bosia's docs, skills,
 * blocks, components and themes. Built from the same sources as the site so
 * it stays in sync. public/ is copied into dist/static at build time, so the
 * file is served verbatim at https://bosia.dev/llms.txt.
 */

import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { listSkills } from "../src/lib/skills/list";
import { listRegistry } from "../src/lib/registry/list";
import { sidebar, type NavGroup } from "../src/lib/docs/nav";

const BASE_URL = "https://bosia.dev";
const outDir = join(process.cwd(), "public");

type Entry = { title: string; url: string; description?: string };

function line({ title, url, description }: Entry): string {
	return description ? `- [${title}](${url}): ${description}` : `- [${title}](${url})`;
}

function section(heading: string, entries: Entry[]): string | null {
	if (entries.length === 0) return null;
	return `## ${heading}\n${entries.map(line).join("\n")}`;
}

function docEntries(groups: NavGroup[]): Entry[] {
	const entries: Entry[] = [];
	for (const group of groups) {
		for (const item of group.items) {
			if (item.slug === undefined) continue;
			const url = item.slug === "" ? `${BASE_URL}/` : `${BASE_URL}/${item.slug}`;
			entries.push({ title: item.label, url });
		}
	}
	return entries;
}

const [skills, blocks, components, themes] = await Promise.all([
	listSkills(),
	listRegistry("blocks"),
	listRegistry("components"),
	listRegistry("themes"),
]);

const sections = [
	section("Documentation", docEntries(sidebar)),
	section(
		"Skills",
		skills.map((s) => ({
			title: s.name,
			url: `${BASE_URL}/api/skills/${s.name}.json`,
			description: s.description,
		})),
	),
	section(
		"Blocks",
		blocks.map((b) => ({
			title: b.name,
			url: `${BASE_URL}/api/blocks/${b.path}.json`,
			description: b.description,
		})),
	),
	section(
		"Components",
		components.map((c) => ({
			title: c.name,
			url: `${BASE_URL}/api/components/${c.path}.json`,
			description: c.description,
		})),
	),
	section(
		"Themes",
		themes.map((t) => ({
			title: t.name,
			url: `${BASE_URL}/api/themes/${t.path}.json`,
			description: t.description,
		})),
	),
].filter((s): s is string => s !== null);

const body =
	[
		"# Bosia",
		"> Fullstack web framework: Bun + Svelte 5 + ElysiaJS. Skills, blocks, components and themes are served as JSON for AI agents.",
		"",
		"Each skill links to `/api/skills/<name>.json` (full SKILL.md body + references). Blocks, components and themes link to their registry JSON.",
		"",
		sections.join("\n\n"),
	].join("\n") + "\n";

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "llms.txt"), body);
console.log(
	`✓ llms.txt written (${skills.length} skills, ${blocks.length} blocks, ${components.length} components, ${themes.length} themes)`,
);
