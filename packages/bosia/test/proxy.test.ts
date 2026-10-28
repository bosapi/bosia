import { describe, expect, test } from "bun:test";
import { applyForwarded, hostAllowed, parseAllowedHosts } from "../src/core/proxy.ts";

const inner = () => new URL("http://localhost:3000/x?q=1");
const req = (headers: Record<string, string>) => new Request(inner(), { headers });

describe("applyForwarded", () => {
	test("without trust, spoofed X-Forwarded-* change nothing", () => {
		const url = inner();
		applyForwarded(
			req({ "x-forwarded-host": "attacker.com", "x-forwarded-proto": "https" }),
			url,
			false,
		);
		expect(url.href).toBe("http://localhost:3000/x?q=1");
	});

	test("with trust, the public host and scheme replace the inner ones, port and all", () => {
		const url = inner();
		applyForwarded(req({ "x-forwarded-host": "app.com", "x-forwarded-proto": "https" }), url, true);
		expect(url.href).toBe("https://app.com/x?q=1");
	});

	test("a forwarded port is kept", () => {
		const url = inner();
		applyForwarded(req({ "x-forwarded-host": "app.com:8443" }), url, true);
		expect(url.origin).toBe("http://app.com:8443");
	});

	test("chained values use the first, client-facing one", () => {
		const url = inner();
		applyForwarded(
			req({ "x-forwarded-host": "app.com, internal.lb", "x-forwarded-proto": "https, http" }),
			url,
			true,
		);
		expect(url.origin).toBe("https://app.com");
	});

	test("ws/wss (Traefik on upgrades) mean http/https", () => {
		const url = inner();
		applyForwarded(req({ "x-forwarded-host": "app.com", "x-forwarded-proto": "wss" }), url, true);
		expect(url.origin).toBe("https://app.com");
	});

	test("a malformed host leaves the whole url untouched, scheme too", () => {
		for (const host of [
			"app example.com",
			"a^b.com",
			"evil.com@app.com",
			"app.com/x",
			"app.com?y",
		]) {
			const url = inner();
			applyForwarded(req({ "x-forwarded-host": host, "x-forwarded-proto": "https" }), url, true);
			expect(url.href).toBe("http://localhost:3000/x?q=1");
		}
	});

	test("a scheme other than http(s)/ws(s) is ignored", () => {
		for (const proto of ["file", "ftp", "javascript", "constructor", "__proto__", "toString"]) {
			const url = new URL("http://localhost/x");
			applyForwarded(req({ "x-forwarded-host": "app.com", "x-forwarded-proto": proto }), url, true);
			expect(url.href).toBe("http://app.com/x");
		}
	});
});

describe("ALLOWED_HOSTS", () => {
	const { hosts, invalid } = parseAllowedHosts([
		"App.com",
		"api.com:8080",
		"secure.com:443",
		"bücher.de",
		"[::1]",
		"::1:9000",
		"dot.com.",
		"https://bad.com",
		"bad.com/",
		"*.bad.com",
		".",
		"bad.com..",
		"bad..com",
		"bad.com:0",
		".bad.com",
	]);
	const allowed = (href: string) => hostAllowed(hosts, new URL(href));

	test("an entry that isn't a bare host (or unbracketed IPv6) is reported, not silently unmatched", () => {
		expect(invalid).toEqual([
			"::1:9000",
			"https://bad.com",
			"bad.com/",
			"*.bad.com",
			".",
			"bad.com..",
			"bad..com",
			"bad.com:0",
			".bad.com",
		]);
	});

	test("entries match the parser's form: case, IDN, IPv6, default port, trailing dot", () => {
		expect(allowed("https://APP.com/")).toBe(true);
		expect(allowed("http://app.com/")).toBe(true);
		expect(allowed("https://secure.com/")).toBe(true);
		expect(allowed("http://xn--bcher-kva.de/")).toBe(true);
		expect(allowed("http://[::1]/")).toBe(true);
		expect(allowed("http://dot.com/")).toBe(true);
		expect(allowed("http://evil.com/")).toBe(false);
	});

	test("a bare host allows the default ports only: each port is its own cache origin", () => {
		expect(allowed("http://app.com:3000/")).toBe(false);
		expect(allowed("https://secure.com:8443/")).toBe(false);
		expect(allowed("http://[::1]:3000/")).toBe(false);
	});

	test("a trailing-dot request is refused, so it can't double the cache entries", () => {
		expect(allowed("http://app.com./")).toBe(false);
	});

	test("80 and 443 are one default port on both sides: host, host:80, host:443 match alike", () => {
		for (const entry of ["a.com", "a.com:80", "a.com:443"]) {
			const { hosts } = parseAllowedHosts([entry]);
			for (const href of [
				"https://a.com/",
				"http://a.com/",
				"http://a.com:443/",
				"https://a.com:80/",
			]) {
				expect(hostAllowed(hosts, new URL(href))).toBe(true);
			}
			expect(hostAllowed(hosts, new URL("http://a.com:8443/"))).toBe(false);
		}
	});

	test("`*` means any host; entries next to it are still parsed and reported", () => {
		expect(parseAllowedHosts(["*"])).toEqual({ hosts: new Set(), invalid: [], any: true });
		expect(parseAllowedHosts(["*", "*"])).toEqual({ hosts: new Set(), invalid: [], any: true });
		expect(parseAllowedHosts(["app.com", "*", "https://x"])).toEqual({
			hosts: new Set(["app.com"]),
			invalid: ["https://x"],
			any: true,
		});
	});

	test("a host:port entry allows that port only", () => {
		expect(allowed("http://api.com:8080/")).toBe(true);
		expect(allowed("http://api.com/")).toBe(false);
		expect(allowed("http://api.com:9090/")).toBe(false);
	});

	test("behind a trusted proxy the forwarded host is the one checked", () => {
		const fwd = (host: string) => {
			const url = inner();
			applyForwarded(req({ "x-forwarded-host": host, "x-forwarded-proto": "https" }), url, true);
			return hostAllowed(hosts, url);
		};
		expect(fwd("app.com")).toBe(true);
		expect(fwd("evil.com")).toBe(false);
		// Untrusted: the spoofed header is ignored and the inner host decides.
		const url = inner();
		applyForwarded(req({ "x-forwarded-host": "app.com" }), url, false);
		expect(hostAllowed(hosts, url)).toBe(false);
	});
});
