import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { mkdirSync, writeFileSync, rmSync } from "fs";
import { join } from "path";

import { getEphemeralPort } from "../src/core/prerender.ts";
import { BOSIA_NODE_PATH } from "../src/core/paths.ts";

// Layout and page server loaders start together; `parent()` is what orders
// them. Three loaders that each wait 150ms used to cost ~450ms in a row.
//
// Also pins what must NOT change: the root-most failure still decides the
// response, and the page load() gets metadata.data on client navigation too
// (it got `null` there before).

let tmpDir: string;
let child: Bun.Subprocess | null = null;
let origin: string;

const dataUrl = (route: string, q = "") => `${origin}/__bosia/data${route}.json${q}`;
const LAYOUT = `<script>let { children } = $props();</script>\n{@render children()}\n`;
const SLEEP = `const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));\n`;

beforeAll(async () => {
	tmpDir = join(import.meta.dir, "..", `.tmp-parallel-loaders-${Date.now()}`);
	const routes = join(tmpDir, "src", "routes");
	const slow = join(routes, "slow");
	const inner = join(slow, "inner");
	const race = join(routes, "race");
	const raceInner = join(race, "inner");
	mkdirSync(inner, { recursive: true });
	mkdirSync(raceInner, { recursive: true });

	writeFileSync(join(tmpDir, "tsconfig.json"), JSON.stringify({ compilerOptions: { paths: {} } }));
	writeFileSync(join(tmpDir, "src", "app.css"), `@import "tailwindcss";\n@source "../src";\n`);
	writeFileSync(
		join(tmpDir, "src", "app.html"),
		`<!doctype html>\n<html lang="%bosia.lang%">\n<head>%bosia.head%</head>\n<body>%bosia.body%</body>\n</html>\n`,
	);
	writeFileSync(join(routes, "+page.svelte"), `<h1>Beranda</h1>\n`);
	writeFileSync(join(routes, "+error.svelte"), `<h1>Galat</h1>\n`);

	// /slow/inner: two layouts and a page, 150ms each. The inner ones read
	// parent() while their own wait runs, so a serial run cannot hide.
	writeFileSync(join(slow, "+layout.svelte"), LAYOUT);
	writeFileSync(
		join(slow, "+layout.server.ts"),
		SLEEP + `export async function load() {\n\tawait sleep(150);\n\treturn { a: "root" };\n}\n`,
	);
	writeFileSync(join(inner, "+layout.svelte"), LAYOUT);
	writeFileSync(
		join(inner, "+layout.server.ts"),
		SLEEP +
			`export async function load({ parent }: any) {\n` +
			`\tconst [p] = await Promise.all([parent(), sleep(150)]);\n` +
			`\treturn { b: "inner", innerSawA: p.a };\n` +
			`}\n`,
	);
	writeFileSync(
		join(inner, "+page.svelte"),
		`<script>let { data } = $props();</script>\n<h1>{data.sawA}-{data.sawB}-{data.fromMeta}</h1>\n`,
	);
	writeFileSync(
		join(inner, "+page.server.ts"),
		SLEEP +
			`export function metadata() {\n\treturn { title: "Lambat", data: { fromMeta: "meta" } };\n}\n` +
			`export async function load({ parent, metadata }: any) {\n` +
			`\tconst [p] = await Promise.all([parent(), sleep(150)]);\n` +
			`\treturn { sawA: p.a, sawB: p.b, fromMeta: metadata?.fromMeta ?? null };\n` +
			`}\n`,
	);

	// /race/inner: the root layout redirects late, the inner one crashes at
	// once. The crash settles first; the root's redirect must still win.
	writeFileSync(join(race, "+layout.svelte"), LAYOUT);
	writeFileSync(
		join(race, "+layout.server.ts"),
		`import { redirect } from "bosia";\n` +
			SLEEP +
			`export async function load() {\n\tawait sleep(100);\n\tthrow redirect(303, "/login");\n}\n`,
	);
	writeFileSync(join(raceInner, "+layout.svelte"), LAYOUT);
	writeFileSync(
		join(raceInner, "+layout.server.ts"),
		`export function load() {\n\tthrow new Error("boom");\n}\n`,
	);
	writeFileSync(join(raceInner, "+page.svelte"), `<h1>Race</h1>\n`);
	writeFileSync(
		join(raceInner, "+page.server.ts"),
		`export function load() {\n\treturn { secret: "leaked" };\n}\n`,
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

// A unique query per request keeps the response cache out of the timing.
let n = 0;
const fresh = () => `?t=${Date.now()}-${n++}`;

async function timed(url: string) {
	const start = performance.now();
	const res = await fetch(url, { redirect: "manual" });
	const body = await res.text();
	return { res, body, ms: performance.now() - start };
}

describe("loaders run in parallel", () => {
	test("SSR takes about one loader's time, not three", async () => {
		await fetch(`${origin}/slow/inner${fresh()}`); // warm the route's imports
		const { res, body, ms } = await timed(`${origin}/slow/inner${fresh()}`);
		expect(res.status).toBe(200);
		expect(body).toContain("root-inner-meta");
		expect(ms).toBeLessThan(400);
	});

	test("the data endpoint does too", async () => {
		const { res, body, ms } = await timed(dataUrl("/slow/inner", fresh()));
		expect(res.status).toBe(200);
		expect(JSON.parse(body).pageData).toMatchObject({ sawA: "root", sawB: "inner" });
		expect(ms).toBeLessThan(400);
	});
});

describe("parent() still hands down layout data", () => {
	test("a child layout sees the root layout's data", async () => {
		const body = await (await fetch(dataUrl("/slow/inner", fresh()))).json();
		expect(body.layoutData[1]).toMatchObject({ b: "inner", innerSawA: "root" });
	});

	test("the page sees every layout above it", async () => {
		const body = await (await fetch(dataUrl("/slow/inner", fresh()))).json();
		expect(body.pageData).toMatchObject({ sawA: "root", sawB: "inner" });
	});
});

describe("the root-most failure decides the response", () => {
	test("a page request gets the root layout's redirect, not the inner crash", async () => {
		const res = await fetch(`${origin}/race/inner`, { redirect: "manual" });
		expect(res.status).toBe(303);
		expect(res.headers.get("location")).toBe("/login");
	});

	test("a data request gets the same redirect, and no page data", async () => {
		const res = await fetch(dataUrl("/race/inner"));
		const body = await res.text();
		expect(body).not.toContain("leaked");
		expect(JSON.parse(body)).toMatchObject({ redirect: "/login", status: 303 });
	});
});

describe("metadata.data reaches load() on every path", () => {
	test("client navigation (data endpoint)", async () => {
		const body = await (await fetch(dataUrl("/slow/inner", fresh()))).json();
		expect(body.pageData.fromMeta).toBe("meta");
		expect(body.metadata).toMatchObject({ title: "Lambat" });
		expect(body.metadata.data).toBeUndefined();
	});
});
