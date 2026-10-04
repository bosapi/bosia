import { describe, expect, test } from "bun:test";
import { makeSetHeaders } from "../src/core/hooks.ts";
import { gunzipSync, brotliDecompressSync } from "node:zlib";
import {
	compress,
	compressBytes,
	encodeBytes,
	pickEncoding,
	pickRequestEncoding,
} from "../src/core/html.ts";

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

describe("pickEncoding / encodeBytes", () => {
	test("brotli over gzip, null for identity", () => {
		expect(pickEncoding("gzip, deflate, br, zstd")).toBe("br");
		expect(pickEncoding("gzip, deflate")).toBe("gzip");
		expect(pickEncoding("identity")).toBeNull();
		expect(pickEncoding(null)).toBeNull();
	});

	test("per-request compression prefers zstd, then the stored encodings", () => {
		expect(pickRequestEncoding("gzip, deflate, br, zstd")).toBe("zstd");
		expect(pickRequestEncoding("gzip, deflate, br")).toBe("br");
		expect(pickRequestEncoding("gzip")).toBe("gzip");
		expect(pickRequestEncoding(null)).toBeNull();
	});

	test("zstd round-trips", () => {
		const body = new TextEncoder().encode("<p>hello</p>".repeat(500));
		expect(new Uint8Array(Bun.zstdDecompressSync(encodeBytes(body, "zstd")))).toEqual(body);
	});

	test("both encodings round-trip", () => {
		const body = new TextEncoder().encode("<p>hello</p>".repeat(500));
		expect(new Uint8Array(brotliDecompressSync(encodeBytes(body, "br")))).toEqual(body);
		expect(new Uint8Array(gunzipSync(encodeBytes(body, "gzip")))).toEqual(body);
	});

	test("request and cache quality both round-trip", () => {
		const body = new TextEncoder().encode("<p>hello</p>".repeat(500));
		for (const q of ["request", "cache"] as const) {
			expect(new Uint8Array(brotliDecompressSync(encodeBytes(body, "br", q)))).toEqual(body);
		}
	});

	test("compressBytes sends a prebuilt body as-is", async () => {
		const body = new TextEncoder().encode("<p>hello</p>".repeat(500));
		const encoded = encodeBytes(body, "br", "cache");
		const req = new Request("http://x/", { headers: { "Accept-Encoding": "br" } });
		const res = compressBytes(body, "text/html", req, 200, undefined, { enc: "br", encoded });
		expect(res.headers.get("content-encoding")).toBe("br");
		expect(new Uint8Array(await res.arrayBuffer())).toEqual(encoded);
	});
});
