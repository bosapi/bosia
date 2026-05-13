import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { checkCsrf } from "../src/core/csrf.ts";

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

describe("checkCsrf — TRUST_PROXY gate", () => {
	const originalTrustProxy = process.env.TRUST_PROXY;

	beforeEach(() => {
		delete process.env.TRUST_PROXY;
	});

	afterEach(() => {
		if (originalTrustProxy === undefined) delete process.env.TRUST_PROXY;
		else process.env.TRUST_PROXY = originalTrustProxy;
	});

	test("spoofed X-Forwarded-Host is ignored when TRUST_PROXY unset", () => {
		const innerUrl = new URL("http://localhost:9001/x");
		const r = new Request("http://localhost:9001/x", {
			method: "POST",
			headers: {
				"x-forwarded-host": "attacker.com",
				"x-forwarded-proto": "https",
				origin: "https://attacker.com",
			},
		});
		expect(checkCsrf(r, innerUrl)).toContain("Origin");
	});

	test("X-Forwarded-Host honored when TRUST_PROXY=true", () => {
		process.env.TRUST_PROXY = "true";
		const innerUrl = new URL("http://localhost:9001/x");
		const r = new Request("http://localhost:9001/x", {
			method: "POST",
			headers: {
				"x-forwarded-host": "localhost:9000",
				"x-forwarded-proto": "http",
				origin: "http://localhost:9000",
			},
		});
		expect(checkCsrf(r, innerUrl)).toBe(null);
	});

	test("TRUST_PROXY=false (string) does not enable trust", () => {
		process.env.TRUST_PROXY = "false";
		const innerUrl = new URL("http://localhost:9001/x");
		const r = new Request("http://localhost:9001/x", {
			method: "POST",
			headers: {
				"x-forwarded-host": "attacker.com",
				origin: "https://attacker.com",
			},
		});
		expect(checkCsrf(r, innerUrl)).toContain("Origin");
	});
});
