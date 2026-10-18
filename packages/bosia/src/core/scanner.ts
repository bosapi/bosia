import { readdirSync, existsSync, readFileSync } from "fs";
import { join } from "path";
import type { PageRoute, ApiRoute, RouteManifest, TrailingSlash } from "./types.ts";
import { segmentName, segmentRank } from "./matcher.ts";

// ─── Route Scanner ───────────────────────────────────────
// Walks src/routes/ and produces a RouteManifest.
//
// Conventions (SvelteKit-compatible):
//   +page.svelte         — page component
//   +page.server.ts      — server loader for the page
//   +loading.svelte      — client skeleton shown during navigation
//   +layout.svelte       — layout component (wraps all children)
//   +layout.server.ts    — server loader for the layout
//   +server.ts           — API route (GET, POST, etc.)
//   (group)/             — route group: invisible in URL, shares layouts
//   [param]/             — dynamic segment
//   [...rest]/           — catch-all segment

const ROUTES_DIR = "./src/routes";

/**
 * Read `export const cache` from +page.svelte's `<script module>` (or from
 * +page.server.ts) at scan time.
 * Conservative on purpose — the flag lets the renderer skip caching, so a wrong
 * "cacheable" answer would leak a per-user page. Returns `true` ONLY when there
 * is no `cache` export at all; a literal `= false` returns `false`; anything
 * else (dynamic expression, unreadable file) returns `null` so the renderer
 * imports the module and reads the real value.
 */
function pageCache(src: string | null): boolean | null {
	if (src === null) return null;
	if (/export\s+const\s+cache\s*(?::[^=]+)?=\s*false\b/.test(src)) return false;
	// Any other way `cache` could be exported (re-export, `export *`, `let`, a
	// second declarator) is read from the module at runtime. Over-matching
	// (`{ cache: "no-store" }` inside an exported const) only costs that import.
	if (
		/export\s*\*|export\s*(?:type\s*)?\{[^}]*\bcache\b|export\s+(?:const|let|var)\b[^;]*\bcache\s*[:=]/.test(
			src,
		)
	)
		return null;
	return true;
}

/** Either file saying `false` opts the route out; both must be `true` to skip the import. */
function routeCache(
	pageSrc: string | null,
	serverFile: string | null,
	serverSrc: string | null,
): boolean | null {
	const page = pageCache(pageSrc);
	const server = serverFile ? pageCache(serverSrc) : true;
	if (page === false || server === false) return false;
	return page && server ? true : null;
}

/** Literal `export const prerender = true` in a server module's source. */
export function wantsPrerender(src: string): boolean {
	return /export\s+const\s+prerender\s*=\s*true/.test(src);
}

/** Why a page that asks for prerender can't have it, or null when it can. */
export function prerenderSkipReason(src: string): string | null {
	if (/export\s+const\s+ssr\s*=\s*false/.test(src)) return "ssr=false — contradictory";
	// A static file can't run an action: Bun would answer the POST with the
	// prerendered HTML, Workers' asset server with 405. Render it live instead.
	if (
		/export\s+(const|let|var|async\s+function|function)\s+actions\b|export\s*\{[^}]*\bactions\b/.test(
			src,
		)
	)
		return "actions — forms need a live page";
	return null;
}

/** True when the page will really be prerendered — the client fetches its data as a static file. */
function prerenderOf(src: string | null): boolean {
	return src !== null && wantsPrerender(src) && prerenderSkipReason(src) === null;
}

/** A route file's source, or null when it can't be read. */
function readSource(filePath: string): string | null {
	try {
		return readFileSync(filePath, "utf-8");
	} catch {
		return null;
	}
}

/**
 * Extract `export const trailingSlash = '...'` from a server module file via
 * regex. Static-string read only — runtime expressions return null. Build-time
 * scan avoids invoking server modules during the client bundle.
 */
function trailingSlashOf(src: string | null): TrailingSlash | null {
	const m = src?.match(
		/export\s+const\s+trailingSlash\s*(?::\s*[^=]+)?=\s*["'](never|always|ignore)["']/,
	);
	return (m?.[1] ?? null) as TrailingSlash | null;
}

export function scanRoutes(): RouteManifest {
	const pages: PageRoute[] = [];
	const apis: ApiRoute[] = [];

	function walk(
		dir: string,
		urlSegments: string[],
		layoutChain: string[],
		layoutServerChain: { path: string; depth: number }[],
		errorPageChain: { path: string; depth: number }[],
		inheritedTrailingSlash: TrailingSlash,
		inheritedLoading: string | null,
	) {
		const fullDir = join(ROUTES_DIR, dir);
		if (!existsSync(fullDir)) return;

		// Manifest paths are always "/"-separated (they become import specifiers),
		// so build them by hand — path.join would emit "\" on Windows.
		const rel = (name: string) => (dir ? `${dir}/${name}` : name);

		const items = readdirSync(fullDir, { withFileTypes: true });

		// Accumulate layouts for this level
		const currentLayouts = [...layoutChain];
		const currentLayoutServers = [...layoutServerChain];
		const currentErrorPages = [...errorPageChain];
		let currentTrailingSlash = inheritedTrailingSlash;
		// Cascades to every page below, nearest ancestor winning — the same shape
		// as the layout chain. Without this a section with 40 routes needed 40
		// identical +loading.svelte files to cover its navigations.
		const currentLoading = items.some((i) => i.isFile() && i.name === "+loading.svelte")
			? rel("+loading.svelte")
			: inheritedLoading;

		if (items.some((i) => i.isFile() && i.name === "+layout.svelte")) {
			currentLayouts.push(rel("+layout.svelte"));
		}
		if (items.some((i) => i.isFile() && i.name === "+layout.server.ts")) {
			const layoutServerPath = rel("+layout.server.ts");
			currentLayoutServers.push({
				path: layoutServerPath,
				depth: currentLayouts.length - 1,
			});
			const ts = trailingSlashOf(readSource(join(ROUTES_DIR, layoutServerPath)));
			if (ts) currentTrailingSlash = ts;
		}
		if (items.some((i) => i.isFile() && i.name === "+error.svelte")) {
			// depth = number of layouts wrapping this dir (this dir's layout included).
			// An error page at depth K renders inside layouts[0..K-1].
			currentErrorPages.push({
				path: rel("+error.svelte"),
				depth: currentLayouts.length,
			});
		}

		// API route (+server.ts)
		if (items.some((i) => i.isFile() && i.name === "+server.ts")) {
			apis.push({
				pattern: toUrlPath(urlSegments),
				id: `/${dir}`,
				server: rel("+server.ts"),
			});
		}

		// Page route (+page.svelte)
		if (items.some((i) => i.isFile() && i.name === "+page.svelte")) {
			const pageServerFile = items.some((i) => i.isFile() && i.name === "+page.server.ts")
				? rel("+page.server.ts")
				: null;

			const pageServerSrc = pageServerFile ? readSource(join(ROUTES_DIR, pageServerFile)) : null;
			const pageTs = trailingSlashOf(pageServerSrc);
			const effectiveTs: TrailingSlash = pageTs ?? currentTrailingSlash;

			const pageFile = rel("+page.svelte");
			const pageSrc = readSource(join(ROUTES_DIR, pageFile));
			pages.push({
				pattern: toUrlPath(urlSegments),
				id: `/${dir}`,
				page: pageFile,
				layouts: [...currentLayouts],
				pageServer: pageServerFile,
				loading: currentLoading,
				layoutServers: [...currentLayoutServers],
				errorPages: [...currentErrorPages],
				trailingSlash: effectiveTs,
				cache: routeCache(pageSrc, pageServerFile, pageServerSrc),
				prerender: prerenderOf(pageServerSrc),
			});
		}

		// Recurse into subdirectories
		for (const entry of items) {
			if (!entry.isDirectory() || entry.name.startsWith(".") || entry.name === "node_modules")
				continue;

			const dirName = entry.name;
			// Route groups like (public), (auth) are invisible in URLs
			const isGroup = /^\(.*\)$/.test(dirName);

			walk(
				rel(dirName),
				isGroup ? [...urlSegments] : [...urlSegments, dirName],
				currentLayouts,
				currentLayoutServers,
				currentErrorPages,
				currentTrailingSlash,
				currentLoading,
			);
		}
	}

	walk("", [], [], [], [], "never", null);

	// Invalid segments first, so they get their own message, not a conflict or warning.
	checkParams(pages, (p) => p.page);
	checkParams(apis, (a) => a.server);

	// Warn when a trailing catch-all exists but no page covers its prefix.
	// e.g. "/[...slug]" matches everything EXCEPT "/" (which needs its own +page.svelte),
	// "/[lang]/[...rest]" needs "/[lang]" for "/en".
	const pageKeys = new Set(pages.map((p) => routeKey(p.pattern)));
	for (const p of pages) {
		const cut = p.pattern.lastIndexOf("/");
		if (segmentRank(p.pattern.slice(cut + 1)) === 2) {
			const exactEquivalent = p.pattern.slice(0, cut) || "/";
			if (!pageKeys.has(routeKey(exactEquivalent))) {
				console.warn(
					`⚠️  The catch-all "${p.pattern}" doesn't match "${exactEquivalent}" itself.\n` +
						`   Add a +page.svelte at "${exactEquivalent}" unless another route already serves it.`,
				);
			}
		}
	}

	preventConflicts(pages, (p) => p.page);
	preventConflicts(apis, (a) => a.server);

	const errorPage = existsSync(join(ROUTES_DIR, "+error.svelte")) ? "+error.svelte" : null;

	return { pages, apis, errorPage };
}

/**
 * Fail when two route files serve the same URL — e.g. `+page.svelte` next to
 * `(public)/+page.svelte`, or `blog/[id]` next to `(app)/blog/[slug]`. Route
 * groups vanish from the URL and param names don't affect matching, so one of
 * the two could never be reached. Same rule as SvelteKit's prevent_conflicts
 * and Next.js's "two parallel pages that resolve to the same path".
 */
function preventConflicts<T extends { pattern: string }>(routes: T[], fileOf: (r: T) => string) {
	const seen = new Map<string, T>();
	for (const r of routes) {
		const key = routeKey(r.pattern);
		const first = seen.get(key);
		if (!first) {
			seen.set(key, r);
			continue;
		}
		throw new RouteConflictError(
			`The "${first.pattern}" and "${r.pattern}" routes conflict with each other:\n` +
				`   src/routes/${fileOf(first)}\n` +
				`   src/routes/${fileOf(r)}\n` +
				`   Route groups like (public) are not part of the URL, and [id] matches the same URLs as [slug].\n` +
				`   Delete or move one of them.`,
		);
	}
}

const KINDS = ["", "[]", "[...]"];

/** The URL shape of a pattern, param names dropped: `/[lang]/[...rest]` → `/[]/[...]`. */
function routeKey(pattern: string): string {
	return pattern.replace(/[^/]+/g, (seg) => {
		const rank = segmentRank(seg);
		return rank ? KINDS[rank]! : seg;
	});
}

/**
 * Fail on params the matcher can't serve: brackets that don't wrap a whole
 * segment, a `[...rest]` that isn't the last segment, `__proto__`, or one name
 * bound twice. Mid-path catch-alls (`docs/[...path]/edit`) are left out on
 * purpose: each needs an unanchored `(.+)` (several backtrack for seconds on a
 * long URL) and span-aware ranking.
 * Add both together if that route shape is ever needed.
 */
function checkParams<T extends { pattern: string }>(routes: T[], fileOf: (r: T) => string) {
	for (const r of routes) {
		const segs = r.pattern.split("/").filter(Boolean);
		const names = new Set<string>();
		const fail = (problem: string) => {
			throw new RouteConflictError(
				`The "${r.pattern}" route is invalid: ${problem}.\n   src/routes/${fileOf(r)}`,
			);
		};
		for (const [i, seg] of segs.entries()) {
			const rank = segmentRank(seg);
			if (!rank) {
				// `[...]`, `[.x]` would match only their literal text.
				if (/^\[[^[\]/]*\]$/.test(seg)) fail(BAD_NAME(seg));
				// `[id].json`, `post-[slug]`, `[[lang]]`.
				if (/[[\]]/.test(seg)) fail(`${seg} must be a whole segment like [slug] or [...rest]`);
				continue;
			}
			const name = segmentName(seg);
			if (rank === 2 && i !== segs.length - 1) fail(`${seg} must be the last part of the route`);
			if (!PARAM_NAME.test(name)) fail(BAD_NAME(seg));
			// params is a plain object: assigning "__proto__" sets the prototype, not a key.
			if (name === "__proto__") fail(`"__proto__" can't be a param name`);
			if (names.has(name)) fail(`the param "${name}" is used twice`);
			names.add(name);
		}
	}
}

// Strict on purpose (decided 2026-10-14): an ASCII TypeScript identifier, so `params.name`
// always works: `[slug]`, `[x123]`, `[user_id]`, `[_id]`, `[$id]`. `[post-id]`, `[file.name]`,
// `[slüg]` fail by design, with one message (no per-typo hints).
export const PARAM_NAME = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const BAD_NAME = (seg: string) =>
	`${seg}: a param name uses ASCII letters, digits, _ and $, and can't start with a digit (like [slug], [user_id] or [...rest])`;

/** A route tree the build refuses (two files at one URL, or an invalid param).
 *  Callers print `message` and exit. */
export class RouteConflictError extends Error {
	override name = "RouteConflictError";
}

function toUrlPath(segments: string[]): string {
	if (segments.length === 0) return "/";
	return "/" + segments.join("/");
}
