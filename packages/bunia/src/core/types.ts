// ─── Bunia Core Types ────────────────────────────────────

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
    /** Chain of +layout.server.ts files root → leaf, with their layout depth */
    layoutServers: { path: string; depth: number }[];
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
}

/** Result of matching a URL against a route */
export interface RouteMatch<T> {
    route: T;
    params: Record<string, string>;
}
