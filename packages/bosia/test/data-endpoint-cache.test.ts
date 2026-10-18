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

	// A loader that marks its page private: SSR must not cache it either.
	mkdirSync(join(routes, "pribadi"), { recursive: true });
	writeFileSync(join(routes, "pribadi", "+page.svelte"), `<p>Pribadi</p>\n`);
	writeFileSync(
		join(routes, "pribadi", "+page.server.ts"),
		counter("pribadi").replace(
			"export function load({ depends }: any) {\n",
			`export function load({ depends, setHeaders }: any) {\n\tsetHeaders({ "cache-control": "private" });\n`,
		),
	);

	// API GETs: one too big for the cache, one small, one that never ends.
	mkdirSync(join(routes, "api", "besar"), { recursive: true });
	writeFileSync(
		join(routes, "api", "besar", "+server.ts"),
		`export function GET() {\n` +
			`\tconst g = globalThis as any;\n` +
			`\tg.__besar = (g.__besar ?? 0) + 1;\n` +
			`\tconst chunk = new Uint8Array(1024 * 1024).fill(97);\n` +
			`\tlet n = 0;\n` +
			`\treturn new Response(new ReadableStream({ pull(c) { if (n++ < 3) c.enqueue(chunk); else c.close(); } }), {\n` +
			`\t\theaders: { "content-type": "text/plain", "x-runs": String(g.__besar) },\n` +
			`\t});\n}\n`,
	);
	mkdirSync(join(routes, "api", "kecil"), { recursive: true });
	writeFileSync(
		join(routes, "api", "kecil", "+server.ts"),
		`export function GET() {\n` +
			`\tconst g = globalThis as any;\n` +
			`\tg.__kecil = (g.__kecil ?? 0) + 1;\n` +
			`\treturn Response.json({ runs: g.__kecil }, { headers: { vary: "Accept-Encoding" } });\n}\n`,
	);
	mkdirSync(join(routes, "api", "kuki"), { recursive: true });
	writeFileSync(
		join(routes, "api", "kuki", "+server.ts"),
		`export function GET() {\n` +
			`\tconst g = globalThis as any;\n` +
			`\tg.__kuki = (g.__kuki ?? 0) + 1;\n` +
			`\treturn Response.json({ runs: g.__kuki }, { headers: { vary: "Cookie" } });\n}\n`,
	);
	mkdirSync(join(routes, "api", "gzip"), { recursive: true });
	writeFileSync(
		join(routes, "api", "gzip", "+server.ts"),
		`import { gzipSync } from "node:zlib";\n` +
			`export function GET() {\n` +
			`\treturn new Response(gzipSync(JSON.stringify({ ok: true })), {\n` +
			`\t\theaders: { "content-type": "application/json", "content-encoding": "gzip" },\n` +
			`\t});\n}\n`,
	);
	mkdirSync(join(routes, "api", "aliran"), { recursive: true });
	writeFileSync(
		join(routes, "api", "aliran", "+server.ts"),
		`export function GET() {\n` +
			`\tconst chunk = new Uint8Array(512 * 1024).fill(98);\n` +
			`\treturn new Response(new ReadableStream({ pull(c) { c.enqueue(chunk); } }), {\n` +
			`\t\theaders: { "content-type": "application/x-ndjson" },\n` +
			`\t});\n}\n`,
	);

	// Tracking params (CACHE_IGNORE_PARAMS): one page ignores the query, one
	// reads utm_source and shows it.
	mkdirSync(join(routes, "iklan"), { recursive: true });
	writeFileSync(join(routes, "iklan", "+page.svelte"), `<p>Iklan</p>\n`);
	writeFileSync(join(routes, "iklan", "+page.server.ts"), counter("iklan"));
	mkdirSync(join(routes, "sumber"), { recursive: true });
	writeFileSync(
		join(routes, "sumber", "+page.svelte"),
		`<script>\n\tlet { data } = $props();\n</script>\n<p>dari {data.from}</p>\n`,
	);
	writeFileSync(
		join(routes, "sumber", "+page.server.ts"),
		`export function load({ url }: any) {\n` +
			`\treturn { from: url.searchParams.get("utm_source") ?? "langsung" };\n}\n`,
	);

	mkdirSync(join(routes, "semua"), { recursive: true });
	writeFileSync(
		join(routes, "semua", "+page.svelte"),
		`<script>\n\tlet { data } = $props();\n</script>\n<p>q={data.q}</p>\n`,
	);
	writeFileSync(
		join(routes, "semua", "+page.server.ts"),
		`export function load({ url }: any) {\n` +
			`\treturn { q: JSON.stringify(Object.fromEntries(url.searchParams)) };\n}\n`,
	);

	mkdirSync(join(routes, "meta"), { recursive: true });
	writeFileSync(join(routes, "meta", "+page.svelte"), `<p>Meta</p>\n`);
	writeFileSync(
		join(routes, "meta", "+page.server.ts"),
		`export function metadata({ url }: any) {\n` +
			`\treturn { title: "Meta", data: { gclid: url.searchParams.get("gclid") } };\n}\n` +
			`export function load({ metadata }: any) {\n\treturn { gclid: metadata?.gclid ?? null };\n}\n`,
	);

	mkdirSync(join(routes, "punya"), { recursive: true });
	writeFileSync(join(routes, "punya", "+page.svelte"), `<p>Punya</p>\n`);
	writeFileSync(
		join(routes, "punya", "+page.server.ts"),
		`export function metadata({ url }: any) {\n` +
			`\treturn { data: { has: url.searchParams.has("tag", "svelte") } };\n}\n` +
			`export function load({ url, metadata }: any) {\n` +
			`\treturn { loader: url.searchParams.has("tag", "svelte"), meta: metadata?.has };\n}\n`,
	);

	// A layout reads the param; the page gets it through parent().
	mkdirSync(join(routes, "kampanye"), { recursive: true });
	writeFileSync(join(routes, "kampanye", "+page.svelte"), `<p>Kampanye</p>\n`);
	writeFileSync(
		join(routes, "kampanye", "+layout.svelte"),
		`<script>\n\tlet { children } = $props();\n</script>\n{@render children()}\n`,
	);
	writeFileSync(
		join(routes, "kampanye", "+layout.server.ts"),
		`export function load({ url }: any) {\n` +
			`\treturn { campaign: url.searchParams.get("utm_campaign") ?? "none" };\n}\n`,
	);
	writeFileSync(
		join(routes, "kampanye", "+page.server.ts"),
		`export async function load({ parent }: any) {\n` +
			`\tconst { campaign } = await parent();\n\treturn { promo: campaign };\n}\n`,
	);

	mkdirSync(join(routes, "kampanye", "anak"), { recursive: true });
	writeFileSync(join(routes, "kampanye", "anak", "+page.svelte"), `<p>Anak</p>\n`);
	writeFileSync(
		join(routes, "kampanye", "anak", "+page.server.ts"),
		`export function load() {\n\treturn { anak: true };\n}\n`,
	);
	writeFileSync(
		join(routes, "kampanye", "anak", "+layout.svelte"),
		`<script>\n\tlet { children } = $props();\n</script>\n{@render children()}\n`,
	);
	writeFileSync(
		join(routes, "kampanye", "anak", "+layout.server.ts"),
		`export async function load({ parent }: any) {\n` +
			`\tconst { campaign } = await parent();\n\treturn { banner: campaign };\n}\n`,
	);

	mkdirSync(join(routes, "api", "evict-path"), { recursive: true });
	writeFileSync(
		join(routes, "api", "evict-path", "+server.ts"),
		`import { invalidate } from "bosia/server";\n` +
			`export function POST({ url }: any) {\n\treturn Response.json({ evicted: invalidate(url.searchParams.get("p")) });\n}\n`,
	);

	// Renders the request's origin, which follows the Host header.
	mkdirSync(join(routes, "asal"), { recursive: true });
	writeFileSync(
		join(routes, "asal", "+page.svelte"),
		`<script>\n\tlet { data } = $props();\n</script>\n<p>asal={data.origin}</p>\n`,
	);
	writeFileSync(
		join(routes, "asal", "+page.server.ts"),
		`export function load({ url }: any) {\n\treturn { origin: url.origin };\n}\n`,
	);

	// metadata() hangs on the first call (METADATA_TIMEOUT=0 here).
	mkdirSync(join(routes, "meta-macet"), { recursive: true });
	writeFileSync(join(routes, "meta-macet", "+page.svelte"), `<p>Meta macet</p>\n`);
	writeFileSync(
		join(routes, "meta-macet", "+page.server.ts"),
		`export function metadata() {\n` +
			`\tconst g = globalThis as any;\n` +
			`\tif (!g.__metaMacet) { g.__metaMacet = 1; return new Promise(() => {}); }\n` +
			`\treturn { title: "ok" };\n}\n` +
			`export function load() {\n\treturn { ok: true };\n}\n`,
	);

	// metadata() fails on the first call only.
	mkdirSync(join(routes, "meta-gagal"), { recursive: true });
	writeFileSync(join(routes, "meta-gagal", "+page.svelte"), `<p>Meta gagal</p>\n`);
	writeFileSync(
		join(routes, "meta-gagal", "+page.server.ts"),
		`export function metadata() {\n` +
			`\tconst g = globalThis as any;\n` +
			`\tif (!g.__metaGagal) { g.__metaGagal = 1; throw new Error("cms down"); }\n` +
			`\treturn { title: "Judul" };\n}\n` +
			`export function load() {\n\treturn { ok: true };\n}\n`,
	);

	mkdirSync(join(routes, "meta-gagal-ssr"), { recursive: true });
	writeFileSync(join(routes, "meta-gagal-ssr", "+page.svelte"), `<p>Meta gagal SSR</p>\n`);
	writeFileSync(
		join(routes, "meta-gagal-ssr", "+page.server.ts"),
		`export function metadata() {\n` +
			`\tconst g = globalThis as any;\n` +
			`\tif (!g.__metaGagalSsr) { g.__metaGagalSsr = 1; throw new Error("cms down"); }\n` +
			`\treturn { title: "Judul SSR" };\n}\n`,
	);

	// The first call never settles; later ones answer.
	mkdirSync(join(routes, "macet"), { recursive: true });
	writeFileSync(join(routes, "macet", "+page.svelte"), `<p>Macet</p>\n`);
	writeFileSync(
		join(routes, "macet", "+page.server.ts"),
		`export function load() {\n` +
			`\tconst g = globalThis as any;\n` +
			`\tif (!g.__macet) { g.__macet = 1; return new Promise(() => {}); }\n` +
			`\treturn { ok: true };\n}\n`,
	);
	mkdirSync(join(routes, "api", "macet"), { recursive: true });
	writeFileSync(
		join(routes, "api", "macet", "+server.ts"),
		`export function GET() {\n` +
			`\tconst g = globalThis as any;\n` +
			`\tif (!g.__apiMacet) { g.__apiMacet = 1; return new Promise(() => {}); }\n` +
			`\treturn Response.json({ ok: true });\n}\n`,
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
			LOAD_TIMEOUT: "2000",
			METADATA_TIMEOUT: "0",
			CACHE_WAIT_TIMEOUT: "1000",
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
	// SIGKILL: the hung API handler below is still in flight, and a graceful
	// stop would drain it for 10s.
	child?.kill("SIGKILL");
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

describe("what the cache leaves alone", () => {
	test("an SSR page whose loader set cache-control: private is not cached", async () => {
		const first = await fetch(`${origin}/pribadi`);
		const firstHtml = await first.text();
		await settle();
		const second = await fetch(`${origin}/pribadi`);
		expect(second.headers.get("x-bosia-cache")).toBeNull();
		expect(await second.text()).not.toBe(firstHtml);
	});

	test("a small API GET is still cached", async () => {
		const first = await (await fetch(`${origin}/api/kecil`)).json();
		await settle();
		const second = await fetch(`${origin}/api/kecil`);
		expect(second.headers.get("x-bosia-cache")).toBe("HIT");
		// The handler's own Vary survives the hit, without a duplicate token.
		expect(second.headers.get("vary")).toBe("Accept-Encoding");
		expect((await second.json()).runs).toBe(first.runs);
	});

	test("an API GET with a Vary the cache key can't honor is not cached", async () => {
		const first = await (await fetch(`${origin}/api/kuki`)).json();
		await settle();
		const second = await fetch(`${origin}/api/kuki`);
		expect(second.headers.get("x-bosia-cache")).toBeNull();
		expect((await second.json()).runs).toBe(first.runs + 1);
	});

	test("an API GET the handler already encoded is not cached as plain bytes", async () => {
		await (await fetch(`${origin}/api/gzip`)).text();
		await settle();
		const second = await fetch(`${origin}/api/gzip`);
		expect(second.headers.get("x-bosia-cache")).toBeNull();
		expect(await second.json()).toEqual({ ok: true });
	});

	test("an API GET over CACHE_MAX_BODY_BYTES goes out whole and is not cached", async () => {
		const first = await fetch(`${origin}/api/besar`);
		expect((await first.arrayBuffer()).byteLength).toBe(3 * 1024 * 1024);
		await settle();
		const second = await fetch(`${origin}/api/besar`);
		expect(second.headers.get("x-bosia-cache")).toBeNull();
		expect(Number(second.headers.get("x-runs"))).toBe(Number(first.headers.get("x-runs")) + 1);
		expect((await second.arrayBuffer()).byteLength).toBe(3 * 1024 * 1024);
	});

	test("an endless API stream doesn't hold back the next request", async () => {
		const ac = new AbortController();
		const first = await fetch(`${origin}/api/aliran`, { signal: ac.signal });
		const reader = first.body!.getReader();
		await reader.read();
		// The first response is still streaming; a second one must not wait on it.
		const ac2 = new AbortController();
		const timer = setTimeout(() => ac2.abort(), 3000);
		const second = await fetch(`${origin}/api/aliran`, { signal: ac2.signal });
		clearTimeout(timer);
		expect(second.status).toBe(200);
		ac.abort();
		ac2.abort();
		await reader.cancel().catch(() => {});
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

describe("tracking params (CACHE_IGNORE_PARAMS)", () => {
	test("a request with utm_* / fbclid is served the plain URL's entry", async () => {
		await fetch(`${origin}/iklan`);
		await settle();
		const plain = await fetch(`${origin}/iklan`);
		expect(plain.headers.get("x-bosia-cache")).toBe("HIT");
		const html = await plain.text();

		const ad = await fetch(`${origin}/iklan?utm_source=fb&utm_medium=cpc&fbclid=abc`);
		expect(ad.headers.get("x-bosia-cache")).toBe("HIT");
		expect(await ad.text()).toBe(html);

		// Other params are still their own entry.
		const other = await fetch(`${origin}/iklan?page=2`);
		expect(other.headers.get("x-bosia-cache")).toBeNull();
	});

	test("the data endpoint does the same", async () => {
		const first = await getData("/iklan.json");
		await settle();
		const ad = await getData("/iklan.json?gclid=xyz");
		expect(ad.res.headers.get("x-bosia-cache")).toBe("HIT");
		expect(ad.body.pageData.runs).toBe(first.body.pageData.runs);
	});

	test("without a plain entry, a tracked URL is cached under its own URL", async () => {
		const ad = await getData("/iklan.json?_invalidated=1&utm_source=x");
		expect(ad.res.headers.get("x-bosia-cache")).toBeNull();
		await settle();
		const again = await getData("/iklan.json?_invalidated=1&utm_source=x");
		expect(again.res.headers.get("x-bosia-cache")).toBe("HIT");
		// It never fills the plain URL's entry.
		const plain = await getData("/iklan.json?_invalidated=1");
		expect(plain.res.headers.get("x-bosia-cache")).toBeNull();
		expect(plain.body.pageData.runs).toBe(ad.body.pageData.runs + 1);
	});

	test("a page whose loader reads the param is not served the plain entry", async () => {
		await fetch(`${origin}/sumber`);
		await settle();
		expect((await fetch(`${origin}/sumber`)).headers.get("x-bosia-cache")).toBe("HIT");

		const ad = await fetch(`${origin}/sumber?utm_source=newsletter`);
		expect(ad.headers.get("x-bosia-cache")).toBeNull();
		expect(await ad.text()).toContain("dari newsletter");
		await settle();
		// Its own URL is still cached, with its own value.
		const again = await fetch(`${origin}/sumber?utm_source=newsletter`);
		expect(again.headers.get("x-bosia-cache")).toBe("HIT");
		expect(await again.text()).toContain("dari newsletter");
		const data = await getData("/sumber.json?utm_source=newsletter");
		expect(data.body.pageData.from).toBe("newsletter");
	});

	test("so is a page whose layout read it, even when the mask leaves the layout out", async () => {
		await getData("/kampanye.json?_invalidated=1000");
		await settle();
		expect(
			(await getData("/kampanye.json?_invalidated=1000")).res.headers.get("x-bosia-cache"),
		).toBe("HIT");
		const ad = await getData("/kampanye.json?_invalidated=1000&utm_campaign=lebaran");
		expect(ad.res.headers.get("x-bosia-cache")).toBeNull();
		expect(ad.body.pageData.promo).toBe("lebaran");
	});

	test("…and when only a lower layout that got it through parent() is sent", async () => {
		const full = await getData("/kampanye/anak.json");
		const n = full.body.layoutData.length;
		// Page skipped, the reading layout left out, the one below it sent.
		const bits = "0" + "1".repeat(n - 2) + "01";
		await getData(`/kampanye/anak.json?_invalidated=${bits}`);
		await settle();
		const plain = await getData(`/kampanye/anak.json?_invalidated=${bits}`);
		expect(plain.res.headers.get("x-bosia-cache")).toBe("HIT");
		expect(plain.body.pageData).toBeNull();
		const ad = await getData(`/kampanye/anak.json?_invalidated=${bits}&utm_campaign=x`);
		expect(ad.res.headers.get("x-bosia-cache")).toBeNull();
		expect(ad.body.layoutData[n - 1].banner).toBe("x");
	});

	test("so is a page whose metadata() reads the param", async () => {
		await getData("/meta.json");
		await settle();
		expect((await getData("/meta.json")).res.headers.get("x-bosia-cache")).toBe("HIT");
		const ad = await getData("/meta.json?gclid=g1");
		expect(ad.res.headers.get("x-bosia-cache")).toBeNull();
		expect(ad.body.pageData.gclid).toBe("g1");
	});

	test("so is a page whose loader iterates the whole query", async () => {
		await getData("/semua.json");
		await settle();
		expect((await getData("/semua.json")).res.headers.get("x-bosia-cache")).toBe("HIT");
		const ad = await getData("/semua.json?utm_source=x");
		expect(ad.res.headers.get("x-bosia-cache")).toBeNull();
		expect(ad.body.pageData.q).toBe(JSON.stringify({ utm_source: "x" }));
	});
});

describe("a request that never finishes", () => {
	test("a hung loader times out and the URL recovers", async () => {
		const first = await fetch(`${origin}/macet`);
		expect(first.status).toBe(500);
		await first.text();
		const second = await fetch(`${origin}/macet`);
		expect(second.status).toBe(200);
	}, 15_000);

	test("a data request doesn't join a stuck one's loader run after CACHE_WAIT_TIMEOUT", async () => {
		const ac = new AbortController();
		const hung = getData("/meta-macet.json", { signal: ac.signal }).catch(() => null);
		await Bun.sleep(100);
		const started = Date.now();
		const waiters = await Promise.all(Array.from({ length: 5 }, () => getData("/meta-macet.json")));
		for (const w of waiters) expect(w.res.status).toBe(200);
		expect(Date.now() - started).toBeLessThan(4000);
		const t = Date.now();
		expect((await getData("/meta-macet.json")).res.status).toBe(200);
		// Well under CACHE_WAIT_TIMEOUT (1000): it didn't wait on the stuck gate.
		expect(Date.now() - t).toBeLessThan(900);
		ac.abort();
		await hung;
	}, 15_000);

	test("a hung API handler holds its cache key for at most CACHE_WAIT_TIMEOUT", async () => {
		const ac = new AbortController();
		const hung = fetch(`${origin}/api/macet`, { signal: ac.signal }).catch(() => null);
		await Bun.sleep(100);
		const started = Date.now();
		const second = await fetch(`${origin}/api/macet`);
		expect(second.status).toBe(200);
		expect(Date.now() - started).toBeLessThan(4000);
		// The stuck gate is gone: the next miss doesn't wait.
		const t = Date.now();
		expect((await fetch(`${origin}/api/macet`)).status).toBe(200);
		// Well under CACHE_WAIT_TIMEOUT (1000): it didn't wait on the stuck gate.
		expect(Date.now() - t).toBeLessThan(900);
		ac.abort();
		await hung;
	}, 15_000);
});

describe("metadata() failures", () => {
	test("a page whose metadata() failed is served but not cached without its title", async () => {
		const failed = await getData("/meta-gagal.json");
		expect(failed.res.status).toBe(200);
		expect(failed.body.metadata).toBeNull();
		await settle();
		const next = await getData("/meta-gagal.json");
		expect(next.res.headers.get("x-bosia-cache")).toBeNull();
		expect(next.body.metadata.title).toBe("Judul");
	});

	test("the same for page HTML", async () => {
		const failed = await fetch(`${origin}/meta-gagal-ssr`);
		expect(await failed.text()).not.toContain("Judul SSR");
		await settle();
		const next = await fetch(`${origin}/meta-gagal-ssr`);
		expect(next.headers.get("x-bosia-cache")).toBeNull();
		expect(await next.text()).toContain("<title>Judul SSR</title>");
	});
});

describe("loader url tracking", () => {
	test("searchParams.has(name, value) still checks the value", async () => {
		const page = await getData("/punya.json?tag=react");
		expect(page.body.pageData.loader).toBe(false);
		expect(page.body.pageData.meta).toBe(false);
	});
});

describe("cache key carries the origin", () => {
	// A spoofed Host must not poison the copy served to the real one.
	const get = (path: string, host: string) => fetch(`${origin}${path}`, { headers: { host } });

	for (const [kind, path] of [
		["page HTML", "/asal"],
		["data endpoint", "/__bosia/data/asal.json?_invalidated=1"],
	]) {
		test(`${kind}: another Host gets its own copy`, async () => {
			await get(path, "app.test");
			await settle();
			const hit = await get(path, "app.test");
			expect(hit.headers.get("x-bosia-cache")).toBe("HIT");
			expect(await hit.text()).toContain("http://app.test");

			const other = await get(path, "evil.test");
			expect(other.headers.get("x-bosia-cache")).toBeNull();
			const body = await other.text();
			expect(body).toContain("http://evil.test");
			expect(body).not.toContain("http://app.test");
		});
	}
});

describe("invalidate(path) on data endpoint keys", () => {
	test("a page's own ?_invalidated=<cache-buster> doesn't break the client's mask after it", async () => {
		// dataUrl() keeps the page query, then appends the mask: the last one wins.
		const page = await getData("/hitung.json?_invalidated=1700000000&_invalidated=1");
		expect(page.res.status).toBe(200);
		expect(page.body.pageData.runs).toBeGreaterThan(0);
	});

	test("a malformed mask alone runs every loader and still invalidates by path", async () => {
		// `1?x` would put a raw `?` in the key and file it under the wrong path.
		const path = "/hitung.json?_invalidated=1%3Fx";
		expect((await getData(path)).res.status).toBe(200);
		await settle();
		expect((await getData(path)).res.headers.get("x-bosia-cache")).toBe("HIT");
		const res = await fetch(`${origin}/api/evict-path?p=/hitung`, {
			method: "POST",
			headers: { origin },
		});
		expect((await res.json()).evicted).toBeGreaterThan(0);
		expect((await getData(path)).res.headers.get("x-bosia-cache")).toBeNull();
	});

	test("path invalidation finds a data entry", async () => {
		const path = "/hitung.json?_invalidated=1";
		await getData(path);
		await settle();
		expect((await getData(path)).res.headers.get("x-bosia-cache")).toBe("HIT");

		const res = await fetch(`${origin}/api/evict-path?p=/hitung`, {
			method: "POST",
			headers: { origin },
		});
		expect((await res.json()).evicted).toBeGreaterThan(0);
		expect((await getData(path)).res.headers.get("x-bosia-cache")).toBeNull();
	});
});
