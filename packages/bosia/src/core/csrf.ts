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
	if (config.exemptPaths && isPathExempt(url.pathname, config.exemptPaths)) return null;

	// Derive the expected origin.
	// `X-Forwarded-*` headers are only trusted when `TRUST_PROXY=true`, since a
	// directly-exposed server would otherwise let a client spoof its own origin
	// via attacker-controlled forwarded headers. Behind a real reverse proxy
	// (nginx, Caddy, Cloudflare) the operator opts in by setting the env.
	const trustProxy = process.env.TRUST_PROXY === "true";
	const forwardedHost = trustProxy ? request.headers.get("x-forwarded-host") : null;
	const host = forwardedHost ?? request.headers.get("host");
	const forwardedProto = trustProxy ? request.headers.get("x-forwarded-proto") : null;
	const protocol = forwardedProto ?? url.protocol.replace(":", "");
	const expectedOrigin = host ? `${protocol}://${host}` : url.origin;

	// expectedOrigin is per-request (host-derived), so no Set to precompute — a
	// direct compare plus the tiny static allow-list avoids a per-request alloc.
	const extraOrigins = config.allowedOrigins;
	const isAllowed = (origin: string) =>
		origin === expectedOrigin || (extraOrigins ? extraOrigins.includes(origin) : false);

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
