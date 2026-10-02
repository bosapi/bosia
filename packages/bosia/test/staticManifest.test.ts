import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import {
	buildPrerenderManifest,
	buildStaticManifest,
	lookupStatic,
	serveStatic,
} from "../src/core/staticManifest.ts";

let workdir: string;
let outDir: string;
let cwdBefore: string;

function touch(path: string, body = "") {
	mkdirSync(join(path, ".."), { recursive: true });
	writeFileSync(path, body);
}

beforeEach(() => {
	// realpathSync resolves macOS's /var → /private/var symlink so absPath
	// comparisons match what readdir produces.
	workdir = realpathSync(mkdtempSync(join(tmpdir(), "bosia-static-")));
	outDir = join(workdir, "dist");
	mkdirSync(outDir, { recursive: true });
	cwdBefore = process.cwd();
	// `./public` is resolved relative to cwd inside the manifest builder.
	process.chdir(workdir);
});

afterEach(() => {
	process.chdir(cwdBefore);
	rmSync(workdir, { recursive: true, force: true });
});

describe("buildStaticManifest", () => {
	test("/dist/client/* hashed files get immutable cache, others get no-cache", () => {
		touch(join(outDir, "client", "hydrate-abcd1234.js"), "// hashed");
		touch(join(outDir, "client", "hydrate.js"), "// unhashed");
		touch(join(outDir, "client", "chunks", "nested-deadbeef.css"), "/* hashed */");
		touch(join(outDir, "client", "bosia-tw-abcdef1234.css"), "/* tailwind */");

		const m = buildStaticManifest(outDir);

		expect(m.get("/dist/client/hydrate-abcd1234.js")?.cacheControl).toBe(
			"public, max-age=31536000, immutable",
		);
		expect(m.get("/dist/client/hydrate.js")?.cacheControl).toBe("no-cache");
		expect(m.get("/dist/client/chunks/nested-deadbeef.css")?.cacheControl).toBe(
			"public, max-age=31536000, immutable",
		);
		expect(m.get("/dist/client/bosia-tw-abcdef1234.css")?.cacheControl).toBe(
			"public, max-age=31536000, immutable",
		);
	});

	test("hashed pattern is applied to basename, not directory names", () => {
		// Parent dir name looks hashed; child file is not — must be no-cache.
		touch(join(outDir, "client", "-abc12345", "plain.js"), "// plain");
		const m = buildStaticManifest(outDir);
		expect(m.get("/dist/client/-abc12345/plain.js")?.cacheControl).toBe("no-cache");
	});

	test("./public/* maps to /<name> with no cache header", () => {
		touch(join(workdir, "public", "favicon.ico"), "icon");
		touch(join(workdir, "public", "img", "logo.svg"), "<svg/>");

		const m = buildStaticManifest(outDir);

		expect(m.get("/favicon.ico")).toEqual({ absPath: join(workdir, "public", "favicon.ico") });
		expect(m.get("/img/logo.svg")?.cacheControl).toBeUndefined();
	});

	test("OUT_DIR root files appear; skipped dirs and files do not", () => {
		touch(join(outDir, "robots.txt"), "User-agent: *");
		touch(join(outDir, "manifest.json"), "{}");
		touch(join(outDir, "route-manifest.json"), "{}");
		touch(join(outDir, "prerendered", "index.html"), "<html/>");
		touch(join(outDir, "server", "render.js"), "// server");

		const m = buildStaticManifest(outDir);

		expect(m.has("/robots.txt")).toBe(true);
		expect(m.has("/manifest.json")).toBe(false);
		expect(m.has("/route-manifest.json")).toBe(false);
		expect(m.has("/index.html")).toBe(false);
		expect(m.has("/render.js")).toBe(false);
	});

	test("dist/static/* is walked so production images can drop ./public", () => {
		// Build copies public/ → dist/static/ as the SSG mirror. Containers ship
		// only dist/, so the manifest must also serve from dist/static/.
		touch(join(outDir, "static", "favicon.ico"), "icon");
		touch(join(outDir, "static", "img", "logo.svg"), "<svg/>");

		const m = buildStaticManifest(outDir);

		expect(m.get("/favicon.ico")?.absPath).toBe(join(outDir, "static", "favicon.ico"));
		expect(m.get("/img/logo.svg")?.absPath).toBe(join(outDir, "static", "img", "logo.svg"));
	});

	test("./public wins over dist/static when both exist (dev)", () => {
		// In dev both exist; the public/ source must stay canonical.
		touch(join(workdir, "public", "favicon.ico"), "from public");
		touch(join(outDir, "static", "favicon.ico"), "from dist mirror");

		const m = buildStaticManifest(outDir);

		expect(m.get("/favicon.ico")?.absPath).toBe(join(workdir, "public", "favicon.ico"));
	});

	test("/__bosia/* keys cannot be added even if a user creates the file in public/", () => {
		touch(join(workdir, "public", "__bosia", "evil.js"), "// evil");
		const m = buildStaticManifest(outDir);
		expect(m.has("/__bosia/evil.js")).toBe(false);
	});

	test("missing ./public does not throw", () => {
		// No public/ exists at all.
		expect(() => buildStaticManifest(outDir)).not.toThrow();
	});

	test("dist/client wins over OUT_DIR root overlay (first-wins)", () => {
		// Same URL key could theoretically be reachable two ways; manifest must
		// keep the first-seen entry (the dist/client walk runs first).
		touch(join(outDir, "client", "shared.js"), "// from client");
		// Build a directory at OUT_DIR root that resolves to the same URL key.
		touch(join(outDir, "dist", "client", "shared.js"), "// from root walk");
		const m = buildStaticManifest(outDir);
		const hit = m.get("/dist/client/shared.js");
		expect(hit?.absPath).toBe(join(outDir, "client", "shared.js"));
	});
});

describe("lookupStatic", () => {
	test("strips query string before lookup", () => {
		touch(join(workdir, "public", "favicon.ico"), "icon");
		const m = buildStaticManifest(outDir);
		const hit = lookupStatic(m, "/favicon.ico?v=2");
		expect(hit?.absPath).toBe(join(workdir, "public", "favicon.ico"));
	});

	test("path-traversal request strings return null", () => {
		touch(join(outDir, "client", "hydrate.js"), "// ok");
		const m = buildStaticManifest(outDir);
		expect(lookupStatic(m, "/dist/client/../etc/passwd")).toBeNull();
	});

	test("unknown key returns null", () => {
		const m = buildStaticManifest(outDir);
		expect(lookupStatic(m, "/nope.txt")).toBeNull();
	});

	test("percent-encoded path resolves to the raw filename", () => {
		touch(join(workdir, "public", "my file.png"), "img");
		const m = buildStaticManifest(outDir);
		const hit = lookupStatic(m, "/my%20file.png");
		expect(hit?.absPath).toBe(join(workdir, "public", "my file.png"));
	});

	test("malformed percent-encoding returns null instead of throwing", () => {
		const m = buildStaticManifest(outDir);
		expect(lookupStatic(m, "/bad%zz.png")).toBeNull();
	});
});

describe("buildPrerenderManifest", () => {
	test("maps index.html, nested index.html, and flat .html to URL paths", () => {
		touch(join(outDir, "prerendered", "index.html"), "root");
		touch(join(outDir, "prerendered", "about", "index.html"), "about-dir");
		touch(join(outDir, "prerendered", "contact.html"), "contact-flat");

		const m = buildPrerenderManifest(outDir);

		expect(m.get("/")?.absPath).toBe(join(outDir, "prerendered", "index.html"));
		expect(m.get("/about")?.absPath).toBe(join(outDir, "prerendered", "about", "index.html"));
		expect(m.get("/contact")?.absPath).toBe(join(outDir, "prerendered", "contact.html"));
	});

	test("on collision the index.html variant wins regardless of walk order", () => {
		touch(join(outDir, "prerendered", "about.html"), "flat");
		touch(join(outDir, "prerendered", "about", "index.html"), "dir");

		const m = buildPrerenderManifest(outDir);

		expect(m.get("/about")?.absPath).toBe(join(outDir, "prerendered", "about", "index.html"));
	});

	test("missing prerendered dir yields empty map; non-html files ignored", () => {
		expect(buildPrerenderManifest(outDir).size).toBe(0);
		touch(join(outDir, "prerendered", "notes.txt"), "txt");
		expect(buildPrerenderManifest(outDir).size).toBe(0);
	});
});

describe("precompressed siblings", () => {
	test("x.br / x.gz fold into x's entry and are not URLs of their own", () => {
		touch(join(outDir, "client", "chunk-abcd1234.js"), "js");
		touch(join(outDir, "client", "chunk-abcd1234.js.br"), "br");
		touch(join(outDir, "client", "chunk-abcd1234.js.gz"), "gz");

		const m = buildStaticManifest(outDir);
		const e = lookupStatic(m, "/dist/client/chunk-abcd1234.js")!;

		expect(e.br).toBe(join(outDir, "client", "chunk-abcd1234.js.br"));
		expect(e.gz).toBe(join(outDir, "client", "chunk-abcd1234.js.gz"));
		expect(lookupStatic(m, "/dist/client/chunk-abcd1234.js.br")).toBeNull();
		expect(lookupStatic(m, "/dist/client/chunk-abcd1234.js.gz")).toBeNull();
	});

	test("a .gz with no original stays a plain file", () => {
		touch(join(outDir, "client", "archive.tar.gz"), "tar");
		const m = buildStaticManifest(outDir);
		expect(lookupStatic(m, "/dist/client/archive.tar.gz")).not.toBeNull();
	});

	test("prerendered entries carry their siblings", () => {
		touch(join(outDir, "prerendered", "index.html"), "root");
		touch(join(outDir, "prerendered", "index.html.br"), "br");
		const e = buildPrerenderManifest(outDir).get("/")!;
		expect(e.br).toBe(join(outDir, "prerendered", "index.html.br"));
		expect(e.gz).toBeUndefined();
	});
});

describe("serveStatic", () => {
	const req = (accept?: string) =>
		new Request("http://x/", accept ? { headers: { "Accept-Encoding": accept } } : {});

	function entry() {
		touch(join(outDir, "client", "a-abcd1234.js"), "raw");
		touch(join(outDir, "client", "a-abcd1234.js.br"), "BR");
		touch(join(outDir, "client", "a-abcd1234.js.gz"), "GZ");
		return lookupStatic(buildStaticManifest(outDir), "/dist/client/a-abcd1234.js")!;
	}

	test("br preferred, with the original's content-type", async () => {
		const res = serveStatic(entry(), req("gzip, deflate, br"));
		expect(res.headers.get("content-encoding")).toBe("br");
		expect(res.headers.get("content-type")).toContain("javascript");
		expect(res.headers.get("vary")).toBe("Accept-Encoding");
		expect(res.headers.get("cache-control")).toContain("immutable");
		expect(await res.text()).toBe("BR");
	});

	test("gzip when br is not accepted", async () => {
		const res = serveStatic(entry(), req("gzip"));
		expect(res.headers.get("content-encoding")).toBe("gzip");
		expect(await res.text()).toBe("GZ");
	});

	test("raw with no Accept-Encoding, still Vary", async () => {
		const res = serveStatic(entry(), req());
		expect(res.headers.get("content-encoding")).toBeNull();
		expect(res.headers.get("vary")).toBe("Accept-Encoding");
		expect(await res.text()).toBe("raw");
	});

	test("br-accepting client falls back to gzip when only .gz exists", async () => {
		touch(join(outDir, "client", "b.css"), "raw");
		touch(join(outDir, "client", "b.css.gz"), "GZ");
		const e = lookupStatic(buildStaticManifest(outDir), "/dist/client/b.css")!;
		const res = serveStatic(e, req("br, gzip"));
		expect(res.headers.get("content-encoding")).toBe("gzip");
		expect(res.headers.get("content-type")).toContain("css");
	});

	test("no siblings: raw, no Vary; caller headers win for content-type", async () => {
		touch(join(outDir, "prerendered", "index.html"), "<p>");
		const e = buildPrerenderManifest(outDir).get("/")!;
		const res = serveStatic(e, req("br"), { "Content-Type": "text/html; charset=utf-8" });
		expect(res.headers.get("content-encoding")).toBeNull();
		expect(res.headers.get("vary")).toBeNull();
		expect(res.headers.get("content-type")).toBe("text/html; charset=utf-8");
	});
});
