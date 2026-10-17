import { describe, expect, test } from "bun:test";
import { HttpError, Redirect, ActionFailure, error, redirect, fail } from "../src/core/errors.ts";

describe("error()", () => {
	test("throws HttpError with status + message", () => {
		try {
			error(404, "not found");
			throw new Error("should not reach");
		} catch (e) {
			expect(e).toBeInstanceOf(HttpError);
			expect((e as HttpError).status).toBe(404);
			expect((e as HttpError).message).toBe("not found");
		}
	});
});

describe("redirect()", () => {
	test("relative path allowed", () => {
		const r = redirectSafe(302, "/login");
		expect(r).toBeInstanceOf(Redirect);
		expect(r.location).toBe("/login");
	});

	test("rejects javascript:", () => {
		expect(() => new Redirect(302, "javascript:alert(1)")).toThrow(/dangerous scheme/);
	});

	test("rejects data:", () => {
		expect(() => new Redirect(302, "data:text/html,<script>")).toThrow(/dangerous scheme/);
	});

	test("rejects vbscript:", () => {
		expect(() => new Redirect(302, "vbscript:msgbox")).toThrow(/dangerous scheme/);
	});

	test("rejects protocol-relative //evil.com", () => {
		expect(() => new Redirect(302, "//evil.com/x")).toThrow(/protocol-relative/);
	});

	test("rejects absolute external URL", () => {
		expect(() => new Redirect(302, "https://evil.com/x")).toThrow(/external URL/);
	});

	test("allowExternal bypasses validation", () => {
		const r = new Redirect(302, "https://evil.com/x", { allowExternal: true });
		expect(r.location).toBe("https://evil.com/x");
	});

	test("allowExternal still rejects javascript:", () => {
		expect(() => new Redirect(302, "javascript:alert(1)", { allowExternal: true })).toThrow(
			/dangerous scheme/,
		);
	});

	test("allowExternal still rejects data:", () => {
		expect(
			() =>
				new Redirect(302, "data:text/html,<script>alert(1)</script>", {
					allowExternal: true,
				}),
		).toThrow(/dangerous scheme/);
	});

	test("allowExternal still rejects vbscript:", () => {
		expect(() => new Redirect(302, "vbscript:msgbox", { allowExternal: true })).toThrow(
			/dangerous scheme/,
		);
	});

	test("allowExternal rejects dangerous schemes with leading whitespace", () => {
		expect(() => new Redirect(302, "  javascript:alert(1)", { allowExternal: true })).toThrow(
			/dangerous scheme/,
		);
	});

	// The browser's URL parser drops tabs and leading control chars from a Location.
	for (const loc of ["java\tscript:alert(1)", "\x01javascript:alert(1)"]) {
		test(`rejects ${JSON.stringify(loc)}, with allowExternal too`, () => {
			expect(() => new Redirect(302, loc)).toThrow(/dangerous scheme/);
			expect(() => new Redirect(302, loc, { allowExternal: true })).toThrow(/dangerous scheme/);
		});
	}

	for (const loc of [
		"htt\tps://evil.com/x",
		"/\\evil.com/x",
		"http:evil.com",
		"https:/evil.com",
		"http://bosia.invalid/x",
	]) {
		test(`rejects ${JSON.stringify(loc)} as external`, () => {
			expect(() => new Redirect(302, loc)).toThrow(/external URL/);
		});
	}

	test("allowExternal rejects a URL the browser can't parse", () => {
		expect(() => new Redirect(303, "https://exa mple.com/cb", { allowExternal: true })).toThrow(
			/invalid URL/,
		);
	});

	test("allows relative and query-only locations", () => {
		for (const loc of ["?step=2", "login", "../x", "#top"])
			expect(new Redirect(302, loc).location).toBe(loc);
	});
});

function redirectSafe(status: number, location: string): Redirect {
	try {
		redirect(status, location);
	} catch (e) {
		if (e instanceof Redirect) return e;
		throw e;
	}
	throw new Error("did not throw");
}

describe("fail()", () => {
	test("returns ActionFailure with status + data", () => {
		const f = fail(400, { error: "missing" });
		expect(f).toBeInstanceOf(ActionFailure);
		expect(f.status).toBe(400);
		expect(f.data).toEqual({ error: "missing" });
	});
});
