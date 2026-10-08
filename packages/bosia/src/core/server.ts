import { BosiaApp } from "./backend.ts";

import { findMatch, compileRoutes, canonicalPathname } from "./matcher.ts";
import { resolveApiMatch } from "./apiResolver.ts";
import { apiRoutes, serverRoutes } from "bosia:routes";
import { loadPlugins } from "./config.ts";
import { readArtifact } from "./artifacts.ts";
import { getPlatform, warmingUp } from "./platform.ts";
import type { RouteManifest, RouteMatch } from "./types.ts";

// Pre-compile route patterns into RegExp at startup (shared by renderer.ts via module reference)
compileRoutes(apiRoutes);
compileRoutes(serverRoutes);
import { NO_FRAME_GUARD_HEADER, type Handle, type RequestEvent } from "./hooks.ts";
import { HttpError, Redirect, ActionFailure, isHttpError, isRedirect } from "./errors.ts";
import { CookieJar } from "./cookies.ts";
import { safePath } from "./safePath.ts";
import { checkCsrf } from "./csrf.ts";
import type { CsrfConfig } from "./csrf.ts";
import { applyCorsVary, getCorsHeaders, handlePreflight } from "./cors.ts";
import type { CorsConfig } from "./cors.ts";
import { buildCspHeader, CSP_DIRECTIVES_TEMPLATE, CSP_ENABLED, generateNonce } from "./csp.ts";
import {
	isDev,
	compress,
	compressBytes,
	encodeForRequest,
	isStaticPath,
	distManifest,
	PRECOMPRESSED,
	type Encoded,
	preloadLinkHeader,
	compressionOn,
} from "./html.ts";
import { dev500WithPlugins } from "./dev-500.ts";
import { OUT_DIR } from "./paths.ts";
import { stripBase, withBase } from "./basePath.ts";
import { currentBase } from "./appBase.ts";
import {
	buildPrerenderManifest,
	buildStaticManifest,
	findOutDirFile,
	lookupStatic,
	serveStatic,
} from "./staticManifest.ts";
import { dedup } from "./dedup.ts";
import {
	CACHE_ENABLED,
	CACHE_MAX_BODY_BYTES,
	buildCompressedVariants,
	cacheGet,
	cacheSet,
	coalesceMiss,
	collectTags,
	computeCacheKey,
	deferCacheWrite,
	serveCached,
	warnUncoveredCookies,
} from "./cache.ts";
import { reportDevErrorFromCatch } from "./devErrorReport.ts";
import {
	loadRouteData,
	loadMetadata,
	renderSSRStream,
	renderErrorPage,
	renderPageWithFormData,
} from "./renderer.ts";
import { getServerTime } from "../lib/utils.ts";

// ─── User Hooks ──────────────────────────────────────────
// Set by createApp(). Each runtime entry finds `src/hooks.server.ts` its own
// way: server.bun.ts imports it off disk, server.workers.ts statically.

let userHandle: Handle | null = null;

// ─── Env Helpers ─────────────────────────────────────────

// Headers that must not be baked into a cache entry. Content-Length is
// recomputed by Bun, content-encoding/transfer-encoding depend on the chosen
// variant, and security/CORS/Set-Cookie headers are applied by handleRequest.
const NON_CACHEABLE_HEADERS = new Set([
	"content-length",
	"content-encoding",
	"transfer-encoding",
	"content-type",
	"set-cookie",
	"vary",
	"x-bosia-cache",
]);

function captureCacheableHeaders(headers: Headers): Record<string, string> {
	const out: Record<string, string> = {};
	for (const [k, v] of headers) {
		if (!NON_CACHEABLE_HEADERS.has(k.toLowerCase())) out[k] = v;
	}
	return out;
}

function splitCsvEnv(key: string): string[] | undefined {
	return (
		process.env[key]
			?.split(",")
			.map((s) => s.trim())
			.filter(Boolean) || undefined
	);
}

// ─── CSRF Config ─────────────────────────────────────────

const _csrfAllowedOrigins = splitCsvEnv("CSRF_ALLOWED_ORIGINS");
const _csrfExemptPaths = splitCsvEnv("CSRF_EXEMPT_PATHS");

const CSRF_CONFIG: CsrfConfig = {
	checkOrigin: true,
	allowedOrigins: _csrfAllowedOrigins,
	exemptPaths: _csrfExemptPaths,
};

if (_csrfAllowedOrigins?.length) {
	console.log(`🛡️  CSRF allowed origins: ${_csrfAllowedOrigins.join(", ")}`);
} else {
	console.log("🛡️  CSRF: same-origin only");
}

if (_csrfExemptPaths?.length) {
	// These paths skip the origin check — they must authenticate callers themselves.
	console.warn(`⚠️  CSRF exempt paths (must self-authenticate): ${_csrfExemptPaths.join(", ")}`);
}

// ─── CORS Config ──────────────────────────────────────────

const _corsAllowedOrigins = splitCsvEnv("CORS_ALLOWED_ORIGINS");

const CORS_CONFIG: CorsConfig | null = _corsAllowedOrigins?.length
	? {
			allowedOrigins: _corsAllowedOrigins,
			allowedMethods: splitCsvEnv("CORS_ALLOWED_METHODS"),
			allowedHeaders: splitCsvEnv("CORS_ALLOWED_HEADERS"),
			exposedHeaders: splitCsvEnv("CORS_EXPOSED_HEADERS"),
			credentials: process.env.CORS_CREDENTIALS === "true" || undefined,
			maxAge: parseCorsMaxAge(process.env.CORS_MAX_AGE),
		}
	: null;

if (_corsAllowedOrigins?.length) {
	console.log(`🌐 CORS allowed origins: ${_corsAllowedOrigins.join(", ")}`);
}

// ─── CSP Config ──────────────────────────────────────────

if (CSP_DIRECTIVES_TEMPLATE) {
	console.log(`🔒 CSP: opt-in header active`);
}

if (currentBase()) {
	console.log(`📍 Mounted under ${currentBase()} (BASE_PATH)`);
}

// The CSS urls and the client route table are baked in at build time, so a
// build and the server running it have to agree. Older dist/ artifacts carry no
// `basePath` field — stay quiet for those rather than warn about nothing.
if (distManifest.basePath !== undefined && distManifest.basePath !== currentBase()) {
	console.warn(
		`⚠️  Built for BASE_PATH="${distManifest.basePath}" but running with "${currentBase()}" — CSS urls and the client route table are baked in and will not match.`,
	);
}

// ─── Core Request Resolver ────────────────────────────────
// This is the inner handler that hooks wrap around.

function isValidRoutePath(path: string, origin: string): boolean {
	try {
		return new URL(path, origin).origin === origin;
	} catch {
		return false;
	}
}

type DataRequest = { routeUrl: URL; invalidatedBits: string | null; fresh: boolean };

/**
 * Decode `/__bosia/data/<route>.json` into the page URL it stands for.
 * `null` = not a data request, `"invalid"` = 400.
 *
 * Called before the hooks run, not inside `resolve()`, so `event.url` is the
 * page the visitor asked for no matter how the request arrived. A guard reading
 * `event.url.pathname` sees `/admin` for a link click and for an address-bar
 * load alike; when it only saw the transport path on one of them, the loaders
 * ran unguarded for every client navigation.
 */
function parseDataRequest(url: URL): DataRequest | "invalid" | null {
	if (!url.pathname.startsWith("/__bosia/data/")) return null;

	const routePathStr =
		url.pathname
			.slice("/__bosia/data".length)
			.replace(/\.json$/, "")
			.replace(/^\/index$/, "/") || "/";

	if (!isValidRoutePath(routePathStr, url.origin)) return "invalid";

	const routeUrl = new URL(routePathStr, url.origin);
	let invalidatedBits: string | null = null;
	let fresh = false;
	for (const [key, val] of url.searchParams.entries()) {
		if (key === "_invalidated") {
			invalidatedBits = val;
			continue;
		}
		// Set by the client router when the fetch follows an invalidate():
		// skip the cached copy, as `?_invalidated` does for page HTML.
		if (key === "_fresh") {
			fresh = true;
			continue;
		}
		routeUrl.searchParams.append(key, val);
	}
	return { routeUrl, invalidatedBits, fresh };
}

/**
 * Per-request parse, parked here because `resolve()` can no longer recover it:
 * `event.url` is the page URL by then, and hooks call `resolve(event)`
 * themselves so there is no parameter to thread it through. `event.locals` is
 * user scratch space and off limits for framework state.
 *
 * Keyed on the incoming `Request`, which is the one object that stays identical
 * across the whole chain. A hook that swaps in a fabricated `Request` detaches
 * its event from this record — documented on `Handle`, pinned by
 * `test/hooks-redirect.test.ts`.
 */
const dataRequests = new WeakMap<Request, DataRequest>();

type RouteMatches = {
	path: string;
	pageOnly: boolean;
	api: RouteMatch<(typeof apiRoutes)[number]> | null;
	page: RouteMatch<(typeof serverRoutes)[number]> | null;
	/** handleRequest already looked for a static file at `path` and found none. */
	staticMiss?: boolean;
};

/**
 * Match `path` in resolve()'s order: an API route first (it shadows static
 * files), then a page unless the path is a static file. A data request only
 * ever routes to a page.
 */
async function matchRoutes(path: string, pageOnly: boolean): Promise<RouteMatches> {
	if (pageOnly) return { path, pageOnly, api: null, page: findMatch(serverRoutes, path) };
	const apiMaybe = resolveApiMatch(apiRoutes, path);
	const api = apiMaybe instanceof Promise ? await apiMaybe : apiMaybe;
	const page = api || isStaticPath(path) ? null : findMatch(serverRoutes, path);
	return { path, pageOnly, api, page };
}

/**
 * handleRequest matches before the hooks run (so they see `params`) and parks
 * the result here, keyed like `dataRequests`. resolve() reuses it unless a hook
 * rewrote the URL, in which case it matches again.
 */
const routeMatches = new WeakMap<Request, RouteMatches>();

function routesFor(
	request: Request,
	path: string,
	pageOnly: boolean,
): RouteMatches | Promise<RouteMatches> {
	const parked = routeMatches.get(request);
	if (parked && parked.path === path && parked.pageOnly === pageOnly) return parked;
	return matchRoutes(path, pageOnly);
}

const jsonEncoder = new TextEncoder();

/** A page route's `export const cache` flag: the build-time read when it has
 *  one, otherwise the compiled page module's own export (see renderer.ts). */
async function pageRouteCacheable(route: (typeof serverRoutes)[number]): Promise<boolean> {
	const flag = (route as { cache?: boolean | null }).cache;
	if (flag === true || flag === false) return flag;
	return (await route.pageModule()).cache !== false;
}

/**
 * Decode an `_invalidated` bitmask string. Char 0 = page, char i+1 = layout
 * depth i. Only '0' has a meaning; any other char counts as '1'.
 *   - Page '0': skip the page loader.
 *   - Layout '0': omit its data from the response. The loader still runs,
 *     since it may be a guard.
 * Missing chars count as '1'. Chars past the route's layout count are ignored.
 */
function buildMaskFromBits(
	bits: string,
	layoutCount: number,
): { page: boolean; layouts: boolean[] } {
	const page = bits[0] !== "0";
	const layouts: boolean[] = [];
	for (let i = 0; i < layoutCount; i++) {
		const c = bits[i + 1];
		layouts.push(c !== "0");
	}
	return { page, layouts };
}

/** Extract action name from URL searchParams — `?/login` → "login", no slash key → "default". */
function parseActionName(url: URL): string {
	for (const key of url.searchParams.keys()) {
		if (key.startsWith("/")) return key.slice(1) || "default";
	}
	return "default";
}

// Prod: walk `dist/client`, `./public`, and `OUT_DIR` once at boot so static-asset
// requests cost a single Map lookup instead of up to 4 `Bun.file().exists()` syscalls.
// Dev keeps the per-request fallthrough so files dropped into `public/` mid-session
// are served without a restart (dev's watcher doesn't fire on `public/`).
const staticManifest = isDev ? null : buildStaticManifest(OUT_DIR);
const prerenderManifest = isDev ? null : buildPrerenderManifest(OUT_DIR);

/** Serve `path` as a static file, or `null` when there is no such file. */
async function serveStaticFile(path: string, request: Request): Promise<Response | null> {
	// Prod fast path: single Map lookup, no per-request stat calls.
	if (staticManifest) {
		const hit = lookupStatic(staticManifest, path);
		return hit ? serveStatic(hit, request) : null;
	}
	// Dev: keep the per-request fallthrough so files dropped into `public/`
	// mid-session are served without a restart. Decode once — filenames on
	// disk are raw; safePath still runs after so traversal stays blocked.
	let decodedPath: string;
	try {
		decodedPath = decodeURIComponent(path);
	} catch {
		return null;
	}
	if (decodedPath.startsWith("/dist/client/")) {
		const resolved = safePath(
			`${OUT_DIR}/client`,
			decodedPath.split("?")[0].slice("/dist/client".length),
		);
		if (resolved) {
			const file = Bun.file(resolved);
			if (await file.exists()) {
				return new Response(file, { headers: { "Cache-Control": "no-cache" } });
			}
		}
		return null;
	}
	const pubPath = safePath("./public", decodedPath);
	if (pubPath) {
		const pub = Bun.file(pubPath);
		if (await pub.exists()) return new Response(pub);
	}
	// Same refusals as the prod manifest: never hand out the server bundle,
	// the user's bundled hooks/config, or build metadata. Matched against the
	// real directory listing, so no alternative spelling reaches those files.
	const distPath = findOutDirFile(OUT_DIR, decodedPath);
	if (distPath) {
		const dist = Bun.file(distPath);
		if (await dist.exists()) return new Response(dist);
	}
	const staticPath = safePath(`${OUT_DIR}/static`, decodedPath);
	if (staticPath) {
		const staticFile = Bun.file(staticPath);
		if (await staticFile.exists()) return new Response(staticFile);
	}
	return null;
}

async function resolve(event: RequestEvent): Promise<Response> {
	const { request, url, locals, cookies } = event;
	const path = url.pathname;
	const method = request.method.toUpperCase();

	// Health check endpoint — for load balancers and orchestrators
	if (path === "/_health") {
		if (shuttingDown) {
			return Response.json({ status: "shutting_down" }, { status: 503 });
		}
		const { timestamp, timezone } = getServerTime();
		return Response.json({ status: "ok", timestamp, timezone });
	}

	// Data endpoint — returns server loader data as JSON for client-side navigation.
	// The URL no longer says so (it is the page URL, for the hooks' benefit), so
	// the parse handleRequest parked before the hooks ran is what identifies it.
	const dataReq = dataRequests.get(request);
	if (dataReq) {
		const { routeUrl, invalidatedBits, fresh } = dataReq;
		// INVARIANT: once set, releaseDataMiss must fire exactly once — see the
		// API-route cache below for the same contract.
		let releaseDataMiss: (() => void) | null = null;
		try {
			const pageMatch = (await routesFor(request, routeUrl.pathname, true)).page;
			// Build mask from `?_invalidated=<bits>` — see buildMaskFromBits. A page
			// '0' skips the page loader; a layout '0' still runs the loader (it may
			// be a guard) and only leaves its data out. Absent → run and send all.
			// Mask is sized to the total layout count (matching client `layoutIds`),
			// not the count of layout servers, so depths without a server loader
			// still occupy a bit position and stay aligned with the client.
			const mask = invalidatedBits
				? buildMaskFromBits(
						invalidatedBits,
						pageMatch?.route ? ((pageMatch.route as any).layoutModules?.length ?? 0) : 0,
					)
				: undefined;
			const runLoad = async () => {
				const data = await loadRouteData(routeUrl, locals, request, cookies, null, pageMatch, mask);

				let metadata = null;
				if (pageMatch) {
					try {
						const meta = await loadMetadata(
							pageMatch.route,
							pageMatch.params,
							routeUrl,
							locals,
							cookies,
							request,
						);
						// Explicit whitelist, not a spread: `metadata.data` feeds load() on the
						// server and may hold secrets — it must not reach the client.
						if (meta)
							metadata = {
								title: meta.title,
								description: meta.description,
								meta: meta.meta,
								link: meta.link,
								lang: meta.lang,
							};
					} catch {
						/* non-fatal */
					}
				}

				return { data, metadata, cookiesAccessed: (cookies as CookieJar).accessed };
			};

			// ── Response cache for client-navigation data ──
			// Same contract as page HTML: keyed by URL + identity, plus the mask
			// (different masks return different slots), tag/path invalidation, and
			// no CSP. Only GETs use it (the client router only sends GETs); a
			// `_fresh` fetch after invalidate() skips the read only.
			const cacheKey =
				computeCacheKey(routeUrl, request, cookies as CookieJar) +
				`|data${invalidatedBits ? `|m=${invalidatedBits}` : ""}`;
			const dataCacheable =
				CACHE_ENABLED &&
				!CSP_ENABLED &&
				!warmingUp &&
				method === "GET" &&
				pageMatch !== null &&
				(await pageRouteCacheable(pageMatch.route));
			if (dataCacheable && !fresh) {
				const hit = cacheGet(cacheKey);
				if (hit) return serveCached(hit, request);
				const gate = coalesceMiss(cacheKey);
				if (gate.wait) {
					await gate.wait;
					const rehit = cacheGet(cacheKey);
					if (rehit) return serveCached(rehit, request);
				} else {
					releaseDataMiss = gate.release;
				}
			}

			// Dedup concurrent identical requests. The key includes the CACHE_KEYS
			// identity hash, so different users never share a loader result — same
			// isolation contract as the response cache. The mask is part of the key
			// so concurrent requests for the same URL with different invalidation
			// patterns don't collapse onto each other. See dedup.ts.
			const dedupK =
				computeCacheKey(routeUrl, request, cookies as CookieJar) +
				(invalidatedBits ? `|m=${invalidatedBits}` : "");
			const result = await dedup(dedupK, runLoad);
			// Identity only covers CACHE_KEYS — warn if a loader read a session
			// cookie outside that list (dedup could then mix users' results).
			warnUncoveredCookies(cookies);

			const cookiesWereAccessed = (cookies as CookieJar).accessed || result.cookiesAccessed;
			const cc = cookiesWereAccessed ? "private, no-cache" : "public, max-age=0, must-revalidate";

			if (!result.data) {
				return compress(
					JSON.stringify({ pageData: {}, layoutData: [] }),
					"application/json",
					request,
					200,
					{ "Cache-Control": cc },
				);
			}
			// loaderHeaders must not leak into the JSON body the client router consumes.
			const { loaderHeaders = {}, ...payload } = result.data;
			const extra: Record<string, string> = { "cache-control": cc, ...loaderHeaders };
			// Privacy beats intent: cookie-derived responses stay private even if
			// a loader set its own cache-control.
			if (cookiesWereAccessed) extra["cache-control"] = cc;
			const body = jsonEncoder.encode(JSON.stringify({ ...payload, metadata: result.metadata }));

			// A loader that said not to store its response is taken at its word.
			const loaderCc = (loaderHeaders["cache-control"] ?? "").toLowerCase();
			const loaderOptOut = /no-store|no-cache|private/.test(loaderCc);
			let sent: Encoded | null | undefined;
			if (
				dataCacheable &&
				!loaderOptOut &&
				(cookies as CookieJar).outgoing.length === 0 &&
				(CACHE_MAX_BODY_BYTES === 0 || body.length <= CACHE_MAX_BODY_BYTES)
			) {
				const tags = collectTags(result.data.layoutDeps ?? null, result.data.pageDeps ?? null);
				const rel = releaseDataMiss;
				releaseDataMiss = null;
				// Encoded once at cache quality and shared by response and entry.
				const encoded = encodeForRequest(body, request, "cache");
				sent = encoded;
				deferCacheWrite(() => {
					try {
						const { gzip, brotli } = buildCompressedVariants(
							body,
							encoded?.enc === "br"
								? { brotli: encoded.encoded }
								: encoded
									? { gzip: encoded.encoded }
									: {},
						);
						cacheSet(
							cacheKey,
							{
								raw: body,
								gzip,
								brotli,
								contentType: "application/json",
								status: 200,
								extraHeaders: extra,
								tags,
							},
							cookies,
						);
					} finally {
						rel?.();
					}
				});
			}
			return compressBytes(body, "application/json", request, 200, extra, sent);
		} catch (err) {
			if (isRedirect(err)) {
				return compress(
					JSON.stringify({ redirect: err.location, status: err.status }),
					"application/json",
					request,
				);
			}
			if (isHttpError(err)) {
				const e = err as HttpError & {
					errorDepth?: number;
					errorOrigin?: "page" | "layout";
				};
				return compress(
					JSON.stringify({
						error: { status: err.status, message: err.message },
						errorDepth: e.errorDepth ?? null,
						errorOrigin: e.errorOrigin ?? null,
					}),
					"application/json",
					request,
					err.status,
				);
			}
			if (isDev) console.error("Data endpoint error:", err);
			else console.error("Data endpoint error:", (err as Error).message ?? err);
			if (isDev) reportDevErrorFromCatch(err);
			if (isDev) {
				const detail = err instanceof Error ? (err.stack ?? err.message) : String(err);
				return dev500WithPlugins({
					request,
					url,
					message: "Internal Server Error",
					detail,
				});
			}
			return Response.json({ error: "Internal Server Error" }, { status: 500 });
		} finally {
			releaseDataMiss?.();
		}
	}

	// Framework-owned static prefixes (`/dist/…`, `/__bosia/…`) can't be shadowed
	// by a user `+server.ts`, so serve them straight from the manifest before the
	// API scan. A miss falls through to the normal path (which 404s). Keeps the
	// api-before-static ordering intact for every user-facing path.
	if (staticManifest && (path.startsWith("/dist/") || path.startsWith("/__bosia/"))) {
		const hit = lookupStatic(staticManifest, path);
		if (hit) return serveStatic(hit, request);
	}

	// API routes (+server.ts) — resolve with `.json` alias preference.
	// Matched BEFORE static fallthrough so explicit handlers shadow extension-
	// based static detection (e.g. `/uploads/[...path]/+server.ts` can serve
	// `.webp` URLs that would otherwise be intercepted by isStaticPath).
	const routes = await routesFor(request, path, false);
	const apiMatch = routes.api;
	if (apiMatch) {
		if (warmingUp) return new Response(null, { status: 404 });
		// INVARIANT: once set, releaseApiMiss must fire exactly once — a missed
		// release() hangs coalesced waiters for the process lifetime. The cache
		// write path hands it off to its deferred write by nulling it first.
		let releaseApiMiss: (() => void) | null = null;
		try {
			const mod = await apiMatch.route.module();
			// HEAD falls back to GET (an explicit HEAD export still wins). BosiaApp
			// strips the body on the way out, for every route kind.
			const handler = mod[method] ?? (method === "HEAD" ? mod.GET : undefined);

			if (!handler) {
				const allowed = Object.keys(mod).filter((k) => /^[A-Z]+$/.test(k));
				if (allowed.includes("GET") && !allowed.includes("HEAD")) allowed.push("HEAD");
				return Response.json(
					{ error: `Method ${method} not allowed` },
					{ status: 405, headers: { Allow: allowed.join(", ") } },
				);
			}

			event.params = apiMatch.params;

			// ── Response cache for +server.ts GET handlers ──
			// CSP is skipped because cached responses would ship with a stale
			// nonce (see renderer.ts for the same gate). The cache key includes
			// URL + identity so per-user responses stay isolated. HEAD reads the GET
			// entry but never coalesces or writes: it isn't a leader that fills it.
			// An explicit HEAD export skips the cache so it always runs.
			const apiCacheRead =
				CACHE_ENABLED &&
				!CSP_ENABLED &&
				(mod as any).cache !== false &&
				(method === "GET" || (method === "HEAD" && !mod.HEAD));
			const apiCacheable = apiCacheRead && method === "GET";
			let apiCacheKey: string | null = null;
			if (apiCacheRead) {
				apiCacheKey = computeCacheKey(url, request, cookies as CookieJar);
				if (!url.searchParams.has("_invalidated")) {
					const hit = cacheGet(apiCacheKey);
					if (hit) return serveCached(hit, request);
				}
				if (apiCacheable && !url.searchParams.has("_invalidated")) {
					// Miss coalescing: first miss runs the handler; concurrent misses
					// wait, re-check the cache, and on a still-miss run independently.
					const gate = coalesceMiss(apiCacheKey);
					if (gate.wait) {
						await gate.wait;
						const rehit = cacheGet(apiCacheKey);
						if (rehit) return serveCached(rehit, request);
					} else {
						releaseApiMiss = gate.release;
					}
				}
			}

			const handlerResult = await handler({
				request,
				params: apiMatch.params,
				route: { id: apiMatch.route.id },
				url,
				locals,
				cookies,
				// An API route is reached through its own URL, never through the
				// client router's data endpoint.
				isDataRequest: false,
				platform: event.platform,
			});

			// Redirect returned (not thrown) — convert to a 303 Response.
			if (isRedirect(handlerResult)) {
				return new Response(null, {
					status: handlerResult.status,
					headers: { Location: handlerResult.location },
				});
			}

			const response = handlerResult as Response;
			const responseContentType = response.headers.get("content-type") ?? "";
			// SSE responses are long-lived pub/sub streams — caching the buffered
			// bytes would serve a stale finite snapshot to future subscribers and
			// bypass the handler's subscribe() call entirely. Skip them.
			const isEventStream = responseContentType.toLowerCase().includes("text/event-stream");

			// Respect handler opt-out via Cache-Control. Standard HTTP semantics:
			// no-store / private / no-cache all signal "don't reuse this response".
			const cacheControl = (response.headers.get("cache-control") ?? "").toLowerCase();
			const noStore =
				cacheControl.includes("no-store") ||
				cacheControl.includes("private") ||
				cacheControl.includes("no-cache");

			if (
				apiCacheable &&
				apiCacheKey &&
				response.status === 200 &&
				!isEventStream &&
				!noStore &&
				(cookies as CookieJar).outgoing.length === 0
			) {
				const cloned = response.clone();
				const extraHeaders = captureCacheableHeaders(response.headers);
				const contentType = responseContentType || "application/octet-stream";
				const keyForWrite = apiCacheKey;
				// Hand the gate release to the deferred write: waiters resume only
				// after the cacheSet attempt, so their re-check hits.
				const rel = releaseApiMiss;
				releaseApiMiss = null;
				deferCacheWrite(async () => {
					try {
						const buf = new Uint8Array(await cloned.arrayBuffer());
						// Oversized bodies skip early so they never pay compression;
						// cacheSet re-checks as the authoritative guard.
						if (CACHE_MAX_BODY_BYTES > 0 && buf.length > CACHE_MAX_BODY_BYTES) return;
						const { gzip, brotli } = buildCompressedVariants(buf);
						// API endpoints have no LoaderDeps in v0.6 — invalidation is
						// URL/prefix only. See ROADMAP for deferred tag support.
						cacheSet(
							keyForWrite,
							{
								raw: buf,
								gzip,
								brotli,
								contentType,
								status: 200,
								extraHeaders,
								tags: [],
							},
							cookies,
						);
					} catch {
						/* drop silently — cache population is best-effort */
					} finally {
						rel?.();
					}
				});
			}

			return response;
		} catch (err) {
			// `throw redirect(303, "/")` from a +server.ts handler — turn it into
			// a real 303 instead of a 500. Mirrors the page-action handler below.
			if (isRedirect(err)) {
				return new Response(null, {
					status: err.status,
					headers: { Location: err.location },
				});
			}
			if (isHttpError(err)) {
				return Response.json({ error: err.message }, { status: err.status });
			}
			if (isDev) console.error("API route error:", err);
			else console.error("API route error:", (err as Error).message ?? err);
			if (isDev) reportDevErrorFromCatch(err);
			if (isDev) {
				const detail = err instanceof Error ? (err.stack ?? err.message) : String(err);
				return dev500WithPlugins({
					request,
					url,
					message: "Internal Server Error",
					detail,
				});
			}
			return Response.json({ error: "Internal Server Error" }, { status: 500 });
		} finally {
			releaseApiMiss?.();
		}
	}

	// Static files — fallthrough after API routes so explicit handlers win.
	// handleRequest already served hits before the hooks; this answers a URL a
	// hook rewrote, and the 404 for a miss (without looking a second time).
	if (isStaticPath(path)) {
		const parked = routeMatches.get(request);
		const missed = parked?.staticMiss && parked.path === path;
		return (
			(missed ? null : await serveStaticFile(path, request)) ??
			new Response("Not Found", { status: 404 })
		);
	}

	// Prerendered pages — serve static HTML built at build time.
	// SKIP in dev: prerender runs with NODE_ENV=production, which disables the
	// inspector plugin and the dev-only error pipeline. Serving its output back
	// in dev would mask errors (the badge stays empty, the SSE reload script
	// isn't injected, and the page can't auto-recover when the source is fixed).
	// Live SSR every request in dev so /about behaves like every other route.
	if (prerenderManifest) {
		// Keys come from a boot-time walk of `dist/prerendered/`, not from the
		// URL, so no safePath needed — a non-matching path is just a miss.
		const key = path === "/" ? "/" : path.replace(/\/$/, "");
		const hit = prerenderManifest.get(key);
		if (hit) {
			// Stylesheets only: whether this page hydrates isn't known here, and a
			// hint for a script it never runs is a wasted download.
			const link = preloadLinkHeader(undefined, false);
			return serveStatic(hit, request, {
				"Content-Type": "text/html; charset=utf-8",
				"Cache-Control": "public, max-age=3600",
				...(link ? { Link: link } : {}),
			});
		}
	}

	// Matched once before the hooks; reused for trailing-slash, form-action, and SSR phases.
	const pageMatch = routes.page;

	// Trailing-slash canonicalization — 308 preserves method (form POSTs included)
	if (pageMatch) {
		const canonical = canonicalPathname(path, (pageMatch.route as any).trailingSlash ?? "never");
		if (canonical !== null) {
			return new Response(null, {
				status: 308,
				// `path` is app-space — the base came off at the top of handleRequest.
				// This Location goes back to the browser, so it has to be put back on,
				// or a `trailingSlash: "always"` route 308s every request off the mount.
				headers: { Location: withBase(currentBase(), canonical) + url.search + url.hash },
			});
		}
	}

	// Form actions — POST to page routes with `actions` export
	if (method === "POST") {
		if (pageMatch?.route.pageServer) {
			// `use:enhance` sets this header — return JSON instead of re-rendering HTML
			const isEnhanced = request.headers.get("x-bosia-action") === "1";

			try {
				const mod = await pageMatch.route.pageServer();
				if (mod.actions && typeof mod.actions === "object") {
					// Layout loaders gate route groups (`(private)/+layout.server.ts`
					// redirecting anonymous visitors), so they run before any action:
					// a POST must not reach code the same visitor could not GET.
					// Their data is discarded; a redirect or error() they throw is
					// handled by the catch below exactly like one from the action.
					await loadRouteData(url, locals, request, cookies, null, pageMatch, {
						page: false,
						layouts: [],
					});
					const actionName = parseActionName(url);
					const action = mod.actions[actionName];
					if (!action) {
						if (isEnhanced) {
							return Response.json(
								{
									type: "error",
									status: 404,
									message: `Action "${actionName}" not found`,
								},
								{ status: 404 },
							);
						}
						return renderErrorPage(
							404,
							`Action "${actionName}" not found`,
							url,
							request,
							undefined,
							undefined,
							undefined,
							undefined,
							locals.nonce,
						);
					}

					event.params = pageMatch.params;
					event.route = { id: pageMatch.route.id };
					let result: any;
					try {
						result = await action(event);
					} catch (err) {
						if (isRedirect(err)) {
							if (isEnhanced) {
								return Response.json({
									type: "redirect",
									status: 303,
									location: err.location,
								});
							}
							return new Response(null, {
								status: 303,
								headers: { Location: err.location },
							});
						}
						if (isHttpError(err)) {
							if (isEnhanced) {
								return Response.json(
									{ type: "error", status: err.status, message: err.message },
									{ status: err.status },
								);
							}
							return renderErrorPage(
								err.status,
								err.message,
								url,
								request,
								undefined,
								undefined,
								undefined,
								undefined,
								locals.nonce,
							);
						}
						throw err;
					}

					// Redirect returned (not thrown)
					if (isRedirect(result)) {
						if (isEnhanced) {
							return Response.json({
								type: "redirect",
								status: 303,
								location: result.location,
							});
						}
						return new Response(null, {
							status: 303,
							headers: { Location: result.location },
						});
					}

					// ActionFailure — re-render with failure status
					if (result instanceof ActionFailure) {
						if (isEnhanced) {
							return Response.json(
								{ type: "failure", status: result.status, data: result.data },
								{ status: result.status },
							);
						}
						return await renderPageWithFormData(
							url,
							locals,
							request,
							cookies,
							result.data,
							result.status,
							pageMatch,
						);
					}

					// Success — re-render page with action return data
					if (isEnhanced) {
						return Response.json({
							type: "success",
							status: 200,
							data: result ?? null,
						});
					}
					return await renderPageWithFormData(
						url,
						locals,
						request,
						cookies,
						result ?? null,
						200,
						pageMatch,
					);
				}
			} catch (err) {
				if (isRedirect(err)) {
					if (isEnhanced) {
						return Response.json({
							type: "redirect",
							status: 303,
							location: err.location,
						});
					}
					return new Response(null, {
						status: 303,
						headers: { Location: err.location },
					});
				}
				if (isHttpError(err)) {
					if (isEnhanced) {
						return Response.json(
							{ type: "error", status: err.status, message: err.message },
							{ status: err.status },
						);
					}
					return renderErrorPage(err.status, err.message, url, request);
				}
				if (isDev) console.error("Form action error:", err);
				else console.error("Form action error:", (err as Error).message ?? err);
				if (isDev) reportDevErrorFromCatch(err);
				if (isEnhanced) {
					return Response.json(
						{ type: "error", status: 500, message: "Internal Server Error" },
						{ status: 500 },
					);
				}
				if (isDev) {
					const detail = err instanceof Error ? (err.stack ?? err.message) : String(err);
					return dev500WithPlugins({
						request,
						url,
						message: "Internal Server Error",
						detail,
					});
				}
				return Response.json({ error: "Internal Server Error" }, { status: 500 });
			}
		}
	}

	// SSR pages (+page.svelte) — streaming by default
	const streamResponse = await renderSSRStream(url, locals, request, cookies, pageMatch);
	if (!streamResponse)
		return renderErrorPage(
			404,
			"Not Found",
			url,
			request,
			undefined,
			undefined,
			undefined,
			undefined,
			locals.nonce,
		);
	return streamResponse;
}

// ─── Request Entry ────────────────────────────────────────

// Set DISABLE_X_FRAME_OPTIONS=true to omit `X-Frame-Options: SAMEORIGIN`.
// Useful when the app is intentionally embedded as an iframe by a different origin
// (preview/proxy hubs, design tools, etc.). Other security headers stay on.
const _xfoDisabled = process.env.DISABLE_X_FRAME_OPTIONS === "true";

// Trust `x-forwarded-proto` header behind a TLS-terminating proxy when computing
// per-request HTTPS-ness (drives `Secure` cookie flag). Off by default — the
// header is spoofable from any client that talks directly to the app.
const TRUST_PROXY = process.env.TRUST_PROXY === "true";

const SECURITY_HEADERS: Record<string, string> = {
	"X-Content-Type-Options": "nosniff",
	...(_xfoDisabled ? {} : { "X-Frame-Options": "SAMEORIGIN" }),
	"Referrer-Policy": "strict-origin-when-cross-origin",
};

if (_xfoDisabled) {
	console.log("🪟  X-Frame-Options disabled (DISABLE_X_FRAME_OPTIONS=true)");
}

async function handleRequest(request: Request, url: URL): Promise<Response> {
	// Behind a trusted proxy the inbound `Host`/scheme is the proxy's inner hop
	// (e.g. `localhost:PORT` over plain HTTP), so `url` built from `request.url`
	// misreports the public origin. Rebuild it from `X-Forwarded-Host`/`-Proto`
	// so `event.url` — and every absolute redirect, canonical URL, and
	// `url.origin` the app derives — points at the public-facing origin instead
	// of localhost. Gated on TRUST_PROXY since these headers are client-spoofable
	// when no proxy strips them.
	if (TRUST_PROXY) {
		const fwdHost = request.headers.get("x-forwarded-host");
		if (fwdHost) url.host = fwdHost;
		const fwdProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
		if (fwdProto) url.protocol = `${fwdProto}:`;
	}

	// Mounted under BASE_PATH? Everything downstream — hooks, the router, the
	// /_health and /__bosia tests below — works in app space, so the prefix comes
	// off exactly once, here, before anything reads a pathname. A request that is
	// not under the base was never this app's to answer.
	const base = currentBase();
	if (base) {
		const appPath = stripBase(base, url.pathname);
		if (appPath === null) return new Response("Not Found", { status: 404 });
		url.pathname = appPath;
	}

	// Bun.serve enforces maxRequestBodySize itself; Workers has no such knob, so
	// check the declared length here. A chunked upload without Content-Length
	// falls back to the host's own request cap (Cloudflare: 100MB on free).
	if (BODY_SIZE_LIMIT > 0 && Number(request.headers.get("content-length")) > BODY_SIZE_LIMIT) {
		return new Response("Payload Too Large", { status: 413 });
	}

	// Reject new non-health requests during shutdown
	if (shuttingDown && url.pathname !== "/_health") {
		return new Response("Service Unavailable", {
			status: 503,
			headers: { "Retry-After": "5" },
		});
	}

	// Shed load above MAX_INFLIGHT. Checked before any work so the 503 is
	// cheap. /_health stays available so the orchestrator can still tell the
	// process is alive (and decide whether to restart or scale out).
	if (inFlight >= MAX_INFLIGHT && url.pathname !== "/_health") {
		return new Response("Service Unavailable", {
			status: 503,
			headers: { "Retry-After": "1" },
		});
	}

	inFlight++;
	// Hoisted so the catch below can tell a data request from a page request and
	// reuse the same nonce when it renders an error page.
	let dataReq: DataRequest | null = null;
	let nonce = "";
	let cookieJar: CookieJar | null = null;
	try {
		// Handle CORS preflight before CSRF check (OPTIONS is CSRF-exempt)
		if (CORS_CONFIG && request.method === "OPTIONS") {
			const preflight = handlePreflight(request, CORS_CONFIG);
			if (preflight) return preflight;
		}

		const csrfError = checkCsrf(request, url, CSRF_CONFIG);
		if (csrfError) {
			console.warn(`[CSRF] Blocked request: ${csrfError}`);
			return Response.json({ error: "Forbidden", message: csrfError }, { status: 403 });
		}

		const isHttps =
			(TRUST_PROXY && request.headers.get("x-forwarded-proto") === "https") ||
			url.protocol === "https:";
		cookieJar = new CookieJar(request.headers.get("cookie") ?? "", isHttps);
		nonce = CSP_ENABLED ? generateNonce() : "";

		// Decode the data endpoint before the hooks, not inside resolve(): a guard
		// runs *before* `await resolve(event)`, so a rewrite in there reaches
		// logging middleware and never reaches the check that gates the route.
		const parsed = parseDataRequest(url);
		if (parsed === "invalid") {
			return Response.json({ error: "Invalid path", status: 400 }, { status: 400 });
		}
		dataReq = parsed;
		if (dataReq) dataRequests.set(request, dataReq);

		const event: RequestEvent = {
			request,
			url: dataReq ? dataReq.routeUrl : url,
			locals: { nonce },
			params: {},
			route: { id: null },
			cookies: cookieJar,
			isDataRequest: dataReq !== null,
			platform: getPlatform(),
		};

		// Static files are answered before the hooks: a session-lookup hook would
		// otherwise cost a DB query per chunk. A miss falls through to the hooks
		// and resolve(), which 404s. Prerendered pages are pages and stay behind
		// the hooks. Order mirrors resolve(): framework prefixes first (prod only,
		// unshadowable), then a user `+server.ts` wins over a same-path file.
		const path = event.url.pathname;
		let response: Response | null = null;
		let staticTried = false;
		if (!dataReq && staticManifest && (path.startsWith("/dist/") || path.startsWith("/__bosia/"))) {
			response = await serveStaticFile(path, request);
			staticTried = true;
		}
		if (!response) {
			const routes = await matchRoutes(path, dataReq !== null);
			routeMatches.set(request, routes);
			const matched = routes.api ?? routes.page;
			if (matched) {
				event.params = matched.params;
				event.route = { id: matched.route.id };
			}
			if (!dataReq && !routes.api && isStaticPath(path)) {
				if (!staticTried) response = await serveStaticFile(path, request);
				routes.staticMiss = !response;
			}
		}
		response ??=
			userHandle && !warmingUp ? await userHandle({ event, resolve }) : await resolve(event);

		// A hook that short-circuits a data request with a redirect is answering
		// the client router, which speaks JSON — an unconverted 3xx is followed by
		// `fetch` and the router receives the redirect target's HTML instead.
		// `Location` is copied verbatim: `redirect()` already rebased it through
		// `withBase()`, and a raw `Response.redirect` under a BASE_PATH carries the
		// base by hand, so rebasing here would double the prefix on both.
		if (dataReq && response.status >= 300 && response.status < 400) {
			const location = response.headers.get("location");
			if (location) {
				const carried = new Headers(response.headers);
				carried.delete("location");
				carried.delete("content-type");
				carried.delete("content-length");
				carried.delete("content-encoding");
				carried.set("content-type", "application/json");
				response = new Response(JSON.stringify({ redirect: location, status: response.status }), {
					status: 200,
					headers: carried,
				});
			}
		}

		// Set on the response itself when its headers are mutable, which every
		// Response the framework builds has. Copying them and rebuilding the
		// Response cost a Headers copy plus a body re-wrap on every request.
		// Responses with immutable headers (`fetch()`, `Response.redirect()`)
		// still get the copy.
		// On Workers (compressionOn is false only there) an already-encoded body
		// is rebuilt as before, since the rebuild is what marks it PRECOMPRESSED.
		let mutable: Headers | null = null;
		if (compressionOn || !response.headers.has("content-encoding")) {
			try {
				response.headers.set("X-Content-Type-Options", SECURITY_HEADERS["X-Content-Type-Options"]!);
				mutable = response.headers;
			} catch {
				// immutable — copied below
			}
		}
		const inPlace = mutable !== null;
		const headers = mutable ?? new Headers(response.headers);
		// A handle can mark a response (e.g. a proxied embeddable preview) to opt
		// out of the frame guard. Strip the internal marker so it never ships, and
		// skip only X-Frame-Options for that response — other security headers stay.
		const skipFrameGuard = headers.has(NO_FRAME_GUARD_HEADER);
		headers.delete(NO_FRAME_GUARD_HEADER);
		for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
			if (skipFrameGuard && k === "X-Frame-Options") continue;
			headers.set(k, v);
		}
		const cspHeader = buildCspHeader(nonce);
		if (cspHeader) headers.set("Content-Security-Policy", cspHeader);
		// Apply CORS headers for allowed origins. `Vary: Origin` is set whenever
		// CORS is configured — even on responses to non-allowed origins — so
		// downstream caches (CDNs, browser HTTP cache) key on the Origin header
		// instead of serving an Access-Control-Allow-Origin response across origins.
		if (CORS_CONFIG) {
			applyCorsVary(headers);
			const corsHeaders = getCorsHeaders(request, CORS_CONFIG);
			if (corsHeaders) {
				for (const [k, v] of Object.entries(corsHeaders)) headers.set(k, v);
			}
		}
		// Apply any Set-Cookie headers accumulated during the request
		for (const cookie of cookieJar.outgoing) headers.append("Set-Cookie", cookie);
		if (inPlace) return response;
		return new Response(response.body, {
			// A Content-Encoding here means the body is already compressed (cache
			// hit, compress()); rebuilding drops that flag and Workers would
			// compress it again.
			...(headers.has("content-encoding") ? PRECOMPRESSED : {}),
			status: response.status,
			statusText: response.statusText,
			headers,
		});
	} catch (err) {
		// `throw redirect()` / `throw error()` from a hook lands here — the same
		// escape hatch loaders have always had. Without these branches both fall
		// through to the 500 below, which is why the docs could only ever suggest
		// returning a raw `Response.redirect`.
		if (isRedirect(err) || isHttpError(err)) {
			const out = isRedirect(err)
				? dataReq
					? // Shape-identical to the loader conversion below, so the
						// router has one payload contract regardless of who redirected.
						Response.json({ redirect: err.location, status: err.status })
					: // Not Response.redirect(): it rejects relative URLs on Workers.
						new Response(null, { status: err.status, headers: { Location: err.location } })
				: dataReq
					? Response.json(
							{
								error: { status: err.status, message: err.message },
								errorDepth: null,
								errorOrigin: null,
							},
							{ status: err.status },
						)
					: await renderErrorPage(
							err.status,
							err.message,
							url,
							request,
							undefined,
							undefined,
							undefined,
							undefined,
							nonce,
						);
			// A hook that expires the session before throwing must not lose the
			// Set-Cookie that does it — the redirect above is a fresh Response,
			// so the jar is re-applied by hand here.
			if (cookieJar) {
				for (const cookie of cookieJar.outgoing) out.headers.append("Set-Cookie", cookie);
			}
			return out;
		}
		if (isDev) console.error("Unhandled request error:", err);
		else console.error("Unhandled request error:", (err as Error).message ?? err);
		if (isDev) reportDevErrorFromCatch(err);
		if (isDev) {
			const detail = err instanceof Error ? (err.stack ?? err.message) : String(err);
			return dev500WithPlugins({
				request,
				url,
				status: 500,
				message: "Internal Server Error",
				detail,
			});
		}
		return Response.json({ error: "Internal Server Error" }, { status: 500 });
	} finally {
		inFlight--;
		if (shuttingDown && inFlight === 0 && drainResolve) {
			drainResolve();
		}
	}
}

// ─── CORS Max Age ─────────────────────────────────────────

function parseCorsMaxAge(value?: string): number | undefined {
	if (!value) return undefined;
	if (!/^\d+$/.test(value)) {
		throw new Error(`Invalid CORS_MAX_AGE: "${value}" — must be a non-negative integer (seconds)`);
	}
	const n = parseInt(value, 10);
	if (!Number.isFinite(n) || n > Number.MAX_SAFE_INTEGER) {
		throw new Error(`Invalid CORS_MAX_AGE: "${value}" — must be a non-negative integer (seconds)`);
	}
	return n;
}

// ─── Body Size Limit ──────────────────────────────────────
// Parsed once at startup from BODY_SIZE_LIMIT env var.
// Format: "512K", "1M", "1G", plain bytes, or "Infinity".
// Default: 512K (matches SvelteKit).

function parseBodySizeLimit(value?: string): number {
	if (!value) return 512 * 1024;
	if (value === "Infinity") return 0; // Bun: 0 = no limit
	const match = value.match(/^(\d+(?:\.\d+)?)\s*([KMG]?)$/i);
	if (!match) throw new Error(`Invalid BODY_SIZE_LIMIT: "${value}"`);
	const num = parseFloat(match[1]);
	const unit = match[2].toUpperCase();
	if (unit === "K") return Math.floor(num * 1024);
	if (unit === "M") return Math.floor(num * 1024 * 1024);
	if (unit === "G") return Math.floor(num * 1024 * 1024 * 1024);
	return Math.floor(num);
}

const BODY_SIZE_LIMIT = parseBodySizeLimit(process.env.BODY_SIZE_LIMIT);

if (BODY_SIZE_LIMIT === 0) {
	console.log("📦 Body size limit: none");
} else {
	console.log(`📦 Body size limit: ${BODY_SIZE_LIMIT} bytes`);
}

// ─── Idle Timeout ─────────────────────────────────────────
// Parsed once at startup from IDLE_TIMEOUT env var.
// Integer seconds; Bun caps it at 255. Default: 10 (Bun's default).
// Raise when API routes hold streaming responses with long gaps
// between chunks (e.g. AI tool calls that shell out and wait).

function parseIdleTimeout(value?: string): number {
	if (!value) return 10;
	const n = parseInt(value, 10);
	if (!Number.isFinite(n) || n < 0) throw new Error(`Invalid IDLE_TIMEOUT: "${value}"`);
	if (n > 255) throw new Error(`Invalid IDLE_TIMEOUT: "${value}" (max 255)`);
	return n;
}

const IDLE_TIMEOUT = parseIdleTimeout(process.env.IDLE_TIMEOUT);

console.log(`⏱  Idle timeout: ${IDLE_TIMEOUT}s`);

// ─── Concurrency Ceiling ──────────────────────────────────
// Soft cap on in-flight requests, parsed from MAX_INFLIGHT env var.
// Default is unlimited so existing apps see no behavior change. When set,
// requests above the cap get a fast 503 + Retry-After before any work is
// done — protects single-replica container deploys from OOM under spike
// traffic. /_health is exempt so orchestrator liveness probes still work
// while the app sheds load.

function parseMaxInflight(value?: string): number {
	if (!value) return Infinity;
	const trimmed = value.trim();
	if (trimmed === "" || trimmed.toLowerCase() === "infinity") return Infinity;
	const n = parseInt(trimmed, 10);
	if (!Number.isFinite(n) || n <= 0) throw new Error(`Invalid MAX_INFLIGHT: "${value}"`);
	return n;
}

const MAX_INFLIGHT = parseMaxInflight(process.env.MAX_INFLIGHT);

if (Number.isFinite(MAX_INFLIGHT)) {
	console.log(`🚦 Max in-flight requests: ${MAX_INFLIGHT}`);
}

// ─── Graceful Shutdown State ──────────────────────────────
// Drained by the Bun entry on SIGTERM/SIGINT. Never set on Workers, where an
// isolate has no shutdown to announce.

let shuttingDown = false;
let inFlight = 0;
let drainResolve: (() => void) | null = null;

/** Stop taking new requests; resolves once in-flight ones have finished. */
export function beginShutdown(): Promise<void> {
	shuttingDown = true;
	if (inFlight === 0) return Promise.resolve();
	return new Promise<void>((r) => {
		drainResolve = r;
	});
}

export function inFlightCount(): number {
	return inFlight;
}

// ─── Backend App ──────────────────────────────────────────

// Read the build-time route manifest so plugins.backend.after can introspect routes.
function loadBuiltManifest(): RouteManifest {
	const built = readArtifact<RouteManifest>("route-manifest.json");
	if (built) return built;
	// Fallback: synthesize from runtime arrays (no file paths, just patterns).
	return {
		pages: serverRoutes.map((r: any) => ({
			pattern: r.pattern,
			id: r.id,
			page: "",
			layouts: [],
			pageServer: r.pageServer ? "" : null,
			loading: null,
			layoutServers: [],
			errorPages: [],
			trailingSlash: r.trailingSlash,
			cache: r.cache ?? null,
			prerender: false,
		})),
		apis: apiRoutes.map((r: any) => ({ pattern: r.pattern, id: r.id, server: "" })),
		errorPage: null,
	};
}

export type CreateAppOptions = {
	/** `handle` from the user's `src/hooks.server.ts`. */
	handle?: Handle | null;
};

// `url` is BosiaApp's own parse of `request.url`; handleRequest rewrites it in
// place (BASE_PATH, X-Forwarded-*), which is safe because routing already ran.
const frameworkHandler = ({ request, url }: { request: Request; url: URL }) =>
	handleRequest(request, url);

/** Build the backend app: plugins, the framework's catch-all routes, error handling. */
export async function createApp(options: CreateAppOptions = {}): Promise<BosiaApp> {
	userHandle = options.handle ?? null;

	const plugins = await loadPlugins(process.cwd());
	if (plugins.length > 0) {
		console.log(`🔌 Loaded ${plugins.length} plugin(s): ${plugins.map((p) => p.name).join(", ")}`);
	}

	// serve options only apply on Bun (`listen`); Workers calls `fetch` directly.
	let app = new BosiaApp({
		serve: {
			maxRequestBodySize: BODY_SIZE_LIMIT,
			idleTimeout: IDLE_TIMEOUT,
			// SO_REUSEPORT lets a second server silently join the port and the kernel
			// splits traffic between two different builds. Opt in only for deliberate
			// N-worker clustering.
			reusePort: process.env.BOSIA_REUSE_PORT === "1",
		},
	});

	// Plugins.backend.before — runs before framework middleware/routes.
	// Plugin-registered routes here BYPASS the framework (CSRF, hooks, etc.).
	// Plugins register their own `.onError()` handlers here. onError handlers
	// fire in registration order; plugin handlers run first and (when they
	// return undefined) fall through to the base 500 responder chained after this
	// loop. Registering the base responder before the loop would short-circuit
	// every plugin handler.
	for (const plugin of plugins) {
		if (plugin.backend?.before) {
			try {
				app = (await plugin.backend.before(app)) ?? app;
			} catch (err) {
				console.error(`❌ Plugin "${plugin.name}" backend.before failed:`, err);
				throw err;
			}
		}
	}

	// Static files are served by resolve() with path traversal protection and security headers.
	// Only the verbs Bosia answers are routed — anything else (TRACE, …) gets a 405.
	app = app
		.onError(({ error }) => {
			if (isDev) console.error("Uncaught server error:", error);
			else console.error("Uncaught server error:", (error as Error)?.message ?? error);
			return Response.json({ error: "Internal Server Error" }, { status: 500 });
		})
		.get("*", frameworkHandler)
		.post("*", frameworkHandler)
		.put("*", frameworkHandler)
		.patch("*", frameworkHandler)
		.delete("*", frameworkHandler)
		.options("*", frameworkHandler);

	// Plugins.backend.after — runs after framework routes; receives the route manifest.
	for (const plugin of plugins) {
		if (plugin.backend?.after) {
			try {
				app = (await plugin.backend.after(app, { manifest: loadBuiltManifest() })) ?? app;
			} catch (err) {
				console.error(`❌ Plugin "${plugin.name}" backend.after failed:`, err);
				throw err;
			}
		}
	}

	return app;
}
