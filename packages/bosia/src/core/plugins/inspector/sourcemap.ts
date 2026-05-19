import { TraceMap, originalPositionFor } from "@jridgewell/trace-mapping";
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve as pathResolve } from "node:path";
import { OUT_DIR } from "../../paths.ts";

const cache = new Map<string, TraceMap | null>();

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
