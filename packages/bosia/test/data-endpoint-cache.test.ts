import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { mkdirSync, writeFileSync, rmSync } from "fs";
import { join } from "path";

import { getEphemeralPort } from "../src/core/prerender.ts";
import { BOSIA_NODE_PATH } from "../src/core/paths.ts";

// The client router's `/__bosia/data/*.json` requests are most of an app's
// traffic after the first page load. They go through the same response cache
// as page HTML; this boots a real built server and counts loader runs.
//
// Fixture lives under packages/bosia/ so svelte and the Tailwind binary resolve
// from this package's node_modules — same reason as basePath-server.test.ts.

let tmpDir: string;
let child: Bun.Subprocess | null = null;
let origin: string;

beforeAll(async () => {
	tmpDir = join(import.meta.dir, "..", `.tmp-data-cache-${Date.now()}`);
	const routes = join(tmpDir, "src", "routes");
	mkdirSync(routes, { recursive: true });

	writeFileSync(join(tmpDir, "tsconfig.json"), JSON.stringify({ compilerOptions: { paths: {} } }));
	writeFileSync(join(tmpDir, "src", "app.css"), `@import "tailwindcss";\n@source "../src";\n`);
	writeFileSync(
		join(tmpDir, "src", "app.html"),
		`<!doctype html>\n<html lang="%bosia.lang%">\n<head>%bosia.head%</head>\n<body>%bosia.body%</body>\n</html>\n`,
	);
	writeFileSync(join(routes, "+page.svelte"), `<h1>Beranda</h1>\n`);

	// Each loader returns how many times it has run, plus enough bytes to be compressed.
	const counter = (name: string) =>
		`export function load({ depends }: any) {\n` +
		`\tdepends("app:${name}");\n` +
		`\tconst g = globalThis as any;\n` +
		`\tg.__runs ??= {};\n` +
		`\tg.__runs["${name}"] = (g.__runs["${name}"] ?? 0) + 1;\n` +
		`\treturn { runs: g.__runs["${name}"], pad: "x".repeat(4000) };\n` +
		`}\n`;

	mkdirSync(join(routes, "hitung"), { recursive: true });
	writeFileSync(join(routes, "hitung", "+page.svelte"), `<p>Hitung</p>\n`);
	writeFileSync(join(routes, "hitung", "+page.server.ts"), counter("hitung"));

	mkdirSync(join(routes, "langsung"), { recursive: true });
	writeFileSync(
		join(routes, "langsung", "+page.svelte"),
		`<script module>\n\texport const cache = false;\n</script>\n<p>Langsung</p>\n`,
	);
	writeFileSync(join(routes, "langsung", "+page.server.ts"), counter("langsung"));

	mkdirSync(join(routes, "api", "evict"), { recursive: true });
	writeFileSync(
		join(routes, "api", "evict", "+server.ts"),
		`import { invalidate } from "bosia/server";\n` +
			`export function POST() {\n\treturn Response.json({ evicted: invalidate("app:hitung") });\n}\n`,
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
	// Windows keeps the server's files locked until it has exited (EBUSY).
	await child?.exited;
	rmSync(tmpDir, { recursive: true, force: true });
});

/** The cache write runs after the response has gone out. */
const settle = () => Bun.sleep(30);

async function getData(path: string, init?: RequestInit) {
	const res = await fetch(`${origin}/__bosia/data${path}`, init);
	return { res, body: res.status === 200 ? await res.json() : null };
}

describe("data endpoint response cache", () => {
	test("a repeat request is served from cache without running load()", async () => {
		const first = await getData("/hitung.json?_invalidated=1");
		expect(first.res.headers.get("x-bosia-cache")).toBeNull();
		await settle();

		const second = await getData("/hitung.json?_invalidated=1");
		expect(second.res.headers.get("x-bosia-cache")).toBe("HIT");
		expect(second.body.pageData.runs).toBe(first.body.pageData.runs);
	});

	test("_fresh=1 skips the cached copy and refreshes it", async () => {
		const cached = await getData("/hitung.json?_invalidated=1");
		const fresh = await getData("/hitung.json?_invalidated=1&_fresh=1");
		expect(fresh.res.headers.get("x-bosia-cache")).toBeNull();
		expect(fresh.body.pageData.runs).toBe(cached.body.pageData.runs + 1);
		await settle();

		const after = await getData("/hitung.json?_invalidated=1");
		expect(after.res.headers.get("x-bosia-cache")).toBe("HIT");
		expect(after.body.pageData.runs).toBe(fresh.body.pageData.runs);
	});

	test("a different mask is a different entry", async () => {
		const a = await getData("/hitung.json?_invalidated=1");
		const b = await getData("/hitung.json");
		expect(a.res.headers.get("x-bosia-cache")).toBe("HIT");
		expect(b.res.headers.get("x-bosia-cache")).toBeNull();
	});

	test("server-side invalidate() by depends() tag evicts it", async () => {
		const before = await getData("/hitung.json?_invalidated=1");
		const evict = await fetch(`${origin}/api/evict`, { method: "POST", headers: { origin } });
		expect((await evict.json()).evicted).toBeGreaterThan(0);

		const after = await getData("/hitung.json?_invalidated=1");
		expect(after.res.headers.get("x-bosia-cache")).toBeNull();
		expect(after.body.pageData.runs).toBeGreaterThan(before.body.pageData.runs);
	});

	test("a route with `export const cache = false` is never cached", async () => {
		const first = await getData("/langsung.json");
		await settle();
		const second = await getData("/langsung.json");
		expect(second.res.headers.get("x-bosia-cache")).toBeNull();
		expect(second.body.pageData.runs).toBe(first.body.pageData.runs + 1);
	});

	test("a POST bypasses the cache", async () => {
		await getData("/hitung.json?_invalidated=1");
		await settle();
		const post = await getData("/hitung.json?_invalidated=1", {
			method: "POST",
			headers: { origin, "content-type": "application/json" },
			body: "{}",
		});
		expect(post.res.headers.get("x-bosia-cache")).toBeNull();
	});
});

describe("ETag on cached responses", () => {
	test("a cache hit carries an ETag and answers If-None-Match with 304", async () => {
		await getData("/hitung.json?_invalidated=1");
		await settle();
		const hit = await fetch(`${origin}/__bosia/data/hitung.json?_invalidated=1`, {
			headers: { "accept-encoding": "br" },
		});
		const etag = hit.headers.get("etag");
		expect(etag).toMatch(/^"[\w-]+-br"$/);

		const revalidate = await fetch(`${origin}/__bosia/data/hitung.json?_invalidated=1`, {
			headers: { "accept-encoding": "br", "if-none-match": etag! },
		});
		expect(revalidate.status).toBe(304);
		expect(await revalidate.text()).toBe("");
	});

	test("each encoding gets its own ETag", async () => {
		const br = await fetch(`${origin}/__bosia/data/hitung.json?_invalidated=1`, {
			headers: { "accept-encoding": "br" },
		});
		const raw = await fetch(`${origin}/__bosia/data/hitung.json?_invalidated=1`, {
			headers: { "accept-encoding": "identity" },
		});
		expect(br.headers.get("etag")).not.toBe(raw.headers.get("etag"));
		// The brotli tag must not validate the uncompressed copy.
		const cross = await fetch(`${origin}/__bosia/data/hitung.json?_invalidated=1`, {
			headers: { "accept-encoding": "identity", "if-none-match": br.headers.get("etag")! },
		});
		expect(cross.status).toBe(200);
	});

	test("cached page HTML gets the same treatment", async () => {
		await fetch(`${origin}/hitung`);
		await settle();
		const hit = await fetch(`${origin}/hitung`);
		const etag = hit.headers.get("etag");
		expect(hit.headers.get("x-bosia-cache")).toBe("HIT");
		expect(etag).toBeTruthy();
		const revalidate = await fetch(`${origin}/hitung`, { headers: { "if-none-match": etag! } });
		expect(revalidate.status).toBe(304);
	});
});
