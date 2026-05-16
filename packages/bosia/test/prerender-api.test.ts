import { describe, expect, test } from "bun:test";
import { prerenderApiOutPath, substituteParams } from "../src/core/prerender.ts";

describe("prerenderApiOutPath()", () => {
	test("flat API path → .json file", () => {
		expect(prerenderApiOutPath("/api/skills")).toBe("./dist/prerendered/api/skills.json");
	});

	test("nested API path → nested .json file", () => {
		expect(prerenderApiOutPath("/api/components/ui/button")).toBe(
			"./dist/prerendered/api/components/ui/button.json",
		);
	});

	test("strips trailing slash before composing", () => {
		expect(prerenderApiOutPath("/api/skills/")).toBe("./dist/prerendered/api/skills.json");
	});

	test("never emits trailing-slash variants (no index.json)", () => {
		expect(prerenderApiOutPath("/api/blocks")).not.toContain("index.json");
	});
});

describe("substituteParams() — API rest-segment cases", () => {
	test("[...path] expands to multi-segment value used by registry routes", () => {
		expect(substituteParams("/api/components/[...path]", { path: "ui/button" })).toBe(
			"/api/components/ui/button",
		);
		expect(
			substituteParams("/api/blocks/[...path]", {
				path: "cards/feature-editorial",
			}),
		).toBe("/api/blocks/cards/feature-editorial");
	});

	test("[name] expands to single-segment skill value", () => {
		expect(substituteParams("/api/skills/[name]", { name: "bosia-svelte-runes" })).toBe(
			"/api/skills/bosia-svelte-runes",
		);
	});
});
