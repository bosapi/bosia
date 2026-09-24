import { describe, expect, test } from "bun:test";
import { delimiter } from "path";
import { resolveBosiaBin, BOSIA_NODE_PATH, toPosix, binCandidates } from "../src/core/paths.ts";

describe("BOSIA_NODE_PATH", () => {
	test("includes nested node_modules path", () => {
		expect(BOSIA_NODE_PATH).toContain("node_modules");
	});

	test("is split by the platform path delimiter", () => {
		// In a workspace layout (this repo), parent is "packages/" not "node_modules/",
		// so HOISTED_NM is null and the value contains a single path with no delimiter.
		// In a hoisted install layout, several paths joined by ":" (";" on Windows).
		const parts = BOSIA_NODE_PATH.split(delimiter);
		expect(parts.length).toBeGreaterThanOrEqual(1);
		for (const p of parts) expect(p).toContain("node_modules");
	});
});

describe("toPosix()", () => {
	test("turns backslashes into forward slashes", () => {
		expect(toPosix("blog\\[slug]\\+page.svelte")).toBe("blog/[slug]/+page.svelte");
	});

	test("leaves posix paths unchanged", () => {
		expect(toPosix("chunks/x.js")).toBe("chunks/x.js");
	});
});

describe("binCandidates()", () => {
	test("tries Windows shim extensions first on win32", () => {
		expect(binCandidates("tailwindcss", "win32")).toEqual([
			"tailwindcss.exe",
			"tailwindcss.cmd",
			"tailwindcss.bunx",
			"tailwindcss",
		]);
	});

	test("uses the bare name elsewhere", () => {
		expect(binCandidates("tailwindcss", "linux")).toEqual(["tailwindcss"]);
		expect(binCandidates("tailwindcss", "darwin")).toEqual(["tailwindcss"]);
	});
});

describe("resolveBosiaBin()", () => {
	test("returns a path inside .bin/", () => {
		const out = toPosix(resolveBosiaBin("bun"));
		expect(out).toContain("/.bin/bun");
	});

	test("falls back to nested path when binary missing", () => {
		const out = toPosix(resolveBosiaBin("__definitely_not_a_real_bin__"));
		// Fallback contract: returns nested path even when nothing exists
		expect(out).toContain("node_modules/.bin/__definitely_not_a_real_bin__");
	});

	test("returns existing binary path for a known dependency bin", () => {
		// tailwindcss installs a bin in node_modules/.bin — fine to assert string shape only
		const out = toPosix(resolveBosiaBin("tailwindcss"));
		expect(out).toContain(".bin/tailwindcss");
	});
});
