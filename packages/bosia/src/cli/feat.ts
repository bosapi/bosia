import { join, dirname, extname } from "path";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "fs";
import * as p from "@clack/prompts";
import { addComponent, initAddRegistry } from "./add.ts";
import {
	type InstallOptions,
	resolveLocalRegistryOrExit,
	readRegistryJSON,
	readRegistryFile,
	mergePkgJson,
	bunAdd,
} from "./registry.ts";

// ─── bosia feat <feature> [--local] ──────────────────────
// Fetches a feature scaffold from the GitHub registry (or local
// registry with --local) and copies route/lib files, installs npm deps.
// Supports nested feature dependencies (e.g. todo → drizzle).

type FileStrategy =
	| "write" // overwrite (prompt if interactive)
	| "skip-if-exists" // bootstrap-once: never replace user copy
	| "append-line" // idempotent line append (barrel re-exports)
	| "append-block" // marker-delimited block, replaced by id on re-install
	| "merge-json"; // deep-merge JSON, preserve existing keys

interface FileEntry {
	src: string;
	target: string;
	strategy?: FileStrategy;
	marker?: string; // unique id within target (default = feature name)
}

interface FeatureMeta {
	name: string;
	description: string;
	features?: string[]; // other bosia features required
	components: string[]; // bosia components to install via `bosia add`
	files: FileEntry[]; // file entries with per-file strategy
	npmDeps: Record<string, string>;
	npmDevDeps?: Record<string, string>;
	scripts?: Record<string, string>; // package.json scripts to add
	envVars?: Record<string, string>; // env vars to append to .env if missing
}

let registryRoot: string | null = null;

// Track installed features to prevent circular dependencies
const installedFeats = new Set<string>();

export async function runFeat(name: string | undefined, flags: string[] = []) {
	if (!name) {
		console.error(
			"❌ Please provide a feature name.\n   Usage: bosia feat <feature> [--local]",
		);
		process.exit(1);
	}

	if (flags.includes("--local")) {
		registryRoot = resolveLocalRegistryOrExit();
		console.log(`⬡ Using local registry: ${registryRoot}\n`);
	}

	// Initialize add.ts registry context so addComponent resolves paths correctly
	await initAddRegistry(registryRoot);

	await installFeature(name, true);
}

/** Set the registry root for feature resolution. Called by create.ts for template features. */
export function initFeatRegistry(root: string | null) {
	registryRoot = root;
}

export async function installFeature(name: string, isRoot: boolean, options?: InstallOptions) {
	if (installedFeats.has(name)) return;
	installedFeats.add(name);

	const cwd = options?.cwd ?? process.cwd();

	console.log(
		isRoot ? `⬡ Installing feature: ${name}\n` : `\n⬡ Installing dependency feature: ${name}\n`,
	);

	const meta = await readRegistryJSON<FeatureMeta>(registryRoot, "features", name, "meta.json");

	// Install required feature dependencies first (recursive)
	if (meta.features && meta.features.length > 0) {
		for (const feat of meta.features) {
			await installFeature(feat, false, options);
		}
	}

	// Install required UI components
	if (meta.components.length > 0) {
		console.log("📦 Installing required components...");
		for (const comp of meta.components) {
			await addComponent(comp, false, options);
		}
		console.log("");
	}

	// Apply each file entry per its strategy
	const createdDirs = new Set<string>();
	for (const entry of meta.files) {
		const dest = join(cwd, entry.target);
		const strategy: FileStrategy = entry.strategy ?? "write";
		const dir = dirname(dest);
		if (!createdDirs.has(dir)) {
			mkdirSync(dir, { recursive: true });
			createdDirs.add(dir);
		}
		const content = await readRegistryFile(registryRoot, "features", name, entry.src);
		await applyStrategy({
			dest,
			target: entry.target,
			content,
			strategy,
			feat: name,
			marker: entry.marker ?? name,
			skipPrompts: options?.skipPrompts ?? false,
		});
	}

	// Install npm dependencies
	const hasDeps = Object.keys(meta.npmDeps).length > 0;
	const hasDevDeps = Object.keys(meta.npmDevDeps ?? {}).length > 0;
	const hasScripts = Object.keys(meta.scripts ?? {}).length > 0;

	if (hasDeps || hasDevDeps) {
		if (options?.skipInstall) {
			const { addedDeps, addedScripts } = mergePkgJson(cwd, {
				deps: meta.npmDeps,
				devDeps: meta.npmDevDeps,
				scripts: meta.scripts,
			});
			if (addedDeps.length > 0)
				console.log(`\n📥 Added to package.json: ${addedDeps.join(", ")}`);
			if (addedScripts.length > 0)
				console.log(`\n📜 Added scripts: ${addedScripts.join(", ")}`);
		} else {
			await bunAdd(cwd, meta.npmDeps, meta.npmDevDeps);
			if (hasScripts) {
				const { addedScripts } = mergePkgJson(cwd, { scripts: meta.scripts });
				if (addedScripts.length > 0)
					console.log(`\n📜 Added scripts: ${addedScripts.join(", ")}`);
			}
		}
	} else if (hasScripts) {
		const { addedScripts } = mergePkgJson(cwd, { scripts: meta.scripts });
		if (addedScripts.length > 0) console.log(`\n📜 Added scripts: ${addedScripts.join(", ")}`);
	}

	// Append env vars to .env if missing
	const envEntries = Object.entries(meta.envVars ?? {});
	if (envEntries.length > 0) {
		const envPath = join(cwd, ".env");
		const existing = existsSync(envPath) ? readFileSync(envPath, "utf-8") : "";
		const toAdd: string[] = [];
		for (const [key, val] of envEntries) {
			if (!existing.includes(`${key}=`)) {
				toAdd.push(`${key}=${val}`);
			}
		}
		if (toAdd.length > 0) {
			const nl = existing.length > 0 && !existing.endsWith("\n") ? "\n" : "";
			writeFileSync(envPath, existing + nl + toAdd.join("\n") + "\n", "utf-8");
			console.log(`\n🔑 Added to .env: ${toAdd.map((l) => l.split("=")[0]).join(", ")}`);
		}
	}

	if (isRoot) {
		console.log(`\n✅ Feature "${name}" scaffolded!`);
		if (meta.description) console.log(`   ${meta.description}`);
	} else {
		console.log(`   ✅ Dependency feature "${name}" installed.`);
	}
}

// ─── File strategies ──────────────────────────────────────

interface StrategyArgs {
	dest: string;
	target: string;
	content: string;
	strategy: FileStrategy;
	feat: string;
	marker: string;
	skipPrompts: boolean;
}

async function applyStrategy(args: StrategyArgs): Promise<void> {
	const { dest, target, content, strategy, feat, marker, skipPrompts } = args;

	switch (strategy) {
		case "write": {
			if (existsSync(dest) && !skipPrompts) {
				const replace = await p.confirm({
					message: `File "${target}" already exists. Replace it?`,
				});
				if (p.isCancel(replace) || !replace) {
					console.log(`   ⏭️  Skipped ${target}`);
					return;
				}
			}
			writeFileSync(dest, content, "utf-8");
			console.log(`   ✍️  ${target}`);
			return;
		}

		case "skip-if-exists": {
			if (existsSync(dest)) {
				console.log(`   ⏭️  Kept existing ${target}`);
				return;
			}
			writeFileSync(dest, content, "utf-8");
			console.log(`   ✍️  ${target}`);
			return;
		}

		case "append-line": {
			const existing = existsSync(dest) ? readFileSync(dest, "utf-8") : "";
			const existingLines = new Set(
				existing
					.split("\n")
					.map((l) => l.trim())
					.filter(Boolean),
			);
			const newLines = content
				.split("\n")
				.map((l) => l.trim())
				.filter(Boolean)
				.filter((l) => !existingLines.has(l));

			if (newLines.length === 0) {
				console.log(`   ⏭️  ${target} (no new lines)`);
				return;
			}

			const nl = existing.length > 0 && !existing.endsWith("\n") ? "\n" : "";
			writeFileSync(dest, existing + nl + newLines.join("\n") + "\n", "utf-8");
			console.log(
				`   ➕ ${target} (+${newLines.length} line${newLines.length === 1 ? "" : "s"})`,
			);
			return;
		}

		case "append-block": {
			const id = `bosia:${feat}:${marker}`;
			const delim = blockDelim(extname(dest));
			const startLine = delim.end
				? `${delim.start} >>> ${id} ${delim.end}`
				: `${delim.start} >>> ${id}`;
			const endLine = delim.end
				? `${delim.start} <<< ${id} ${delim.end}`
				: `${delim.start} <<< ${id}`;
			const block = `${startLine}\n${content.trimEnd()}\n${endLine}`;

			const existing = existsSync(dest) ? readFileSync(dest, "utf-8") : "";

			if (existing.includes(startLine) && existing.includes(endLine)) {
				const re = new RegExp(`${escapeRegex(startLine)}[\\s\\S]*?${escapeRegex(endLine)}`);
				writeFileSync(dest, existing.replace(re, block), "utf-8");
				console.log(`   ♻️  ${target} (replaced ${id})`);
			} else {
				const nl = existing.length > 0 && !existing.endsWith("\n") ? "\n" : "";
				writeFileSync(dest, existing + nl + block + "\n", "utf-8");
				console.log(`   ➕ ${target} (appended ${id})`);
			}
			return;
		}

		case "merge-json": {
			const existing = existsSync(dest) ? JSON.parse(readFileSync(dest, "utf-8")) : {};
			const incoming = JSON.parse(content);
			const merged = mergeJsonPreserve(existing, incoming);
			writeFileSync(dest, JSON.stringify(merged, null, 2) + "\n", "utf-8");
			console.log(`   🔀 ${target} (merged json)`);
			return;
		}

		default: {
			const _exhaustive: never = strategy;
			throw new Error(`Unknown file strategy: ${_exhaustive}`);
		}
	}
}

function blockDelim(ext: string): { start: string; end: string } {
	if (ext === ".html" || ext === ".svelte") return { start: "<!--", end: "-->" };
	if (ext === ".css") return { start: "/*", end: "*/" };
	return { start: "//", end: "" };
}

function escapeRegex(s: string): string {
	return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Deep-merge `source` into `target`, preserving existing target values.
// Objects: recurse. Arrays: concat-dedupe by JSON identity. Primitives: keep target.
function mergeJsonPreserve(target: unknown, source: unknown): unknown {
	if (Array.isArray(target) && Array.isArray(source)) {
		const out = [...target];
		for (const item of source) {
			if (!out.some((x) => JSON.stringify(x) === JSON.stringify(item))) {
				out.push(item);
			}
		}
		return out;
	}
	if (isPlainObject(target) && isPlainObject(source)) {
		const out: Record<string, unknown> = { ...target };
		for (const [k, v] of Object.entries(source)) {
			out[k] = k in target ? mergeJsonPreserve(target[k], v) : v;
		}
		return out;
	}
	return target !== undefined ? target : source;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
	return typeof v === "object" && v !== null && !Array.isArray(v);
}

// Re-exports for create.ts
export { resolveLocalRegistry, type InstallOptions } from "./registry.ts";
