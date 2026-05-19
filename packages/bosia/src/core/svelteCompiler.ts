import { compile, compileModule } from "svelte/compiler";
import type { BunPlugin } from "bun";

const svelteHash = (s: string) => Bun.hash(s, 5381).toString(36);

// Bun's bundler does not chain sourcemaps from `onLoad` results, so the final
// bundle map points at the compiled svelte output (e.g. `$.next()`) using the
// .svelte filename — runtime stacks resolve to nonsense line numbers past EOF.
// We capture each per-file svelte compile map here, keyed by absolute source
// path; `remapBundleSourcemaps()` reads these after `Bun.build` and rewrites
// the output `.map` files to chain back to original source positions.
export const svelteMapCache = new Map<string, unknown>();

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
				});
				// Only the client target's map is useful to the inspector's runtime
				// resolver — browser-side stack frames are what we need to translate.
				// Server (Bun) compile output has different line numbers and would
				// clobber the client entry under the same cache key.
				if (dev && target === "browser" && result.js.map) {
					const m =
						typeof result.js.map === "string"
							? JSON.parse(result.js.map)
							: result.js.map;
					svelteMapCache.set(args.path, m);
				}
				return { contents: result.js.code, loader: "ts" };
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
					const m =
						typeof result.js.map === "string"
							? JSON.parse(result.js.map)
							: result.js.map;
					svelteMapCache.set(args.path, m);
				}
				return { contents: result.js.code, loader: "js" };
			});
		},
	};
}
