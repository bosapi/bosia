import { join, dirname } from "path";
import { mkdirSync, existsSync } from "fs";
import * as p from "@clack/prompts";
import {
	type InstallOptions,
	resolveLocalRegistryOrExit,
	readRegistryJSON,
	readRegistryFile,
	writeRegistryFile,
	mergePkgJson,
	bunAdd,
} from "./registry.ts";
import { addComponent, initAddRegistry, ensureUtils } from "./add.ts";
import { runAddBlock } from "./block.ts";
import { mergeFontImports } from "./fonts.ts";
import { recordPage } from "./manifest.ts";

// ─── bun x bosia@latest add page <category>/<name> ───────
// Installs a full page (a group of blocks, no backend) into
// src/lib/pages/<path>/. Recursively installs the block and
// component dependencies the page composes, plus npm deps and
// optional Google Fonts @imports into app.css.

interface PageMeta {
	name: string;
	description: string;
	category: string;
	themes?: string[];
	dependencies: string[]; // "blocks/..." or "ui/..." entries
	files: string[];
	fonts?: Record<string, string>; // family → @import URL
	npmDeps: Record<string, string>;
}

// Track already-installed pages within a session to avoid redundant work.
const installed = new Set<string>();

export async function runAddPage(
	name: string | undefined,
	flags: string[] = [],
	options?: InstallOptions,
) {
	if (!name || !name.includes("/")) {
		console.error(
			"❌ Please provide a page path.\n   Usage: bun x bosia@latest add page <category>/<name> [-y] [--local]",
		);
		process.exit(1);
	}

	const local = flags.includes("--local");
	const flagYes = flags.includes("-y") || flags.includes("--yes");
	const inheritedRoot = options?.registryRoot ?? null;
	const registryRoot = inheritedRoot ?? (local ? resolveLocalRegistryOrExit() : null);
	if (local && !inheritedRoot) console.log(`⬡ Using local registry: ${registryRoot}\n`);

	const resolvedOptions: InstallOptions = {
		...(options ?? {}),
		registryRoot,
		skipPrompts: options?.skipPrompts ?? flagYes,
	};

	await initAddRegistry(registryRoot);
	ensureUtils(resolvedOptions.cwd);

	if (installed.has(name)) return;
	installed.add(name);

	console.log(`⬡ Installing page: ${name}\n`);

	const meta = await readRegistryJSON<PageMeta>(registryRoot, "pages", name, "meta.json");

	// 1. Install dependencies first.
	// Block deps (e.g. "blocks/storefront/header") recurse into runAddBlock.
	// Component deps (e.g. "ui/button") go through addComponent.
	for (const dep of meta.dependencies ?? []) {
		if (dep.startsWith("blocks/")) {
			await runAddBlock(dep.slice("blocks/".length), [], resolvedOptions);
		} else {
			await addComponent(dep, false, resolvedOptions);
		}
	}

	// 2. Copy page files to src/lib/pages/<path>/
	const cwd = resolvedOptions.cwd ?? process.cwd();
	const destDir = join(cwd, "src", "lib", "pages", name);

	if (!resolvedOptions.skipPrompts && existsSync(destDir)) {
		const replace = await p.confirm({
			message: `Page "${name}" already exists at src/lib/pages/${name}/. Replace it?`,
		});
		if (p.isCancel(replace) || !replace) {
			console.log(`   ⏭️  Skipped ${name}`);
			return;
		}
	}

	mkdirSync(destDir, { recursive: true });

	for (const file of meta.files) {
		const content = await readRegistryFile(registryRoot, "pages", name, file);
		const dest = join(destDir, file);
		if (file.includes("/")) mkdirSync(dirname(dest), { recursive: true });
		writeRegistryFile(dest, content);
		console.log(`   ✍️  src/lib/pages/${name}/${file}`);
	}

	// 3. Merge font @imports into app.css (idempotent)
	if (meta.fonts && Object.keys(meta.fonts).length > 0) {
		const cssPath = join(cwd, "src", "app.css");
		if (existsSync(cssPath)) {
			const added = mergeFontImports(cssPath, meta.fonts);
			if (added.length > 0) {
				console.log(`   🔤 Added fonts to app.css: ${added.join(", ")}`);
			}
		}
	}

	// 4. npm deps
	if (meta.npmDeps && Object.keys(meta.npmDeps).length > 0) {
		if (resolvedOptions.skipInstall) {
			const { addedDeps } = mergePkgJson(cwd, { deps: meta.npmDeps });
			if (addedDeps.length > 0) console.log(`   📥 Added to package.json: ${addedDeps.join(", ")}`);
		} else {
			await bunAdd(cwd, meta.npmDeps);
		}
	}

	// 5. Record install in bosia.json manifest.
	recordPage(cwd, name, {
		files: meta.files,
		...(meta.npmDeps && Object.keys(meta.npmDeps).length > 0
			? { npmDeps: Object.keys(meta.npmDeps) }
			: {}),
		...(meta.dependencies && meta.dependencies.length > 0
			? { dependencies: meta.dependencies }
			: {}),
		...(meta.fonts && Object.keys(meta.fonts).length > 0 ? { fonts: Object.keys(meta.fonts) } : {}),
	});

	console.log(`\n✅ ${name} installed at src/lib/pages/${name}/`);
}
