import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { dirname, join } from "path";
import { scanRoutes, RouteConflictError, PARAM_NAME } from "../src/core/scanner.ts";

let originalCwd: string;
let tmpDir: string;

function write(rel: string, content = "") {
	const full = join(tmpDir, "src", "routes", rel);
	mkdirSync(dirname(full), { recursive: true });
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
		write("blog/+page.svelte");
		write("blog/[slug]/+page.svelte");
		write("blog/[slug]/+page.server.ts", "export const load = async () => ({})");
		const m = scanRoutes();
		const route = m.pages.find((p) => p.pattern === "/blog/[slug]");
		expect(route).toBeDefined();
		expect(route!.pageServer).toBe("blog/[slug]/+page.server.ts");
	});

	test("detects sibling +loading.svelte, null when absent", () => {
		write("with-loading/+page.svelte");
		write("with-loading/+loading.svelte");
		write("without-loading/+page.svelte");
		const m = scanRoutes();
		expect(m.pages.find((p) => p.pattern === "/with-loading")!.loading).toBe(
			"with-loading/+loading.svelte",
		);
		expect(m.pages.find((p) => p.pattern === "/without-loading")!.loading).toBe(null);
	});

	test("+loading.svelte cascades to child routes, nearest ancestor wins", () => {
		write("shop/+loading.svelte");
		write("shop/+page.svelte");
		write("shop/cart/+page.svelte");
		write("shop/cart/item/[id]/+page.svelte");
		write("shop/admin/+loading.svelte");
		write("shop/admin/+page.svelte");
		write("shop/admin/deep/+page.svelte");
		write("elsewhere/+page.svelte");
		const m = scanRoutes();
		const loadingOf = (pattern: string) => m.pages.find((p) => p.pattern === pattern)!.loading;

		expect(loadingOf("/shop")).toBe("shop/+loading.svelte");
		expect(loadingOf("/shop/cart")).toBe("shop/+loading.svelte");
		expect(loadingOf("/shop/cart/item/[id]")).toBe("shop/+loading.svelte");
		// A nearer +loading.svelte overrides the inherited one, for itself and below.
		expect(loadingOf("/shop/admin")).toBe("shop/admin/+loading.svelte");
		expect(loadingOf("/shop/admin/deep")).toBe("shop/admin/+loading.svelte");
		// A sibling subtree inherits nothing.
		expect(loadingOf("/elsewhere")).toBe(null);
	});

	test("discovers +server.ts as API route", () => {
		write("api/hello/+server.ts", "export const GET = () => new Response('hi')");
		const m = scanRoutes();
		expect(m.apis).toEqual([
			{ pattern: "/api/hello", id: "/api/hello", server: "api/hello/+server.ts" },
		]);
	});

	test("route groups are invisible in URL but still walked", () => {
		write("(public)/about/+page.svelte");
		const m = scanRoutes();
		const route = m.pages.find((p) => p.pattern === "/about");
		expect(route).toBeDefined();
		expect(route!.page).toBe("(public)/about/+page.svelte");
	});

	test("(private) is an ordinary route group", () => {
		write("(private)/dashboard/+page.svelte");
		const m = scanRoutes();
		const route = m.pages.find((p) => p.pattern === "/dashboard");
		expect(route).toBeDefined();
		expect(route!.page).toBe("(private)/dashboard/+page.svelte");
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

	test("cache = false in +page.server.ts opts the route out", () => {
		write("a/+page.svelte");
		write("a/+page.server.ts", "export const cache = false;\nexport const load = () => ({});");
		write("b/+page.svelte");
		write("b/+page.server.ts", "export const cache = flag();");
		write("c/+page.svelte");
		write("c/+page.server.ts", "export const load = () => ({});");
		write("d/+page.svelte", "<script module>export const cache = false;</script>");
		write("d/+page.server.ts", "export const load = () => ({});");
		write("e/+page.svelte");
		write("e/+page.server.ts", 'export { cache } from "$lib/private";');
		write("f/+page.svelte");
		write("f/+page.server.ts", 'export * from "$lib/private";');
		write("g/+page.svelte");
		write("g/+page.server.ts", "export let cache = false;");
		write("h/+page.svelte");
		write(
			"h/+page.server.ts",
			'export const load = ({ setHeaders }) => setHeaders({ "cache-control": "no-store" });',
		);
		const m = scanRoutes();
		const cache = (p: string) => m.pages.find((r) => r.pattern === p)!.cache;
		expect(cache("/e")).toBe(null);
		expect(cache("/f")).toBe(null);
		expect(cache("/g")).toBe(null);
		expect(cache("/h")).toBe(true);
		expect(cache("/a")).toBe(false);
		expect(cache("/b")).toBe(null);
		expect(cache("/c")).toBe(true);
		expect(cache("/d")).toBe(false);
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

	test("route id is the folder path with groups and params kept", () => {
		write("+page.svelte");
		write("(private)/dashboard/[id]/+page.svelte");
		write("api/(admin)/users/+server.ts");
		const m = scanRoutes();
		const ids = Object.fromEntries(m.pages.map((p) => [p.pattern, p.id]));
		expect(ids["/"]).toBe("/");
		expect(ids["/dashboard/[id]"]).toBe("/(private)/dashboard/[id]");
		expect(m.apis[0].pattern).toBe("/api/users");
		expect(m.apis[0].id).toBe("/api/(admin)/users");
	});
});

describe("scanRoutes() route conflicts", () => {
	function conflict(): RouteConflictError | null {
		try {
			scanRoutes();
			return null;
		} catch (err) {
			if (err instanceof RouteConflictError) return err;
			throw err;
		}
	}

	test("fails when a route group duplicates a page URL, naming both files", () => {
		write("+page.svelte");
		write("(public)/+page.svelte");
		const err = conflict();
		expect(err?.message).toContain('The "/" and "/" routes conflict with each other');
		expect(err?.message).toContain("src/routes/+page.svelte");
		expect(err?.message).toContain("src/routes/(public)/+page.svelte");
	});

	test("differently named params at the same spot conflict", () => {
		write("blog/[id]/+page.svelte");
		write("(app)/blog/[slug]/+page.svelte");
		const msg = conflict()?.message ?? "";
		expect(msg).toContain("routes conflict with each other");
		expect(msg).toContain("src/routes/blog/[id]/+page.svelte");
		expect(msg).toContain("src/routes/(app)/blog/[slug]/+page.svelte");
	});

	test("a catch-all that isn't last fails the build", () => {
		write("docs/[...path]/edit/+page.svelte");
		expect(conflict()?.message).toContain("[...path] must be the last part of the route");
	});

	test("a param name that isn't a TypeScript identifier fails the build", () => {
		const bad = ["[...]", "[.hidden]", "[id=integer]", "[...path=rest]", "[path...]", "[path..]"];
		bad.push("[…rest]", "[ slug]", "[post-id]", "[file.name]", "[1st]", "[slüg]");
		for (const seg of bad) {
			rmSync(join(tmpDir, "src"), { recursive: true, force: true });
			write(`x/${seg}/+page.svelte`);
			expect(conflict()?.message).toContain(
				`${seg}: a param name uses ASCII letters, digits, _ and $`,
			);
		}
	});

	// No folder: Windows can't create `[id?]`, yet the rule must hold on every platform.
	test("optional [id?] is not a param name", () => {
		expect(PARAM_NAME.test("id?")).toBe(false);
	});

	test("partial brackets fail the build", () => {
		write("api/[id].json/+server.ts");
		expect(conflict()?.message).toContain("[id].json must be a whole segment");
	});

	test("[[param]] next to a [param] reports the bad segment, not a conflict", () => {
		write("[[lang]]/about/+page.svelte");
		write("[x]/about/+page.svelte");
		expect(conflict()?.message).toContain("[[lang]] must be a whole segment");
	});

	test("TypeScript identifiers build: [x123], [user_id], [_id], [$id], [...path]", () => {
		write("a/[x123]/+page.svelte");
		write("b/[$id]/+page.svelte");
		write("c/[user_id]/+page.svelte");
		write("e/[_id]/+page.svelte");
		write("f/[...path]/+page.svelte");
		write("d/[slug]/edit/+page.svelte");
		expect(conflict()).toBeNull();
	});

	test("__proto__ as a param name fails the build", () => {
		write("[__proto__]/+page.svelte");
		expect(conflict()?.message).toContain('"__proto__" can\'t be a param name');
	});

	test("SvelteKit optional [[param]] fails the build", () => {
		write("[[lang]]/about/+page.svelte");
		expect(conflict()?.message).toContain("[[lang]] must be a whole segment");
	});

	test("one param name used twice fails the build", () => {
		write("[id]/x/[...id]/+page.svelte");
		expect(conflict()?.message).toContain('the param "id" is used twice');
	});

	test("duplicate +server.ts API routes conflict", () => {
		write("(a)/api/ping/+server.ts");
		write("(b)/api/ping/+server.ts");
		expect(conflict()?.message).toContain("src/routes/(b)/api/ping/+server.ts");
	});

	test("distinct routes, and a page plus an API at one URL, do not conflict", () => {
		write("+page.svelte");
		write("about/+page.svelte");
		write("blog/+page.svelte");
		write("blog/[slug]/+page.svelte");
		write("blog/[...rest]/+page.svelte");
		write("about/+server.ts");
		expect(conflict()).toBe(null);
	});
});

describe("scanRoutes() catch-all prefix warning", () => {
	function warnings(): string[] {
		const seen: string[] = [];
		const orig = console.warn;
		console.warn = (msg: string) => seen.push(msg);
		try {
			scanRoutes();
		} finally {
			console.warn = orig;
		}
		return seen;
	}

	test("a page at a [param] prefix covers its catch-all", () => {
		write("[lang]/+page.svelte");
		write("[lang]/[...rest]/+page.svelte");
		expect(warnings()).toEqual([]);
	});

	test("a differently named param page covers the prefix too", () => {
		write("[slug]/+page.svelte");
		write("[lang]/[...rest]/+page.svelte");
		expect(warnings()).toEqual([]);
	});

	test("a missing prefix page still warns", () => {
		write("docs/[...my_path]/+page.svelte");
		expect(warnings().join("")).toContain(`doesn't match "/docs" itself`);
	});
});
