import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { mkdirSync, writeFileSync, rmSync } from "fs";
import { join } from "path";

import { getEphemeralPort } from "../src/core/prerender.ts";
import { BOSIA_NODE_PATH } from "../src/core/paths.ts";

// HEAD is GET without the body. A `+server.ts` that only exports GET (sitemap,
// feeds) must answer HEAD, and HEAD on pages and API routes must reuse the GET
// cache entry instead of running the handler or loaders again — but never
// fill it. Boots a real built server; counts runs via `/api/runs`.

let tmpDir: string;
let child: Bun.Subprocess | null = null;
let origin: string;

const runs = async (name: string): Promise<number> =>
	((await (await fetch(`${origin}/api/runs`)).json()) as Record<string, number>)[name] ?? 0;

beforeAll(async () => {
	tmpDir = join(import.meta.dir, "..", `.tmp-head-${Date.now()}`);
	const routes = join(tmpDir, "src", "routes");
	mkdirSync(routes, { recursive: true });

	writeFileSync(join(tmpDir, "tsconfig.json"), JSON.stringify({ compilerOptions: { paths: {} } }));
	writeFileSync(join(tmpDir, "src", "app.css"), `@import "tailwindcss";\n@source "../src";\n`);
	writeFileSync(
		join(tmpDir, "src", "app.html"),
		`<!doctype html>\n<html lang="%bosia.lang%">\n<head>%bosia.head%</head>\n<body>%bosia.body%</body>\n</html>\n`,
	);
	writeFileSync(join(routes, "+page.svelte"), `<h1>Beranda</h1>\n`);

	const bump = (name: string) =>
		`\tconst g = globalThis as any;\n` +
		`\tg.__runs ??= {};\n` +
		`\tg.__runs["${name}"] = (g.__runs["${name}"] ?? 0) + 1;\n`;

	mkdirSync(join(routes, "feed.xml"), { recursive: true });
	writeFileSync(
		join(routes, "feed.xml", "+server.ts"),
		`export function GET() {\n${bump("feed")}` +
			`\treturn new Response("<rss>" + "x".repeat(2000) + "</rss>", {\n` +
			`\t\theaders: { "content-type": "application/rss+xml" },\n\t});\n}\n`,
	);

	mkdirSync(join(routes, "api", "write"), { recursive: true });
	writeFileSync(
		join(routes, "api", "write", "+server.ts"),
		`export function POST() {\n\treturn Response.json({ ok: true });\n}\n`,
	);

	mkdirSync(join(routes, "api", "own-head"), { recursive: true });
	writeFileSync(
		join(routes, "api", "own-head", "+server.ts"),
		`export function GET() {\n\treturn Response.json({ ok: true });\n}\n` +
			`export function HEAD() {\n\treturn new Response(null, { headers: { "x-own-head": "1" } });\n}\n`,
	);

	mkdirSync(join(routes, "api", "runs"), { recursive: true });
	writeFileSync(
		join(routes, "api", "runs", "+server.ts"),
		`export const cache = false;\n` +
			`export function GET() {\n\treturn Response.json((globalThis as any).__runs ?? {});\n}\n`,
	);

	mkdirSync(join(routes, "hitung"), { recursive: true });
	writeFileSync(join(routes, "hitung", "+page.svelte"), `<p>Hitung</p>\n`);
	writeFileSync(
		join(routes, "hitung", "+page.server.ts"),
		`export function load() {\n${bump("hitung")}\treturn {};\n}\n`,
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

const head = (path: string) => fetch(`${origin}${path}`, { method: "HEAD" });

describe("HEAD on +server.ts", () => {
	test("a GET-only route answers HEAD like GET, without a body", async () => {
		const res = await head("/feed.xml");
		expect(res.status).toBe(200);
		expect(res.headers.get("content-type")).toBe("application/rss+xml");
		expect(await res.text()).toBe("");
	});

	test("405 lists HEAD next to GET", async () => {
		const put = await fetch(`${origin}/feed.xml`, { method: "PUT", headers: { origin } });
		expect(put.status).toBe(405);
		expect(put.headers.get("allow")).toBe("GET, HEAD");

		const res = await head("/api/write");
		expect(res.status).toBe(405);
		expect(res.headers.get("allow")).toBe("POST");
	});

	test("an explicit HEAD export wins over GET, even over a cached GET", async () => {
		await (await fetch(`${origin}/api/own-head`)).text();
		await settle();
		const cached = await fetch(`${origin}/api/own-head`);
		expect(cached.headers.get("x-bosia-cache")).toBe("HIT");
		await cached.text();

		const res = await head("/api/own-head");
		expect(res.status).toBe(200);
		expect(res.headers.get("x-own-head")).toBe("1");
	});
});

describe("HEAD and the response cache", () => {
	for (const [path, name] of [
		["/feed.xml?k=cache", "feed"],
		["/hitung?k=cache", "hitung"],
	] as const) {
		test(`${path}: HEAD never fills the cache, but reads it`, async () => {
			const start = await runs(name);

			// A HEAD miss runs the handler and leaves the cache empty.
			const miss = await head(path);
			expect(miss.status).toBe(200);
			expect(miss.headers.get("x-bosia-cache")).toBeNull();
			await settle();
			expect(await runs(name)).toBe(start + 1);

			const get = await fetch(`${origin}${path}`);
			expect(get.headers.get("x-bosia-cache")).toBeNull();
			await get.text();
			await settle();
			expect(await runs(name)).toBe(start + 2);

			// GET filled it; HEAD now hits without running anything.
			const getHit = await fetch(`${origin}${path}`);
			expect(getHit.headers.get("x-bosia-cache")).toBe("HIT");
			await getHit.text();
			const hit = await head(path);
			expect(hit.status).toBe(200);
			expect(hit.headers.get("x-bosia-cache")).toBe("HIT");
			expect(hit.headers.get("content-length")).toBe(getHit.headers.get("content-length"));
			expect(await hit.text()).toBe("");
			expect(await runs(name)).toBe(start + 2);
		});
	}
});
