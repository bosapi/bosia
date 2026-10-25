import { mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "fs";
import { join } from "path";
import { pathToFileURL } from "url";
import type { BunPlugin } from "bun";
import type { RouteManifest, TrailingSlash } from "./types.ts";
import { makeBosiaPlugin } from "./plugin.ts";
import { makeBosiaSvelteCompiler } from "./svelteCompiler.ts";
import { ROUTES_DIR } from "./scanner.ts";
import { ANALYSE_DEV_CACHE, ANALYSE_FRESH_DONE } from "./paths.ts";

// ─── Route Analyse ───────────────────────────────────────
// Reads `prerender`, `ssr`, `actions` and `trailingSlash` from the real exports
// of every route server module, not from its source text: a regex can't see
// `export { p as prerender }`, a `let`, or a value built from another constant.
// The modules are bundled like the server bundle ($env, $lib, Svelte, user
// plugins, nothing external) and imported, so their top-level code runs at
// build time — the same as SvelteKit's analyse step. Any failure fails the build.
// As in the server bundle, `import.meta.dir`/`url` point at the bundled copy,
// not src/routes: read files relative to `process.cwd()`.
// Running them in this process needs a timeout and a rejection hook; a
// subprocess returning JSON would isolate them (see ROADMAP).

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
// `failed`: the file timed out at this mtime; it isn't retried until saved.
type Cache = Record<string, Exports & { mtimeMs?: number; failed?: string }>;
type Failure = { file?: string; msg: string; timedOut?: boolean };

/** Modules the last analyse imported, by path under src/routes. Prerender calls
 *  `entries()` on these, so each route's top-level code runs once. */
export const analysedModules = new Map<string, Record<string, any>>();

/** Why a page that asks for prerender can't have it, or null when it can. */
export function prerenderSkipReason(e: Pick<Exports, "ssr" | "actions">): string | null {
	if (!e.ssr) return "ssr=false — contradictory";
	// A static file can't run an action: Bun would answer the POST with the
	// prerendered HTML, Workers' asset server with 405. Render it live instead.
	if (e.actions) return "actions — forms need a live page";
	return null;
}

/** True when a page exporting `e` is prerendered; warns (unless `quiet`) when it asks but can't be. */
export function pagePrerenders(
	e: Pick<Exports, "prerender" | "ssr" | "actions">,
	pattern: string,
	quiet = false,
): boolean {
	if (!e.prerender) return false;
	const skip = prerenderSkipReason(e);
	if (skip && !quiet) console.warn(`   ⚠️  ${pattern} has prerender=true && ${skip}, skipped`);
	return !skip;
}

/**
 * Fills `trailingSlash` and `prerender` on every route of `manifest` in place.
 * `dev` (a `bosia dev` rebuild):
 * - only files whose mtime moved since the last dev run are bundled and imported
 *   (all of them when `fresh`: dev start, `.env` change);
 * - a file that fails to load is a warning, keeping its last known flags, so a
 *   local database being down doesn't stop every rebuild (`bosia build` fails).
 *   A throw is retried next rebuild (its cause may be in src/lib); a timeout
 *   only once the file is saved, so a hung import doesn't add 30s to each one;
 * - no skipped-prerender warnings: dev never prerenders.
 * Dev keeps its own dir and cache, so a `bosia build` next to it can't touch them.
 */
export async function analyseRoutes(
	manifest: RouteManifest,
	userPlugins: BunPlugin[] = [],
	dev = false,
	fresh = false,
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
	// Read even when `fresh`: a file that fails then still has its last flags.
	const cache: Cache = dev ? readCache(ANALYSE_DEV_CACHE) : {};
	// Stat before bundling: a save made while this run imports is then newer
	// than what gets cached, and the next rebuild reads it again.
	// A file deleted since the scan has no mtime: stale, so bundling reports it.
	const mtimes = new Map(
		dev
			? files.map((f) => [f, statSync(join(ROUTES_DIR, f), { throwIfNoEntry: false })?.mtimeMs])
			: [],
	);
	const stale = dev && !fresh ? files.filter((f) => cache[f]?.mtimeMs !== mtimes.get(f)) : files;
	const { exports: loaded, failed } = await importExports(
		stale,
		userPlugins,
		dev ? ".bosia/analyse-dev" : ".bosia/analyse",
	);
	const staleSet = new Set(stale);
	for (const f of files)
		if (!staleSet.has(f) && cache[f]?.failed) failed.push({ file: f, msg: cache[f].failed });
	if (failed.length) {
		const msg = failed
			.map((x) => x.msg)
			.sort()
			.join("\n");
		if (!dev) throw new RouteAnalyseError(msg);
		console.warn(
			`${msg}\n   ⚠️  Dev keeps these files' last known flags (one that timed out is retried once saved, or on restart); \`bosia build\` will fail.`,
		);
	}

	const exports = new Map(files.map((f) => [f, loaded.get(f) ?? cache[f] ?? NO_EXPORTS]));
	if (dev) {
		const timedOut = new Map(failed.flatMap((x) => (x.timedOut ? [[x.file!, x.msg]] : [])));
		const next: Cache = {};
		for (const f of files) {
			const e = loaded.get(f);
			const why = timedOut.get(f);
			if (e) next[f] = { ...e, mtimeMs: mtimes.get(f) };
			else if (why) next[f] = { ...(cache[f] ?? NO_EXPORTS), mtimeMs: mtimes.get(f), failed: why };
			// A throw keeps the last flags but drops the mtime, so the next run retries
			// it (a fresh run may have read a file whose mtime still matches).
			else if (cache[f]) next[f] = staleSet.has(f) ? { ...cache[f], mtimeMs: undefined } : cache[f];
		}
		mkdirSync(".bosia", { recursive: true });
		writeFileSync(ANALYSE_DEV_CACHE, JSON.stringify(next));
		if (fresh) writeFileSync(ANALYSE_FRESH_DONE, "");
	}

	for (const route of manifest.pages) {
		// Nearest wins: the page, then the closest +layout.server.ts above it.
		const chain = [...route.layoutServers.map((ls) => ls.path), route.pageServer ?? ""];
		route.trailingSlash =
			chain
				.filter(Boolean)
				.map((f) => exports.get(f)!.trailingSlash)
				.findLast((ts) => ts !== undefined) ?? "never";
		route.prerender =
			!!route.pageServer && pagePrerenders(exports.get(route.pageServer)!, route.pattern, dev);
	}
	for (const api of manifest.apis) api.prerender = exports.get(api.server)!.prerender;

	// The bundled copy runs `entries()` (and the server bundle runs `load()`), so
	// `import.meta.dir` isn't src/routes: an `existsSync` on it quietly lists nothing.
	if (!dev)
		for (const f of files)
			if (
				/\bimport\.meta\.(dir|dirname|url|path|file|filename)\b/.test(
					readFileSync(join(ROUTES_DIR, f), "utf-8"),
				)
			)
				console.warn(
					`   ⚠️  src/routes/${f} uses import.meta.dir/url/path: at build and run time it points at the bundled copy, not src/routes; build paths from process.cwd()`,
				);
}

function readCache(file: string): Cache {
	try {
		return JSON.parse(readFileSync(file, "utf-8"));
	} catch {
		return {};
	}
}

// .bosia/routes.ts is written after analyse (it holds the flags), so a route
// module that imports `bosia:routes` (e.g. through `bosia/client`) gets empty
// routes here. First plugin: Bun takes the first onResolve that answers.
const routesStub: BunPlugin = {
	name: "bosia-analyse-routes",
	setup(build) {
		build.onResolve({ filter: /^bosia:routes$/ }, () => ({
			path: "routes",
			namespace: "bosia-analyse",
		}));
		build.onLoad({ filter: /.*/, namespace: "bosia-analyse" }, () => ({
			contents:
				"export const clientRoutes = [], serverRoutes = [], apiRoutes = [], errorPage = null, defaultTitle = '';",
			loader: "js",
		}));
	},
};

// Each run bundles into its own numbered dir. Bun caches a module by path (and
// ignores a `?v=` query on a file URL), so a second run in one process — tests,
// a long-lived caller — would otherwise get the first run's exports.
let runs = 0;

export const reason = (err: unknown) => (err instanceof Error ? err.message : String(err));

/** Bundles and imports `files`. Bundling errors throw; per-file problems are returned. */
async function importExports(
	files: string[],
	userPlugins: BunPlugin[],
	dir: string,
): Promise<{ exports: Map<string, Exports>; failed: Failure[] }> {
	analysedModules.clear();
	const exports = new Map<string, Exports>();
	const failed: Failure[] = [];
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
		plugins: [routesStub, makeBosiaPlugin("bun"), ...userPlugins, makeBosiaSvelteCompiler("bun")],
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
		failed.push({
			msg: `❌ Route analyse: a route module's top-level code left a rejected promise: ${reason(err)}`,
		});
	process.on("unhandledRejection", onRejection);
	try {
		await Promise.all(
			files.map(async (f) => {
				let timer: Timer | undefined;
				let timedOut = false;
				try {
					// A file URL: a Windows path isn't a valid specifier.
					const url = pathToFileURL(join(outDir, f.replace(/\.ts$/, ".js"))).href;
					const mod = await Promise.race([
						import(url),
						new Promise<never>((_, reject) => {
							timer = setTimeout(() => {
								timedOut = true;
								reject(
									new Error(
										`still loading after ${IMPORT_TIMEOUT_MS / 1000}s (a top-level await that never settles?)`,
									),
								);
							}, IMPORT_TIMEOUT_MS);
						}),
					]);
					analysedModules.set(f, mod);
				} catch (err) {
					failed.push({
						file: f,
						msg: `❌ Route analyse: src/routes/${f} failed to load: ${reason(err)}`,
						timedOut,
					});
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
			failed.push({
				file: f,
				msg: `❌ Route analyse: src/routes/${f} exports trailingSlash = ${JSON.stringify(ts)}; use "never", "always" or "ignore"`,
			});
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
