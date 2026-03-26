/**
 * Syncs root markdown files (CHANGELOG.md, ROADMAP.md) into the docs content
 * directory with Starlight-compatible frontmatter prepended.
 *
 * Run before `astro dev` or `astro build`.
 */
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const docsDir = import.meta.dir;
const repoRoot = join(docsDir, "..");
const outDir = join(docsDir, "src", "content", "docs", "reference");

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
  console.log(`✓ Synced ${file.source} → docs/src/content/docs/reference/${file.dest}`);
}

// Sync version badge in astro.config.mjs from package.json
const pkg = JSON.parse(readFileSync(join(repoRoot, "packages", "bosia", "package.json"), "utf-8"));
const version = `v${pkg.version}`;
const configPath = join(docsDir, "astro.config.mjs");
const configContent = readFileSync(configPath, "utf-8");
const updated = configContent.replace(
  /badge:\s*\{\s*text:\s*"v[^"]*"/,
  `badge: { text: "${version}"`,
);
if (updated !== configContent) {
  writeFileSync(configPath, updated);
  console.log(`✓ Updated changelog badge to ${version}`);
} else {
  console.log(`✓ Changelog badge already at ${version}`);
}
