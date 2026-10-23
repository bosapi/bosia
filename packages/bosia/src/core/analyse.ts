import { mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "fs";
import { join } from "path";
import { pathToFileURL } from "url";
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
// Running them in this process needs a timeout and a rejection hook; a
// subprocess returning JSON would isolate them (see ROADMAP).

const ROUTES_DIR = "./src/routes";
const TRAILING_SLASH = new Set(["never", "always", "ignore"]);
// A top-level `await db.connect()` to a host the build can't reach would
// otherwise hang the build with no message.
const IMPORT_TIMEOUT_MS = 30_000;
// A file that hasn't loaded yet (dev only): nothing exported.
const NO_EXPORTS: Exports = { prerender: false, ssr: true, actions: false };

export class RouteAnalyseError extends Error {}

type Exports = {
	prerender: boolean;
	ssr: boolean;
	actions: boolean;
	trailingSlash?: TrailingSlash;
};
type Cache = Record<string, Exports & { mtimeMs: number }>;

/** Modules the last analyse imported, by path under src/routes. Prerender calls
 *  `entries()` on these, so each route's top-level code runs once. */
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
 * `dev` (a `bosia dev` rebuild):
 * - only files whose mtime moved since the last dev run are bundled and imported;
 * - a file that fails to load is a warning, keeping its last known flags, so a
 *   local database being down doesn't stop every rebuild (`bosia build` fails);
 * - no skipped-prerender warnings: dev never prerenders.
 * Dev keeps its own dir and cache, so a `bosia build` next to it can't touch them.
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
	const cacheFile = ".bosia/analyse-dev.json";
	const cache: Cache = dev ? readCache(cacheFile) : {};
	// Stat before bundling: a save made while this run imports is then newer
	// than what gets cached, and the next rebuild reads it again.
	const mtimes = new Map(files.map((f) => [f, statSync(join(ROUTES_DIR, f)).mtimeMs]));
	const stale = files.filter((f) => cache[f]?.mtimeMs !== mtimes.get(f));
	const { exports: fresh, failed } = await importExports(
		stale,
		userPlugins,
		dev ? ".bosia/analyse-dev" : ".bosia/analyse",
	);
	if (failed.length) {
		const msg = failed.sort().join("\n");
		if (!dev) throw new RouteAnalyseError(msg);
		console.warn(
			`${msg}\n   ⚠️  Dev keeps these files' last known flags; \`bosia build\` will fail.`,
		);
	}

	const exports = new Map(files.map((f) => [f, fresh.get(f) ?? cache[f] ?? NO_EXPORTS]));
	if (dev) {
		// A failed file keeps its old entry (old mtime), so it is retried next run.
		const next: Cache = {};
		for (const f of files) {
			const e = fresh.get(f);
			if (e) next[f] = { ...e, mtimeMs: mtimes.get(f)! };
			else if (cache[f]) next[f] = cache[f];
		}
		mkdirSync(".bosia", { recursive: true });
		writeFileSync(cacheFile, JSON.stringify(next));
	}

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

function readCache(file: string): Cache {
	try {
		return JSON.parse(readFileSync(file, "utf-8"));
	} catch {
		return {};
	}
}

// Each run bundles into its own numbered dir. Bun caches a module by path (and
// ignores a `?v=` query on a file URL), so a second run in one process — tests,
// a long-lived caller — would otherwise get the first run's exports.
let runs = 0;

const reason = (err: unknown) => (err instanceof Error ? err.message : String(err));

/** Bundles and imports `files`. Bundling errors throw; per-file problems are returned. */
async function importExports(
	files: string[],
	userPlugins: BunPlugin[],
	dir: string,
): Promise<{ exports: Map<string, Exports>; failed: string[] }> {
	analysedModules.clear();
	const exports = new Map<string, Exports>();
	const failed: string[] = [];
	if (files.length === 0) return { exports, failed };

	rmSync(join(process.cwd(), dir), { recursive: true, force: true });
	const outDir = join(process.cwd(), dir, String(++runs));
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

	// Only while the modules load: an un-awaited `db.connect()` in top-level code
	// would otherwise crash the build with an error that doesn't say where from.
	const onRejection = (err: unknown) =>
		failed.push(
			`❌ Route analyse: a route module's top-level code left a rejected promise: ${reason(err)}`,
		);
	process.on("unhandledRejection", onRejection);
	try {
		await Promise.all(
			files.map(async (f) => {
				let timer: Timer | undefined;
				try {
					// A file URL: a Windows path isn't a valid specifier.
					const url = pathToFileURL(join(outDir, f.replace(/\.ts$/, ".js"))).href;
					const mod = await Promise.race([
						import(url),
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
					failed.push(`❌ Route analyse: src/routes/${f} failed to load: ${reason(err)}`);
				} finally {
					clearTimeout(timer);
				}
			}),
		);
	} finally {
		process.off("unhandledRejection", onRejection);
	}

	for (const [f, mod] of analysedModules) {
		const ts = mod.trailingSlash;
		if (ts !== undefined && !TRAILING_SLASH.has(ts)) {
			failed.push(
				`❌ Route analyse: src/routes/${f} exports trailingSlash = ${JSON.stringify(ts)}; use "never", "always" or "ignore"`,
			);
			continue;
		}
		exports.set(f, {
			prerender: mod.prerender === true,
			ssr: mod.ssr !== false,
			actions: !!mod.actions,
			trailingSlash: ts,
		});
	}
	return { exports, failed };
}
