import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { mkdirSync, writeFileSync, rmSync } from "fs";
import { join } from "path";

import { getEphemeralPort } from "../src/core/prerender.ts";
import { BOSIA_NODE_PATH } from "../src/core/paths.ts";

// Static files are answered before `handle` runs. A hook that looks up the
// session ran once per JS chunk, CSS file and image — a DB query per asset.
//
// The hook below stamps `x-hooked` on everything it sees, so a response
// without the header never went through it. Written against a built, running
// server: the change lives in handleRequest, between the hooks and resolve().

let tmpDir: string;
let child: Bun.Subprocess | null = null;
let origin: string;

beforeAll(async () => {
	tmpDir = join(import.meta.dir, "..", `.tmp-hooks-static-${Date.now()}`);
	const routes = join(tmpDir, "src", "routes");
	mkdirSync(routes, { recursive: true });

	writeFileSync(join(tmpDir, "tsconfig.json"), JSON.stringify({ compilerOptions: { paths: {} } }));
	writeFileSync(join(tmpDir, "src", "app.css"), `@import "tailwindcss";\n@source "../src";\n`);
	writeFileSync(
		join(tmpDir, "src", "app.html"),
		`<!doctype html>\n<html lang="%bosia.lang%">\n<head>%bosia.head%</head>\n<body>%bosia.body%</body>\n</html>\n`,
	);

	// A script block so the page ships a hydration chunk under /dist/client/.
	writeFileSync(
		join(routes, "+page.svelte"),
		`<script>let n = $state(0);</script>\n<button onclick={() => n++}>{n}</button>\n`,
	);

	mkdirSync(join(routes, "blog", "[slug]"), { recursive: true });
	writeFileSync(join(routes, "blog", "[slug]", "+page.svelte"), `<h1>Blog</h1>\n`);

	mkdirSync(join(routes, "api", "ping"), { recursive: true });
	writeFileSync(
		join(routes, "api", "ping", "+server.ts"),
		`export function GET() {\n\treturn new Response("pong");\n}\n`,
	);

	// Shadows public/files/a.txt — an API route must still win over a file.
	mkdirSync(join(routes, "files", "[...path]"), { recursive: true });
	writeFileSync(
		join(routes, "files", "[...path]", "+server.ts"),
		`export function GET() {\n\treturn new Response("from-api");\n}\n`,
	);

	mkdirSync(join(tmpDir, "public", "files"), { recursive: true });
	writeFileSync(join(tmpDir, "public", "robots.txt"), "User-agent: *\n");
	writeFileSync(join(tmpDir, "public", "files", "a.txt"), "from-public\n");

	writeFileSync(
		join(tmpDir, "src", "hooks.server.ts"),
		`import type { Handle } from "bosia";\n\n` +
			`export const handle: Handle = async ({ event, resolve }) => {\n` +
			`\tconst mode = event.request.headers.get("x-mode");\n` +
			`\tif (mode === "params") return Response.json(event.params, { headers: { "x-hooked": "1" } });\n` +
			`\tif (mode === "rewrite") event.url = new URL("/blog/rewritten", event.url);\n` +
			`\tconst res = await resolve(event);\n` +
			`\tres.headers.set("x-hooked", "1");\n` +
			`\treturn res;\n` +
			`};\n`,
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

afterAll(async () => {
	child?.kill();
	await child?.exited;
	rmSync(tmpDir, { recursive: true, force: true });
});

describe("static files skip the hooks", () => {
	test("a hashed client chunk", async () => {
		const html = await (await fetch(`${origin}/`)).text();
		const chunk = html.match(/\/dist\/client\/[^"']+\.js/)?.[0];
		expect(chunk).toBeDefined();
		const res = await fetch(`${origin}${chunk}`);
		expect(res.status).toBe(200);
		expect(res.headers.get("x-hooked")).toBeNull();
	});

	test("a public/ file", async () => {
		const res = await fetch(`${origin}/robots.txt`);
		expect(res.status).toBe(200);
		expect(await res.text()).toContain("User-agent");
		expect(res.headers.get("x-hooked")).toBeNull();
	});

	test("still carry the security headers", async () => {
		const res = await fetch(`${origin}/robots.txt`);
		expect(res.headers.get("x-content-type-options")).toBe("nosniff");
		expect(res.headers.get("x-frame-options")).toBe("SAMEORIGIN");
	});

	test("a missing file goes through the hooks and 404s", async () => {
		const res = await fetch(`${origin}/nope.txt`);
		expect(res.status).toBe(404);
		expect(res.headers.get("x-hooked")).toBe("1");
	});
});

describe("everything else still runs the hooks", () => {
	test("a page", async () => {
		const res = await fetch(`${origin}/`);
		expect(res.headers.get("x-hooked")).toBe("1");
	});

	test("an API route", async () => {
		const res = await fetch(`${origin}/api/ping`);
		expect(await res.text()).toBe("pong");
		expect(res.headers.get("x-hooked")).toBe("1");
	});

	test("an API route still shadows a public/ file at the same path", async () => {
		const res = await fetch(`${origin}/files/a.txt`);
		expect(await res.text()).toBe("from-api");
		expect(res.headers.get("x-hooked")).toBe("1");
	});
});

describe("hooks see the matched route", () => {
	test("event.params holds the page's params", async () => {
		const res = await fetch(`${origin}/blog/halo`, { headers: { "x-mode": "params" } });
		expect(await res.json()).toEqual({ slug: "halo" });
	});

	test("event.params holds an API route's params", async () => {
		const res = await fetch(`${origin}/files/x/y.txt`, { headers: { "x-mode": "params" } });
		expect(await res.json()).toEqual({ path: "x/y.txt" });
	});

	test("a hook that rewrites the URL gets the rewritten route", async () => {
		const res = await fetch(`${origin}/`, { headers: { "x-mode": "rewrite" } });
		expect(res.status).toBe(200);
		expect(await res.text()).toContain("Blog");
	});
});
