import { join, dirname, basename } from "path";
import { existsSync } from "fs";
import { compile } from "svelte/compiler";

// ─── Bun Build Plugin ─────────────────────────────────────
// Resolves:
//   bosia:routes  → .bosia/routes.ts  (generated route map)
//   $env           → .bosia/env.server.ts (bun) or .bosia/env.client.ts (browser)
//   $*             → resolved dynamically via tsconfig.json compilerOptions.paths

let cachedTsconfigPaths: Record<string, string[]> | null = null;
async function getTsconfigPaths() {
	if (cachedTsconfigPaths !== null) return cachedTsconfigPaths;
	const tsconfigPath = join(process.cwd(), "tsconfig.json");
	if (!existsSync(tsconfigPath)) {
		cachedTsconfigPaths = {};
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
	return cachedTsconfigPaths!;
}

export function makeBosiaPlugin(target: "browser" | "bun" = "bun") {
	return {
		name: "bosia-resolver",
		setup(build: import("bun").PluginBuilder) {
			// bosia:routes → .bosia/routes.client.ts (browser) or .bosia/routes.ts (server)
			// Client-only file excludes serverRoutes/apiRoutes to prevent the browser
			// bundler from following server-side dynamic imports into Node builtins.
			build.onResolve({ filter: /^bosia:routes$/ }, () => ({
				path: join(
					process.cwd(),
					".bosia",
					target === "browser" ? "routes.client.ts" : "routes.ts",
				),
			}));

			// $env → .bosia/env.client.ts (browser) or .bosia/env.server.ts (bun)
			build.onResolve({ filter: /^\$env$/ }, () => ({
				path: join(
					process.cwd(),
					".bosia",
					target === "browser" ? "env.client.ts" : "env.server.ts",
				),
			}));

			// Handle all $ aliases using tsconfig.json paths (e.g. $lib, $registry)
			build.onResolve({ filter: /^\$/ }, async (args) => {
				if (args.path === "$env") return undefined; // Handled above

				const paths = await getTsconfigPaths();
				let longestMatch = "";
				let targetPattern = "";

				for (const [pattern, targets] of Object.entries(paths)) {
					const prefix = pattern.replace(/\*$/, "");
					if (args.path.startsWith(prefix) && prefix.length > longestMatch.length) {
						longestMatch = prefix;
						targetPattern = (targets as string[])[0];
					}
				}

				if (longestMatch && targetPattern) {
					const suffix = args.path.slice(longestMatch.length);
					const targetDir = targetPattern.replace(/\*$/, "");
					const resolved = join(process.cwd(), targetDir, suffix);
					return { path: await resolveWithExts(resolved) };
				}

				// Fallback for $lib/* if not in tsconfig
				if (args.path.startsWith("$lib/")) {
					const rel = args.path.slice(5);
					const base = join(process.cwd(), "src", "lib", rel);
					return { path: await resolveWithExts(base) };
				}

				return undefined;
			});

			// Force svelte imports to resolve from the app's node_modules.
			// Without this, when bosia is symlinked (bun link / workspace),
			// hydrate.ts resolves "svelte" from the framework's location while
			// compiled components resolve "svelte/internal/client" from the app's.
			// Two different Svelte copies = duplicate runtime state = broken hydration.
			//
			// require.resolve uses the "default" export condition, which for
			// bare "svelte" returns index-server.js. For browser builds we need
			// index-client.js, so we read the "browser" condition from package.json.
			const appDir = process.cwd();
			let svelteBrowserEntry: string | null = null;
			if (target === "browser") {
				try {
					const svelteDir = dirname(
						require.resolve("svelte/package.json", { paths: [appDir] }),
					);
					const pkg = require(join(svelteDir, "package.json"));
					const dotExport = pkg.exports?.["."];
					const browserPath = typeof dotExport === "object" ? dotExport.browser : null;
					if (browserPath) {
						svelteBrowserEntry = join(svelteDir, browserPath);
					}
				} catch {}
			}
			build.onResolve({ filter: /^svelte(\/.*)?$/ }, (args) => {
				try {
					// Bare "svelte" in browser build: use the "browser" export condition
					if (args.path === "svelte" && svelteBrowserEntry) {
						return { path: svelteBrowserEntry };
					}
					return { path: require.resolve(args.path, { paths: [appDir] }) };
				} catch {
					return undefined; // fall through to default resolution
				}
			});

			// "tailwindcss" inside app.css is a Tailwind CLI directive —
			// it's already compiled to public/bosia-tw.css by the CLI step.
			// Return an empty CSS module so Bun's CSS bundler doesn't choke on it.
			build.onResolve({ filter: /^tailwindcss$/ }, () => ({
				path: "tailwindcss",
				namespace: "bosia-empty-css",
			}));
			// app.css is processed by Tailwind CLI into public/bosia-tw.css and
			// loaded via <link> tag in HTML — skip bundling as JS no-op to avoid
			// Bun emitting identical CSS sidecars per dynamic-imported chunk
			// (output collision when many chunks share the same empty CSS dep).
			build.onResolve({ filter: /(?:^|.*\/)app\.css$/ }, () => ({
				path: "app.css",
				namespace: "bosia-empty-app-css",
			}));
			build.onLoad({ filter: /.*/, namespace: "bosia-empty-app-css" }, () => ({
				contents: "",
				loader: "js",
			}));
			build.onLoad({ filter: /.*/, namespace: "bosia-empty-css" }, () => ({
				contents: "",
				loader: "css",
			}));

			// ─── Svelte CSS dedup ─────────────────────────────
			// bun-plugin-svelte (css: "external") creates virtual CSS modules at
			//   bun-svelte:<basename>-<hash>-style.css
			// With splitting:true, Bun emits a CSS chunk per dynamic import that
			// shares the same CSS → output path collision.
			//
			// Fix: extract CSS ourselves during .svelte compilation, then redirect
			// every bun-svelte: module to a unique _svelte/<uid> path so Bun never
			// sees two chunks competing for the same output file.  The redirected
			// file uses loader "js" (runtime <style> injection) so Bun creates no
			// CSS chunks at all.
			const svelteCssByUid = new Map<string, string>();
			const svelteHash = (s: string) => Bun.hash(s, 5381).toString(36);

			if (target === "browser") {
				build.onLoad({ filter: /\.svelte$/ }, async (args) => {
					const src = await Bun.file(args.path).text();
					const result = compile(src, {
						generate: "client",
						css: "external",
						filename: args.path,
						cssHash({ css }: { css: string }) {
							return `svelte-${svelteHash(css)}`;
						},
					});
					if (result.css?.code) {
						const uid = `${basename(args.path)}-${svelteHash(args.path)}-style.css`;
						const prev = svelteCssByUid.get(uid);
						svelteCssByUid.set(
							uid,
							prev ? prev + "\n" + result.css.code : result.css.code,
						);
					}
					// Let bun-plugin-svelte handle the real compilation
					return undefined;
				});
			}

			build.onResolve({ filter: /^bun-svelte:/ }, (args) => {
				const file = args.path.slice("bun-svelte:".length);
				return {
					path: "_svelte/" + file,
					namespace: "bosia-svelte",
				};
			});

			build.onLoad({ filter: /.*/, namespace: "bosia-svelte" }, (args) => {
				const file = args.path.slice("_svelte/".length);
				const css = svelteCssByUid.get(file);
				return {
					contents: css
						? `var s=document.createElement('style');s.textContent=${JSON.stringify(css)};document.head.appendChild(s);`
						: "",
					loader: "js",
				};
			});
		},
	};
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
