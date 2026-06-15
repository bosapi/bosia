#!/usr/bin/env bun
// Build prebuilt template artifacts.
//
// Heavy templates (those whose `template.json` carries `"prebuilt": true`)
// install many features/components/blocks from the registry — 150+ serial HTTP
// fetches in `bosia create`. To make `create` fast, we bake the finished
// `--no-install` scaffold once here (in CI on every publish) and ship it as a
// GitHub Release asset; `create` then downloads + extracts a single tarball.
//
// What we bake:
//   - The full scaffold, generated from the LOCAL registry (version-locked).
//   - `{{PROJECT_NAME}}` is preserved (per-user substitution happens at extract
//     time) by passing it as the literal project name so copyDir's replace is a
//     no-op. `{{BOSIA_VERSION}}` IS resolved — we want the real version baked.
//   - No `node_modules`/lockfile (we scaffold with --no-install).

import { spawnSync } from "bun";
import { mkdtempSync, rmSync, readdirSync, existsSync, readFileSync, mkdirSync } from "fs";
import { tmpdir } from "os";
import { join, resolve } from "path";

const PKG_DIR = resolve(import.meta.dir, "..");
const PKG = JSON.parse(readFileSync(join(PKG_DIR, "package.json"), "utf-8"));
const TEMPLATES_DIR = join(PKG_DIR, "templates");
const CLI_ENTRY = join(PKG_DIR, "src/cli/index.ts");
const OUT_DIR = join(PKG_DIR, "dist/prebuilt");

// Literal placeholder, kept intact in the artifact for per-user substitution.
const NAME_PLACEHOLDER = "{{PROJECT_NAME}}";

const failures: string[] = [];

function prebuiltTemplates(): string[] {
	return readdirSync(TEMPLATES_DIR, { withFileTypes: true })
		.filter((d) => d.isDirectory())
		.map((d) => d.name)
		.filter((name) => {
			const configPath = join(TEMPLATES_DIR, name, "template.json");
			if (!existsSync(configPath)) return false;
			try {
				return JSON.parse(readFileSync(configPath, "utf-8")).prebuilt === true;
			} catch {
				return false;
			}
		})
		.sort();
}

const templates = prebuiltTemplates();

if (templates.length === 0) {
	console.log('No templates marked "prebuilt": true — nothing to build.');
	process.exit(0);
}

mkdirSync(OUT_DIR, { recursive: true });
console.log(`📦 Building prebuilt artifact(s) for: ${templates.join(", ")}\n`);

for (const template of templates) {
	console.log(`──── ${template} ────`);
	const scaffoldTmp = mkdtempSync(join(tmpdir(), `bosia-prebuilt-${template}-`));
	const projectDir = join(scaffoldTmp, NAME_PLACEHOLDER);

	try {
		// Scaffold via the registry (BOSIA_BUILDING_PREBUILT bypasses create's own
		// prebuilt fast path) with the placeholder name and --no-install.
		const create = spawnSync(
			["bun", CLI_ENTRY, "create", NAME_PLACEHOLDER, "--template", template, "--no-install"],
			{
				cwd: scaffoldTmp,
				stdout: "inherit",
				stderr: "inherit",
				env: { ...process.env, BOSIA_BUILDING_PREBUILT: "1" },
			},
		);
		if (create.exitCode !== 0) {
			failures.push(`${template}: scaffold failed (exit ${create.exitCode})`);
			continue;
		}

		if (!existsSync(projectDir)) {
			failures.push(`${template}: expected scaffold at ${projectDir} but none was produced`);
			continue;
		}

		const out = join(OUT_DIR, `${template}.tar.gz`);
		const tar = spawnSync(["tar", "-czf", out, "-C", projectDir, "."], {
			stdout: "inherit",
			stderr: "inherit",
		});
		if (tar.exitCode !== 0) {
			failures.push(`${template}: tar failed (exit ${tar.exitCode})`);
			continue;
		}

		console.log(`✅ ${template} → dist/prebuilt/${template}.tar.gz\n`);
	} finally {
		rmSync(scaffoldTmp, { recursive: true, force: true });
	}
}

if (failures.length > 0) {
	console.error(`\n❌ Prebuilt build failed:\n`);
	for (const msg of failures) console.error(`  • ${msg}`);
	console.error(``);
	process.exit(1);
}

console.log(`✅ Built ${templates.length} prebuilt artifact(s) for bosia@${PKG.version}.`);
