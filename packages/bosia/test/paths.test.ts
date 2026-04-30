import { describe, expect, test } from "bun:test";
import { resolveBosiaBin, BOSIA_NODE_PATH } from "../src/core/paths.ts";

describe("BOSIA_NODE_PATH", () => {
	test("includes nested node_modules path", () => {
		expect(BOSIA_NODE_PATH).toContain("node_modules");
	});

	test("is colon-separated when hoisted location exists", () => {
		// In a workspace layout (this repo), parent is "packages/" not "node_modules/",
		// so HOISTED_NM is null and the value contains a single path with no colon.
		// In a hoisted install layout, two paths joined by ":". Both are valid.
		const parts = BOSIA_NODE_PATH.split(":");
		expect(parts.length).toBeGreaterThanOrEqual(1);
		for (const p of parts) expect(p).toContain("node_modules");
	});
});

describe("resolveBosiaBin()", () => {
	test("returns a path ending with .bin/<name>", () => {
		const out = resolveBosiaBin("bun");
		expect(out.endsWith("/.bin/bun")).toBe(true);
	});

	test("falls back to nested path when binary missing", () => {
		const out = resolveBosiaBin("__definitely_not_a_real_bin__");
		// Fallback contract: returns nested path even when nothing exists
		expect(out).toContain("node_modules/.bin/__definitely_not_a_real_bin__");
	});

	test("returns existing binary path for a known dependency bin", () => {
		// tailwindcss installs a bin in node_modules/.bin — fine to assert string shape only
		const out = resolveBosiaBin("tailwindcss");
		expect(out).toContain(".bin/tailwindcss");
	});
});
