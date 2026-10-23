import { readFileSync, rmSync, statSync, writeFileSync } from "fs";
import { join } from "path";
import type { BunPlugin } from "bun";
import type { RouteManifest, TrailingSlash } from "./types.ts";
import { makeBosiaPlugin } from "./plugin.ts";
import { makeBosiaSvelteCompiler } from "./svelteCompiler.ts";

// ─── Route Analyse ───────────────────────────────────────
// Reads `prerender`, `ssr`, `actions` and `trailingSlash` from the real exports
// of every route server module, not from its source text: a regex can't see
// `export { p as prerender }`, a `let`, or a value built from another constant.
// The modules are bundled like the server bundle ($env, $lib, Svelte, user
// plugins, nothing external) and imported, so their top-level code runs at
// build time — the same as SvelteKit's analyse step. Any failure fails the build.

const ROUTES_DIR = "./src/routes";
const ANALYSE_DIR = ".bosia/analyse";
// Outside ANALYSE_DIR, which each run wipes.
const CACHE_FILE = ".bosia/analyse-cache.json";
const TRAILING_SLASH = new Set(["never", "always", "ignore"]);
// A top-level `await db.connect()` to a host the build can't reach would
// otherwise hang the build with no message.
const IMPORT_TIMEOUT_MS = 30_000;

export class RouteAnalyseError extends Error {}

type Exports = {
	prerender: boolean;
	ssr: boolean;
	actions: boolean;
	trailingSlash?: TrailingSlash;
};
type Cache = Record<string, Exports & { mtimeMs: number }>;

/** Modules the last full analyse imported, by path under src/routes. Prerender
 *  calls `entries()` on these, so each route's top-level code runs once. */
export const analysedModules = new Map<string, Record<string, any>>();

/** Why a page that asks for prerender can't have it, or null when it can. */
export function prerenderSkipReason(e: Exports): string | null {
	if (!e.ssr) return "ssr=false — contradictory";
	// A static file can't run an action: Bun would answer the POST with the
	// prerendered HTML, Workers' asset server with 405. Render it live instead.
	if (e.actions) return "actions — forms need a live page";
	return null;
}

/**
 * Fills `trailingSlash` and `prerender` on every route of `manifest` in place.
 * `dev`: reuse the last run's exports while no route server file's mtime moved
 * (a `+page.svelte` save rescans routes but can't change a flag), and stay quiet
 * about skipped prerenders — dev never prerenders.
 */
export async function analyseRoutes(
	manifest: RouteManifest,
	userPlugins: BunPlugin[] = [],
	dev = false,
): Promise<void> {
	const files = [
		...new Set([
			...manifest.pages.flatMap((r) => [
				...r.layoutServers.map((ls) => ls.path),
				...(r.pageServer ? [r.pageServer] : []),
			]),
			...manifest.apis.map((r) => r.server),
		]),
	];
	const exports = (dev && cachedExports(files)) || (await importExports(files, userPlugins));

	for (const route of manifest.pages) {
		// Nearest wins: the page, then the closest +layout.server.ts above it.
		const chain = [...route.layoutServers.map((ls) => ls.path), route.pageServer ?? ""];
		route.trailingSlash =
			chain
				.filter(Boolean)
				.map((f) => exports.get(f)!.trailingSlash)
				.findLast((ts) => ts !== undefined) ?? "never";
		const e = route.pageServer ? exports.get(route.pageServer)! : null;
		const skip = e?.prerender ? prerenderSkipReason(e) : null;
		if (skip && !dev)
			console.warn(`   ⚠️  ${route.pattern} has prerender=true && ${skip}, skipped`);
		route.prerender = !!e?.prerender && !skip;
	}
	for (const api of manifest.apis) api.prerender = exports.get(api.server)!.prerender;
}

/** The last run's exports, or null when any file is new or changed since. */
function cachedExports(files: string[]): Map<string, Exports> | null {
	try {
		const cache: Cache = JSON.parse(readFileSync(CACHE_FILE, "utf-8"));
		const ok = files.every((f) => cache[f]?.mtimeMs === statSync(join(ROUTES_DIR, f)).mtimeMs);
		return ok ? new Map(files.map((f) => [f, cache[f]!])) : null;
	} catch {
		return null;
	}
}

async function importExports(
	files: string[],
	userPlugins: BunPlugin[],
): Promise<Map<string, Exports>> {
	analysedModules.clear();
	const exports = new Map<string, Exports>();
	if (files.length === 0) return exports;

	const outDir = join(process.cwd(), ANALYSE_DIR);
	rmSync(outDir, { recursive: true, force: true });
	const result = await Bun.build({
		entrypoints: files.map((f) => join(ROUTES_DIR, f)),
		root: ROUTES_DIR,
		outdir: outDir,
		target: "bun",
		format: "esm",
		conditions: ["svelte"],
		splitting: true,
		naming: { entry: "[dir]/[name].[ext]", chunk: "chunk-[hash].[ext]" },
		plugins: [makeBosiaPlugin("bun"), ...userPlugins, makeBosiaSvelteCompiler("bun")],
	}).catch((err: unknown) => ({
		success: false as const,
		logs: err instanceof AggregateError ? err.errors : [err],
	}));
	if (!result.success)
		throw new RouteAnalyseError(
			// Bun.inspect keeps each message's file:line, as console.error(msg) does.
			`❌ Route analyse: bundling the route server modules failed:\n${result.logs.map((m) => Bun.inspect(m)).join("\n")}`,
		);

	const failed: string[] = [];
	await Promise.all(
		files.map(async (f) => {
			let timer: Timer | undefined;
			try {
				const mod = await Promise.race([
					// The query skips the module cache: a second run in one process
					// (tests, a long-lived caller) must see the files as they are now.
					import(`${join(outDir, f.replace(/\.ts$/, ".js"))}?v=${Date.now()}`),
					new Promise<never>((_, reject) => {
						timer = setTimeout(
							() =>
								reject(
									new Error(
										`still loading after ${IMPORT_TIMEOUT_MS / 1000}s (a top-level await that never settles?)`,
									),
								),
							IMPORT_TIMEOUT_MS,
						);
					}),
				]);
				analysedModules.set(f, mod);
			} catch (err) {
				const why = err instanceof Error ? err.message : String(err);
				failed.push(`❌ Route analyse: src/routes/${f} failed to load: ${why}`);
			} finally {
				clearTimeout(timer);
			}
		}),
	);
	for (const [f, mod] of analysedModules) {
		const ts = mod.trailingSlash;
		if (ts !== undefined && !TRAILING_SLASH.has(ts))
			failed.push(
				`❌ Route analyse: src/routes/${f} exports trailingSlash = ${JSON.stringify(ts)}; use "never", "always" or "ignore"`,
			);
		exports.set(f, {
			prerender: mod.prerender === true,
			ssr: mod.ssr !== false,
			actions: !!mod.actions,
			trailingSlash: ts,
		});
	}
	if (failed.length) throw new RouteAnalyseError(failed.sort().join("\n"));

	const cache: Cache = {};
	for (const [f, e] of exports) cache[f] = { ...e, mtimeMs: statSync(join(ROUTES_DIR, f)).mtimeMs };
	writeFileSync(CACHE_FILE, JSON.stringify(cache));
	return exports;
}
