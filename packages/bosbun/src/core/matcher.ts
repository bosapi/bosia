import type { RouteMatch } from "./types.ts";

// ─── Route Matcher ───────────────────────────────────────
// Single shared matcher used by both client and server at runtime.
// Replaces the old code-generated match functions.
//
// Matching priority (same as old / SvelteKit):
//   1. Exact match        — "/about" === "/about"
//   2. Dynamic match      — "/blog/[slug]" matches "/blog/hello"
//   3. Catch-all match    — "/[...rest]" matches anything

/**
 * Match a URL pathname against a single route pattern.
 * Returns extracted params if matched, null otherwise.
 */
export function matchPattern(
    pattern: string,
    pathname: string,
): Record<string, string> | null {
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
        const params = matchPattern(route.pattern, pathname);
        if (params !== null) return { route, params };
    }

    return null;
}
