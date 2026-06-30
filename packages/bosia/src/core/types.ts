// ─── Bosia Core Types ────────────────────────────────────

/** Canonicalization mode for trailing slashes. Set per-page or per-layout. */
export type TrailingSlash = "never" | "always" | "ignore";

/** A page route discovered from the file system */
export interface PageRoute {
	/** URL pattern, e.g. "/" or "/blog/[slug]" or "/[...rest]" */
	pattern: string;
	/** Path to +page.svelte, relative to src/routes/ */
	page: string;
	/** Chain of +layout.svelte paths root → leaf, relative to src/routes/ */
	layouts: string[];
	/** Path to +page.server.ts if exists, relative to src/routes/ */
	pageServer: string | null;
	/** Path to +loading.svelte if exists, relative to src/routes/ (client skeleton). */
	loading: string | null;
	/** Chain of +layout.server.ts files root → leaf, with their layout depth */
	layoutServers: { path: string; depth: number }[];
	/**
	 * Chain of +error.svelte files root → leaf. `depth` is the layout depth this
	 * boundary protects: errors thrown by code at depth ≥ `depth` (page) or
	 * depth > `depth` (layout) are caught by this page. Depth 0 = wrapped by no
	 * layouts; depth N = wrapped by layouts[0..N-1].
	 */
	errorPages: { path: string; depth: number }[];
	/** Effective trailing-slash mode (page wins over layout chain). Defaults to "never". */
	trailingSlash: TrailingSlash;
	/**
	 * Dedup scope. `"public"` (default) → loader runs once for concurrent identical
	 * URLs. `"private"` → loader runs per-request (use for per-user routes).
	 * Set by placing the route under a `(private)` group folder anywhere in the chain.
	 */
	scope: "public" | "private";
}

/** An API route discovered from the file system */
export interface ApiRoute {
	/** URL pattern, e.g. "/api/hello" or "/api/users/[id]" */
	pattern: string;
	/** Path to +server.ts, relative to src/routes/ */
	server: string;
}

/** The full route manifest produced by the scanner */
export interface RouteManifest {
	pages: PageRoute[];
	apis: ApiRoute[];
	/** Path to root +error.svelte if it exists, relative to src/routes/ */
	errorPage: string | null;
}

/** Result of matching a URL against a route */
export interface RouteMatch<T> {
	route: T;
	params: Record<string, string>;
}
