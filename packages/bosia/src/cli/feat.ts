import { join, dirname, extname } from "path";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "fs";
import * as p from "@clack/prompts";
import { addComponent, initAddRegistry } from "./add.ts";
import { runAddBlock } from "./block.ts";
import {
	type InstallOptions,
	resolveLocalRegistryOrExit,
	readRegistryJSON,
	readRegistryFile,
	mergePkgJson,
	bunAdd,
} from "./registry.ts";
import { recordFeature, readManifest } from "./manifest.ts";

// ─── bun x bosia@latest feat <feature> [--local] ─────────
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
	when?: Record<string, string>; // install only if every option value matches
}

interface FeatureOption {
	name: string; // option key, also used in FileEntry.when
	flag?: string; // short flag, e.g. "-d"
	long?: string; // long flag, e.g. "--dialect"
	prompt?: string; // interactive prompt label
	choices?: { value: string; label?: string; hint?: string }[]; // enum picker
	default?: string; // fallback when -y is set or user accepts default
	required?: boolean; // when true, missing value with no default errors out
}

interface FeatureMeta {
	name: string;
	description: string;
	features?: string[]; // other bosia features required
	components: string[]; // bosia components to install via `bun x bosia@latest add`
	blocks?: string[]; // bosia blocks to install via `bun x bosia@latest add block`
	files: FileEntry[]; // file entries with per-file strategy
	npmDeps: Record<string, string>;
	npmDevDeps?: Record<string, string>;
	scripts?: Record<string, string>; // package.json scripts to add
	envVars?: Record<string, string>; // env vars to append to .env if missing
	options?: FeatureOption[]; // feature-specific CLI flags (e.g. file-upload's -d)
}

let registryRoot: string | null = null;

// Track installed features to prevent circular dependencies
const installedFeats = new Set<string>();

export async function runFeat(name: string | undefined, args: string[] = []) {
	// Strip global flags (-y/--yes, --local); everything else is feature args.
	const { autoYes, local, featureArgs } = splitGlobalFlags(args);

	if (!name) {
		console.error(
			"❌ Please provide a feature name.\n   Usage: bun x bosia@latest feat [-y] [--local] <feature> [feature options...]",
		);
		process.exit(1);
	}

	if (local) {
		registryRoot = resolveLocalRegistryOrExit();
		console.log(`⬡ Using local registry: ${registryRoot}\n`);
	}

	// Initialize add.ts registry context so addComponent resolves paths correctly
	await initAddRegistry(registryRoot);

	await installFeature(name, true, { skipPrompts: autoYes, featureArgs });
}

function splitGlobalFlags(args: string[]): {
	autoYes: boolean;
	local: boolean;
	featureArgs: string[];
} {
	let autoYes = false;
	let local = false;
	const featureArgs: string[] = [];
	for (const a of args) {
		if (a === "-y" || a === "--yes") autoYes = true;
		else if (a === "--local") local = true;
		else featureArgs.push(a);
	}
	return { autoYes, local, featureArgs };
}

/**
 * Parse `args` against `options` (the feature's declared schema). Unknown flags abort.
 * Returns a `{name: value}` map; missing entries are filled by prompt or `default`.
 */
async function resolveFeatureOptions(
	featName: string,
	options: FeatureOption[],
	args: string[],
	skipPrompts: boolean,
	seed: Record<string, string> = {},
): Promise<Record<string, string>> {
	// Seed values come from inherited featureOptions (e.g. template-level defaults).
	// They beat per-feature `default` but lose to explicit CLI args.
	const values: Record<string, string> = { ...seed };
	const byFlag = new Map<string, FeatureOption>();
	for (const opt of options) {
		if (opt.flag) byFlag.set(opt.flag, opt);
		if (opt.long) byFlag.set(opt.long, opt);
	}

	for (let i = 0; i < args.length; i++) {
		const tok = args[i];
		const opt = byFlag.get(tok);
		if (!opt) {
			console.error(`❌ Unknown option "${tok}" for feature "${featName}".`);
			if (options.length > 0) {
				const valid = options
					.map((o) => [o.flag, o.long].filter(Boolean).join("/"))
					.filter(Boolean)
					.join(", ");
				console.error(`   Valid options: ${valid}`);
			}
			process.exit(1);
		}
		const val = args[++i];
		if (val === undefined) {
			console.error(`❌ Option "${tok}" requires a value.`);
			process.exit(1);
		}
		if (opt.choices && !opt.choices.some((c) => c.value === val)) {
			console.error(
				`❌ Invalid value "${val}" for "${tok}". Expected: ${opt.choices.map((c) => c.value).join(", ")}`,
			);
			process.exit(1);
		}
		values[opt.name] = val;
	}

	for (const opt of options) {
		if (opt.name in values) continue;
		if (skipPrompts) {
			if (opt.default !== undefined) {
				values[opt.name] = opt.default;
				continue;
			}
			if (opt.required) {
				console.error(
					`❌ Feature "${featName}" requires "${opt.flag ?? opt.long ?? opt.name}".`,
				);
				process.exit(1);
			}
			continue;
		}
		values[opt.name] = await promptOption(featName, opt);
	}

	return values;
}

async function promptOption(featName: string, opt: FeatureOption): Promise<string> {
	const message = opt.prompt ?? `Choose "${opt.name}" for "${featName}"`;
	if (opt.choices && opt.choices.length > 0) {
		const selected = await p.select({
			message,
			options: opt.choices.map((c) => ({
				value: c.value,
				label: c.label ?? c.value,
				hint: c.hint,
			})),
			initialValue: opt.default ?? opt.choices[0].value,
		});
		if (p.isCancel(selected)) {
			p.cancel("Operation cancelled.");
			process.exit(0);
		}
		return selected as string;
	}
	const typed = await p.text({
		message,
		initialValue: opt.default,
		validate: (v) => (opt.required && !v ? "Required" : undefined),
	});
	if (p.isCancel(typed)) {
		p.cancel("Operation cancelled.");
		process.exit(0);
	}
	return (typed as string) ?? "";
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

	// Resolve this feature's own options (from `featureArgs` if root, else from `featureOptions`).
	const inheritedOptions = options?.featureOptions ?? {};
	let myOptions: Record<string, string> = {};
	if (meta.options && meta.options.length > 0) {
		// Extract this feature's seed values from the namespaced inherited map.
		const seed: Record<string, string> = {};
		for (const [k, v] of Object.entries(inheritedOptions)) {
			const [feat, optName] = k.split(".");
			if (feat === name) seed[optName] = v;
		}
		myOptions = isRoot
			? await resolveFeatureOptions(
					name,
					meta.options,
					options?.featureArgs ?? [],
					options?.skipPrompts ?? false,
					seed,
				)
			: // Dependency features inherit any caller-provided values; prompt only for unresolved required opts.
				await resolveFeatureOptions(
					name,
					meta.options,
					[],
					options?.skipPrompts ?? false,
					seed,
				);
	}

	// Merge into the namespaced map for downstream dependency features.
	const featureOptions = { ...inheritedOptions };
	for (const [k, v] of Object.entries(myOptions)) featureOptions[`${name}.${k}`] = v;

	const nextOptions: InstallOptions = {
		...options,
		featureOptions,
		featureArgs: undefined, // already consumed by the root feature
	};

	// Install required feature dependencies first (recursive)
	if (meta.features && meta.features.length > 0) {
		for (const feat of meta.features) {
			await installFeature(feat, false, nextOptions);
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

	// Install required blocks
	if (meta.blocks && meta.blocks.length > 0) {
		console.log("🧱 Installing required blocks...");
		for (const blockName of meta.blocks) {
			await runAddBlock(blockName, [], { ...options, registryRoot });
		}
		console.log("");
	}

	// Apply each file entry per its strategy. Skip entries whose `when` clause doesn't match.
	const createdDirs = new Set<string>();
	const recordedFiles: { target: string; strategy: string; marker?: string }[] = [];
	for (const entry of meta.files) {
		if (entry.when && !whenMatches(entry.when, myOptions)) continue;
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
			skipPrompts: nextOptions.skipPrompts ?? false,
		});
		recordedFiles.push({
			target: entry.target,
			strategy,
			...(entry.marker ? { marker: entry.marker } : {}),
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

	// Record install in bosia.json manifest (overwrites prior entry on re-install).
	recordFeature(cwd, name, {
		...(Object.keys(myOptions).length > 0 ? { options: myOptions } : {}),
		files: recordedFiles,
		...(Object.keys(meta.npmDeps).length > 0 ? { npmDeps: Object.keys(meta.npmDeps) } : {}),
		...(meta.npmDevDeps && Object.keys(meta.npmDevDeps).length > 0
			? { npmDevDeps: Object.keys(meta.npmDevDeps) }
			: {}),
		...(meta.envVars && Object.keys(meta.envVars).length > 0
			? { envVars: Object.keys(meta.envVars) }
			: {}),
		...((meta.features && meta.features.length > 0) ||
		meta.components.length > 0 ||
		(meta.blocks && meta.blocks.length > 0)
			? {
					deps: {
						...(meta.features && meta.features.length > 0
							? { features: meta.features }
							: {}),
						...(meta.components.length > 0 ? { components: meta.components } : {}),
						...(meta.blocks && meta.blocks.length > 0 ? { blocks: meta.blocks } : {}),
					},
				}
			: {}),
	});

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

function whenMatches(when: Record<string, string>, values: Record<string, string>): boolean {
	for (const [k, expected] of Object.entries(when)) {
		if (values[k] !== expected) return false;
	}
	return true;
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

// ─── bosia feat list ──────────────────────────────────────

export function runFeatList(): void {
	const manifest = readManifest();
	const entries = Object.entries(manifest.features);
	if (entries.length === 0) {
		console.log("No features installed.");
		console.log("Install one with: bun x bosia@latest feat <name>");
		return;
	}
	console.log(`⬡ Installed features (${entries.length}):\n`);
	const nameWidth = Math.max(...entries.map(([n]) => n.length));
	for (const [name, entry] of entries) {
		const opts = entry.options
			? Object.entries(entry.options)
					.map(([k, v]) => `${k}=${v}`)
					.join(", ")
			: "";
		const date = entry.installedAt.slice(0, 10);
		const optsSuffix = opts ? `  (${opts})` : "";
		console.log(`  ${name.padEnd(nameWidth)}  ${date}${optsSuffix}`);
	}
}

// Re-exports for create.ts
export { resolveLocalRegistry, type InstallOptions } from "./registry.ts";
