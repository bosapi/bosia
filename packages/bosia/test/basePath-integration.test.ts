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
