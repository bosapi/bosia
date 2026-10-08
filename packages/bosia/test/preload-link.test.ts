import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { mkdirSync, writeFileSync, rmSync, readFileSync } from "fs";
import { join } from "path";

import { getEphemeralPort } from "../src/core/prerender.ts";
import { BOSIA_NODE_PATH } from "../src/core/paths.ts";

// The `Link` header lets a CDN that sends 103 Early Hints start the stylesheet
// and script downloads while the page's loaders still run. It only exists in
// a production build, so this boots one.
//
// Fixture lives under packages/bosia/ so svelte and the Tailwind binary resolve
// from this package's node_modules — same reason as basePath-server.test.ts.

let tmpDir: string;
let child: Bun.Subprocess | null = null;
let origin: string;
let manifest: { entry: string; tw: string; preload: Record<string, string[]> };

beforeAll(async () => {
	tmpDir = join(import.meta.dir, "..", `.tmp-preload-link-${Date.now()}`);
	const routes = join(tmpDir, "src", "routes");
	mkdirSync(routes, { recursive: true });

	writeFileSync(join(tmpDir, "tsconfig.json"), JSON.stringify({ compilerOptions: { paths: {} } }));
	writeFileSync(join(tmpDir, "src", "app.css"), `@import "tailwindcss";\n@source "../src";\n`);
	writeFileSync(
		join(tmpDir, "src", "app.html"),
		`<!doctype html>\n<html lang="%bosia.lang%">\n<head>%bosia.head%</head>\n<body>%bosia.body%</body>\n</html>\n`,
	);
	writeFileSync(join(routes, "+page.svelte"), `<h1 class="text-xl">Beranda</h1>\n`);

	mkdirSync(join(routes, "statis"), { recursive: true });
	writeFileSync(join(routes, "statis", "+page.svelte"), `<p>Statis</p>\n`);
	writeFileSync(join(routes, "statis", "+page.server.ts"), `export const csr = false;\n`);

	mkdirSync(join(routes, "tajuk"), { recursive: true });
	writeFileSync(join(routes, "tajuk", "+page.svelte"), `<p>Tajuk</p>\n`);
	writeFileSync(
		join(routes, "tajuk", "+page.server.ts"),
		`export function load({ setHeaders }: any) {\n` +
			`\tsetHeaders({ link: "</font.woff2>; rel=preload; as=font" });\n` +
			`\treturn {};\n}\n`,
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
	manifest = JSON.parse(readFileSync(join(tmpDir, "dist", "manifest.json"), "utf-8"));

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

describe("Link preload header on SSR pages", () => {
	test("names the stylesheet, the client entry and the route's chunks", async () => {
		const link = (await fetch(`${origin}/`)).headers.get("link")!;
		expect(link).toContain(`</dist/client/${manifest.tw}>; rel=preload; as=style`);
		expect(link).toContain(`</dist/client/${manifest.entry}>; rel=modulepreload`);
		for (const chunk of manifest.preload["/"] ?? []) {
			expect(link).toContain(`</dist/client/${chunk}>; rel=modulepreload`);
		}
	});

	test("a cache hit carries the same header", async () => {
		const first = (await fetch(`${origin}/`)).headers.get("link");
		await Bun.sleep(30);
		const hit = await fetch(`${origin}/`);
		expect(hit.headers.get("x-bosia-cache")).toBe("HIT");
		expect(hit.headers.get("link")).toBe(first);
	});

	test("a page that doesn't hydrate gets stylesheets only", async () => {
		const link = (await fetch(`${origin}/statis`)).headers.get("link")!;
		expect(link).toContain("rel=preload; as=style");
		expect(link).not.toContain("modulepreload");
	});

	test("a Link a loader set is kept, ahead of the framework's", async () => {
		const link = (await fetch(`${origin}/tajuk`)).headers.get("link")!;
		expect(link.startsWith("</font.woff2>; rel=preload; as=font, ")).toBe(true);
		expect(link).toContain("rel=modulepreload");
	});
});
