import { afterAll, beforeEach, describe, expect, test } from "bun:test";
import { resetBaseCache } from "../src/core/appBase.ts";
import { rebaseSvelteMarkup } from "../src/core/svelteCompiler.ts";

// The base is memoized per process and other suites move it, so each case sets
// it explicitly rather than relying on import order.
const ORIGINAL = process.env.BASE_PATH;
beforeEach(() => {
	process.env.BASE_PATH = "/sso";
	resetBaseCache();
});
afterAll(() => {
	if (ORIGINAL === undefined) delete process.env.BASE_PATH;
	else process.env.BASE_PATH = ORIGINAL;
	resetBaseCache();
});

describe("rebaseSvelteMarkup()", () => {
	test("prefixes root-absolute hrefs in markup", () => {
		expect(rebaseSvelteMarkup(`<a href="/masuk">Masuk</a>`)).toBe(`<a href="/sso/masuk">Masuk</a>`);
	});

	test("keeps attribute interpolation intact", () => {
		// Only the leading literal moves; the {expr} part is untouched.
		expect(rebaseSvelteMarkup(`<a href="/user/{id}">x</a>`)).toBe(`<a href="/sso/user/{id}">x</a>`);
	});

	test("leaves <script> contents alone", () => {
		// A root-absolute string in script could be anything — a fetch path, an id,
		// a regex. Rewriting it blind is how an unrelated constant gets corrupted.
		const source = `<script>\n\tconst API = "/api/v1";\n\tconst re = /^\\/admin/;\n</script>\n<a href="/masuk">m</a>`;
		const out = rebaseSvelteMarkup(source);
		expect(out).toContain(`const API = "/api/v1";`);
		expect(out).toContain(`const re = /^\\/admin/;`);
		expect(out).toContain(`<a href="/sso/masuk">m</a>`);
	});

	test("restores every script block in order", () => {
		const source = `<script module>const A = "/a";</script>\n<script>const B = "/b";</script>\n<a href="/c">c</a>`;
		const out = rebaseSvelteMarkup(source);
		expect(out).toContain(`<script module>const A = "/a";</script>`);
		expect(out).toContain(`<script>const B = "/b";</script>`);
		expect(out).toContain(`href="/sso/c"`);
	});

	test("rebases CSS url() in a <style> block", () => {
		expect(rebaseSvelteMarkup(`<style>.a{background:url("/img/x.png")}</style>`)).toBe(
			`<style>.a{background:url("/sso/img/x.png")}</style>`,
		);
	});

	test("leaves external and relative targets alone", () => {
		const source = `<a href="https://x.test/a">a</a><a href="?/allow">b</a><a href="#top">c</a>`;
		expect(rebaseSvelteMarkup(source)).toBe(source);
	});

	test("is idempotent", () => {
		const once = rebaseSvelteMarkup(`<a href="/masuk">m</a>`);
		expect(rebaseSvelteMarkup(once)).toBe(once);
	});
});
