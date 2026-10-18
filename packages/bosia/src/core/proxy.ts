// Behind a reverse proxy the inbound `Host`/scheme is the proxy's inner hop
// (e.g. `localhost:PORT` over plain HTTP). X-Forwarded-Host/-Proto carry the
// public origin, but any client can send them, so they count only when the
// operator sets TRUST_PROXY=true.

/**
 * First value of an `X-Forwarded-*` header: each proxy in a chain appends its
 * own ("https, http"), and the first is the client-facing one.
 */
function firstForwarded(request: Request, name: string): string | undefined {
	return request.headers.get(name)?.split(",")[0]?.trim() || undefined;
}

// A Map, not an object: "constructor" or "__proto__" must read as unknown.
const SCHEMES = new Map([
	["http", "http:"],
	["https", "https:"],
	// Traefik sends ws/wss on upgrades; the origin a browser sends is http(s).
	["ws", "http:"],
	["wss", "https:"],
]);

/**
 * Point `url` at the public origin from X-Forwarded-Host/-Proto, in place, so
 * `event.url`, redirects and the CSRF/WebSocket origin checks all see it.
 * Does nothing unless `trustProxy`. A malformed host leaves `url` as it was,
 * scheme included; an unknown scheme is ignored.
 */
export function applyForwarded(request: Request, url: URL, trustProxy: boolean): void {
	if (!trustProxy) return;
	const proto = SCHEMES.get(firstForwarded(request, "x-forwarded-proto")?.toLowerCase() ?? "");
	const host = firstForwarded(request, "x-forwarded-host");
	let parsed: URL | undefined;
	if (host) {
		// The parser would quietly keep part of `evil.com@app.com` or `app.com/x`.
		if (/[\s/?#@\\]/.test(host)) return;
		try {
			parsed = new URL(`${proto ?? url.protocol}//${host}`);
		} catch {
			return;
		}
	}
	if (proto) url.protocol = proto;
	if (parsed) {
		// hostname + port, not `host`: setting `host` without a port keeps the inner one.
		url.hostname = parsed.hostname;
		url.port = parsed.port;
	}
}
