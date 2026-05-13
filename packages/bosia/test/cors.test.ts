import { describe, expect, test } from "bun:test";
import { applyCorsVary, getCorsHeaders, handlePreflight } from "../src/core/cors.ts";

function req(headers: Record<string, string> = {}, method = "GET") {
	return new Request("https://api.example.com/x", { method, headers });
}

describe("getCorsHeaders", () => {
	test("returns null when Origin missing", () => {
		expect(getCorsHeaders(req(), { allowedOrigins: ["https://app.example.com"] })).toBe(null);
	});

	test("returns null when Origin not allowed", () => {
		const r = req({ origin: "https://evil.com" });
		expect(getCorsHeaders(r, { allowedOrigins: ["https://app.example.com"] })).toBe(null);
	});

	test("echoes allowed Origin and adds Vary", () => {
		const r = req({ origin: "https://app.example.com" });
		const h = getCorsHeaders(r, { allowedOrigins: ["https://app.example.com"] });
		expect(h?.["Access-Control-Allow-Origin"]).toBe("https://app.example.com");
		expect(h?.Vary).toBe("Origin");
	});

	test("credentials adds Allow-Credentials", () => {
		const r = req({ origin: "https://app.example.com" });
		const h = getCorsHeaders(r, {
			allowedOrigins: ["https://app.example.com"],
			credentials: true,
		});
		expect(h?.["Access-Control-Allow-Credentials"]).toBe("true");
	});

	test("exposedHeaders joined with comma", () => {
		const r = req({ origin: "https://app.example.com" });
		const h = getCorsHeaders(r, {
			allowedOrigins: ["https://app.example.com"],
			exposedHeaders: ["X-Total", "X-Page"],
		});
		expect(h?.["Access-Control-Expose-Headers"]).toBe("X-Total, X-Page");
	});
});

describe("applyCorsVary", () => {
	test("sets Vary: Origin on an empty Headers instance", () => {
		const h = new Headers();
		applyCorsVary(h);
		expect(h.get("Vary")).toBe("Origin");
	});

	test("overwrites pre-existing Vary value", () => {
		const h = new Headers({ Vary: "Accept-Encoding" });
		applyCorsVary(h);
		expect(h.get("Vary")).toBe("Origin");
	});

	test("applied independently of origin-match (non-allowed origin still gets Vary)", () => {
		const r = req({ origin: "https://evil.com" });
		const config = { allowedOrigins: ["https://app.example.com"] };
		const headers = new Headers();
		applyCorsVary(headers);
		const corsHeaders = getCorsHeaders(r, config);
		expect(corsHeaders).toBe(null);
		expect(headers.get("Vary")).toBe("Origin");
		expect(headers.get("Access-Control-Allow-Origin")).toBe(null);
	});
});

describe("handlePreflight", () => {
	test("returns null for disallowed origin", () => {
		const r = req({ origin: "https://evil.com" }, "OPTIONS");
		expect(handlePreflight(r, { allowedOrigins: ["https://app.example.com"] })).toBe(null);
	});

	test("204 with Methods/Headers/MaxAge", async () => {
		const r = req({ origin: "https://app.example.com" }, "OPTIONS");
		const res = handlePreflight(r, {
			allowedOrigins: ["https://app.example.com"],
			allowedMethods: ["GET", "POST"],
			allowedHeaders: ["Content-Type"],
			maxAge: 600,
		})!;
		expect(res.status).toBe(204);
		expect(res.headers.get("access-control-allow-methods")).toBe("GET, POST");
		expect(res.headers.get("access-control-allow-headers")).toBe("Content-Type");
		expect(res.headers.get("access-control-max-age")).toBe("600");
	});

	test("defaults methods/headers when omitted", () => {
		const r = req({ origin: "https://app.example.com" }, "OPTIONS");
		const res = handlePreflight(r, { allowedOrigins: ["https://app.example.com"] })!;
		expect(res.headers.get("access-control-allow-methods")).toContain("GET");
		expect(res.headers.get("access-control-allow-headers")).toContain("Content-Type");
		expect(res.headers.get("access-control-max-age")).toBe("86400");
	});

	test("403 when requested method not in allowedMethods", () => {
		const r = req(
			{
				origin: "https://app.example.com",
				"access-control-request-method": "DELETE",
			},
			"OPTIONS",
		);
		const res = handlePreflight(r, {
			allowedOrigins: ["https://app.example.com"],
			allowedMethods: ["GET", "POST"],
		})!;
		expect(res.status).toBe(403);
		expect(res.headers.get("access-control-allow-origin")).toBe("https://app.example.com");
		expect(res.headers.get("vary")).toBe("Origin");
	});

	test("403 when requested header not in allowedHeaders", () => {
		const r = req(
			{
				origin: "https://app.example.com",
				"access-control-request-method": "POST",
				"access-control-request-headers": "X-Custom-Token",
			},
			"OPTIONS",
		);
		const res = handlePreflight(r, {
			allowedOrigins: ["https://app.example.com"],
			allowedMethods: ["GET", "POST"],
			allowedHeaders: ["Content-Type"],
		})!;
		expect(res.status).toBe(403);
		expect(res.headers.get("access-control-allow-origin")).toBe("https://app.example.com");
	});

	test("403 when any of multiple requested headers is disallowed", () => {
		const r = req(
			{
				origin: "https://app.example.com",
				"access-control-request-method": "POST",
				"access-control-request-headers": "Content-Type, X-Sneaky",
			},
			"OPTIONS",
		);
		const res = handlePreflight(r, {
			allowedOrigins: ["https://app.example.com"],
			allowedHeaders: ["Content-Type"],
		})!;
		expect(res.status).toBe(403);
	});

	test("204 when requested method/headers match (case-insensitive)", () => {
		const r = req(
			{
				origin: "https://app.example.com",
				"access-control-request-method": "post",
				"access-control-request-headers": "content-type, AUTHORIZATION",
			},
			"OPTIONS",
		);
		const res = handlePreflight(r, {
			allowedOrigins: ["https://app.example.com"],
			allowedMethods: ["GET", "POST"],
			allowedHeaders: ["Content-Type", "Authorization"],
		})!;
		expect(res.status).toBe(204);
	});

	test("null (not 403) when origin not allowed, even with bad method", () => {
		const r = req(
			{
				origin: "https://evil.com",
				"access-control-request-method": "DELETE",
			},
			"OPTIONS",
		);
		expect(
			handlePreflight(r, {
				allowedOrigins: ["https://app.example.com"],
				allowedMethods: ["GET"],
			}),
		).toBe(null);
	});
});
