// ─── Error / Redirect Helpers ────────────────────────────
// Throw these from load() functions; the server catches and handles them.

export class HttpError extends Error {
	constructor(
		public status: number,
		message: string,
	) {
		super(message);
		this.name = "HttpError";
	}
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
	}
}

const DANGEROUS_SCHEMES = /^(javascript|data|vbscript):/i;

function validateRedirectLocation(location: string, options?: RedirectOptions): void {
	if (options?.allowExternal) return;

	const trimmed = location.trim();

	// Reject dangerous schemes
	if (DANGEROUS_SCHEMES.test(trimmed)) {
		throw new Error(
			`redirect(): dangerous scheme in URL "${location}". ` +
				`Only relative paths and same-origin URLs are allowed.`,
		);
	}

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
