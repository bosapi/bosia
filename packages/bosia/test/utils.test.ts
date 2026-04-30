import { describe, expect, test } from "bun:test";
import { cn, getServerTime } from "../src/lib/utils.ts";

describe("cn() — class merge", () => {
	test("joins string args with spaces", () => {
		expect(cn("foo", "bar")).toBe("foo bar");
	});

	test("drops falsy values", () => {
		expect(cn("foo", false, null, undefined, "", "bar")).toBe("foo bar");
	});

	test("flattens nested arrays", () => {
		expect(cn("a", ["b", ["c", "d"]])).toBe("a b c d");
	});

	test("object keys included when truthy", () => {
		expect(cn({ foo: true, bar: false, baz: 1 })).toBe("foo baz");
	});

	test("twMerge resolves Tailwind conflicts (later wins)", () => {
		expect(cn("p-2", "p-4")).toBe("p-4");
		expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
	});

	test("returns empty string with no inputs", () => {
		expect(cn()).toBe("");
	});

	test("handles numeric values", () => {
		expect(cn("a", 0, 1)).toBe("a 1");
	});
});

describe("getServerTime()", () => {
	test("returns timestamp + timezone", () => {
		const out = getServerTime();
		expect(typeof out.timestamp).toBe("string");
		expect(typeof out.timezone).toBe("string");
		expect(out.timezone.length).toBeGreaterThan(0);
	});

	test("timestamp is ISO-like with offset suffix", () => {
		const { timestamp } = getServerTime();
		expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}[+-]\d{2}:\d{2}$/);
	});

	test("timestamp parses back to a real date close to now", () => {
		const { timestamp } = getServerTime();
		const parsed = new Date(timestamp);
		expect(Number.isFinite(parsed.getTime())).toBe(true);
		expect(Math.abs(parsed.getTime() - Date.now())).toBeLessThan(5_000);
	});
});
