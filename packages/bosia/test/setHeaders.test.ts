import { describe, expect, test } from "bun:test";
import { makeSetHeaders } from "../src/core/hooks.ts";
import { compress } from "../src/core/html.ts";

describe("makeSetHeaders", () => {
	test("accumulates lowercased keys across multiple calls", () => {
		const acc: Record<string, string> = {};
		const setHeaders = makeSetHeaders(acc);
		setHeaders({ "Cache-Control": "public, max-age=60" });
		setHeaders({ "X-Custom": "a", "x-other": "b" });
		expect(acc).toEqual({
			"cache-control": "public, max-age=60",
			"x-custom": "a",
			"x-other": "b",
		});
	});

	test("duplicate key throws, regardless of casing", () => {
		const acc: Record<string, string> = {};
		const setHeaders = makeSetHeaders(acc);
		setHeaders({ "Cache-Control": "public" });
		expect(() => setHeaders({ "cache-control": "private" })).toThrow(/twice/);
		expect(() => setHeaders({ "CACHE-CONTROL": "private" })).toThrow(/twice/);
	});

	test("set-cookie throws", () => {
		const setHeaders = makeSetHeaders({});
		expect(() => setHeaders({ "Set-Cookie": "a=1" })).toThrow(/cookies API/);
	});
});

describe("compress extraHeaders", () => {
	test("lowercased extraHeaders override base keys — exactly one content-type", () => {
		const req = new Request("http://localhost/");
		const res = compress("hi", "text/html; charset=utf-8", req, 200, {
			"content-type": "text/plain",
			"cache-control": "public, max-age=60",
		});
		expect(res.headers.get("content-type")).toBe("text/plain");
		expect(res.headers.get("cache-control")).toBe("public, max-age=60");
	});
});
