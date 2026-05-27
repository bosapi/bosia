import { existsSync } from "fs";
import { join, dirname, resolve as pathResolve } from "path";

// ─── Shared $alias / tsconfig-paths / relative resolver ──
// Mirrors the resolution `plugin.ts` does inside Bun's `onResolve`, but as a
// plain async function callable from contexts without a Bun PluginBuilder
// (e.g. the svelte component-import audit).

let cachedTsconfigPaths: Record<string, string[]> | null = null;
let cachedTsconfigCwd: string | null = null;

async function getTsconfigPaths(cwd: string): Promise<Record<string, string[]>> {
	if (cachedTsconfigPaths !== null && cachedTsconfigCwd === cwd) return cachedTsconfigPaths;
	const tsconfigPath = join(cwd, "tsconfig.json");
	if (!existsSync(tsconfigPath)) {
		cachedTsconfigPaths = {};
		cachedTsconfigCwd = cwd;
		return cachedTsconfigPaths;
	}
	try {
		const tsconfig = await Bun.file(tsconfigPath).json();
		cachedTsconfigPaths = tsconfig?.compilerOptions?.paths || {};
	} catch (err) {
		throw new Error(
			`tsconfig.json at ${tsconfigPath} is invalid JSON: ${(err as Error).message}. Fix the file and re-run.`,
		);
	}
	cachedTsconfigCwd = cwd;
	return cachedTsconfigPaths!;
}

async function resolveWithExts(base: string): Promise<string> {
	if (await Bun.file(base).exists()) return base;
	for (const ext of [".ts", ".svelte", ".js"]) {
		if (await Bun.file(base + ext).exists()) return base + ext;
	}
	for (const idx of ["index.ts", "index.svelte", "index.js"]) {
		const p = join(base, idx);
		if (await Bun.file(p).exists()) return p;
	}
	return base;
}

/**
 * Kind classifies why the spec resolved (or did not):
 *  - "alias"    — `$lib/...` / `$registry/...` (tsconfig paths or $lib fallback)
 *  - "relative" — `./` or `../` from `fromFile`
 *  - "absolute" — `/abs/path`
 *  - "bare"     — bare package specifier; not introspectable from disk
 *  - "virtual"  — bosia-special (`$env`, `bosia:routes`); skip
 */
export type ResolvedKind = "alias" | "relative" | "absolute" | "bare" | "virtual";

export interface ResolvedImport {
	kind: ResolvedKind;
	/** Absolute path on disk for alias/relative/absolute kinds; otherwise null. */
	path: string | null;
}

export async function resolveImportPath(
	spec: string,
	fromFile: string,
	cwd: string,
): Promise<ResolvedImport> {
	if (spec === "$env" || spec === "bosia:routes") {
		return { kind: "virtual", path: null };
	}

	if (spec.startsWith("./") || spec.startsWith("../")) {
		const abs = pathResolve(dirname(fromFile), spec);
		return { kind: "relative", path: await resolveWithExts(abs) };
	}

	if (spec.startsWith("/")) {
		return { kind: "absolute", path: await resolveWithExts(spec) };
	}

	if (spec.startsWith("$")) {
		const paths = await getTsconfigPaths(cwd);
		let longestMatch = "";
		let targetPattern = "";

		for (const [pattern, targets] of Object.entries(paths)) {
			const prefix = pattern.replace(/\*$/, "");
			if (spec.startsWith(prefix) && prefix.length > longestMatch.length) {
				longestMatch = prefix;
				targetPattern = (targets as string[])[0];
			}
		}

		if (longestMatch && targetPattern) {
			const suffix = spec.slice(longestMatch.length);
			const targetDir = targetPattern.replace(/\*$/, "");
			const resolved = join(cwd, targetDir, suffix);
			return { kind: "alias", path: await resolveWithExts(resolved) };
		}

		if (spec.startsWith("$lib/")) {
			const rel = spec.slice(5);
			const base = join(cwd, "src", "lib", rel);
			return { kind: "alias", path: await resolveWithExts(base) };
		}

		return { kind: "alias", path: null };
	}

	return { kind: "bare", path: null };
}

/** Test-only — drop the tsconfig cache so fixtures with fresh tsconfig.json reload. */
export function resetResolveImportCache(): void {
	cachedTsconfigPaths = null;
	cachedTsconfigCwd = null;
}
