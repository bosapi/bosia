import { compile, compileModule } from "svelte/compiler";
import type { BunPlugin } from "bun";

import { auditSvelteSource } from "./svelteAudit.ts";
import { collectComponentCss } from "./componentCss.ts";
import { rebaseHtmlAttrs } from "./basePath.ts";
import { currentBase } from "./appBase.ts";
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

// Under a BASE_PATH mount, a component's own `<a href="/masuk">` is the one URL
// the server-side HTML rewrite cannot hold on to: the client re-renders on mount
// and Svelte writes the original literal straight back into the DOM. Nothing
// downstream saves it: the router converts nothing, so the href a crawler reads,
// a middle-click opens, "copy link address" yields — and the click itself — all
// point at the origin root, i.e. at whatever other app lives there.
//
// So the prefix is baked in at compile time instead. Only the markup is touched:
// a root-absolute string inside <script> could be anything, and guessing is how
// you corrupt an unrelated constant. Attribute interpolation survives, since the
// rewrite only touches the leading literal — href="/user/{id}" is still valid.
//
// Dynamic values (href={someUrl}) are built in script and still need `base`.
export function rebaseSvelteMarkup(source: string): string {
	// currentBase(), not the paths.ts const: that one freezes at import, and this
	// module is loaded long before a build sets the env.
	const base = currentBase();
	if (!base) return source;

	const scripts: string[] = [];
	const masked = source.replace(/<script[\s\S]*?<\/script>/gi, (block) => {
		scripts.push(block);
		return `<!--bosia:script:${scripts.length - 1}-->`;
	});

	return rebaseHtmlAttrs(base, masked).replace(
		/<!--bosia:script:(\d+)-->/g,
		(_match, index: string) => scripts[Number(index)],
	);
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
				const result = compile(rebaseSvelteMarkup(source), {
					generate,
					// External on both targets. The browser used to get "injected",
					// which put every scoped rule inside the JS bundle — so an
					// SSR'd page painted before its own layout CSS existed and
					// snapped into place at hydration. `collectComponentCss` below
					// gathers the rules into one stylesheet the head can link.
					css: "external",
					dev,
					hmr: false,
					cssHash: ({ css }) => `svelte-${svelteHash(css)}`,
					filename: args.path,
					// Modern AST shape (Svelte 5.x) — `fragment`, `instance`, `module`
					// rather than the legacy `html`. The audit walker assumes modern.
					modernAst: true,
				});
				// Browser only: both plugin instances share module state and the
				// client and server builds run concurrently, so collecting from
				// each would emit every rule twice.
				if (target === "browser" && result.css?.code) {
					collectComponentCss(args.path, result.css.code);
				}
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
