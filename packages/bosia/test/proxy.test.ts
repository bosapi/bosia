import { describe, expect, test } from "bun:test";
import { applyForwarded } from "../src/core/proxy.ts";

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
		for (const proto of ["file", "ftp", "javascript"]) {
			const url = new URL("http://localhost/x");
			applyForwarded(req({ "x-forwarded-host": "app.com", "x-forwarded-proto": proto }), url, true);
			expect(url.href).toBe("http://app.com/x");
		}
	});
});
