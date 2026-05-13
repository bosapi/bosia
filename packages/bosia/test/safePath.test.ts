import { describe, expect, test } from "bun:test";
import { resolve as resolvePath } from "path";
import { safePath } from "../src/core/safePath.ts";

describe("safePath", () => {
	test("valid same-base file resolves to absolute path inside base", () => {
		const out = safePath("./public", "logo.svg");
		expect(out).toBe(resolvePath("./public/logo.svg"));
	});

	test("valid nested file resolves inside base", () => {
		const out = safePath("./public", "images/icons/star.svg");
		expect(out).toBe(resolvePath("./public/images/icons/star.svg"));
	});

	test("dot-prefixed segment that stays in base is allowed", () => {
		const out = safePath("./public", ".well-known/security.txt");
		expect(out).toBe(resolvePath("./public/.well-known/security.txt"));
	});

	test("rejects relative parent traversal", () => {
		expect(safePath("./public", "../etc/passwd")).toBe(null);
	});

	test("rejects deep traversal escaping base", () => {
		expect(safePath("./public", "../../etc/passwd")).toBe(null);
	});

	test("rejects traversal hidden mid-path", () => {
		expect(safePath("./public", "images/../../etc/passwd")).toBe(null);
	});

	test("leading slash on untrusted is treated as base-relative, not absolute", () => {
		// `join(base, "/etc/passwd")` neutralises the leading slash, so the
		// resolved path lands inside `base` rather than escaping to /etc.
		// This is intentional — the function takes path SEGMENTS, not full paths.
		const out = safePath("./public", "/etc/passwd");
		expect(out).toBe(resolvePath("./public/etc/passwd"));
	});

	test("rejects path that traverses then re-enters a sibling that happens to share a prefix", () => {
		// /var/www/public-secrets must NOT be treated as inside /var/www/public
		const out = safePath("./public", "../public-secrets/key.pem");
		expect(out).toBe(null);
	});

	test("empty path resolves to base itself", () => {
		const out = safePath("./public", "");
		expect(out).toBe(resolvePath("./public"));
	});

	test("'.' segment resolves to base itself", () => {
		expect(safePath("./public", ".")).toBe(resolvePath("./public"));
	});

	test("'..' alone is rejected (escapes base)", () => {
		expect(safePath("./public", "..")).toBe(null);
	});

	test("redundant slashes and dot segments are normalized but stay inside base", () => {
		const out = safePath("./public", "./images//./icons/star.svg");
		expect(out).toBe(resolvePath("./public/images/icons/star.svg"));
	});

	test("base with trailing slash behaves the same as without", () => {
		const a = safePath("./public/", "logo.svg");
		const b = safePath("./public", "logo.svg");
		expect(a).toBe(b);
		expect(a).toBe(resolvePath("./public/logo.svg"));
	});

	test("works for nested base directories used by Bosia (dist/prerendered)", () => {
		const out = safePath("./dist/prerendered", "about/index.html");
		expect(out).toBe(resolvePath("./dist/prerendered/about/index.html"));
		expect(safePath("./dist/prerendered", "../../../etc/passwd")).toBe(null);
	});
});
