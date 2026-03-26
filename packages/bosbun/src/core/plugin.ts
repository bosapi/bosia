import { join, dirname } from "path";

// ─── Bun Build Plugin ─────────────────────────────────────
// Resolves:
//   bosia:routes  → .bosia/routes.ts  (generated route map)
//   $env           → .bosia/env.server.ts (bun) or .bosia/env.client.ts (browser)
//   $lib/*        → src/lib/*         (user library alias)

export function makeBosiaPlugin(target: "browser" | "bun" = "bun") {
    return {
        name: "bosia-resolver",
        setup(build: import("bun").PluginBuilder) {
            // bosia:routes → .bosia/routes.ts
            build.onResolve({ filter: /^bosia:routes$/ }, () => ({
                path: join(process.cwd(), ".bosia", "routes.ts"),
            }));

            // $env → .bosia/env.client.ts (browser) or .bosia/env.server.ts (bun)
            build.onResolve({ filter: /^\$env$/ }, () => ({
                path: join(
                    process.cwd(),
                    ".bosia",
                    target === "browser" ? "env.client.ts" : "env.server.ts",
                ),
            }));

            // $lib/* → src/lib/* with extension probing
            build.onResolve({ filter: /^\$lib\// }, async (args) => {
                const rel = args.path.slice(5); // remove "$lib/"
                const base = join(process.cwd(), "src", "lib", rel);
                return { path: await resolveWithExts(base) };
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
                } catch { }
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
            build.onLoad({ filter: /.*/, namespace: "bosia-empty-css" }, () => ({
                contents: "",
                loader: "css",
            }));
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
