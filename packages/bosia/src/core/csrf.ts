// ─── CSRF Protection ──────────────────────────────────────
// Origin-based CSRF validation — same approach as SvelteKit.
// All non-safe (state-changing) requests must originate from
// the same origin as the server. Browsers always send `Origin`
// on cross-origin requests, so a missing or mismatched header
// is treated as a cross-origin attack.

export interface CsrfConfig {
	/** Whether to enforce the form-post origin check. WebSocket upgrades are always checked. Default: true. */
	checkOrigin: boolean;
	/** Additional origins to allow (e.g. CDN or mobile app origin). */
	allowedOrigins?: string[];
	/**
	 * Request paths exempt from the origin check — for server-to-server webhooks
	 * that carry no Origin/Referer. Matched exact or on a path boundary
	 * ("/webhook" also covers "/webhook/…", but not "/webhooky"). Exempt routes
	 * bypass CSRF entirely, so they MUST authenticate the caller themselves
	 * (verify a webhook token/signature).
	 */
	exemptPaths?: string[];
}

const DEFAULT_CSRF_CONFIG: CsrfConfig = {
	checkOrigin: true,
};

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

// Exact match, or a prefix match on a path boundary so "/webhook" covers
// "/webhook/xendit" but never "/webhooky". Prefix-boundary, no globs — swap in a
// matcher if wildcard path segments are ever needed.
function isPathExempt(pathname: string, patterns: string[]): boolean {
	for (const p of patterns) {
		if (pathname === p) return true;
		const prefix = p.endsWith("/") ? p : p + "/";
		if (pathname.startsWith(prefix)) return true;
	}
	return false;
}

/**
 * Check whether a request passes CSRF validation against `url.origin` — the
 * public origin, which server.ts has already rebuilt from X-Forwarded-*.
 * Returns `null` on success, or an error message string to reject with 403.
 */
export function checkCsrf(
	request: Request,
	url: URL,
	config: CsrfConfig = DEFAULT_CSRF_CONFIG,
): string | null {
	if (!config.checkOrigin) return null;
	if (SAFE_METHODS.has(request.method.toUpperCase())) return null;
	if (config.exemptPaths && isPathExempt(url.pathname, config.exemptPaths)) return null;

	const isAllowed = (origin: string) => originAllowed(origin, url.origin, config);

	// Check Origin header first (sent by all modern browsers on cross-origin requests)
	const originHeader = request.headers.get("origin");
	if (originHeader) {
		if (isAllowed(originHeader)) return null;
		return `Cross-origin request blocked: Origin "${originHeader}" is not allowed`;
	}

	// Fall back to Referer (older browsers, some same-origin form posts)
	const refererHeader = request.headers.get("referer");
	if (refererHeader) {
		try {
			const refererOrigin = new URL(refererHeader).origin;
			if (isAllowed(refererOrigin)) return null;
			return `Cross-origin request blocked: Referer "${refererHeader}" is not allowed`;
		} catch {
			return `Cross-origin request blocked: Referer header is malformed`;
		}
	}

	// Neither Origin nor Referer present — reject
	return "Forbidden: missing Origin or Referer header on non-safe request";
}

/**
 * Origin check for a WebSocket upgrade — a GET, so checkCsrf skips it, yet a
 * cross-site page could open a socket that carries the user's cookies.
 * Browsers always send `Origin` on a WebSocket handshake; a request without one
 * comes from a non-browser client (no ambient cookies to hijack) and passes.
 * Returns `null` on success, or an error message string to reject with 403.
 */
export function checkUpgradeOrigin(
	request: Request,
	url: URL,
	config: CsrfConfig = DEFAULT_CSRF_CONFIG,
): string | null {
	// Not gated on checkOrigin: turning off the form check must not also open
	// sockets to cross-site hijacking. CSRF_EXEMPT_PATHS is the way out.
	if (config.exemptPaths && isPathExempt(url.pathname, config.exemptPaths)) return null;
	const originHeader = request.headers.get("origin");
	if (!originHeader || originAllowed(originHeader, url.origin, config)) {
		return null;
	}
	return `Cross-origin WebSocket blocked: Origin "${originHeader}" is not allowed`;
}

// The expected origin is per-request (url.origin), so no Set to precompute —
// a direct compare plus the tiny static allow-list.
function originAllowed(origin: string, expected: string, config: CsrfConfig): boolean {
	return origin === expected || (config.allowedOrigins?.includes(origin) ?? false);
}
