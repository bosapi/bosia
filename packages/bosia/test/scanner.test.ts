import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { scanRoutes } from "../src/core/scanner.ts";

let originalCwd: string;
let tmpDir: string;

function write(rel: string, content = "") {
	const full = join(tmpDir, "src", "routes", rel);
	mkdirSync(full.substring(0, full.lastIndexOf("/")), { recursive: true });
	writeFileSync(full, content);
}

beforeEach(() => {
	originalCwd = process.cwd();
	tmpDir = mkdtempSync(join(tmpdir(), "bosia-scanner-"));
	mkdirSync(join(tmpDir, "src", "routes"), { recursive: true });
	process.chdir(tmpDir);
});

afterEach(() => {
	process.chdir(originalCwd);
	rmSync(tmpDir, { recursive: true, force: true });
});

describe("scanRoutes()", () => {
	test("returns empty manifest when routes dir is empty", () => {
		const m = scanRoutes();
		expect(m.pages).toEqual([]);
		expect(m.apis).toEqual([]);
		expect(m.errorPage).toBe(null);
	});

	test("discovers root +page.svelte at /", () => {
		write("+page.svelte");
		const m = scanRoutes();
		expect(m.pages).toHaveLength(1);
		expect(m.pages[0].pattern).toBe("/");
		expect(m.pages[0].page).toBe("+page.svelte");
		expect(m.pages[0].pageServer).toBe(null);
		expect(m.pages[0].layouts).toEqual([]);
	});

	test("discovers nested route with +page.server.ts", () => {
		write("blog/[slug]/+page.svelte");
		write("blog/[slug]/+page.server.ts", "export const load = async () => ({})");
		const m = scanRoutes();
		const route = m.pages.find((p) => p.pattern === "/blog/[slug]");
		expect(route).toBeDefined();
		expect(route!.pageServer).toBe("blog/[slug]/+page.server.ts");
	});

	test("discovers +server.ts as API route", () => {
		write("api/hello/+server.ts", "export const GET = () => new Response('hi')");
		const m = scanRoutes();
		expect(m.apis).toEqual([{ pattern: "/api/hello", server: "api/hello/+server.ts" }]);
	});

	test("route groups are invisible in URL but still walked", () => {
		write("(public)/about/+page.svelte");
		const m = scanRoutes();
		const route = m.pages.find((p) => p.pattern === "/about");
		expect(route).toBeDefined();
		expect(route!.page).toBe("(public)/about/+page.svelte");
	});

	test("layout chain accumulates root → leaf", () => {
		write("+layout.svelte");
		write("dashboard/+layout.svelte");
		write("dashboard/settings/+page.svelte");
		const m = scanRoutes();
		const route = m.pages.find((p) => p.pattern === "/dashboard/settings");
		expect(route!.layouts).toEqual(["+layout.svelte", "dashboard/+layout.svelte"]);
	});

	test("trailingSlash from +page.server.ts wins over inherited", () => {
		write("+layout.server.ts", "export const trailingSlash: 'always' = 'always';");
		write("+page.svelte");
		write("foo/+page.svelte");
		write("foo/+page.server.ts", "export const trailingSlash = 'never';");
		const m = scanRoutes();
		const root = m.pages.find((p) => p.pattern === "/")!;
		const foo = m.pages.find((p) => p.pattern === "/foo")!;
		expect(root.trailingSlash).toBe("always");
		expect(foo.trailingSlash).toBe("never");
	});

	test("trailingSlash defaults to 'never' when no config", () => {
		write("+page.svelte");
		const m = scanRoutes();
		expect(m.pages[0].trailingSlash).toBe("never");
	});

	test("detects root +error.svelte", () => {
		writeFileSync(join(tmpDir, "src", "routes", "+error.svelte"), "");
		const m = scanRoutes();
		expect(m.errorPage).toBe("+error.svelte");
	});

	test("skips dotfile and node_modules subdirectories", () => {
		write(".hidden/+page.svelte");
		write("node_modules/foo/+page.svelte");
		write("ok/+page.svelte");
		const m = scanRoutes();
		expect(m.pages.map((p) => p.pattern)).toEqual(["/ok"]);
	});

	test("layoutServers chain records depth and path", () => {
		write("+layout.svelte");
		write("+layout.server.ts", "export const load = async () => ({})");
		write("admin/+layout.svelte");
		write("admin/+layout.server.ts", "export const load = async () => ({})");
		write("admin/users/+page.svelte");
		const m = scanRoutes();
		const route = m.pages.find((p) => p.pattern === "/admin/users")!;
		expect(route.layoutServers).toHaveLength(2);
		expect(route.layoutServers[0].path).toBe("+layout.server.ts");
		expect(route.layoutServers[1].path).toBe("admin/+layout.server.ts");
	});
});
