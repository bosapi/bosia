import { TraceMap, originalPositionFor, GREATEST_LOWER_BOUND } from "@jridgewell/trace-mapping";
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve as pathResolve } from "node:path";
import { OUT_DIR } from "../../paths.ts";

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
	} else if (file.startsWith("/")) {
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
				const rel = refinedAbs.startsWith(process.cwd() + "/")
					? refinedAbs.slice(process.cwd().length + 1)
					: refinedAbs;
				return { file: rel, line: refined.line, col: refined.column ?? 1 };
			}
		}
	}

	const rel = abs.startsWith(process.cwd() + "/") ? abs.slice(process.cwd().length + 1) : abs;
	return { file: rel, line: pos.line, col: pos.column ?? 1 };
}

// Rewrite frames in stack strings: "(url:L:C)", "at url:L:C", "@url:L:C".
// Lazy match on the file body so URLs with ports (`http://host:9000/...`) keep
// the port as part of the file rather than being chopped at the first `:`.
export function resolveStack(stack: string): string {
	return stack.replace(
		/(\(|at\s+|@)((?:https?:\/\/|\/)[^\s)]+?):(\d+):(\d+)(\)?)/g,
		(_m, lead, file, l, c, tail) => {
			const r = resolveFrame(file, Number(l), Number(c));
			return r ? `${lead}${r.file}:${r.line}:${r.col}${tail}` : _m;
		},
	);
}
