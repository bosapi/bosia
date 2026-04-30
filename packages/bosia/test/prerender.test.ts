import { describe, expect, test } from "bun:test";
import {
	canonicalRouteFor,
	prerenderDataPath,
	prerenderOutPath,
	substituteParams,
} from "../src/core/prerender.ts";

describe("substituteParams()", () => {
	test("static pattern returned unchanged", () => {
		expect(substituteParams("/about", {})).toBe("/about");
	});

	test("[slug] replaced", () => {
		expect(substituteParams("/blog/[slug]", { slug: "hello" })).toBe("/blog/hello");
	});

	test("[...rest] replaced (catch-all)", () => {
		expect(substituteParams("/docs/[...path]", { path: "a/b/c" })).toBe("/docs/a/b/c");
	});

	test("multiple params substituted in one pass", () => {
		expect(substituteParams("/[org]/[repo]", { org: "anthropic", repo: "claude" })).toBe(
			"/anthropic/claude",
		);
	});

	test("rest replaced before regular dynamic of same name (no double-sub)", () => {
		// `[...key]` matched first, so `[key]` substitution doesn't see the leftover
		expect(substituteParams("/x/[...key]", { key: "a/b" })).toBe("/x/a/b");
	});
});

describe("canonicalRouteFor()", () => {
	test("root is always /", () => {
		expect(canonicalRouteFor("/", "never")).toBe("/");
		expect(canonicalRouteFor("/", "always")).toBe("/");
		expect(canonicalRouteFor("/", "ignore")).toBe("/");
	});

	test("never strips trailing slash", () => {
		expect(canonicalRouteFor("/about", "never")).toBe("/about");
		expect(canonicalRouteFor("/about/", "never")).toBe("/about");
	});

	test("always appends trailing slash when missing", () => {
		expect(canonicalRouteFor("/about", "always")).toBe("/about/");
		expect(canonicalRouteFor("/about/", "always")).toBe("/about/");
	});

	test("ignore behaves like never (strips)", () => {
		expect(canonicalRouteFor("/about/", "ignore")).toBe("/about");
	});
});

describe("prerenderOutPath()", () => {
	test("root → index.html", () => {
		expect(prerenderOutPath("/", "never")).toBe("./dist/prerendered/index.html");
	});

	test("never → flat .html", () => {
		expect(prerenderOutPath("/about", "never")).toBe("./dist/prerendered/about.html");
	});

	test("always → directory + index.html", () => {
		expect(prerenderOutPath("/about", "always")).toBe("./dist/prerendered/about/index.html");
	});

	test("ignore → directory + index.html", () => {
		expect(prerenderOutPath("/about", "ignore")).toBe("./dist/prerendered/about/index.html");
	});

	test("strips trailing slash from input before composing", () => {
		expect(prerenderOutPath("/about/", "never")).toBe("./dist/prerendered/about.html");
		expect(prerenderOutPath("/about/", "always")).toBe("./dist/prerendered/about/index.html");
	});
});

describe("prerenderDataPath()", () => {
	test("root → /index.json", () => {
		expect(prerenderDataPath("/")).toBe("/index.json");
	});

	test("non-root strips trailing slash + .json", () => {
		expect(prerenderDataPath("/about")).toBe("/about.json");
		expect(prerenderDataPath("/about/")).toBe("/about.json");
	});
});
