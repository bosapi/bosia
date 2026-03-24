// ─── Bunia Hooks ─────────────────────────────────────────
// SvelteKit-compatible middleware API.
// Usage in src/hooks.server.ts:
//
//   import { sequence } from "bunia";
//   export const handle = sequence(authHandle, loggingHandle);

// ─── Cookie Types ─────────────────────────────────────────

export interface CookieOptions {
    path?: string;
    domain?: string;
    /** Max-Age in seconds */
    maxAge?: number;
    expires?: Date;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: "Strict" | "Lax" | "None";
}

export interface Cookies {
    /** Get a cookie value by name */
    get(name: string): string | undefined;
    /** Get all incoming cookies as a plain object */
    getAll(): Record<string, string>;
    /** Set a cookie (added to the response as Set-Cookie) */
    set(name: string, value: string, options?: CookieOptions): void;
    /** Delete a cookie by setting Max-Age=0 */
    delete(name: string, options?: Pick<CookieOptions, "path" | "domain">): void;
}

// ─── Event Types ──────────────────────────────────────────

export type RequestEvent = {
    request: Request;
    url: URL;
    locals: Record<string, any>;
    params: Record<string, string>;
    cookies: Cookies;
};

export type LoadEvent = {
    url: URL;
    params: Record<string, string>;
    locals: Record<string, any>;
    cookies: Cookies;
    fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
    parent: () => Promise<Record<string, any>>;
    metadata: Record<string, any> | null;
};

export type ResolveFunction = (event: RequestEvent) => MaybePromise<Response>;

export type Handle = (input: {
    event: RequestEvent;
    resolve: ResolveFunction;
}) => MaybePromise<Response>;

// ─── Metadata Types ──────────────────────────────────────

export type MetadataEvent = {
    params: Record<string, string>;
    url: URL;
    locals: Record<string, any>;
    cookies: Cookies;
    fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
};

export type Metadata = {
    title?: string;
    description?: string;
    meta?: Array<{ name?: string; property?: string; content: string }>;
    data?: Record<string, any>;
};

type MaybePromise<T> = T | Promise<T>;

// ─── Middleware Composition ────────────────────────────────

/**
 * Compose multiple `handle` functions into a single handler.
 * Each handler's `resolve` points to the next handler in the chain.
 */
export function sequence(...handlers: Handle[]): Handle {
    return ({ event, resolve }) => {
        function apply(i: number, e: RequestEvent): MaybePromise<Response> {
            if (i >= handlers.length) return resolve(e);
            return handlers[i]!({ event: e, resolve: (next) => apply(i + 1, next) });
        }
        return apply(0, event);
    };
}
