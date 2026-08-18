import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from "fs";
import { join } from "path";

import { getEphemeralPort } from "../src/core/prerender.ts";
import { BOSIA_NODE_PATH } from "../src/core/paths.ts";

// The only test that boots a real built server under a BASE_PATH. Everything
// else covers the pure helpers, and two 🔴 bugs (the trailing-slash 308 emitting
// an app-space Location, prerendering silently producing nothing) walked
// straight through that gap.
//
// Fixture lives under packages/bosia/ so svelte and the Tailwind binary resolve
// from this package's node_modules — same reason as svelte-build.test.ts.

const BASE = "/sso";
let tmpDir: string;
let child: Bun.Subprocess | null = null;
let origin: string;

function page(body: string): string {
	return `<h1>${body}</h1>\n`;
}

beforeAll(async () => {
	tmpDir = join(import.meta.dir, "..", `.tmp-basepath-server-${Date.now()}`);
	const routes = join(tmpDir, "src", "routes");
	mkdirSync(routes, { recursive: true });

	writeFileSync(join(tmpDir, "tsconfig.json"), JSON.stringify({ compilerOptions: { paths: {} } }));
	writeFileSync(join(tmpDir, "src", "app.css"), `@import "tailwindcss";\n@source "../src";\n`);
	writeFileSync(
		join(tmpDir, "src", "app.html"),
		`<!doctype html>\n<html lang="%bosia.lang%">\n<head>%bosia.head%</head>\n<body>%bosia.body%</body>\n</html>\n`,
	);

	writeFileSync(join(routes, "+page.svelte"), page("Beranda"));

	// Prerendered: the build has to reach it through the mount to write it.
	mkdirSync(join(routes, "about"), { recursive: true });
	writeFileSync(join(routes, "about", "+page.svelte"), page("Tentang"));
	writeFileSync(join(routes, "about", "+page.server.ts"), `export const prerender = true;\n`);

	// redirect() over the wire — its Location must come back prefixed.
	mkdirSync(join(routes, "masuk"), { recursive: true });
	writeFileSync(join(routes, "masuk", "+page.svelte"), page("Masuk"));
	writeFileSync(
		join(routes, "masuk", "+page.server.ts"),
		`import { redirect } from "bosia";\nexport function load() {\n\tredirect(303, "/daftar");\n}\n`,
	);

	mkdirSync(join(routes, "daftar"), { recursive: true });
	writeFileSync(join(routes, "daftar", "+page.svelte"), page("Daftar"));

	const build = Bun.spawn(["bun", "run", join(import.meta.dir, "..", "src", "core", "build.ts")], {
		cwd: tmpDir,
		env: {
			...process.env,
			NODE_ENV: "production",
			BASE_PATH: BASE,
			NODE_PATH: BOSIA_NODE_PATH,
		},
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
			BASE_PATH: BASE,
			PORT: String(port),
			NODE_PATH: BOSIA_NODE_PATH,
		},
		stdout: "ignore",
		stderr: "ignore",
	});

	const deadline = Date.now() + 15_000;
	while (Date.now() < deadline) {
		try {
			if ((await fetch(`${origin}${BASE}/_health`)).ok) return;
		} catch {
			/* not up yet */
		}
		await Bun.sleep(50);
	}
	throw new Error("server under BASE_PATH never became ready");
}, 180_000);

afterAll(() => {
	child?.kill();
	rmSync(tmpDir, { recursive: true, force: true });
});

describe("a built server mounted under BASE_PATH", () => {
	test("404s the origin root — off-mount was never ours", async () => {
		expect((await fetch(`${origin}/`)).status).toBe(404);
	});

	test("serves the mount root with the base handed to the client", async () => {
		const res = await fetch(`${origin}${BASE}`);
		expect(res.status).toBe(200);
		const html = await res.text();
		expect(html).toContain(`window.__BOSIA_BASE__="${BASE}"`);
		expect(html).toContain(`${BASE}/dist/client/`);
	});

	test("trailing-slash 308 sends the browser back inside the mount", async () => {
		const res = await fetch(`${origin}${BASE}/daftar/`, { redirect: "manual" });
		expect(res.status).toBe(308);
		expect(res.headers.get("location")).toBe(`${BASE}/daftar`);
	});

	test("redirect() rebases its Location over the wire", async () => {
		const res = await fetch(`${origin}${BASE}/masuk`, { redirect: "manual" });
		expect(res.status).toBe(303);
		expect(res.headers.get("location")).toBe(`${BASE}/daftar`);
	});

	test("prerendering ran under the mount", () => {
		expect(existsSync(join(tmpDir, "dist", "prerendered", "about.html"))).toBe(true);
	});

	test("the build stamps the base it was built for", () => {
		const manifest = JSON.parse(readFileSync(join(tmpDir, "dist", "manifest.json"), "utf-8"));
		expect(manifest.basePath).toBe(BASE);
	});
});
