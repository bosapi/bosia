// Regression table for prerender entries() values and output clashes.
// Every row is a case a review once found. Add a row for each new finding before fixing it,
// and never delete one: a row that has to change means a decided rule is being reopened.
// A finding that is a new kind of outcome (not just a new value) also gets an oracle check in
// prerender-invariants.test.ts, and a tricky part added to its PARTS list.
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { dirname, join } from "path";
import {
	detectPrerenderRoutes,
	findMisownedTargets,
	findPrerenderClash,
	PrerenderEntriesError,
	type PrerenderTarget,
	substituteParams,
} from "../src/core/prerender.ts";

// ─── substituteParams(): values that must build ───────────

const ACCEPT: [pattern: string, value: string, path: string][] = [
	["/blog/[slug]", "hello-world", "/blog/hello-world"],
	["/blog/[slug]", "Hello_World-2.0~x", "/blog/Hello_World-2.0~x"],
	["/compare/[range]", "v1..v2", "/compare/v1..v2"], // `..` inside a part is text, not traversal
	["/blog/[slug]", "_draft", "/blog/_draft"], // leading `_` is common, only `.` is hidden
	["/blog/[slug]", "console", "/blog/console"], // not a device name, only starts with `con`
	["/blog/[slug]", "post.htm", "/blog/post.htm"],
	["/docs/[...p]", "guide/intro", "/docs/guide/intro"],
	["/docs/[...p]", "guide/intro/", "/docs/guide/intro"], // one trailing `/` is dropped
	["/docs/[...p]", "guide/v1..v2/intro", "/docs/guide/v1..v2/intro"],
	["/docs/[...p]", "index/a", "/docs/index/a"], // `index` only matters as the last part
	["/docs/[...p]", "release.html/notes", "/docs/release.html/notes"], // only the last part names a file
	["/[slug]/edit", "index", "/index/edit"], // the param isn't the URL's last part
	["/[slug]/edit", "a.json", "/a.json/edit"],
];

describe("substituteParams() accepts", () => {
	for (const [pattern, value, path] of ACCEPT)
		test(`${pattern} ← ${JSON.stringify(value)}`, () => {
			const name = pattern.match(/\[(?:\.\.\.)?(\w+)\]/)![1]!;
			expect(substituteParams(pattern, { [name]: value })).toBe(path);
		});
});

// ─── substituteParams(): values that must fail ────────────

const CHARS = /use only ASCII letters/;
const REJECT: [pattern: string, value: string, error: RegExp][] = [
	// Not unreserved ASCII: the fetched URL, the file and a static host's lookup would disagree.
	["/blog/[slug]", "50%-off", CHARS],
	["/blog/[slug]", "100%", CHARS],
	["/blog/[slug]", "%2e%2e", CHARS], // the URL parser folds it into `..`
	["/blog/[slug]", "a%2Fb", CHARS],
	["/blog/[slug]", "what%3F", CHARS],
	["/blog/[slug]", "caf%C3%A9", CHARS],
	["/blog/[slug]", "café", CHARS],
	["/blog/[slug]", "a b", CHARS],
	["/blog/[slug]", "foo ", CHARS], // the URL parser strips a trailing space
	["/blog/[slug]", "a\tb", CHARS], // the URL parser drops tab/LF/CR
	["/blog/[slug]", "a\nb", CHARS],
	["/blog/[slug]", "a\x7fb", CHARS],
	["/blog/[slug]", "a?b", CHARS],
	["/blog/[slug]", "a#b", CHARS],
	["/blog/[slug]", "a\\b", CHARS],
	["/blog/[slug]", "a/b", CHARS], // `/` only in a catch-all
	["/blog/[slug]", "[draft]", CHARS],
	["/blog/[slug]", "a$&b", CHARS],
	["/docs/[...p]", "a/50%", CHARS],
	// Empty parts and `.`/`..`: the page would land on the parent route's file.
	["/blog/[slug]", "", CHARS],
	["/blog/[slug]", ".", CHARS],
	["/blog/[slug]", "..", CHARS],
	["/docs/[...p]", "a//b", CHARS],
	["/docs/[...p]", "/", CHARS],
	["/docs/[...p]", "a/../b", CHARS],
	// Windows drops trailing dots (`v1.` → `v1`, `...` → ``).
	["/blog/[slug]", "...", CHARS],
	["/blog/[slug]", "v1.", CHARS],
	["/docs/[...p]", "a.../b", CHARS],
	// Static hosts hide dotfiles.
	["/blog/[slug]", ".env", CHARS],
	["/docs/[...p]", "a/.git/b", CHARS],
	// Windows device names.
	["/blog/[slug]", "con", /device names/],
	["/blog/[slug]", "NUL", /device names/],
	["/blog/[slug]", "aux.txt", /device names/],
	["/docs/[...p]", "com1/a", /device names/],
	["/blog/[slug]", "lpt9", /device names/],
	// The URL's last part names the file.
	["/[slug]", "index", /can't be `index`/], // `index.html` would serve `/`
	["/blog/[slug]", "Index", /can't be `index`/],
	["/docs/[...p]", "a/index", /can't be `index`/],
	["/blog/[slug]", "post.html", /\.html or \.json/], // `post.html.html`, never served
	["/blog/[slug]", "a.JSON", /\.html or \.json/],
];

describe("substituteParams() rejects", () => {
	for (const [pattern, value, error] of REJECT)
		test(`${pattern} ← ${JSON.stringify(value)}`, () => {
			const name = pattern.match(/\[(?:\.\.\.)?(\w+)\]/)![1]!;
			expect(() => substituteParams(pattern, { [name]: value })).toThrow(error);
		});

	test("a missing value fails", () => {
		expect(() => substituteParams("/blog/[slug]/[id]", { id: "5" })).toThrow("no value for [slug]");
		expect(() => substituteParams("/blog/[slug]", { slug: undefined as any })).toThrow("no value");
		expect(() => substituteParams("/blog/[slug]", { slug: null as any })).toThrow("no value");
	});

	test("the error quotes the value: a newline can't split it, a BigInt can't crash it", () => {
		expect(() => substituteParams("/blog/[slug]", { slug: "a\nb" })).toThrow('"a\\nb"');
		expect(() => substituteParams("/blog/[slug]", { slug: { id: 1n } as any })).toThrow(
			'"[object Object]"',
		);
	});
});

// ─── findPrerenderClash(): two targets, one file ──────────

const page = (
	path: string,
	trailingSlash: PrerenderTarget["trailingSlash"] = "never",
	route = path,
): PrerenderTarget => ({ path, route, kind: "page", trailingSlash });
const api = (path: string): PrerenderTarget => ({
	path,
	route: path,
	kind: "api",
	trailingSlash: "never",
});

const CLASH: [why: string, targets: PrerenderTarget[], error: string][] = [
	// macOS and Windows ignore case.
	[
		"files differ only by case",
		[page("/c/About"), page("/c/about")],
		"/c/About and /c/about write the same file",
	],
	[
		"folders differ only by case",
		[page("/d/A/x"), page("/d/a/y")],
		"/d/A/x and /d/a/y write the same path",
	],
	// The data payload counts: `/` and `/index` both write `__bosia/data/index.json`.
	[
		"two pages, one data file",
		[page("/", "always"), page("/index", "always")],
		"__bosia/data/index.json",
	],
	// A file and a folder can't share a path: `a.json` vs `a.json/edit.json`.
	["file vs folder", [page("/a"), page("/a.json/edit")], "/a and /a.json/edit write the same path"],
	[
		"file vs folder (catch-all)",
		[page("/docs/a"), page("/docs/a.html/b")],
		"/docs/a and /docs/a.html/b",
	],
	// Same URL from two routes with different slash modes: both write its data file.
	[
		"one URL, two slash modes",
		[page("/about", "always"), page("/about", "never")],
		"/about and /about write the same file",
	],
	// Same URL from two routes in the same slash mode (the default `never`).
	[
		"one URL, one slash mode",
		[page("/about"), page("/about")],
		"/about and /about write the same file",
	],
	["an API and a page data file", [page("/x"), api("/__bosia/data/x")], "/x and /__bosia/data/x"],
];

const NO_CLASH: [why: string, targets: PrerenderTarget[]][] = [
	["siblings", [page("/a"), page("/b"), page("/a/b")]],
	["same folder, exact case", [page("/docs/A/x"), page("/docs/A/y")]],
	// A static src/routes/404 page may replace the saved 404.html on purpose (round 6).
	["a static /404 page", [page("/404")]],
	["root and a page", [page("/", "always"), page("/about", "always")]],
	["pages and APIs", [page("/blog"), api("/api/blog")]],
];

describe("findPrerenderClash()", () => {
	for (const [why, targets, error] of CLASH)
		test(`fails: ${why}`, () => {
			const clashes = findPrerenderClash(targets);
			// One ❌ per clashing route, even when its HTML and data file both clash.
			expect(clashes).toHaveLength(1);
			expect(clashes[0]).toContain(error);
		});

	// Round 7: a target that clashes still records its other files, so the next clash shows too.
	test("fails twice: B clashes on its HTML, C only on B's data file", () => {
		const clashes = findPrerenderClash([
			page("/p", "always"), // p/index.html
			page("/p/index"), // p/index.html again; its data is __bosia/data/p/index.json
			api("/__bosia/data/p/index"), // only B's data file
		]);
		expect(clashes).toHaveLength(2);
		expect(clashes[1]).toContain("/p/index and /__bosia/data/p/index write the same file");
	});

	// Round 7: the message names the route a slug came from, not only its URL.
	test("names the route a slug came from", () => {
		const [clash] = findPrerenderClash([page("/about"), page("/about", "never", "/[slug]")]);
		expect(clash).toContain("/about and /about (from /[slug]) write the same file");
	});

	for (const [why, targets] of NO_CLASH)
		test(`passes: ${why}`, () => {
			expect(findPrerenderClash(targets)).toEqual([]);
		});
});

// ─── detectPrerenderRoutes(): end to end over real route files ─

describe("detectPrerenderRoutes()", () => {
	const cwdBefore = process.cwd();
	let dir = "";
	const route = (pattern: string, file: string, server: string, trailingSlash = "never") => {
		mkdirSync(dirname(join(dir, "src/routes", file)), { recursive: true });
		writeFileSync(join(dir, "src/routes", file), server);
		return { pattern, pageServer: file, trailingSlash };
	};
	const entries = (...values: string[]) =>
		`export const prerender = true;\nexport const entries = () => ${JSON.stringify(values.map((slug) => ({ slug })))};\n`;
	// A live (not prerendered) +server.ts, written so flagged() can read it.
	const liveApi = (pattern: string, file: string) => {
		route(pattern, file, "export const GET = () => new Response();\n");
		return { pattern, server: file };
	};
	// The build's analyse step sets `prerender`; here the route file's text stands in.
	const flagged = (r: any) => {
		const file = r.pageServer ?? r.server;
		const src = file ? readFileSync(join(dir, "src/routes", file), "utf-8") : "";
		return { ...r, prerender: src.includes("export const prerender = true") };
	};
	const detect = (pages: unknown[], apis: unknown[] = []) =>
		detectPrerenderRoutes({
			pages: pages.map(flagged),
			apis: apis.map(flagged),
			errorPage: null,
		} as any).catch((e) => e);

	beforeEach(() => {
		dir = mkdtempSync(join(tmpdir(), "bosia-detect-"));
		process.chdir(dir);
	});
	afterEach(() => {
		process.chdir(cwdBefore);
		rmSync(dir, { recursive: true, force: true });
	});

	test("lists every broken route at once, one ❌ each, causes kept", async () => {
		const err = await detect([
			route("/a/[slug]", "a/[slug]/+page.server.ts", "export const prerender = true;\n"),
			route("/b/[slug]", "b/[slug]/+page.server.ts", entries("50%-off")),
		]);
		expect(err).toBeInstanceOf(PrerenderEntriesError);
		const lines = err.message.split("\n").filter((l: string) => l.startsWith("❌"));
		expect(lines).toHaveLength(2);
		expect(lines[0]).toContain(
			"/a/[slug]: prerender = true on a dynamic route needs an entries() export",
		);
		expect(lines[1]).toContain('/b/[slug]: entries() value "50%-off"');
		expect(err.cause).toHaveLength(2);
	});

	test("a multi-line error stays under one ❌", async () => {
		const server = `export const prerender = true;\nexport const entries = () => { throw new Error("one\\ntwo"); };\n`;
		const err = await detect([route("/z/[slug]", "z/[slug]/+page.server.ts", server)]);
		expect(err.message).toBe("❌ Prerender failed for /z/[slug]: one\ntwo");
	});

	test("a repeated value (a tag on two posts) is written once", async () => {
		const targets = await detect([
			route("/t/[slug]", "t/[slug]/+page.server.ts", entries("js", "js")),
		]);
		expect(targets).toEqual([
			{ path: "/t/js", route: "/t/[slug]", kind: "page", trailingSlash: "never" },
		]);
	});

	// 1.2.5: these still fail, now as "served by" (the route owner check runs before the clash
	// check, and a mis-owned target prints one ❌, not two).
	test("one URL from a static and a dynamic route is a clash, not a silent drop", async () => {
		const err = await detect([
			route("/about", "about/+page.server.ts", "export const prerender = true;\n", "always"),
			route("/[slug]", "[slug]/+page.server.ts", entries("about")),
		]);
		expect(err).toBeInstanceOf(PrerenderEntriesError);
		expect(err.message).toBe(
			"❌ Prerender: /about (from /[slug]) is served by /about, not this route",
		);
	});

	test("one URL from a static and a dynamic route in the same slash mode is a clash", async () => {
		const err = await detect([
			route("/about", "about/+page.server.ts", "export const prerender = true;\n"),
			route("/[slug]", "[slug]/+page.server.ts", entries("about")),
		]);
		expect(err).toBeInstanceOf(PrerenderEntriesError);
		expect(err.message).toContain("/about (from /[slug]) is served by /about, not this route");
	});

	test("one value from [slug] and [...rest] is a clash", async () => {
		const err = await detect([
			route("/d/[slug]", "d/[slug]/+page.server.ts", entries("x")),
			route("/d/[...slug]", "d/[...slug]/+page.server.ts", entries("x")),
		]);
		expect(err.message).toContain(
			"/d/x (from /d/[...slug]) is served by /d/[slug], not this route",
		);
	});

	// ─── Route owner (1.2.5): a slug must not freeze another route ───

	test("fails: a slug that a static page serves (blog/[slug] ← new)", async () => {
		const err = await detect([
			route("/blog/[slug]", "blog/[slug]/+page.server.ts", entries("new", "hello")),
			{ pattern: "/blog/new", trailingSlash: "never" }, // live, not prerendered
		]);
		expect(err).toBeInstanceOf(PrerenderEntriesError);
		expect(err.message).toBe(
			"❌ Prerender: /blog/new (from /blog/[slug]) is served by /blog/new, not this route",
		);
	});

	test("fails: a page slug where a +server.ts answers", async () => {
		const err = await detect(
			[route("/[slug]", "[slug]/+page.server.ts", entries("feed", "about"))],
			[liveApi("/feed", "feed/+server.ts")],
		);
		expect(err.message).toBe(
			"❌ Prerender: /feed (from /[slug]) is served by /feed (+server.ts), not this route",
		);
	});

	test("fails: a page whose own folder has a +server.ts (the API wins)", async () => {
		const err = await detect(
			[route("/x", "x/+page.server.ts", "export const prerender = true;\n")],
			[liveApi("/x", "x/+server.ts")],
		);
		expect(err.message).toContain("/x is served by /x (+server.ts), not this route");
	});

	test("fails: an API slug that a static API serves", async () => {
		route("/api/[slug]", "api/[slug]/+server.ts", entries("all"));
		const err = await detect(
			[],
			[
				{ pattern: "/api/[slug]", server: "api/[slug]/+server.ts" },
				liveApi("/api/all", "api/all/+server.ts"),
			],
		);
		expect(err.message).toContain(
			"/api/all (from /api/[slug]) is served by /api/all, not this route",
		);
	});

	test("fails: a slug that differs from a static page only by case (New vs blog/new)", async () => {
		const err = await detect([
			route("/blog/[slug]", "blog/[slug]/+page.server.ts", entries("New", "hello")),
			{ pattern: "/blog/new", trailingSlash: "never" }, // live, not prerendered
		]);
		expect(err.message).toBe(
			"❌ Prerender: /blog/New (from /blog/[slug]) would also answer /blog/new on hosts that ignore case (macOS/Windows), which /blog/new serves",
		);
	});

	test("fails: a lowercase slug at an uppercase static page or API", async () => {
		const page = await detect([
			route("/[slug]", "[slug]/+page.server.ts", entries("about", "x")),
			{ pattern: "/About", trailingSlash: "never" },
		]);
		expect(page.message).toContain(
			"/about (from /[slug]) would also answer /About on hosts that ignore case (macOS/Windows), which /About serves",
		);
		route("/api/[slug]", "api/[slug]/+server.ts", entries("all"));
		const api = await detect(
			[],
			[
				{ pattern: "/api/[slug]", server: "api/[slug]/+server.ts" },
				liveApi("/api/ALL", "api/ALL/+server.ts"),
			],
		);
		expect(api.message).toContain(
			"/api/all (from /api/[slug]) would also answer /api/ALL on hosts that ignore case (macOS/Windows), which /api/ALL serves",
		);
	});

	// Review: only the first route in a lowercased table was asked, so a tie hid the clash.
	test("fails: a case clash whatever the param name or route order", async () => {
		for (const live of ["/Blog/[a]", "/Blog/[z]"]) {
			const err = await detect([
				route("/blog/[slug]", "blog/[slug]/+page.server.ts", entries("x")),
				{ pattern: live, trailingSlash: "never" },
			]);
			expect(err.message).toContain(
				`/blog/x (from /blog/[slug]) would also answer /Blog/x on hosts that ignore case (macOS/Windows), which ${live} serves`,
			);
		}
		const about = () =>
			route("/about", "about/+page.server.ts", "export const prerender = true;\n");
		const live = { pattern: "/About", trailingSlash: "never" };
		for (const pages of [
			[about(), live],
			[live, about()],
		]) {
			const err = await detect(pages);
			expect(err.message).toContain(
				"/about would also answer /About on hosts that ignore case (macOS/Windows), which /About serves",
			);
		}
	});

	// Review 2: the case pass took param parts in the target's case, so `/[a]/NEW` (live at
	// `/BLOG/NEW`) was missed, and `/[x]/NEW` made a static page fail naming `/blog/[slug]`.
	test("fails: a route spelling a part in another case, behind a param", async () => {
		const slug = await detect([
			route("/blog/[slug]", "blog/[slug]/+page.server.ts", entries("new")),
			{ pattern: "/[a]/NEW", trailingSlash: "never" },
		]);
		expect(slug.message).toContain(
			"/blog/new (from /blog/[slug]) would also answer /BLOG/NEW on hosts that ignore case (macOS/Windows), which /[a]/NEW serves",
		);
		const stat = await detect([
			route("/blog/new", "blog/new/+page.server.ts", "export const prerender = true;\n"),
			{ pattern: "/blog/[slug]", trailingSlash: "never" },
			{ pattern: "/[x]/NEW", trailingSlash: "never" },
		]);
		expect(stat.message).toContain(
			"/blog/new would also answer /BLOG/NEW on hosts that ignore case (macOS/Windows), which /[x]/NEW serves",
		);
	});

	// Review 3: a target its own route doesn't answer (a hand-built table) has no owner to
	// measure by; it used to name any route with a case part.
	test("no case owner when the target's own route doesn't answer it", () => {
		const t = { path: "/x/new", route: "/y/[slug]", kind: "page", trailingSlash: "never" } as const;
		const manifest = { pages: [{ pattern: "/y/[slug]" }, { pattern: "/[a]/NEW" }], apis: [] };
		expect(findMisownedTargets(manifest as any, [t]).size).toBe(0);
	});

	// Review 5: `ß` uppercases to `SS`, so it counted as having another case: a false failure,
	// and a spelling (`/STRASSE`) no disk treats as the same name.
	test("ß has no other case; a spelling keeps each name's length", () => {
		const page = (path: string, route: string) =>
			({ path, route, kind: "page", trailingSlash: "never" }) as const;
		const ok = page("/\u00df/foo", "/\u00df/[x]");
		const okManifest = { pages: [{ pattern: "/\u00df/[x]" }, { pattern: "/[a]/FOO" }], apis: [] };
		expect(findMisownedTargets(okManifest as any, [ok]).size).toBe(0);
		const bad = page("/stra\u00dfe/new", "/stra\u00dfe/[x]");
		const manifest = {
			pages: [{ pattern: "/stra\u00dfe/[x]" }, { pattern: "/[a]/NEW" }],
			apis: [],
		};
		expect(findMisownedTargets(manifest as any, [bad]).get(bad)).toContain(
			"would also answer /STRA\u00dfE/NEW",
		);
	});

	// Review 5: an API target only met APIs, so a live page `/API/ALL` that the saved
	// `api/all` file hides on a case-insensitive host passed.
	test("fails: an API slug next to a page differing only by case", async () => {
		route("/api/[x]", "api/[x]/+server.ts", entries("all").replace('"slug"', '"x"'));
		const err = await detect(
			[{ pattern: "/API/ALL", trailingSlash: "never" }],
			[{ pattern: "/api/[x]", server: "api/[x]/+server.ts" }],
		);
		expect(err.message).toContain("/api/all (from /api/[x]) would also answer /API/ALL");
		expect(err.message).toContain("which /API/ALL serves");
	});

	// Review 3 added Unicode-form (NFC/NFD) folding; review 4 took it out: NTFS doesn't merge
	// forms, and the error showed two identical-looking spellings. Only case is compared.
	test("builds: static names that differ only by Unicode form aren't compared", () => {
		const t = {
			path: "/caf\u00e9",
			route: "/caf\u00e9",
			kind: "page",
			trailingSlash: "never",
		} as const;
		const manifest = { pages: [{ pattern: "/caf\u00e9" }, { pattern: "/cafe\u0301" }], apis: [] };
		expect(findMisownedTargets(manifest as any, [t]).size).toBe(0);
	});

	// Params alone catch every spelling (`/[...rest]` answers `/BLOG/new`); counting that
	// would fail any catch-all next to a prerendered page, so only a static part spelled in
	// another case counts. Allowed on purpose, not a gap.
	test("builds: a broader route matching ignoring case doesn't own the URL", async () => {
		const targets = await detect([
			route("/blog/new", "blog/new/+page.server.ts", "export const prerender = true;\n"),
			{ pattern: "/[a]/[b]", trailingSlash: "never" },
			{ pattern: "/[...rest]", trailingSlash: "never" },
			{ pattern: "/[a]/new", trailingSlash: "never" },
			{ pattern: "/blog/[slug]", trailingSlash: "never" },
		]);
		expect(targets).toEqual([
			{ path: "/blog/new", route: "/blog/new", kind: "page", trailingSlash: "never" },
		]);
	});

	test("builds: a static page whose own name has capitals", async () => {
		const targets = await detect([
			route("/About", "About/+page.server.ts", "export const prerender = true;\n"),
		]);
		expect(targets).toEqual([
			{ path: "/About", route: "/About", kind: "page", trailingSlash: "never" },
		]);
	});

	test("builds: a slug no other route serves, and the manifest is left alone", async () => {
		const pages = [
			route("/blog/[slug]", "blog/[slug]/+page.server.ts", entries("hello")),
			{ pattern: "/blog/new", trailingSlash: "never" },
			{ pattern: "/blog/[slug]/edit", trailingSlash: "never" },
		];
		const apis = [liveApi("/api/blog", "api/blog/+server.ts")];
		const targets = await detect(pages, apis);
		expect(targets).toEqual([
			{ path: "/blog/hello", route: "/blog/[slug]", kind: "page", trailingSlash: "never" },
		]);
		expect(pages.some((r) => "_compiled" in r)).toBe(false);
	});

	test("a slug named 404 can't overwrite 404.html, but a /404/ folder is fine", async () => {
		const err = await detect([route("/[slug]", "[slug]/+page.server.ts", entries("404"))]);
		expect(err.message).toContain("/[slug]: an entries() value would overwrite 404.html");
		const ok = await detect([route("/[slug]", "[slug]/+page.server.ts", entries("404"), "always")]);
		expect(ok).toEqual([{ path: "/404", route: "/[slug]", kind: "page", trailingSlash: "always" }]);
	});

	test("a static /404 page may replace 404.html", async () => {
		const targets = await detect([
			route("/404", "404/+page.server.ts", "export const prerender = true;\n"),
		]);
		expect(targets).toEqual([
			{ path: "/404", route: "/404", kind: "page", trailingSlash: "never" },
		]);
	});

	// URLs the server answers itself (round 8, fixed in round 9): the saved file would hold its
	// reply, not the route. Checked on the URL prerender fetches, with server.ts's exact rules.
	const SERVER_URL: [
		pattern: string,
		value: string,
		ts: string,
		kind: "page" | "api",
		ok: boolean,
	][] = [
		["/[slug]", "_health", "never", "page", false],
		["/[...p]", "dist/x", "never", "page", false],
		["/[...p]", "__bosia/data/x", "never", "page", false],
		["/[slug]/x", "__bosia", "never", "page", false],
		["/[slug]", "dist", "always", "page", false], // fetched as /dist/
		["/[slug]", "__bosia", "always", "page", false], // fetched as /__bosia/
		["/blog/[slug]", "logo.png", "never", "page", false], // a static-file ending
		["/[slug]", "robots.txt", "never", "page", false], // would save public/robots.txt
		// Round 11: `/logo.png` 404s before the server can 308 it to `/logo.png/`.
		["/blog/[slug]", "logo.png", "always", "page", false],
		["/[slug]", "robots.txt", "ignore", "page", false],
		["/[slug]", "_health", "never", "api", false],
		["/[...slug]", "dist/x", "never", "api", false],
		// Look-alikes the server renders as pages.
		["/[slug]", "_healthy", "never", "page", true],
		// Round 12 flipped these two (option A): `/dist/` 404s instead of 308ing to `/dist`, and on
		// macOS/Windows a `DIST/` folder swallows the `dist/client` bundle copied after it.
		["/[slug]", "dist", "never", "page", false],
		["/docs/[...p]", "dist/x", "never", "page", true], // not at the root
		["/[slug]", "_Health", "never", "page", true], // the server's checks are case-sensitive
		["/[...p]", "DIST/x", "never", "page", false],
		["/[slug]", "Dist", "always", "page", false], // writes Dist/index.html
		["/[slug]/x", "__Bosia", "never", "page", false], // its own data lives in __bosia/
		["/[...slug]", "DIST/x", "never", "api", false],
		["/[slug]", "dist", "never", "api", true], // dist.json, not a folder
		["/blog/[slug]", "logo.PNG", "never", "page", true], // the server's endings are lowercase
		["/api/[slug]", "a.png", "never", "api", true], // an API wins over static files
	];
	for (const [pattern, value, ts, kind, ok] of SERVER_URL)
		test(`${ok ? "builds" : "fails"}: ${kind} ${pattern} ← ${JSON.stringify(value)} (${ts})`, async () => {
			const name = pattern.match(/\[(?:\.\.\.)?(\w+)\]/)![1]!;
			const server = `export const prerender = true;\nexport const entries = () => [${JSON.stringify({ [name]: value })}];\n`;
			const dir = pattern.slice(1);
			const res =
				kind === "page"
					? await detect([route(pattern, `${dir}/+page.server.ts`, server, ts)])
					: await detect(
							[],
							[
								{
									pattern,
									server: (route(pattern, `${dir}/+server.ts`, server), `${dir}/+server.ts`),
								},
							],
						);
			if (ok) expect(res).toBeArray();
			else expect(res.message).toMatch(/a URL the server answers itself|the framework's folders/);
		});

	test("case-only twins fail end to end", async () => {
		const err = await detect([
			route("/c/[slug]", "c/[slug]/+page.server.ts", entries("About", "about")),
		]);
		expect(err.message).toContain(
			"/c/About (from /c/[slug]) and /c/about (from /c/[slug]) write the same file",
		);
	});
});

// ─── The build must not load html.ts (round 10) ──────────

// html.ts pins the base path (currentBase) and reads dist/manifest.json when loaded. The build
// loads its imports before loadEnv(), so a BASE_PATH from .env would be missed and prerender fails.
test("build.ts's imports don't load html.ts", () => {
	const core = join(import.meta.dir, "../src/core");
	const src = require("fs").readFileSync(join(core, "build.ts"), "utf8") as string;
	const mods = [...src.matchAll(/from "(\.\/[^"]+\.ts)"/g)].map((m) => join(core, m[1]!));
	const probe = `for (const m of ${JSON.stringify(mods)}) await import(m);
console.log(Object.keys(require.cache).filter((k) => /[\\\\/]core[\\\\/]html\\.ts$/.test(k)).length);`;
	const out = Bun.spawnSync(["bun", "-e", probe], { cwd: tmpdir() });
	expect(out.stderr.toString()).toBe("");
	expect(out.stdout.toString().trim()).toBe("0");
});
