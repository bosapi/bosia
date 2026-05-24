// ─── Server-side Response Cache ──────────────────────────
// Skips load() + render() + compression on cache hit. Keyed by URL + identity
// (cookies/headers from CACHE_KEYS). Invalidated by tag (LoaderDeps.keys),
// fetch URL (LoaderDeps.urls), or exact/prefix path.
//
// See docs/guides/response-cache.md.

import type { Cookies, LoaderDeps } from "./hooks.ts";
import { dedupKey } from "./dedup.ts";

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

export const CACHE_KEYS: readonly string[] = parseCacheKeys(process.env.CACHE_KEYS);
export const CACHE_MAX_ENTRIES = parseMaxEntries(process.env.CACHE_MAX_ENTRIES);
export const CACHE_ENABLED = CACHE_MAX_ENTRIES > 0;

if (CACHE_ENABLED) {
	console.log(
		`💾 Response cache: max ${CACHE_MAX_ENTRIES} entries, identity keys [${CACHE_KEYS.join(", ")}]`,
	);
} else {
	console.log("💾 Response cache: disabled (CACHE_MAX_ENTRIES=0)");
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
};

// ─── Tiny LRU ────────────────────────────────────────────
// Uses Map's insertion-order iteration. get() promotes by re-inserting.

class LRU<K, V> {
	private map = new Map<K, V>();
	constructor(private cap: number) {}
	get(key: K): V | undefined {
		const v = this.map.get(key);
		if (v === undefined) return undefined;
		this.map.delete(key);
		this.map.set(key, v);
		return v;
	}
	set(key: K, value: V): K | undefined {
		if (this.map.has(key)) this.map.delete(key);
		this.map.set(key, value);
		if (this.map.size > this.cap) {
			const oldest = this.map.keys().next().value as K | undefined;
			if (oldest !== undefined) {
				this.map.delete(oldest);
				return oldest;
			}
		}
		return undefined;
	}
	delete(key: K): boolean {
		return this.map.delete(key);
	}
	keys(): IterableIterator<K> {
		return this.map.keys();
	}
	clear(): void {
		this.map.clear();
	}
	get size(): number {
		return this.map.size;
	}
}

// ─── Storage ─────────────────────────────────────────────

const htmlCache = new LRU<string, CacheEntry>(CACHE_MAX_ENTRIES || 1);
const tagIndex = new Map<string, Set<string>>();
const pathIndex = new Map<string, Set<string>>(); // pathname → cacheKeys

// ─── Key building ────────────────────────────────────────

/** FNV-1a 32-bit hash. Compact, no dep, collision-tolerant for an identity bucket. */
function fnv1a(s: string): string {
	let h = 0x811c9dc5;
	for (let i = 0; i < s.length; i++) {
		h ^= s.charCodeAt(i);
		h = Math.imul(h, 0x01000193);
	}
	return (h >>> 0).toString(36);
}

export function computeIdentityHash(req: Request, cookies: Cookies): string {
	const headers = req.headers;
	const parts: string[] = [];
	for (const name of CACHE_KEYS) {
		const cv = cookies.get(name);
		if (cv) parts.push(`c:${name}=${cv}`);
		const hv = headers.get(name);
		if (hv) parts.push(`h:${name}=${hv}`);
	}
	if (parts.length === 0) return "0";
	parts.sort();
	return fnv1a(parts.join("&"));
}

export function computeCacheKey(url: URL, req: Request, cookies: Cookies): string {
	return `${dedupKey(url)}|i=${computeIdentityHash(req, cookies)}`;
}

/** Extract pathname portion of a cacheKey for path-based invalidation. */
function pathOfKey(key: string): string {
	const qIdx = key.indexOf("?");
	const pIdx = key.indexOf("|");
	const end = qIdx === -1 ? pIdx : Math.min(qIdx, pIdx);
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

// ─── Public-ish: read / write ────────────────────────────

export function cacheGet(key: string): CacheEntry | undefined {
	if (!CACHE_ENABLED) return undefined;
	return htmlCache.get(key);
}

export function cacheSet(key: string, entry: CacheEntry): void {
	if (!CACHE_ENABLED) return;
	// Drop any existing entry's index pointers first
	cacheDeleteKey(key);
	const evicted = htmlCache.set(key, entry);
	if (evicted) cacheDeleteIndexOnly(evicted);
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
function cacheDeleteIndexOnly(key: string): void {
	for (const set of tagIndex.values()) set.delete(key);
	for (const [tag, set] of tagIndex) if (set.size === 0) tagIndex.delete(tag);
	const path = pathOfKey(key);
	const pset = pathIndex.get(path);
	if (pset) {
		pset.delete(key);
		if (pset.size === 0) pathIndex.delete(path);
	}
}

// ─── Compression helpers ─────────────────────────────────

/** Build gzip + brotli copies of body. Sync, runs in microtask. */
export function buildCompressedVariants(body: Bytes): {
	gzip: Bytes | null;
	brotli: Bytes | null;
} {
	const COMPRESS_MIN_BYTES = 2048;
	if (body.length < COMPRESS_MIN_BYTES) return { gzip: null, brotli: null };
	let gzip: Bytes | null = null;
	let brotli: Bytes | null = null;
	try {
		gzip = Bun.gzipSync(body) as Bytes;
	} catch {
		gzip = null;
	}
	// brotliCompressSync exists in Bun >= 1.1.5 but is missing from older
	// @types/bun shipments — cast through any so the call stays loose.
	const brotliFn = (Bun as unknown as { brotliCompressSync?: (b: Bytes) => Uint8Array })
		.brotliCompressSync;
	if (brotliFn) {
		try {
			brotli = brotliFn(body) as Bytes;
		} catch {
			brotli = null;
		}
	}
	return { gzip, brotli };
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

// ─── Serve a cache hit ───────────────────────────────────

export function serveCached(entry: CacheEntry, req: Request): Response {
	const accept = req.headers.get("accept-encoding") ?? "";
	const headers: Record<string, string> = {
		"Content-Type": entry.contentType,
		Vary: "Accept-Encoding",
		"X-Bosia-Cache": "HIT",
		...entry.extraHeaders,
	};
	if (entry.brotli && accept.includes("br")) {
		headers["Content-Encoding"] = "br";
		return new Response(entry.brotli, { status: entry.status, headers });
	}
	if (entry.gzip && accept.includes("gzip")) {
		headers["Content-Encoding"] = "gzip";
		return new Response(entry.gzip, { status: entry.status, headers });
	}
	return new Response(entry.raw, { status: entry.status, headers });
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
