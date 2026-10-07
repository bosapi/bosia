import { describe, expect, test } from "bun:test";
import { missingEnvLines } from "../src/cli/feat.ts";

describe("missingEnvLines", () => {
	test("skips keys .env already sets", () => {
		expect(missingEnvLines("SESSION_SECRET=x\n", [["SESSION_SECRET", "y"]])).toEqual([]);
	});

	test("adds a key that is only commented out", () => {
		const env = "# CACHE_KEYS=session,sid\n";
		expect(missingEnvLines(env, [["CACHE_KEYS", "session,bosia_session"]])).toEqual([
			"CACHE_KEYS=session,bosia_session",
		]);
	});

	test("a key that ends another key's name is not a match", () => {
		expect(missingEnvLines("MY_CACHE_KEYS=a\n", [["CACHE_KEYS", "b"]])).toEqual(["CACHE_KEYS=b"]);
	});
});
