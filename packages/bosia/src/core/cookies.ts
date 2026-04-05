import type { Cookies, CookieOptions } from "./hooks.ts";

// ─── Cookie Validation (RFC 6265) ────────────────────────
/** Rejects characters that could inject into Set-Cookie headers. */
const UNSAFE_COOKIE_VALUE = /[;\r\n]/;
const VALID_SAMESITE = new Set(["Strict", "Lax", "None"]);

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
            try { result[name] = decodeURIComponent(value); }
            catch { result[name] = value; }
        }
    }
    return result;
}

export class CookieJar implements Cookies {
    private _incoming: Record<string, string>;
    private _outgoing: string[] = [];
    private _defaults: CookieOptions;
    private _accessed = false;

    constructor(cookieHeader: string, dev = false) {
        this._incoming = parseCookies(cookieHeader);
        // In dev mode, omit Secure — browsers reject Secure cookies over http://localhost
        this._defaults = dev
            ? { ...COOKIE_DEFAULTS, secure: false }
            : COOKIE_DEFAULTS;
    }

    get(name: string): string | undefined {
        this._accessed = true;
        return this._incoming[name];
    }

    getAll(): Record<string, string> {
        this._accessed = true;
        return { ...this._incoming };
    }

    get accessed(): boolean {
        return this._accessed;
    }

    set(name: string, value: string, options?: CookieOptions): void {
        if (!VALID_COOKIE_NAME.test(name)) throw new Error(`Invalid cookie name: ${name}`);
        const opts = { ...this._defaults, ...options };
        let header = `${name}=${encodeURIComponent(value)}`;
        if (opts.path) {
            if (UNSAFE_COOKIE_VALUE.test(opts.path)) throw new Error(`Invalid cookie path: ${opts.path}`);
            header += `; Path=${opts.path}`;
        }
        if (opts.domain) {
            if (UNSAFE_COOKIE_VALUE.test(opts.domain)) throw new Error(`Invalid cookie domain: ${opts.domain}`);
            header += `; Domain=${opts.domain}`;
        }
        if (opts.maxAge != null) header += `; Max-Age=${opts.maxAge}`;
        if (opts.expires) header += `; Expires=${opts.expires.toUTCString()}`;
        if (opts.httpOnly) header += "; HttpOnly";
        if (opts.secure) header += "; Secure";
        if (opts.sameSite) {
            if (!VALID_SAMESITE.has(opts.sameSite)) throw new Error(`Invalid cookie sameSite: ${opts.sameSite}`);
            header += `; SameSite=${opts.sameSite}`;
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
