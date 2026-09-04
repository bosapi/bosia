import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { mkdirSync, writeFileSync, rmSync } from "fs";
import { join } from "path";

import { getEphemeralPort } from "../src/core/prerender.ts";
import { BOSIA_NODE_PATH } from "../src/core/paths.ts";

// `page.url` was invented during SSR: page.svelte.ts returned a hardcoded
// http://localhost/ with no window, and router.currentRoute initialised to "/".
// So every server-rendered page reported pathname "/" and any nav comparison
// written against page.url.pathname — which bosia-page-shell and bosia-sidebar
// both instruct — matched the home route until hydration corrected it.
//
// This has to run against a built server. The localhost fallback never fires in
// a browser, so a client-side test agrees with both the broken and the fixed
// code. Fixture lives under packages/bosia/ so svelte and the Tailwind binary
// resolve from this package's node_modules — same reason as basePath-server.test.ts.

let tmpDir: string;
let child: Bun.Subprocess | null = null;
let origin: string;

/** Every assertion below reads an attribute, never text: Svelte's SSR output
 *  splits `{expr}` in a text node with comment markers, attributes it doesn't. */
const attr = (html: string, name: string): string | null =>
	html.match(new RegExp(`${name}="([^"]*)"`))?.[1] ?? null;

beforeAll(async () => {
	tmpDir = join(import.meta.dir, "..", `.tmp-ssr-page-url-${Date.now()}`);
	const routes = join(tmpDir, "src", "routes");
	mkdirSync(routes, { recursive: true });

	writeFileSync(join(tmpDir, "tsconfig.json"), JSON.stringify({ compilerOptions: { paths: {} } }));
	writeFileSync(join(tmpDir, "src", "app.css"), `@import "tailwindcss";\n@source "../src";\n`);
	writeFileSync(
		join(tmpDir, "src", "app.html"),
		`<!doctype html>\n<html lang="%bosia.lang%">\n<head>%bosia.head%</head>\n<body>%bosia.body%</body>\n</html>\n`,
	);

	// The layout is where the symptom actually bites: active-nav state derived
	// from page.url.pathname, exactly as the page-shell/sidebar skills teach.
	writeFileSync(
		join(routes, "+layout.svelte"),
		`<script>\n` +
			`\timport { page } from "bosia/client";\n` +
			`\tlet { children } = $props();\n` +
			`</script>\n\n` +
			`<nav data-home-active={page.url.pathname === "/"}\n` +
			`     data-audit-active={page.url.pathname === "/admin/audit"}></nav>\n` +
			`{@render children()}\n`,
	);

	writeFileSync(join(routes, "+page.svelte"), `<h1>Beranda</h1>\n`);

	// The global root error page. A 404 has no matched route, so renderErrorPage
	// falls past the nested-boundary branch and renders this component directly —
	// the fourth render call site, and the one an inline fix is most likely to miss.
	writeFileSync(
		join(routes, "+error.svelte"),
		`<script>\n` +
			`\timport { page } from "bosia/client";\n` +
			`\tlet { error } = $props();\n` +
			`</script>\n\n` +
			`<p data-path={page.url.pathname} data-status={error.status}>Aduh</p>\n`,
	);

	const urlProbe =
		`<script>\n` +
		`\timport { page } from "bosia/client";\n` +
		`</script>\n\n` +
		`<p data-href={page.url.href}\n` +
		`   data-path={page.url.pathname}\n` +
		`   data-search={page.url.search}\n` +
		`   data-origin={page.url.origin}>probe</p>\n`;

	mkdirSync(join(routes, "admin", "audit"), { recursive: true });
	writeFileSync(join(routes, "admin", "audit", "+page.svelte"), urlProbe);

	// Deprecated page.params read the appState cell that App.svelte never wrote
	// during SSR, so it was {} on every server-rendered page too.
	mkdirSync(join(routes, "blog", "[slug]"), { recursive: true });
	writeFileSync(
		join(routes, "blog", "[slug]", "+page.svelte"),
		`<script>\n` +
			`\timport { page } from "bosia/client";\n` +
			`</script>\n\n` +
			`<p data-path={page.url.pathname} data-slug={page.params.slug}>probe</p>\n`,
	);

	// A nested +error.svelte, so the error render goes through the boundary
	// branch of renderErrorPage rather than the global root fallback.
	mkdirSync(join(routes, "boom"), { recursive: true });
	writeFileSync(join(routes, "boom", "+page.svelte"), `<h1>Boom</h1>\n`);
	writeFileSync(
		join(routes, "boom", "+page.server.ts"),
		`export function load() {\n\tthrow new Error("meledak");\n}\n`,
	);
	writeFileSync(
		join(routes, "boom", "+error.svelte"),
		`<script>\n` +
			`\timport { page } from "bosia/client";\n` +
			`\tlet { error } = $props();\n` +
			`</script>\n\n` +
			`<p data-path={page.url.pathname} data-status={error.status}>gagal</p>\n`,
	);

	const build = Bun.spawn(["bun", "run", join(import.meta.dir, "..", "src", "core", "build.ts")], {
		cwd: tmpDir,
		env: { ...process.env, NODE_ENV: "production", NODE_PATH: BOSIA_NODE_PATH },
		stdout: "pipe",
		stderr: "pipe",
	});
	const [code, out, err] = await Promise.all([
		build.exited,
		new Response(build.stdout).text(),
		new Response(build.stderr).text(),
	]);
	if (code !== 0) throw new Error(`build failed (${code})\n${out}\n${err}`);

	const port = await getEphemeralPort();
	origin = `http://localhost:${port}`;
	child = Bun.spawn(["bun", "run", join(tmpDir, "dist", "server", "index.js")], {
		cwd: tmpDir,
		env: {
			...process.env,
			NODE_ENV: "production",
			PORT: String(port),
			NODE_PATH: BOSIA_NODE_PATH,
		},
		stdout: "ignore",
		stderr: "ignore",
	});

	const deadline = Date.now() + 15_000;
	while (Date.now() < deadline) {
		try {
			if ((await fetch(`${origin}/_health`)).ok) return;
		} catch {
			/* not up yet */
		}
		await Bun.sleep(50);
	}
	throw new Error("server never became ready");
}, 180_000);

afterAll(() => {
	child?.kill();
	rmSync(tmpDir, { recursive: true, force: true });
});

describe("page.url during SSR", () => {
	test("carries the real pathname, not /", async () => {
		const res = await fetch(`${origin}/admin/audit`);
		expect(res.status).toBe(200);
		const html = await res.text();
		// Assert the pathname, not just that "localhost" is gone — a host-only
		// assertion passes with the router's "/" default fully intact.
		expect(attr(html, "data-path")).toBe("/admin/audit");
	});

	test("carries the full request URL including the query string", async () => {
		const html = await (await fetch(`${origin}/admin/audit?tab=roles`)).text();
		expect(attr(html, "data-href")).toBe(`${origin}/admin/audit?tab=roles`);
		expect(attr(html, "data-search")).toBe("?tab=roles");
		expect(attr(html, "data-origin")).toBe(origin);
	});

	test("active-nav state resolves server-side — the reported symptom", async () => {
		const html = await (await fetch(`${origin}/admin/audit`)).text();
		expect(attr(html, "data-audit-active")).toBe("true");
		// The bug's signature: home highlighted on every server-rendered page.
		expect(html).not.toContain(`data-home-active="true"`);
	});

	test("the home route still reports /", async () => {
		const html = await (await fetch(`${origin}/`)).text();
		expect(attr(html, "data-home-active")).toBe("true");
	});
});

describe("page.params during SSR", () => {
	test("is populated instead of {}", async () => {
		const html = await (await fetch(`${origin}/blog/halo-dunia`)).text();
		expect(attr(html, "data-path")).toBe("/blog/halo-dunia");
		expect(attr(html, "data-slug")).toBe("halo-dunia");
	});
});

describe("the singletons are not shared across requests", () => {
	// router/appState are module singletons on the server. A stale-seed bug is
	// invisible on request one and only shows on the request after it.
	test("sequential requests each report their own URL", async () => {
		const first = await (await fetch(`${origin}/admin/audit`)).text();
		expect(attr(first, "data-path")).toBe("/admin/audit");

		const second = await (await fetch(`${origin}/blog/kedua`)).text();
		expect(attr(second, "data-path")).toBe("/blog/kedua");
		expect(attr(second, "data-slug")).toBe("kedua");

		const third = await (await fetch(`${origin}/admin/audit`)).text();
		expect(attr(third, "data-path")).toBe("/admin/audit");
	});

	test("concurrent requests do not render each other's URLs", async () => {
		const paths = ["/admin/audit", "/blog/satu", "/blog/dua", "/blog/tiga", "/admin/audit"];
		const bodies = await Promise.all(
			paths.map((p) => fetch(`${origin}${p}`).then((r) => r.text())),
		);
		bodies.forEach((html, i) => expect(attr(html, "data-path")).toBe(paths[i]));
	});
});

describe("error renders seed the URL too", () => {
	// Seeding only the success paths would leave these holding whatever the
	// previous request set — worse than a deterministic default.
	test("a nested +error.svelte reports the failing route's URL", async () => {
		await fetch(`${origin}/admin/audit`); // prime the singletons with another URL
		const res = await fetch(`${origin}/boom`);
		expect(res.status).toBe(500);
		const html = await res.text();
		expect(attr(html, "data-status")).toBe("500");
		expect(attr(html, "data-path")).toBe("/boom");
	});

	test("the global root error page reports the missing URL, not the previous request's", async () => {
		await fetch(`${origin}/admin/audit`); // prime the singletons with another URL
		const res = await fetch(`${origin}/tidak-ada`);
		expect(res.status).toBe(404);
		const html = await res.text();
		expect(attr(html, "data-status")).toBe("404");
		expect(attr(html, "data-path")).toBe("/tidak-ada");
	});
});
