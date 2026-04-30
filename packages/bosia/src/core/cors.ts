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

const DEFAULT_METHODS = "GET, HEAD, PUT, PATCH, POST, DELETE";
const DEFAULT_HEADERS = "Content-Type, Authorization";

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
 * Returns a 204 response with CORS headers, or null if the origin is not allowed.
 */
export function handlePreflight(request: Request, config: CorsConfig): Response | null {
	const base = getCorsHeaders(request, config);
	if (!base) return null;

	const headers = new Headers(base as HeadersInit);
	headers.set(
		"Access-Control-Allow-Methods",
		config.allowedMethods?.join(", ") ?? DEFAULT_METHODS,
	);
	headers.set(
		"Access-Control-Allow-Headers",
		config.allowedHeaders?.join(", ") ?? DEFAULT_HEADERS,
	);
	headers.set("Access-Control-Max-Age", String(config.maxAge ?? 86400));

	return new Response(null, { status: 204, headers });
}
