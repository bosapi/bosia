import { describe, expect, test } from "bun:test";
import { buildPreloadMap, type PreloadMetafile } from "../src/core/preloadMap.ts";

// Shape copied from a real Bun 1.4.2 client build of apps/demo: output keys and
// import paths are `./`-relative to dist/client, entryPoint is relative to the
// app root.
const ENTRY = "hydrate-abc.js";
const metafile: PreloadMetafile = {
	outputs: {
		"./hydrate-abc.js": {
			entryPoint: "../../packages/bosia/src/core/client/hydrate.ts",
			imports: [
				{ path: "./chunk-page.js", kind: "dynamic-import" },
				{ path: "./chunk-root.js", kind: "dynamic-import" },
			],
		},
		"./chunk-shared.js": { imports: [{ path: "./hydrate-abc.js", kind: "import-statement" }] },
		"./chunk-deep.js": { imports: [{ path: "./chunk-shared.js", kind: "import-statement" }] },
		"./chunk-lazy.js": { imports: [] },
		"./chunk-root.js": {
			entryPoint: "src/routes/+layout.svelte",
			imports: [
				{ path: "./hydrate-abc.js", kind: "import-statement" },
				{ path: "./chunk-shared.js", kind: "import-statement" },
			],
		},
		"./chunk-page.js": {
			entryPoint: "src/routes/(public)/blog/[slug]/+page.svelte",
			imports: [
				{ path: "./hydrate-abc.js", kind: "import-statement" },
				{ path: "./chunk-deep.js", kind: "import-statement" },
				{ path: "./chunk-lazy.js", kind: "dynamic-import" },
			],
		},
		"./chunk-page.js.map": {},
	},
};

describe("buildPreloadMap", () => {
	const map = buildPreloadMap(
		metafile,
		[
			{
				pattern: "/blog/[slug]",
				page: "(public)/blog/[slug]/+page.svelte",
				layouts: ["+layout.svelte"],
			},
			{ pattern: "/gone", page: "gone/+page.svelte", layouts: [] },
		],
		ENTRY,
	);

	test("layouts then page, with their static imports followed transitively", () => {
		expect(map["/blog/[slug]"]).toEqual([
			"chunk-root.js",
			"chunk-shared.js",
			"chunk-page.js",
			"chunk-deep.js",
		]);
	});

	test("skips the entry, dynamic imports and duplicates", () => {
		const files = map["/blog/[slug]"]!;
		expect(files).not.toContain(ENTRY);
		expect(files).not.toContain("chunk-lazy.js");
		expect(new Set(files).size).toBe(files.length);
	});

	test("a route with no matching chunk gets no entry", () => {
		expect(map["/gone"]).toBeUndefined();
	});

	test("Windows-style source paths still match", () => {
		const win = buildPreloadMap(
			{ outputs: { ".\\chunk-p.js": { entryPoint: "src\\routes\\a\\+page.svelte" } } },
			[{ pattern: "/a", page: "a\\+page.svelte", layouts: [] }],
			ENTRY,
		);
		expect(win["/a"]).toEqual(["chunk-p.js"]);
	});
});
