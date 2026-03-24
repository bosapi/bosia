// ─── CSRF Protection ──────────────────────────────────────
// Origin-based CSRF validation — same approach as SvelteKit.
// All non-safe (state-changing) requests must originate from
// the same origin as the server. Browsers always send `Origin`
// on cross-origin requests, so a missing or mismatched header
// is treated as a cross-origin attack.

export interface CsrfConfig {
    /** Whether to enforce origin checks. Default: true. */
    checkOrigin: boolean;
    /** Additional origins to allow (e.g. CDN or mobile app origin). */
    allowedOrigins?: string[];
}

export const DEFAULT_CSRF_CONFIG: CsrfConfig = {
    checkOrigin: true,
};

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * Check whether a request passes CSRF validation.
 * Returns `null` on success, or an error message string to reject with 403.
 */
export function checkCsrf(
    request: Request,
    url: URL,
    config: CsrfConfig = DEFAULT_CSRF_CONFIG,
): string | null {
    if (!config.checkOrigin) return null;
    if (SAFE_METHODS.has(request.method.toUpperCase())) return null;

    // Derive the expected origin.
    // In dev, the browser hits the proxy on DEV_PORT (e.g. localhost:9000)
    // while the Elysia server sees url.origin as localhost:9001.
    // X-Forwarded-Host / Host headers reflect the actual host the client used.
    const forwardedHost = request.headers.get("x-forwarded-host");
    const host = forwardedHost ?? request.headers.get("host");
    const protocol = request.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
    const expectedOrigin = host ? `${protocol}://${host}` : url.origin;

    const allowedOrigins = new Set([expectedOrigin, ...(config.allowedOrigins ?? [])]);

    // Check Origin header first (sent by all modern browsers on cross-origin requests)
    const originHeader = request.headers.get("origin");
    if (originHeader) {
        if (allowedOrigins.has(originHeader)) return null;
        return `Cross-origin request blocked: Origin "${originHeader}" is not allowed`;
    }

    // Fall back to Referer (older browsers, some same-origin form posts)
    const refererHeader = request.headers.get("referer");
    if (refererHeader) {
        try {
            const refererOrigin = new URL(refererHeader).origin;
            if (allowedOrigins.has(refererOrigin)) return null;
            return `Cross-origin request blocked: Referer "${refererHeader}" is not allowed`;
        } catch {
            return `Cross-origin request blocked: Referer header is malformed`;
        }
    }

    // Neither Origin nor Referer present — reject
    return "Forbidden: missing Origin or Referer header on non-safe request";
}
