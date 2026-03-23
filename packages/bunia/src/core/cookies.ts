import type { Cookies, CookieOptions } from "./hooks.ts";

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

    constructor(cookieHeader: string) {
        this._incoming = parseCookies(cookieHeader);
    }

    get(name: string): string | undefined {
        return this._incoming[name];
    }

    getAll(): Record<string, string> {
        return { ...this._incoming };
    }

    set(name: string, value: string, options?: CookieOptions): void {
        let header = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
        header += `; Path=${options?.path ?? "/"}`;
        if (options?.domain) header += `; Domain=${options.domain}`;
        if (options?.maxAge != null) header += `; Max-Age=${options.maxAge}`;
        if (options?.expires) header += `; Expires=${options.expires.toUTCString()}`;
        if (options?.httpOnly) header += "; HttpOnly";
        if (options?.secure) header += "; Secure";
        if (options?.sameSite) header += `; SameSite=${options.sameSite}`;
        this._outgoing.push(header);
    }

    delete(name: string, options?: Pick<CookieOptions, "path" | "domain">): void {
        this.set(name, "", { path: options?.path, domain: options?.domain, maxAge: 0 });
    }

    get outgoing(): readonly string[] {
        return this._outgoing;
    }
}
