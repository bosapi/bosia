import { describe, expect, test } from "bun:test";
import { normalizeBase, rebaseHtmlAttrs, stripBase, withBase } from "../src/core/basePath.ts";

describe("normalizeBase()", () => {
	test("unset and root-ish values all mean no base", () => {
		for (const raw of [undefined, null, "", "   ", "/"]) {
			expect(normalizeBase(raw)).toBe("");
		}
	});

	test("adds a leading slash and drops trailing ones", () => {
		expect(normalizeBase("sso")).toBe("/sso");
		expect(normalizeBase("/sso")).toBe("/sso");
		expect(normalizeBase("/sso/")).toBe("/sso");
		expect(normalizeBase("/sso///")).toBe("/sso");
		expect(normalizeBase("  /sso/  ")).toBe("/sso");
	});

	test("keeps a nested base", () => {
		expect(normalizeBase("/apps/sso")).toBe("/apps/sso");
	});
});

describe("withBase()", () => {
	const B = "/sso";

	test("no base is a no-op", () => {
		expect(withBase("", "/masuk")).toBe("/masuk");
	});

	test("prefixes root-absolute app paths", () => {
		expect(withBase(B, "/")).toBe("/sso/");
		expect(withBase(B, "/masuk")).toBe("/sso/masuk");
		expect(withBase(B, "/masuk?next=/beranda")).toBe("/sso/masuk?next=/beranda");
	});

	test("leaves anything that is not a root-absolute path alone", () => {
		expect(withBase(B, "https://evil.test/x")).toBe("https://evil.test/x");
		expect(withBase(B, "//evil.test/x")).toBe("//evil.test/x");
		expect(withBase(B, "masuk")).toBe("masuk");
		expect(withBase(B, "?/allow")).toBe("?/allow");
		expect(withBase(B, "#top")).toBe("#top");
	});

	test("is idempotent — applying it twice cannot double the prefix", () => {
		expect(withBase(B, withBase(B, "/masuk"))).toBe("/sso/masuk");
		expect(withBase(B, "/sso")).toBe("/sso");
	});

	test("a sibling route sharing the prefix is still prefixed", () => {
		// The clause that makes this work is the trailing "/" in `${base}/`.
		expect(withBase(B, "/sso-admin")).toBe("/sso/sso-admin");
	});
});

describe("stripBase()", () => {
	const B = "/sso";

	test("no base is a no-op", () => {
		expect(stripBase("", "/masuk")).toBe("/masuk");
	});

	test("strips the prefix", () => {
		expect(stripBase(B, "/sso/masuk")).toBe("/masuk");
		expect(stripBase(B, "/sso/admin/klien")).toBe("/admin/klien");
	});

	test("bare base and base with slash both reach the root route", () => {
		expect(stripBase(B, "/sso")).toBe("/");
		expect(stripBase(B, "/sso/")).toBe("/");
	});

	test("returns null for anything outside the base", () => {
		expect(stripBase(B, "/masuk")).toBeNull();
		expect(stripBase(B, "/")).toBeNull();
		// A sibling that merely shares the prefix is not ours.
		expect(stripBase(B, "/sso-admin")).toBeNull();
	});

	test("round-trips with withBase", () => {
		for (const path of ["/", "/masuk", "/admin/klien"]) {
			expect(stripBase(B, withBase(B, path))).toBe(path);
		}
	});
});

describe("rebaseHtmlAttrs()", () => {
	const B = "/sso";

	test("no base is a no-op", () => {
		const html = `<a href="/masuk">x</a>`;
		expect(rebaseHtmlAttrs("", html)).toBe(html);
	});

	test("rewrites the attributes a browser resolves against the origin", () => {
		expect(rebaseHtmlAttrs(B, `<a href="/daftar">x</a>`)).toBe(`<a href="/sso/daftar">x</a>`);
		expect(rebaseHtmlAttrs(B, `<img src="/logo.png">`)).toBe(`<img src="/sso/logo.png">`);
		expect(rebaseHtmlAttrs(B, `<form action="/masuk">`)).toBe(`<form action="/sso/masuk">`);
		expect(rebaseHtmlAttrs(B, `<button formaction="/x">`)).toBe(`<button formaction="/sso/x">`);
	});

	test("handles single quotes and mixed case", () => {
		expect(rebaseHtmlAttrs(B, `<a HREF='/daftar'>`)).toBe(`<a HREF='/sso/daftar'>`);
	});

	test("leaves external, protocol-relative and relative URLs alone", () => {
		const untouched = [
			`<a href="https://fi.uinsgd.ac.id/obe">x</a>`,
			`<a href="//cdn.test/x">x</a>`,
			`<a href="masuk">x</a>`,
			`<form action="?/allow">`,
			`<a href="#top">x</a>`,
		];
		for (const html of untouched) expect(rebaseHtmlAttrs(B, html)).toBe(html);
	});

	test("is idempotent", () => {
		const once = rebaseHtmlAttrs(B, `<a href="/daftar">x</a>`);
		expect(rebaseHtmlAttrs(B, once)).toBe(once);
	});

	test("does not touch non-URL attributes that contain a slash", () => {
		const html = `<div data-path="/masuk" class="a/b"></div>`;
		expect(rebaseHtmlAttrs(B, html)).toBe(html);
	});

	test("rewrites every occurrence, not just the first", () => {
		const out = rebaseHtmlAttrs(B, `<a href="/a">a</a><a href="/b">b</a>`);
		expect(out).toBe(`<a href="/sso/a">a</a><a href="/sso/b">b</a>`);
	});

	test("rewrites CSS url() — including the HTML-escaped quotes of a style attribute", () => {
		// A mask-image that 404s renders as a blank icon and reports nothing,
		// which is why this is covered rather than left to the attribute rule.
		expect(rebaseHtmlAttrs(B, `<i style="mask-image:url(&quot;/icons/eye.svg&quot;)">`)).toBe(
			`<i style="mask-image:url(&quot;/sso/icons/eye.svg&quot;)">`,
		);
		expect(rebaseHtmlAttrs(B, `<style>a{background:url("/img/x.png")}</style>`)).toBe(
			`<style>a{background:url("/sso/img/x.png")}</style>`,
		);
		expect(rebaseHtmlAttrs(B, `<style>a{background:url(/img/x.png)}</style>`)).toBe(
			`<style>a{background:url(/sso/img/x.png)}</style>`,
		);
	});

	test("leaves data: and absolute url() alone", () => {
		for (const html of [
			`<i style="background:url(data:image/svg+xml;base64,AAA)">`,
			`<i style="background:url(https://cdn.test/x.png)">`,
			`<i style="background:url(//cdn.test/x.png)">`,
		]) {
			expect(rebaseHtmlAttrs(B, html)).toBe(html);
		}
	});

	test("url() rewriting is idempotent too", () => {
		const once = rebaseHtmlAttrs(B, `<i style="mask-image:url(&quot;/icons/eye.svg&quot;)">`);
		expect(rebaseHtmlAttrs(B, once)).toBe(once);
	});
});
