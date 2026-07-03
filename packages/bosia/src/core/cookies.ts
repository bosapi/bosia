import type { Cookies, CookieOptions } from "./hooks.ts";

// ─── Cookie Validation (RFC 6265) ────────────────────────
/** Rejects characters that could inject into Set-Cookie headers. */
const UNSAFE_COOKIE_VALUE = /[;\r\n]/;
/**
 * Accept both casings (matches SvelteKit/Express convention) and write the
 * canonical capitalized form into the Set-Cookie header.
 */
const SAMESITE_NORMALIZE: Record<string, "Strict" | "Lax" | "None"> = {
	strict: "Strict",
	lax: "Lax",
	none: "None",
	Strict: "Strict",
	Lax: "Lax",
	None: "None",
};

/**
 * RFC 6265 §4.1.1: cookie-name is an HTTP token (RFC 2616 §2.2).
 * Must be 1+ chars of ASCII 33-126, excluding separators: ( ) < > @ , ; : \ " / [ ] ? = { }
 */
const VALID_COOKIE_NAME = /^[!#$%&'*+\-.0-9A-Z^_`a-z|~]+$/;

// ─── Cookie Defaults ─────────────────────────────────────
/** Secure defaults matching SvelteKit conventions. */
const COOKIE_DEFAULTS: CookieOptions = {
	path: "/",
	httpOnly: true,
	secure: true,
	sameSite: "Lax",
};

// ─── Cookie Helpers ──────────────────────────────────────

function parseCookies(header: string): Record<string, string> {
	const result: Record<string, string> = {};
	for (const pair of header.split(";")) {
		const idx = pair.indexOf("=");
		if (idx === -1) continue;
		const name = pair.slice(0, idx).trim();
		const value = pair.slice(idx + 1).trim();
		if (name) {
			try {
				result[name] = decodeURIComponent(value);
			} catch {
				result[name] = value;
			}
		}
	}
	return result;
}

export class CookieJar implements Cookies {
	private static _warnedSecureOverHttp = false;

	private _incoming: Record<string, string>;
	private _outgoing: string[] = [];
	private _defaults: CookieOptions;
	private _accessed = false;
	private _readNames = new Set<string>();
	private _isHttps: boolean;

	constructor(cookieHeader: string, isHttps = false) {
		this._incoming = parseCookies(cookieHeader);
		this._isHttps = isHttps;
		// Browsers drop Secure cookies sent over HTTP — only default `secure` on
		// when the current request actually arrived over HTTPS.
		this._defaults = isHttps ? COOKIE_DEFAULTS : { ...COOKIE_DEFAULTS, secure: false };
	}

	get(name: string): string | undefined {
		this._accessed = true;
		if (name in this._incoming) this._readNames.add(name);
		return this._incoming[name];
	}

	/**
	 * Read an incoming cookie WITHOUT flipping `accessed` or recording the name
	 * in `readNames`. Framework-internal (identity hashing must not count as a
	 * cookie read); deliberately absent from the public `Cookies` interface so
	 * loaders can't bypass dependency tracking.
	 */
	peek(name: string): string | undefined {
		return this._incoming[name];
	}

	getAll(): Record<string, string> {
		this._accessed = true;
		for (const name of Object.keys(this._incoming)) this._readNames.add(name);
		return { ...this._incoming };
	}

	get accessed(): boolean {
		return this._accessed;
	}

	/** Names of incoming cookies that were actually read (present in the request). */
	get readNames(): ReadonlySet<string> {
		return this._readNames;
	}

	set(name: string, value: string, options?: CookieOptions): void {
		if (!VALID_COOKIE_NAME.test(name)) throw new Error(`Invalid cookie name: ${name}`);
		const opts = { ...this._defaults, ...options };
		if (!this._isHttps && opts.secure) {
			opts.secure = false;
			if (!CookieJar._warnedSecureOverHttp) {
				console.warn(
					"[bosia] cookies.set passed secure:true over HTTP — downgrading. " +
						"Browsers drop Secure cookies on non-HTTPS. " +
						"Remove the `secure` option; Bosia auto-applies it when the request is HTTPS.",
				);
				CookieJar._warnedSecureOverHttp = true;
			}
		}
		let header = `${name}=${encodeURIComponent(value)}`;
		if (opts.path) {
			if (UNSAFE_COOKIE_VALUE.test(opts.path)) throw new Error(`Invalid cookie path: ${opts.path}`);
			header += `; Path=${opts.path}`;
		}
		if (opts.domain) {
			if (UNSAFE_COOKIE_VALUE.test(opts.domain))
				throw new Error(`Invalid cookie domain: ${opts.domain}`);
			header += `; Domain=${opts.domain}`;
		}
		if (opts.maxAge != null) header += `; Max-Age=${opts.maxAge}`;
		if (opts.expires) header += `; Expires=${opts.expires.toUTCString()}`;
		if (opts.httpOnly) header += "; HttpOnly";
		if (opts.secure) header += "; Secure";
		if (opts.sameSite) {
			const canonical = SAMESITE_NORMALIZE[opts.sameSite as string];
			if (!canonical) throw new Error(`Invalid cookie sameSite: ${opts.sameSite}`);
			header += `; SameSite=${canonical}`;
		}
		this._outgoing.push(header);
	}

	delete(name: string, options?: Pick<CookieOptions, "path" | "domain">): void {
		this.set(name, "", { ...options, maxAge: 0 });
	}

	get outgoing(): readonly string[] {
		return this._outgoing;
	}
}
