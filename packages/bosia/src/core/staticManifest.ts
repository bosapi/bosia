import { existsSync, readdirSync, statSync } from "fs";
import { basename, join, resolve as resolvePath } from "path";

export type StaticEntry = { absPath: string; cacheControl?: string };
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
		for (const { abs, rel } of walk(clientRoot)) {
			const cacheControl = HASHED_BASENAME.test(basename(rel)) ? IMMUTABLE_CACHE : DEFAULT_CACHE;
			addOnce(manifest, `/dist/client/${rel}`, { absPath: abs, cacheControl });
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
export function buildPrerenderManifest(outDir: string): Map<string, string> {
	const manifest = new Map<string, string>();
	const root = join(resolvePath(outDir), "prerendered");
	for (const { abs, rel } of walk(root)) {
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
		if (isIndex || !manifest.has(key)) manifest.set(key, abs);
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
