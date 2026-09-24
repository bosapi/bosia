import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import { join } from "path";

import { BOSIA_NODE_PATH } from "../src/core/paths.ts";

// `bosia build --target=workers`, end to end: the real build.ts on a tiny app.
// workerd isn't available in tests, so the worker is imported into Bun and
// driven through its fetch(request, env) export — enough to prove the bundle
// boots without a filesystem path and that bindings reach loaders.

let tmpDir: string;

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
	writeFileSync(join(routes, "+page.svelte"), `<h1>Beranda</h1>\n`);
	// Big enough to be stored compressed, so a repeat request is a compressed cache hit.
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

	test("the worker serves pages, runs hooks, and hands bindings to loaders", async () => {
		const worker = (await import(join(tmpDir, "dist", "worker", "index.js"))).default;
		const env = { GREETING: "halo Jeki" };

		const res = await worker.fetch(new Request("http://x/hello"), env);
		expect(res.status).toBe(200);
		expect(res.headers.get("x-hooked")).toBe("yes");
		expect(await res.text()).toContain("halo Jeki");

		const missing = await worker.fetch(new Request("http://x/nope"), env);
		expect(missing.status).toBe(404);
	});

	// Workers compresses a body sent with Content-Encoding again unless the
	// Response says encodeBody: "manual". handleRequest rebuilds every response,
	// which once dropped the flag and shipped brotli-inside-gzip. Bun ignores the
	// key, so check the flag on the Response the worker builds last.
	test("compressed responses keep encodeBody: manual through handleRequest", async () => {
		const worker = (await import(join(tmpDir, "dist", "worker", "index.js"))).default;
		const req = () => new Request("http://x/big", { headers: { "Accept-Encoding": "gzip" } });
		await worker.fetch(req(), {});

		const inits: ResponseInit[] = [];
		const Real = globalThis.Response;
		globalThis.Response = class extends Real {
			constructor(body?: BodyInit | null, init?: ResponseInit) {
				super(body, init);
				if (init) inits.push(init);
			}
		} as typeof Response;
		let res: Response;
		try {
			res = await worker.fetch(req(), {});
		} finally {
			globalThis.Response = Real;
		}
		expect(res.headers.get("x-bosia-cache")).toBe("HIT");
		expect(res.headers.get("content-encoding")).toBe("gzip");
		expect((inits.at(-1) as { encodeBody?: string }).encodeBody).toBe("manual");
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
