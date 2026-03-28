import { writeFileSync, mkdirSync, cpSync, existsSync } from "fs";
import { join } from "path";
import type { RouteManifest } from "./types.ts";

import { BOSIA_NODE_PATH } from "./paths.ts";

const CORE_DIR = import.meta.dir;

const PRERENDER_TIMEOUT = Number(process.env.PRERENDER_TIMEOUT) || 5_000; // 5s default

// ─── Prerendering ─────────────────────────────────────────

async function detectPrerenderRoutes(manifest: RouteManifest): Promise<string[]> {
    const paths: string[] = [];
    for (const route of manifest.pages) {
        if (!route.pageServer) continue;
        const filePath = join("src", "routes", route.pageServer);
        const content = await Bun.file(filePath).text();
        if (!/export\s+const\s+prerender\s*=\s*true/.test(content)) continue;

        if (route.pattern.includes("[")) {
            // Dynamic route — import module and call entries() to get param values
            try {
                const mod = await import(join(process.cwd(), filePath));
                if (typeof mod.entries !== "function") {
                    console.warn(`   ⚠️  ${route.pattern} has prerender=true but no entries() export — skipped`);
                    continue;
                }
                const entryList: Record<string, string>[] = await mod.entries();
                for (const entry of entryList) {
                    let resolved = route.pattern;
                    for (const [key, value] of Object.entries(entry)) {
                        // [...slug] → value (rest param)
                        resolved = resolved.replace(`[...${key}]`, value);
                        // [param] → value
                        resolved = resolved.replace(`[${key}]`, value);
                    }
                    paths.push(resolved);
                }
            } catch (err) {
                console.error(`   ❌ Failed to resolve entries() for ${route.pattern}:`, err);
            }
        } else {
            paths.push(route.pattern);
        }
    }
    return paths;
}

export async function prerenderStaticRoutes(manifest: RouteManifest): Promise<void> {
    const paths = await detectPrerenderRoutes(manifest);
    if (paths.length === 0) return;

    console.log(`\n🖨️  Prerendering ${paths.length} route(s)...`);

    const port = 13572;
    const child = Bun.spawn(
        ["bun", "run", "./dist/server/index.js"],
        {
            env: { ...process.env, NODE_ENV: "production", PORT: String(port), NODE_PATH: BOSIA_NODE_PATH },
            stdout: "ignore",
            stderr: "ignore",
        },
    );

    // Poll /_health until ready (max 10s)
    const base = `http://localhost:${port}`;
    let ready = false;
    for (let i = 0; i < 50; i++) {
        await Bun.sleep(200);
        try {
            const res = await fetch(`${base}/_health`);
            if (res.ok) { ready = true; break; }
        } catch { /* not ready yet */ }
    }

    if (!ready) {
        child.kill();
        console.error("❌ Prerender server failed to start");
        return;
    }

    mkdirSync("./dist/prerendered", { recursive: true });

    for (const routePath of paths) {
        try {
            const res = await fetch(`${base}${routePath}`, { signal: AbortSignal.timeout(PRERENDER_TIMEOUT) });
            const html = await res.text();
            const outPath = routePath === "/"
                ? "./dist/prerendered/index.html"
                : `./dist/prerendered${routePath}/index.html`;
            mkdirSync(outPath.substring(0, outPath.lastIndexOf("/")), { recursive: true });
            writeFileSync(outPath, html);

            // Also prerender the data payload
            const dataPath = routePath === "/" ? "/index.json" : `${routePath.replace(/\/$/, "")}.json`;
            const dataRes = await fetch(`${base}/__bosia/data${dataPath}`, { signal: AbortSignal.timeout(PRERENDER_TIMEOUT) });
            if (dataRes.ok) {
                const dataJson = await dataRes.text();
                const dataOutPath = `./dist/prerendered/__bosia/data${dataPath}`;
                mkdirSync(dataOutPath.substring(0, dataOutPath.lastIndexOf("/")), { recursive: true });
                writeFileSync(dataOutPath, dataJson);
                console.log(`   ✅ ${routePath} → ${outPath} (+ data)`);
            } else {
                console.log(`   ✅ ${routePath} → ${outPath}`);
            }
        } catch (err) {
            if (err instanceof DOMException && err.name === "TimeoutError") {
                console.error(`   ❌ Prerender timed out for ${routePath} after ${PRERENDER_TIMEOUT / 1000}s — increase PRERENDER_TIMEOUT to raise the limit`);
            } else {
                console.error(`   ❌ Failed to prerender ${routePath}:`, err);
            }
        }
    }

    child.kill();
    console.log("✅ Prerendering complete");
}

// ─── Static Site Output ──────────────────────────────────

export function generateStaticSite(): void {
    if (!existsSync("./dist/prerendered")) {
        console.log("\n⏭️  No prerendered pages — skipping static site output");
        return;
    }

    console.log("\n📦 Generating static site...");
    mkdirSync("./dist/static", { recursive: true });

    // 1. HTML files from prerendering
    cpSync("./dist/prerendered", "./dist/static", { recursive: true });

    // 2. Client JS/CSS — preserves /dist/client/... absolute paths used in HTML
    cpSync("./dist/client", "./dist/static/dist/client", { recursive: true });

    // 3. Public assets (bosia-tw.css, favicon, etc.) — preserves /bosia-tw.css path
    if (existsSync("./public")) {
        cpSync("./public", "./dist/static", { recursive: true });
    }

    console.log("✅ Static site generated: dist/static/");
}
