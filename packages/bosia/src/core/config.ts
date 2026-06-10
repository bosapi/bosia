import { existsSync, mkdirSync } from "fs";
import { join } from "path";

import { OUT_DIR } from "./paths.ts";
import type { BosiaConfig, BosiaPlugin } from "./types/plugin.ts";

let cached: BosiaConfig | null = null;
let cachedFromPath: string | null = null;

const CONFIG_NAMES = ["bosia.config.ts", "bosia.config.js", "bosia.config.mjs"];

function findConfigPath(cwd: string): string | null {
	for (const name of CONFIG_NAMES) {
		const p = join(cwd, name);
		if (existsSync(p)) return p;
	}
	return null;
}

/**
 * Resolve and load `bosia.config.ts` (or `.js`/`.mjs`) from cwd. Returns the
 * default export. If no config is present, returns `{ plugins: [] }`.
 *
 * Cached per-cwd. Compiled via `Bun.build({ target: "bun" })` so user code can
 * use TypeScript and bare-specifier imports.
 */
export async function loadBosiaConfig(cwd: string = process.cwd()): Promise<BosiaConfig> {
	if (cached && cachedFromPath === cwd) return cached;

	// Production runtime: prefer the pre-bundled `${OUT_DIR}/bosia.config.js`
	// produced by the build. Avoids needing `bosia.config.ts` in the image and
	// skips an on-the-fly Bun.build at server startup.
	const prebuiltPath = join(cwd, OUT_DIR, "bosia.config.js");
	if (existsSync(prebuiltPath)) {
		const mod = (await import(prebuiltPath)) as { default?: BosiaConfig };
		const config = mod.default;
		if (!config || typeof config !== "object") {
			throw new Error(
				`${prebuiltPath} must export a default object (use \`export default defineConfig({...})\`).`,
			);
		}
		const rawPlugins = Array.isArray(config.plugins) ? config.plugins : [];
		const plugins = rawPlugins.filter((p): p is BosiaPlugin => Boolean(p));
		cached = { plugins };
		cachedFromPath = cwd;
		return cached;
	}

	const configPath = findConfigPath(cwd);
	if (!configPath) {
		cached = { plugins: [] };
		cachedFromPath = cwd;
		return cached;
	}

	const result = await Bun.build({
		entrypoints: [configPath],
		target: "bun",
		format: "esm",
		external: ["bosia", "elysia", "bun", "svelte", "svelte/server"],
	});

	if (!result.success || !result.outputs[0]) {
		const logs = result.logs.map((l) => String(l)).join("\n");
		throw new Error(`Failed to compile ${configPath}:\n${logs}`);
	}

	const code = await result.outputs[0].text();
	// Write inside cwd so bare-specifier imports (e.g. `bosia/plugins/...`) resolve via
	// the project's own node_modules. /tmp would have no node_modules to walk into.
	const cacheDir = join(cwd, ".bosia");
	mkdirSync(cacheDir, { recursive: true });
	const tmpFile = join(cacheDir, `config.${Date.now()}.${Math.random().toString(36).slice(2)}.mjs`);
	await Bun.write(tmpFile, code);

	let mod: { default?: BosiaConfig };
	try {
		mod = await import(tmpFile);
	} finally {
		try {
			await Bun.file(tmpFile).delete();
		} catch {}
	}

	const config = mod.default;
	if (!config || typeof config !== "object") {
		throw new Error(
			`${configPath} must export a default object (use \`export default defineConfig({...})\` or \`export default {...} satisfies BosiaConfig\`).`,
		);
	}

	const rawPlugins = Array.isArray(config.plugins) ? config.plugins : [];
	const plugins = rawPlugins.filter((p): p is BosiaPlugin => Boolean(p));
	const normalized: BosiaConfig = { plugins };

	cached = normalized;
	cachedFromPath = cwd;
	return normalized;
}

/** Test-only — drops the in-memory cache so tests can reload fresh config files. */
export function resetConfigCache(): void {
	cached = null;
	cachedFromPath = null;
}

/** Convenience: load and return only the plugin list. */
export async function loadPlugins(cwd?: string): Promise<BosiaPlugin[]> {
	const config = await loadBosiaConfig(cwd);
	return (config.plugins ?? []).filter((p): p is BosiaPlugin => Boolean(p));
}
