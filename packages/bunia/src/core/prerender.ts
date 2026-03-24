import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import type { RouteManifest } from "./types.ts";

const CORE_DIR = import.meta.dir;
const BUNIA_NODE_MODULES = join(CORE_DIR, "..", "..", "node_modules");

const PRERENDER_TIMEOUT = Number(process.env.PRERENDER_TIMEOUT) || 5_000; // 5s default

// ─── Prerendering ─────────────────────────────────────────

async function detectPrerenderRoutes(manifest: RouteManifest): Promise<string[]> {
    const paths: string[] = [];
    for (const route of manifest.pages) {
        if (!route.pageServer) continue;
        if (route.pattern.includes("[")) {
            // TODO: Support dynamic routes by reading export const entries() and calling it to get param values
            // Then prerender each route variant: /blog/slug1, /blog/slug2, etc.
            continue;
        }
        const content = await Bun.file(join("src", "routes", route.pageServer)).text();
        if (/export\s+const\s+prerender\s*=\s*true/.test(content)) {
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
            env: { ...process.env, NODE_ENV: "production", PORT: String(port), NODE_PATH: BUNIA_NODE_MODULES },
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
            console.log(`   ✅ ${routePath} → ${outPath}`);
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
