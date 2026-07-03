import { describe, expect, test } from "bun:test";
import { CookieJar } from "../src/core/cookies.ts";

describe("CookieJar — incoming", () => {
	test("get reads parsed cookie", () => {
		const jar = new CookieJar("foo=bar; baz=qux");
		expect(jar.get("foo")).toBe("bar");
		expect(jar.get("baz")).toBe("qux");
	});

	test("get returns undefined for missing", () => {
		const jar = new CookieJar("");
		expect(jar.get("nope")).toBeUndefined();
	});

	test("getAll returns a copy of all incoming", () => {
		const jar = new CookieJar("a=1; b=2");
		const all = jar.getAll();
		expect(all).toEqual({ a: "1", b: "2" });
		all.a = "mutated";
		expect(jar.get("a")).toBe("1");
	});

	test("decodes URI-encoded values", () => {
		const jar = new CookieJar("token=hello%20world");
		expect(jar.get("token")).toBe("hello world");
	});

	test("falls back to raw value if decoding fails", () => {
		const jar = new CookieJar("bad=%E0%A4%A");
		expect(jar.get("bad")).toBe("%E0%A4%A");
	});

	test("readNames tracks only cookies that were read AND present", () => {
		const jar = new CookieJar("a=1; b=2");
		jar.get("a");
		jar.get("missing");
		expect([...jar.readNames]).toEqual(["a"]);
	});

	test("getAll marks every incoming cookie as read", () => {
		const jar = new CookieJar("a=1; b=2");
		jar.getAll();
		expect([...jar.readNames].sort()).toEqual(["a", "b"]);
	});

	test("accessed flips on get / getAll", () => {
		const a = new CookieJar("x=1");
		expect(a.accessed).toBe(false);
		a.get("x");
		expect(a.accessed).toBe(true);

		const b = new CookieJar("x=1");
		expect(b.accessed).toBe(false);
		b.getAll();
		expect(b.accessed).toBe(true);
	});
});

describe("CookieJar — set / delete", () => {
	test("serializes Set-Cookie with defaults over HTTPS", () => {
		const jar = new CookieJar("", true);
		jar.set("session", "abc");
		const [header] = jar.outgoing;
		expect(header).toContain("session=abc");
		expect(header).toContain("Path=/");
		expect(header).toContain("HttpOnly");
		expect(header).toContain("Secure");
		expect(header).toContain("SameSite=Lax");
	});

	test("http mode omits Secure by default", () => {
		const jar = new CookieJar("", false);
		jar.set("session", "abc");
		expect(jar.outgoing[0]).not.toContain("Secure");
	});

	test("http mode downgrades caller-forced secure:true", () => {
		const jar = new CookieJar("", false);
		jar.set("session", "abc", { secure: true });
		expect(jar.outgoing[0]).not.toContain("Secure");
	});

	test("https mode honors secure:true", () => {
		const jar = new CookieJar("", true);
		jar.set("session", "abc", { secure: true });
		expect(jar.outgoing[0]).toContain("Secure");
	});

	test("normalizes lowercase sameSite to capitalized header", () => {
		const jar = new CookieJar("");
		jar.set("k", "v", { sameSite: "lax" });
		expect(jar.outgoing[0]).toContain("SameSite=Lax");
	});

	test("accepts all three sameSite values in either case", () => {
		for (const v of ["Strict", "strict", "Lax", "lax", "None", "none"] as const) {
			const jar = new CookieJar("");
			jar.set("k", "v", { sameSite: v });
			expect(jar.outgoing[0]).toMatch(/SameSite=(Strict|Lax|None)/);
		}
	});

	test("URL-encodes value", () => {
		const jar = new CookieJar("");
		jar.set("name", "hello world; bad");
		expect(jar.outgoing[0]).toContain("name=hello%20world%3B%20bad");
	});

	test("includes Domain and Max-Age", () => {
		const jar = new CookieJar("");
		jar.set("k", "v", { domain: "example.com", maxAge: 60 });
		expect(jar.outgoing[0]).toContain("Domain=example.com");
		expect(jar.outgoing[0]).toContain("Max-Age=60");
	});

	test("rejects invalid name (RFC 6265 token)", () => {
		const jar = new CookieJar("");
		expect(() => jar.set("bad name", "v")).toThrow();
		expect(() => jar.set("bad;name", "v")).toThrow();
		expect(() => jar.set("", "v")).toThrow();
	});

	test("rejects unsafe path / domain", () => {
		const jar = new CookieJar("");
		expect(() => jar.set("k", "v", { path: "/x\r\n" })).toThrow();
		expect(() => jar.set("k", "v", { domain: "x;y" })).toThrow();
	});

	test("rejects invalid sameSite", () => {
		const jar = new CookieJar("");
		expect(() => jar.set("k", "v", { sameSite: "Bogus" as any })).toThrow();
	});

	test("delete sets Max-Age=0 with empty value", () => {
		const jar = new CookieJar("");
		jar.delete("session");
		expect(jar.outgoing[0]).toContain("session=");
		expect(jar.outgoing[0]).toContain("Max-Age=0");
	});
});
