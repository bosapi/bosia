import { existsSync, readdirSync, statSync } from "fs";
import { basename, join, resolve as resolvePath } from "path";
import { PRECOMPRESSED, pickEncoding } from "./html.ts";
import { AssetCache, assetCache } from "./assetCache.ts";

/** `br`/`gz`: absolute paths of build-time precompressed siblings (precompress.ts). */
export type StaticEntry = { absPath: string; cacheControl?: string; br?: string; gz?: string };
export type StaticManifest = Map<string, StaticEntry>;

const HASHED_BASENAME = /\-[a-z0-9]{8,}\.[a-z]+$/;
const IMMUTABLE_CACHE = "public, max-age=31536000, immutable";
const DEFAULT_CACHE = "no-cache";

// Files/dirs at OUT_DIR root that the manifest must not surface — they're either
// build metadata or re-merges already covered by the per-root walks.
const OUT_DIR_SKIP_DIRS = new Set(["client", "static", "prerendered", "server"]);
const OUT_DIR_SKIP_FILES = new Set(["manifest.json", "route-manifest.json"]);

const RESERVED_PREFIX = "/__bosia/";

function* walk(dir: string, rel = ""): Generator<{ abs: string; rel: string }> {
	let entries: Array<{ name: string; isDirectory(): boolean; isFile(): boolean }>;
	try {
		entries = readdirSync(dir, { withFileTypes: true, encoding: "utf8" }) as unknown as Array<{
			name: string;
			isDirectory(): boolean;
			isFile(): boolean;
		}>;
	} catch {
		return;
	}
	for (const ent of entries) {
		const childAbs = join(dir, ent.name);
		const childRel = rel ? `${rel}/${ent.name}` : ent.name;
		if (ent.isDirectory()) {
			yield* walk(childAbs, childRel);
		} else if (ent.isFile()) {
			yield { abs: childAbs, rel: childRel };
		}
	}
}

function addOnce(manifest: StaticManifest, key: string, entry: StaticEntry) {
	if (key.startsWith(RESERVED_PREFIX)) return;
	if (manifest.has(key)) return;
	manifest.set(key, entry);
}

export function buildStaticManifest(outDir: string): StaticManifest {
	const manifest: StaticManifest = new Map();
	const outAbs = resolvePath(outDir);

	const clientRoot = join(outAbs, "client");
	if (existsSync(clientRoot)) {
		for (const entry of withSiblings(walk(clientRoot))) {
			const cacheControl = HASHED_BASENAME.test(basename(entry.rel))
				? IMMUTABLE_CACHE
				: DEFAULT_CACHE;
			addOnce(manifest, `/dist/client/${entry.rel}`, {
				absPath: entry.abs,
				cacheControl,
				br: entry.br,
				gz: entry.gz,
			});
		}
	}

	const publicRoot = resolvePath("./public");
	if (existsSync(publicRoot)) {
		for (const { abs, rel } of walk(publicRoot)) {
			addOnce(manifest, `/${rel}`, { absPath: abs });
		}
	}

	// `dist/static/` mirrors `public/` (the build copies it for SSG output).
	// Walk it too so production images can drop `public/` and ship only `dist/`.
	// `addOnce` keeps the `public/` source canonical when both exist (dev).
	const staticRoot = join(outAbs, "static");
	if (existsSync(staticRoot)) {
		for (const { abs, rel } of walk(staticRoot)) {
			addOnce(manifest, `/${rel}`, { absPath: abs });
		}
	}

	if (existsSync(outAbs)) {
		let rootEntries: Array<{ name: string; isDirectory(): boolean; isFile(): boolean }>;
		try {
			rootEntries = readdirSync(outAbs, {
				withFileTypes: true,
				encoding: "utf8",
			}) as unknown as Array<{ name: string; isDirectory(): boolean; isFile(): boolean }>;
		} catch {
			rootEntries = [];
		}
		for (const ent of rootEntries) {
			if (ent.isDirectory()) {
				if (OUT_DIR_SKIP_DIRS.has(ent.name)) continue;
				const sub = join(outAbs, ent.name);
				for (const { abs, rel } of walk(sub, ent.name)) {
					addOnce(manifest, `/${rel}`, { absPath: abs });
				}
			} else if (ent.isFile()) {
				if (OUT_DIR_SKIP_FILES.has(ent.name)) continue;
				addOnce(manifest, `/${ent.name}`, { absPath: join(outAbs, ent.name) });
			}
		}
	}

	return manifest;
}

/**
 * Fold `x.br` / `x.gz` into the entry for `x`. The variants are not URLs of
 * their own — a request for `/chunk.js.br` is a miss, like any file the build
 * never meant to publish. A `.br` with no original is kept as a plain file.
 */
function withSiblings(
	all: Iterable<{ abs: string; rel: string }>,
): Array<{ abs: string; rel: string; br?: string; gz?: string }> {
	const list = [...all];
	const byRel = new Map(list.map((f) => [f.rel, f]));
	const out: Array<{ abs: string; rel: string; br?: string; gz?: string }> = [];
	for (const f of list) {
		const ext = f.rel.endsWith(".br") ? ".br" : f.rel.endsWith(".gz") ? ".gz" : null;
		if (ext && byRel.has(f.rel.slice(0, -ext.length))) continue;
		out.push({
			...f,
			br: byRel.get(`${f.rel}.br`)?.abs,
			gz: byRel.get(`${f.rel}.gz`)?.abs,
		});
	}
	return out;
}

/**
 * Response for a manifest hit, precompressed when the build left a variant the
 * client accepts. Content-Type comes from the original — `Bun.file("x.js.br")`
 * would infer the wrong one. `Vary` only when variants exist: a raw-only file
 * answers every client the same way.
 *
 * Small files are answered from `assetCache` once a first request has read
 * them; the miss itself is served from disk as before and fills the cache in
 * the background. Range requests always go to disk — Bun answers those with a
 * 206 for `Bun.file` bodies, not for bytes.
 */
export function serveStatic(
	entry: StaticEntry,
	req: Request,
	headers: Record<string, string> = {},
	cache: AssetCache = assetCache,
): Response {
	const out: Record<string, string> = { ...headers };
	if (entry.cacheControl) out["Cache-Control"] = entry.cacheControl;

	let path = entry.absPath;
	let init: ResponseInit = {};
	if (entry.br || entry.gz) {
		out["Vary"] = "Accept-Encoding";
		const enc = pickEncoding(req.headers.get("accept-encoding"));
		const variant = enc === "br" ? (entry.br ?? entry.gz) : enc === "gzip" ? entry.gz : undefined;
		if (variant) {
			path = variant;
			init = PRECOMPRESSED;
			out["Content-Encoding"] = variant === entry.br ? "br" : "gzip";
		}
	}

	if (cache.enabled && !req.headers.has("range")) {
		const hit = cache.get(path);
		if (hit) {
			out["Content-Type"] ??= hit.type;
			return new Response(hit.bytes, { ...init, headers: out });
		}
		const type = out["Content-Type"] ?? Bun.file(entry.absPath).type;
		cache.fill(path, type);
		if (path !== entry.absPath) out["Content-Type"] = type;
	} else if (path !== entry.absPath) {
		out["Content-Type"] ??= Bun.file(entry.absPath).type;
	}
	return new Response(Bun.file(path), { ...init, headers: out });
}

export function lookupStatic(manifest: StaticManifest, urlPath: string): StaticEntry | null {
	const raw = urlPath.split("?")[0];
	// Manifest keys are raw filenames; URLs arrive percent-encoded.
	let key: string;
	try {
		key = decodeURIComponent(raw);
	} catch {
		return null; // malformed encoding → 404
	}
	return manifest.get(key) ?? null;
}

/**
 * Boot-time map of URL path → absolute file path for `dist/prerendered/`.
 * `index.html` → `/`, `foo/index.html` → `/foo`, `foo.html` → `/foo`.
 * On collision the `…/index.html` variant wins (mirrors the old runtime
 * candidate order). Replaces per-request `Bun.file().exists()` probes.
 */
export function buildPrerenderManifest(outDir: string): Map<string, StaticEntry> {
	const manifest = new Map<string, StaticEntry>();
	const root = join(resolvePath(outDir), "prerendered");
	for (const { abs, rel, br, gz } of withSiblings(walk(root))) {
		if (!rel.endsWith(".html")) continue;
		let key: string;
		let isIndex = false;
		if (rel === "index.html") {
			key = "/";
			isIndex = true;
		} else if (rel.endsWith("/index.html")) {
			key = `/${rel.slice(0, -"/index.html".length)}`;
			isIndex = true;
		} else {
			key = `/${rel.slice(0, -".html".length)}`;
		}
		if (isIndex || !manifest.has(key)) manifest.set(key, { absPath: abs, br, gz });
	}
	return manifest;
}

// Re-export for tests that want to confirm a file-on-disk exists at the entry.
export function entryFileExists(entry: StaticEntry): boolean {
	try {
		return statSync(entry.absPath).isFile();
	} catch {
		return false;
	}
}
