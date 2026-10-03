// ─── In-memory Asset Cache ───────────────────────────────
// Keeps small static files and prerendered pages (and their .br/.gz variants)
// in memory after their first request, so later hits skip the per-request
// open/stat/read of `Bun.file`. Filled lazily — boot does no extra I/O, so a
// cold start costs the same as before. Byte-budget LRU, keyed by absolute path.
//
// Bun only: on Workers, static files are served by Workers Static Assets
// before the worker runs, so this module never sees them.

type Bytes = Uint8Array<ArrayBuffer>;
export type AssetHit = { bytes: Bytes; type: string };

function parseBytes(raw: string | undefined, fallback: number): number {
	if (!raw) return fallback;
	const n = parseInt(raw, 10);
	if (!Number.isFinite(n) || n < 0) return fallback;
	return n;
}

export const DEFAULT_ASSET_CACHE_MAX_BYTES = 52_428_800; // 50MB; 0 = disabled
export const DEFAULT_ASSET_CACHE_MAX_FILE_BYTES = 1_048_576; // 1MB

export function parseAssetCacheEnv(env: Record<string, string | undefined>): {
	maxBytes: number;
	maxFileBytes: number;
} {
	return {
		maxBytes: parseBytes(env.ASSET_CACHE_MAX_BYTES, DEFAULT_ASSET_CACHE_MAX_BYTES),
		maxFileBytes: parseBytes(env.ASSET_CACHE_MAX_FILE_BYTES, DEFAULT_ASSET_CACHE_MAX_FILE_BYTES),
	};
}

export class AssetCache {
	private map = new Map<string, AssetHit>();
	private inFlight = new Map<string, Promise<void>>();
	private used = 0;

	constructor(
		readonly maxBytes: number,
		readonly maxFileBytes: number,
	) {}

	get enabled(): boolean {
		return this.maxBytes > 0 && this.maxFileBytes > 0;
	}

	get usedBytes(): number {
		return this.used;
	}

	get size(): number {
		return this.map.size;
	}

	/** Hit promotes the entry (Map insertion order = LRU order). */
	get(path: string): AssetHit | undefined {
		const hit = this.map.get(path);
		if (hit === undefined) return undefined;
		this.map.delete(path);
		this.map.set(path, hit);
		return hit;
	}

	/**
	 * Read `path` into memory in the background. `type` is the Content-Type of
	 * the original file — a `.br` variant must not report its own. Errors are
	 * swallowed: the caller already answered from disk, and will again.
	 */
	fill(path: string, type: string): void {
		if (!this.enabled || this.map.has(path) || this.inFlight.has(path)) return;
		const job = (async () => {
			const file = Bun.file(path);
			if (file.size > this.maxFileBytes || file.size > this.maxBytes) return;
			const bytes = (await file.bytes()) as Bytes;
			if (bytes.byteLength > this.maxFileBytes || bytes.byteLength > this.maxBytes) return;
			this.store(path, { bytes, type });
		})()
			.catch(() => {})
			.finally(() => this.inFlight.delete(path));
		this.inFlight.set(path, job);
	}

	/** Resolves once every fill started so far has settled. For tests. */
	async idle(): Promise<void> {
		while (this.inFlight.size > 0) await Promise.all(this.inFlight.values());
	}

	clear(): void {
		this.map.clear();
		this.used = 0;
	}

	private store(path: string, hit: AssetHit): void {
		const prev = this.map.get(path);
		if (prev) {
			this.used -= prev.bytes.byteLength;
			this.map.delete(path);
		}
		const size = hit.bytes.byteLength;
		for (const [oldPath, old] of this.map) {
			if (this.used + size <= this.maxBytes) break;
			this.map.delete(oldPath);
			this.used -= old.bytes.byteLength;
		}
		this.map.set(path, hit);
		this.used += size;
	}
}

const env: Record<string, string | undefined> =
	typeof process !== "undefined" && process.env ? process.env : {};
const limits = parseAssetCacheEnv(env);

export const assetCache = new AssetCache(limits.maxBytes, limits.maxFileBytes);

const mb = (n: number) => `${Math.round((n / 1_048_576) * 10) / 10}MB`;

export function logAssetCache(): void {
	console.log(
		assetCache.enabled
			? `🗂️  Asset cache: max ${mb(assetCache.maxBytes)}, max file ${mb(assetCache.maxFileBytes)}`
			: "🗂️  Asset cache: disabled",
	);
}
