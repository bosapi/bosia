import { toPosix } from "./paths.ts";
import type { PageRoute } from "./types.ts";

/** The slice of Bun's `BuildMetafile` this module reads. */
export interface PreloadMetafile {
	outputs: Record<string, { entryPoint?: string; imports?: { path: string; kind: string }[] }>;
}

/**
 * Client chunks each page route needs before it can hydrate, keyed by route
 * pattern, as paths relative to `dist/client` (same shape as `manifest.js`).
 *
 * Without this the browser only learns about a route's code after the entry has
 * run and `import()`ed it, and only learns about that chunk's own imports after
 * it arrives — a serial waterfall during which clicks hit dead buttons. Emitting
 * these as modulepreload links lets them download alongside the entry.
 *
 * Route chunks are found by their metafile `entryPoint` (Bun makes every
 * dynamically imported route file its own entry chunk, named relative to the
 * app root), then followed through static imports only — a `dynamic-import`
 * edge is code the page may never ask for. The client entry is left out: the
 * shell already preloads it.
 */
export function buildPreloadMap(
	metafile: PreloadMetafile,
	pages: Pick<PageRoute, "pattern" | "page" | "layouts">[],
	entry: string,
): Record<string, string[]> {
	const clean = (p: string) => toPosix(p).replace(/^\.\//, "");
	const outputs = new Map<string, { path: string; kind: string }[]>();
	const chunkBySource = new Map<string, string>();
	for (const [out, info] of Object.entries(metafile.outputs)) {
		if (!out.endsWith(".js")) continue;
		outputs.set(clean(out), info.imports ?? []);
		if (info.entryPoint) chunkBySource.set(clean(info.entryPoint), clean(out));
	}

	const map: Record<string, string[]> = {};
	for (const route of pages) {
		const seen = new Set<string>([entry]);
		const files: string[] = [];
		const visit = (chunk: string) => {
			if (seen.has(chunk)) return;
			seen.add(chunk);
			files.push(chunk);
			for (const imp of outputs.get(chunk) ?? []) {
				if (imp.kind === "import-statement") visit(clean(imp.path));
			}
		};
		// Layouts first: they wrap the page, so hydration needs them just as much.
		for (const src of [...route.layouts, route.page]) {
			const chunk = chunkBySource.get(`src/routes/${toPosix(src)}`);
			if (chunk) visit(chunk);
		}
		if (files.length) map[route.pattern] = files;
	}
	return map;
}
