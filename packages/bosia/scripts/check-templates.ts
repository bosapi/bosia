#!/usr/bin/env bun
// End-to-end template check.
//
// 1. Pack the package the same way `bun publish` would, extract the tarball,
//    and assert each `templates/*` still has the files we expect (catches
//    npm-strip regressions like the silently-removed `.gitignore`).
// 2. Scaffold the `default` template into a temp dir using `--local` so it
//    consumes our in-source bosia, run `bun run build`, then `bun run check`.
//    Catches any regression where a fresh project no longer passes its own
//    health checks (e.g. generated artifacts tripping prettier).

import { spawnSync } from "bun";
import { mkdtempSync, rmSync, readdirSync, existsSync, readFileSync } from "fs";
import { tmpdir } from "os";
import { join, resolve } from "path";

const PKG_DIR = resolve(import.meta.dir, "..");
const PKG = JSON.parse(readFileSync(join(PKG_DIR, "package.json"), "utf-8"));
const TARBALL = `${PKG.name}-${PKG.version}.tgz`;
const CLI_ENTRY = join(PKG_DIR, "src/cli/index.ts");

const REQUIRED_PER_TEMPLATE = [
	"_gitignore",
	".prettierignore",
	".prettierrc.json",
	".env.example",
	"package.json",
	"tsconfig.json",
	"README.md",
	"src",
	"public",
];

const FORBIDDEN_PER_TEMPLATE = [".gitignore"];

// Generated build artifacts that must be ignored by both git and prettier in
// every template, otherwise a fresh scaffold can fail `bun run check` (or
// commit build output) the moment the project is built.
const REQUIRED_IGNORE_ENTRIES: { file: string; lines: string[] }[] = [
	{ file: "_gitignore", lines: ["public/bosia-tw.css"] },
	{ file: ".prettierignore", lines: ["public/bosia-tw.css"] },
];

const SCAFFOLD_TEMPLATES = ["default"];

const failures: string[] = [];
const fail = (msg: string) => failures.push(msg);

// ─── 1. Pack + extract + file-presence check ────────────────────────────

const packTmp = mkdtempSync(join(tmpdir(), "bosia-pack-"));
const tarballPath = join(packTmp, TARBALL);

try {
	console.log(`📦 Packing ${PKG.name}@${PKG.version}…`);
	const pack = spawnSync(["bun", "pm", "pack", "--destination", packTmp], {
		cwd: PKG_DIR,
		stdout: "pipe",
		stderr: "pipe",
	});
	if (pack.exitCode !== 0) {
		console.error(pack.stderr.toString());
		process.exit(1);
	}

	if (!existsSync(tarballPath)) {
		console.error(`❌ Expected tarball at ${tarballPath} but it was not produced.`);
		process.exit(1);
	}

	console.log(`📂 Extracting tarball…`);
	const tar = spawnSync(["tar", "-xzf", tarballPath, "-C", packTmp], {
		stdout: "pipe",
		stderr: "pipe",
	});
	if (tar.exitCode !== 0) {
		console.error(tar.stderr.toString());
		process.exit(1);
	}
	// npm tarballs extract to a `package/` directory
	const templatesRoot = join(packTmp, "package", "templates");

	if (!existsSync(templatesRoot)) {
		fail(`templates/ missing from packed tarball`);
	} else {
		const templates = readdirSync(templatesRoot, { withFileTypes: true })
			.filter((d) => d.isDirectory())
			.map((d) => d.name);

		if (templates.length === 0) fail(`no templates/* directories in tarball`);

		console.log(`🔍 Checking ${templates.length} template(s): ${templates.join(", ")}\n`);

		for (const name of templates) {
			const dir = join(templatesRoot, name);
			for (const file of REQUIRED_PER_TEMPLATE) {
				if (!existsSync(join(dir, file))) {
					fail(`templates/${name}: missing required file "${file}"`);
				}
			}
			for (const file of FORBIDDEN_PER_TEMPLATE) {
				if (existsSync(join(dir, file))) {
					fail(`templates/${name}: contains "${file}" — npm strips this; rename to "_gitignore"`);
				}
			}
			for (const { file, lines } of REQUIRED_IGNORE_ENTRIES) {
				const path = join(dir, file);
				if (!existsSync(path)) continue; // already reported by REQUIRED_PER_TEMPLATE
				const contents = readFileSync(path, "utf-8");
				const present = new Set(
					contents
						.split("\n")
						.map((l) => l.trim())
						.filter((l) => l && !l.startsWith("#")),
				);
				for (const line of lines) {
					if (!present.has(line)) {
						fail(`templates/${name}/${file}: missing entry "${line}"`);
					}
				}
			}
		}
	}
} finally {
	rmSync(packTmp, { recursive: true, force: true });
}

if (failures.length > 0) {
	console.error(`\n❌ Template pack check failed:\n`);
	for (const msg of failures) console.error(`  • ${msg}`);
	console.error(``);
	process.exit(1);
}

console.log(`✅ All templates survived packing.\n`);

// ─── 2. Scaffold + build + check ─────────────────────────────────────────

for (const template of SCAFFOLD_TEMPLATES) {
	console.log(`\n──── Scaffolding "${template}" template ────`);
	const scaffoldTmp = mkdtempSync(join(tmpdir(), `bosia-scaffold-${template}-`));
	const appName = "test-app";
	const appDir = join(scaffoldTmp, appName);

	try {
		// `bosia create` runs `bun install` itself; --local rewrites the
		// `bosia` dep to a `file:` reference pointing at our in-source package.
		const create = spawnSync(
			["bun", CLI_ENTRY, "create", appName, "--template", template, "--local"],
			{ cwd: scaffoldTmp, stdout: "inherit", stderr: "inherit" },
		);
		if (create.exitCode !== 0) {
			fail(`scaffold "${template}": create failed (exit ${create.exitCode})`);
			continue;
		}

		console.log(`\n🏗️  bun run build (in ${appName})…`);
		const build = spawnSync(["bun", "run", "build"], {
			cwd: appDir,
			stdout: "inherit",
			stderr: "inherit",
		});
		if (build.exitCode !== 0) {
			fail(`scaffold "${template}": bun run build failed (exit ${build.exitCode})`);
			continue;
		}

		console.log(`\n🔎 bun run check (in ${appName})…`);
		const check = spawnSync(["bun", "run", "check"], {
			cwd: appDir,
			stdout: "inherit",
			stderr: "inherit",
		});
		if (check.exitCode !== 0) {
			fail(`scaffold "${template}": bun run check failed (exit ${check.exitCode})`);
			continue;
		}

		console.log(`\n✅ "${template}" scaffold passes build + check.`);
	} finally {
		rmSync(scaffoldTmp, { recursive: true, force: true });
	}
}

if (failures.length > 0) {
	console.error(`\n❌ Template scaffold check failed:\n`);
	for (const msg of failures) console.error(`  • ${msg}`);
	console.error(``);
	process.exit(1);
}

console.log(`\n✅ All template checks passed.`);
