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

// Characters the URL parser would quietly cut at or keep part of
// (`evil.com@app.com`, `app.com/x`), and `*`, which no real host has.
const NOT_BARE_HOST = /[\s/?#@\\*]/;

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
		if (NOT_BARE_HOST.test(host)) return;
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

/**
 * Parse ALLOWED_HOSTS entries (`host` or `host:port`) into `url.host` form:
 * run through the URL parser like the request, so IDN and IPv6 match. A bare
 * host means the default port only: every port is its own `url.origin`, so its
 * own page-cache entry, and "any port" would let `app.com:1…65535` flood it. An entry that isn't a bare host (`https://app.com`,
 * `app.com/`, `*.app.com`) is returned in `invalid` instead of silently never
 * matching.
 */
export function parseAllowedHosts(entries: string[]): { hosts: Set<string>; invalid: string[] } {
	const hosts = new Set<string>();
	const invalid: string[] = [];
	for (const entry of entries) {
		// Bare IPv6 (`::1`) needs brackets to parse.
		const raw = entry.split(":").length > 2 && !entry.startsWith("[") ? `[${entry}]` : entry;
		let url: URL | undefined;
		if (!NOT_BARE_HOST.test(raw)) {
			try {
				url = new URL(`http://${raw}`);
			} catch {}
		}
		if (!url) {
			invalid.push(entry);
			continue;
		}
		// `app.com.` names the same DNS host; the request side keeps the dot (and
		// 400s), so `app.com.` never gets a second set of cache entries.
		const hostname = url.hostname.replace(/\.$/, "");
		// The request url drops 80 (http) and 443 (https), so an entry naming them means the bare host.
		hosts.add(url.port && url.port !== "443" ? `${hostname}:${url.port}` : hostname);
	}
	return { hosts, invalid };
}

/** True when `url.host` is in `hosts` from parseAllowedHosts. */
export function hostAllowed(hosts: Set<string>, url: URL): boolean {
	return hosts.has(url.host);
}
