import type { RouteMatch, TrailingSlash } from "./types.ts";

// ─── Route Matcher ───────────────────────────────────────
// Single shared matcher used by both client and server at runtime.
// Replaces the old code-generated match functions.
//
// Matching priority (same as old / SvelteKit):
//   1. Exact match        — "/about" === "/about"
//   2. Dynamic match      — "/blog/[slug]" matches "/blog/hello"
//   3. Catch-all match    — "/[...rest]" matches anything

// ─── Compiled Route Types ────────────────────────────────

interface CompiledRoute {
	regex: RegExp;
	paramNames: string[];
	isExact: boolean;
}

// ─── Pattern Compiler ────────────────────────────────────

/** Escape regex special chars in a literal string segment. */
function escapeRegex(s: string): string {
	return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Pre-compile a route pattern into a RegExp for fast matching.
 */
function compilePattern(pattern: string): CompiledRoute {
	// No dynamic segments — exact match via ===
	if (!pattern.includes("[")) {
		return { regex: null!, paramNames: [], isExact: true };
	}

	const paramNames: string[] = [];

	// Catch-all: /prefix/[...name]
	const catchallMatch = pattern.match(/^(.*?)\/\[\.\.\.(\w+)\]$/);
	if (catchallMatch) {
		const prefix = catchallMatch[1] || "";
		paramNames.push(catchallMatch[2]!);
		const escaped = prefix ? escapeRegex(prefix) : "";
		// Root catch-all /[...rest] must have at least one char after /
		const regex = prefix ? new RegExp(`^${escaped}\\/(.+)$`) : new RegExp(`^\\/(.+)$`);
		return { regex, paramNames, isExact: false };
	}

	// Dynamic segments: /blog/[slug]/comments → ^\/blog\/([^/]+)\/comments$
	const segments = pattern.split("/").filter(Boolean);
	let regexStr = "^";
	for (const seg of segments) {
		regexStr += "\\/";
		if (seg.startsWith("[") && seg.endsWith("]")) {
			paramNames.push(seg.slice(1, -1));
			regexStr += "([^/]+)";
		} else {
			regexStr += escapeRegex(seg);
		}
	}
	regexStr += "$";

	return { regex: new RegExp(regexStr), paramNames, isExact: false };
}

/**
 * Pre-compile all route patterns in-place.
 * Mutates each route by adding a `_compiled` property.
 * Call once at startup — all modules sharing the same route array see the result.
 */
export function compileRoutes<T extends { pattern: string }>(
	routes: T[],
): (T & { _compiled: CompiledRoute })[] {
	for (const route of routes) {
		(route as any)._compiled = compilePattern(route.pattern);
	}
	return routes as (T & { _compiled: CompiledRoute })[];
}

// ─── Legacy Pattern Matcher (fallback for uncompiled routes) ─

/**
 * Match a URL pathname against a single route pattern.
 * Returns extracted params if matched, null otherwise.
 */
function matchPattern(pattern: string, pathname: string): Record<string, string> | null {
	// Strip trailing slash (but keep "/" as-is)
	if (pathname.length > 1 && pathname.endsWith("/")) {
		pathname = pathname.slice(0, -1);
	}

	// Exact match
	if (pattern === pathname) return {};

	// Catch-all pattern: /[...name] or /prefix/[...name]
	const catchallMatch = pattern.match(/^(.*?)\/\[\.\.\.(\w+)\]$/);
	if (catchallMatch) {
		const prefix = catchallMatch[1] || "";
		const paramName = catchallMatch[2]!;
		if (prefix === "" || pathname.startsWith(prefix + "/") || pathname === prefix) {
			const rest = prefix ? pathname.slice(prefix.length + 1) : pathname.slice(1);
			// Don't let a root catch-all match "/" with an empty slug.
			// If you want the catch-all to also serve "/", add an explicit +page.svelte at the root.
			if (!prefix && rest === "") return null;
			return { [paramName]: rest };
		}
		return null;
	}

	// Dynamic segments: must have same segment count
	if (!pattern.includes("[")) return null;

	const patParts = pattern.split("/").filter(Boolean);
	const pathParts = pathname.split("/").filter(Boolean);
	if (patParts.length !== pathParts.length) return null;

	const params: Record<string, string> = {};
	for (let i = 0; i < patParts.length; i++) {
		const pp = patParts[i]!;
		const val = pathParts[i]!;
		if (pp.startsWith("[") && pp.endsWith("]")) {
			params[pp.slice(1, -1)] = val;
		} else if (pp !== val) {
			return null;
		}
	}
	return params;
}

// ─── Route Matching ──────────────────────────────────────

/**
 * Match a compiled route against a pathname using regex.
 * Returns extracted params if matched, null otherwise.
 */
function matchCompiled(
	compiled: CompiledRoute,
	pattern: string,
	pathname: string,
): Record<string, string> | null {
	if (compiled.isExact) {
		return pattern === pathname ? {} : null;
	}

	const m = compiled.regex.exec(pathname);
	if (!m) return null;

	const params: Record<string, string> = {};
	for (let i = 0; i < compiled.paramNames.length; i++) {
		params[compiled.paramNames[i]!] = m[i + 1]!;
	}
	return params;
}

/**
 * Find the first matching route from a list.
 * Routes must be pre-sorted by priority (exact → dynamic → catch-all).
 * Single pass — first match wins.
 */
export function findMatch<T extends { pattern: string }>(
	routes: T[],
	pathname: string,
): RouteMatch<T> | null {
	// Strip trailing slash (but keep "/" as-is)
	if (pathname.length > 1 && pathname.endsWith("/")) {
		pathname = pathname.slice(0, -1);
	}

	for (const route of routes) {
		const compiled = (route as any)._compiled as CompiledRoute | undefined;
		const params = compiled
			? matchCompiled(compiled, route.pattern, pathname)
			: matchPattern(route.pattern, pathname);
		if (params !== null) return { route, params };
	}

	return null;
}

// ─── Trailing-Slash Canonicalization ──────────────────────
// Returns the canonical pathname for a given mode, or null if pathname is
// already canonical. Root "/" is never modified. Caller decides whether to
// 308-redirect (server) or replaceState (client).

export function canonicalPathname(pathname: string, mode: TrailingSlash): string | null {
	if (mode === "ignore") return null;
	if (pathname === "/") return null;
	const endsWithSlash = pathname.endsWith("/");
	if (mode === "never" && endsWithSlash) return pathname.slice(0, -1);
	if (mode === "always" && !endsWithSlash) return pathname + "/";
	return null;
}
