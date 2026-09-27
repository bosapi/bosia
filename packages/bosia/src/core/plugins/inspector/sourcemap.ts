import { TraceMap, originalPositionFor, GREATEST_LOWER_BOUND } from "@jridgewell/trace-mapping";
import { readFileSync, existsSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve as pathResolve } from "node:path";
import { OUT_DIR, toPosix } from "../../paths.ts";

const cache = new Map<string, TraceMap | null>();

// Per-`.svelte` (absolute path) compile maps written by the build step. The
// bundle map only resolves a stack frame to the post-svelte-compile JS
// position labeled with the .svelte filename; a second lookup against this
// map (with `bias: GREATEST_LOWER_BOUND` to interpolate sparse mappings)
// translates that intermediate position to original source line/col.
let svelteMaps: Map<string, TraceMap> | null = null;
let svelteMapsLoaded = false;

function loadSvelteMaps(): Map<string, TraceMap> | null {
	if (svelteMapsLoaded) return svelteMaps;
	svelteMapsLoaded = true;
	try {
		const p = pathResolve(process.cwd(), OUT_DIR, "svelte-maps.json");
		if (!existsSync(p)) return null;
		const raw = JSON.parse(readFileSync(p, "utf8")) as Record<string, unknown>;
		svelteMaps = new Map();
		for (const [absPath, m] of Object.entries(raw)) {
			try {
				svelteMaps.set(absPath, new TraceMap(m as never));
			} catch {}
		}
		return svelteMaps;
	} catch {
		return null;
	}
}

function loadMap(mapPath: string): TraceMap | null {
	if (cache.has(mapPath)) return cache.get(mapPath)!;
	try {
		if (!existsSync(mapPath)) {
			cache.set(mapPath, null);
			return null;
		}
		const tm = new TraceMap(readFileSync(mapPath, "utf8"));
		cache.set(mapPath, tm);
		return tm;
	} catch {
		cache.set(mapPath, null);
		return null;
	}
}

// URL namespace stays at `/dist/...` but the on-disk location is `OUT_DIR`
// (e.g. `.bosia/dev` in dev). v0.5.5 decoupled these; the resolver has to
// rewrite the URL prefix back to the real filesystem prefix.
function mapPathFor(file: string): string | null {
	let fsPath: string;
	if (/^https?:\/\//.test(file)) {
		let pathname: string;
		try {
			pathname = new URL(file).pathname;
		} catch {
			return null;
		}
		const relFromCwd = pathname.startsWith("/dist/")
			? OUT_DIR + pathname.slice("/dist".length)
			: "." + pathname;
		fsPath = pathResolve(process.cwd(), relFromCwd);
	} else if (isAbsolute(file)) {
		fsPath = file;
	} else {
		fsPath = pathResolve(process.cwd(), file);
	}
	return fsPath + ".map";
}

export function resolveFrame(
	file: string,
	line: number,
	col: number,
): { file: string; line: number; col: number } | null {
	const mp = mapPathFor(file);
	if (!mp) return null;
	const tm = loadMap(mp);
	if (!tm) return null;
	const pos = originalPositionFor(tm, { line, column: col });
	if (!pos.source || pos.line == null) return null;
	const abs = pathResolve(dirname(mp), pos.source);

	// Bundle map points at the post-svelte-compile JS position labeled with the
	// .svelte filename. Refine by chasing through the cached svelte compile map
	// to the real source position. Svelte's map is sparse — a given line may
	// only carry mappings starting at some column. Try the exact column first,
	// then fall back to the rightmost mapping on the same line, so we never lose
	// a frame just because the bundle's reported column lands in a gap.
	if (abs.endsWith(".svelte") || abs.endsWith(".svelte.ts") || abs.endsWith(".svelte.js")) {
		const maps = loadSvelteMaps();
		const svelteMap = maps?.get(abs);
		if (svelteMap) {
			let refined = originalPositionFor(svelteMap, {
				line: pos.line,
				column: pos.column ?? 0,
				bias: GREATEST_LOWER_BOUND,
			});
			if (!refined.source) {
				refined = originalPositionFor(svelteMap, {
					line: pos.line,
					column: Number.MAX_SAFE_INTEGER,
					bias: GREATEST_LOWER_BOUND,
				});
			}
			if (refined.source && refined.line != null) {
				const refinedAbs = pathResolve(dirname(abs), refined.source);
				return { file: relToCwd(refinedAbs), line: refined.line, col: refined.column ?? 1 };
			}
		}
	}

	return { file: relToCwd(abs), line: pos.line, col: pos.column ?? 1 };
}

// cwd-relative "/"-separated path when `abs` is inside cwd, else `abs` unchanged.
function relToCwd(abs: string): string {
	const rel = relative(process.cwd(), abs);
	return rel && !rel.startsWith("..") && !isAbsolute(rel) ? toPosix(rel) : abs;
}

// One stack frame: "(file:L:C)", "at file:L:C", "@file:L:C". The file body is
// lazy up to the first ":L:C", so ")" in route groups like `(public)` and the
// port in `http://host:9000/...` stay inside the file. Groups: lead, file, L, C, tail.
// The browser overlay reuses this source too (see overlay.ts).
export const FRAME_RE = /(\(|\bat\s+|@)((?:https?:\/\/|\/|[A-Za-z]:[\\/])[^\n]*?):(\d+):(\d+)(\)?)/;

// Top frame of a stack trace string. Best-effort.
export function parseTopFrame(
	stack: string | undefined,
): { file: string; line: number; col: number } | null {
	const m = stack ? FRAME_RE.exec(stack) : null;
	return m ? { file: m[2], line: Number(m[3]), col: Number(m[4]) } : null;
}

// Rewrite every frame in a stack string to its original source position.
export function resolveStack(stack: string): string {
	return stack.replace(new RegExp(FRAME_RE.source, "g"), (_m, lead, file, l, c, tail) => {
		const r = resolveFrame(file, Number(l), Number(c));
		return r ? `${lead}${r.file}:${r.line}:${r.col}${tail}` : _m;
	});
}
