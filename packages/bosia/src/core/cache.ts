// ─── Server-side Response Cache ──────────────────────────
// Skips load() + render() + compression on cache hit. Keyed by URL + identity
// (cookies/headers from CACHE_KEYS). Invalidated by tag (LoaderDeps.keys),
// fetch URL (LoaderDeps.urls), or exact/prefix path.
//
// See docs/guides/response-cache.md.

// node:crypto / node:zlib rather than Bun.* — the same code runs on Bun and on
// Cloudflare Workers (nodejs_compat), and both stay sync there.
import { createHash } from "node:crypto";
import type { Cookies, LoaderDeps } from "./hooks.ts";
import type { CookieJar } from "./cookies.ts";
import { dedupKey } from "./dedup.ts";
import { compressionOn, encodeBytes, PRECOMPRESSED, varyWithEncoding } from "./html.ts";
import { matchesEtag } from "./etag.ts";

// ─── Config ──────────────────────────────────────────────

function parseCacheKeys(raw: string | undefined): string[] {
	const value = raw?.trim();
	if (value === undefined || value === "") {
		return ["session", "sid", "auth", "token", "jwt", "Authorization"];
	}
	return value
		.split(",")
		.map((s) => s.trim())
		.filter(Boolean);
}

function parseMaxEntries(raw: string | undefined): number {
	if (!raw) return 500;
	const n = parseInt(raw, 10);
	if (!Number.isFinite(n) || n < 0) return 500;
	return n;
}

function parseBytes(raw: string | undefined, fallback: number): number {
	if (!raw) return fallback;
	const n = parseInt(raw, 10);
	if (!Number.isFinite(n) || n < 0) return fallback;
	return n;
}

function parseMaxBodyBytes(raw: string | undefined): number {
	return parseBytes(raw, 2_097_152); // 2MB; 0 = unlimited
}

const MAX_TIMER_MS = 2_147_483_647;

/**
 * A duration env var in whole milliseconds. Unset or blank → `fallback`;
 * `0` or `Infinity` → 0 (no limit). Anything else (`5s`, `1e4`, `-1`) warns
 * and uses `fallback` — parseInt read `10s` as 10ms.
 */
export function parseMs(raw: string | undefined, fallback: number, name: string): number {
	const value = raw?.trim();
	if (!value) return fallback;
	if (value.toLowerCase() === "infinity") return 0;
	// setTimeout overflows above 2^31-1 and fires at once.
	if (/^\d+$/.test(value)) return Math.min(Number(value), MAX_TIMER_MS);
	if (typeof console !== "undefined") {
		console.warn(`⚠️  ${name}="${raw}" is not a number of milliseconds; using ${fallback}`);
	}
	return fallback;
}

/** Ad and social click parameters: they never change what a page shows. */
const DEFAULT_IGNORE_PARAMS =
	"utm_*,fbclid,gclid,gbraid,wbraid,dclid,msclkid,twclid,ttclid,li_fat_id,igshid,yclid,mc_cid,mc_eid,_ga,_gl";

/** Comma-separated names; `name*` matches a prefix. `none` (or `-`) = ignore nothing. */
export function parseIgnoreParams(raw: string | undefined): {
	names: Set<string>;
	prefixes: string[];
} {
	let value = raw?.trim();
	if (value === undefined || value === "") value = DEFAULT_IGNORE_PARAMS;
	const names = new Set<string>();
	const prefixes: string[] = [];
	if (value === "none" || value === "-") return { names, prefixes };
	for (const part of value.split(",")) {
		const p = part.trim();
		if (!p || p === "*") continue;
		if (p.endsWith("*")) prefixes.push(p.slice(0, -1));
		else names.add(p);
	}
	return { names, prefixes };
}

// Server-only module (imported by core/renderer.ts, core/server.ts,
// lib/server.ts — never the client barrel; client `invalidate` lives in
// core/client/navigation.ts). The `process` guards below are kept as
// defense in case a future refactor pulls this into a browser bundle.
const env: Record<string, string | undefined> =
	typeof process !== "undefined" && process.env ? process.env : {};
const isServer = typeof process !== "undefined";

export const CACHE_KEYS: readonly string[] = parseCacheKeys(env.CACHE_KEYS);
export const CACHE_MAX_ENTRIES = parseMaxEntries(env.CACHE_MAX_ENTRIES);
export const CACHE_MAX_BODY_BYTES = parseMaxBodyBytes(env.CACHE_MAX_BODY_BYTES);
/** Budget for every entry together (raw + gzip + brotli). 0 = entry count only. */
export const CACHE_MAX_BYTES = parseBytes(env.CACHE_MAX_BYTES, 104_857_600); // 100MB
export const CACHE_ENABLED = CACHE_MAX_ENTRIES > 0;
// Unset means the default; `0` or `Infinity` turns the timeout off. Unset
// used to mean no timeout: a hung loader held its URL's cache gate (and dedup
// slot) until restart. 30s/10s leave room for slow-but-healthy loaders; a
// page's timer also covers its `await parent()`. Used by renderer.ts.
export const LOAD_TIMEOUT = parseMs(env.LOAD_TIMEOUT, 30_000, "LOAD_TIMEOUT");
export const METADATA_TIMEOUT = parseMs(env.METADATA_TIMEOUT, 10_000, "METADATA_TIMEOUT");

/** The longest a healthy page build can take (metadata, then load, plus
 *  render); 0 when LOAD_TIMEOUT is off. */
const LOADER_BUDGET = LOAD_TIMEOUT > 0 ? METADATA_TIMEOUT + LOAD_TIMEOUT + 10_000 : 0;

/**
 * How long a cache miss waits for another request already building the same
 * key, counted from when that one started, before building itself (ms).
 * Bounds a leader that never finishes (an API handler that hangs, or
 * LOAD_TIMEOUT=0). When it fires every waiter builds at once, so it must
 * outlast a healthy leader: at least LOADER_BUDGET. 0 = wait for the leader.
 */
export const CACHE_WAIT_TIMEOUT = parseMs(
	env.CACHE_WAIT_TIMEOUT,
	Math.min(Math.max(60_000, LOADER_BUDGET), MAX_TIMER_MS),
	"CACHE_WAIT_TIMEOUT",
);
if (
	CACHE_WAIT_TIMEOUT > 0 &&
	CACHE_WAIT_TIMEOUT < Math.min(LOADER_BUDGET, MAX_TIMER_MS) &&
	typeof console !== "undefined"
) {
	console.warn(
		`⚠️  CACHE_WAIT_TIMEOUT=${CACHE_WAIT_TIMEOUT} is shorter than METADATA_TIMEOUT + LOAD_TIMEOUT: requests waiting on a slow page build will start their own`,
	);
}
const IGNORE_PARAMS = parseIgnoreParams(env.CACHE_IGNORE_PARAMS);
/** Largest body worth reading or compressing for the cache: the per-body cap,
 *  and at most a quarter of the budget (raw + two compressed copies still fit,
 *  and one entry can't flush the rest). 0 = no limit. */
const CACHE_BUDGET_SHARE = CACHE_MAX_BYTES > 0 ? Math.floor(CACHE_MAX_BYTES / 4) : 0;
const CACHE_BODY_CAP =
	CACHE_MAX_BODY_BYTES > 0 && CACHE_BUDGET_SHARE > 0
		? Math.min(CACHE_MAX_BODY_BYTES, CACHE_BUDGET_SHARE)
		: CACHE_MAX_BODY_BYTES || CACHE_BUDGET_SHARE;

/** Whether a body of `bytes` could be stored — checked before paying compression. */
export function bodyFitsCache(bytes: number): boolean {
	return CACHE_BODY_CAP === 0 || bytes <= CACHE_BODY_CAP;
}

if (isServer) {
	if (CACHE_ENABLED) {
		console.log(
			`💾 Response cache: max ${CACHE_MAX_ENTRIES} entries${CACHE_MAX_BYTES === 0 ? "" : ` / ${CACHE_MAX_BYTES} bytes`}, max body ${CACHE_BODY_CAP === 0 ? "unlimited" : `${CACHE_BODY_CAP} bytes`}, identity keys [${CACHE_KEYS.join(", ")}]`,
		);
	} else {
		console.log("💾 Response cache: disabled (CACHE_MAX_ENTRIES=0)");
	}
}

// ─── Entry shape ─────────────────────────────────────────

type Bytes = Uint8Array<ArrayBuffer>;

export type CacheEntry = {
	raw: Bytes;
	gzip: Bytes | null;
	brotli: Bytes | null;
	contentType: string;
	status: number;
	extraHeaders: Record<string, string>;
	tags: string[];
	/** Digest of `raw`, filled in by `cacheSet`; the ETag is built from it per
	 *  encoding so a gzip and a brotli copy are never mistaken for each other. */
	etag?: string;
	/** A loader read an ignored tracking param (or the whole query): not served
	 *  to requests that carried one. See CACHE_IGNORE_PARAMS. */
	queryAware?: boolean;
};

// ─── Tiny LRU ────────────────────────────────────────────
// Uses Map's insertion-order iteration. get() promotes by re-inserting.
// Bounded by entry count and, when `maxBytes` > 0, by the summed `weigh()` —
// 500 entries of up to 2MB plus two compressed copies each could otherwise
// reach gigabytes of heap.

class LRU<K, V> {
	private map = new Map<K, V>();
	// Weighed once on set, so a later change to a value can't skew the total.
	private weights = new Map<K, number>();
	private bytes = 0;
	constructor(
		private cap: number,
		private maxBytes: number,
		private weigh: (value: V) => number,
	) {}
	get(key: K): V | undefined {
		const v = this.map.get(key);
		if (v === undefined) return undefined;
		this.map.delete(key);
		this.map.set(key, v);
		return v;
	}
	/** Stores `value` and returns what was evicted to make room. A value
	 *  heavier than the whole budget is not stored. */
	set(key: K, value: V): { stored: boolean; evicted: { key: K; value: V }[] } {
		this.delete(key);
		const evicted: { key: K; value: V }[] = [];
		const weight = this.weigh(value);
		if (this.maxBytes > 0 && weight > this.maxBytes) return { stored: false, evicted };
		this.map.set(key, value);
		this.weights.set(key, weight);
		this.bytes += weight;
		while (
			this.map.size > this.cap ||
			(this.maxBytes > 0 && this.bytes > this.maxBytes && this.map.size > 1)
		) {
			const oldest = this.map.keys().next().value as K;
			const old = this.map.get(oldest) as V;
			this.delete(oldest);
			evicted.push({ key: oldest, value: old });
		}
		return { stored: true, evicted };
	}
	delete(key: K): boolean {
		if (!this.map.has(key)) return false;
		this.bytes -= this.weights.get(key) ?? 0;
		this.weights.delete(key);
		return this.map.delete(key);
	}
	keys(): IterableIterator<K> {
		return this.map.keys();
	}
	clear(): void {
		this.map.clear();
		this.weights.clear();
		this.bytes = 0;
	}
	get size(): number {
		return this.map.size;
	}
}

// ─── Storage ─────────────────────────────────────────────

const htmlCache = new LRU<string, CacheEntry>(
	CACHE_MAX_ENTRIES || 1,
	CACHE_MAX_BYTES,
	(e) => e.raw.byteLength + (e.gzip?.byteLength ?? 0) + (e.brotli?.byteLength ?? 0),
);
const tagIndex = new Map<string, Set<string>>();
const pathIndex = new Map<string, Set<string>>(); // pathname → cacheKeys

// ─── Key building ────────────────────────────────────────

/** SHA-256 truncated to 64 bits — identity buckets must not collide across users. */
function identityDigest(s: string): string {
	return createHash("sha256").update(s).digest("hex").slice(0, 16);
}

export function computeIdentityHash(req: Request, cookies: Pick<CookieJar, "peek">): string {
	const headers = req.headers;
	const parts: string[] = [];
	for (const name of CACHE_KEYS) {
		// peek, not get — building the identity must not count as a cookie read
		// (get flips `accessed`, which forces Cache-Control: private downstream).
		const cv = cookies.peek(name);
		if (cv) parts.push(`c:${name}=${cv}`);
		const hv = headers.get(name);
		if (hv) parts.push(`h:${name}=${hv}`);
	}
	if (parts.length === 0) return "0";
	parts.sort();
	return identityDigest(parts.join("&"));
}

export function computeCacheKey(url: URL, req: Request, cookies: Pick<CookieJar, "peek">): string {
	// Origin is in the key: `url` follows the Host / X-Forwarded-* headers, and a
	// page that renders `url.origin` must not be served to another host.
	return `${dedupKey(url)}|o=${url.origin}|i=${computeIdentityHash(req, cookies)}`;
}

// ─── Tracking parameters (CACHE_IGNORE_PARAMS) ───────────
// `/blog?utm_source=x` and `/blog?fbclid=…` are the same page as `/blog`, but
// every value made its own entry: a full render per ad click, and the misses
// pushed hot pages out of the LRU. Pages (SSR and data endpoint) look such a
// request up under the URL without those params; API routes keep the full URL.
//
// A request that carried them is served the plain URL's entry when there is
// one; otherwise it caches under its full URL, as before. It never writes the
// plain entry: a component may render `page.url` (a canonical link, a hidden
// gclid field), so its HTML can hold this visitor's values. An entry whose
// loaders or metadata() read an ignored param (or the whole query) is marked
// `queryAware` and isn't served to such requests.

export function isIgnoredParam(name: string): boolean {
	if (IGNORE_PARAMS.names.has(name)) return true;
	for (const p of IGNORE_PARAMS.prefixes) if (name.startsWith(p)) return true;
	return false;
}

/** `url` without ignored params, or `url` itself when it has none. */
export function stripIgnoredParams(url: URL): URL {
	if (url.search === "") return url;
	if (IGNORE_PARAMS.names.size === 0 && IGNORE_PARAMS.prefixes.length === 0) return url;
	let kept: [string, string][] | null = null;
	let i = 0;
	for (const [name, value] of url.searchParams) {
		if (isIgnoredParam(name)) {
			kept ??= [...url.searchParams].slice(0, i);
		} else if (kept) kept.push([name, value]);
		i++;
	}
	if (!kept) return url;
	const out = new URL(url.href);
	out.search = new URLSearchParams(kept).toString();
	return out;
}

/** Loaders that read the whole query string (`url.search`, `url.href`, iterating
 *  `url.searchParams`): their output may depend on any param. Recorded as a `"*"`
 *  search param (like the `"*"` cookie) so the client router sees it too. A real
 *  `?*=` param read by name counts as a whole-query read, which only re-runs more. */
export function markWholeQueryRead(deps: LoaderDeps): void {
	if (!deps.searchParams.includes("*")) deps.searchParams.push("*");
}

/** Server-only: the entry is query-aware (a left-out layout above read an ignored
 *  param), without telling the client router to re-run on every query change. */
const queryAwareDeps = new WeakSet<LoaderDeps>();

export function markQueryAware(deps: LoaderDeps): void {
	queryAwareDeps.add(deps);
}

/** Whether any loader read an ignored param — its entry must not be served to a
 *  request that carried one. */
export function depsReadIgnoredParams(
	layoutDeps: (LoaderDeps | null)[] | null,
	pageDeps: LoaderDeps | null,
): boolean {
	const check = (d: LoaderDeps | null) =>
		!!d && (queryAwareDeps.has(d) || d.searchParams.some((k) => k === "*" || isIgnoredParam(k)));
	if (check(pageDeps)) return true;
	return !!layoutDeps && layoutDeps.some(check);
}

/** Extract pathname portion of a cacheKey for path-based invalidation. */
function pathOfKey(key: string): string {
	// A path keeps a raw `|` (`/files/a|b`) but never a raw `?`; the query,
	// origin and 0/1 mask never hold `?` or `|o=`. Storing the path on the
	// entry would drop this parsing if keys grow free-text parts.
	const qIdx = key.indexOf("?");
	const end = qIdx !== -1 ? qIdx : key.lastIndexOf("|o=");
	return end === -1 ? key : key.slice(0, end);
}

// ─── Tag collection ──────────────────────────────────────

export function collectTags(
	layoutDeps: (LoaderDeps | null)[] | null,
	pageDeps: LoaderDeps | null,
): string[] {
	const tags = new Set<string>();
	if (layoutDeps) {
		for (const deps of layoutDeps) {
			if (!deps) continue;
			for (const k of deps.keys) tags.add(`k:${k}`);
			for (const u of deps.urls) tags.add(`u:${u}`);
		}
	}
	if (pageDeps) {
		for (const k of pageDeps.keys) tags.add(`k:${k}`);
		for (const u of pageDeps.urls) tags.add(`u:${u}`);
	}
	return [...tags];
}

/** A `Cache-Control` value that says not to reuse the response. */
export function isNoStoreCacheControl(cc: string | null | undefined): boolean {
	return /no-store|no-cache|private/i.test(cc ?? "");
}

/**
 * A `Vary` the cache key can't honor. The key covers the URL and CACHE_KEYS;
 * Accept-Encoding is negotiated per hit. Anything else (`Cookie`, `Origin`
 * from a handler doing its own CORS, `Accept-Language`, `*`) means one stored
 * copy would be served to requests the response said differ. The framework's
 * own `Vary: Origin` is added after this check, on the way out.
 */
export function varyBlocksCache(vary: string | null | undefined): boolean {
	if (!vary) return false;
	return vary
		.split(",")
		.map((t) => t.trim().toLowerCase())
		.some((t) => t !== "" && t !== "accept-encoding");
}

// ─── Public-ish: read / write ────────────────────────────

export function cacheGet(key: string): CacheEntry | undefined {
	if (!CACHE_ENABLED) return undefined;
	return htmlCache.get(key);
}

// ─── Uncovered-cookie warning ────────────────────────────
// The identity hash only sees cookies named in CACHE_KEYS. If a loader read a
// cookie outside that list and the response got cached anyway, the response
// may be personalised on something the cache key can't distinguish — users
// could be served each other's pages. Warn loudly (dev AND prod), once per
// cookie name per process.

const warnedUncoveredCookies = new Set<string>();

export function warnUncoveredCookies(cookies: Cookies): void {
	const readNames = (cookies as { readNames?: ReadonlySet<string> }).readNames;
	if (!readNames) return;
	for (const name of readNames) {
		if (CACHE_KEYS.includes(name) || warnedUncoveredCookies.has(name)) continue;
		warnedUncoveredCookies.add(name);
		console.warn(
			`\n🚨 [bosia] SECURITY WARNING — possible cross-user cache leak 🚨\n` +
				`   A cached response's loader read the cookie "${name}", which is NOT in CACHE_KEYS.\n` +
				`   The cache key cannot tell users apart by this cookie: if the page content\n` +
				`   depends on it, one user's page can be served to another.\n` +
				`   Fix (pick one):\n` +
				`     - Add it to the identity key list: CACHE_KEYS=${[...CACHE_KEYS, name].join(",")}\n` +
				`     - Or opt the route out of caching: export const cache = false\n`,
		);
	}
}

export function cacheSet(key: string, entry: CacheEntry, cookies?: Cookies): void {
	if (!CACHE_ENABLED) return;
	if (CACHE_MAX_BODY_BYTES > 0 && entry.raw.length > CACHE_MAX_BODY_BYTES) return;
	if (cookies) warnUncoveredCookies(cookies);
	// Runs in the deferred write, after the response went out — never on a hit.
	entry.etag ??= createHash("sha1").update(entry.raw).digest("base64url").slice(0, 22);
	// Drop any existing entry's index pointers first
	cacheDeleteKey(key);
	const { stored, evicted } = htmlCache.set(key, entry);
	for (const e of evicted) cacheDeleteIndexOnly(e.key, e.value);
	// Heavier than the whole budget: not stored, so nothing to index.
	if (!stored) return;
	for (const tag of entry.tags) {
		let set = tagIndex.get(tag);
		if (!set) {
			set = new Set();
			tagIndex.set(tag, set);
		}
		set.add(key);
	}
	const path = pathOfKey(key);
	let pset = pathIndex.get(path);
	if (!pset) {
		pset = new Set();
		pathIndex.set(path, pset);
	}
	pset.add(key);
}

/** Remove a key from htmlCache AND its index pointers. */
function cacheDeleteKey(key: string): void {
	const entry = htmlCache.get(key);
	if (entry) {
		for (const tag of entry.tags) {
			const set = tagIndex.get(tag);
			if (set) {
				set.delete(key);
				if (set.size === 0) tagIndex.delete(tag);
			}
		}
	}
	const path = pathOfKey(key);
	const pset = pathIndex.get(path);
	if (pset) {
		pset.delete(key);
		if (pset.size === 0) pathIndex.delete(path);
	}
	htmlCache.delete(key);
}

/** Cleanup index pointers for a key after LRU evicted it. */
function cacheDeleteIndexOnly(key: string, entry: CacheEntry): void {
	for (const tag of entry.tags) {
		const set = tagIndex.get(tag);
		if (set) {
			set.delete(key);
			if (set.size === 0) tagIndex.delete(tag);
		}
	}
	const path = pathOfKey(key);
	const pset = pathIndex.get(path);
	if (pset) {
		pset.delete(key);
		if (pset.size === 0) pathIndex.delete(path);
	}
}

// ─── Compression helpers ─────────────────────────────────

/**
 * Build gzip + brotli copies of body. Sync — call it from `deferCacheWrite`.
 * `prebuilt`: a variant already encoded for the response (at cache quality),
 * reused as-is so a miss compresses each encoding once.
 */
export function buildCompressedVariants(
	body: Bytes,
	prebuilt: { gzip?: Bytes; brotli?: Bytes } = {},
): {
	gzip: Bytes | null;
	brotli: Bytes | null;
} {
	const COMPRESS_MIN_BYTES = 2048;
	if (!compressionOn || body.length < COMPRESS_MIN_BYTES) return { gzip: null, brotli: null };
	let gzip: Bytes | null = prebuilt.gzip ?? null;
	let brotli: Bytes | null = prebuilt.brotli ?? null;
	if (!gzip) {
		try {
			gzip = encodeBytes(body, "gzip", "cache");
		} catch {
			gzip = null;
		}
	}
	if (!brotli) {
		try {
			brotli = encodeBytes(body, "br", "cache");
		} catch {
			brotli = null;
		}
	}
	return { gzip, brotli };
}

/**
 * Run a cache write after the current response has gone out. A microtask
 * would not: it fires before the awaiting caller resumes, so gzip + brotli of
 * the body ran ahead of the first byte. `setImmediate` yields to I/O first.
 * Workers keeps the microtask — it compresses nothing (the edge does), and a
 * timer after the response returns is not guaranteed to run there.
 */
export function deferCacheWrite(fn: () => void | Promise<void>): void {
	if (compressionOn) setImmediate(fn);
	else queueMicrotask(fn);
}

const textEncoder = new TextEncoder();

/** How long a cache write may spend reading a response body it copied. */
const CACHE_READ_TIMEOUT_MS = 10_000;

/**
 * Read a copied response body for the cache, giving up (and cancelling the
 * copy) once it can't fit the cache (`bodyFitsCache`) or takes longer than
 * `CACHE_READ_TIMEOUT_MS`. `null` = don't cache.
 *
 * `arrayBuffer()` on the copy held the whole body before any size check: a
 * 1GB file served from a `+server.ts` GET took 1GB of RAM per download, and an
 * endless non-SSE stream kept the miss gate (and every waiter) for good.
 */
export async function readBodyForCache(res: Response): Promise<Bytes | null> {
	const stream = res.body;
	if (!stream) return new Uint8Array(new ArrayBuffer(0));
	const reader = stream.getReader();
	const chunks: Uint8Array[] = [];
	let total = 0;
	// Cancelling ends the pending read() as `done`; the flag tells that apart
	// from a body that really ended.
	let timedOut = false;
	const timer = setTimeout(() => {
		timedOut = true;
		reader.cancel().catch(() => {});
	}, CACHE_READ_TIMEOUT_MS);
	try {
		for (;;) {
			const step = await reader.read();
			if (timedOut) return null;
			if (step.done) return concatChunks(chunks);
			// A handler's stream may enqueue strings; Bun passes them through a clone.
			const value: unknown = step.value;
			const chunk =
				typeof value === "string"
					? textEncoder.encode(value)
					: value instanceof Uint8Array
						? value
						: ArrayBuffer.isView(value)
							? new Uint8Array(value.buffer, value.byteOffset, value.byteLength)
							: value instanceof ArrayBuffer
								? new Uint8Array(value)
								: null;
			if (chunk === null) return null;
			total += chunk.byteLength;
			if (!bodyFitsCache(total)) return null;
			chunks.push(chunk);
		}
	} catch {
		return null;
	} finally {
		clearTimeout(timer);
		// Stops the copy so the runtime no longer buffers it; the response the
		// client reads is a separate branch and keeps going.
		reader.cancel().catch(() => {});
	}
}

/** Concatenate multiple Uint8Array chunks into one buffer. */
export function concatChunks(chunks: Uint8Array[]): Bytes {
	let total = 0;
	for (const c of chunks) total += c.length;
	const out = new Uint8Array(new ArrayBuffer(total));
	let off = 0;
	for (const c of chunks) {
		out.set(c, off);
		off += c.length;
	}
	return out;
}

// ─── Miss coalescing ─────────────────────────────────────
// Stampede protection for cache misses. The first miss on a key becomes the
// leader (gets `release`); concurrent misses become waiters (get `wait`).
// Waiters re-check cacheGet after the wait resolves — hit: serve it; miss
// (leader skipped the write): build independently. Distinct from dedup(),
// which shares the *result*; this shares only the *wait*.
//
// INVARIANT: the leader must call release() exactly once, after its cacheSet
// attempt completed or was skipped — callers guard with try/finally.
//
// A leader that never finishes (an API handler that hangs, LOAD_TIMEOUT=0)
// held its key for the process lifetime: every later request waited on it
// and the handler never ran again. A gate expires CACHE_WAIT_TIMEOUT after
// its leader started: waiters resume with `false` and re-claim through
// claimMiss(); the first replaces the gate and leads with `stale: true` (and
// must not join the stuck leader's dedup() call), the rest wait on it.

type MissGate = {
	promise: Promise<void>;
	release: () => void;
	start: number;
	/** Set by an expiry timer, so a waiter it woke never sees the gate as
	 *  live (the timer may fire a little before the clock reads expired). */
	expired: boolean;
};

const missGates = new Map<string, MissGate>();

function gateExpired(gate: MissGate, now = performance.now()): boolean {
	return gate.expired || (CACHE_WAIT_TIMEOUT > 0 && now - gate.start >= CACHE_WAIT_TIMEOUT);
}

// An expired gate stays until its key misses again (it tells that miss it is
// `stale`). Keys that never come back are swept once the map grows; by twice
// the timeout the stuck dedup() call is too old to be joined anyway.
const SWEEP_AT = 256;
let lastSweep = 0;
function sweepGates(now: number): void {
	if (missGates.size < SWEEP_AT || now - lastSweep < CACHE_WAIT_TIMEOUT) return;
	lastSweep = now;
	for (const [key, gate] of missGates) {
		if (now - gate.start >= 2 * CACHE_WAIT_TIMEOUT) missGates.delete(key);
	}
}

/** `staleStart`: when the expired gate this lead replaced started (else -Infinity). */
export type MissLead = { release: () => void; stale: boolean; staleStart: number };

export function coalesceMiss(
	key: string,
): (MissLead & { wait?: undefined }) | { wait: Promise<boolean>; release?: undefined } {
	const now = performance.now();
	const existing = missGates.get(key);
	if (existing && !gateExpired(existing, now)) {
		return { wait: waitWithTimeout(existing) };
	}
	if (CACHE_WAIT_TIMEOUT > 0) sweepGates(now);
	let resolve!: () => void;
	const promise = new Promise<void>((r) => (resolve = r));
	const release = () => {
		// Idempotent, and never deletes a successor leader's gate.
		if (missGates.get(key)?.promise === promise) missGates.delete(key);
		resolve();
	};
	// Replaces an expired gate; the old leader's release() won't touch this one.
	missGates.set(key, { promise, release, start: now, expired: false });
	return { release, stale: existing !== undefined, staleStart: existing?.start ?? -Infinity };
}

/**
 * Claim a cache miss: a hit some other request wrote while this one waited;
 * the lead (`lead.release()` exactly once, after the write or its skip);
 * `lead: null` — build without leading; or `aborted` — the client left while
 * waiting, don't build. A waiter whose gate expired re-claims once: the first
 * becomes the new (`stale`) leader and the rest wait on it, so a stuck leader
 * doesn't set every waiter building at once. After a second expiry a waiter
 * builds on its own: it has waited 2× CACHE_WAIT_TIMEOUT.
 */
export async function claimMiss(
	key: string,
	signal?: AbortSignal,
): Promise<
	| { hit: CacheEntry; lead?: undefined; aborted?: undefined }
	| { lead: MissLead | null; hit?: undefined; aborted?: undefined }
	| { aborted: true; hit?: undefined; lead?: undefined }
> {
	for (let round = 0; ; round++) {
		const gate = coalesceMiss(key);
		if (!gate.wait) return { lead: gate };
		const finished = await gate.wait;
		const hit = cacheGet(key);
		if (hit) return { hit };
		if (signal?.aborted) return { aborted: true };
		if (finished || round >= 1) return { lead: null };
	}
}

/** True when the leader finished, false when the gate expired first. One
 *  timer per waiter, not per gate: on Workers a timer belongs to the request
 *  that set it and dies with it, which would strand the other waiters. */
function waitWithTimeout(gate: MissGate): Promise<boolean> {
	if (CACHE_WAIT_TIMEOUT <= 0) return gate.promise.then(() => true);
	const left = Math.max(0, CACHE_WAIT_TIMEOUT - (performance.now() - gate.start));
	return new Promise<boolean>((resolve) => {
		const timer = setTimeout(() => {
			gate.expired = true;
			resolve(false);
		}, left);
		(timer as { unref?: () => void }).unref?.();
		gate.promise.then(() => {
			clearTimeout(timer);
			resolve(true);
		});
	});
}

// ─── Serve a cache hit ───────────────────────────────────

export function serveCached(entry: CacheEntry, req: Request): Response {
	const accept = req.headers.get("accept-encoding") ?? "";
	// Base keys lowercased so lowercased extraHeaders (e.g. loader setHeaders)
	// override them instead of getting comma-joined by Headers.
	const headers: Record<string, string> = {
		"content-type": entry.contentType,
		"x-bosia-cache": "HIT",
		...entry.extraHeaders,
		vary: varyWithEncoding(entry.extraHeaders.vary),
	};
	let body: Bytes = entry.raw;
	let encoding: "br" | "gzip" | null = null;
	if (entry.brotli && accept.includes("br")) {
		body = entry.brotli;
		encoding = "br";
	} else if (entry.gzip && accept.includes("gzip")) {
		body = entry.gzip;
		encoding = "gzip";
	}
	if (entry.etag) {
		const suffix = encoding === "br" ? "-br" : encoding === "gzip" ? "-gz" : "";
		const etag = `"${entry.etag}${suffix}"`;
		headers["etag"] = etag;
		// A browser or CDN re-checking a copy it already holds gets a 304 with
		// no body instead of the whole page again.
		if (entry.status === 200 && matchesEtag(req.headers.get("if-none-match"), etag)) {
			delete headers["content-type"];
			return new Response(null, { status: 304, headers });
		}
	}
	// BosiaApp drops HEAD bodies, and a null body would report Content-Length 0.
	// GET leaves it to the runtime, so a hook that rewrites the body stays valid.
	if (req.method === "HEAD") headers["content-length"] = String(body.byteLength);
	if (encoding) {
		headers["content-encoding"] = encoding;
		return new Response(body, { ...PRECOMPRESSED, status: entry.status, headers });
	}
	return new Response(body, { status: entry.status, headers });
}

// ─── Invalidation API ────────────────────────────────────

/**
 * Evict all cache entries matching `key`.
 *
 * - `invalidate("app:user")` → evict entries tagged with depends("app:user")
 *   (matches the loader's tag list).
 * - `invalidate("/api/posts")` → evict entries tagged with a fetch URL whose
 *   path equals `/api/posts`, AND entries whose own path equals `/api/posts`.
 */
export function invalidate(key: string): number {
	if (!CACHE_ENABLED) return 0;
	let count = 0;
	const tagKey = key.startsWith("/") ? `u:${key}` : `k:${key}`;
	const fromTag = tagIndex.get(tagKey);
	if (fromTag) {
		// Also collect URL tag matches where the loader fetched an absolute URL
		// whose pathname == key. Conservative: also match the bare `k:` tag in
		// case the user uses a key that starts with `/` but isn't a URL.
		for (const k of [...fromTag]) {
			cacheDeleteKey(k);
			count++;
		}
	}
	if (key.startsWith("/")) {
		// Match absolute URL tags too: any `u:<origin><key>` recorded by trackedFetch.
		for (const [tag, set] of tagIndex) {
			if (tag.startsWith("u:") && tag.endsWith(key)) {
				for (const k of [...set]) {
					cacheDeleteKey(k);
					count++;
				}
			}
		}
		// Match cache entries whose own path equals key
		const pset = pathIndex.get(key);
		if (pset) {
			for (const k of [...pset]) {
				cacheDeleteKey(k);
				count++;
			}
		}
	}
	return count;
}

/**
 * Evict every entry whose path starts with `prefix`.
 * Use for bulk eviction (e.g. `invalidateAll("/products/")`).
 */
export function invalidateAll(prefix: string): number {
	if (!CACHE_ENABLED) return 0;
	let count = 0;
	for (const [path, set] of [...pathIndex]) {
		if (path.startsWith(prefix)) {
			for (const k of [...set]) {
				cacheDeleteKey(k);
				count++;
			}
		}
	}
	return count;
}

/** Test-only: clear everything. */
export function cacheClear(): void {
	htmlCache.clear();
	tagIndex.clear();
	pathIndex.clear();
}
