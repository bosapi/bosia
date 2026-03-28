import { join, dirname } from "path";

// ─── Bun Build Plugin ─────────────────────────────────────
// Resolves:
//   bosia:routes  → .bosia/routes.ts  (generated route map)
//   $env           → .bosia/env.server.ts (bun) or .bosia/env.client.ts (browser)
//   $*             → resolved dynamically via tsconfig.json compilerOptions.paths

let cachedTsconfigPaths: Record<string, string[]> | null = null;
async function getTsconfigPaths() {
    if (cachedTsconfigPaths !== null) return cachedTsconfigPaths;
    try {
        const tsconfig = await Bun.file(join(process.cwd(), "tsconfig.json")).json();
        cachedTsconfigPaths = tsconfig?.compilerOptions?.paths || {};
    } catch {
        cachedTsconfigPaths = {};
    }
    return cachedTsconfigPaths!;
}

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
