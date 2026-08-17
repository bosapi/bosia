import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { resetBaseCache } from "../src/core/appBase.ts";

// These exercise the two places the base is applied implicitly, where an app
// author never sees it: the Redirect constructor and the cookie defaults. Both
// read the base lazily, so the env has to be set before the first touch and the
// cache cleared between cases.

const ORIGINAL = process.env.BASE_PATH;

function setBase(value: string | undefined) {
	if (value === undefined) delete process.env.BASE_PATH;
	else process.env.BASE_PATH = value;
	resetBaseCache();
}

beforeEach(() => setBase("/sso"));
afterEach(() => setBase(ORIGINAL));

describe("redirect() under a base", () => {
	test("root-absolute app paths are prefixed", async () => {
		const { Redirect } = await import("../src/core/errors.ts");
		expect(new Redirect(303, "/masuk").location).toBe("/sso/masuk");
		expect(new Redirect(303, "/masuk?next=/beranda").location).toBe("/sso/masuk?next=/beranda");
	});

	test("external targets are left alone", async () => {
		const { Redirect } = await import("../src/core/errors.ts");
		const external = "https://obe.test/auth/callback?code=abc";
		expect(new Redirect(302, external, { allowExternal: true }).location).toBe(external);
	});

	test("validation still runs, and runs before the rebase", async () => {
		const { Redirect } = await import("../src/core/errors.ts");
		// A base must never launder a target the validator would have rejected.
		expect(() => new Redirect(302, "https://evil.test")).toThrow(/external URL/);
		expect(() => new Redirect(302, "//evil.test")).toThrow(/protocol-relative/);
		expect(() => new Redirect(302, "javascript:alert(1)")).toThrow(/dangerous scheme/);
	});

	test("is idempotent — a redirect already under the base is untouched", async () => {
		const { Redirect } = await import("../src/core/errors.ts");
		expect(new Redirect(303, "/sso/masuk").location).toBe("/sso/masuk");
	});

	test("no base means no change", async () => {
		setBase(undefined);
		const { Redirect } = await import("../src/core/errors.ts");
		expect(new Redirect(303, "/masuk").location).toBe("/masuk");
	});
});

describe("trailing-slash canonicalization under a base", () => {
	// The server strips the base before routing, so `canonicalPathname` works in
	// app space — but its result goes out as a `Location:` header, which the
	// browser resolves against the origin. Anything handed back has to be put
	// back under the mount or the 308 walks off it. `trailingSlash: "always"`
	// makes that every request, not just the ones with a stray slash.
	test("the 308 target stays under the mount", async () => {
		const { canonicalPathname } = await import("../src/core/matcher.ts");
		const { stripBase, withBase } = await import("../src/core/basePath.ts");

		const roundTrip = (incoming: string, mode: "never" | "always") => {
			const appPath = stripBase("/sso", incoming);
			if (appPath === null) return null;
			const canonical = canonicalPathname(appPath, mode);
			return canonical === null ? null : withBase("/sso", canonical);
		};

		expect(roundTrip("/sso/about/", "never")).toBe("/sso/about");
		expect(roundTrip("/sso/about", "always")).toBe("/sso/about/");
		expect(roundTrip("/sso/about", "never")).toBe(null);
		// The mount root canonicalizes to nothing, so it never redirects to "/".
		expect(roundTrip("/sso", "always")).toBe(null);
		expect(roundTrip("/sso/", "never")).toBe(null);
	});
});

describe("cookie defaults under a base", () => {
	test("scoped to the mount, so siblings on the origin never receive it", async () => {
		const { CookieJar } = await import("../src/core/cookies.ts");
		const jar = new CookieJar("", true);
		jar.set("session", "abc");
		const header = jar.outgoing[0];
		expect(header).toContain("Path=/sso");
		expect(header).not.toContain("Path=/;");
	});

	test("an explicit path still wins", async () => {
		const { CookieJar } = await import("../src/core/cookies.ts");
		const jar = new CookieJar("", true);
		jar.set("session", "abc", { path: "/sso/admin" });
		expect(jar.outgoing[0]).toContain("Path=/sso/admin");
	});
});
