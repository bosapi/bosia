import { beforeEach, describe, expect, test } from "bun:test";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import {
	buildCompressedVariants,
	cacheClear,
	cacheGet,
	cacheSet,
	coalesceMiss,
	collectTags,
	computeCacheKey,
	computeIdentityHash,
	concatChunks,
	deferCacheWrite,
	depsReadIgnoredParams,
	invalidate,
	invalidateAll,
	isIgnoredParam,
	markWholeQueryRead,
	markQueryAware,
	parseIgnoreParams,
	parseMs,
	readBodyForCache,
	serveCached,
	stripIgnoredParams,
	varyBlocksCache,
	type CacheEntry,
} from "../src/core/cache.ts";
import { CookieJar } from "../src/core/cookies.ts";
import type { LoaderDeps } from "../src/core/hooks.ts";

// ─── Helpers ─────────────────────────────────────────────

function mkCookies(jar: Record<string, string> = {}): CookieJar {
	return new CookieJar(
		Object.entries(jar)
			.map(([k, v]) => `${k}=${v}`)
			.join("; "),
	);
}

function mkRequest(url: string, headers: Record<string, string> = {}): Request {
	return new Request(url, { headers });
}

function emptyDeps(): LoaderDeps {
	return { keys: [], urls: [], params: [], searchParams: [], cookies: [], uses_url: false };
}

function mkEntry(overrides: Partial<CacheEntry> = {}): CacheEntry {
	const raw = new Uint8Array(new ArrayBuffer(4));
	raw.set([1, 2, 3, 4]);
	return {
		raw: raw as Uint8Array<ArrayBuffer>,
		gzip: null,
		brotli: null,
		contentType: "text/html; charset=utf-8",
		status: 200,
		extraHeaders: {},
		tags: [],
		...overrides,
	};
}

beforeEach(() => {
	cacheClear();
});

// ─── computeIdentityHash ─────────────────────────────────

describe("computeIdentityHash", () => {
	test("returns '0' when no CACHE_KEYS cookies or headers present", () => {
		const req = mkRequest("http://localhost/");
		expect(computeIdentityHash(req, mkCookies())).toBe("0");
	});

	test("digest is stable sha256 (cache keys survive the Bun.CryptoHasher → node:crypto swap)", () => {
		const req = mkRequest("http://localhost/");
		expect(computeIdentityHash(req, mkCookies({ session: "alice" }))).toBe("e473be40962b70f8");
	});

	test("differs when a CACHE_KEYS cookie differs", () => {
		const req = mkRequest("http://localhost/");
		const a = computeIdentityHash(req, mkCookies({ session: "alice" }));
		const b = computeIdentityHash(req, mkCookies({ session: "bob" }));
		expect(a).not.toBe(b);
	});

	test("matches when same CACHE_KEYS cookie value", () => {
		const req = mkRequest("http://localhost/");
		const a = computeIdentityHash(req, mkCookies({ session: "alice" }));
		const b = computeIdentityHash(req, mkCookies({ session: "alice" }));
		expect(a).toBe(b);
	});

	test("ignores cookies not named in CACHE_KEYS", () => {
		const req = mkRequest("http://localhost/");
		const a = computeIdentityHash(req, mkCookies({ tracking: "x" }));
		expect(a).toBe("0");
	});

	test("Authorization header participates in identity", () => {
		const a = computeIdentityHash(mkRequest("http://localhost/"), mkCookies());
		const b = computeIdentityHash(
			mkRequest("http://localhost/", { Authorization: "Bearer x" }),
			mkCookies(),
		);
		expect(a).not.toBe(b);
	});

	test("order of cookies does not change hash", () => {
		const a = computeIdentityHash(
			mkRequest("http://localhost/"),
			mkCookies({ session: "s", auth: "a" }),
		);
		const b = computeIdentityHash(
			mkRequest("http://localhost/"),
			mkCookies({ auth: "a", session: "s" }),
		);
		expect(a).toBe(b);
	});

	test("does not count as a cookie read (accessed stays false, readNames empty)", () => {
		const jar = mkCookies({ session: "alice" });
		computeIdentityHash(mkRequest("http://localhost/"), jar);
		expect(jar.accessed).toBe(false);
		expect([...jar.readNames]).toEqual([]);
	});
});

// ─── computeCacheKey ─────────────────────────────────────

describe("computeCacheKey", () => {
	test("normalizes query order (delegates to dedupKey)", () => {
		const a = computeCacheKey(
			new URL("http://localhost/x?b=2&a=1"),
			mkRequest("http://x/"),
			mkCookies(),
		);
		const b = computeCacheKey(
			new URL("http://localhost/x?a=1&b=2"),
			mkRequest("http://x/"),
			mkCookies(),
		);
		expect(a).toBe(b);
	});

	test("appends |i=<hash> suffix", () => {
		const k = computeCacheKey(new URL("http://localhost/x"), mkRequest("http://x/"), mkCookies());
		expect(k).toMatch(/\|i=/);
	});

	test("different identity → different key for same URL", () => {
		const url = new URL("http://localhost/x");
		const a = computeCacheKey(url, mkRequest("http://x/"), mkCookies({ session: "alice" }));
		const b = computeCacheKey(url, mkRequest("http://x/"), mkCookies({ session: "bob" }));
		expect(a).not.toBe(b);
	});

	test("different host or protocol → different key (spoofed Host can't poison)", () => {
		const k = (u: string) => computeCacheKey(new URL(u), mkRequest("http://x/"), mkCookies());
		expect(k("http://app.com/x")).not.toBe(k("http://evil.com/x"));
		expect(k("http://app.com/x")).not.toBe(k("https://app.com/x"));
	});
});

// ─── collectTags ─────────────────────────────────────────

describe("collectTags", () => {
	test("returns [] for null inputs", () => {
		expect(collectTags(null, null)).toEqual([]);
	});

	test("prefixes keys with 'k:' and urls with 'u:'", () => {
		const deps: LoaderDeps = {
			...emptyDeps(),
			keys: ["app:user"],
			urls: ["http://localhost/api/posts"],
		};
		expect(collectTags(null, deps).sort()).toEqual(
			["k:app:user", "u:http://localhost/api/posts"].sort(),
		);
	});

	test("merges layoutDeps array with pageDeps and dedupes", () => {
		const a: LoaderDeps = { ...emptyDeps(), keys: ["app:user"] };
		const b: LoaderDeps = { ...emptyDeps(), keys: ["app:user", "app:other"] };
		const tags = collectTags([a, null, b], a);
		expect(tags.sort()).toEqual(["k:app:other", "k:app:user"]);
	});
});

// ─── cacheGet / cacheSet ─────────────────────────────────

describe("cacheGet / cacheSet", () => {
	test("round-trip: set then get returns same entry", () => {
		const entry = mkEntry();
		cacheSet("/x|o=http://localhost|i=0", entry);
		expect(cacheGet("/x|o=http://localhost|i=0")).toBe(entry);
	});

	test("miss returns undefined", () => {
		expect(cacheGet("/missing|o=http://localhost|i=0")).toBeUndefined();
	});

	test("body larger than CACHE_MAX_BODY_BYTES is not stored", async () => {
		const { CACHE_MAX_BODY_BYTES } = await import("../src/core/cache.ts");
		const oversized = new Uint8Array(
			new ArrayBuffer(CACHE_MAX_BODY_BYTES + 1),
		) as Uint8Array<ArrayBuffer>;
		cacheSet("/huge|o=http://localhost|i=0", mkEntry({ raw: oversized }));
		expect(cacheGet("/huge|o=http://localhost|i=0")).toBeUndefined();
		// exactly at the limit still stores
		const atLimit = new Uint8Array(
			new ArrayBuffer(CACHE_MAX_BODY_BYTES),
		) as Uint8Array<ArrayBuffer>;
		cacheSet("/fit|o=http://localhost|i=0", mkEntry({ raw: atLimit }));
		expect(cacheGet("/fit|o=http://localhost|i=0")).toBeDefined();
	});

	test("CACHE_MAX_BYTES evicts the oldest entries once the total passes it", async () => {
		const { CACHE_MAX_BYTES, CACHE_MAX_BODY_BYTES } = await import("../src/core/cache.ts");
		// 0 means "no limit" for either; nothing to fill then.
		if (CACHE_MAX_BYTES === 0 || CACHE_MAX_BODY_BYTES === 0) return;
		// One shared buffer for all three copies: weighed as 3×, allocated once.
		const buf = new Uint8Array(new ArrayBuffer(CACHE_MAX_BODY_BYTES)) as Uint8Array<ArrayBuffer>;
		const per = buf.byteLength * 3;
		const fits = Math.floor(CACHE_MAX_BYTES / per);
		for (let i = 0; i <= fits; i++) {
			cacheSet(`/big-${i}|o=http://localhost|i=0`, mkEntry({ raw: buf, gzip: buf, brotli: buf }));
		}
		expect(cacheGet("/big-0|o=http://localhost|i=0")).toBeUndefined();
		expect(cacheGet(`/big-${fits}|o=http://localhost|i=0`)).toBeDefined();
		// The evicted entry left no path index behind.
		expect(invalidate("/big-0")).toBe(0);
	});

	test("warns loudly once per cookie read that is not in CACHE_KEYS", () => {
		const warnings: string[] = [];
		const orig = console.warn;
		console.warn = (msg: unknown) => warnings.push(String(msg));
		try {
			const jar = new CookieJar("my_app_sess=abc; session=xyz");
			jar.get("my_app_sess");
			jar.get("session");
			cacheSet("/warn-a|o=http://localhost|i=0", mkEntry(), jar);
			cacheSet("/warn-b|o=http://localhost|i=0", mkEntry(), jar); // same name → no second warning
		} finally {
			console.warn = orig;
		}
		const hits = warnings.filter((w) => w.includes('"my_app_sess"'));
		expect(hits.length).toBe(1);
		expect(hits[0]).toContain("CACHE_KEYS");
		// registered key never warns
		expect(warnings.some((w) => w.includes('"session"'))).toBe(false);
		// entry still cached — warning does not block the write
		expect(cacheGet("/warn-a|o=http://localhost|i=0")).toBeDefined();
	});

	test("overwriting same key replaces the entry and updates index", () => {
		const first = mkEntry({ tags: ["k:a"] });
		const second = mkEntry({ tags: ["k:b"] });
		cacheSet("/x|o=http://localhost|i=0", first);
		cacheSet("/x|o=http://localhost|i=0", second);
		expect(cacheGet("/x|o=http://localhost|i=0")).toBe(second);
		// First entry's tag should no longer evict the key
		invalidate("a");
		expect(cacheGet("/x|o=http://localhost|i=0")).toBe(second);
		// Second entry's tag should evict it
		invalidate("b");
		expect(cacheGet("/x|o=http://localhost|i=0")).toBeUndefined();
	});

	test("LRU eviction cleans the evicted entry's tag index, leaving live keys alone", async () => {
		const { CACHE_MAX_ENTRIES } = await import("../src/core/cache.ts");
		// Oldest tagged entry — will be pushed out by the LRU.
		cacheSet("/evictme|o=http://localhost|i=0", mkEntry({ tags: ["k:gone"] }));
		// Second-oldest, different tag — must survive.
		cacheSet("/keep|o=http://localhost|i=0", mkEntry({ tags: ["k:live"] }));
		// Push exactly one entry past the cap so only /evictme (the oldest) evicts.
		for (let i = 0; i < CACHE_MAX_ENTRIES - 1; i++)
			cacheSet(`/fill-${i}|o=http://localhost|i=0`, mkEntry());
		expect(cacheGet("/evictme|o=http://localhost|i=0")).toBeUndefined();
		expect(cacheGet("/keep|o=http://localhost|i=0")).toBeDefined();
		// Evicted entry's tag must leave no dangling pointer: a stale pointer would
		// make invalidate count it (return 1). Targeted cleanup → the tag is gone.
		expect(invalidate("gone")).toBe(0);
		// Live sibling's tag still resolves and evicts it.
		expect(invalidate("live")).toBe(1);
		expect(cacheGet("/keep|o=http://localhost|i=0")).toBeUndefined();
	});
});

// ─── coalesceMiss ────────────────────────────────────────

describe("coalesceMiss", () => {
	test("first caller becomes leader, concurrent caller becomes waiter", () => {
		const leader = coalesceMiss("/cm/a|o=http://localhost|i=0");
		expect(typeof leader.release).toBe("function");
		expect(leader.wait).toBeUndefined();
		const waiter = coalesceMiss("/cm/a|o=http://localhost|i=0");
		expect(waiter.wait).toBeInstanceOf(Promise);
		expect(waiter.release).toBeUndefined();
		leader.release!();
	});

	test("waiter re-check hits when leader writes in a microtask before release", async () => {
		const key = "/cm/b|o=http://localhost|i=0";
		const leader = coalesceMiss(key);
		const waiter = coalesceMiss(key);
		// Mirrors the production handoff: cacheSet + release inside queueMicrotask.
		queueMicrotask(() => {
			cacheSet(key, mkEntry());
			leader.release!();
		});
		await waiter.wait!;
		expect(cacheGet(key)).toBeDefined();
	});

	test("waiter is not resumed before the leader releases", async () => {
		const key = "/cm/c|o=http://localhost|i=0";
		const leader = coalesceMiss(key);
		const waiter = coalesceMiss(key);
		let resumed = false;
		const done = waiter.wait!.then(() => {
			resumed = true;
		});
		await Promise.resolve();
		await Promise.resolve();
		expect(resumed).toBe(false);
		leader.release!();
		await done;
		expect(resumed).toBe(true);
	});

	test("leader released without writing → waiter re-check misses", async () => {
		const key = "/cm/d|o=http://localhost|i=0";
		const leader = coalesceMiss(key);
		const waiter = coalesceMiss(key);
		leader.release!();
		await waiter.wait!;
		expect(cacheGet(key)).toBeUndefined();
	});

	test("caller after release becomes a new leader", () => {
		const key = "/cm/e|o=http://localhost|i=0";
		const first = coalesceMiss(key);
		first.release!();
		const second = coalesceMiss(key);
		expect(typeof second.release).toBe("function");
		second.release!();
	});

	test("release is idempotent and never deletes a successor leader's gate", () => {
		const key = "/cm/f|o=http://localhost|i=0";
		const first = coalesceMiss(key);
		first.release!();
		const second = coalesceMiss(key);
		first.release!(); // stale double-release must not evict the new gate
		const third = coalesceMiss(key);
		expect(third.wait).toBeInstanceOf(Promise);
		second.release!();
	});
});

// ─── invalidate by tag key (k:) ──────────────────────────

describe("invalidate(key) by depends() tag", () => {
	test("evicts all entries tagged with the matching k: tag", () => {
		cacheSet("/a|o=http://localhost|i=0", mkEntry({ tags: ["k:app:user"] }));
		cacheSet("/b|o=http://localhost|i=0", mkEntry({ tags: ["k:app:user"] }));
		cacheSet("/c|o=http://localhost|i=0", mkEntry({ tags: ["k:other"] }));
		const removed = invalidate("app:user");
		expect(removed).toBe(2);
		expect(cacheGet("/a|o=http://localhost|i=0")).toBeUndefined();
		expect(cacheGet("/b|o=http://localhost|i=0")).toBeUndefined();
		expect(cacheGet("/c|o=http://localhost|i=0")).toBeDefined();
	});

	test("returns 0 when no entries match", () => {
		cacheSet("/a|o=http://localhost|i=0", mkEntry({ tags: ["k:app:user"] }));
		expect(invalidate("never:matches")).toBe(0);
		expect(cacheGet("/a|o=http://localhost|i=0")).toBeDefined();
	});
});

// ─── invalidate by URL path ──────────────────────────────

describe("invalidate(/path)", () => {
	test("evicts entries tagged with a fetch URL whose path equals key", () => {
		cacheSet("/page|o=http://localhost|i=0", mkEntry({ tags: ["u:http://localhost/api/posts"] }));
		cacheSet("/other|o=http://localhost|i=0", mkEntry({ tags: ["u:http://localhost/api/users"] }));
		const removed = invalidate("/api/posts");
		expect(removed).toBe(1);
		expect(cacheGet("/page|o=http://localhost|i=0")).toBeUndefined();
		expect(cacheGet("/other|o=http://localhost|i=0")).toBeDefined();
	});

	test("evicts cache entries whose own path equals key", () => {
		cacheSet("/api/posts|o=http://localhost|i=0", mkEntry({ tags: [] }));
		const removed = invalidate("/api/posts");
		expect(removed).toBe(1);
		expect(cacheGet("/api/posts|o=http://localhost|i=0")).toBeUndefined();
	});

	test("a path with a raw `|` is indexed whole", () => {
		const key = (p: string) =>
			computeCacheKey(new URL(`http://localhost${p}`), mkRequest("http://x/"), mkCookies());
		cacheSet(key("/files/a|b"), mkEntry({ tags: [] }));
		cacheSet(key("/files/a"), mkEntry({ tags: [] }));
		expect(invalidate("/files/a|b")).toBe(1);
		expect(cacheGet(key("/files/a"))).toBeDefined();
	});

	test("treats /path differently from a bare key", () => {
		cacheSet("/x|o=http://localhost|i=0", mkEntry({ tags: ["k:app:user"] }));
		// `/app:user` should NOT match `k:app:user` tag
		expect(invalidate("/app:user")).toBe(0);
		expect(cacheGet("/x|o=http://localhost|i=0")).toBeDefined();
	});
});

// ─── invalidateAll(prefix) ───────────────────────────────

describe("invalidateAll(prefix)", () => {
	test("evicts every entry whose path starts with prefix", () => {
		cacheSet("/products/1|o=http://localhost|i=0", mkEntry());
		cacheSet("/products/2|o=http://localhost|i=0", mkEntry());
		cacheSet("/about|o=http://localhost|i=0", mkEntry());
		const removed = invalidateAll("/products/");
		expect(removed).toBe(2);
		expect(cacheGet("/products/1|o=http://localhost|i=0")).toBeUndefined();
		expect(cacheGet("/products/2|o=http://localhost|i=0")).toBeUndefined();
		expect(cacheGet("/about|o=http://localhost|i=0")).toBeDefined();
	});

	test("returns 0 when no path matches", () => {
		cacheSet("/about|o=http://localhost|i=0", mkEntry());
		expect(invalidateAll("/nothing/")).toBe(0);
	});

	test("ignores query string when matching prefix (pathOfKey strips ?)", () => {
		cacheSet("/products/1?ref=x|o=http://localhost|i=0", mkEntry());
		expect(invalidateAll("/products/")).toBe(1);
	});
});

// ─── buildCompressedVariants ─────────────────────────────

describe("buildCompressedVariants", () => {
	test("returns nulls when body is below COMPRESS_MIN_BYTES", () => {
		const small = new Uint8Array(new ArrayBuffer(100)) as Uint8Array<ArrayBuffer>;
		expect(buildCompressedVariants(small)).toEqual({ gzip: null, brotli: null });
	});

	test("returns gzip and brotli for large body", () => {
		const buf = new ArrayBuffer(8192);
		const big = new Uint8Array(buf) as Uint8Array<ArrayBuffer>;
		for (let i = 0; i < big.length; i++) big[i] = i % 251;
		const { gzip, brotli } = buildCompressedVariants(big);
		expect(gzip).toBeInstanceOf(Uint8Array);
		expect(gzip!.length).toBeGreaterThan(0);
		expect(brotli).toBeInstanceOf(Uint8Array);
		expect(brotli!.length).toBeGreaterThan(0);
	});

	test("gzip variant decompresses back to the body", async () => {
		const big = new Uint8Array(new ArrayBuffer(8192)) as Uint8Array<ArrayBuffer>;
		for (let i = 0; i < big.length; i++) big[i] = i % 251;
		const { gunzipSync } = await import("node:zlib");
		expect(new Uint8Array(gunzipSync(buildCompressedVariants(big).gzip!))).toEqual(big);
	});

	test("brotli variant round-trips through serveCached with Accept-Encoding: br", async () => {
		const buf = new ArrayBuffer(8192);
		const big = new Uint8Array(buf) as Uint8Array<ArrayBuffer>;
		for (let i = 0; i < big.length; i++) big[i] = i % 251;
		const { gzip, brotli } = buildCompressedVariants(big);
		const entry = mkEntry({ raw: big, gzip, brotli });
		const res = serveCached(entry, mkRequest("http://x/", { "Accept-Encoding": "br" }));
		expect(res.headers.get("Content-Encoding")).toBe("br");
		const { brotliDecompressSync } = await import("node:zlib");
		const body = new Uint8Array(brotliDecompressSync(await res.arrayBuffer()));
		expect(body).toEqual(big);
	});

	test("a prebuilt variant is reused and only the other one is built", () => {
		const big = new Uint8Array(new ArrayBuffer(8192)) as Uint8Array<ArrayBuffer>;
		for (let i = 0; i < big.length; i++) big[i] = i % 251;
		const brotli = new Uint8Array(new ArrayBuffer(3)) as Uint8Array<ArrayBuffer>;
		const out = buildCompressedVariants(big, { brotli });
		expect(out.brotli).toBe(brotli);
		expect(out.gzip).toBeInstanceOf(Uint8Array);

		const gzip = new Uint8Array(new ArrayBuffer(3)) as Uint8Array<ArrayBuffer>;
		const out2 = buildCompressedVariants(big, { gzip });
		expect(out2.gzip).toBe(gzip);
		expect(out2.brotli!.length).toBeGreaterThan(3);
	});
});

// Workers re-compresses a body sent with Content-Encoding unless the init says
// `encodeBody: "manual"` — a cache hit came back as brotli-inside-gzip. Bun
// ignores the key, so assert it's passed rather than the bytes.
describe("precompressed responses opt out of runtime re-encoding", () => {
	function captureInits(run: () => void): ResponseInit[] {
		const inits: ResponseInit[] = [];
		const Real = globalThis.Response;
		globalThis.Response = class extends Real {
			constructor(body?: BodyInit | null, init?: ResponseInit) {
				super(body, init);
				if (init) inits.push(init);
			}
		} as typeof Response;
		try {
			run();
		} finally {
			globalThis.Response = Real;
		}
		return inits;
	}
	const big = new Uint8Array(new ArrayBuffer(8192)) as Uint8Array<ArrayBuffer>;
	for (let i = 0; i < big.length; i++) big[i] = i % 251;

	test("cache hits, br and gzip", () => {
		const entry = mkEntry({ raw: big, ...buildCompressedVariants(big) });
		const inits = captureInits(() => {
			serveCached(entry, mkRequest("http://x/", { "Accept-Encoding": "br" }));
			serveCached(entry, mkRequest("http://x/", { "Accept-Encoding": "gzip" }));
		});
		expect(inits.map((i) => (i as { encodeBody?: string }).encodeBody)).toEqual([
			"manual",
			"manual",
		]);
	});
});

// ─── concatChunks ────────────────────────────────────────

describe("varyBlocksCache", () => {
	test("only Accept-Encoding is honored by the key", () => {
		expect(varyBlocksCache(null)).toBe(false);
		expect(varyBlocksCache("Accept-Encoding")).toBe(false);
		expect(varyBlocksCache("Origin")).toBe(true);
		expect(varyBlocksCache("Cookie")).toBe(true);
		expect(varyBlocksCache("accept-encoding, Accept-Language")).toBe(true);
		expect(varyBlocksCache("*")).toBe(true);
	});
});

describe("readBodyForCache", () => {
	test("returns the whole body when it fits", async () => {
		const buf = await readBodyForCache(new Response("hello"));
		expect(new TextDecoder().decode(buf!)).toBe("hello");
	});

	test("encodes string chunks instead of corrupting them", async () => {
		const res = new Response(
			new ReadableStream({
				start(c) {
					c.enqueue('{"a":');
					c.enqueue(new TextEncoder().encode("1}"));
					c.close();
				},
			}),
		);
		const buf = await readBodyForCache(res.clone());
		expect(new TextDecoder().decode(buf!)).toBe('{"a":1}');
	});

	test("gives up and cancels the copy past CACHE_MAX_BODY_BYTES", async () => {
		const { CACHE_MAX_BODY_BYTES } = await import("../src/core/cache.ts");
		let pulled = 0;
		let cancelled = false;
		const chunk = new Uint8Array(64 * 1024);
		const res = new Response(
			new ReadableStream({
				pull(c) {
					pulled += chunk.byteLength;
					c.enqueue(chunk);
				},
				cancel() {
					cancelled = true;
				},
			}),
		);
		expect(await readBodyForCache(res)).toBeNull();
		expect(cancelled).toBe(true);
		expect(pulled).toBeLessThan(CACHE_MAX_BODY_BYTES + 4 * chunk.byteLength);
	});
});

describe("concatChunks", () => {
	test("concatenates multiple chunks in order", () => {
		const a = new Uint8Array([1, 2]);
		const b = new Uint8Array([3, 4, 5]);
		const c = new Uint8Array([6]);
		const out = concatChunks([a, b, c]);
		expect(Array.from(out)).toEqual([1, 2, 3, 4, 5, 6]);
	});

	test("empty input → empty Uint8Array", () => {
		const out = concatChunks([]);
		expect(out.length).toBe(0);
	});
});

// ─── serveCached ─────────────────────────────────────────

describe("serveCached", () => {
	function bytes(arr: number[]): Uint8Array<ArrayBuffer> {
		const u = new Uint8Array(new ArrayBuffer(arr.length));
		u.set(arr);
		return u as Uint8Array<ArrayBuffer>;
	}

	test("sets X-Bosia-Cache: HIT and Vary header", async () => {
		const entry = mkEntry();
		const res = serveCached(entry, mkRequest("http://x/"));
		expect(res.headers.get("X-Bosia-Cache")).toBe("HIT");
		expect(res.headers.get("Vary")).toBe("Accept-Encoding");
	});

	test("returns brotli when Accept-Encoding includes br and brotli available", async () => {
		const entry = mkEntry({
			raw: bytes([1]),
			brotli: bytes([2]),
			gzip: bytes([3]),
		});
		const res = serveCached(entry, mkRequest("http://x/", { "Accept-Encoding": "br, gzip" }));
		expect(res.headers.get("Content-Encoding")).toBe("br");
		const body = new Uint8Array(await res.arrayBuffer());
		expect(Array.from(body)).toEqual([2]);
	});

	test("falls back to gzip when client accepts gzip but not br", async () => {
		const entry = mkEntry({
			raw: bytes([1]),
			brotli: bytes([2]),
			gzip: bytes([3]),
		});
		const res = serveCached(entry, mkRequest("http://x/", { "Accept-Encoding": "gzip" }));
		expect(res.headers.get("Content-Encoding")).toBe("gzip");
		const body = new Uint8Array(await res.arrayBuffer());
		expect(Array.from(body)).toEqual([3]);
	});

	test("returns identity (raw) when no encoding accepted", async () => {
		const entry = mkEntry({
			raw: bytes([1]),
			brotli: bytes([2]),
			gzip: bytes([3]),
		});
		const res = serveCached(entry, mkRequest("http://x/"));
		expect(res.headers.get("Content-Encoding")).toBeNull();
		const body = new Uint8Array(await res.arrayBuffer());
		expect(Array.from(body)).toEqual([1]);
	});

	test("returns raw when gzip/brotli are null even if client accepts them", async () => {
		const entry = mkEntry({ raw: bytes([1]) });
		const res = serveCached(entry, mkRequest("http://x/", { "Accept-Encoding": "br, gzip" }));
		expect(res.headers.get("Content-Encoding")).toBeNull();
	});

	test("merges extraHeaders into the response", async () => {
		const entry = mkEntry({ extraHeaders: { "Cache-Control": "public, max-age=60" } });
		const res = serveCached(entry, mkRequest("http://x/"));
		expect(res.headers.get("Cache-Control")).toBe("public, max-age=60");
	});

	test("honors status code from the entry", () => {
		const entry = mkEntry({ status: 200 });
		const res = serveCached(entry, mkRequest("http://x/"));
		expect(res.status).toBe(200);
	});
});

// ─── cacheClear ──────────────────────────────────────────

describe("cacheClear", () => {
	test("removes all entries and tag/path indexes", () => {
		cacheSet("/a|o=http://localhost|i=0", mkEntry({ tags: ["k:x"] }));
		cacheSet("/b|o=http://localhost|i=0", mkEntry({ tags: ["k:y"] }));
		cacheClear();
		expect(cacheGet("/a|o=http://localhost|i=0")).toBeUndefined();
		expect(cacheGet("/b|o=http://localhost|i=0")).toBeUndefined();
		expect(invalidate("x")).toBe(0);
		expect(invalidate("y")).toBe(0);
	});
});

// A microtask write ran before the awaiting caller got the response back, so
// compressing the cache variants delayed the first byte.
describe("deferCacheWrite", () => {
	test("runs after the awaiting caller has its response", async () => {
		const order: string[] = [];
		async function render() {
			deferCacheWrite(() => {
				order.push("cache write");
			});
			return "response";
		}
		async function handle() {
			await render();
			order.push("response returned");
		}
		await handle();
		await new Promise((r) => setImmediate(r));
		expect(order).toEqual(["response returned", "cache write"]);
	});
});

// ─── Tracking params (CACHE_IGNORE_PARAMS) ───────────────

describe("CACHE_IGNORE_PARAMS", () => {
	test("parses names and `prefix*`; unset or empty is the default list", () => {
		const custom = parseIgnoreParams(" ref , utm_* ,, campaign ");
		expect([...custom.names].sort()).toEqual(["campaign", "ref"]);
		expect(custom.prefixes).toEqual(["utm_"]);
		const dflt = parseIgnoreParams(undefined);
		expect(dflt.names.has("fbclid")).toBe(true);
		expect(dflt.prefixes).toEqual(["utm_"]);
		expect(parseIgnoreParams("  ").names.has("gclid")).toBe(true);
	});

	test("`none` ignores nothing, and a bare `*` never matches every param", () => {
		const none = parseIgnoreParams("none");
		expect(none.names.size + none.prefixes.length).toBe(0);
		const star = parseIgnoreParams("*");
		expect(star.names.size + star.prefixes.length).toBe(0);
	});

	test("default list matches click ids and utm_*, not ordinary params", () => {
		for (const p of ["utm_source", "utm_whatever", "fbclid", "gclid", "msclkid"]) {
			expect(isIgnoredParam(p)).toBe(true);
		}
		for (const p of ["page", "q", "ref", "utm", "id"]) expect(isIgnoredParam(p)).toBe(false);
	});

	test("strip keeps other params and returns the same URL when nothing matched", () => {
		const plain = new URL("http://x/blog?page=2");
		expect(stripIgnoredParams(plain)).toBe(plain);
		const ad = new URL("http://x/blog?utm_source=a&page=2&fbclid=z");
		const stripped = stripIgnoredParams(ad);
		expect(stripped).not.toBe(ad);
		expect(stripped.search).toBe("?page=2");
		expect(ad.search).toBe("?utm_source=a&page=2&fbclid=z");
		expect(
			computeCacheKey(stripped, mkRequest("http://x/"), mkCookies()) ===
				computeCacheKey(new URL("http://x/blog?page=2"), mkRequest("http://x/"), mkCookies()),
		).toBe(true);
	});

	test("an entry is query-aware when a loader read an ignored param or the whole query", () => {
		const reads = (names: string[]) => ({ ...emptyDeps(), searchParams: names });
		expect(depsReadIgnoredParams([reads(["page"])], reads(["q"]))).toBe(false);
		expect(depsReadIgnoredParams(null, reads(["utm_source"]))).toBe(true);
		expect(depsReadIgnoredParams([null, reads(["gclid"])], null)).toBe(true);
		const whole = emptyDeps();
		markWholeQueryRead(whole);
		expect(depsReadIgnoredParams([whole], null)).toBe(true);
		// Server-only: query-aware without a client-visible "*".
		const below = emptyDeps();
		markQueryAware(below);
		expect(depsReadIgnoredParams(null, below)).toBe(true);
		expect(below.searchParams).toEqual([]);
	});
});

describe("parseMs", () => {
	test("unset or blank is the fallback; 0 and Infinity mean no limit", () => {
		expect(parseMs(undefined, 30_000, "X")).toBe(30_000);
		expect(parseMs(" ", 30_000, "X")).toBe(30_000);
		expect(parseMs("0", 30_000, "X")).toBe(0);
		expect(parseMs("Infinity", 30_000, "X")).toBe(0);
		expect(parseMs("infinity", 30_000, "X")).toBe(0);
		expect(parseMs(" 2500 ", 30_000, "X")).toBe(2500);
		// setTimeout fires at once above 2^31-1.
		expect(parseMs("9999999999", 30_000, "X")).toBe(2_147_483_647);
	});

	test("the derived CACHE_WAIT_TIMEOUT stays a valid timer delay", async () => {
		const script = `const { CACHE_WAIT_TIMEOUT } = await import(${JSON.stringify(
			pathToFileURL(join(import.meta.dir, "../src/core/cache.ts")).href,
		)}); console.log(CACHE_WAIT_TIMEOUT);`;
		const proc = Bun.spawn(["bun", "-e", script], {
			env: { ...process.env, LOAD_TIMEOUT: "2147483647", CACHE_WAIT_TIMEOUT: "" },
			stdout: "pipe",
		});
		const out = (await new Response(proc.stdout).text()).trim().split("\n").pop();
		expect(Number(out)).toBe(2_147_483_647);
	});

	test("a value that isn't whole milliseconds warns and uses the fallback", () => {
		const warn = console.warn;
		const seen: string[] = [];
		console.warn = (msg: string) => seen.push(msg);
		try {
			for (const v of ["10s", "1e4", "-1", "2.5"]) expect(parseMs(v, 7, "X")).toBe(7);
		} finally {
			console.warn = warn;
		}
		expect(seen.length).toBe(4);
	});
});
