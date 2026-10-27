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
		"::1",
		"dot.com.",
		"https://bad.com",
		"bad.com/",
		"*.bad.com",
	]);
	const allowed = (href: string) => hostAllowed(hosts, new URL(href));

	test("an entry that isn't a bare host is reported, not silently unmatched", () => {
		expect(invalid).toEqual(["https://bad.com", "bad.com/", "*.bad.com"]);
	});

	test("entries match the parser's form: case, IDN, IPv6, default port, trailing dot", () => {
		expect(allowed("https://app.com/")).toBe(true);
		expect(allowed("http://APP.com:3000/")).toBe(true);
		expect(allowed("https://secure.com/")).toBe(true);
		expect(allowed("http://xn--bcher-kva.de/")).toBe(true);
		expect(allowed("http://[::1]:3000/")).toBe(true);
		expect(allowed("http://dot.com/")).toBe(true);
		expect(allowed("http://app.com./")).toBe(true);
		expect(allowed("http://evil.com/")).toBe(false);
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
