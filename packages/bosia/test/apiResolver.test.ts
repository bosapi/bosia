import { describe, expect, test } from "bun:test";
import { compileRoutes } from "../src/core/matcher.ts";
import { resolveApiMatch } from "../src/core/apiResolver.ts";

interface FakeApiRoute {
	pattern: string;
	prerender: boolean;
	module: () => Promise<{ prerender?: boolean }>;
}

function makeRoutes(specs: Array<{ pattern: string; prerender?: boolean }>): FakeApiRoute[] {
	const routes: FakeApiRoute[] = specs.map((s) => ({
		pattern: s.pattern,
		prerender: !!s.prerender,
		module: async () => ({ prerender: !!s.prerender }),
	}));
	compileRoutes(routes);
	return routes;
}

describe("resolveApiMatch — .json alias preference", () => {
	test("bare static path matches as-is", async () => {
		const routes = makeRoutes([{ pattern: "/api/skills", prerender: true }]);
		const m = await resolveApiMatch(routes, "/api/skills");
		expect(m?.route.pattern).toBe("/api/skills");
		expect(m?.params).toEqual({});
	});

	test("flat-route .json prefers bare prerender match over null literal", async () => {
		const routes = makeRoutes([{ pattern: "/api/skills", prerender: true }]);
		const m = await resolveApiMatch(routes, "/api/skills.json");
		expect(m?.route.pattern).toBe("/api/skills");
		expect(m?.params).toEqual({});
	});

	test("dynamic <path>.json prefers bare prerender match over catch-all sibling", async () => {
		// This is the v0.5.3 bug: the catch-all eagerly absorbs `.json` into its
		// rest-segment param, and the old "alias only if bare-match is null" path
		// never fires. The aliased bare path must win.
		const routes = makeRoutes([{ pattern: "/api/components/[...path]", prerender: true }]);
		const m = await resolveApiMatch(routes, "/api/components/ui/button.json");
		expect(m?.route.pattern).toBe("/api/components/[...path]");
		expect(m?.params).toEqual({ path: "ui/button" });
	});

	test("[name].json prefers bare prerender match over catch-all swallow", async () => {
		const routes = makeRoutes([{ pattern: "/api/skills/[name]", prerender: true }]);
		const m = await resolveApiMatch(routes, "/api/skills/bosia-chat-form.json");
		expect(m?.route.pattern).toBe("/api/skills/[name]");
		expect(m?.params).toEqual({ name: "bosia-chat-form" });
	});

	test("bare URL still resolves identically (alias not required)", async () => {
		const routes = makeRoutes([{ pattern: "/api/skills/[name]", prerender: true }]);
		const m = await resolveApiMatch(routes, "/api/skills/bosia-chat-form");
		expect(m?.route.pattern).toBe("/api/skills/[name]");
		expect(m?.params).toEqual({ name: "bosia-chat-form" });
	});

	test("non-prerender bare match does NOT win — falls back to literal .json", async () => {
		// If a handler legitimately wants to serve `<segment>.json`, the alias
		// must not steal it. Here only `/api/foo.json` is registered as a
		// non-prerender route; the alias path must fall through.
		const routes = makeRoutes([
			{ pattern: "/api/foo", prerender: false },
			{ pattern: "/api/foo.json", prerender: false },
		]);
		const m = await resolveApiMatch(routes, "/api/foo.json");
		expect(m?.route.pattern).toBe("/api/foo.json");
	});

	test("non-prerender bare match with no literal sibling → returns null (no alias)", async () => {
		const routes = makeRoutes([{ pattern: "/api/foo", prerender: false }]);
		const m = await resolveApiMatch(routes, "/api/foo.json");
		expect(m).toBe(null);
	});

	test("non-.json paths skip alias logic entirely", async () => {
		const routes = makeRoutes([{ pattern: "/api/components/[...path]", prerender: true }]);
		const m = await resolveApiMatch(routes, "/api/components/ui/button");
		expect(m?.route.pattern).toBe("/api/components/[...path]");
		expect(m?.params).toEqual({ path: "ui/button" });
	});

	test("module() throw falls through to literal-path resolution", async () => {
		const routes: FakeApiRoute[] = [
			{
				pattern: "/api/skills",
				prerender: true,
				module: async () => {
					throw new Error("boom");
				},
			},
			{
				pattern: "/api/skills.json",
				prerender: false,
				module: async () => ({}),
			},
		];
		compileRoutes(routes);
		const m = await resolveApiMatch(routes, "/api/skills.json");
		expect(m?.route.pattern).toBe("/api/skills.json");
	});

	test("dynamic-param catch-all .json across deeper segments", async () => {
		const routes = makeRoutes([{ pattern: "/api/blocks/[...path]", prerender: true }]);
		const m = await resolveApiMatch(routes, "/api/blocks/cards/feature.json");
		expect(m?.route.pattern).toBe("/api/blocks/[...path]");
		expect(m?.params).toEqual({ path: "cards/feature" });
	});
});
