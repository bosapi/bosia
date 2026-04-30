import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { generateRouteTypes, ensureRootDirs } from "../src/core/routeTypes.ts";
import type { RouteManifest } from "../src/core/types.ts";

let originalCwd: string;
let tmpDir: string;

beforeEach(() => {
	originalCwd = process.cwd();
	tmpDir = mkdtempSync(join(tmpdir(), "bosia-routetypes-"));
	process.chdir(tmpDir);
});

afterEach(() => {
	process.chdir(originalCwd);
	rmSync(tmpDir, { recursive: true, force: true });
});

function readTypes(...segments: string[]): string {
	return readFileSync(
		join(tmpDir, ".bosia", "types", "src", "routes", ...segments, "$types.d.ts"),
		"utf-8",
	);
}

describe("generateRouteTypes() — Params extraction", () => {
	test("static route → empty Params", () => {
		const m: RouteManifest = {
			pages: [
				{
					pattern: "/about",
					page: "about/+page.svelte",
					layouts: [],
					pageServer: null,
					layoutServers: [],
					trailingSlash: "never",
				},
			],
			apis: [],
			errorPage: null,
		};
		generateRouteTypes(m);
		const out = readTypes("about");
		expect(out).toContain("export type Params = {};");
	});

	test("[slug] → { slug: string }", () => {
		const m: RouteManifest = {
			pages: [
				{
					pattern: "/blog/[slug]",
					page: "blog/[slug]/+page.svelte",
					layouts: [],
					pageServer: null,
					layoutServers: [],
					trailingSlash: "never",
				},
			],
			apis: [],
			errorPage: null,
		};
		generateRouteTypes(m);
		const out = readTypes("blog", "[slug]");
		expect(out).toContain("export type Params = { slug: string };");
	});

	test("[...rest] catch-all extracted", () => {
		const m: RouteManifest = {
			pages: [
				{
					pattern: "/docs/[...path]",
					page: "docs/[...path]/+page.svelte",
					layouts: [],
					pageServer: null,
					layoutServers: [],
					trailingSlash: "never",
				},
			],
			apis: [],
			errorPage: null,
		};
		generateRouteTypes(m);
		const out = readTypes("docs", "[...path]");
		expect(out).toContain("export type Params = { path: string };");
	});

	test("multiple dynamic segments combined", () => {
		const m: RouteManifest = {
			pages: [
				{
					pattern: "/[org]/[repo]",
					page: "[org]/[repo]/+page.svelte",
					layouts: [],
					pageServer: null,
					layoutServers: [],
					trailingSlash: "never",
				},
			],
			apis: [],
			errorPage: null,
		};
		generateRouteTypes(m);
		const out = readTypes("[org]", "[repo]");
		expect(out).toContain("export type Params = { org: string; repo: string };");
	});

	test("route group segments excluded from Params", () => {
		const m: RouteManifest = {
			pages: [
				{
					pattern: "/blog/[slug]",
					page: "(public)/blog/[slug]/+page.svelte",
					layouts: [],
					pageServer: null,
					layoutServers: [],
					trailingSlash: "never",
				},
			],
			apis: [],
			errorPage: null,
		};
		generateRouteTypes(m);
		const out = readTypes("(public)", "blog", "[slug]");
		expect(out).toContain("export type Params = { slug: string };");
	});
});

describe("generateRouteTypes() — exports", () => {
	test("with pageServer: emits PageServerLoad, Action, ActionData, PageData via load", () => {
		const m: RouteManifest = {
			pages: [
				{
					pattern: "/foo",
					page: "foo/+page.svelte",
					layouts: [],
					pageServer: "foo/+page.server.ts",
					layoutServers: [],
					trailingSlash: "never",
				},
			],
			apis: [],
			errorPage: null,
		};
		generateRouteTypes(m);
		const out = readTypes("foo");
		expect(out).toContain("export type PageServerLoad");
		expect(out).toContain("export type Action ");
		expect(out).toContain("export type ActionData");
		expect(out).toContain("import type { load as _pageLoad }");
	});

	test("without pageServer: PageData is just { params: Params }", () => {
		const m: RouteManifest = {
			pages: [
				{
					pattern: "/about",
					page: "about/+page.svelte",
					layouts: [],
					pageServer: null,
					layoutServers: [],
					trailingSlash: "never",
				},
			],
			apis: [],
			errorPage: null,
		};
		generateRouteTypes(m);
		const out = readTypes("about");
		expect(out).toContain("export type PageData = { params: Params };");
		expect(out).not.toContain("_pageLoad");
		expect(out).not.toContain("ActionData");
	});

	test("layoutServer present → LayoutServerLoad and LayoutData emitted in layout dir", () => {
		const m: RouteManifest = {
			pages: [
				{
					pattern: "/dash/me",
					page: "dash/me/+page.svelte",
					layouts: ["dash/+layout.svelte"],
					pageServer: null,
					layoutServers: [{ path: "dash/+layout.server.ts", depth: 0 }],
					trailingSlash: "never",
				},
			],
			apis: [],
			errorPage: null,
		};
		generateRouteTypes(m);
		const out = readTypes("dash");
		expect(out).toContain("export type LayoutServerLoad");
		expect(out).toContain("export type LayoutData");
	});
});

describe("ensureRootDirs()", () => {
	test("no-op when tsconfig missing", () => {
		ensureRootDirs();
		expect(existsSync(join(tmpDir, "tsconfig.json"))).toBe(false);
	});

	test("adds .bosia/types to rootDirs when absent", () => {
		writeFileSync(join(tmpDir, "tsconfig.json"), JSON.stringify({ compilerOptions: {} }));
		ensureRootDirs();
		const cfg = JSON.parse(readFileSync(join(tmpDir, "tsconfig.json"), "utf-8"));
		expect(cfg.compilerOptions.rootDirs).toEqual([".", ".bosia/types"]);
	});

	test("does not duplicate if already present", () => {
		const original = {
			compilerOptions: { rootDirs: [".", ".bosia/types"] },
		};
		writeFileSync(join(tmpDir, "tsconfig.json"), JSON.stringify(original));
		ensureRootDirs();
		const cfg = JSON.parse(readFileSync(join(tmpDir, "tsconfig.json"), "utf-8"));
		expect(cfg.compilerOptions.rootDirs).toEqual([".", ".bosia/types"]);
	});

	test("preserves other rootDirs entries", () => {
		writeFileSync(
			join(tmpDir, "tsconfig.json"),
			JSON.stringify({ compilerOptions: { rootDirs: ["./extra"] } }),
		);
		ensureRootDirs();
		const cfg = JSON.parse(readFileSync(join(tmpDir, "tsconfig.json"), "utf-8"));
		expect(cfg.compilerOptions.rootDirs).toContain(".bosia/types");
		expect(cfg.compilerOptions.rootDirs).toContain("./extra");
	});

	test("does nothing on unparseable tsconfig", () => {
		writeFileSync(join(tmpDir, "tsconfig.json"), "{ this is not json");
		ensureRootDirs();
		// File untouched (still invalid)
		expect(readFileSync(join(tmpDir, "tsconfig.json"), "utf-8")).toBe("{ this is not json");
	});
});
