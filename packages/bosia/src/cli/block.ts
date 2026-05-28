import { join, dirname } from "path";
import { mkdirSync, writeFileSync, existsSync } from "fs";
import * as p from "@clack/prompts";
import {
	type InstallOptions,
	resolveLocalRegistryOrExit,
	readRegistryJSON,
	readRegistryFile,
	mergePkgJson,
	bunAdd,
} from "./registry.ts";
import { addComponent, initAddRegistry, ensureUtils } from "./add.ts";
import { mergeFontImports } from "./fonts.ts";

// ─── bun x bosia@latest add block <category>/<name> ──────
// Installs a composed block into src/lib/blocks/<path>/.
// Recursively installs primitive component dependencies and
// optional Google Fonts @imports into app.css.

interface BlockMeta {
	name: string;
	description: string;
	category: string;
	themes?: string[];
	dependencies: string[]; // primitive component names
	files: string[];
	fonts?: Record<string, string>; // family → @import URL
	npmDeps: Record<string, string>;
}

export async function runAddBlock(
	name: string | undefined,
	flags: string[] = [],
	options?: InstallOptions,
) {
	if (!name || !name.includes("/")) {
		console.error(
			"❌ Please provide a block path.\n   Usage: bun x bosia@latest add block <category>/<name> [-y] [--local]",
		);
		process.exit(1);
	}

	const local = flags.includes("--local");
	const flagYes = flags.includes("-y") || flags.includes("--yes");
	const registryRoot = local ? resolveLocalRegistryOrExit() : null;
	if (local) console.log(`⬡ Using local registry: ${registryRoot}\n`);

	const resolvedOptions: InstallOptions = {
		...(options ?? {}),
		skipPrompts: options?.skipPrompts ?? flagYes,
	};

	await initAddRegistry(registryRoot);
	ensureUtils();

	console.log(`⬡ Installing block: ${name}\n`);

	const meta = await readRegistryJSON<BlockMeta>(registryRoot, "blocks", name, "meta.json");

	// 1. Install primitive dependencies first
	for (const dep of meta.dependencies ?? []) {
		await addComponent(dep, false, resolvedOptions);
	}

	// 2. Copy block files to src/lib/blocks/<path>/
	const cwd = resolvedOptions.cwd ?? process.cwd();
	const destDir = join(cwd, "src", "lib", "blocks", name);

	if (!resolvedOptions.skipPrompts && existsSync(destDir)) {
		const replace = await p.confirm({
			message: `Block "${name}" already exists at src/lib/blocks/${name}/. Replace it?`,
		});
		if (p.isCancel(replace) || !replace) {
			console.log(`   ⏭️  Skipped ${name}`);
			return;
		}
	}

	mkdirSync(destDir, { recursive: true });

	for (const file of meta.files) {
		const content = await readRegistryFile(registryRoot, "blocks", name, file);
		const dest = join(destDir, file);
		if (file.includes("/")) mkdirSync(dirname(dest), { recursive: true });
		writeFileSync(dest, content, "utf-8");
		console.log(`   ✍️  src/lib/blocks/${name}/${file}`);
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
			if (addedDeps.length > 0)
				console.log(`   📥 Added to package.json: ${addedDeps.join(", ")}`);
		} else {
			await bunAdd(cwd, meta.npmDeps);
		}
	}

	console.log(`\n✅ ${name} installed at src/lib/blocks/${name}/`);
}
