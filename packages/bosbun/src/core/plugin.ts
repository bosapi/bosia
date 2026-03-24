import { join } from "path";

// ─── Bun Build Plugin ─────────────────────────────────────
// Resolves:
//   bosbun:routes  → .bosbun/routes.ts  (generated route map)
//   bosbun:env     → .bosbun/env.server.ts (bun) or .bosbun/env.client.ts (browser)
//   $lib/*        → src/lib/*         (user library alias)

export function makeBosbunPlugin(target: "browser" | "bun" = "bun") {
    return {
        name: "bosbun-resolver",
        setup(build: import("bun").PluginBuilder) {
            // bosbun:routes → .bosbun/routes.ts
            build.onResolve({ filter: /^bosbun:routes$/ }, () => ({
                path: join(process.cwd(), ".bosbun", "routes.ts"),
            }));

            // bosbun:env → .bosbun/env.client.ts (browser) or .bosbun/env.server.ts (bun)
            build.onResolve({ filter: /^bosbun:env$/ }, () => ({
                path: join(
                    process.cwd(),
                    ".bosbun",
                    target === "browser" ? "env.client.ts" : "env.server.ts",
                ),
            }));

            // $lib/* → src/lib/* with extension probing
            build.onResolve({ filter: /^\$lib\// }, async (args) => {
                const rel = args.path.slice(5); // remove "$lib/"
                const base = join(process.cwd(), "src", "lib", rel);
                return { path: await resolveWithExts(base) };
            });

            // "tailwindcss" inside app.css is a Tailwind CLI directive —
            // it's already compiled to public/bosbun-tw.css by the CLI step.
            // Return an empty CSS module so Bun's CSS bundler doesn't choke on it.
            build.onResolve({ filter: /^tailwindcss$/ }, () => ({
                path: "tailwindcss",
                namespace: "bosbun-empty-css",
            }));
            build.onLoad({ filter: /.*/, namespace: "bosbun-empty-css" }, () => ({
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
