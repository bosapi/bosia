import { describe, expect, test } from "bun:test";
import { checkCsrf, checkUpgradeOrigin, type CsrfConfig } from "../src/core/csrf.ts";

function req(method: string, headers: Record<string, string> = {}) {
	return new Request("https://app.example.com/x", { method, headers });
}

const url = new URL("https://app.example.com/x");

describe("checkCsrf", () => {
	test("safe methods bypass", () => {
		for (const m of ["GET", "HEAD", "OPTIONS"]) {
			expect(checkCsrf(req(m), url)).toBe(null);
		}
	});

	test("checkOrigin: false bypasses", () => {
		expect(checkCsrf(req("POST"), url, { checkOrigin: false })).toBe(null);
	});

	test("matching Origin passes", () => {
		const r = req("POST", { origin: "https://app.example.com" });
		expect(checkCsrf(r, url)).toBe(null);
	});

	test("mismatched Origin rejected", () => {
		const r = req("POST", { origin: "https://evil.com" });
		expect(checkCsrf(r, url)).toContain("Origin");
	});

	test("Referer fallback when Origin absent", () => {
		const r = req("POST", { referer: "https://app.example.com/page" });
		expect(checkCsrf(r, url)).toBe(null);
	});

	test("malformed Referer rejected", () => {
		const r = req("POST", { referer: "not a url" });
		expect(checkCsrf(r, url)).toContain("malformed");
	});

	test("missing both rejected", () => {
		expect(checkCsrf(req("POST"), url)).toContain("missing");
	});

	test("allowedOrigins list", () => {
		const r = req("POST", { origin: "https://cdn.example.com" });
		expect(
			checkCsrf(r, url, { checkOrigin: true, allowedOrigins: ["https://cdn.example.com"] }),
		).toBe(null);
	});
});

describe("checkCsrf — exemptPaths (webhooks)", () => {
	const cfg = (exemptPaths: string[]): CsrfConfig => ({ checkOrigin: true, exemptPaths });
	const at = (pathname: string) => new URL(`https://app.example.com${pathname}`);

	test("exact exempt path bypasses a header-less POST", () => {
		const r = req("POST"); // no Origin/Referer, like a server-to-server webhook
		expect(checkCsrf(r, at("/webhook/xendit"), cfg(["/webhook/xendit"]))).toBe(null);
	});

	test("prefix exempts sub-paths and the bare path", () => {
		expect(checkCsrf(req("POST"), at("/webhook/xendit"), cfg(["/webhook"]))).toBe(null);
		expect(checkCsrf(req("POST"), at("/webhook/stripe"), cfg(["/webhook"]))).toBe(null);
		expect(checkCsrf(req("POST"), at("/webhook"), cfg(["/webhook"]))).toBe(null);
	});

	test("boundary: a lookalike path is NOT exempt", () => {
		expect(checkCsrf(req("POST"), at("/webhooky-evil"), cfg(["/webhook"]))).toContain("missing");
	});

	test("exact entry does not exempt a sibling path", () => {
		expect(checkCsrf(req("POST"), at("/webhook/stripe"), cfg(["/webhook/xendit"]))).toContain(
			"missing",
		);
	});

	test("exemption does not weaken a non-exempt path with a bad Origin", () => {
		const r = req("POST", { origin: "https://evil.com" });
		expect(checkCsrf(r, at("/api/pay"), cfg(["/webhook"]))).toContain("Origin");
	});
});

// server.ts applies X-Forwarded-* (behind TRUST_PROXY, see proxy.test.ts) to
// `url` before these run, so they compare against `url` alone.
describe("checkCsrf — compares against the url it is given", () => {
	const spoofed = {
		"x-forwarded-host": "attacker.com",
		"x-forwarded-proto": "https",
		origin: "https://attacker.com",
	};

	test("X-Forwarded-* headers are never read here", () => {
		const innerUrl = new URL("http://localhost:9001/x");
		const post = new Request(innerUrl, { method: "POST", headers: spoofed });
		expect(checkCsrf(post, innerUrl)).toContain("Origin");
		const upgrade = new Request(innerUrl, { headers: { ...spoofed, upgrade: "websocket" } });
		expect(checkUpgradeOrigin(upgrade, innerUrl)).toContain("attacker.com");
	});

	test("the public url server.ts rebuilt is the expected origin", () => {
		const publicUrl = new URL("https://app.example.com/x");
		const headers = { origin: "https://app.example.com" };
		const post = new Request("http://localhost:9001/x", { method: "POST", headers });
		expect(checkCsrf(post, publicUrl)).toBe(null);
		const upgrade = new Request("http://localhost:9001/x", {
			headers: { ...headers, upgrade: "websocket" },
		});
		expect(checkUpgradeOrigin(upgrade, publicUrl)).toBe(null);
	});
});

describe("checkUpgradeOrigin", () => {
	const upgrade = (headers: Record<string, string> = {}) =>
		req("GET", { upgrade: "websocket", ...headers });

	test("same Origin passes", () => {
		expect(checkUpgradeOrigin(upgrade({ origin: "https://app.example.com" }), url)).toBe(null);
	});

	test("missing Origin passes — a non-browser client has no ambient cookies", () => {
		expect(checkUpgradeOrigin(upgrade(), url)).toBe(null);
	});

	test("cross-site Origin is rejected, even though the method is GET", () => {
		expect(checkUpgradeOrigin(upgrade({ origin: "https://evil.com" }), url)).toContain("evil.com");
	});

	test("allowedOrigins and exemptPaths let it through; checkOrigin: false does not", () => {
		const evil = upgrade({ origin: "https://evil.com" });
		expect(
			checkUpgradeOrigin(evil, url, { checkOrigin: true, allowedOrigins: ["https://evil.com"] }),
		).toBe(null);
		expect(checkUpgradeOrigin(evil, url, { checkOrigin: true, exemptPaths: ["/x"] })).toBe(null);
		expect(checkUpgradeOrigin(evil, url, { checkOrigin: false })).toContain("evil.com");
	});

	test("a Referer alone is not an Origin", () => {
		expect(checkUpgradeOrigin(upgrade({ referer: "https://evil.com/" }), url)).toBe(null);
	});
});
