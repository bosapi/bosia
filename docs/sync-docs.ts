/**
 * Syncs root markdown files (CHANGELOG.md, ROADMAP.md) into the docs content
 * directory with frontmatter prepended.
 *
 * Run before `bun run dev` or `bun run build`.
 */
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const docsDir = import.meta.dir;
const repoRoot = join(docsDir, "..");
const outDir = join(docsDir, "content", "docs", "reference");

mkdirSync(outDir, { recursive: true });

const files = [
	{
		source: "CHANGELOG.md",
		dest: "changelog.md",
		title: "Changelog",
		description: "All notable changes to Bosia.",
		stripHeading: /^# Changelog\n+/,
	},
	{
		source: "ROADMAP.md",
		dest: "roadmap.md",
		title: "Roadmap",
		description: "What's done, what's next, and where Bosia is headed.",
		stripHeading: /^# Bosia — Roadmap\n+/,
	},
];

for (const file of files) {
	const content = readFileSync(join(repoRoot, file.source), "utf-8");
	const stripped = content.replace(file.stripHeading, "");
	const output = `---\ntitle: ${file.title}\ndescription: ${file.description}\n---\n\n${stripped}`;
	writeFileSync(join(outDir, file.dest), output);
	console.log(`  Synced ${file.source} -> content/docs/reference/${file.dest}`);
}
