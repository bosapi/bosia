import { Elysia } from "elysia";

import { existsSync, readFileSync } from "fs";
import { join } from "path";

import { findMatch, compileRoutes, canonicalPathname } from "./matcher.ts";
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
import { dedup, dedupKey } from "./dedup.ts";
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
			return Response.json({ error: "Internal Server Error" }, { status: 500 });
		}
	}

	// Static files
	if (isStaticPath(path)) {
		// dist/client: serve with cache headers based on whether filename is hashed
		if (path.startsWith("/dist/client/")) {
			const resolved = safePath(
				"./dist/client",
				path.split("?")[0].slice("/dist/client".length),
			);
			if (resolved) {
				const file = Bun.file(resolved);
				if (await file.exists()) {
					const filename = path.split("/").pop() ?? "";
					const isHashed = /\-[a-z0-9]{8,}\.[a-z]+$/.test(filename);
					const cacheControl =
						!isDev && isHashed ? "public, max-age=31536000, immutable" : "no-cache";
					return new Response(file, { headers: { "Cache-Control": cacheControl } });
				}
			}
			return new Response("Not Found", { status: 404 });
		}
		const pubPath = safePath("./public", path);
		if (pubPath) {
			const pub = Bun.file(pubPath);
			if (await pub.exists()) return new Response(pub);
		}
		const distPath = safePath("./dist", path);
		if (distPath) {
			const dist = Bun.file(distPath);
			if (await dist.exists()) return new Response(dist);
		}
		const staticPath = safePath("./dist/static", path);
		if (staticPath) {
			const staticFile = Bun.file(staticPath);
			if (await staticFile.exists()) return new Response(staticFile);
		}
		return new Response("Not Found", { status: 404 });
	}

	// Prerendered pages — serve static HTML built at build time
	// Try both `<path>/index.html` (always/ignore mode) and `<path>.html` (never mode)
	const prerenderCandidates =
		path === "/" ? ["index.html"] : [`${path}/index.html`, `${path.replace(/\/$/, "")}.html`];
	for (const candidate of prerenderCandidates) {
		const prerenderPath = safePath("./dist/prerendered", candidate);
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

	// API routes (+server.ts)
	const apiMatch = findMatch(apiRoutes, path);
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
			return await handler({ request, params: apiMatch.params, url, locals, cookies });
		} catch (err) {
			if (isDev) console.error("API route error:", err);
			else console.error("API route error:", (err as Error).message ?? err);
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
				if (isEnhanced) {
					return Response.json(
						{ type: "error", status: 500, message: "Internal Server Error" },
						{ status: 500 },
					);
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

		const cookieJar = new CookieJar(request.headers.get("cookie") ?? "", isDev);
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
	const path = "./dist/route-manifest.json";
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
let app: Elysia = new Elysia({ serve: { maxRequestBodySize: BODY_SIZE_LIMIT } }).onError(
	({ error }) => {
		if (isDev) console.error("Uncaught server error:", error);
		else console.error("Uncaught server error:", (error as Error)?.message ?? error);
		return Response.json({ error: "Internal Server Error" }, { status: 500 });
	},
) as unknown as Elysia;

// Plugins.backend.before — runs before framework middleware/routes.
// Plugin-registered routes here BYPASS the framework (CSRF, hooks, etc.).
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

export { app };
