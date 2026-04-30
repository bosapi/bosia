import { writeFileSync, mkdirSync, cpSync, existsSync } from "fs";
import { join } from "path";
import type { RouteManifest, TrailingSlash } from "./types.ts";

import { BOSIA_NODE_PATH } from "./paths.ts";

const CORE_DIR = import.meta.dir;

const PRERENDER_TIMEOUT = Number(process.env.PRERENDER_TIMEOUT) || 5_000; // 5s default

// ─── Prerendering ─────────────────────────────────────────

interface PrerenderTarget {
	path: string;
	trailingSlash: TrailingSlash;
}

// ─── Pure helpers (exported for tests) ────────────────────

/**
 * Substitute `[param]` and `[...rest]` placeholders in a route pattern with
 * concrete values from an `entries()` record.
 */
export function substituteParams(pattern: string, entry: Record<string, string>): string {
	let resolved = pattern;
	for (const [key, value] of Object.entries(entry)) {
		resolved = resolved.replace(`[...${key}]`, value);
		resolved = resolved.replace(`[${key}]`, value);
	}
	return resolved;
}

/**
 * Canonical URL to fetch during prerender, based on trailing-slash mode.
 * Avoids hitting the server's 308 redirect mid-prerender.
 */
export function canonicalRouteFor(routePath: string, ts: TrailingSlash): string {
	if (routePath === "/") return "/";
	if (ts === "always") return routePath.endsWith("/") ? routePath : routePath + "/";
	return routePath.replace(/\/$/, "");
}

/**
 * Output HTML filename for a prerendered route. Strategy follows trailing-slash
 * mode so static hosts serve the right file on direct URL hits.
 */
export function prerenderOutPath(routePath: string, ts: TrailingSlash): string {
	if (routePath === "/") return "./dist/prerendered/index.html";
	if (ts === "never") return `./dist/prerendered${routePath.replace(/\/$/, "")}.html`;
	return `./dist/prerendered${routePath.replace(/\/$/, "")}/index.html`;
}

/** Data-payload filename for a prerendered route — matches client `dataUrl()`. */
export function prerenderDataPath(routePath: string): string {
	return routePath === "/" ? "/index.json" : `${routePath.replace(/\/$/, "")}.json`;
}

async function detectPrerenderRoutes(manifest: RouteManifest): Promise<PrerenderTarget[]> {
	const targets: PrerenderTarget[] = [];
	for (const route of manifest.pages) {
		if (!route.pageServer) continue;
		const filePath = join("src", "routes", route.pageServer);
		const content = await Bun.file(filePath).text();
		if (!/export\s+const\s+prerender\s*=\s*true/.test(content)) continue;
		if (/export\s+const\s+ssr\s*=\s*false/.test(content)) {
			console.warn(
				`   ⚠️  ${route.pattern} has prerender=true && ssr=false — contradictory, skipped`,
			);
			continue;
		}

		const ts = route.trailingSlash;

		if (route.pattern.includes("[")) {
			// Dynamic route — import module and call entries() to get param values
			try {
				const mod = await import(join(process.cwd(), filePath));
				if (typeof mod.entries !== "function") {
					console.warn(
						`   ⚠️  ${route.pattern} has prerender=true but no entries() export — skipped`,
					);
					continue;
				}
				const entryList: Record<string, string>[] = await mod.entries();
				for (const entry of entryList) {
					targets.push({
						path: substituteParams(route.pattern, entry),
						trailingSlash: ts,
					});
				}
			} catch (err) {
				console.error(`   ❌ Failed to resolve entries() for ${route.pattern}:`, err);
			}
		} else {
			targets.push({ path: route.pattern, trailingSlash: ts });
		}
	}
	return targets;
}

export async function prerenderStaticRoutes(manifest: RouteManifest): Promise<void> {
	const targets = await detectPrerenderRoutes(manifest);
	if (targets.length === 0) return;

	console.log(`\n🖨️  Prerendering ${targets.length} route(s)...`);

	const port = 13572;
	const child = Bun.spawn(["bun", "run", "./dist/server/index.js"], {
		env: {
			...process.env,
			NODE_ENV: "production",
			PORT: String(port),
			NODE_PATH: BOSIA_NODE_PATH,
		},
		stdout: "ignore",
		stderr: "ignore",
	});

	// Poll /_health until ready (max 10s)
	const base = `http://localhost:${port}`;
	let ready = false;
	for (let i = 0; i < 50; i++) {
		await Bun.sleep(200);
		try {
			const res = await fetch(`${base}/_health`);
			if (res.ok) {
				ready = true;
				break;
			}
		} catch {
			/* not ready yet */
		}
	}

	if (!ready) {
		child.kill();
		console.error("❌ Prerender server failed to start");
		return;
	}

	mkdirSync("./dist/prerendered", { recursive: true });

	for (const { path: routePath, trailingSlash: ts } of targets) {
		try {
			// Hit the canonical URL so the server doesn't 308 us mid-prerender
			const canonicalRoute = canonicalRouteFor(routePath, ts);

			const res = await fetch(`${base}${canonicalRoute}`, {
				signal: AbortSignal.timeout(PRERENDER_TIMEOUT),
			});
			const html = await res.text();

			// Filename strategy:
			//   never  → about.html        (canonical /about, served by static host as /about → about.html)
			//   always → about/index.html  (canonical /about/, static host serves /about/ → about/index.html)
			//   ignore → about/index.html  (single emit; both URLs resolve via server canonicalize=off)
			//   root   → index.html
			const outPath = prerenderOutPath(routePath, ts);
			mkdirSync(outPath.substring(0, outPath.lastIndexOf("/")), { recursive: true });
			writeFileSync(outPath, html);

			// Also prerender the data payload (filename matches dataUrl() — strips trailing slash)
			const dataPath = prerenderDataPath(routePath);
			const dataRes = await fetch(`${base}/__bosia/data${dataPath}`, {
				signal: AbortSignal.timeout(PRERENDER_TIMEOUT),
			});
			if (dataRes.ok) {
				const dataJson = await dataRes.text();
				const dataOutPath = `./dist/prerendered/__bosia/data${dataPath}`;
				mkdirSync(dataOutPath.substring(0, dataOutPath.lastIndexOf("/")), {
					recursive: true,
				});
				writeFileSync(dataOutPath, dataJson);
				console.log(`   ✅ ${routePath} → ${outPath} (+ data)`);
			} else {
				console.log(`   ✅ ${routePath} → ${outPath}`);
			}
		} catch (err) {
			if (err instanceof DOMException && err.name === "TimeoutError") {
				console.error(
					`   ❌ Prerender timed out for ${routePath} after ${PRERENDER_TIMEOUT / 1000}s — increase PRERENDER_TIMEOUT to raise the limit`,
				);
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
