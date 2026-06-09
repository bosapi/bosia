import { describe, expect, test } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";
import { compileModule } from "svelte/compiler";

// `page.svelte.ts` uses Svelte 5 runes (`$derived.by`), so it can't be imported
// directly in Bun without the Svelte compiler running over it first. The runtime
// behavior (reactivity on `router.currentRoute` changes) is exercised by app-level
// tests (the verify step in the plan); here we only assert the wiring:
//   1. The module compiles cleanly through `svelte/compiler` (catches typos in
//      rune usage, like dropping `$derived.by` or returning the wrong shape).
//   2. The compiled output references the `$derived` runtime helper — i.e. the
//      `page.url` getter is genuinely reactive, not a one-shot snapshot.
//   3. `bosia/client` re-exports `page` from the new module.

const root = join(import.meta.dir, "..");
const PAGE_PATH = join(root, "src/core/client/page.svelte.ts");
const CLIENT_PATH = join(root, "src/lib/client.ts");

describe("page export wiring", () => {
	test("page.svelte.ts compiles via svelte/compiler", () => {
		const source = readFileSync(PAGE_PATH, "utf-8");
		const result = compileModule(source, {
			filename: "page.svelte.ts",
			generate: "client",
		});
		expect(result.warnings).toEqual([]);
		expect(typeof result.js.code).toBe("string");
	});

	test("compiled output uses Svelte's derived runtime helper", () => {
		const source = readFileSync(PAGE_PATH, "utf-8");
		const { js } = compileModule(source, {
			filename: "page.svelte.ts",
			generate: "client",
		});
		// Svelte 5 lowers `$derived.by(fn)` to a call into `svelte/internal/client`
		// (e.g. `$.derived(...)`). The substring "derived" appearing in the output
		// is enough to confirm the rune wasn't accidentally erased into a plain
		// non-reactive function.
		expect(js.code).toContain("derived");
	});

	test("bosia/client re-exports page", () => {
		const source = readFileSync(CLIENT_PATH, "utf-8");
		expect(source).toContain('export { page } from "../core/client/page.svelte.ts"');
	});

	test("page module reads router.currentRoute (not a static snapshot)", () => {
		const source = readFileSync(PAGE_PATH, "utf-8");
		// Guard against a future refactor that snapshots the URL once and breaks
		// the contract the skills teach (page.url updates on navigation).
		expect(source).toContain("router.currentRoute");
	});
});
