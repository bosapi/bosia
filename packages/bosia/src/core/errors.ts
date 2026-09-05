// ─── Error / Redirect Helpers ────────────────────────────
// Throw these from load() functions; the server catches and handles them.

import { withBase } from "./basePath.ts";
import { currentBase } from "./appBase.ts";

// Identity across bundle boundaries. `dist/hooks.server.js` keeps "bosia"
// external (build.ts BOSIA_RUNTIME_EXTERNALS), so a hook's `redirect()` builds
// its Redirect from the app's node_modules while the server bundle carries its
// own copy of this file. Two class objects, one `instanceof` — always false, so
// a hook throwing redirect() or error() fell through to a 500 no matter how many
// catch branches were added. `Symbol.for` lives in a process-wide registry, so
// the brand is the same value in both copies. Use isRedirect()/isHttpError()
// rather than `instanceof` for anything that can cross that boundary.
export const REDIRECT_BRAND = Symbol.for("bosia.Redirect");
export const HTTP_ERROR_BRAND = Symbol.for("bosia.HttpError");

export class HttpError extends Error {
	constructor(
		public status: number,
		message: string,
	) {
		super(message);
		this.name = "HttpError";
	}
}

export function isHttpError(err: unknown): err is HttpError {
	return typeof err === "object" && err !== null && (err as any)[HTTP_ERROR_BRAND] === true;
}

export function isRedirect(err: unknown): err is Redirect {
	return typeof err === "object" && err !== null && (err as any)[REDIRECT_BRAND] === true;
}

export interface RedirectOptions {
	/** Set to `true` to allow redirects to external origins (e.g. OAuth providers). */
	allowExternal?: boolean;
}

export class Redirect {
	constructor(
		public status: number,
		public location: string,
		options?: RedirectOptions,
	) {
		validateRedirectLocation(location, options);
		// Validate first, then rebase: the checks above are about what the app
		// asked for, and a base prefix must never turn a rejected target into an
		// accepted one. Every redirect() in every app funnels through here, which
		// is the only reason mounting under a base needs no app change — an app
		// writing redirect(303, "/masuk") gets /sso/masuk on the wire.
		this.location = withBase(currentBase(), location);
	}
}

// Stamped on the prototypes rather than declared as class fields: a plain
// assignment needs no `unique symbol` gymnastics and covers subclasses too.
(HttpError.prototype as any)[HTTP_ERROR_BRAND] = true;
(Redirect.prototype as any)[REDIRECT_BRAND] = true;

const DANGEROUS_SCHEMES = /^(javascript|data|vbscript):/i;

function validateRedirectLocation(location: string, options?: RedirectOptions): void {
	const trimmed = location.trim();

	// Dangerous schemes are rejected even when `allowExternal: true` —
	// `javascript:` / `data:` / `vbscript:` are never legitimate redirect targets.
	if (DANGEROUS_SCHEMES.test(trimmed)) {
		throw new Error(
			`redirect(): dangerous scheme in URL "${location}". ` +
				`Only relative paths and same-origin URLs are allowed.`,
		);
	}

	if (options?.allowExternal) return;

	// Reject protocol-relative URLs (//evil.com)
	if (trimmed.startsWith("//")) {
		throw new Error(
			`redirect(): protocol-relative URLs like "${location}" are not allowed. ` +
				`Use a relative path or pass { allowExternal: true } for external redirects.`,
		);
	}

	// Allow relative paths (no scheme)
	if (!/^[a-zA-Z][a-zA-Z0-9+\-.]*:/.test(trimmed)) return;

	// It's an absolute URL — reject external origins
	throw new Error(
		`redirect(): external URL "${location}" is not allowed. ` +
			`Use a relative path or pass { allowExternal: true } for external redirects.`,
	);
}

/** Throw an HTTP error from a load() function. */
export function error(status: number, message: string): never {
	throw new HttpError(status, message);
}

/** Redirect the user from a load() function. */
export function redirect(status: number, location: string, options?: RedirectOptions): never {
	throw new Redirect(status, location, options);
}

// ─── Form Action Helpers ─────────────────────────────────
// Return from form actions — not thrown, just returned.

export class ActionFailure<T extends Record<string, any> = Record<string, any>> {
	constructor(
		public status: number,
		public data: T,
	) {}
}

/** Return a failure from a form action with a status code and data. */
export function fail<T extends Record<string, any>>(status: number, data: T): ActionFailure<T> {
	return new ActionFailure(status, data);
}
