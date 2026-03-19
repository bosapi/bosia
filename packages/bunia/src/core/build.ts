import { SveltePlugin } from "bun-plugin-svelte";
import { writeFileSync, rmSync, mkdirSync } from "fs";
import { join, relative } from "path";
import { spawnSync } from "bun";

import { scanRoutes } from "./scanner.ts";
import { generateRoutesFile } from "./routeFile.ts";
import { generateRouteTypes, ensureRootDirs } from "./routeTypes.ts";
import { makeBuniaPlugin } from "./plugin.ts";
import { prerenderStaticRoutes } from "./prerender.ts";

// Resolved from this file's location inside the bunia package
const CORE_DIR = import.meta.dir;
const BUNIA_NODE_MODULES = join(CORE_DIR, "..", "..", "node_modules");

// ─── Entry Point ─────────────────────────────────────────

const isProduction = process.env.NODE_ENV === "production";

console.log("🏗️  Starting Bunia build...\n");

// 0. Clean all generated output first
try { rmSync("./dist",   { recursive: true, force: true }); } catch { }
try { rmSync("./.bunia", { recursive: true, force: true }); } catch { }

// 1. Scan routes
const manifest = scanRoutes();
console.log(`📂 Found ${manifest.pages.length} page route(s):`);
for (const r of manifest.pages) {
    console.log(`   ${r.pattern} → ${r.page}${r.pageServer ? " (server)" : ""}`);
}
if (manifest.apis.length > 0) {
    console.log(`📡 Found ${manifest.apis.length} API route(s):`);
    for (const r of manifest.apis) {
        console.log(`   ${r.pattern} → ${r.server}`);
    }
}

// 2. Generate .bunia/routes.ts (single file replaces all old code generators)
generateRoutesFile(manifest);

// 2b. Generate .bunia/types/src/routes/**/$types.d.ts for IDE type inference
generateRouteTypes(manifest);

// 2c. Ensure tsconfig.json has rootDirs pointing at .bunia/types
ensureRootDirs();

// 3. Build Tailwind CSS
console.log("\n🎨 Building Tailwind CSS...");
const tailwindBin = join(BUNIA_NODE_MODULES, ".bin", "tailwindcss");
const tailwindResult = spawnSync(
    [tailwindBin, "-i", "./src/app.css", "-o", "./public/bunia-tw.css", ...(isProduction ? ["--minify"] : [])],
    {
        cwd: process.cwd(),
        env: { ...process.env, NODE_PATH: BUNIA_NODE_MODULES },
    },
);
if (tailwindResult.exitCode !== 0) {
    console.error("❌ Tailwind CSS build failed:\n" + tailwindResult.stderr.toString());
    process.exit(1);
}
console.log("✅ Tailwind CSS built: public/bunia-tw.css");

// Shared Bun build plugin for both client and server
const buniaPlugin = makeBuniaPlugin();

// 5. Build client bundle
console.log("\n📦 Building client bundle...");
const clientResult = await Bun.build({
    entrypoints: [join(CORE_DIR, "client", "hydrate.ts")],
    outdir: "./dist/client",
    target: "browser",
    splitting: true,
    naming: { chunk: "[name]-[hash].[ext]" },
    minify: isProduction,
    define: {
        "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV ?? "development"),
    },
    plugins: [buniaPlugin, SveltePlugin()],
});

if (!clientResult.success) {
    console.error("❌ Client build failed:");
    for (const msg of clientResult.logs) console.error(msg);
    process.exit(1);
}

// 6. Collect output files for dist/manifest.json
const jsFiles: string[] = [];
const cssFiles: string[] = [];
for (const output of clientResult.outputs) {
    const rel = relative("./dist/client", output.path);
    if (output.path.endsWith(".js")) jsFiles.push(rel);
    if (output.path.endsWith(".css")) cssFiles.push(rel);
}

// 7. Build server bundle (before writing manifest so we can record the entry)
console.log("\n📦 Building server bundle...");
const serverResult = await Bun.build({
    entrypoints: [join(CORE_DIR, "server.ts")],
    outdir: "./dist/server",
    target: "bun",
    splitting: true,
    naming: { entry: "index.[ext]", chunk: "[name]-[hash].[ext]" },
    minify: isProduction,
    external: ["elysia", "@elysiajs/static"],
    plugins: [buniaPlugin, SveltePlugin()],
});

if (!serverResult.success) {
    console.error("❌ Server build failed:");
    for (const msg of serverResult.logs) console.error(msg);
    process.exit(1);
}

// Entry is always "index.js" due to naming: { entry: "index.[ext]" }
const serverEntry = serverResult.outputs
    .find(o => o.path.endsWith("index.js"))
    ?.path.split("/").pop() ?? "index.js";

// 8. Write dist/manifest.json
mkdirSync("./dist", { recursive: true });
const distManifest = {
    js: jsFiles,
    css: cssFiles,
    entry: jsFiles.find(f => f.startsWith("hydrate")) ?? jsFiles[0] ?? "hydrate.js",
    serverEntry,
};
writeFileSync("./dist/manifest.json", JSON.stringify(distManifest, null, 2));
console.log(`✅ Client bundle: ${jsFiles.join(", ")}`);
console.log(`✅ Server entry:  dist/server/${serverEntry}`);

// 9. Prerender static routes
await prerenderStaticRoutes(manifest);

console.log("\n🎉 Build complete!");
