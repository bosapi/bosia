// ─── Bosia Hooks ─────────────────────────────────────────
// SvelteKit-compatible middleware API.
// Usage in src/hooks.server.ts:
//
//   import { sequence } from "bosia";
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
	sameSite?: "Strict" | "Lax" | "None" | "strict" | "lax" | "none";
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
	/**
	 * Per-request scratch object for user hooks/load functions.
	 *
	 * `locals.nonce` is populated by the framework with a fresh per-request
	 * cryptographic nonce (base64, 128 bits of entropy) and is safe to embed
	 * as `nonce="${event.locals.nonce}"` on user-authored inline scripts when
	 * the operator enables a `Content-Security-Policy` via the
	 * `CSP_DIRECTIVES` env var.
	 */
	locals: Record<string, any> & { nonce?: string };
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
	/**
	 * Declare custom dependency keys for this loader. The client cache
	 * will re-run the loader when `invalidate(key)` is called with any
	 * of these keys. Keys are arbitrary strings, but conventionally
	 * namespaced (e.g. `"app:user"`).
	 */
	depends: (...keys: string[]) => void;
};

/**
 * Tracked dependencies captured for a single loader during one run.
 * Shipped to the client so subsequent client-side navigations can
 * decide whether to re-run the loader.
 */
export type LoaderDeps = {
	/** `depends(...keys)` declarations. */
	keys: string[];
	/** Absolute URLs passed to the loader's `fetch()`. */
	urls: string[];
	/** Route params the loader read (`params.X`). */
	params: string[];
	/** Search params the loader read (`url.searchParams.get(X)` / `.has(X)`). */
	searchParams: string[];
	/** Cookies the loader read (`cookies.get(X)`). */
	cookies: string[];
	/** True if the loader read `url.pathname`/`url.origin`/`url.hash`/`url.href`. */
	uses_url: boolean;
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
	lang?: string;
	link?: Array<{ rel: string; href: string; hreflang?: string }>;
	data?: Record<string, any>;
};

type MaybePromise<T> = T | Promise<T>;

// ─── Frame-Guard Opt-Out ──────────────────────────────────

/**
 * Internal response header a `handle` can set to opt a single response out of
 * the global `X-Frame-Options: SAMEORIGIN` guard. Use when a trusted proxy hub
 * serves another origin's content that must be embeddable (e.g. an app preview
 * iframe): the proxy strips the upstream `X-Frame-Options`, but the framework
 * would otherwise re-add its own. The header is stripped before the response
 * leaves the process, so it never reaches the client. Other security headers
 * (`X-Content-Type-Options`, `Referrer-Policy`) are unaffected.
 */
export const NO_FRAME_GUARD_HEADER = "x-bosia-no-frame-guard";

// ─── Middleware Composition ────────────────────────────────

/**
 * Compose multiple `handle` functions into a single handler.
 * Each handler's `resolve` points to the next handler in the chain.
 */
export function sequence(...handlers: Handle[]): Handle {
	return ({ event, resolve }) => {
		let next = resolve;
		for (let i = handlers.length - 1; i >= 0; i--) {
			const handler = handlers[i]!;
			const prev = next;
			next = (e: RequestEvent) => handler({ event: e, resolve: prev });
		}
		return next(event);
	};
}
