import { writeFileSync, mkdirSync, cpSync, existsSync, readFileSync } from "fs";
import { createServer } from "net";
import { join, resolve } from "path";
import { pathToFileURL } from "url";
import type { RouteManifest, TrailingSlash } from "./types.ts";
import type { RuntimeTarget } from "./types/plugin.ts";

import { BOSIA_NODE_PATH, OUT_DIR } from "./paths.ts";
import { currentBase } from "./appBase.ts";
import { findMatch, isDynamic, segmentName, segmentRank } from "./matcher.ts";
import { sortRoutes } from "./routeFile.ts";
import { analysedExports, analysedModules, flagPage, reason } from "./analyse.ts";
import { ROUTES_DIR } from "./scanner.ts";
import { HEALTH_PATH, isFrameworkPath, isStaticPath } from "./staticPath.ts";

/** Acquire an OS-assigned ephemeral port. Tiny TOCTOU race window; acceptable for build-time use. */
export function getEphemeralPort(): Promise<number> {
	return new Promise((resolve, reject) => {
		const srv = createServer();
		srv.unref();
		srv.on("error", reject);
		srv.listen(0, "127.0.0.1", () => {
			const addr = srv.address();
			if (!addr || typeof addr === "string") {
				srv.close();
				reject(new Error("Failed to acquire ephemeral port"));
				return;
			}
			const port = addr.port;
			srv.close(() => resolve(port));
		});
	});
}

const CORE_DIR = import.meta.dir;

/**
 * True when the app's wrangler config serves `404.html` for unknown paths
 * (`not_found_handling: "404-page"`) and `public/404.html` doesn't provide one,
 * so a failed 404 probe must fail the build. Reads the text, skipping whole-line
 * `//` and `#` comments; a block comment around the key still counts.
 */
export function needsStatic404(cwd = process.cwd()): boolean {
	if (existsSync(join(cwd, "public", "404.html"))) return false;
	for (const name of ["wrangler.jsonc", "wrangler.json", "wrangler.toml"]) {
		const file = join(cwd, name);
		if (!existsSync(file)) continue;
		const text = readFileSync(file, "utf-8")
			.split("\n")
			.filter((line) => !/^\s*(\/\/|#)/.test(line))
			.join("\n");
		return /not_found_handling"?\s*[:=]\s*"404-page"/.test(text);
	}
	return false;
}

// Up to 2^31-1 (about 24 days), the longest delay a timer takes as written.
const SETTING_MAX = 2_147_483_647;

/** A whole number from 1 to SETTING_MAX, `fallback` when unset, null when anything else. */
export function prerenderSetting(raw: string | undefined, fallback: number): number | null {
	if (raw === undefined || raw.trim() === "") return fallback;
	// Number(), as in 1.2.4: `1e3` and `5000.0` keep working.
	const n = Number(raw);
	return Number.isInteger(n) && n >= 1 && n <= SETTING_MAX ? n : null;
}

const PRERENDER_TIMEOUT = prerenderSetting(process.env.PRERENDER_TIMEOUT, 5_000); // 5s default
const PRERENDER_CONCURRENCY = prerenderSetting(process.env.PRERENDER_CONCURRENCY, 6);

// ─── Prerendering ─────────────────────────────────────────

export interface PrerenderTarget {
	path: string;
	/** Route pattern the path came from (`/[slug]`); equals `path` for a static route. */
	route: string;
	kind: "page" | "api";
	/** Page targets only; APIs always write a single `.json` file regardless of slash mode. */
	trailingSlash: TrailingSlash;
}

// ─── Pure helpers (exported for tests) ────────────────────

/**
 * Substitute `[param]` and `[...rest]` placeholders in a route pattern with
 * concrete values from an `entries()` record.
 */
export function substituteParams(pattern: string, entry: Record<string, string>): string {
	// Per segment, so an inserted value is never re-read as a placeholder.
	return pattern
		.split("/")
		.map((seg, i, segs) => {
			const rank = segmentRank(seg);
			if (!rank) return seg;
			const name = segmentName(seg);
			if (entry[name] == null || !Object.hasOwn(entry, name))
				throw new Error(`entries() gave no value for ${seg}`);
			// A catch-all may end in one "/" ("guide/intro/"); the out path drops it.
			const value = rank === 2 ? String(entry[name]).replace(/\/$/, "") : String(entry[name]);
			const bad = (why: string): never => {
				throw new Error(
					`entries() value ${JSON.stringify(String(entry[name]))} for ${seg} is unsafe — ${why}`,
				);
			};
			// Strict on purpose (decided 2026-10-14): ASCII unreserved URL characters only, so the
			// fetched URL, the file written and a static host's lookup all agree, with nothing to
			// percent-encode or decode. `50%-off`, `café`, `what%3F` fail by design: slugify them.
			// No part may end in `.`: the URL parser folds `.`/`..`, and Windows drops trailing
			// dots (`v1.` → `v1`), so the page would land on another route's file. No part may
			// start with `.` either: static hosts hide dotfiles (`.env`).
			const parts = rank === 2 ? value.split("/") : [value];
			if (!parts.every((part) => /^(?!\.)[A-Za-z0-9._~-]*[A-Za-z0-9_~-]$/.test(part)))
				bad(
					`use only ASCII letters, digits, - _ . ~${rank === 2 ? " and /" : ""}, with no empty parts or leading/trailing \`.\``,
				);
			// Windows device names: writing `nul.html` hits the device, not a file.
			if (parts.some((part) => /^(con|prn|aux|nul|com\d|lpt\d)(\.|$)/i.test(part)))
				bad("Windows device names (con, nul, com1, …) are not allowed");
			// Only the URL's last part names a file: `index` is written as `<parent>/index.html`,
			// which serves the parent URL; `post.html` as `post.html.html`, never served for it.
			if (i === segs.length - 1 && /^index$|\.(html|json)$/i.test(parts.at(-1)!))
				bad("the last part can't be `index` or end with .html or .json");
			return value;
		})
		.join("/");
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
	if (routePath === "/") return `${OUT_DIR}/prerendered/index.html`;
	if (ts === "never") return `${OUT_DIR}/prerendered${routePath.replace(/\/$/, "")}.html`;
	return `${OUT_DIR}/prerendered${routePath.replace(/\/$/, "")}/index.html`;
}

/** Data-payload filename for a prerendered route — matches client `dataUrl()`. */
export function prerenderDataPath(routePath: string): string {
	return routePath === "/" ? "/index.json" : `${routePath.replace(/\/$/, "")}.json`;
}

/** Where a page's data payload is written. */
export function prerenderDataOutPath(routePath: string): string {
	return `${OUT_DIR}/prerendered/__bosia/data${prerenderDataPath(routePath)}`;
}

/**
 * Output filename for a prerendered API route. Always emits a single `.json`
 * file at the route's path (no trailing-slash variants — static hosts serve
 * `/api/foo.json` regardless of the request URL's slash).
 */
export function prerenderApiOutPath(routePath: string): string {
	return `${OUT_DIR}/prerendered${routePath.replace(/\/$/, "")}.json`;
}

/**
 * Why the server's reply to a prerender fetch can't be saved, or null when it can. A page must
 * answer 2xx HTML; an API any 2xx but 204/205 (no body, saved as an empty file). Anything else (a
 * loader's error(), a redirect to /login, the static 404) would be saved and served as the route.
 * The 404 probe expects exactly 404.
 */
export function prerenderReplyProblem(
	kind: "page" | "api",
	res: Response,
	expect: "ok" | 404 = "ok",
): string | null {
	if (res.status >= 300 && res.status < 400)
		return `answered ${res.status} → ${res.headers.get("location") ?? "(no Location)"}`;
	const ok = expect === "ok" ? res.status >= 200 && res.status < 300 : res.status === expect;
	if (!ok) return `answered ${res.status}`;
	if (res.status === 204 || res.status === 205) return `answered ${res.status}, no content`;
	const type = res.headers.get("content-type") ?? "";
	if (kind === "page" && !type.includes("text/html"))
		return `answered ${type || "no content-type"}, not an HTML page`;
	return null;
}

/**
 * Why a 200 data payload can't be saved, or null when it can. The server answers a data
 * request's redirect (a loader's, or a hook's 3xx) with a 200 JSON `{ redirect, status }`,
 * so the client router can follow it (server.ts data endpoint and handleRequest). A loader
 * payload is `{ pageData, layoutData, … }` and never has `redirect` or `error` at the top.
 */
export function prerenderDataProblem(body: string): string | null {
	let data: unknown;
	try {
		data = JSON.parse(body);
	} catch {
		return "answered a body that isn't JSON";
	}
	if (!data || typeof data !== "object") return "answered a body that isn't a data payload";
	const { redirect, status, error } = data as Record<string, any>;
	if (redirect != null) return `answered redirect ${status ?? "?"} → ${redirect}`;
	// The server sends a data error with its own status, which prerenderReplyProblem rejects
	// first; this catches a hook that answers a data request with its own 200 `{ error }`.
	if (error != null) {
		const why = typeof error === "string" ? error : (error.status ?? error.message);
		return `answered error ${why ?? "?"}`;
	}
	return null;
}

/**
 * An error's message plus its `code` (EACCES) and `cause` (Bun's fetch puts ECONNRESET there).
 * Reads any object, not just an Error: a cause is often a plain `{ code, message }`. Causes are
 * followed 3 deep, so a cycle can't loop.
 */
export function describeError(err: unknown, depth = 0): string {
	if (err == null || typeof err !== "object") return String(err);
	const { message, code, errno, cause } = err as Record<string, unknown>;
	// `code` may be a string (ECONNRESET) or a number; a bare `errno` (-54) stands in for it.
	// A DOMException's number code is a legacy constant (AbortError is 20), not a reason.
	const id =
		typeof code === "string" || (typeof code === "number" && !(err instanceof DOMException))
			? String(code)
			: typeof errno === "number"
				? String(errno)
				: "";
	let out = typeof message === "string" && message ? message : "";
	if (id && !out.includes(id)) out += out ? ` [${id}]` : id;
	// An Error's own fields aren't enumerable, so JSON would print `{}`: use its name.
	if (!out && err instanceof Error) out = err.name;
	if (!out) {
		try {
			out = JSON.stringify(err) ?? String(err);
		} catch {
			out = String(err);
		}
	}
	if (cause != null && cause !== "" && depth < 3)
		out += ` (cause: ${describeError(cause, depth + 1)})`;
	return out;
}

/** A prerender fetch that can't be saved; its message says why (a reply, a timeout, a reset). */
class ReplyProblem extends Error {}

const isTimeout = (err: unknown) => err instanceof DOMException && err.name === "TimeoutError";

/** Why a prerender fetch threw: a timeout names the env var that raises it. */
function fetchFailure(err: unknown, timeout: number): string {
	if (isTimeout(err))
		return `timed out after ${timeout / 1000}s — increase PRERENDER_TIMEOUT to raise the limit`;
	return `failed: ${describeError(err)}`;
}

/**
 * Cancels a reply's unread body so its socket is freed. cancel() rejects once the stream has
 * errored (a timeout fired), and that must not replace the real problem.
 */
async function dropBody(res: Response): Promise<void> {
	await res.body?.cancel().catch(() => {});
}

/** A dynamic prerender route whose entries() can't be used. build.ts prints `message` and exits. */
export class PrerenderEntriesError extends Error {
	override name = "PrerenderEntriesError";
}

/**
 * Throws when a dynamic route's path would save the wrong thing. Pure, so the invariant
 * tests (test/prerender-invariants.test.ts) can sweep every value × slash mode × kind.
 */
export function checkPrerenderPaths(
	paths: string[],
	kind: "page" | "api",
	ts: TrailingSlash,
): void {
	for (const p of paths) {
		// `dist/` and `__bosia/` are the framework's folders in static/: `dist/client` is copied
		// after the pages, so on macOS/Windows a page folder `DIST/` would swallow the bundle
		// (served as `DIST/client/…`, a 404 on case-sensitive hosts). A page `/dist` also fails:
		// `/dist/` is answered as a static file, not 308'd to it.
		// Lowercased for case-insensitive disks; a page's `/` form is tested too, so `/dist` fails.
		const lower = p.toLowerCase();
		if (isFrameworkPath(kind === "page" ? `${lower}/` : lower))
			throw new Error(`entries() gives ${p}; dist and __bosia are the framework's folders`);
		// The server answers `/_health` before any route. Its JSON looks like a valid API reply,
		// so prerenderReplyProblem can't catch it for an API.
		if (p === HEALTH_PATH) throw new Error(`entries() gives ${p}, a URL the server answers itself`);
		// A static-file ending (`.png`) is answered as a file, in every slash mode. prerenderReplyProblem
		// would catch the fetched URL too (a 404, or public/'s image), but later and less clearly,
		// and an `always` page fetches `/logo.png/`: its slash-less form 404s before the 308, and
		// nothing fetches that one. The `/` form adds only the prefixes rejected above.
		if (kind === "page" && isStaticPath(p))
			throw new Error(`entries() gives ${p}, a URL the server answers itself`);
		// generateStaticSite copies prerendered/ over static/, where the 404 probe saves
		// 404.html. A static src/routes/404 page may replace it on purpose; a slug may not.
		if (kind === "page" && ts === "never" && lower === "/404")
			throw new Error("an entries() value would overwrite 404.html, the not-found page");
	}
}

/** A scanned route before postScan: its flag and its server file. */
export type ScannedRoute = { prerender?: boolean; file: string | null };

/**
 * Final flags for the routes postScan touched, before .bosia/routes.ts is
 * written (so the client knows a page is static). `before` holds every scanned
 * route as it was before postScan; keyed by route, not file, as a clone reuses
 * its file. A route a plugin left alone keeps analyse's flags. Otherwise:
 * - the plugin changed the flag: its value, a `true` still checked for ssr/actions;
 * - the plugin swapped the file: the new file's flag;
 * - the plugin added the route: its `true`, else its file's. An added route's
 *   `false` doesn't win: older plugins set it as a placeholder, and main ignored it.
 * A file's flags come from analyse, or from its source text if analyse never saw it.
 */
export function flagPostScanRoutes(
	manifest: RouteManifest,
	before: Map<object, ScannedRoute>,
	quiet = false,
) {
	const memo = new Map<string, ReturnType<typeof sourceExports>>();
	const exportsOf = (file: string) => {
		let e = memo.get(file);
		if (!e) memo.set(file, (e = analysedExports.get(file) ?? sourceExports(file)));
		return e;
	};
	// The plugin's own value, or undefined to use the file's.
	const wantsOf = (route: { prerender?: boolean }) => {
		const was = before.get(route);
		if (!was) return route.prerender || undefined;
		return was.prerender !== route.prerender ? route.prerender : undefined;
	};
	const untouched = (route: { prerender?: boolean }, file: string | null) => {
		const was = before.get(route);
		return !!was && was.prerender === route.prerender && was.file === file;
	};
	for (const route of manifest.pages) {
		if (untouched(route, route.pageServer)) continue;
		// A trailingSlash the plugin set wins over the files'.
		const ts = route.trailingSlash;
		flagPage(route, exportsOf, quiet, wantsOf(route));
		if (ts) route.trailingSlash = ts;
	}
	for (const api of manifest.apis) {
		if (untouched(api, api.server)) continue;
		api.prerender = !!(wantsOf(api) ?? exportsOf(api.server).prerender);
	}
}

/** A file's flags from its source text, as before analyse existed. Not an import:
 *  unbundled, `$env` and `$lib` don't resolve, and a hung top-level `await` would
 *  have no timeout. A file that can't be read (a plugin's virtual id) has none. */
function sourceExports(file: string) {
	let src: string;
	try {
		src = readFileSync(resolve(ROUTES_DIR, file), "utf-8");
	} catch {
		return { prerender: false, ssr: true, actions: false };
	}
	return {
		prerender: /export\s+const\s+prerender\s*(?::\s*[^=]+)?=\s*true\b/.test(stripComments(src)),
		// Raw source, comments included: a false hit only renders the page live,
		// while a missed `actions` would ship a static page whose forms can't post.
		ssr: !/export\s+const\s+ssr\s*(?::\s*[^=]+)?=\s*false\b/.test(src),
		actions:
			/export\s+(const|let|var|async\s+function|function)\s+actions\b|export\s*\{[^}]*\bactions\b/.test(
				src,
			),
	};
}

/** Source with `//` and block comments blanked; string literals are kept. Doesn't
 *  know regex literals. Not `Bun.Transpiler` on purpose: that runs Bun macros. */
function stripComments(src: string): string {
	return src.replace(
		/("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|\/\/[^\n]*|\/\*[\s\S]*?\*\//g,
		(_m, str: string | undefined) => str ?? " ",
	);
}

/** Dynamic route → import module, call entries(), expand to concrete targets. */
async function expandDynamicRoute(
	pattern: string,
	file: string,
	kind: "page" | "api",
	ts: TrailingSlash,
): Promise<PrerenderTarget[]> {
	try {
		// The module the analyse step loaded: bundled with $env etc., and its
		// top-level code not run a second time. A route a plugin added in
		// postScan wasn't analysed: import its source, as before analyse existed.
		const mod =
			analysedModules.get(file) ?? (await import(pathToFileURL(resolve(ROUTES_DIR, file)).href));
		if (typeof mod.entries !== "function")
			throw new Error("prerender = true on a dynamic route needs an entries() export");
		const entryList: Record<string, string>[] = await mod.entries();
		// A repeated value (a tag on two posts) is written once. Only within this route:
		// the same URL from two routes is a clash, reported by findPrerenderClash.
		const paths = [...new Set(entryList.map((entry) => substituteParams(pattern, entry)))];
		checkPrerenderPaths(paths, kind, ts);
		return paths.map((path) => ({ path, route: pattern, kind, trailingSlash: ts }));
	} catch (err) {
		// Fail the build: skipping the route would silently drop every page it lists.
		throw new PrerenderEntriesError(`Prerender failed for ${pattern}: ${reason(err)}`, {
			cause: err,
		});
	}
}

export async function detectPrerenderRoutes(manifest: RouteManifest): Promise<PrerenderTarget[]> {
	const pageTasks = manifest.pages.map(async (route): Promise<PrerenderTarget[]> => {
		// Set by analyseRoutes() or flagPostScanRoutes(), skip reasons already applied.
		if (!route.prerender || !route.pageServer) return [];
		const ts = route.trailingSlash;
		if (isDynamic(route.pattern))
			return expandDynamicRoute(route.pattern, route.pageServer, "page", ts);
		return [{ path: route.pattern, route: route.pattern, kind: "page", trailingSlash: ts }];
	});

	const apiTasks = manifest.apis.map(async (route): Promise<PrerenderTarget[]> => {
		if (!route.prerender) return [];
		if (isDynamic(route.pattern))
			return expandDynamicRoute(route.pattern, route.server, "api", "never");
		return [{ path: route.pattern, route: route.pattern, kind: "api", trailingSlash: "never" }];
	});

	// Unbounded Promise.allSettled over all routes; each task holds only route
	// metadata (plus an entries() import), so RAM stays trivial. Chunk it if route
	// counts ever hit tens of thousands (open file descriptors would be the first limit).
	const results = await Promise.allSettled([...pageTasks, ...apiTasks]);
	// List every broken entries() route in one error, not just the first.
	const failed = results.flatMap((r) => (r.status === "rejected" ? [r.reason] : []));
	const other = failed.find((e) => !(e instanceof PrerenderEntriesError));
	if (other) throw other;
	// One `❌` per route; a multi-line message (a ZodError) stays under its own mark.
	if (failed.length)
		throw new PrerenderEntriesError(failed.map((e) => `❌ ${e.message}`).join("\n"), {
			cause: failed,
		});
	const targets = results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
	const misowned = findMisownedTargets(manifest, targets);
	// Mis-owned targets stay out of the clash check, so one problem prints one ❌.
	const clash = findPrerenderClash(targets.filter((t) => !misowned.has(t)));
	const problems = [...misowned.values(), ...clash];
	if (problems.length) throw new PrerenderEntriesError(problems.join("\n"));
	return targets;
}

/** How the build's ❌ lines name a target: its URL, plus the route a slug came from. */
function targetLabel(t: PrerenderTarget): string {
	return t.route === t.path ? t.path : `${t.path} (from ${t.route})`;
}

/**
 * Targets whose URL another route serves: `/blog/[slug]` giving `new` while
 * `src/routes/blog/new` exists, or a page slug at a `+server.ts` URL (an API
 * wins, as in server.ts matchRoutes). Saving it would freeze the other route.
 * Checked ignoring case too: on a macOS/Windows host `blog/New.html` answers `/blog/new`.
 */
export function findMisownedTargets(
	manifest: Pick<RouteManifest, "pages" | "apis">,
	targets: PrerenderTarget[],
): Map<PrerenderTarget, string> {
	// Copies: findMatch caches a compiled regex on each route object it sees.
	const pages = sortRoutes(manifest.pages.map((r) => ({ pattern: r.pattern })));
	const apis = sortRoutes(manifest.apis.map((r) => ({ pattern: r.pattern })));
	// The server's own matcher decides who serves the URL exactly.
	const ownerOf = (t: PrerenderTarget) => {
		const api = findMatch(apis, t.path)?.route.pattern;
		if (t.kind === "api") return api;
		// A page loses to any API at its URL, even a +server.ts in its own folder.
		return api ? `${api} (+server.ts)` : findMatch(pages, t.path)?.route.pattern;
	};
	// Split once, in match order, for the case pass: every API first, then pages. An API
	// target meets pages too: a live `/API/ALL` page is hidden by a saved `api/all` file.
	const shape = (pattern: string, api: boolean): RouteShape => {
		const parts = pattern.split("/").filter(Boolean);
		const ranks = parts.map(segmentRank);
		const lower = parts.map((p) => p.toLowerCase());
		return { pattern, api, parts, lower, ranks, rest: ranks.at(-1) === 2 };
	};
	const order = [
		...apis.map((r) => shape(r.pattern, true)),
		...pages.map((r) => shape(r.pattern, false)),
	];
	const out = new Map<PrerenderTarget, string>();
	for (const t of targets) {
		const owner = ownerOf(t);
		if (owner && owner !== t.route) {
			out.set(t, `❌ Prerender: ${targetLabel(t)} is served by ${owner}, not this route`);
			continue;
		}
		// No route answers the URL (a hand-built table): nothing to measure a case clash by.
		if (!owner) continue;
		const problem = caseProblem(t, order);
		if (problem) out.set(t, problem);
	}
	return out;
}

interface RouteShape {
	pattern: string;
	api: boolean;
	parts: string[];
	lower: string[];
	ranks: (0 | 1 | 2)[];
	/** Ends in `[...rest]`, so it takes paths longer than its parts. */
	rest: boolean;
}

/**
 * This route serves the URL exactly (findMatch said so). A route matching only ignoring
 * case (a static part spelled `NEW` for `new`) then clashes if it wins some spelling: it
 * ranks above this route, or the spelling differs at one of this route's static parts so
 * this route can't answer it. On a host that ignores case the saved file answers that
 * spelling. Overlaps through params alone (`/[...rest]` catching `/BLOG/new`) are allowed,
 * or every catch-all next to a prerendered page would fail. A route ranked higher still
 * that takes the very same spellings isn't looked for; the check may then name a route
 * that never answers.
 */
function caseProblem(t: PrerenderTarget, order: RouteShape[]): string | null {
	const path = t.path.split("/").filter(Boolean);
	const pathLower = path.map((p) => p.toLowerCase());
	let own: PartMatch[] | null = null;
	let hit: { r: RouteShape; kinds: PartMatch[]; above: boolean } | null = null;
	for (const r of order) {
		// Cheap filter first: most routes can't match on part count alone.
		if (r.rest ? path.length < r.parts.length : path.length !== r.parts.length) continue;
		const kinds = matchPartsFolded(r.parts, r.lower, r.ranks, path, pathLower);
		if (!kinds) continue;
		if (r.pattern === t.route && r.api === (t.kind === "api")) {
			own = kinds;
			if (hit) break; // a route above already wins a spelling
		} else if (!kinds.includes("case")) continue;
		else if (!own) hit ??= { r, kinds, above: true };
		else if (escapesOwn(kinds, own, path)) {
			hit = { r, kinds, above: false };
			break;
		}
	}
	// findMatch said this route serves the URL, so the walk must find it too; if not, the two
	// matchers have drifted apart and every case clash would pass unseen.
	if (!own)
		throw new Error(
			`Bosia internal: the prerender case check can't match ${t.path} to ${t.route}; please report it`,
		);
	if (!hit) return null;
	const { r, kinds, above } = hit;
	// The spelling it wins: its own static parts. Ranked below, every param under this
	// route's static part changes case too, which also steers clear of routes in between
	// (`/BLOG/NEW`, not `/blog/NEW` that `/blog/[slug]` takes).
	const spelling = kinds.map((k, j) => {
		if (k !== "param") return r.parts[j]!;
		return (!above && own[j] === "same" && otherCase(path[j]!)) || path[j]!;
	});
	const name = r.api && t.kind === "page" ? `${r.pattern} (+server.ts)` : r.pattern;
	return `❌ Prerender: ${targetLabel(t)} would also answer /${spelling.join("/")} on hosts that ignore case (macOS/Windows), which ${name} serves`;
}

/** How one part of a URL meets a route part: `same` static, `case` static spelled in
 *  another case, `param`. A match with no `case` is an exact match. */
type PartMatch = "same" | "case" | "param";

/**
 * Match a route's parts against a URL's parts ignoring case, by compilePattern's rules: only
 * a last `[...rest]` takes several parts, any other bracket part is one param. `null` when
 * they don't match. `lower`/`pathLower` are the same parts in `toLowerCase`, made once by the
 * caller. ASCII case only in effect: Unicode forms and special folds (`ς`/`σ`) aren't merged.
 * Keep in step with matcher.ts compilePattern.
 */
function matchPartsFolded(
	parts: string[],
	lower: string[],
	ranks: (0 | 1 | 2)[],
	path: string[],
	pathLower: string[],
): PartMatch[] | null {
	const kinds: PartMatch[] = [];
	for (const [i, seg] of parts.entries()) {
		if (ranks[i] === 2 && i === parts.length - 1) {
			if (path.length <= i) return null;
			for (let j = i; j < path.length; j++) kinds.push("param");
			return kinds;
		}
		const part = path[i];
		if (part === undefined) return null;
		if (ranks[i]) kinds.push("param");
		else if (part === seg) kinds.push("same");
		else if (pathLower[i] === lower[i]) kinds.push("case");
		else return null;
	}
	return kinds.length === path.length ? kinds : null;
}

/** Some part where this route is static has a spelling the other route takes and this one doesn't. */
function escapesOwn(kinds: PartMatch[], own: PartMatch[], path: string[]): boolean {
	return kinds.some(
		(k, j) => own[j] === "same" && (k === "case" || (k === "param" && otherCase(path[j]!))),
	);
}

/**
 * `s` with every letter in the other case, keeping only swaps that lowercase back to the same
 * letter (`ß` → `SS` and `İ` → `i̇` change length, so they stay). `null` if nothing swaps.
 */
function otherCase(s: string): string | null {
	const swapped = [...s]
		.map((c) => {
			const o = c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase();
			return o.length === c.length && o.toLowerCase() === c.toLowerCase() ? o : c;
		})
		.join("");
	return swapped === s ? null : swapped;
}

/**
 * Files two targets would both write. macOS/Windows ignore case, so `About` and `about`
 * (or folders `A/` and `a/`) merge; a file and a folder can't share a path either.
 * Every folder level counts, and so do data payloads.
 */
export function findPrerenderClash(targets: PrerenderTarget[]): string[] {
	const owners = new Map<string, { path: string; who: string; file: boolean }>();
	const clashes: string[] = [];
	for (const t of targets) {
		// Name the route a slug came from, so the message says which file to fix.
		const who = targetLabel(t);
		let clash = "";
		const files =
			t.kind === "api"
				? [prerenderApiOutPath(t.path)]
				: [prerenderOutPath(t.path, t.trailingSlash), prerenderDataOutPath(t.path)];
		// One ❌ per URL, but every file is still recorded so a later target can't slip past it.
		for (const out of files) {
			const segs = out.split("/");
			for (let i = 1; i <= segs.length; i++) {
				const path = segs.slice(0, i).join("/");
				const file = i === segs.length;
				const key = path.toLowerCase();
				const prev = owners.get(key);
				if (!prev) owners.set(key, { path, who, file });
				// Only two folders with the exact same name may share a path.
				else if (!clash && (prev.path !== path || file || prev.file)) {
					const what = file && prev.file ? "file" : "path";
					clash = `❌ Prerender: ${prev.who} and ${who} write the same ${what} (${path})`;
				}
			}
		}
		if (clash) clashes.push(clash);
	}
	return clashes;
}

export async function prerenderStaticRoutes(
	manifest: RouteManifest,
	target: RuntimeTarget = "bun",
): Promise<void> {
	// A bad value would leave every page waiting for a request slot, or make every fetch throw.
	const bad = (
		[
			["PRERENDER_TIMEOUT", PRERENDER_TIMEOUT],
			["PRERENDER_CONCURRENCY", PRERENDER_CONCURRENCY],
		] as const
	).filter(([, value]) => value === null);
	if (bad.length)
		throw new PrerenderEntriesError(
			bad
				.map(
					([name]) =>
						`❌ ${name} must be a whole number from 1 to ${SETTING_MAX} (got "${process.env[name]}")`,
				)
				.join("\n"),
		);
	const timeout = PRERENDER_TIMEOUT!;
	const concurrency = PRERENDER_CONCURRENCY!;
	const targets = await detectPrerenderRoutes(manifest);
	// On Workers the worker answers unknown paths, so 404.html is never required.
	const require404 = target !== "workers" && needsStatic404();
	// No routes to prerender: start the server only for the required 404.html.
	if (targets.length === 0 && !require404) return;

	console.log(
		targets.length
			? `\n🖨️  Prerendering ${targets.length} route(s)...`
			: "\n🖨️  Building 404.html (wrangler sets 404-page)...",
	);

	const port = await getEphemeralPort();
	// No BOSIA_REUSE_PORT: the child must fail to bind rather than share a port
	// with another server, whose pages we'd then save as ours. The ready loop
	// stops once the child exits, but a server that grabbed the port first can
	// still answer /_health before the child dies. Have /_health echo a nonce
	// from the child's env if that race ever shows up.
	const { BOSIA_REUSE_PORT: _, ...env } = process.env;
	const child = Bun.spawn(["bun", "run", `${OUT_DIR}/server/index.js`], {
		env: {
			...env,
			NODE_ENV: "production",
			PORT: String(port),
			// Live-traffic limits from .env, set rather than removed (Bun would load them back).
			// MAX_INFLIGHT would 503 the build's own requests (a page and its data,
			// PRERENDER_CONCURRENCY at once); IDLE_TIMEOUT (0 = off) and LOAD_TIMEOUT would cut a
			// loader that PRERENDER_TIMEOUT allows, and METADATA_TIMEOUT would save the page without
			// its metadata (a timeout there is swallowed). All off, so PRERENDER_TIMEOUT alone rules
			// the build: an equal server limit would race it, and its 500 would hide the hint.
			MAX_INFLIGHT: "infinity",
			IDLE_TIMEOUT: "0",
			LOAD_TIMEOUT: "Infinity",
			METADATA_TIMEOUT: "Infinity",
			NODE_PATH: BOSIA_NODE_PATH,
		},
		stdout: "ignore",
		// Show render errors (a throwing +error.svelte, a crashing loader).
		stderr: "inherit",
	});
	// exitCode stays null when a signal kills the child (OOM, segfault), so
	// watch `exited` instead.
	let exited = false;
	child.exited.then(() => (exited = true));
	const exitsWithin = (ms: number) =>
		Promise.race([child.exited.then(() => true), Bun.sleep(ms).then(() => false)]);
	const stopReason = () => child.signalCode ?? `exit code ${child.exitCode}`;

	const signals: NodeJS.Signals[] = ["SIGINT", "SIGTERM"];
	let receivedSignal: NodeJS.Signals | null = null;
	const onSignal = (sig: NodeJS.Signals) => {
		receivedSignal = sig;
	};
	for (const sig of signals) process.once(sig, onSignal);

	try {
		// Poll /_health until ready (max 10s). Check first, sleep only on failure —
		// avoids a guaranteed floor when the server is already up.
		// The child inherits BASE_PATH, so it 404s anything outside the mount —
		// including /_health. Prefix here and every fetch below follows; the files
		// we write stay app-space, which is what the server looks them up by.
		const base = `http://localhost:${port}${currentBase()}`;
		let ready = false;
		const deadline = Date.now() + 10_000;
		while (Date.now() < deadline && !exited) {
			try {
				// Answered after the hooks, so a stuck hook would hang here past the deadline.
				const res = await fetch(`${base}${HEALTH_PATH}`, {
					signal: AbortSignal.timeout(Math.max(1, deadline - Date.now())),
				});
				if (res.ok) {
					ready = true;
					break;
				}
			} catch {
				/* not ready yet */
			}
			await Bun.sleep(50);
		}

		if (!ready || exited) {
			// Alive but never healthy (slow hooks init, a bad BASE_PATH) is not a crash.
			const why = exited ? stopReason() : "not ready within 10s";
			// Returning here would ship a build with every prerendered page missing.
			throw new PrerenderEntriesError(
				`❌ Prerender server failed to start (${why})` +
					(require404
						? `, so 404.html could not be built, but wrangler sets not_found_handling ` +
							`"404-page". Fix the server, or add public/404.html.`
						: ""),
			);
		}

		mkdirSync(`${OUT_DIR}/prerendered`, { recursive: true });

		// Every target that can't be saved; the build fails with all of them once the pool drains.
		const failures: string[] = [];
		// Pages whose connection broke (a reset, a refused connect), with their ❌ line. If the
		// server turns out to have died (a loader that exits or runs out of memory), one line
		// names the exit instead. A timeout isn't one: a dead server resets its connections, it
		// doesn't leave them hanging, so a timeout keeps its own line and hint.
		const connLost: { route: string; line: string }[] = [];
		class ConnLost extends ReplyProblem {}
		// A timeout can mean a loader stuck the server, which may die next: counted, so the
		// check after the pages waits for that too.
		class TimedOut extends ReplyProblem {}
		let timedOut = 0;
		// PRERENDER_CONCURRENCY counts requests, not pages: a page's HTML and data each run its
		// loaders, so N slots keep N loader runs at once (a cap users set for rate-limited APIs).
		let free = concurrency;
		const waiting: (() => void)[] = [];
		const acquire = async () => {
			if (free > 0) free--;
			else await new Promise<void>((resolve) => waiting.push(resolve));
		};
		const release = () => {
			const nextInLine = waiting.shift();
			if (nextInLine) nextInLine();
			else free++;
		};

		const prerenderOne = async (t: PrerenderTarget): Promise<void> => {
			const { path: routePath, kind, trailingSlash: ts } = t;
			// `manual`: a redirect is reported, not followed into another page that gets saved.
			// A new timeout per fetch: a shared one would give the page and its data (two
			// loader runs) one PRERENDER_TIMEOUT between them.
			// `stop` ends a page's data fetch once the page itself has failed.
			const stop = new AbortController();
			const line = (why: string) => `❌ Prerender: ${targetLabel(t)} ${why}`;
			const fail = (why: string) => failures.push(line(why));
			// Fetches `url` and reads its body. Any failure (a bad reply, a timeout, a reset) is
			// thrown as a ReplyProblem carrying `label`, so a data fetch's says "data".
			// The timeout starts once a slot is free, so time spent queued isn't counted.
			const fetchText = async (url: string, as: "page" | "api", label = "") => {
				await acquire();
				try {
					stop.signal.throwIfAborted();
					const res = await fetch(url, {
						redirect: "manual",
						signal: AbortSignal.any([AbortSignal.timeout(timeout), stop.signal]),
					});
					const problem = prerenderReplyProblem(as, res);
					if (!problem) return await res.text();
					await dropBody(res);
					throw new ReplyProblem(label + problem);
				} catch (err) {
					if (err instanceof ReplyProblem) throw err;
					const why = label + fetchFailure(err, timeout);
					throw isTimeout(err) ? new TimedOut(why) : new ConnLost(why);
				} finally {
					release();
				}
			};
			try {
				if (kind === "api") {
					// APIs: fetch the bare route URL, write body to `<path>.json`.
					const body = await fetchText(`${base}${routePath.replace(/\/$/, "")}`, kind);
					const outPath = prerenderApiOutPath(routePath);
					mkdirSync(outPath.substring(0, outPath.lastIndexOf("/")), { recursive: true });
					writeFileSync(outPath, body);
					console.log(`   ✅ ${routePath} → ${outPath}`);
					return;
				}

				// Hit the canonical URL so the server doesn't 308 us mid-prerender
				const canonicalRoute = canonicalRouteFor(routePath, ts);

				// The data payload (filename matches dataUrl() — strips trailing slash). Client
				// navigation on a static host fetches it, so a page saved without it is broken:
				// both are checked before either is written. Fetched side by side, each with its
				// own timeout. One ❌ per page, the page's own problem first: a failed page stops
				// its data fetch, and a failed data fetch still waits for the page.
				const dataPath = prerenderDataPath(routePath);
				const htmlP = fetchText(`${base}${canonicalRoute}`, kind);
				htmlP.catch(() => stop.abort());
				const dataP = fetchText(`${base}/__bosia/data${dataPath}`, "api", "data ");
				const [htmlGot, dataGot] = await Promise.allSettled([htmlP, dataP]);
				if (htmlGot.status === "rejected") throw htmlGot.reason;
				if (dataGot.status === "rejected") throw dataGot.reason;
				const html = htmlGot.value;
				const dataJson = dataGot.value;
				const payloadProblem = prerenderDataProblem(dataJson);
				if (payloadProblem) return void fail(`data ${payloadProblem}`);

				// Filename strategy:
				//   never  → about.html        (canonical /about, served by static host as /about → about.html)
				//   always → about/index.html  (canonical /about/, static host serves /about/ → about/index.html)
				//   ignore → about/index.html  (single emit; both URLs resolve via server canonicalize=off)
				//   root   → index.html
				const outPath = prerenderOutPath(routePath, ts);

				mkdirSync(outPath.substring(0, outPath.lastIndexOf("/")), { recursive: true });
				writeFileSync(outPath, html);
				const dataOutPath = prerenderDataOutPath(routePath);
				mkdirSync(dataOutPath.substring(0, dataOutPath.lastIndexOf("/")), { recursive: true });
				writeFileSync(dataOutPath, dataJson);
				console.log(`   ✅ ${routePath} → ${outPath} (+ data)`);
			} catch (err) {
				const why = err instanceof ReplyProblem ? err.message : fetchFailure(err, timeout);
				if (err instanceof TimedOut) timedOut++;
				if (err instanceof ConnLost) connLost.push({ route: routePath, line: line(why) });
				else fail(why);
			}
		};

		// Every page starts at once; the request slots above are the only limit, and they're
		// handed out in target order (a page's HTML, then its data).
		await Promise.all(targets.map(prerenderOne));
		// Checked once, after the pages, and only when a page broke or timed out: the exit can
		// land well after the errors it causes, so a dead server gets up to 1s to show it. A
		// server that dies with every page saved lost nothing; the 404 probe says so if it hits it.
		const died = connLost.length + timedOut > 0 && (await exitsWithin(1000));
		if (died) {
			// An example, not the culprit: a crash breaks every page in flight at once.
			const pages = connLost.length
				? `; ${connLost.length} page(s) not built, e.g. ${connLost[0]!.route}`
				: "";
			failures.push(`❌ The prerender server stopped (${stopReason()})${pages}`);
		} else failures.push(...connLost.map((f) => f.line));

		// Static hosts (Cloudflare assets) serve index.html with a 200 for unknown
		// paths unless a 404.html exists. Save the server's own 404 page while it's up.
		// Goes to dist/static, not prerendered/, so the Bun server doesn't route /404
		// to it, though it (and static hosts) still serve /404.html with a 200.
		// Skipped on Workers: the worker answers unknown paths, and an uploaded file
		// would only add that soft 404. A public/404.html overwrites it.
		// One probe, one locale: add per-locale probe paths (e.g. /id/404.html) when asked.
		// A server that died is already reported, and the probe would only fail too.
		if (target !== "workers" && !died)
			try {
				// Follows only its own slash form, unlike the pages: a catch-all `always` page 308s
				// the probe to `/__bosia-404-probe/`, and its 404 there is the page a static host
				// should show. Any other redirect (a hook sending it to /login, or off the build
				// server) is reported with where it goes, not fetched.
				const probe = (url: string) =>
					fetch(url, { redirect: "manual", signal: AbortSignal.timeout(timeout) });
				const probeUrl = `${base}/__bosia-404-probe`;
				let res = await probe(probeUrl);
				const location = res.status >= 300 && res.status < 400 && res.headers.get("location");
				if (location && new URL(location, probeUrl).href === `${probeUrl}/`) {
					await dropBody(res);
					res = await probe(`${probeUrl}/`);
				}
				// No +error.svelte (or it crashed) → plain-text "Not Found", not a page.
				const problem = prerenderReplyProblem("page", res, 404);
				if (problem) {
					await dropBody(res);
					throw new ReplyProblem(`an unknown URL ${problem}`);
				}
				mkdirSync(`${OUT_DIR}/static`, { recursive: true });
				writeFileSync(`${OUT_DIR}/static/404.html`, await res.text());
				console.log(`   ✅ 404 page → ${OUT_DIR}/static/404.html`);
			} catch (err) {
				// A broken connection (not a timeout, as with pages) may mean the server died.
				const gone = !(err instanceof ReplyProblem) && !isTimeout(err) && (await exitsWithin(1000));
				const reason = gone
					? `the prerender server stopped (${stopReason()})`
					: err instanceof ReplyProblem
						? err.message
						: fetchFailure(err, timeout);
				// Only a deploy that serves 404.html needs it; elsewhere (an app whose
				// hooks redirect every request) a missing one is fine, so just warn.
				// Listed with the page failures, so one build shows every problem.
				if (require404)
					failures.push(
						`❌ 404.html could not be built (${reason}), but wrangler sets ` +
							`not_found_handling "404-page". Make unknown paths answer 404, or add public/404.html.`,
					);
				else console.warn(`   ⚠️  404.html skipped: ${reason}`);
			}

		// build.ts prints this and exits 1; the finally below still stops the server.
		if (failures.length) throw new PrerenderEntriesError(failures.join("\n"));
		if (targets.length) console.log("✅ Prerendering complete");
	} finally {
		for (const sig of signals) process.off(sig, onSignal);
		// SIGTERM drains in-flight requests for up to 10s (server.bun.ts), and an aborted fetch
		// doesn't stop its loader. Nothing here needs that drain: give it 1s, then SIGKILL.
		child.kill();
		const stopped = await exitsWithin(1000);
		if (!stopped) child.kill("SIGKILL");
		await child.exited;
		if (receivedSignal) {
			// Re-raise so parent exit code is 128+signum (standard Unix convention)
			process.kill(process.pid, receivedSignal);
		}
	}
}

// ─── Static Site Output ──────────────────────────────────

export function generateStaticSite(): void {
	const hasPublic = existsSync("./public");
	const hasPrerender = existsSync(`${OUT_DIR}/prerendered`);

	// Mirror `public/` → `dist/static/` on every build (not only SSG builds) so
	// production containers can ship dist/ alone. Without this, apps with zero
	// prerendered routes (pure SSR) would lose favicons and other public assets
	// when public/ is dropped from the image. (bosia-tw-<hash>.css lives in
	// dist/client/ and is served from the client walk, no mirror needed.)
	if (!hasPublic && !hasPrerender) {
		console.log("\n⏭️  No public/ or prerendered pages — skipping static site output");
		return;
	}

	console.log("\n📦 Generating static site...");
	mkdirSync(`${OUT_DIR}/static`, { recursive: true });

	// 1. Public assets (favicon, etc.) — preserves absolute /... paths
	if (hasPublic) {
		cpSync("./public", `${OUT_DIR}/static`, { recursive: true });
	}

	// 2. HTML files from prerendering (SSG output only)
	if (hasPrerender) {
		cpSync(`${OUT_DIR}/prerendered`, `${OUT_DIR}/static`, { recursive: true });
		// 3. Client JS/CSS — preserves /dist/client/... absolute paths used in HTML
		cpSync(`${OUT_DIR}/client`, `${OUT_DIR}/static/dist/client`, { recursive: true });
	}

	console.log(`✅ Static site generated: ${OUT_DIR}/static/`);
}
