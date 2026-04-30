import { describe, expect, test } from "bun:test";
import { canonicalPathname } from "../src/core/matcher.ts";

describe("canonicalPathname", () => {
	test("never: strips trailing slash", () => {
		expect(canonicalPathname("/about/", "never")).toBe("/about");
		expect(canonicalPathname("/blog/post/", "never")).toBe("/blog/post");
	});

	test("never: passes through non-slash paths", () => {
		expect(canonicalPathname("/about", "never")).toBe(null);
	});

	test("always: appends trailing slash", () => {
		expect(canonicalPathname("/about", "always")).toBe("/about/");
		expect(canonicalPathname("/blog/post", "always")).toBe("/blog/post/");
	});

	test("always: passes through already-slashed paths", () => {
		expect(canonicalPathname("/about/", "always")).toBe(null);
	});

	test("ignore: never modifies path", () => {
		expect(canonicalPathname("/about/", "ignore")).toBe(null);
		expect(canonicalPathname("/about", "ignore")).toBe(null);
	});

	test("root is never modified", () => {
		expect(canonicalPathname("/", "never")).toBe(null);
		expect(canonicalPathname("/", "always")).toBe(null);
		expect(canonicalPathname("/", "ignore")).toBe(null);
	});
});
