import { beforeEach, describe, expect, test } from "bun:test";
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
	invalidate,
	invalidateAll,
	serveCached,
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
		cacheSet("/x|i=0", entry);
		expect(cacheGet("/x|i=0")).toBe(entry);
	});

	test("miss returns undefined", () => {
		expect(cacheGet("/missing|i=0")).toBeUndefined();
	});

	test("body larger than CACHE_MAX_BODY_BYTES is not stored", async () => {
		const { CACHE_MAX_BODY_BYTES } = await import("../src/core/cache.ts");
		const oversized = new Uint8Array(
			new ArrayBuffer(CACHE_MAX_BODY_BYTES + 1),
		) as Uint8Array<ArrayBuffer>;
		cacheSet("/huge|i=0", mkEntry({ raw: oversized }));
		expect(cacheGet("/huge|i=0")).toBeUndefined();
		// exactly at the limit still stores
		const atLimit = new Uint8Array(
			new ArrayBuffer(CACHE_MAX_BODY_BYTES),
		) as Uint8Array<ArrayBuffer>;
		cacheSet("/fit|i=0", mkEntry({ raw: atLimit }));
		expect(cacheGet("/fit|i=0")).toBeDefined();
	});

	test("warns loudly once per cookie read that is not in CACHE_KEYS", () => {
		const warnings: string[] = [];
		const orig = console.warn;
		console.warn = (msg: unknown) => warnings.push(String(msg));
		try {
			const jar = new CookieJar("my_app_sess=abc; session=xyz");
			jar.get("my_app_sess");
			jar.get("session");
			cacheSet("/warn-a|i=0", mkEntry(), jar);
			cacheSet("/warn-b|i=0", mkEntry(), jar); // same name → no second warning
		} finally {
			console.warn = orig;
		}
		const hits = warnings.filter((w) => w.includes('"my_app_sess"'));
		expect(hits.length).toBe(1);
		expect(hits[0]).toContain("CACHE_KEYS");
		// registered key never warns
		expect(warnings.some((w) => w.includes('"session"'))).toBe(false);
		// entry still cached — warning does not block the write
		expect(cacheGet("/warn-a|i=0")).toBeDefined();
	});

	test("overwriting same key replaces the entry and updates index", () => {
		const first = mkEntry({ tags: ["k:a"] });
		const second = mkEntry({ tags: ["k:b"] });
		cacheSet("/x|i=0", first);
		cacheSet("/x|i=0", second);
		expect(cacheGet("/x|i=0")).toBe(second);
		// First entry's tag should no longer evict the key
		invalidate("a");
		expect(cacheGet("/x|i=0")).toBe(second);
		// Second entry's tag should evict it
		invalidate("b");
		expect(cacheGet("/x|i=0")).toBeUndefined();
	});

	test("LRU eviction cleans the evicted entry's tag index, leaving live keys alone", async () => {
		const { CACHE_MAX_ENTRIES } = await import("../src/core/cache.ts");
		// Oldest tagged entry — will be pushed out by the LRU.
		cacheSet("/evictme|i=0", mkEntry({ tags: ["k:gone"] }));
		// Second-oldest, different tag — must survive.
		cacheSet("/keep|i=0", mkEntry({ tags: ["k:live"] }));
		// Push exactly one entry past the cap so only /evictme (the oldest) evicts.
		for (let i = 0; i < CACHE_MAX_ENTRIES - 1; i++) cacheSet(`/fill-${i}|i=0`, mkEntry());
		expect(cacheGet("/evictme|i=0")).toBeUndefined();
		expect(cacheGet("/keep|i=0")).toBeDefined();
		// Evicted entry's tag must leave no dangling pointer: a stale pointer would
		// make invalidate count it (return 1). Targeted cleanup → the tag is gone.
		expect(invalidate("gone")).toBe(0);
		// Live sibling's tag still resolves and evicts it.
		expect(invalidate("live")).toBe(1);
		expect(cacheGet("/keep|i=0")).toBeUndefined();
	});
});

// ─── coalesceMiss ────────────────────────────────────────

describe("coalesceMiss", () => {
	test("first caller becomes leader, concurrent caller becomes waiter", () => {
		const leader = coalesceMiss("/cm/a|i=0");
		expect(typeof leader.release).toBe("function");
		expect(leader.wait).toBeUndefined();
		const waiter = coalesceMiss("/cm/a|i=0");
		expect(waiter.wait).toBeInstanceOf(Promise);
		expect(waiter.release).toBeUndefined();
		leader.release!();
	});

	test("waiter re-check hits when leader writes in a microtask before release", async () => {
		const key = "/cm/b|i=0";
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
		const key = "/cm/c|i=0";
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
		const key = "/cm/d|i=0";
		const leader = coalesceMiss(key);
		const waiter = coalesceMiss(key);
		leader.release!();
		await waiter.wait!;
		expect(cacheGet(key)).toBeUndefined();
	});

	test("caller after release becomes a new leader", () => {
		const key = "/cm/e|i=0";
		const first = coalesceMiss(key);
		first.release!();
		const second = coalesceMiss(key);
		expect(typeof second.release).toBe("function");
		second.release!();
	});

	test("release is idempotent and never deletes a successor leader's gate", () => {
		const key = "/cm/f|i=0";
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
		cacheSet("/a|i=0", mkEntry({ tags: ["k:app:user"] }));
		cacheSet("/b|i=0", mkEntry({ tags: ["k:app:user"] }));
		cacheSet("/c|i=0", mkEntry({ tags: ["k:other"] }));
		const removed = invalidate("app:user");
		expect(removed).toBe(2);
		expect(cacheGet("/a|i=0")).toBeUndefined();
		expect(cacheGet("/b|i=0")).toBeUndefined();
		expect(cacheGet("/c|i=0")).toBeDefined();
	});

	test("returns 0 when no entries match", () => {
		cacheSet("/a|i=0", mkEntry({ tags: ["k:app:user"] }));
		expect(invalidate("never:matches")).toBe(0);
		expect(cacheGet("/a|i=0")).toBeDefined();
	});
});

// ─── invalidate by URL path ──────────────────────────────

describe("invalidate(/path)", () => {
	test("evicts entries tagged with a fetch URL whose path equals key", () => {
		cacheSet("/page|i=0", mkEntry({ tags: ["u:http://localhost/api/posts"] }));
		cacheSet("/other|i=0", mkEntry({ tags: ["u:http://localhost/api/users"] }));
		const removed = invalidate("/api/posts");
		expect(removed).toBe(1);
		expect(cacheGet("/page|i=0")).toBeUndefined();
		expect(cacheGet("/other|i=0")).toBeDefined();
	});

	test("evicts cache entries whose own path equals key", () => {
		cacheSet("/api/posts|i=0", mkEntry({ tags: [] }));
		const removed = invalidate("/api/posts");
		expect(removed).toBe(1);
		expect(cacheGet("/api/posts|i=0")).toBeUndefined();
	});

	test("treats /path differently from a bare key", () => {
		cacheSet("/x|i=0", mkEntry({ tags: ["k:app:user"] }));
		// `/app:user` should NOT match `k:app:user` tag
		expect(invalidate("/app:user")).toBe(0);
		expect(cacheGet("/x|i=0")).toBeDefined();
	});
});

// ─── invalidateAll(prefix) ───────────────────────────────

describe("invalidateAll(prefix)", () => {
	test("evicts every entry whose path starts with prefix", () => {
		cacheSet("/products/1|i=0", mkEntry());
		cacheSet("/products/2|i=0", mkEntry());
		cacheSet("/about|i=0", mkEntry());
		const removed = invalidateAll("/products/");
		expect(removed).toBe(2);
		expect(cacheGet("/products/1|i=0")).toBeUndefined();
		expect(cacheGet("/products/2|i=0")).toBeUndefined();
		expect(cacheGet("/about|i=0")).toBeDefined();
	});

	test("returns 0 when no path matches", () => {
		cacheSet("/about|i=0", mkEntry());
		expect(invalidateAll("/nothing/")).toBe(0);
	});

	test("ignores query string when matching prefix (pathOfKey strips ?)", () => {
		cacheSet("/products/1?ref=x|i=0", mkEntry());
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
});

// ─── concatChunks ────────────────────────────────────────

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
		cacheSet("/a|i=0", mkEntry({ tags: ["k:x"] }));
		cacheSet("/b|i=0", mkEntry({ tags: ["k:y"] }));
		cacheClear();
		expect(cacheGet("/a|i=0")).toBeUndefined();
		expect(cacheGet("/b|i=0")).toBeUndefined();
		expect(invalidate("x")).toBe(0);
		expect(invalidate("y")).toBe(0);
	});
});
