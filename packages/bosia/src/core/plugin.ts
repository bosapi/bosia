import { join, dirname } from "path";

import { resolveImportPath } from "./resolveImport.ts";

// ─── Bun Build Plugin ─────────────────────────────────────
// Resolves:
//   bosia:routes  → .bosia/routes.ts  (generated route map)
//   $env           → .bosia/env.server.ts (bun) or .bosia/env.client.ts (browser)
//   $*             → resolved dynamically via tsconfig.json compilerOptions.paths

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

				const resolved = await resolveImportPath(
					args.path,
					join(process.cwd(), "_"),
					process.cwd(),
				);
				if (resolved.kind === "alias" && resolved.path) {
					return { path: resolved.path };
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
					const svelteDir = dirname(require.resolve("svelte/package.json", { paths: [appDir] }));
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
			// loaded via <link> tag in HTML. User layouts often `import "../app.css"`
			// for IDE/Tailwind tooling — bundle as JS no-op so Bun doesn't emit a
			// CSS chunk per dynamic-imported route (identical content → output
			// collision under splitting:true).
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
		},
	};
}
