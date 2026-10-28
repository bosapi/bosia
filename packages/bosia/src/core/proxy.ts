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

// 80 and 443 count as the default port for either scheme, so `app.com`,
// `app.com:80` and `app.com:443` are one host on both sides of the check: a
// proxy that keeps `:443` in the Host still matches. Any other port must match
// exactly — each port is its own `url.origin`, so its own page-cache entry, and
// "any port" would let `app.com:1…65535` flood it. That caps a host at 4 cache
// origins (2 schemes × 2 default ports).
function hostKey(hostname: string, port: string): string {
	return port && port !== "80" && port !== "443" ? `${hostname}:${port}` : hostname;
}

/**
 * Parse ALLOWED_HOSTS entries (`host` or `host:port`) into hostKey form, through
 * the URL parser like the request, so IDN and IPv6 match. An entry that isn't a
 * bare host (`https://app.com`, `app.com/`, `*.app.com`, `.`) is returned in
 * `invalid` instead of silently never matching. `*` (the Django/Vite spelling)
 * sets `any`: every host is allowed.
 */
export function parseAllowedHosts(entries: string[]): {
	hosts: Set<string>;
	invalid: string[];
	any: boolean;
} {
	const hosts = new Set<string>();
	const invalid: string[] = [];
	for (const entry of entries) {
		if (entry === "*") continue;
		// IPv6 needs brackets (`[::1]:9000`); unbracketed `::1:9000` is ambiguous and fails to parse.
		let url: URL | undefined;
		if (!NOT_BARE_HOST.test(entry)) {
			try {
				url = new URL(`http://${entry}`);
			} catch {}
		}
		// `app.com.` names the same DNS host as `app.com`. The request side keeps
		// the dot (and 400s), so it never gets a second set of cache entries.
		const hostname = url?.hostname.replace(/\.$/, "");
		// Typos that parse but can never match a request: `.`, `app.com..`, `app..com`, `:0`,
		// and Django's `.app.com` (subdomains too), which is literal here.
		if (
			!url ||
			!hostname ||
			hostname.startsWith(".") ||
			hostname.endsWith(".") ||
			hostname.includes("..") ||
			url.port === "0"
		) {
			invalid.push(entry);
			continue;
		}
		hosts.add(hostKey(hostname, url.port));
	}
	return { hosts, invalid, any: entries.includes("*") };
}

/** True when `url`'s host is in `hosts` from parseAllowedHosts. */
export function hostAllowed(hosts: Set<string>, url: URL): boolean {
	return hosts.has(hostKey(url.hostname, url.port));
}
