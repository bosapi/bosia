import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import { join } from "path";

import { BOSIA_NODE_PATH } from "../src/core/paths.ts";

// `bosia build --target=workers`, end to end: the real build.ts on a tiny app.
// workerd isn't available in tests, so the worker is imported into Bun and
// driven through its fetch(request, env) export — enough to prove the bundle
// boots without a filesystem path and that bindings reach loaders.

let tmpDir: string;
// Bindings are captured once per isolate, so every request passes the same env.
const env = { GREETING: "halo Jeki" };

async function build(env: Record<string, string> = {}) {
	const proc = Bun.spawn(["bun", "run", join(import.meta.dir, "..", "src", "core", "build.ts")], {
		cwd: tmpDir,
		env: { ...process.env, NODE_ENV: "production", NODE_PATH: BOSIA_NODE_PATH, ...env },
		stdout: "pipe",
		stderr: "pipe",
	});
	const [code, out, err] = await Promise.all([
		proc.exited,
		new Response(proc.stdout).text(),
		new Response(proc.stderr).text(),
	]);
	if (code !== 0) throw new Error(`build failed (${code})\n${out}\n${err}`);
}

beforeAll(async () => {
	tmpDir = join(import.meta.dir, "..", `.tmp-workers-build-${Date.now()}`);
	const routes = join(tmpDir, "src", "routes");
	mkdirSync(join(routes, "hello"), { recursive: true });

	writeFileSync(join(tmpDir, "package.json"), JSON.stringify({ name: "@acme/My_App" }));
	writeFileSync(join(tmpDir, "tsconfig.json"), JSON.stringify({ compilerOptions: { paths: {} } }));
	writeFileSync(join(tmpDir, "src", "app.css"), `@import "tailwindcss";\n@source "../src";\n`);
	writeFileSync(
		join(tmpDir, "src", "app.html"),
		`<!doctype html>\n<html lang="%bosia.lang%">\n<head>%bosia.head%</head>\n<body>%bosia.body%</body>\n</html>\n`,
	);
	// Each counts its runs on globalThis, so the test can see what the worker's
	// startup warm-up render ran.
	writeFileSync(
		join(routes, "+page.svelte"),
		`<script>globalThis.__renders = (globalThis.__renders ?? 0) + 1;</script>\n<h1>Beranda</h1>\n`,
	);
	writeFileSync(
		join(routes, "+page.server.ts"),
		`export function load() {\n\tglobalThis.__loads = (globalThis.__loads ?? 0) + 1;\n\treturn {};\n}\n`,
	);
	// Above the 2KB compression threshold, so a plain body proves the worker skipped it.
	mkdirSync(join(routes, "big"), { recursive: true });
	writeFileSync(
		join(routes, "big", "+page.svelte"),
		`<p>${"Bosia di Workers. ".repeat(400)}</p>\n`,
	);
	writeFileSync(
		join(routes, "hello", "+page.server.ts"),
		`export function load({ platform }) {\n\treturn { greeting: platform?.env?.GREETING ?? "none" };\n}\n`,
	);
	writeFileSync(
		join(routes, "hello", "+page.svelte"),
		`<script>let { data } = $props();</script>\n<p id="g">{data.greeting}</p>\n`,
	);
	writeFileSync(
		join(tmpDir, "src", "hooks.server.ts"),
		`export const handle = async ({ event, resolve }) => {\n` +
			`\tglobalThis.__hooks = (globalThis.__hooks ?? 0) + 1;\n` +
			`\tconst res = await resolve(event);\n` +
			`\tres.headers.set("x-hooked", "yes");\n` +
			`\treturn res;\n};\n`,
	);
	writeFileSync(join(tmpDir, "bosia.config.ts"), `export default { target: "workers" };\n`);

	await build();
}, 180_000);

afterAll(() => {
	rmSync(tmpDir, { recursive: true, force: true });
});

describe("workers target build", () => {
	test("emits the worker bundle and stamps the target", () => {
		expect(existsSync(join(tmpDir, "dist", "worker", "index.js"))).toBe(true);
		// The Bun bundle still exists — prerender needs it.
		expect(existsSync(join(tmpDir, "dist", "server", "index.js"))).toBe(true);
		const manifest = JSON.parse(readFileSync(join(tmpDir, "dist", "manifest.json"), "utf-8"));
		expect(manifest.target).toBe("workers");
	});

	test("client files have no `+` in their names", () => {
		const names = readdirSync(join(tmpDir, "dist", "client"));
		expect(names.length).toBeGreaterThan(0);
		expect(names.filter((n) => n.includes("+"))).toEqual([]);
	});

	test("writes wrangler.jsonc once, from package.json's name", () => {
		const text = readFileSync(join(tmpDir, "wrangler.jsonc"), "utf-8");
		const config = JSON.parse(text.replace(/^\/\/.*\n/, ""));
		expect(config.name).toBe("my-app");
		expect(config.main).toBe("./dist/worker/index.js");
		expect(config.assets.directory).toBe("./dist/static");
		expect(config.compatibility_flags).toContain("nodejs_compat");
	});

	// Importing the worker runs its startup warm-up: `/` renders once, with no
	// user hooks or loaders (no bindings yet) and nothing stored in the cache.
	test("startup warm-up renders / without hooks, loaders or caching", async () => {
		const g = globalThis as Record<string, unknown>;
		const worker = (await import(join(tmpDir, "dist", "worker", "index.js"))).default;
		expect([g.__renders, g.__hooks, g.__loads]).toEqual([1, undefined, undefined]);

		const res = await worker.fetch(new Request("http://x/"), env);
		expect(res.headers.get("x-bosia-cache")).toBeNull();
		expect([g.__renders, g.__hooks, g.__loads]).toEqual([2, 1, 1]);
	});

	test("the worker serves pages, runs hooks, and hands bindings to loaders", async () => {
		const worker = (await import(join(tmpDir, "dist", "worker", "index.js"))).default;

		const res = await worker.fetch(new Request("http://x/hello"), env);
		expect(res.status).toBe(200);
		expect(res.headers.get("x-hooked")).toBe("yes");
		expect(await res.text()).toContain("halo Jeki");

		const missing = await worker.fetch(new Request("http://x/nope"), env);
		expect(missing.status).toBe(404);
	});

	// Cloudflare's edge compresses responses outside the worker's CPU budget, so
	// the worker sends plain bytes on a miss and stores no compressed copies.
	test("the worker leaves compression to Cloudflare", async () => {
		const worker = (await import(join(tmpDir, "dist", "worker", "index.js"))).default;
		const req = () => new Request("http://x/big", { headers: { "Accept-Encoding": "br, gzip" } });
		const miss = await worker.fetch(req(), env);
		expect(miss.headers.get("content-encoding")).toBeNull();
		await miss.text();

		const hit = await worker.fetch(req(), env);
		expect(hit.headers.get("x-bosia-cache")).toBe("HIT");
		expect(hit.headers.get("content-encoding")).toBeNull();
		expect(await hit.text()).toContain("<html");
	});

	test("a user-edited wrangler.jsonc survives a rebuild; --target overrides config", async () => {
		writeFileSync(join(tmpDir, "wrangler.jsonc"), `{ "name": "kept" }\n`);
		await build();
		expect(readFileSync(join(tmpDir, "wrangler.jsonc"), "utf-8")).toBe(`{ "name": "kept" }\n`);

		await build({ BOSIA_TARGET: "bun" });
		const manifest = JSON.parse(readFileSync(join(tmpDir, "dist", "manifest.json"), "utf-8"));
		expect(manifest.target).toBe("bun");
		expect(existsSync(join(tmpDir, "dist", "worker"))).toBe(false);
		expect(existsSync(join(tmpDir, ".bosia", "artifacts.ts"))).toBe(false);
	}, 180_000);
});
