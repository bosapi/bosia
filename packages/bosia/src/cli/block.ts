import { join } from "path";
import { existsSync } from "fs";
import * as p from "@clack/prompts";
import {
	checkRegistryFiles,
	containedPath,
	type InstallOptions,
	resolveLocalRegistryOrExit,
	readRegistryJSON,
	installRegistryFiles,
	mergePkgJson,
	bunAdd,
} from "./registry.ts";
import { addComponent, initAddRegistry, ensureUtils } from "./add.ts";
import { mergeFontImports } from "./fonts.ts";
import { recordBlock } from "./manifest.ts";

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

// Track already-installed blocks within a session to avoid redundant work
// when multiple features/blocks declare the same block dependency.
const installed = new Set<string>();

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
	// Honor an inherited registry root from options (e.g. when called from feat.ts in --local mode).
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

	console.log(`⬡ Installing block: ${name}\n`);

	const meta = await readRegistryJSON<BlockMeta>(registryRoot, "blocks", name, "meta.json");

	// Check this item's own paths before installing anything for it.
	const cwd = resolvedOptions.cwd ?? process.cwd();
	const destDir = containedPath(join(cwd, "src", "lib", "blocks"), name);
	checkRegistryFiles(registryRoot, "blocks", name, meta.files, destDir);

	// 1. Install primitive dependencies first.
	// Component deps (e.g. "ui/button") go through addComponent.
	// Block deps (e.g. "blocks/files/upload-area") recurse into runAddBlock.
	for (const dep of meta.dependencies ?? []) {
		if (dep.startsWith("blocks/")) {
			await runAddBlock(dep.slice("blocks/".length), [], resolvedOptions);
		} else {
			await addComponent(dep, false, resolvedOptions);
		}
	}

	// 2. Copy block files to src/lib/blocks/<path>/
	if (!resolvedOptions.skipPrompts && existsSync(destDir)) {
		const replace = await p.confirm({
			message: `Block "${name}" already exists at src/lib/blocks/${name}/. Replace it?`,
		});
		if (p.isCancel(replace) || !replace) {
			console.log(`   ⏭️  Skipped ${name}`);
			return;
		}
	}

	await installRegistryFiles(
		registryRoot,
		"blocks",
		name,
		meta.files,
		destDir,
		`src/lib/blocks/${name}`,
	);

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
	recordBlock(cwd, name, {
		files: meta.files,
		...(meta.npmDeps && Object.keys(meta.npmDeps).length > 0
			? { npmDeps: Object.keys(meta.npmDeps) }
			: {}),
		...(meta.dependencies && meta.dependencies.length > 0
			? { dependencies: meta.dependencies }
			: {}),
		...(meta.fonts && Object.keys(meta.fonts).length > 0 ? { fonts: Object.keys(meta.fonts) } : {}),
	});

	console.log(`\n✅ ${name} installed at src/lib/blocks/${name}/`);
}
