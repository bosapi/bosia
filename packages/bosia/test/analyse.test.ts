import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, utimesSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { dirname, join } from "path";
import { scanRoutes } from "../src/core/scanner.ts";
import { analyseRoutes, analysedModules, RouteAnalyseError } from "../src/core/analyse.ts";
import { detectPrerenderRoutes } from "../src/core/prerender.ts";

let originalCwd: string;
let tmpDir: string;

function write(rel: string, content = "") {
	const full = join(tmpDir, "src", "routes", rel);
	mkdirSync(dirname(full), { recursive: true });
	writeFileSync(full, content);
}

async function analysed(dev = false, fresh = false) {
	const m = scanRoutes();
	await analyseRoutes(m, [], dev, fresh);
	return m;
}

beforeEach(() => {
	originalCwd = process.cwd();
	tmpDir = mkdtempSync(join(tmpdir(), "bosia-analyse-"));
	mkdirSync(join(tmpDir, "src", "routes"), { recursive: true });
	process.chdir(tmpDir);
});

afterEach(() => {
	// Prerender reads this map; other test files share the process.
	analysedModules.clear();
	process.chdir(originalCwd);
	rmSync(tmpDir, { recursive: true, force: true });
});

describe("analyseRoutes() prerender", () => {
	test("reads the real export, whatever its spelling", async () => {
		const pages: Record<string, string> = {
			on: "export const prerender: boolean = true;\n",
			off: "// export const prerender = true\n/* export const prerender = true */\n",
			renamed: "const p = true;\nexport { p as prerender };\n",
			let: "export let prerender = true;\n",
			string: 'const s = "export const prerender = true";\n',
			// A comment can't skip it: only a real `actions` export does.
			comment: "export const prerender = true;\n// export const actions = {};\n",
			actions: "export const prerender = true;\nexport const actions = {};\n",
			ssr: "export const prerender = true;\nexport const ssr = false;\n",
		};
		for (const [dir, src] of Object.entries(pages)) {
			write(`${dir}/+page.svelte`);
			write(`${dir}/+page.server.ts`, src);
		}
		write("api/+server.ts", "const p = true;\nexport { p as prerender };\n");
		const m = await analysed();
		const flag = (p: string) => m.pages.find((r) => r.pattern === p)?.prerender;
		expect(flag("/on")).toBe(true);
		expect(flag("/off")).toBe(false);
		expect(flag("/renamed")).toBe(true);
		expect(flag("/let")).toBe(true);
		expect(flag("/string")).toBe(false);
		expect(flag("/comment")).toBe(true);
		expect(flag("/actions")).toBe(false);
		expect(flag("/ssr")).toBe(false);
		expect(m.apis[0]!.prerender).toBe(true);
	});
});

describe("analyseRoutes() trailingSlash", () => {
	test("the page wins over the nearest layout, which wins over one above", async () => {
		write("+layout.server.ts", "export const trailingSlash = 'always';\n");
		write("+page.svelte");
		write("a/+layout.server.ts", "const t = 'ignore';\nexport { t as trailingSlash };\n");
		write("a/+page.svelte");
		write("a/b/+page.svelte");
		write("a/b/+page.server.ts", "export const trailingSlash = 'never';\n");
		write("c/+page.svelte");
		write("c/+page.server.ts", "// export const trailingSlash = 'never';\n");
		const m = await analysed();
		const ts = (p: string) => m.pages.find((r) => r.pattern === p)?.trailingSlash;
		expect(ts("/")).toBe("always");
		expect(ts("/a")).toBe("ignore");
		expect(ts("/a/b")).toBe("never");
		expect(ts("/c")).toBe("always");
	});

	test("defaults to 'never'", async () => {
		write("+page.svelte");
		expect((await analysed()).pages[0]!.trailingSlash).toBe("never");
	});
});

describe("analyseRoutes() failures", () => {
	test("a module that throws while loading, and a bad trailingSlash, fail together", async () => {
		write("a/+page.svelte");
		write("a/+page.server.ts", 'throw new Error("no database");\n');
		write("b/+page.svelte");
		write("b/+page.server.ts", "export const trailingSlash = 'sometimes';\n");
		const err = await analysed().catch((e) => e);
		expect(err).toBeInstanceOf(RouteAnalyseError);
		expect(err.message).toContain("src/routes/a/+page.server.ts failed to load: no database");
		expect(err.message).toContain(
			'src/routes/b/+page.server.ts exports trailingSlash = "sometimes"',
		);
	});

	test("a module that doesn't bundle fails", async () => {
		write("+page.svelte");
		write("+page.server.ts", 'import { x } from "./missing.ts";\nexport const y = x;\n');
		expect(await analysed().catch((e) => e)).toBeInstanceOf(RouteAnalyseError);
	});
});

describe("analyseRoutes() reuse", () => {
	test("dev re-imports only changed files, and keeps a failing file's last flags", async () => {
		write("+page.svelte");
		write("+page.server.ts", "export const trailingSlash = 'always';\n");
		write("a/+page.svelte");
		write("a/+page.server.ts", "export const trailingSlash = 'ignore';\n");
		// Whole seconds: utimesSync can't restore a sub-millisecond mtime.
		const file = join(tmpDir, "src/routes/+page.server.ts");
		utimesSync(file, 1e9, 1e9);
		const ts = (m: any, p: string) => m.pages.find((r: any) => r.pattern === p)?.trailingSlash;
		expect(ts(await analysed(true), "/")).toBe("always");
		// Same mtime: the cache answers, even though the file now says otherwise.
		writeFileSync(file, "export const trailingSlash = 'never';\n");
		utimesSync(file, 1e9, 1e9);
		write("a/+page.server.ts", "export const trailingSlash = 'always';\n");
		utimesSync(join(tmpDir, "src/routes/a/+page.server.ts"), 2e9, 2e9);
		const m = await analysed(true);
		expect(ts(m, "/")).toBe("always");
		expect(ts(m, "/a")).toBe("always");
		expect([...analysedModules.keys()]).toEqual(["a/+page.server.ts"]);
		// A build reads every file and doesn't touch the dev cache.
		expect(ts(await analysed(), "/")).toBe("never");
		// Dev warns on a throw and keeps the last flags; the build fails.
		write("a/+page.server.ts", 'throw new Error("db down");\n');
		utimesSync(join(tmpDir, "src/routes/a/+page.server.ts"), 3e9, 3e9);
		const warn = spyOn(console, "warn").mockImplementation(() => {});
		try {
			expect(ts(await analysed(true), "/a")).toBe("always");
			expect(warn.mock.calls.flat().join("\n")).toContain("db down");
			// And the files that loaded stay cached across runs.
			expect(ts(await analysed(true), "/")).toBe("always");
			expect(await analysed().catch((e) => e)).toBeInstanceOf(RouteAnalyseError);
			// A throw is retried next run though the file's mtime didn't move: the
			// cause (DB, a src/lib helper) can be fixed elsewhere.
			write("a/+page.server.ts", "export const trailingSlash = 'ignore';\n");
			utimesSync(join(tmpDir, "src/routes/a/+page.server.ts"), 3e9, 3e9);
			expect(ts(await analysed(true), "/a")).toBe("ignore");
			// `fresh` (dev start, .env change) re-reads every file.
			expect(ts(await analysed(true, true), "/")).toBe("never");
		} finally {
			warn.mockRestore();
		}
	});

	test("prerender calls entries() on the analysed module, $env and all", async () => {
		mkdirSync(join(tmpDir, ".bosia"), { recursive: true });
		writeFileSync(join(tmpDir, ".bosia/env.server.ts"), 'export const SLUG = "hello";\n');
		write("blog/[slug]/+page.svelte");
		write(
			"blog/[slug]/+page.server.ts",
			'import { SLUG } from "$env";\nconst p = true;\nexport { p as prerender };\nexport const entries = () => [{ slug: SLUG }];\n',
		);
		const targets = await detectPrerenderRoutes(await analysed());
		expect(targets.map((t) => t.path)).toEqual(["/blog/hello"]);
	});

	test("prerender imports a dynamic route a plugin added (not analysed) itself", async () => {
		write("tags/[tag]/+page.svelte");
		write("tags/[tag]/+page.server.ts", "export const entries = () => [{ tag: 'bun' }];\n");
		const m = await analysed();
		// As a postScan plugin would.
		m.pages.find((r) => r.pattern === "/tags/[tag]")!.prerender = true;
		analysedModules.clear();
		const targets = await detectPrerenderRoutes(m);
		expect(targets.map((t) => t.path)).toEqual(["/tags/bun"]);
	});

	test("a build warns about import.meta.dir, which points at the bundled copy", async () => {
		write("blog/[slug]/+page.svelte");
		write(
			"blog/[slug]/+page.server.ts",
			"export const prerender = true;\nexport const entries = () => [{ slug: import.meta.dir.includes('.bosia') ? 'bundled' : 'source' }];\n",
		);
		const warn = spyOn(console, "warn").mockImplementation(() => {});
		try {
			const targets = await detectPrerenderRoutes(await analysed());
			expect(targets.map((t) => t.path)).toEqual(["/blog/bundled"]);
			expect(warn.mock.calls.flat().join("\n")).toContain(
				"src/routes/blog/[slug]/+page.server.ts uses import.meta.dir/url",
			);
		} finally {
			warn.mockRestore();
		}
	});
});
