import { describe, expect, test } from "bun:test";
import { dedup, dedupKey } from "../src/core/dedup.ts";

describe("dedupKey()", () => {
	test("returns pathname when no query", () => {
		expect(dedupKey(new URL("https://x.test/blog"))).toBe("/blog");
	});

	test("normalizes trailing slash on non-root paths", () => {
		expect(dedupKey(new URL("https://x.test/blog/"))).toBe("/blog");
	});

	test("preserves root /", () => {
		expect(dedupKey(new URL("https://x.test/"))).toBe("/");
	});

	test("sorts query params for stable keys", () => {
		const a = dedupKey(new URL("https://x.test/list?b=2&a=1"));
		const b = dedupKey(new URL("https://x.test/list?a=1&b=2"));
		expect(a).toBe(b);
		expect(a).toBe("/list?a=1&b=2");
	});

	test("different paths produce different keys", () => {
		expect(dedupKey(new URL("https://x.test/a"))).not.toBe(dedupKey(new URL("https://x.test/b")));
	});
});

describe("dedup()", () => {
	test("concurrent calls with same key share one inflight promise", async () => {
		let calls = 0;
		const fn = async () => {
			calls++;
			await Bun.sleep(20);
			return "result";
		};
		const [a, b, c] = await Promise.all([dedup("k", fn), dedup("k", fn), dedup("k", fn)]);
		expect(calls).toBe(1);
		expect(a).toBe("result");
		expect(b).toBe("result");
		expect(c).toBe("result");
	});

	test("different keys do not share", async () => {
		let calls = 0;
		const fn = async () => {
			calls++;
			return calls;
		};
		await Promise.all([dedup("a", fn), dedup("b", fn)]);
		expect(calls).toBe(2);
	});

	test("entry removed after settle so subsequent calls re-run", async () => {
		let calls = 0;
		const fn = async () => {
			calls++;
			return calls;
		};
		await dedup("k2", fn);
		await dedup("k2", fn);
		expect(calls).toBe(2);
	});

	test("entry removed even when fn rejects", async () => {
		let calls = 0;
		const fn = async () => {
			calls++;
			throw new Error("boom");
		};
		await expect(dedup("k3", fn)).rejects.toThrow("boom");
		await expect(dedup("k3", fn)).rejects.toThrow("boom");
		expect(calls).toBe(2);
	});
});
