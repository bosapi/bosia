import { compile, compileModule } from "svelte/compiler";
import type { BunPlugin } from "bun";

import { auditSvelteSource } from "./svelteAudit.ts";
import { loadBosiaConfig } from "./config.ts";
import type { StrictImportsOption } from "./types/plugin.ts";

const svelteHash = (s: string) => Bun.hash(s, 5381).toString(36);

// Bun's bundler does not chain sourcemaps from `onLoad` results, so the final
// bundle map points at the compiled svelte output (e.g. `$.next()`) using the
// .svelte filename — runtime stacks resolve to nonsense line numbers past EOF.
// We capture each per-file svelte compile map here, keyed by absolute source
// path; `remapBundleSourcemaps()` reads these after `Bun.build` and rewrites
// the output `.map` files to chain back to original source positions.
export const svelteMapCache = new Map<string, unknown>();

// Module-scoped so both the `browser` and `bun` plugin instances share state.
// Bosia spawns both per build (client + server in parallel) and each calls
// `onLoad` on the same `.svelte` file. Without sharing, the audit would run
// twice per file (wasteful) and the export cache wouldn't amortize across
// targets. Keyed by absolute path. Cleared between builds is not needed —
// stale entries are scoped to the (path, build-process) tuple.
const auditInflight = new Map<string, Promise<void>>();
const auditExportCache = new Map<string, Set<string> | null>();
let auditStrictPromise: Promise<StrictImportsOption> | null = null;

function getStrictImportsOption(): Promise<StrictImportsOption> {
	if (!auditStrictPromise) {
		auditStrictPromise = (async () => {
			try {
				const config = await loadBosiaConfig(process.cwd());
				return config.strictImports ?? true;
			} catch {
				return true;
			}
		})();
	}
	return auditStrictPromise;
}

/** Test-only — drop cached audit state so fixtures with fresh configs reload. */
export function resetSvelteAuditCache(): void {
	auditInflight.clear();
	auditExportCache.clear();
	auditStrictPromise = null;
}

// Svelte 5 dev compile emits named `function get()` / `function set($$value)`
// expressions inside `$.bind_*` calls (for nicer `$inspect` stack traces). Bun's
// bundler destructures `import * as $ from "svelte/internal/client"` into named
// imports, so `$.get(search)` becomes plain `get(search)` — which collides with
// the wrapping function name and recurses into itself → RangeError. Prod compile
// uses anonymous arrow functions and is unaffected.
//
// Rename to `$$g` / `$$s` (3 chars — length-preserving so cached svelte source
// map columns stay accurate). These names aren't present in svelte/internal/client.
function fixBindShadow(code: string): string {
	return code
		.replace(/\bfunction get\(\)/g, () => "function $$g()")
		.replace(/\bfunction set\(\$\$value\)/g, () => "function $$s($$value)");
}

export function makeBosiaSvelteCompiler(target: "browser" | "bun"): BunPlugin {
	const generate = target === "browser" ? "client" : "server";
	const dev = process.env.NODE_ENV !== "production";

	return {
		name: "bosia-svelte-compiler",
		setup(build) {
			const ts = new Bun.Transpiler({
				loader: "ts",
				target: target === "browser" ? "browser" : "bun",
			});

			build.onLoad({ filter: /\.svelte$/ }, async (args) => {
				const source = await Bun.file(args.path).text();
				const result = compile(source, {
					generate,
					css: target === "browser" ? "injected" : "external",
					dev,
					hmr: false,
					cssHash: ({ css }) => `svelte-${svelteHash(css)}`,
					filename: args.path,
					// Modern AST shape (Svelte 5.x) — `fragment`, `instance`, `module`
					// rather than the legacy `html`. The audit walker assumes modern.
					modernAst: true,
				});
				const existing = auditInflight.get(args.path);
				if (existing) {
					await existing;
				} else {
					const promise = (async () => {
						const strict = await getStrictImportsOption();
						const failure = await auditSvelteSource({
							source,
							filename: args.path,
							ast: (result as unknown as { ast?: unknown }).ast,
							warnings: (result.warnings ?? []) as unknown as Parameters<
								typeof auditSvelteSource
							>[0]["warnings"],
							cwd: process.cwd(),
							exportCache: auditExportCache,
							strict,
						});
						if (failure) throw new Error(failure);
					})();
					auditInflight.set(args.path, promise);
					await promise;
				}
				// Only the client target's map is useful to the inspector's runtime
				// resolver — browser-side stack frames are what we need to translate.
				// Server (Bun) compile output has different line numbers and would
				// clobber the client entry under the same cache key.
				if (dev && target === "browser" && result.js.map) {
					const m = typeof result.js.map === "string" ? JSON.parse(result.js.map) : result.js.map;
					svelteMapCache.set(args.path, m);
				}
				const contents = dev ? fixBindShadow(result.js.code) : result.js.code;
				return { contents, loader: "ts" };
			});

			build.onLoad({ filter: /\.svelte\.[tj]s$/ }, async (args) => {
				let source = await Bun.file(args.path).text();
				if (args.path.endsWith(".ts")) {
					source = await ts.transform(source);
				}
				const result = compileModule(source, {
					generate,
					dev,
					filename: args.path,
				});
				if (dev && target === "browser" && result.js.map) {
					const m = typeof result.js.map === "string" ? JSON.parse(result.js.map) : result.js.map;
					svelteMapCache.set(args.path, m);
				}
				return { contents: result.js.code, loader: "js" };
			});
		},
	};
}
