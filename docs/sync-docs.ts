/**
 * Syncs root markdown files (CHANGELOG.md, ROADMAP.md) into the docs content
 * directory with frontmatter prepended.
 *
 * The Indonesian (`id`) locale gets a copy with the same English body but
 * localized frontmatter — these files are auto-generated from English-only
 * sources and aren't translated, so the id pages show the English content
 * inside the Indonesian shell instead of 404ing.
 *
 * Run before `bun run dev` or `bun run build`.
 */
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const docsDir = import.meta.dir;
const repoRoot = join(docsDir, "..");
const outDir = join(docsDir, "content", "docs", "reference");
const idOutDir = join(docsDir, "content", "docs", "id", "reference");

mkdirSync(outDir, { recursive: true });
mkdirSync(idOutDir, { recursive: true });

const files = [
	{
		source: "CHANGELOG.md",
		dest: "changelog.md",
		title: "Changelog",
		description: "All notable changes to Bosia.",
		titleId: "Changelog",
		descriptionId: "Semua perubahan penting pada Bosia.",
		stripHeading: /^# Changelog\n+/,
	},
	{
		source: "ROADMAP.md",
		dest: "roadmap.md",
		title: "Roadmap",
		description: "What's done, what's next, and where Bosia is headed.",
		titleId: "Roadmap",
		descriptionId: "Apa yang sudah selesai, berikutnya, dan ke mana arah Bosia.",
		stripHeading: /^# Bosia — Roadmap\n+/,
	},
];

for (const file of files) {
	const content = readFileSync(join(repoRoot, file.source), "utf-8");
	const stripped = content.replace(file.stripHeading, "");

	const output = `---\ntitle: ${file.title}\ndescription: ${file.description}\n---\n\n${stripped}`;
	writeFileSync(join(outDir, file.dest), output);
	console.log(`  Synced ${file.source} -> content/docs/reference/${file.dest}`);

	const outputId = `---\ntitle: ${file.titleId}\ndescription: ${file.descriptionId}\n---\n\n${stripped}`;
	writeFileSync(join(idOutDir, file.dest), outputId);
	console.log(`  Synced ${file.source} -> content/docs/id/reference/${file.dest}`);
}
