import { Elysia } from "elysia";

import { existsSync, readFileSync } from "fs";
import { join } from "path";

import { findMatch, compileRoutes, canonicalPathname } from "./matcher.ts";
import { resolveApiMatch } from "./apiResolver.ts";
import { apiRoutes, serverRoutes } from "bosia:routes";
import { loadPlugins } from "./config.ts";
import type { RouteManifest } from "./types.ts";

// Pre-compile route patterns into RegExp at startup (shared by renderer.ts via module reference)
compileRoutes(apiRoutes);
compileRoutes(serverRoutes);
import type { Handle, RequestEvent } from "./hooks.ts";
import { HttpError, Redirect, ActionFailure } from "./errors.ts";
import { CookieJar } from "./cookies.ts";
import { safePath } from "./safePath.ts";
import { checkCsrf } from "./csrf.ts";
import type { CsrfConfig } from "./csrf.ts";
import { applyCorsVary, getCorsHeaders, handlePreflight } from "./cors.ts";
import type { CorsConfig } from "./cors.ts";
import { buildCspHeader, CSP_DIRECTIVES_TEMPLATE, CSP_ENABLED, generateNonce } from "./csp.ts";
import { isDev, compress, isStaticPath } from "./html.ts";
import { dev500WithPlugins } from "./dev-500.ts";
import { OUT_DIR } from "./paths.ts";
import { buildStaticManifest, lookupStatic } from "./staticManifest.ts";
import { dedup, dedupKey } from "./dedup.ts";
import {
	CACHE_ENABLED,
	buildCompressedVariants,
	cacheGet,
	cacheSet,
	computeCacheKey,
	serveCached,
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
// Load src/hooks.server.ts if present. Uses process.cwd() so
// Bun can resolve it at runtime without bundling user code.

let userHandle: Handle | null = null;

const hooksPath = join(process.cwd(), "src", "hooks.server.ts");
if (existsSync(hooksPath)) {
	try {
		const mod = await import(hooksPath);
		if (typeof mod.handle === "function") {
			userHandle = mod.handle as Handle;
			console.log("🪝 Loaded hooks.server.ts");
		}
	} catch (err) {
		console.warn("⚠️  Failed to load hooks.server.ts:", err);
	}
}

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

const CSRF_CONFIG: CsrfConfig = {
	checkOrigin: true,
	allowedOrigins: _csrfAllowedOrigins,
};

if (_csrfAllowedOrigins?.length) {
	console.log(`🛡️  CSRF allowed origins: ${_csrfAllowedOrigins.join(", ")}`);
} else {
	console.log("🛡️  CSRF: same-origin only");
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

// ─── Core Request Resolver ────────────────────────────────
// This is the inner handler that hooks wrap around.

function isValidRoutePath(path: string, origin: string): boolean {
	try {
		return new URL(path, origin).origin === origin;
	} catch {
		return false;
	}
}

/**
 * Decode an `_invalidated` bitmask string. Char 0 = page, char i+1 = layout
 * depth i, '1' = run, '0' = skip. Missing/extra chars default to run.
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

	// Data endpoint — returns server loader data as JSON for client-side navigation
	if (path.startsWith("/__bosia/data/")) {
		const routePathStr =
			path
				.slice("/__bosia/data".length)
				.replace(/\.json$/, "")
				.replace(/^\/index$/, "/") || "/";

		if (!isValidRoutePath(routePathStr, url.origin)) {
			return Response.json({ error: "Invalid path", status: 400 }, { status: 400 });
		}
		const routeUrl = new URL(routePathStr, url.origin);
		let invalidatedBits: string | null = null;
		for (const [key, val] of url.searchParams.entries()) {
			if (key === "_invalidated") {
				invalidatedBits = val;
				continue;
			}
			routeUrl.searchParams.append(key, val);
		}
		// Rewrite event.url so logging middleware sees the real page path, not /__bosia/data
		event.url = routeUrl;
		try {
			const pageMatch = findMatch(serverRoutes, routeUrl.pathname);
			// Build mask from `?_invalidated=<bits>` where char 0 = page,
			// char i+1 = layout depth i, '1' = run, '0' = skip. Absent → run all.
			// Mask is sized to the total layout count (matching client `layoutIds`),
			// not the count of layout servers, so depths without a server loader
			// still occupy a bit position and stay aligned with the client.
			const mask = invalidatedBits
				? buildMaskFromBits(
						invalidatedBits,
						pageMatch?.route
							? ((pageMatch.route as any).layoutModules?.length ?? 0)
							: 0,
					)
				: undefined;
			const runLoad = async () => {
				const data = await loadRouteData(
					routeUrl,
					locals,
					request,
					cookies,
					null,
					pageMatch,
					mask,
				);

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
						if (meta) metadata = { title: meta.title, description: meta.description };
					} catch {
						/* non-fatal */
					}
				}

				return { data, metadata, cookiesAccessed: (cookies as CookieJar).accessed };
			};

			// Dedup public routes by URL + mask. `(private)` scope routes (per-user
			// content) skip the cache to prevent cross-user data leaks. The mask is
			// part of the key so concurrent requests for the same URL with different
			// invalidation patterns don't collapse onto each other. See dedup.ts.
			const dedupK = invalidatedBits
				? `${dedupKey(routeUrl)}|m=${invalidatedBits}`
				: dedupKey(routeUrl);
			const result =
				pageMatch?.route.scope === "private"
					? await runLoad()
					: await dedup(dedupK, runLoad);

			const cookiesWereAccessed = (cookies as CookieJar).accessed || result.cookiesAccessed;
			const cc = cookiesWereAccessed
				? "private, no-cache"
				: "public, max-age=0, must-revalidate";

			if (!result.data) {
				return compress(
					JSON.stringify({ pageData: {}, layoutData: [] }),
					"application/json",
					request,
					200,
					{ "Cache-Control": cc },
				);
			}
			return compress(
				JSON.stringify({ ...result.data, metadata: result.metadata }),
				"application/json",
				request,
				200,
				{ "Cache-Control": cc },
			);
		} catch (err) {
			if (err instanceof Redirect) {
				return compress(
					JSON.stringify({ redirect: err.location, status: err.status }),
					"application/json",
					request,
				);
			}
			if (err instanceof HttpError) {
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
		}
	}

	// Static files
	if (isStaticPath(path)) {
		// Prod fast path: single Map lookup, no per-request stat calls.
		if (staticManifest) {
			const hit = lookupStatic(staticManifest, path);
			if (hit) {
				return new Response(
					Bun.file(hit.absPath),
					hit.cacheControl
						? { headers: { "Cache-Control": hit.cacheControl } }
						: undefined,
				);
			}
			return new Response("Not Found", { status: 404 });
		}
		// Dev: keep the per-request fallthrough so files dropped into `public/`
		// mid-session are served without a restart.
		if (path.startsWith("/dist/client/")) {
			const resolved = safePath(
				`${OUT_DIR}/client`,
				path.split("?")[0].slice("/dist/client".length),
			);
			if (resolved) {
				const file = Bun.file(resolved);
				if (await file.exists()) {
					return new Response(file, { headers: { "Cache-Control": "no-cache" } });
				}
			}
			return new Response("Not Found", { status: 404 });
		}
		const pubPath = safePath("./public", path);
		if (pubPath) {
			const pub = Bun.file(pubPath);
			if (await pub.exists()) return new Response(pub);
		}
		const distPath = safePath(OUT_DIR, path);
		if (distPath) {
			const dist = Bun.file(distPath);
			if (await dist.exists()) return new Response(dist);
		}
		const staticPath = safePath(`${OUT_DIR}/static`, path);
		if (staticPath) {
			const staticFile = Bun.file(staticPath);
			if (await staticFile.exists()) return new Response(staticFile);
		}
		return new Response("Not Found", { status: 404 });
	}

	// Prerendered pages — serve static HTML built at build time.
	// SKIP in dev: prerender runs with NODE_ENV=production, which disables the
	// inspector plugin and the dev-only error pipeline. Serving its output back
	// in dev would mask errors (the badge stays empty, the SSE reload script
	// isn't injected, and the page can't auto-recover when the source is fixed).
	// Live SSR every request in dev so /about behaves like every other route.
	if (!isDev) {
		// Try both `<path>/index.html` (always/ignore mode) and `<path>.html` (never mode)
		const prerenderCandidates =
			path === "/"
				? ["index.html"]
				: [`${path}/index.html`, `${path.replace(/\/$/, "")}.html`];
		for (const candidate of prerenderCandidates) {
			const prerenderPath = safePath(`${OUT_DIR}/prerendered`, candidate);
			if (!prerenderPath) continue;
			const prerenderFile = Bun.file(prerenderPath);
			if (await prerenderFile.exists()) {
				return new Response(prerenderFile, {
					headers: {
						"Content-Type": "text/html; charset=utf-8",
						"Cache-Control": "public, max-age=3600",
					},
				});
			}
		}
	}

	// API routes (+server.ts) — resolve with `.json` alias preference.
	const apiMatch = await resolveApiMatch(apiRoutes, path);
	if (apiMatch) {
		try {
			const mod = await apiMatch.route.module();
			const handler = mod[method];

			if (!handler) {
				const allowed = Object.keys(mod)
					.filter((k) => /^[A-Z]+$/.test(k))
					.join(", ");
				return Response.json(
					{ error: `Method ${method} not allowed` },
					{ status: 405, headers: { Allow: allowed } },
				);
			}

			event.params = apiMatch.params;

			// ── Response cache for +server.ts GET handlers ──
			// CSP is skipped because cached responses would ship with a stale
			// nonce (see renderer.ts for the same gate). The cache key includes
			// URL + identity so per-user responses stay isolated.
			const apiCacheable =
				CACHE_ENABLED && !CSP_ENABLED && (mod as any).cache !== false && method === "GET";
			let apiCacheKey: string | null = null;
			if (apiCacheable) {
				apiCacheKey = computeCacheKey(url, request, cookies);
				if (!url.searchParams.has("_invalidated")) {
					const hit = cacheGet(apiCacheKey);
					if (hit) return serveCached(hit, request);
				}
			}

			const response = await handler({
				request,
				params: apiMatch.params,
				url,
				locals,
				cookies,
			});

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
				queueMicrotask(async () => {
					try {
						const buf = new Uint8Array(await cloned.arrayBuffer());
						const { gzip, brotli } = buildCompressedVariants(buf);
						// API endpoints have no LoaderDeps in v0.6 — invalidation is
						// URL/prefix only. See ROADMAP for deferred tag support.
						cacheSet(keyForWrite, {
							raw: buf,
							gzip,
							brotli,
							contentType,
							status: 200,
							extraHeaders,
							tags: [],
						});
					} catch {
						/* drop silently — cache population is best-effort */
					}
				});
			}

			return response;
		} catch (err) {
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
		}
	}

	// Resolve the page route once; reuse for trailing-slash, form-action, and SSR phases.
	const pageMatch = findMatch(serverRoutes, path);

	// Trailing-slash canonicalization — 308 preserves method (form POSTs included)
	if (pageMatch) {
		const canonical = canonicalPathname(
			path,
			(pageMatch.route as any).trailingSlash ?? "never",
		);
		if (canonical !== null) {
			return new Response(null, {
				status: 308,
				headers: { Location: canonical + url.search + url.hash },
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
					let result: any;
					try {
						result = await action(event);
					} catch (err) {
						if (err instanceof Redirect) {
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
						if (err instanceof HttpError) {
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
					if (result instanceof Redirect) {
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
				if (err instanceof Redirect) {
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
				if (err instanceof HttpError) {
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
		const cookieJar = new CookieJar(request.headers.get("cookie") ?? "", isHttps);
		const nonce = CSP_ENABLED ? generateNonce() : "";
		const event: RequestEvent = {
			request,
			url,
			locals: { nonce },
			params: {},
			cookies: cookieJar,
		};
		const response = userHandle ? await userHandle({ event, resolve }) : await resolve(event);

		const headers = new Headers(response.headers);
		for (const [k, v] of Object.entries(SECURITY_HEADERS)) headers.set(k, v);
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
		return new Response(response.body, {
			status: response.status,
			statusText: response.statusText,
			headers,
		});
	} catch (err) {
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
		throw new Error(
			`Invalid CORS_MAX_AGE: "${value}" — must be a non-negative integer (seconds)`,
		);
	}
	const n = parseInt(value, 10);
	if (!Number.isFinite(n) || n > Number.MAX_SAFE_INTEGER) {
		throw new Error(
			`Invalid CORS_MAX_AGE: "${value}" — must be a non-negative integer (seconds)`,
		);
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

let shuttingDown = false;
let inFlight = 0;
let drainResolve: (() => void) | null = null;

// ─── Plugin Loading ───────────────────────────────────────

const plugins = await loadPlugins(process.cwd());
if (plugins.length > 0) {
	console.log(`🔌 Loaded ${plugins.length} plugin(s): ${plugins.map((p) => p.name).join(", ")}`);
}

// Read the build-time route manifest so plugins.backend.after can introspect routes.
function loadBuiltManifest(): RouteManifest {
	const path = `${OUT_DIR}/route-manifest.json`;
	if (existsSync(path)) {
		try {
			return JSON.parse(readFileSync(path, "utf-8"));
		} catch {}
	}
	// Fallback: synthesize from runtime arrays (no file paths, just patterns).
	return {
		pages: serverRoutes.map((r: any) => ({
			pattern: r.pattern,
			page: "",
			layouts: [],
			pageServer: r.pageServer ? "" : null,
			layoutServers: [],
			errorPages: [],
			trailingSlash: r.trailingSlash,
			scope: r.scope,
		})),
		apis: apiRoutes.map((r: any) => ({ pattern: r.pattern, server: "" })),
		errorPage: null,
	};
}

const routeManifest = loadBuiltManifest();

// ─── Elysia App ───────────────────────────────────────────

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : isDev ? 9001 : 9000;

// Elysia's chained generics drift when plugins add routes — track the app as a
// loose `Elysia` so plugin-extended types stay assignable.
let app: Elysia = new Elysia({
	serve: { maxRequestBodySize: BODY_SIZE_LIMIT, idleTimeout: IDLE_TIMEOUT },
}) as unknown as Elysia;

// Plugins.backend.before — runs before framework middleware/routes.
// Plugin-registered routes here BYPASS the framework (CSRF, hooks, etc.).
// Plugins register their own `.onError()` handlers here. Elysia fires onError
// handlers in registration order; plugin handlers run first and (when they
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

app = app.onError(({ error }) => {
	if (isDev) console.error("Uncaught server error:", error);
	else console.error("Uncaught server error:", (error as Error)?.message ?? error);
	return Response.json({ error: "Internal Server Error" }, { status: 500 });
}) as unknown as Elysia;

app = app
	// Static files are served by resolve() with path traversal protection and security headers
	// SSR pages
	.get("*", ({ request }: { request: Request }) => {
		const url = new URL(request.url);
		return handleRequest(request, url);
	})
	// Non-GET catch-alls route every method through handleRequest()
	.post("*", ({ request }: { request: Request }) => {
		const url = new URL(request.url);
		return handleRequest(request, url);
	})
	.put("*", ({ request }: { request: Request }) => {
		const url = new URL(request.url);
		return handleRequest(request, url);
	})
	.patch("*", ({ request }: { request: Request }) => {
		const url = new URL(request.url);
		return handleRequest(request, url);
	})
	.delete("*", ({ request }: { request: Request }) => {
		const url = new URL(request.url);
		return handleRequest(request, url);
	})
	.options("*", ({ request }: { request: Request }) => {
		const url = new URL(request.url);
		return handleRequest(request, url);
	}) as unknown as Elysia;

// Plugins.backend.after — runs after framework routes; receives the route manifest.
for (const plugin of plugins) {
	if (plugin.backend?.after) {
		try {
			app = (await plugin.backend.after(app, { manifest: routeManifest })) ?? app;
		} catch (err) {
			console.error(`❌ Plugin "${plugin.name}" backend.after failed:`, err);
			throw err;
		}
	}
}

app.listen(PORT, () => {
	// In dev mode the proxy owns the user-facing port — don't print the internal port
	if (!isDev) console.log(`⬡ Bosia server running at http://localhost:${PORT}`);
});

async function shutdown() {
	if (shuttingDown) return;
	shuttingDown = true;
	console.log("⏳ Shutting down — draining in-flight requests...");

	if (inFlight > 0) {
		await Promise.race([
			new Promise<void>((r) => {
				drainResolve = r;
			}),
			Bun.sleep(10_000),
		]);
	}

	if (inFlight > 0) {
		console.warn(`⚠️  Force shutdown with ${inFlight} request(s) still in flight`);
	} else {
		console.log("✅ All requests drained");
	}

	app.stop(true).then(() => process.exit(0));
	setTimeout(() => process.exit(1), 2_000);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

// Prod-only fatal handlers. The dev inspector plugin installs its own
// uncaughtException/unhandledRejection listeners that route errors into the
// overlay and let the dev runner's crash-backoff restart the process. In prod
// there's no inspector — without these handlers an unhandled rejection from a
// background timer or plugin hook orphans the process with no log context.
// Log + exit(1) lets the orchestrator (Podman/k8s) restart cleanly.
if (!isDev) {
	process.on("uncaughtException", (err: Error) => {
		console.error("[FATAL] uncaughtException:", err?.stack ?? err);
		process.exit(1);
	});
	process.on("unhandledRejection", (reason: unknown) => {
		const e = reason as Error | undefined;
		console.error("[FATAL] unhandledRejection:", e?.stack ?? reason);
		process.exit(1);
	});
}

export { app };
