import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { mkdirSync, writeFileSync, rmSync } from "fs";
import { join } from "path";

import { getEphemeralPort } from "../src/core/prerender.ts";
import { BOSIA_NODE_PATH } from "../src/core/paths.ts";

// `event.route.id` is the folder path with groups kept, so a hook can guard a
// whole `(private)` group without a list of URL prefixes. The guard below is
// the one the security guide teaches. It must stop a signed-out visitor on
// every way into a page — document load, client navigation, form POST — before
// `metadata()` or any loader runs.

let tmpDir: string;
let child: Bun.Subprocess | null = null;
let origin: string;

const PRIVATE_ID = "/(private)/dashboard/[id]";
const metadataRuns = async () => (await (await fetch(`${origin}/api/count`)).json()).metadata;

beforeAll(async () => {
	tmpDir = join(import.meta.dir, "..", `.tmp-route-id-${Date.now()}`);
	const routes = join(tmpDir, "src", "routes");
	mkdirSync(routes, { recursive: true });

	writeFileSync(join(tmpDir, "tsconfig.json"), JSON.stringify({ compilerOptions: { paths: {} } }));
	writeFileSync(join(tmpDir, "src", "app.css"), `@import "tailwindcss";\n@source "../src";\n`);
	writeFileSync(
		join(tmpDir, "src", "app.html"),
		`<!doctype html>\n<html lang="%bosia.lang%">\n<head>%bosia.head%</head>\n<body>%bosia.body%</body>\n</html>\n`,
	);

	writeFileSync(join(routes, "+page.svelte"), `<h1>Beranda</h1>\n`);
	mkdirSync(join(routes, "login"), { recursive: true });
	writeFileSync(join(routes, "login", "+page.svelte"), `<h1>Masuk</h1>\n`);

	// Counts metadata() calls in the server process; read back via /api/count.
	mkdirSync(join(tmpDir, "src", "lib"), { recursive: true });
	writeFileSync(join(tmpDir, "src", "lib", "counter.ts"), `export const runs = { metadata: 0 };\n`);

	const dash = join(routes, "(private)", "dashboard", "[id]");
	mkdirSync(dash, { recursive: true });
	writeFileSync(
		join(dash, "+page.svelte"),
		`<script>let { data } = $props();</script>\n<h1 data-route={data.routeId}>{data.secret}</h1>\n`,
	);
	writeFileSync(
		join(dash, "+page.server.ts"),
		`import { runs } from "$lib/counter";\n\n` +
			`export function metadata({ route }) {\n` +
			`\truns.metadata++;\n` +
			`\treturn { title: "meta:" + route.id };\n` +
			`}\n\n` +
			`export function load({ route }) {\n` +
			`\treturn { secret: "leaked", routeId: route.id };\n` +
			`}\n\n` +
			`export const actions = {\n` +
			`\tdefault: () => ({ saved: "leaked" }),\n` +
			`};\n`,
	);

	// The old pattern: a layout guard. Hooks are the rule; this pins why.
	const legacy = join(routes, "(legacy)");
	mkdirSync(join(legacy, "old"), { recursive: true });
	writeFileSync(
		join(legacy, "+layout.server.ts"),
		`import { redirect } from "bosia";\n\n` +
			`export function load({ locals }) {\n` +
			`\tif (!locals.user) throw redirect(303, "/login");\n` +
			`}\n`,
	);
	writeFileSync(join(legacy, "old", "+page.svelte"), `<h1>Lama</h1>\n`);
	writeFileSync(
		join(legacy, "old", "+page.server.ts"),
		`import { runs } from "$lib/counter";\n\n` +
			`export function metadata() {\n` +
			`\truns.metadata++;\n` +
			`\treturn { title: "lama" };\n` +
			`}\n`,
	);

	const count = join(routes, "api", "(stats)", "count");
	mkdirSync(count, { recursive: true });
	writeFileSync(
		join(count, "+server.ts"),
		`import { runs } from "$lib/counter";\n\n` +
			`export const cache = false;\n` +
			`export function GET({ route }) {\n` +
			`\treturn Response.json({ ...runs, id: route.id });\n` +
			`}\n`,
	);

	writeFileSync(
		join(tmpDir, "src", "hooks.server.ts"),
		`import { redirect, type Handle } from "bosia";\n\n` +
			`export const handle: Handle = async ({ event, resolve }) => {\n` +
			`\tif (event.request.headers.get("x-mode") === "echo") {\n` +
			`\t\treturn new Response("echo", { headers: { "x-route-id": String(event.route.id) } });\n` +
			`\t}\n` +
			`\tevent.locals.user = event.request.headers.get("x-user");\n` +
			`\tif (event.route.id?.startsWith("/(private)") && !event.locals.user) {\n` +
			`\t\tthrow redirect(303, "/login");\n` +
			`\t}\n` +
			`\treturn resolve(event);\n` +
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

describe("a hook guard keyed on route.id", () => {
	test("redirects a document load before metadata() runs", async () => {
		const before = await metadataRuns();
		const res = await fetch(`${origin}/dashboard/7`, { redirect: "manual" });
		expect(res.status).toBe(303);
		expect(res.headers.get("location")).toBe("/login");
		expect(await metadataRuns()).toBe(before);
	});

	test("redirects a client navigation without sending loader data", async () => {
		const before = await metadataRuns();
		const res = await fetch(`${origin}/__bosia/data/dashboard/7.json`);
		const body = await res.text();
		expect(body).not.toContain("leaked");
		expect(JSON.parse(body)).toMatchObject({ redirect: "/login", status: 303 });
		expect(await metadataRuns()).toBe(before);
	});

	test("redirects a form POST before the action runs", async () => {
		const res = await fetch(`${origin}/dashboard/7`, {
			method: "POST",
			redirect: "manual",
			headers: { origin, "content-type": "application/x-www-form-urlencoded" },
			body: "a=1",
		});
		expect(res.status).toBe(303);
		expect(res.headers.get("location")).toBe("/login");
		expect(await res.text()).not.toContain("leaked");
	});

	test("lets a signed-in visitor through", async () => {
		const res = await fetch(`${origin}/dashboard/7`, { headers: { "x-user": "u1" } });
		expect(res.status).toBe(200);
		expect(await res.text()).toContain("leaked");
	});
});

// Guarding in hooks is the rule. metadata() starts alongside the layout loaders,
// so a layout redirect still sends the visitor away but cannot stop metadata()
// from running first. If this ever fails, the docs' "never gate in a layout"
// note can be revisited.
describe("a layout guard (not the rule)", () => {
	test("redirects, but metadata() has already run", async () => {
		const before = await metadataRuns();
		const res = await fetch(`${origin}/old`, { redirect: "manual" });
		expect(res.status).toBe(303);
		expect(res.headers.get("location")).toBe("/login");
		expect(await metadataRuns()).toBe(before + 1);
	});
});

describe("route.id", () => {
	test("hooks see the page's id, groups kept", async () => {
		const res = await fetch(`${origin}/dashboard/7`, { headers: { "x-mode": "echo" } });
		expect(res.headers.get("x-route-id")).toBe(PRIVATE_ID);
	});

	test("hooks see the target page's id on a client navigation", async () => {
		const res = await fetch(`${origin}/__bosia/data/dashboard/7.json`, {
			headers: { "x-mode": "echo" },
		});
		expect(res.headers.get("x-route-id")).toBe(PRIVATE_ID);
	});

	test("is null when nothing matches", async () => {
		const res = await fetch(`${origin}/nowhere`, { headers: { "x-mode": "echo" } });
		expect(res.headers.get("x-route-id")).toBe("null");
	});

	test("reaches load() and metadata()", async () => {
		const html = await (
			await fetch(`${origin}/dashboard/7`, { headers: { "x-user": "u1" } })
		).text();
		expect(html).toContain(`data-route="${PRIVATE_ID}"`);
		expect(html).toContain(`<title>meta:${PRIVATE_ID}</title>`);
	});

	test("reaches an API handler", async () => {
		const res = await fetch(`${origin}/api/count`);
		expect((await res.json()).id).toBe("/api/(stats)/count");
	});
});
