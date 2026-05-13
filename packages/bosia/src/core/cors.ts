export interface CorsConfig {
	/** Origins allowed to make cross-origin requests (e.g. ["https://app.example.com"]) */
	allowedOrigins: string[];
	/** HTTP methods to allow. Default: GET, HEAD, PUT, PATCH, POST, DELETE */
	allowedMethods?: string[];
	/** Request headers to allow. Default: Content-Type, Authorization */
	allowedHeaders?: string[];
	/** Response headers to expose to the browser. Default: none */
	exposedHeaders?: string[];
	/** Whether to allow cookies/auth credentials. Default: false */
	credentials?: boolean;
	/** Preflight cache duration in seconds. Default: 86400 (24h) */
	maxAge?: number;
}

const DEFAULT_METHODS = ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"];
const DEFAULT_HEADERS = ["Content-Type", "Authorization"];

function parseHeaderList(value: string): string[] {
	return value
		.split(",")
		.map((s) => s.trim())
		.filter(Boolean);
}

/**
 * Headers applied to *every* response when CORS is configured, regardless of
 * whether the request Origin is allowed. Keeps caches/CDNs from serving a
 * response with `Access-Control-Allow-Origin: X` to a different origin Y.
 */
export function applyCorsVary(headers: Headers): void {
	headers.set("Vary", "Origin");
}

/**
 * Returns CORS response headers if the request Origin is in the allowed list.
 * Returns null if Origin is absent or not allowed.
 */
export function getCorsHeaders(
	request: Request,
	config: CorsConfig,
): Record<string, string> | null {
	const origin = request.headers.get("origin");
	if (!origin) return null;

	const allowed = config.allowedOrigins.includes(origin);
	if (!allowed) return null;

	const headers: Record<string, string> = {
		"Access-Control-Allow-Origin": origin,
		Vary: "Origin",
	};

	if (config.credentials) {
		headers["Access-Control-Allow-Credentials"] = "true";
	}

	if (config.exposedHeaders?.length) {
		headers["Access-Control-Expose-Headers"] = config.exposedHeaders.join(", ");
	}

	return headers;
}

/**
 * Handles OPTIONS preflight requests.
 *
 * - Returns `null` if the request's Origin is missing or not allowed — the
 *   caller treats this as "not a CORS preflight we serve", avoiding leaking
 *   policy details to unknown origins.
 * - Returns a 403 (carrying `Access-Control-Allow-Origin` + `Vary: Origin`)
 *   when the requested method or any requested header falls outside the
 *   configured allow-list. A 403 surfaces a clearer "not allowed by CORS
 *   policy" message in the browser than letting the OPTIONS request fall
 *   through to the default handler.
 * - Otherwise returns a 204 with the standard preflight headers.
 */
export function handlePreflight(request: Request, config: CorsConfig): Response | null {
	const base = getCorsHeaders(request, config);
	if (!base) return null;

	const allowedMethods = config.allowedMethods ?? DEFAULT_METHODS;
	const allowedHeaders = config.allowedHeaders ?? DEFAULT_HEADERS;

	const requestedMethod = request.headers.get("access-control-request-method");
	if (requestedMethod) {
		const upper = requestedMethod.toUpperCase();
		const allowedUpper = allowedMethods.map((m) => m.toUpperCase());
		if (!allowedUpper.includes(upper)) {
			return rejectPreflight(base, `Method ${requestedMethod} not allowed by CORS policy`);
		}
	}

	const requestedHeadersRaw = request.headers.get("access-control-request-headers");
	if (requestedHeadersRaw) {
		const requested = parseHeaderList(requestedHeadersRaw).map((h) => h.toLowerCase());
		const allowedLower = allowedHeaders.map((h) => h.toLowerCase());
		const disallowed = requested.find((h) => !allowedLower.includes(h));
		if (disallowed) {
			return rejectPreflight(base, `Header ${disallowed} not allowed by CORS policy`);
		}
	}

	const headers = new Headers(base as HeadersInit);
	headers.set("Access-Control-Allow-Methods", allowedMethods.join(", "));
	headers.set("Access-Control-Allow-Headers", allowedHeaders.join(", "));
	headers.set("Access-Control-Max-Age", String(config.maxAge ?? 86400));

	return new Response(null, { status: 204, headers });
}

function rejectPreflight(base: Record<string, string>, reason: string): Response {
	const headers = new Headers(base as HeadersInit);
	return new Response(reason, { status: 403, headers });
}
